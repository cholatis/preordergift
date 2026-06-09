<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Dashboard</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Sales Overview</span></li>
        </ul>

        <!-- ── Section 1: KPI Cards ───────────────────────────────────── -->
        <div class="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            <!-- Total Orders -->
            <div class="panel flex items-center gap-4 p-5">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl">
                    📋
                </div>
                <div>
                    <div class="text-2xl font-bold text-dark dark:text-white-light">{{ kpi.totalOrders }}</div>
                    <div class="text-xs text-gray-500">คำสั่งซื้อทั้งหมด<br /><span class="opacity-70">Total Orders</span></div>
                </div>
            </div>

            <!-- Total Value -->
            <div class="panel flex items-center gap-4 p-5">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success text-xl">
                    💰
                </div>
                <div>
                    <div class="text-2xl font-bold text-dark dark:text-white-light">{{ kpi.totalValue.toLocaleString('th-TH') }}</div>
                    <div class="text-xs text-gray-500">ยอดรวม (incl.VAT)<br /><span class="opacity-70">Total Value (฿)</span></div>
                </div>
            </div>

            <!-- Submitted -->
            <div class="panel flex items-center gap-4 p-5">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-info/10 text-info text-xl">
                    ⏳
                </div>
                <div>
                    <div class="text-2xl font-bold text-dark dark:text-white-light">{{ kpi.submitted }}</div>
                    <div class="text-xs text-gray-500">รอดำเนินการ<br /><span class="opacity-70">Pending</span></div>
                </div>
            </div>

            <!-- Approved -->
            <div class="panel flex items-center gap-4 p-5">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning text-xl">
                    ✅
                </div>
                <div>
                    <div class="text-2xl font-bold text-dark dark:text-white-light">{{ kpi.approved }}</div>
                    <div class="text-xs text-gray-500">อนุมัติแล้ว<br /><span class="opacity-70">Approved</span></div>
                </div>
            </div>
        </div>

        <!-- ── Section 2: Order Status + Stock Alert ──────────────────── -->
        <div class="mb-6 grid gap-6 xl:grid-cols-2">

            <!-- Order Status Distribution -->
            <div class="panel h-full">
                <h5 class="mb-5 text-lg font-semibold dark:text-white-light">
                    สถานะคำสั่งซื้อ
                    <span class="text-sm font-normal text-gray-400 ml-2">Order Status</span>
                </h5>
                <div class="space-y-4">
                    <div v-for="s in statusSummary" :key="s.key" class="flex items-center gap-3">
                        <div class="w-28 shrink-0 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {{ s.label }}
                            <div class="text-[10px] text-gray-400">{{ s.labelEn }}</div>
                        </div>
                        <div class="flex-1">
                            <div class="h-6 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                                <div
                                    class="flex h-6 items-center rounded-full px-2 text-xs font-semibold text-white transition-all duration-500"
                                    :class="s.barClass"
                                    :style="{ width: kpi.totalOrders > 0 ? Math.max(8, (s.count / kpi.totalOrders) * 100) + '%' : '0%' }"
                                >
                                    {{ s.count }} Order
                                </div>
                            </div>
                        </div>
                        <div class="w-20 shrink-0 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                            {{ s.value.toLocaleString('th-TH') }} ฿
                        </div>
                    </div>
                </div>

                <!-- Recent Orders shortcut -->
                <div class="mt-6 border-t border-white-light pt-4 dark:border-[#191e3a]">
                    <div class="mb-3 flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">คำสั่งซื้อล่าสุด</span>
                        <NuxtLink to="/orders" class="text-xs text-primary hover:underline">ดูทั้งหมด →</NuxtLink>
                    </div>
                    <div class="space-y-2">
                        <div
                            v-for="order in recentOrders"
                            :key="order.id"
                            class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-[#1b2e4b]/30"
                        >
                            <div>
                                <NuxtLink :to="`/orders/${order.id}`" class="text-sm font-semibold text-primary hover:underline">
                                    {{ order.orderNo }}
                                </NuxtLink>
                                <div class="text-xs text-gray-400">{{ order.soldToName }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-semibold">{{ order.totalInVat.toLocaleString('th-TH') }} ฿</div>
                                <span class="badge text-[10px]" :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stock Alert -->
            <div class="panel h-full">
                <div class="mb-5 flex items-center justify-between">
                    <h5 class="text-lg font-semibold dark:text-white-light">
                        สต็อกสินค้า
                        <span class="text-sm font-normal text-gray-400 ml-2">Stock Status</span>
                    </h5>
                    <NuxtLink to="/stock" class="text-xs text-primary hover:underline">จัดการสต็อก →</NuxtLink>
                </div>

                <!-- Stock Summary Cards -->
                <div class="mb-5 grid grid-cols-3 gap-3">
                    <div class="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
                        <div class="text-2xl font-bold text-success">{{ stockSummary.ok }}</div>
                        <div class="text-[10px] text-gray-500">พร้อมขาย</div>
                    </div>
                    <div class="rounded-lg border border-warning/30 bg-warning/5 p-3 text-center">
                        <div class="text-2xl font-bold text-warning">{{ stockSummary.low }}</div>
                        <div class="text-[10px] text-gray-500">ใกล้หมด</div>
                    </div>
                    <div class="rounded-lg border border-danger/30 bg-danger/5 p-3 text-center">
                        <div class="text-2xl font-bold text-danger">{{ stockSummary.out }}</div>
                        <div class="text-[10px] text-gray-500">หมดสต็อก</div>
                    </div>
                </div>

                <!-- Low/Out Stock List -->
                <div class="max-h-[280px] overflow-y-auto space-y-2">
                    <div v-if="alertStocks.length === 0" class="py-6 text-center text-sm text-gray-400">
                        ✅ สต็อกสินค้าทุกรายการอยู่ในระดับปกติ
                    </div>
                    <div
                        v-for="s in alertStocks"
                        :key="s.id"
                        class="flex items-center gap-3 rounded-lg px-3 py-2.5"
                        :class="s.status === 'out' ? 'bg-danger/5 border border-danger/20' : 'bg-warning/5 border border-warning/20'"
                    >
                        <div class="flex-1 min-w-0">
                            <div class="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{{ s.productNameEn }}</div>
                            <div class="text-[10px] text-gray-400">{{ s.id }}</div>
                        </div>
                        <div class="shrink-0 text-right">
                            <div class="text-sm font-bold" :class="s.status === 'out' ? 'text-danger' : 'text-warning'">
                                {{ s.qty }} ชุด
                            </div>
                            <span class="badge text-[10px]" :class="s.status === 'out' ? 'badge-outline-danger' : 'badge-outline-warning'">
                                {{ s.status === 'out' ? 'หมดสต็อก' : 'ใกล้หมด' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Section 3: Product Order Summary ──────────────────────── -->
        <div class="panel mb-6">
            <div class="mb-5 flex items-center justify-between">
                <h5 class="text-lg font-semibold dark:text-white-light">
                    สรุปสินค้าที่มีการสั่งซื้อ
                    <span class="text-sm font-normal text-gray-400 ml-2">Product Order Summary</span>
                </h5>
                <div class="text-xs text-gray-400">
                    เรียงตามยอดสั่งซื้อมากสุด
                </div>
            </div>
            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-24">รหัส<br /><span class="text-xs font-normal opacity-70">Code</span></th>
                            <th>ชื่อสินค้า<br /><span class="text-xs font-normal opacity-70">Product name</span></th>
                            <th class="w-28 !text-center">จำนวนสั่ง<br /><span class="text-xs font-normal opacity-70">Total Qty</span></th>
                            <th class="w-36 !text-right">มูลค่ารวม<br /><span class="text-xs font-normal opacity-70">Total Value (฿)</span></th>
                            <th class="w-32 !text-center">Stock คงเหลือ<br /><span class="text-xs font-normal opacity-70">Remaining</span></th>
                            <th class="w-28 !text-center">สถานะ Stock<br /><span class="text-xs font-normal opacity-70">Stock Status</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in productSummary" :key="p.productId">
                            <td class="font-mono text-xs text-gray-500">{{ p.productId }}</td>
                            <td class="font-medium dark:text-white-dark">{{ p.productNameEn }}</td>
                            <td class="!text-center font-semibold text-primary">{{ p.totalQty }}</td>
                            <td class="!text-right font-semibold">{{ p.totalValue.toLocaleString('th-TH') }} ฿</td>
                            <td class="!text-center">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            class="h-1.5 rounded-full"
                                            :class="getStatus(p.productId) === 'out' ? 'bg-danger' : getStatus(p.productId) === 'low' ? 'bg-warning' : 'bg-success'"
                                            :style="{ width: stockBarWidth(p.productId) + '%' }"
                                        ></div>
                                    </div>
                                    <span class="text-sm font-semibold" :class="getStatus(p.productId) === 'out' ? 'text-danger' : getStatus(p.productId) === 'low' ? 'text-warning' : 'text-gray-700 dark:text-gray-200'">
                                        {{ getStock(p.productId).qty }}
                                    </span>
                                </div>
                            </td>
                            <td class="!text-center">
                                <span
                                    class="badge text-[11px]"
                                    :class="getStatus(p.productId) === 'out' ? 'badge-outline-danger' : getStatus(p.productId) === 'low' ? 'badge-outline-warning' : 'badge-outline-success'"
                                >
                                    {{ getStatus(p.productId) === 'out' ? 'หมดสต็อก' : getStatus(p.productId) === 'low' ? 'ใกล้หมด' : 'พร้อมขาย' }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="productSummary.length === 0">
                            <td colspan="6" class="!text-center py-10 text-gray-400">ยังไม่มีการสั่งซื้อ</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ── Section 4: Customer Summary ───────────────────────────── -->
        <div class="panel">
            <div class="mb-5 flex items-center justify-between">
                <h5 class="text-lg font-semibold dark:text-white-light">
                    ลูกค้า / หน่วยงานที่มีการสั่งซื้อ
                    <span class="text-sm font-normal text-gray-400 ml-2">Customer Summary</span>
                </h5>
                <div class="text-xs text-gray-400">{{ customerSummary.length }} บริษัท/หน่วยงาน</div>
            </div>
            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-36">รหัสลูกค้า<br /><span class="text-xs font-normal opacity-70">Sold-to Code</span></th>
                            <th>ชื่อลูกค้า / บริษัท<br /><span class="text-xs font-normal opacity-70">Customer / Company</span></th>
                            <th class="w-24 !text-center">จำนวน Order<br /><span class="text-xs font-normal opacity-70">Orders</span></th>
                            <th class="w-36 !text-right">ยอดรวม (incl.VAT)<br /><span class="text-xs font-normal opacity-70">Total Value</span></th>
                            <th class="w-40">สถานะล่าสุด<br /><span class="text-xs font-normal opacity-70">Latest Status</span></th>
                            <th class="w-28 !text-center">จัดการ<br /><span class="text-xs font-normal opacity-70">Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in customerSummary" :key="c.soldToCode">
                            <td class="font-mono text-xs text-gray-500">{{ c.soldToCode }}</td>
                            <td class="font-medium dark:text-white-dark">{{ c.soldToName }}</td>
                            <td class="!text-center">
                                <span class="badge badge-outline-primary px-3">{{ c.orderCount }}</span>
                            </td>
                            <td class="!text-right font-semibold text-primary">
                                {{ c.totalValue.toLocaleString('th-TH') }} ฿
                            </td>
                            <td>
                                <span class="badge text-[11px]" :class="statusBadge(c.latestStatus)">
                                    {{ statusLabel(c.latestStatus) }}
                                </span>
                                <div class="text-[10px] text-gray-400 mt-0.5">{{ formatDate(c.latestDate) }}</div>
                            </td>
                            <td class="!text-center">
                                <NuxtLink
                                    :to="`/orders?soldTo=${c.soldToCode}`"
                                    class="btn btn-outline-primary px-2 py-1 text-xs"
                                >
                                    ดู Order
                                </NuxtLink>
                            </td>
                        </tr>
                        <tr v-if="customerSummary.length === 0">
                            <td colspan="6" class="!text-center py-10 text-gray-400">ยังไม่มีการสั่งซื้อ</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { computed } from 'vue';

    useHead({ title: 'Dashboard | Sales Overview' });

    type OrderStatus = 'draft' | 'submitted' | 'approved' | 'cancelled';

    interface OrderItem {
        productId: string;
        productNameEn: string;
        priceInVat: number;
        qty: number;
        subtotalInVat: number;
    }

    interface Order {
        id: string;
        orderNo: string;
        soldToCode: string;
        soldToName: string;
        shipToCode: string;
        shipToName: string;
        items: OrderItem[];
        totalExVat: number;
        vatAmount: number;
        totalInVat: number;
        note: string;
        status: OrderStatus;
        createdAt: string;
    }

    // ── Shared State ──────────────────────────────────────────────────
    const orders = useState<Order[]>('or-orders', () => [
        {
            id: 'ORD001', orderNo: 'QT-2026-0001',
            soldToCode: '0010000186', soldToName: 'บริษัท กฟผ. จำกัด (มหาชน)',
            shipToCode: '0010000079', shipToName: 'บริษัท ปิ้ยเอ็นเอฟซี จำกัด (มหาชน)',
            items: [
                { productId: 'GS-01', productNameEn: 'SIGNATURE BREW GIFT SET', priceInVat: 699, qty: 12, subtotalInVat: 8388 },
                { productId: 'GS-02', productNameEn: 'TEA OF JOY GIFT SET', priceInVat: 479, qty: 8, subtotalInVat: 3832 },
            ],
            totalExVat: 11385.98, vatAmount: 797.02, totalInVat: 12220,
            note: 'ต้องการจัดส่งก่อนสิ้นเดือนมกราคม 2026',
            status: 'submitted', createdAt: '2026-01-15',
        },
        {
            id: 'ORD002', orderNo: 'QT-2026-0002',
            soldToCode: '0010000271', soldToName: 'นายประเสริฐ เลี้ยงปารุง',
            shipToCode: '0010000100', shipToName: 'บริษัท ตัวอย่าง จำกัด สาขาที่ 1',
            items: [
                { productId: 'GS-03', productNameEn: 'GREEN TEA JUMBO GIFT SET', priceInVat: 749, qty: 6, subtotalInVat: 4494 },
                { productId: 'TB-01', productNameEn: 'ORDINARY TUMBLER 22oz', priceInVat: 280, qty: 12, subtotalInVat: 3360 },
            ],
            totalExVat: 7340.19, vatAmount: 513.81, totalInVat: 7854,
            note: '',
            status: 'approved', createdAt: '2026-01-18',
        },
        {
            id: 'ORD003', orderNo: 'QT-2026-0003',
            soldToCode: '0010000272', soldToName: 'นายสมชาติ องุ่นศร',
            shipToCode: '0020000050', shipToName: 'ห้างหุ้นส่วนจำกัด ตัวอย่าง',
            items: [
                { productId: 'GS-05', productNameEn: 'SENCHA MOMENT GIFT SET', priceInVat: 449, qty: 4, subtotalInVat: 1796 },
            ],
            totalExVat: 1678.50, vatAmount: 117.50, totalInVat: 1796,
            note: '',
            status: 'draft', createdAt: '2026-01-20',
        },
    ]);

    const { getStock, getStatus } = useOrStock();

    // ── KPI Cards ─────────────────────────────────────────────────────
    const kpi = computed(() => {
        const nonCancelled = orders.value.filter((o) => o.status !== 'cancelled');
        return {
            totalOrders: orders.value.length,
            totalValue: nonCancelled.reduce((sum, o) => sum + o.totalInVat, 0),
            submitted: orders.value.filter((o) => o.status === 'submitted').length,
            approved: orders.value.filter((o) => o.status === 'approved').length,
        };
    });

    // ── Order Status Distribution ──────────────────────────────────────
    const statusSummary = computed(() => {
        const def = [
            { key: 'submitted' as OrderStatus, label: 'รอดำเนินการ', labelEn: 'Pending', barClass: 'bg-info' },
            { key: 'approved' as OrderStatus, label: 'อนุมัติแล้ว', labelEn: 'Approved', barClass: 'bg-success' },
            { key: 'draft' as OrderStatus, label: 'ร่าง', labelEn: 'Draft', barClass: 'bg-secondary' },
            { key: 'cancelled' as OrderStatus, label: 'ยกเลิก', labelEn: 'Cancelled', barClass: 'bg-danger' },
        ];
        return def.map((d) => {
            const grp = orders.value.filter((o) => o.status === d.key);
            return {
                ...d,
                count: grp.length,
                value: grp.reduce((s, o) => s + o.totalInVat, 0),
            };
        });
    });

    // ── Recent Orders (latest 3) ───────────────────────────────────────
    const recentOrders = computed(() =>
        [...orders.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)
    );

    // ── Stock Summary & Alerts ────────────────────────────────────────
    const { stock } = useOrStock();

    const stockSummary = computed(() => {
        let ok = 0, low = 0, out = 0;
        for (const id in stock.value) {
            const s = getStatus(id);
            if (s === 'ok') ok++;
            else if (s === 'low') low++;
            else out++;
        }
        return { ok, low, out };
    });

    const alertStocks = computed(() => {
        return Object.entries(stock.value)
            .filter(([id]) => getStatus(id) !== 'ok')
            .map(([id, s]) => ({ id, ...s, status: getStatus(id) }))
            .sort((a, b) => {
                if (a.status === 'out' && b.status !== 'out') return -1;
                if (b.status === 'out' && a.status !== 'out') return 1;
                return a.qty - b.qty;
            });
    });

    const stockBarWidth = (productId: string) => {
        const s = getStock(productId);
        return Math.min(100, s.qty > 0 ? Math.round((s.qty / (s.minWarning * 5)) * 100) : 0);
    };

    // ── Product Order Summary ──────────────────────────────────────────
    const productSummary = computed(() => {
        const map = new Map<string, { productId: string; productNameEn: string; totalQty: number; totalValue: number }>();
        for (const order of orders.value) {
            if (order.status === 'cancelled') continue;
            for (const item of order.items) {
                const existing = map.get(item.productId);
                if (existing) {
                    existing.totalQty += item.qty;
                    existing.totalValue += item.subtotalInVat;
                } else {
                    map.set(item.productId, {
                        productId: item.productId,
                        productNameEn: item.productNameEn,
                        totalQty: item.qty,
                        totalValue: item.subtotalInVat,
                    });
                }
            }
        }
        return [...map.values()].sort((a, b) => b.totalQty - a.totalQty);
    });

    // ── Customer Summary ──────────────────────────────────────────────
    const customerSummary = computed(() => {
        const map = new Map<string, { soldToCode: string; soldToName: string; orderCount: number; totalValue: number; latestStatus: OrderStatus; latestDate: string }>();
        for (const order of orders.value) {
            const existing = map.get(order.soldToCode);
            if (existing) {
                existing.orderCount++;
                if (order.status !== 'cancelled') existing.totalValue += order.totalInVat;
                if (order.createdAt > existing.latestDate) {
                    existing.latestDate = order.createdAt;
                    existing.latestStatus = order.status;
                }
            } else {
                map.set(order.soldToCode, {
                    soldToCode: order.soldToCode,
                    soldToName: order.soldToName,
                    orderCount: 1,
                    totalValue: order.status !== 'cancelled' ? order.totalInVat : 0,
                    latestStatus: order.status,
                    latestDate: order.createdAt,
                });
            }
        }
        return [...map.values()].sort((a, b) => b.totalValue - a.totalValue);
    });

    // ── Helpers ───────────────────────────────────────────────────────
    const statusLabel = (s: OrderStatus) => {
        const map: Record<OrderStatus, string> = {
            draft: 'ร่าง',
            submitted: 'รอดำเนินการ',
            approved: 'อนุมัติแล้ว',
            cancelled: 'ยกเลิก',
        };
        return map[s];
    };

    const statusBadge = (s: OrderStatus) => {
        const map: Record<OrderStatus, string> = {
            draft: 'badge-outline-secondary',
            submitted: 'badge-outline-info',
            approved: 'badge-outline-success',
            cancelled: 'badge-outline-danger',
        };
        return map[s];
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
</script>
