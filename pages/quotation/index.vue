<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Order Management</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Quotation</span></li>
        </ul>

        <!-- Status Tabs -->
        <div class="mb-5 overflow-x-auto">
            <ul class="flex flex-nowrap border-b border-white-light dark:border-[#191e3a] min-w-max">
                <li v-for="tab in statusTabs" :key="tab.key">
                    <button
                        class="flex items-center gap-2 border border-transparent px-4 py-2.5 -mb-[1px] font-semibold transition-colors"
                        :class="activeTab === tab.key
                            ? 'text-primary !border-white-light !border-b-white dark:!border-[#191e3a] dark:!border-b-black'
                            : 'text-gray-500 hover:text-primary dark:text-gray-400'"
                        @click="activeTab = tab.key"
                    >
                        <span>{{ tab.label }}</span>
                        <span
                            class="rounded-full px-1.5 py-0.5 text-xs font-normal"
                            :class="activeTab === tab.key ? 'bg-primary text-white' : 'bg-white-light dark:bg-[#1b2e4b] text-gray-500 dark:text-gray-400'"
                        >
                            {{ tabCount(tab.key) }}
                        </span>
                    </button>
                </li>
            </ul>
        </div>

        <!-- Filter + Action bar -->
        <div class="panel mb-5">
            <div class="flex flex-wrap items-end gap-3">
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">ค้นหา</label>
                    <input v-model="search" type="text" class="form-input w-52" placeholder="เลขที่ QUO, ลูกค้า..." />
                </div>
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">วันที่เริ่ม</label>
                    <input v-model="dateFrom" type="date" class="form-input w-36" />
                </div>
                <div>
                    <label class="text-xs text-gray-500 mb-1 block">วันที่สิ้นสุด</label>
                    <input v-model="dateTo" type="date" class="form-input w-36" />
                </div>
                <button class="btn btn-outline-secondary btn-sm self-end" @click="clearFilters">ล้างตัวกรอง</button>
                <div class="ltr:ml-auto rtl:mr-auto self-end">
                    <NuxtLink to="/quotation/create" class="btn btn-primary whitespace-nowrap">
                        + สร้างใบเสนอราคา
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Table -->
        <div class="panel">
            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-36">เลขที่ QUO</th>
                            <th class="w-28">วันที่สร้าง</th>
                            <th class="w-28">หมดอายุ</th>
                            <th>ลูกค้า</th>
                            <th class="w-16 !text-center">SKUs</th>
                            <th class="w-36 !text-right">ยอดรวม (รวม VAT)</th>
                            <th class="w-32 !text-center">สถานะ</th>
                            <th class="w-48 !text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="filtered.length === 0">
                            <td colspan="8" class="py-8 text-center text-gray-400">ไม่พบรายการ</td>
                        </tr>
                        <tr v-for="q in filtered" :key="q.id">
                            <td>
                                <NuxtLink :to="`/quotation/${q.id}`" class="font-semibold text-primary hover:underline">
                                    {{ q.quotationNo }}
                                </NuxtLink>
                                <div v-if="isExpired(q) && q.status !== 'converted' && q.status !== 'rejected'" class="text-xs text-danger mt-0.5">
                                    ⚠️ หมดอายุ
                                </div>
                            </td>
                            <td class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(q.createdAt) }}</td>
                            <td class="text-sm" :class="isExpired(q) && q.status === 'draft' || isExpired(q) && q.status === 'sent' ? 'text-danger font-semibold' : 'text-gray-500 dark:text-gray-400'">
                                {{ formatDate(q.validUntil) }}
                            </td>
                            <td>
                                <div class="font-medium dark:text-white-dark">{{ q.soldToName }}</div>
                                <div class="text-xs text-gray-400 font-mono">{{ q.customerType === 'new' ? 'ลูกค้าใหม่' : q.soldToCode }}</div>
                            </td>
                            <td class="!text-center text-sm text-gray-600 dark:text-gray-300">{{ q.items.length }}</td>
                            <td class="!text-right font-semibold text-primary">
                                {{ q.totalInVat.toLocaleString('th-TH') }} ฿
                            </td>
                            <td class="!text-center">
                                <span class="badge" :class="statusBadge(q.status)">{{ statusLabel(q.status) }}</span>
                                <div v-if="q.convertedOrderNo" class="text-xs text-gray-400 mt-0.5 font-mono">{{ q.convertedOrderNo }}</div>
                            </td>
                            <td class="!text-center">
                                <div class="flex flex-wrap justify-center gap-1">
                                    <NuxtLink
                                        :to="`/quotation/${q.id}`"
                                        class="btn btn-sm btn-outline-primary px-2 py-1 text-xs"
                                    >
                                        👁 ดู
                                    </NuxtLink>
                                    <NuxtLink
                                        v-if="q.status === 'draft'"
                                        :to="`/quotation/${q.id}`"
                                        class="btn btn-sm btn-outline-warning px-2 py-1 text-xs"
                                    >
                                        ✏️ แก้ไข
                                    </NuxtLink>
                                    <button
                                        class="btn btn-sm btn-outline-info px-2 py-1 text-xs"
                                        @click="doPrint(q)"
                                    >
                                        🖨️
                                    </button>
                                    <button
                                        v-if="q.status === 'draft'"
                                        class="btn btn-sm btn-outline-danger px-2 py-1 text-xs"
                                        @click="confirmDelete(q)"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-3 text-right text-xs text-gray-400">
                แสดง {{ filtered.length }} จาก {{ quotations.length }} รายการ
            </div>
        </div>

        <!-- Delete confirm modal -->
        <div v-if="deleteTarget" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl dark:bg-[#0e1726]">
                <h3 class="text-lg font-bold mb-2 dark:text-white">ลบใบเสนอราคา</h3>
                <p class="text-sm text-gray-500 mb-4">
                    ลบ <strong>{{ deleteTarget.quotationNo }}</strong> ? ไม่สามารถกู้คืนได้
                </p>
                <div class="flex gap-2 justify-end">
                    <button class="btn btn-outline-secondary btn-sm" @click="deleteTarget = null">ยกเลิก</button>
                    <button class="btn btn-danger btn-sm" @click="doDelete">ลบ</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrQuotation, type Quotation } from '~/composables/useOrQuotation';

