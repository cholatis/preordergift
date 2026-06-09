<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Order Management</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>รายการคำสั่งซื้อ</span></li>
        </ul>

        <!-- Status Filter Tabs -->
        <div class="mb-5 overflow-x-auto">
            <ul class="flex flex-nowrap border-b border-white-light dark:border-[#191e3a] min-w-max">
                <li v-for="tab in statusTabs" :key="tab.key">
                    <button
                        class="flex items-center gap-2 border border-transparent px-4 py-2.5 -mb-[1px] font-semibold transition-colors"
                        :class="activeStatus === tab.key
                            ? 'text-primary !border-white-light !border-b-white dark:!border-[#191e3a] dark:!border-b-black'
                            : 'text-gray-500 hover:text-primary dark:text-gray-400'"
                        @click="activeStatus = tab.key"
                    >
                        <span>{{ tab.label }}</span>
                        <span class="rounded-full px-1.5 py-0.5 text-xs font-normal"
                            :class="activeStatus === tab.key ? 'bg-primary text-white' : 'bg-white-light dark:bg-[#1b2e4b] text-gray-500 dark:text-gray-400'">
                            {{ statusCount(tab.key) }}
                        </span>
                    </button>
                </li>
            </ul>
        </div>

        <!-- Order Table -->
        <div class="panel">
            <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">รายการคำสั่งซื้อ</h5>
                <div class="ltr:ml-auto rtl:mr-auto flex flex-wrap items-center gap-2">
                    <input v-model="search" type="text" class="form-input w-52" placeholder="ค้นหาเลขที่, ลูกค้า..." />
                    <button class="btn btn-outline-success whitespace-nowrap" @click="exportCSV">
                        ⬇️ Export CSV
                    </button>
                    <NuxtLink to="/orders/create" class="btn btn-primary whitespace-nowrap">
                        + สร้างคำสั่งซื้อใหม่
                    </NuxtLink>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-36">เลขที่<br /><span class="text-xs font-normal opacity-70">Order No.</span></th>
                            <th class="w-28">วันที่<br /><span class="text-xs font-normal opacity-70">Date</span></th>
                            <th>ลูกค้า<br /><span class="text-xs font-normal opacity-70">Customer / Sold-to</span></th>
                            <th>สถานที่จัดส่ง<br /><span class="text-xs font-normal opacity-70">Ship-to</span></th>
                            <th class="w-20 !text-center">รายการ<br /><span class="text-xs font-normal opacity-70">Items</span></th>
                            <th class="w-36 !text-right">ยอดรวม<br /><span class="text-xs font-normal opacity-70">incl. VAT</span></th>
                            <th class="w-36 !text-center">สถานะ<br /><span class="text-xs font-normal opacity-70">Status</span></th>
                            <th class="w-32 !text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="order in filteredOrders" :key="order.id">
                            <td>
                                <NuxtLink :to="`/orders/${order.id}`" class="font-semibold text-primary hover:underline">
                                    {{ order.orderNo }}
                                </NuxtLink>
                                <div v-if="isInEditWindow(order)" class="mt-0.5">
                                    <span class="text-xs text-amber-500">⏳ แก้ไขได้</span>
                                </div>
                            </td>
                            <td class="text-gray-500 dark:text-gray-400 text-sm">{{ formatDate(order.createdAt) }}</td>
                            <td>
                                <div class="font-medium dark:text-white-dark">{{ order.soldToName }}</div>
                                <div class="text-xs text-gray-400 font-mono">{{ order.customerType === 'new' ? 'ลูกค้าใหม่' : order.soldToCode }}</div>
                            </td>
                            <td class="text-gray-600 dark:text-gray-300">
                                <div class="text-sm">{{ order.shipToName }}</div>
                                <div class="text-xs text-gray-400 font-mono">{{ order.customerType === 'new' ? '' : order.shipToCode }}</div>
                            </td>
                            <td class="!text-center text-sm text-gray-600 dark:text-gray-300">{{ order.items.length }} รายการ</td>
                            <td class="!text-right font-semibold text-primary">{{ order.totalInVat.toLocaleString('th-TH') }} ฿</td>
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap text-xs" :class="statusBadge(order.status)">
                                    {{ statusLabel(order.status) }}
                                </span>
                            </td>
                            <td class="!text-center">
                                <div class="flex items-center justify-center gap-1">
                                    <NuxtLink :to="`/orders/${order.id}`" class="btn btn-outline-primary px-2 py-1 text-xs">ดู</NuxtLink>
                                    <button v-if="order.status !== 'cancelled' && order.status !== 'done'" class="btn btn-outline-secondary px-2 py-1 text-xs" @click="quickPrint(order)">🖨️</button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredOrders.length === 0">
                            <td colspan="8" class="!text-center py-10 text-gray-400">ไม่พบคำสั่งซื้อ</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Summary bar -->
            <div v-if="filteredOrders.length > 0" class="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-200 dark:border-[#2d3e5c] pt-4 text-sm text-gray-500 dark:text-gray-400">
                <span>แสดง <strong class="text-gray-700 dark:text-gray-200">{{ filteredOrders.length }}</strong> รายการ</span>
                <span>ยอดรวม: <strong class="text-primary">{{ totalFiltered.toLocaleString('th-TH') }} ฿</strong></span>
            </div>
        </div>

        <!-- Export info tooltip -->
        <div class="mt-3 text-xs text-gray-400 dark:text-gray-500">
            💡 Export CSV จะดึงข้อมูลตามตัวกรองสถานะที่เลือกอยู่ในขณะนั้น — รองรับ Excel (UTF-8 BOM)
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';

    useHead({ title: 'Order Management | รายการคำสั่งซื้อ' });

    type OrderStatus = 'draft' | 'submitted' | 'prepare_delivery' | 'done' | 'cancelled';

    const statusTabs = [
        { key: 'all',              label: 'ทั้งหมด' },
        { key: 'draft',            label: 'ร่าง' },
        { key: 'submitted',        label: 'รอดำเนินการ' },
        { key: 'prepare_delivery', label: 'กำลังจัดส่ง' },
        { key: 'done',             label: 'เสร็จสิ้น' },
        { key: 'cancelled',        label: 'ยกเลิก' },
    ] as const;

    const activeStatus = ref('all');
    const search = ref('');
    const now = ref(new Date());
    setInterval(() => { now.value = new Date(); }, 30000); // update every 30s for edit-window badge

    const orders = useState<any[]>('or-orders', () => [
        {
            id: 'ORD001', orderNo: 'QT-2026-0001',
            soldToCode: '0010000186', soldToName: 'บริษัท กฟผ. จำกัด (มหาชน)', customerType: 'existing',
            shipToCode: '0010000079', shipToName: 'ฝ่ายจัดซื้อ — สำนักงานใหญ่',
            deliveryContact: { name: 'คุณสมศรี จงเจริญ', phone: '081-234-5678' },
            deliveryNote: 'จัดส่งก่อนสิ้นเดือนมกราคม 2026',
            requestedDeliveryDate: '2026-01-31',
            taxInvoice: { requested: true, taxName: 'บริษัท กฟผ. จำกัด (มหาชน)', taxId: '0107537000289', taxAddress: '53 หมู่ 2 ถ.จรัญสนิทวงศ์ ต.บางกรวย จ.นนทบุรี 11130', branch: 'สำนักงานใหญ่' },
            items: [
                { productId: 'GS-01', productNameEn: 'SIGNATURE BREW GIFT SET', priceInVat: 699, priceExVat: 653.27, qty: 12, subtotalInVat: 8388 },
                { productId: 'GS-02', productNameEn: 'TEA OF JOY GIFT SET', priceInVat: 479, priceExVat: 447.66, qty: 8, subtotalInVat: 3832 },
            ],
            totalExVat: 11385.98, vatAmount: 834.02, totalInVat: 12220,
            note: '',
            status: 'submitted',
            createdAt: '2026-01-15',
            submittedAt: '2026-01-15T09:30:00.000Z',
            editDeadline: '2026-01-15T10:00:00.000Z',
            history: [
                { ts: '2026-01-15T09:30:00.000Z', action: 'submit', detail: 'สร้างและส่งคำสั่งซื้อ' },
            ],
        },
        {
            id: 'ORD002', orderNo: 'QT-2026-0002',
            soldToCode: '0010000271', soldToName: 'นายประเสริฐ เลี้ยงปารุง', customerType: 'existing',
            shipToCode: '0010000100', shipToName: 'บ้านพัก',
            deliveryContact: { name: 'นายประเสริฐ เลี้ยงปารุง', phone: '089-876-5432' },
            deliveryNote: '',
            requestedDeliveryDate: '2026-01-25',
            taxInvoice: { requested: false, taxName: '', taxId: '', taxAddress: '', branch: '' },
            items: [
                { productId: 'GS-03', productNameEn: 'GREEN TEA JUMBO GIFT SET', priceInVat: 749, priceExVat: 700, qty: 6, subtotalInVat: 4494 },
                { productId: 'TB-01', productNameEn: 'ORDINARY TUMBLER 22oz', priceInVat: 280, priceExVat: 261.68, qty: 12, subtotalInVat: 3360 },
            ],
            totalExVat: 7340.19, vatAmount: 513.81, totalInVat: 7854,
            note: 'ระวังสินค้าเปราะบาง',
            status: 'prepare_delivery',
            createdAt: '2026-01-18',
            submittedAt: '2026-01-18T14:00:00.000Z',
            editDeadline: '2026-01-18T14:30:00.000Z',
            trackingInfo: { carrier: 'Kerry Express', trackingNo: 'KE1234567890TH', note: 'นัดส่ง 25 ม.ค.' },
            history: [
                { ts: '2026-01-18T14:00:00.000Z', action: 'submit', detail: 'สร้างและส่งคำสั่งซื้อ' },
                { ts: '2026-01-19T10:00:00.000Z', action: 'prepare_delivery', detail: 'เริ่มดำเนินการจัดส่ง — Kerry Express KE1234567890TH' },
            ],
        },
        {
            id: 'ORD003', orderNo: 'QT-2026-0003',
            soldToCode: '0010000272', soldToName: 'นายสมชาติ องุ่นศร', customerType: 'existing',
            shipToCode: '0020000050', shipToName: 'บ้านพัก',
            deliveryContact: { name: 'นายสมชาติ องุ่นศร', phone: '062-111-2222' },
            deliveryNote: '',
            requestedDeliveryDate: '',
            taxInvoice: { requested: null, taxName: '', taxId: '', taxAddress: '', branch: '' },
            items: [
                { productId: 'GS-05', productNameEn: 'SENCHA MOMENT GIFT SET', priceInVat: 449, priceExVat: 419.63, qty: 4, subtotalInVat: 1796 },
            ],
            totalExVat: 1678.50, vatAmount: 117.50, totalInVat: 1796,
            note: '',
            status: 'draft',
            createdAt: '2026-01-20',
            submittedAt: null,
            editDeadline: null,
            history: [
                { ts: '2026-01-20T16:00:00.000Z', action: 'draft', detail: 'บันทึกเป็นร่าง' },
            ],
        },
        {
            id: 'ORD004', orderNo: 'QT-2026-0004',
            soldToCode: '0010000273', soldToName: 'นายวิศิษฎ์ เลิศพุทธิกุล', customerType: 'existing',
            shipToCode: '0020000051', shipToName: 'บ้านพัก',
            deliveryContact: { name: 'นายวิศิษฎ์ เลิศพุทธิกุล', phone: '091-333-4444' },
            deliveryNote: 'โทรก่อนจัดส่ง',
            requestedDeliveryDate: '2026-01-22',
            taxInvoice: { requested: true, taxName: 'นายวิศิษฎ์ เลิศพุทธิกุล', taxId: '3100700112233', taxAddress: '789 ถ.เพชรบุรีตัดใหม่ กรุงเทพฯ 10400', branch: '' },
            items: [
                { productId: 'GS-07', productNameEn: 'RHYTHM OF CAPSULE GIFT SET', priceInVat: 1279, priceExVat: 1195.33, qty: 4, subtotalInVat: 5116 },
                { productId: 'MC-01', productNameEn: 'NEW COFFEE CAPSULE MACHINE', priceInVat: 3399, priceExVat: 3176.64, qty: 1, subtotalInVat: 3399 },
            ],
            totalExVat: 7824.07, vatAmount: 547.93, totalInVat: 8515,
            note: '',
            status: 'done',
            createdAt: '2026-01-10',
            submittedAt: '2026-01-10T11:00:00.000Z',
            editDeadline: '2026-01-10T11:30:00.000Z',
            trackingInfo: { carrier: 'Flash Express', trackingNo: 'FX9876543210', note: '' },
            deliveredAt: '2026-01-22',
            history: [
                { ts: '2026-01-10T11:00:00.000Z', action: 'submit', detail: 'สร้างและส่งคำสั่งซื้อ' },
                { ts: '2026-01-12T09:00:00.000Z', action: 'prepare_delivery', detail: 'เริ่มดำเนินการจัดส่ง — Flash Express FX9876543210' },
                { ts: '2026-01-22T14:30:00.000Z', action: 'done', detail: 'ลูกค้าได้รับสินค้าแล้ว' },
            ],
        },
    ]);

    // ── Helpers ──────────────────────────────────────────────────────
    const statusLabel = (s: string) => ({
        draft: 'ร่าง', submitted: 'รอดำเนินการ',
        prepare_delivery: 'กำลังจัดส่ง', done: 'เสร็จสิ้น', cancelled: 'ยกเลิก',
    }[s] ?? s);

    const statusBadge = (s: string) => ({
        draft: 'badge-outline-secondary',
        submitted: 'badge-outline-info',
        prepare_delivery: 'badge-outline-warning',
        done: 'badge-outline-success',
        cancelled: 'badge-outline-danger',
    }[s] ?? 'badge-outline-secondary');

    const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    const isInEditWindow = (order: any) => {
        if (!order.editDeadline || order.status !== 'submitted') return false;
        return now.value.getTime() < new Date(order.editDeadline).getTime();
    };

    const statusCount = (key: string) => key === 'all' ? orders.value.length : orders.value.filter(o => o.status === key).length;

    const filteredOrders = computed(() => {
        let list = activeStatus.value === 'all' ? orders.value : orders.value.filter(o => o.status === activeStatus.value);
        if (search.value) {
            const q = search.value.toLowerCase();
            list = list.filter(o => o.orderNo.toLowerCase().includes(q) || o.soldToName.includes(q) || o.shipToName.includes(q));
        }
        return list;
    });

    const totalFiltered = computed(() => filteredOrders.value.reduce((s, o) => s + (o.totalInVat ?? 0), 0));

    const quickPrint = (order: any) => {
        window.open(`/orders/${order.id}`, '_blank');
    };

    // ── Export CSV ───────────────────────────────────────────────────
    const exportCSV = () => {
        const headers = [
            'Order No.', 'วันที่สร้าง', 'Sold-to Code', 'Sold-to Name',
            'Ship-to Code', 'Ship-to Name', 'ชื่อลูกค้า/บริษัท/หน่วยงาน',
            'Contact Person', 'เบอร์โทร', 'อีเมล',
            'รหัสสินค้า', 'ชื่อสินค้า (EN)', 'Qty (ชุด)',
            'Unit Price excl.VAT (฿)', 'Unit Price incl.VAT (฿)',
            'Line Total excl.VAT (฿)', 'Line Total incl.VAT (฿)',
            'VAT Status',
            'Tax Invoice Required', 'Tax Name', 'Tax ID', 'Tax Branch', 'Tax Address',
            'Delivery Note', 'Requested Delivery Date', 'สถานะ Order',
        ];

        const rows: string[][] = [headers];

        for (const o of filteredOrders.value) {
            const contactName = o.deliveryContact?.name ?? o.contactName ?? '';
            const contactPhone = o.deliveryContact?.phone ?? o.phone ?? '';
            const contactEmail = o.email ?? '';
            const taxRequired = o.taxInvoice?.requested === true ? 'ขอใบกำกับภาษี' : o.taxInvoice?.requested === false ? 'ไม่ขอ' : '';

            for (const item of o.items) {
                const priceExVat = item.priceExVat ?? +(item.priceInVat / 1.07).toFixed(2);
                const lineExVat = +(priceExVat * item.qty).toFixed(2);
                rows.push([
                    o.orderNo,
                    o.createdAt,
                    o.soldToCode ?? '',
                    o.soldToName,
                    o.shipToCode ?? '',
                    o.shipToName,
                    o.soldToName,
                    contactName,
                    contactPhone,
                    contactEmail,
                    item.productId,
                    item.productNameEn,
                    String(item.qty),
                    String(priceExVat),
                    String(item.priceInVat),
                    String(lineExVat),
                    String(item.subtotalInVat),
                    'VAT 7%',
                    taxRequired,
                    o.taxInvoice?.taxName ?? '',
                    o.taxInvoice?.taxId ?? '',
                    o.taxInvoice?.branch ?? '',
                    o.taxInvoice?.taxAddress ?? '',
                    o.deliveryNote ?? '',
                    o.requestedDeliveryDate ?? '',
                    statusLabel(o.status),
                ]);
            }
        }

        const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${activeStatus.value}_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
</script>
