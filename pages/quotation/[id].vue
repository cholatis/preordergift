<template>
    <div v-if="!quotation" class="text-center text-gray-400 py-16">
        ไม่พบใบเสนอราคา — <NuxtLink to="/quotation" class="text-primary">กลับรายการ</NuxtLink>
    </div>

    <div v-else>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><NuxtLink to="/quotation" class="text-primary hover:underline">Quotation</NuxtLink></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>{{ quotation.quotationNo }}</span>
            </li>
        </ul>

        <!-- Header bar -->
        <div class="panel mb-5">
            <div class="flex flex-wrap items-start gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-3">
                        <h4 class="text-xl font-bold dark:text-white">{{ quotation.quotationNo }}</h4>
                        <span class="badge text-sm" :class="statusBadge(quotation.status)">
                            {{ statusLabel(quotation.status) }}
                        </span>
                        <span v-if="isExpired && quotation.status !== 'converted' && quotation.status !== 'rejected'" class="badge badge-outline-danger text-xs">
                            ⚠️ หมดอายุแล้ว
                        </span>
                    </div>
                    <div class="mt-1 flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>สร้าง: {{ formatDate(quotation.createdAt) }}</span>
                        <span :class="isExpired ? 'text-danger font-semibold' : ''">
                            หมดอายุ: {{ formatDate(quotation.validUntil) }}
                        </span>
                    </div>
                    <div v-if="quotation.convertedOrderNo" class="mt-1 text-sm text-success">
                        ✓ แปลงเป็น Order:
                        <NuxtLink :to="`/orders/${quotation.convertedOrderNo}`" class="font-semibold underline">
                            {{ quotation.convertedOrderNo }}
                        </NuxtLink>
                    </div>
                </div>

                <!-- Action buttons -->
                <div class="flex flex-wrap gap-2 shrink-0">
                    <!-- Draft actions -->
                    <template v-if="quotation.status === 'draft'">
                        <button v-if="!isEditing" class="btn btn-outline-warning btn-sm" @click="startEdit">✏️ แก้ไข</button>
                        <button v-if="isEditing"  class="btn btn-primary btn-sm" @click="saveEdit">💾 บันทึก</button>
                        <button v-if="isEditing"  class="btn btn-outline-secondary btn-sm" @click="cancelEdit">ยกเลิก</button>
                        <button v-if="!isEditing" class="btn btn-success btn-sm" @click="confirmAction('send')">📤 ส่งใบเสนอ</button>
                    </template>

                    <!-- Sent actions -->
                    <template v-if="quotation.status === 'sent'">
                        <button class="btn btn-success btn-sm" @click="confirmAction('accept')">✅ ลูกค้ายอมรับ</button>
                        <button class="btn btn-outline-danger btn-sm" @click="confirmAction('reject')">❌ ลูกค้าปฏิเสธ</button>
                    </template>

                    <!-- Accepted actions -->
                    <template v-if="quotation.status === 'accepted'">
                        <button class="btn btn-primary btn-sm" @click="confirmAction('convert')">🔄 แปลงเป็น Order</button>
                    </template>

                    <!-- Export (all statuses) -->
                    <button class="btn btn-outline-primary btn-sm" @click="printQuotation">🖨️ พิมพ์</button>
                    <button class="btn btn-outline-success btn-sm" @click="exportCSV">📥 CSV</button>

                    <!-- Delete (draft only) -->
                    <button v-if="quotation.status === 'draft'" class="btn btn-outline-danger btn-sm" @click="confirmAction('delete')">
                        🗑️ ลบ
                    </button>
                </div>
            </div>

            <!-- Status pipeline -->
            <div class="mt-5 flex items-center gap-0 overflow-x-auto">
                <template v-for="(step, i) in statusPipeline" :key="step.key">
                    <div
                        class="flex flex-col items-center min-w-[80px]"
                        :class="{
                            'opacity-30': step.skip,
                        }"
                    >
                        <div
                            class="h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all"
                            :class="pipelineCircle(step)"
                        >
                            <span v-if="isPast(step)">✓</span>
                            <span v-else>{{ i + 1 }}</span>
                        </div>
                        <div class="mt-1 text-xs text-center whitespace-nowrap" :class="isCurrent(step) ? 'text-primary font-semibold' : 'text-gray-400'">
                            {{ step.label }}
                        </div>
                    </div>
                    <div v-if="i < statusPipeline.length - 1" class="flex-1 h-0.5 min-w-[24px]" :class="isPast(step) ? 'bg-success' : 'bg-gray-200 dark:bg-gray-700'"></div>
                </template>
            </div>
        </div>

        <!-- Main content -->
        <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div class="xl:col-span-2 space-y-6">

                <!-- Customer Info (view or edit) -->
                <div class="panel">
                    <h6 class="text-base font-semibold mb-4 dark:text-white-light">👤 ข้อมูลลูกค้า</h6>

                    <!-- View mode -->
                    <div v-if="!isEditing" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="rounded-lg bg-gray-50 dark:bg-[#1b2e4b]/40 p-3">
                            <div class="text-xs font-bold uppercase text-gray-500 mb-2">Sold-to</div>
                            <div class="font-semibold dark:text-white">{{ quotation.soldToName }}</div>
                            <div v-if="quotation.soldToCode" class="text-xs text-gray-400 font-mono">{{ quotation.soldToCode }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ quotation.customerType === 'new' ? 'ลูกค้าใหม่' : 'ลูกค้าเดิม' }}</div>
                        </div>
                        <div class="rounded-lg bg-gray-50 dark:bg-[#1b2e4b]/40 p-3">
                            <div class="text-xs font-bold uppercase text-gray-500 mb-2">Ship-to</div>
                            <div class="font-semibold dark:text-white">{{ quotation.shipToName }}</div>
                            <div v-if="quotation.shipToCode" class="text-xs text-gray-400 font-mono">{{ quotation.shipToCode }}</div>
                            <div v-if="quotation.deliveryContact.name" class="text-xs text-gray-500 mt-1">
                                ผู้ติดต่อ: {{ quotation.deliveryContact.name }}
                                <span v-if="quotation.deliveryContact.phone"> | {{ quotation.deliveryContact.phone }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Edit mode -->
                    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">ชื่อลูกค้า / Sold-to</label>
                            <input v-model="editForm.soldToName" type="text" class="form-input w-full" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Sold-to Code</label>
                            <input v-model="editForm.soldToCode" type="text" class="form-input w-full font-mono" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Ship-to</label>
                            <input v-model="editForm.shipToName" type="text" class="form-input w-full" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">Ship-to Code</label>
                            <input v-model="editForm.shipToCode" type="text" class="form-input w-full font-mono" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">ผู้ติดต่อ</label>
                            <input v-model="editForm.deliveryContact.name" type="text" class="form-input w-full" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">เบอร์โทร</label>
                            <input v-model="editForm.deliveryContact.phone" type="tel" class="form-input w-full" />
                        </div>
                    </div>
                </div>

                <!-- Items -->
                <div class="panel">
                    <div class="mb-4 flex items-center justify-between">
                        <h6 class="text-base font-semibold dark:text-white-light">📦 รายการสินค้า</h6>
                        <button v-if="isEditing" type="button" class="btn btn-outline-primary btn-sm" @click="addEditItem">
                            + เพิ่มสินค้า
                        </button>
                    </div>

                    <!-- View mode -->
                    <div v-if="!isEditing" class="table-responsive">
                        <table class="table-hover">
                            <thead>
                                <tr style="background-color: #1b2e4b !important; color: white !important;">
                                    <th class="w-8">#</th>
                                    <th class="w-20">รหัส</th>
                                    <th>ชื่อสินค้า</th>
                                    <th class="w-16 !text-center">จำนวน</th>
                                    <th class="w-32 !text-right">ราคา/หน่วย</th>
                                    <th class="w-32 !text-right">รวม</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(item, idx) in quotation.items" :key="item.productId">
                                    <td class="text-gray-400">{{ idx + 1 }}</td>
                                    <td class="font-mono text-xs text-gray-500">{{ item.productId }}</td>
                                    <td class="font-medium dark:text-white-dark">{{ item.productNameEn }}</td>
                                    <td class="!text-center">{{ item.qty.toLocaleString('th-TH') }}</td>
                                    <td class="!text-right text-gray-600 dark:text-gray-300">
                                        {{ item.priceInVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}
                                    </td>
                                    <td class="!text-right font-semibold text-primary">
                                        {{ item.subtotalInVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Edit mode items -->
                    <div v-else>
                        <div
                            v-for="(item, idx) in editForm.items"
                            :key="idx"
                            class="mb-3 rounded-lg border p-3 dark:border-gray-700"
                        >
                            <div class="grid grid-cols-12 gap-2 items-end">
                                <div class="col-span-12 sm:col-span-5">
                                    <label class="block text-xs text-gray-500 mb-1">สินค้า</label>
                                    <select
                                        class="form-select w-full text-sm"
                                        :value="item.productId"
                                        @change="onEditProductChange(idx, ($event.target as HTMLSelectElement).value)"
                                    >
                                        <option value="">-- เลือก --</option>
                                        <option v-for="(prod, pid) in PRODUCT_CATALOG" :key="pid" :value="pid">
                                            {{ pid }} — {{ prod.name }}
                                        </option>
                                    </select>
                                </div>
                                <div class="col-span-4 sm:col-span-2">
                                    <label class="block text-xs text-gray-500 mb-1">จำนวน</label>
                                    <input v-model.number="item.qty" type="number" min="1" class="form-input w-full text-sm" @input="recalcEditItem(idx)" />
                                </div>
                                <div class="col-span-5 sm:col-span-3">
                                    <label class="block text-xs text-gray-500 mb-1">ราคา/หน่วย</label>
                                    <input v-model.number="item.priceInVat" type="number" min="0" step="0.01" class="form-input w-full text-sm" @input="recalcEditItem(idx)" />
                                </div>
                                <div class="col-span-9 sm:col-span-1 text-right">
                                    <label class="block text-xs mb-1 opacity-0">-</label>
                                    <div class="text-sm font-semibold text-primary pt-2">
                                        {{ item.subtotalInVat.toLocaleString('th-TH') }}
                                    </div>
                                </div>
                                <div class="col-span-3 sm:col-span-1 text-right">
                                    <label class="block text-xs mb-1 opacity-0">-</label>
                                    <button type="button" class="btn btn-outline-danger btn-sm px-2" @click="removeEditItem(idx)">✕</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Totals -->
                    <div class="mt-4 border-t pt-3 dark:border-gray-700 text-sm space-y-1">
                        <div class="flex justify-end gap-16">
                            <span class="text-gray-500">ก่อนภาษี</span>
                            <span>{{ (isEditing ? editTotalExVat : quotation.totalExVat).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                        </div>
                        <div class="flex justify-end gap-16">
                            <span class="text-gray-500">VAT 7%</span>
                            <span>{{ (isEditing ? editVatAmount : quotation.vatAmount).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                        </div>
                        <div class="flex justify-end gap-16 font-bold text-base border-t pt-1 dark:border-gray-700">
                            <span>รวมสุทธิ</span>
                            <span class="text-primary">{{ (isEditing ? editTotalInVat : quotation.totalInVat).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Details + History -->
            <div class="space-y-6">

                <!-- Details card -->
                <div class="panel">
                    <h6 class="text-base font-semibold mb-4 dark:text-white-light">📋 รายละเอียด</h6>

                    <div v-if="!isEditing" class="space-y-3 text-sm">
                        <div>
                            <span class="text-gray-500">วันหมดอายุ</span>
                            <div class="font-medium dark:text-white" :class="isExpired ? 'text-danger' : ''">
                                {{ formatDate(quotation.validUntil) }}
                            </div>
                        </div>
                        <div v-if="quotation.note">
                            <span class="text-gray-500">หมายเหตุ</span>
                            <div class="dark:text-white-dark">{{ quotation.note }}</div>
                        </div>
                        <div v-if="quotation.taxInvoice.requested">
                            <span class="text-gray-500">ใบกำกับภาษี</span>
                            <div class="text-blue-600 dark:text-blue-400">
                                ✓ {{ quotation.taxInvoice.companyName }}<br />
                                <span class="font-mono text-xs">{{ quotation.taxInvoice.taxId }}</span>
                            </div>
                        </div>
                        <div v-if="quotation.taxInvoice.requested === false" class="text-gray-400 text-xs">
                            ไม่ต้องการใบกำกับภาษี
                        </div>
                    </div>

                    <div v-else class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">วันหมดอายุ</label>
                            <input v-model="editForm.validUntil" type="date" class="form-input w-full" />
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-1">หมายเหตุ</label>
                            <textarea v-model="editForm.note" class="form-textarea w-full" rows="3"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 mb-2">ใบกำกับภาษี</label>
                            <div class="flex gap-3 mb-2">
                                <label class="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" :value="true"  v-model="editForm.taxInvoice.requested" class="form-radio" /> ต้องการ
                                </label>
                                <label class="flex items-center gap-1 text-sm cursor-pointer">
                                    <input type="radio" :value="false" v-model="editForm.taxInvoice.requested" class="form-radio" /> ไม่ต้องการ
                                </label>
                            </div>
                            <div v-if="editForm.taxInvoice.requested" class="space-y-2">
                                <input v-model="editForm.taxInvoice.companyName" type="text" class="form-input w-full text-sm" placeholder="ชื่อบริษัท" />
                                <input v-model="editForm.taxInvoice.taxId" type="text" class="form-input w-full text-sm font-mono" placeholder="เลขประจำตัวผู้เสียภาษี" maxlength="13" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History -->
                <div class="panel">
                    <h6 class="text-base font-semibold mb-3 dark:text-white-light">📜 ประวัติ</h6>
                    <div class="space-y-2">
                        <div
                            v-for="(entry, idx) in [...quotation.history].reverse()"
                            :key="idx"
                            class="flex gap-2 text-xs"
                        >
                            <span class="text-gray-400 shrink-0 w-20">{{ formatDateTime(entry.ts) }}</span>
                            <span class="font-medium" :class="historyColor(entry.action)">{{ entry.detail }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirm modal -->
        <div v-if="pendingAction" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 px-4">
            <div class="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-[#0e1726]">
                <h3 class="text-lg font-bold mb-2 dark:text-white">{{ confirmModal.title }}</h3>
                <p class="text-sm text-gray-500 mb-4">{{ confirmModal.body }}</p>
                <div class="flex gap-2 justify-end">
                    <button class="btn btn-outline-secondary btn-sm" @click="pendingAction = null">ยกเลิก</button>
                    <button class="btn btn-sm" :class="confirmModal.btnClass" @click="executeAction">{{ confirmModal.btnLabel }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PRODUCT_CATALOG, useOrQuotation } from '~/composables/useOrQuotation';

useHead({ title: 'ใบเสนอราคา' });
const route  = useRoute();
const router = useRouter();

const { quotations, updateQuotation, deleteQuotation, getQuotation } = useOrQuotation();
const allOrders = useState<any[]>('or-orders', () => []);

const quotation = computed(() => getQuotation(String(route.params.id)));

// ── Status pipeline ────────────────────────────────────────────────────────────
const STATUS_ORDER = ['draft', 'sent', 'accepted', 'converted'];
const statusPipeline = computed(() => {
    const s = quotation.value?.status;
    return [
        { key: 'draft',     label: 'Draft',         skip: false },
        { key: 'sent',      label: 'Sent',           skip: false },
        { key: 'accepted',  label: 'Accepted',       skip: s === 'rejected' },
        { key: 'converted', label: s === 'rejected' ? 'Rejected' : 'Converted', skip: false },
    ];
});

const statusIdx = (key: string) => STATUS_ORDER.indexOf(key);
const currentIdx = computed(() => {
    const s = quotation.value?.status;
    if (s === 'rejected') return 3;
    return statusIdx(s ?? 'draft');
});
const isCurrent = (step: any) => step.key === quotation.value?.status || (step.key === 'converted' && quotation.value?.status === 'rejected');
const isPast    = (step: any) => {
    const si = statusIdx(step.key);
    return si >= 0 && si < currentIdx.value;
};
const pipelineCircle = (step: any) => {
    if (isPast(step)) return 'bg-success border-success text-white';
    if (isCurrent(step)) return 'bg-primary border-primary text-white';
    return 'border-gray-300 dark:border-gray-600 text-gray-400';
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const isExpired = computed(() => {
    if (!quotation.value?.validUntil) return false;
    return new Date(quotation.value.validUntil) < new Date();
});

const formatDate = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatDateTime = (d: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
};

const statusLabel = (s: string) => ({
    draft: 'Draft', sent: 'Sent', accepted: 'Accepted', rejected: 'Rejected', converted: 'Converted',
}[s] ?? s);

const statusBadge = (s: string) => ({
    draft: 'badge-outline-secondary',
    sent: 'badge-outline-primary',
    accepted: 'badge-outline-success',
    rejected: 'badge-outline-danger',
    converted: 'badge-outline-info',
}[s] ?? 'badge-outline-secondary');

const historyColor = (action: string) => ({
    create: 'text-gray-500',
    send: 'text-primary',
    accept: 'text-success',
    reject: 'text-danger',
    convert: 'text-info',
    edit: 'text-warning',
}[action] ?? 'text-gray-500');

// ── Edit mode ──────────────────────────────────────────────────────────────────
const isEditing = ref(false);
const editForm  = ref<any>({});

const editTotalInVat = computed(() => (editForm.value.items ?? []).reduce((s: number, i: any) => s + i.subtotalInVat, 0));
const editTotalExVat = computed(() => editTotalInVat.value / 1.07);
const editVatAmount  = computed(() => editTotalInVat.value - editTotalExVat.value);

const startEdit = () => {
    const q = quotation.value!;
    editForm.value = {
        soldToName:      q.soldToName,
        soldToCode:      q.soldToCode,
        shipToName:      q.shipToName,
        shipToCode:      q.shipToCode,
        deliveryContact: { ...q.deliveryContact },
        validUntil:      q.validUntil,
        note:            q.note,
        taxInvoice:      { ...q.taxInvoice },
        items:           q.items.map(i => ({ ...i })),
    };
    isEditing.value = true;
};

const cancelEdit = () => { isEditing.value = false; };

const saveEdit = () => {
    if (!quotation.value) return;
    updateQuotation(quotation.value.id, {
        soldToName:      editForm.value.soldToName,
        soldToCode:      editForm.value.soldToCode,
        shipToName:      editForm.value.shipToName,
        shipToCode:      editForm.value.shipToCode,
        deliveryContact: { ...editForm.value.deliveryContact },
        validUntil:      editForm.value.validUntil,
        note:            editForm.value.note,
        taxInvoice:      { ...editForm.value.taxInvoice },
        items:           editForm.value.items.map((i: any) => ({ ...i })),
        history: [
            ...quotation.value.history,
            { ts: new Date().toISOString(), action: 'edit', detail: 'แก้ไขข้อมูลใบเสนอราคา' },
        ],
    });
    isEditing.value = false;
};

const addEditItem = () => {
    editForm.value.items.push({ productId: '', productNameEn: '', qty: 1, priceInVat: 0, subtotalInVat: 0 });
};
const removeEditItem = (idx: number) => editForm.value.items.splice(idx, 1);
const onEditProductChange = (idx: number, pid: string) => {
    const prod = PRODUCT_CATALOG[pid];
    if (!prod) return;
    editForm.value.items[idx].productId     = pid;
    editForm.value.items[idx].productNameEn = prod.name;
    editForm.value.items[idx].priceInVat    = prod.defaultPrice;
    recalcEditItem(idx);
};
const recalcEditItem = (idx: number) => {
    const item = editForm.value.items[idx];
    item.subtotalInVat = Math.round(item.qty * item.priceInVat * 100) / 100;
};

// ── Status actions ────────────────────────────────────────────────────────────
type ActionKey = 'send' | 'accept' | 'reject' | 'convert' | 'delete';
const pendingAction = ref<ActionKey | null>(null);

const confirmModal = computed(() => ({
    send: {
        title: 'ส่งใบเสนอราคา',
        body: `ยืนยันการส่งใบเสนอราคา ${quotation.value?.quotationNo} ให้ลูกค้า?`,
        btnLabel: 'ส่งใบเสนอ',
        btnClass: 'btn-success',
    },
    accept: {
        title: 'ลูกค้ายอมรับใบเสนอ',
        body: 'ยืนยันว่าลูกค้ายอมรับใบเสนอราคานี้แล้ว?',
        btnLabel: 'ยืนยัน',
        btnClass: 'btn-success',
    },
    reject: {
        title: 'ลูกค้าปฏิเสธ',
        body: 'บันทึกว่าลูกค้าปฏิเสธใบเสนอราคานี้?',
        btnLabel: 'บันทึก',
        btnClass: 'btn-danger',
    },
    convert: {
        title: 'แปลงเป็น Order',
        body: 'สร้าง Order ใหม่จากใบเสนอราคานี้ (สถานะ Draft — ต้องยืนยันสั่งซื้อแยก)',
        btnLabel: 'แปลงเป็น Order',
        btnClass: 'btn-primary',
    },
    delete: {
        title: 'ลบใบเสนอราคา',
        body: `ลบ ${quotation.value?.quotationNo} ? ไม่สามารถกู้คืนได้`,
        btnLabel: 'ลบ',
        btnClass: 'btn-danger',
    },
}[pendingAction.value ?? 'send'] ?? { title: '', body: '', btnLabel: '', btnClass: '' }));

const confirmAction = (action: ActionKey) => { pendingAction.value = action; };

const executeAction = () => {
    const q = quotation.value;
    if (!q) return;
    const now = new Date().toISOString();

    if (pendingAction.value === 'send') {
        updateQuotation(q.id, {
            status: 'sent',
            history: [...q.history, { ts: now, action: 'send', detail: 'ส่งใบเสนอราคาให้ลูกค้าแล้ว' }],
        });
    } else if (pendingAction.value === 'accept') {
        updateQuotation(q.id, {
            status: 'accepted',
            history: [...q.history, { ts: now, action: 'accept', detail: 'ลูกค้ายืนยันรับใบเสนอราคา' }],
        });
    } else if (pendingAction.value === 'reject') {
        updateQuotation(q.id, {
            status: 'rejected',
            history: [...q.history, { ts: now, action: 'reject', detail: 'ลูกค้าปฏิเสธใบเสนอราคา' }],
        });
    } else if (pendingAction.value === 'convert') {
        const orderNo = `QT-2026-${String(allOrders.value.length + 1).padStart(4, '0')}`;
        const newOrder = {
            id:           `ord-${Date.now()}`,
            orderNo,
            status:       'draft',
            createdAt:    now,
            editDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            customerType:    q.customerType,
            soldToName:      q.soldToName,
            soldToCode:      q.soldToCode,
            shipToName:      q.shipToName,
            shipToCode:      q.shipToCode,
            deliveryContact: { ...q.deliveryContact },
            deliveryNote:    '',
            requestedDeliveryDate: null,
            taxInvoice:      { ...q.taxInvoice },
            note:            q.note,
            items:           q.items.map(i => ({ ...i })),
            totalExVat:      q.totalExVat,
            vatAmount:       q.vatAmount,
            totalInVat:      q.totalInVat,
            history:         [{ ts: now, action: 'create', detail: `สร้างจากใบเสนอราคา ${q.quotationNo}` }],
        };
        allOrders.value.unshift(newOrder);
        updateQuotation(q.id, {
            status: 'converted',
            convertedOrderNo: orderNo,
            history: [...q.history, { ts: now, action: 'convert', detail: `แปลงเป็น Order: ${orderNo}` }],
        });
    } else if (pendingAction.value === 'delete') {
        deleteQuotation(q.id);
        pendingAction.value = null;
        router.push('/quotation');
        return;
    }

    pendingAction.value = null;
};

// ── Export ────────────────────────────────────────────────────────────────────
const exportCSV = () => {
    const q = quotation.value;
    if (!q) return;
    const headers = [
        'Quotation No', 'Date', 'Valid Until', 'Status',
        'Customer Name', 'Sold-to Code', 'Ship-to Name', 'Ship-to Code',
        'Contact Name', 'Contact Phone',
        'Product Code', 'Product Name', 'Qty',
        'Unit Price (incl VAT)', 'Unit Price (excl VAT)',
        'Subtotal (incl VAT)', 'Subtotal (excl VAT)', 'Line VAT',
        'Total (incl VAT)', 'Total (excl VAT)', 'Total VAT',
        'Tax Invoice', 'Tax Company', 'Tax ID', 'Note',
    ];
    const rows = q.items.map(item => {
        const unitEx = item.priceInVat / 1.07;
        const subEx  = item.subtotalInVat / 1.07;
        return [
            q.quotationNo, q.createdAt.slice(0, 10), q.validUntil, statusLabel(q.status),
            q.soldToName, q.soldToCode, q.shipToName, q.shipToCode,
            q.deliveryContact.name, q.deliveryContact.phone,
            item.productId, item.productNameEn, String(item.qty),
            item.priceInVat.toFixed(2), unitEx.toFixed(2),
            item.subtotalInVat.toFixed(2), subEx.toFixed(2), (item.subtotalInVat - subEx).toFixed(2),
            q.totalInVat.toFixed(2), q.totalExVat.toFixed(2), q.vatAmount.toFixed(2),
            q.taxInvoice.requested ? 'Yes' : 'No', q.taxInvoice.companyName, q.taxInvoice.taxId, q.note,
        ];
    });
    const csv  = [headers, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${q.quotationNo}_raw_${q.createdAt.slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const printQuotation = () => {
    const q = quotation.value;
    if (!q) return;
    const fmtNum = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2 });
    const html = `<!DOCTYPE html>
<html lang="th">
<head><meta charset="UTF-8"/><title>${q.quotationNo}</title>
<style>
  body{margin:0;font-family:sans-serif;color:#111;}
  @media print{body{background:#fff;}}
  .doc{max-width:800px;margin:24px auto;padding:40px;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  th{background:#1b2e4b;color:#fff;padding:10px 12px;text-align:left;}
  td{padding:8px 12px;border-bottom:1px solid #e5e7eb;}
  .tr-even{background:#f9fafb;}
</style></head>
<body><div class="doc">
  <div style="display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #1b2e4b;">
    <div><div style="font-size:22px;font-weight:bold;color:#1b2e4b;">OR Company Ltd.</div><div style="font-size:11px;color:#9ca3af;">123 Business Park, Bangkok 10110</div></div>
    <div style="text-align:right;"><div style="font-size:24px;font-weight:bold;color:#4361ee;">ใบเสนอราคา</div><div style="font-size:12px;color:#9ca3af;">SALES QUOTATION</div>
      <div style="margin-top:8px;font-size:13px;"><strong>เลขที่:</strong> ${q.quotationNo}</div>
      <div style="font-size:13px;"><strong>วันที่:</strong> ${formatDate(q.createdAt)}</div>
      <div style="font-size:13px;"><strong>หมดอายุ:</strong> ${formatDate(q.validUntil)}</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;">
      <div style="font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">ลูกค้า / Sold-to</div>
      <div style="font-weight:600;font-size:14px;">${q.soldToName}</div>
      <div style="font-size:11px;color:#9ca3af;font-family:monospace;">${q.soldToCode || ''}</div>
    </div>
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;background:#f9fafb;">
      <div style="font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;margin-bottom:8px;">จัดส่ง / Ship-to</div>
      <div style="font-weight:600;font-size:14px;">${q.shipToName}</div>
      <div style="font-size:11px;color:#9ca3af;font-family:monospace;">${q.shipToCode || ''}</div>
      ${q.deliveryContact.name ? `<div style="font-size:11px;color:#6b7280;margin-top:4px;">ผู้ติดต่อ: ${q.deliveryContact.name}${q.deliveryContact.phone ? ' | ' + q.deliveryContact.phone : ''}</div>` : ''}
    </div>
  </div>
  <table>
    <thead><tr><th style="width:32px;">#</th><th style="width:96px;">รหัส</th><th>ชื่อสินค้า</th><th style="text-align:center;width:64px;">จำนวน</th><th style="text-align:right;width:128px;">ราคา/หน่วย</th><th style="text-align:right;width:128px;">รวม</th></tr></thead>
    <tbody>${q.items.map((item, i) => `<tr class="${i % 2 ? 'tr-even' : ''}"><td style="color:#9ca3af;">${i + 1}</td><td style="font-family:monospace;font-size:11px;color:#6b7280;">${item.productId}</td><td style="font-weight:500;">${item.productNameEn}</td><td style="text-align:center;">${item.qty.toLocaleString('th-TH')}</td><td style="text-align:right;">${fmtNum(item.priceInVat)}</td><td style="text-align:right;font-weight:600;">${fmtNum(item.subtotalInVat)}</td></tr>`).join('')}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end;margin:16px 0;">
    <div style="width:280px;font-size:13px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">ยอดรวมก่อนภาษี</span><span>${fmtNum(q.totalExVat)}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="color:#6b7280;">ภาษีมูลค่าเพิ่ม 7%</span><span>${fmtNum(q.vatAmount)}</span></div>
      <div style="display:flex;justify-content:space-between;border-top:2px solid #e5e7eb;padding-top:8px;font-weight:bold;font-size:15px;"><span>ยอดรวมสุทธิ</span><span style="color:#4361ee;">${fmtNum(q.totalInVat)} ฿</span></div>
    </div>
  </div>
  ${q.note ? `<div style="border-top:1px solid #e5e7eb;padding-top:12px;font-size:12px;"><strong>หมายเหตุ:</strong> ${q.note}</div>` : ''}
  ${q.taxInvoice.requested ? `<div style="color:#2563eb;font-size:12px;margin-top:4px;">✓ ต้องการใบกำกับภาษี — ${q.taxInvoice.companyName} | TAX ID: ${q.taxInvoice.taxId}</div>` : ''}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
    <div><div style="margin-bottom:48px;">ลงชื่อผู้เสนอราคา</div><div style="border-bottom:1px solid #9ca3af;"></div><div style="text-align:center;margin-top:4px;">( ....................................... )</div><div style="text-align:center;">วันที่ ........../........../..........&nbsp;</div></div>
    <div><div style="margin-bottom:48px;">ลงชื่อตอบรับใบเสนอราคา</div><div style="border-bottom:1px solid #9ca3af;"></div><div style="text-align:center;margin-top:4px;">( ....................................... )</div><div style="text-align:center;">วันที่ ........../........../..........&nbsp;</div></div>
  </div>
</div><script>window.onload=()=>{window.print();}<\/script></body></html>`;
    const w = window.open('', '_blank', 'width=920,height=750');
    if (w) { w.document.write(html); w.document.close(); }
};
</script>