useHead({ title: 'Quotation' });
const { quotations, deleteQuotation } = useOrQuotation();

// ── Tabs ────────────────────────────────────────────────────────────────────────
const statusTabs = [
    { key: 'all',       label: 'ทั้งหมด' },
    { key: 'draft',     label: 'Draft'    },
    { key: 'sent',      label: 'Sent'     },
    { key: 'accepted',  label: 'Accepted' },
    { key: 'rejected',  label: 'Rejected' },
    { key: 'converted', label: 'Converted'},
];
const activeTab = ref('all');
const tabCount  = (key: string) => key === 'all'
    ? quotations.value.length
    : quotations.value.filter(q => q.status === key).length;

// ── Filters ────────────────────────────────────────────────────────────────────
const search   = ref('');
const dateFrom = ref('');
const dateTo   = ref('');
const clearFilters = () => { search.value = ''; dateFrom.value = ''; dateTo.value = ''; };

const filtered = computed(() =>
    quotations.value
        .filter(q => {
            if (activeTab.value !== 'all' && q.status !== activeTab.value) return false;
            if (search.value) {
                const s = search.value.toLowerCase();
                if (!q.quotationNo.toLowerCase().includes(s) && !q.soldToName.toLowerCase().includes(s)) return false;
            }
            if (dateFrom.value && q.createdAt.slice(0, 10) < dateFrom.value) return false;
            if (dateTo.value  && q.createdAt.slice(0, 10) > dateTo.value)   return false;
            return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
);

// ── Helpers ────────────────────────────────────────────────────────────────────
const isExpired = (q: Quotation) => q.validUntil && new Date(q.validUntil) < new Date();

const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusLabel = (s: string) => ({
    draft: 'Draft', sent: 'Sent', accepted: 'Accepted',
    rejected: 'Rejected', converted: 'Converted',
}[s] ?? s);

const statusBadge = (s: string) => ({
    draft: 'badge-outline-secondary',
    sent: 'badge-outline-primary',
    accepted: 'badge-outline-success',
    rejected: 'badge-outline-danger',
    converted: 'badge-outline-info',
}[s] ?? 'badge-outline-secondary');

// ── Delete ─────────────────────────────────────────────────────────────────────
const deleteTarget = ref<Quotation | null>(null);
const confirmDelete = (q: Quotation) => { deleteTarget.value = q; };
const doDelete = () => {
    if (deleteTarget.value) {
        deleteQuotation(deleteTarget.value.id);
        deleteTarget.value = null;
    }
};

// ── Quick print from list ──────────────────────────────────────────────────────
const doPrint = (q: Quotation) => {
    const fmtNum = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const html = `<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8"/><title>${q.quotationNo}</title>
<style>body{margin:0;font-family:sans-serif;}@media print{body{background:#fff;}}.doc{max-width:800px;margin:24px auto;padding:40px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);}table{width:100%;border-collapse:collapse;font-size:13px;}th{background:#1b2e4b;color:#fff;padding:10px 12px;text-align:left;}td{padding:8px 12px;border-bottom:1px solid #e5e7eb;}</style></head>
<body><div class="doc">
<div style="display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1b2e4b;">
<div><div style="font-size:22px;font-weight:bold;color:#1b2e4b;">OR Company Ltd.</div><div style="font-size:11px;color:#9ca3af;">123 Business Park, Bangkok 10110</div></div>
<div style="text-align:right;"><div style="font-size:24px;font-weight:bold;color:#4361ee;">ใบเสนอราคา</div><div style="font-size:12px;color:#9ca3af;">SALES QUOTATION</div>
<div style="margin-top:8px;font-size:13px;"><strong>เลขที่:</strong> ${q.quotationNo}</div>
<div style="font-size:13px;"><strong>วันที่:</strong> ${formatDate(q.createdAt)}</div>
<div style="font-size:13px;"><strong>หมดอายุ:</strong> ${formatDate(q.validUntil)}</div></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;"><div style="font-size:11px;font-weight:bold;color:#6b7280;margin-bottom:8px;">SOLD-TO</div><div style="font-weight:600;">${q.soldToName}</div><div style="font-size:11px;color:#9ca3af;">${q.soldToCode || ''}</div></div>
<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;"><div style="font-size:11px;font-weight:bold;color:#6b7280;margin-bottom:8px;">SHIP-TO</div><div style="font-weight:600;">${q.shipToName}</div><div style="font-size:11px;color:#9ca3af;">${q.shipToCode || ''}</div>${q.deliveryContact.name ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">ผู้ติดต่อ: ${q.deliveryContact.name}</div>` : ''}</div></div>
<table><thead><tr><th style="width:32px;">#</th><th style="width:90px;">รหัส</th><th>ชื่อสินค้า</th><th style="text-align:center;width:60px;">จำนวน</th><th style="text-align:right;width:120px;">ราคา/หน่วย</th><th style="text-align:right;width:120px;">รวม</th></tr></thead>
<tbody>${q.items.map((item, i) => `<tr style="background:${i % 2 ? '#f9fafb' : '#fff'}"><td style="color:#9ca3af;">${i + 1}</td><td style="font-family:monospace;font-size:11px;color:#6b7280;">${item.productId}</td><td style="font-weight:500;">${item.productNameEn}</td><td style="text-align:center;">${item.qty.toLocaleString('th-TH')}</td><td style="text-align:right;">${fmtNum(item.priceInVat)}</td><td style="text-align:right;font-weight:600;">${fmtNum(item.subtotalInVat)}</td></tr>`).join('')}</tbody></table>
<div style="display:flex;justify-content:flex-end;margin:16px 0;"><div style="width:280px;font-size:13px;">
<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">ก่อนภาษี</span><span>${fmtNum(q.totalExVat)}</span></div>
<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">VAT 7%</span><span>${fmtNum(q.vatAmount)}</span></div>
<div style="display:flex;justify-content:space-between;border-top:2px solid #e5e7eb;padding-top:8px;font-weight:bold;font-size:15px;"><span>รวมสุทธิ</span><span style="color:#4361ee;">${fmtNum(q.totalInVat)} ฿</span></div>
</div></div>
${q.note ? `<div style="font-size:12px;border-top:1px solid #e5e7eb;padding-top:12px;"><strong>หมายเหตุ:</strong> ${q.note}</div>` : ''}
</div><script>window.onload=()=>{window.print();}<\/script></body></html>`;
    const w = window.open('', '_blank', 'width=920,height=750');
    if (w) { w.document.write(html); w.document.close(); }
};
</script>
