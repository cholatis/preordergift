<template>
    <div>
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Stock Management</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>จัดการ Stock</span></li>
        </ul>

        <!-- ── KPI Cards ───────────────────────────────────────────────── -->
        <div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <!-- Total SKUs -->
            <div class="panel p-4">
                <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">สินค้าทั้งหมด</div>
                <div class="text-3xl font-bold dark:text-white">{{ stockEntries.length }}</div>
                <div class="text-xs text-gray-400 mt-1">รายการ (SKU)</div>
            </div>
            <!-- Available for pre-order -->
            <div class="panel p-4 border-l-4 border-success">
                <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">เปิดรับจอง (ชั้น 1)</div>
                <div class="text-3xl font-bold text-success">{{ totalAvailable.toLocaleString() }}</div>
                <div class="text-xs text-success/70 mt-1">Available for Pre-order</div>
            </div>
            <!-- Reserved -->
            <div class="panel p-4 border-l-4 border-info">
                <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">จองแล้ว (ชั้น 2)</div>
                <div class="text-3xl font-bold text-info">{{ totalReserved.toLocaleString() }}</div>
                <div class="text-xs text-info/70 mt-1">Reserved / Allocated</div>
            </div>
            <!-- Out of Stock SKUs -->
            <div class="panel p-4 border-l-4 border-danger">
                <div class="text-xs text-gray-400 mb-1 uppercase tracking-wide">หมดสต็อก</div>
                <div class="text-3xl font-bold text-danger">{{ countByStatus('out') }}</div>
                <div class="text-xs text-gray-400 mt-1">รายการ — ปิดการสั่งซื้อ</div>
            </div>
        </div>

        <!-- ── Allocation Overview Bar ────────────────────────────────── -->
        <div class="panel mb-5 p-4">
            <div class="flex items-center justify-between mb-3">
                <h5 class="font-semibold dark:text-white-light">Stock Allocation Overview</h5>
                <div class="flex items-center gap-4 text-xs">
                    <span class="flex items-center gap-1.5"><span class="inline-block h-2.5 w-5 rounded-sm bg-success"></span>Available (ชั้น 1)</span>
                    <span class="flex items-center gap-1.5"><span class="inline-block h-2.5 w-5 rounded-sm bg-info"></span>Reserved (ชั้น 2)</span>
                </div>
            </div>
            <div class="space-y-2">
                <div v-for="[id, entry] in topAllocatedStock" :key="`bar-${id}`" class="grid grid-cols-[140px_1fr_80px] items-center gap-3">
                    <div class="text-xs text-gray-500 truncate font-mono">{{ id }}</div>
                    <div class="h-4 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700 relative">
                        <!-- Reserved portion (left, blue) -->
                        <div
                            class="absolute left-0 top-0 h-full rounded-l-full bg-info/70"
                            :style="{ width: allocationBarWidth(id, entry, 'reserved') + '%' }"
                        ></div>
                        <!-- Available portion (right of reserved, color-coded) -->
                        <div
                            class="absolute top-0 h-full"
                            :class="stockBarClass(id)"
                            :style="{ left: allocationBarWidth(id, entry, 'reserved') + '%', width: allocationBarWidth(id, entry, 'available') + '%' }"
                        ></div>
                    </div>
                    <div class="text-right text-xs">
                        <span class="text-success font-semibold">{{ entry.available }}</span>
                        <span class="text-gray-300 dark:text-gray-600 mx-0.5">/</span>
                        <span class="text-info">{{ entry.reserved }}</span>
                    </div>
                </div>
                <div v-if="stockEntries.length > 8" class="text-xs text-gray-400 text-right">แสดง 8 จาก {{ stockEntries.length }} รายการ</div>
            </div>
        </div>

        <!-- ── Inner Tabs ─────────────────────────────────────────────── -->
        <div class="mb-5">
            <ul class="flex border-b border-white-light dark:border-[#191e3a]">
                <li>
                    <button
                        class="border border-transparent px-5 py-2.5 -mb-[1px] font-semibold transition-colors"
                        :class="innerTab === 'stock' ? 'text-primary !border-white-light !border-b-white dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-500 hover:text-primary'"
                        @click="innerTab = 'stock'">
                        📦 สต็อกสินค้า
                    </button>
                </li>
                <li>
                    <button
                        class="border border-transparent px-5 py-2.5 -mb-[1px] font-semibold transition-colors"
                        :class="innerTab === 'log' ? 'text-primary !border-white-light !border-b-white dark:!border-[#191e3a] dark:!border-b-black' : 'text-gray-500 hover:text-primary'"
                        @click="innerTab = 'log'">
                        📋 ประวัติ Stock
                        <span class="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-white">{{ stockLog.length }}</span>
                    </button>
                </li>
            </ul>
        </div>

        <!-- ══ TAB: สต็อกสินค้า ════════════════════════════════════════ -->
        <div v-show="innerTab === 'stock'" class="panel">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">สต็อกสินค้า Gift Set 2026</h5>
                <div class="ltr:ml-auto rtl:mr-auto flex items-center gap-3 flex-wrap">
                    <!-- Status Filter pills -->
                    <div class="flex gap-1.5">
                        <button
                            v-for="f in statusFilters" :key="f.key"
                            class="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
                            :class="statusFilter === f.key ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary dark:border-gray-600'"
                            @click="statusFilter = f.key">
                            {{ f.label }} ({{ f.key === 'all' ? stockEntries.length : countByStatus(f.key as any) }})
                        </button>
                    </div>
                    <input v-model="search" type="text" class="form-input w-40" placeholder="ค้นหา..." />
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-24">รหัส</th>
                            <th>ชื่อสินค้า</th>
                            <th class="w-24 !text-center">ประเภท</th>
                            <!-- ชั้น 1 -->
                            <th class="w-44 !text-center">
                                <span class="inline-flex items-center gap-1">
                                    <span class="inline-block h-2 w-2 rounded-full bg-success"></span>
                                    ชั้น 1 · Available
                                </span>
                                <div class="text-xs font-normal opacity-70">เปิดรับจอง</div>
                            </th>
                            <!-- ชั้น 2 -->
                            <th class="w-36 !text-center">
                                <span class="inline-flex items-center gap-1">
                                    <span class="inline-block h-2 w-2 rounded-full bg-info"></span>
                                    ชั้น 2 · Reserved
                                </span>
                                <div class="text-xs font-normal opacity-70">จองแล้ว</div>
                            </th>
                            <!-- Total -->
                            <th class="w-24 !text-center">
                                รวม<div class="text-xs font-normal opacity-70">Total</div>
                            </th>
                            <th class="w-28 !text-center">สถานะ</th>
                            <th class="w-28 !text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="[id, entry] in filteredStock" :key="id">
                            <td class="font-mono text-xs text-primary font-medium">{{ id }}</td>
                            <td>
                                <div class="font-medium dark:text-white-dark">{{ entry.productNameEn }}</div>
                            </td>
                            <td class="!text-center">
                                <span class="badge text-xs" :class="typeBadgeClass(entry.type)">{{ typeLabel(entry.type) }}</span>
                            </td>

                            <!-- Available (ชั้น 1) -->
                            <td>
                                <div class="flex flex-col gap-1 px-1">
                                    <!-- Stacked bar -->
                                    <div class="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div class="h-full bg-info/60" :style="{ width: allocationBarWidth(id, entry, 'reserved') + '%' }"></div>
                                        <div class="h-full rounded-r-full" :class="stockBarClass(id)" :style="{ width: allocationBarWidth(id, entry, 'available') + '%' }"></div>
                                    </div>
                                    <div class="flex items-center justify-between text-xs">
                                        <span :class="stockQtyClass(id)" class="font-bold">{{ entry.available.toLocaleString() }} ชุด</span>
                                        <span class="text-gray-400">/ {{ entry.minWarning }} min</span>
                                    </div>
                                </div>
                            </td>

                            <!-- Reserved (ชั้น 2) -->
                            <td class="!text-center">
                                <span class="font-semibold text-info">{{ entry.reserved }}</span>
                                <span class="text-xs text-gray-400 ml-1">ชุด</span>
                                <div v-if="entry.reserved > 0" class="text-xs text-gray-400 mt-0.5">
                                    {{ Math.round((entry.reserved / (entry.available + entry.reserved)) * 100) }}% จอง
                                </div>
                            </td>

                            <!-- Total -->
                            <td class="!text-center">
                                <span class="font-medium text-gray-600 dark:text-gray-300">{{ (entry.available + entry.reserved).toLocaleString() }}</span>
                            </td>

                            <!-- Status -->
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap" :class="statusBadge(id)">{{ statusLabel(id) }}</span>
                            </td>

                            <!-- Action -->
                            <td class="!text-center">
                                <button class="btn btn-outline-primary px-3 py-1 text-xs" @click="openAdjust(id, entry)">ปรับ Stock</button>
                            </td>
                        </tr>
                        <tr v-if="filteredStock.length === 0">
                            <td colspan="8" class="!text-center py-10 text-gray-400">ไม่พบสินค้า</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Legend -->
            <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-info/60 inline-block"></span>ชั้น 2 Reserved — จองแล้วรอส่ง</span>
                <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-success inline-block"></span>ชั้น 1 Available — เปิดรับจองอยู่</span>
                <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-warning inline-block"></span>ชั้น 1 ใกล้หมด (≤ min warning)</span>
                <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-danger inline-block"></span>ชั้น 1 หมด — ปิดการสั่งซื้อ</span>
            </div>
        </div>

        <!-- ══ TAB: ประวัติ ════════════════════════════════════════════ -->
        <div v-show="innerTab === 'log'" class="panel">
            <div class="mb-5 flex items-center justify-between flex-wrap gap-3">
                <h5 class="text-lg font-semibold dark:text-white-light">ประวัติ Stock</h5>
                <div class="flex items-center gap-3">
                    <select v-model="logTypeFilter" class="form-select py-1.5 text-sm">
                        <option value="">ทุกประเภท</option>
                        <option value="add">+ รับเพิ่ม</option>
                        <option value="subtract">− ลด</option>
                        <option value="reserve">📦 จอง Order</option>
                        <option value="release">↩️ คืน Stock</option>
                    </select>
                    <span class="text-sm text-gray-400">{{ filteredLog.length }} รายการ</span>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-32 !text-center">วันที่</th>
                            <th>สินค้า</th>
                            <th class="w-36 !text-center">ประเภท</th>
                            <th class="w-24 !text-right">จำนวน</th>
                            <th>เหตุผล / Order</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="log in filteredLog" :key="log.id">
                            <td class="!text-center text-sm text-gray-500 dark:text-gray-400">{{ formatDate(log.adjustedAt) }}</td>
                            <td>
                                <div class="font-medium dark:text-white-dark">{{ log.productName }}</div>
                                <div class="text-xs text-gray-400 font-mono">{{ log.productId }}</div>
                            </td>
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap text-xs" :class="logBadgeClass(log.type)">
                                    {{ logTypeLabel(log.type) }}
                                </span>
                            </td>
                            <td class="!text-right font-semibold" :class="logQtyClass(log.type)">
                                {{ logQtySign(log.type) }}{{ log.qty }}
                            </td>
                            <td class="text-sm text-gray-600 dark:text-gray-300">
                                {{ log.reason }}
                                <span v-if="log.orderNo" class="ml-1 font-mono text-xs text-primary">{{ log.orderNo }}</span>
                            </td>
                        </tr>
                        <tr v-if="filteredLog.length === 0">
                            <td colspan="5" class="!text-center py-10 text-gray-400">ไม่พบรายการ</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ══ Adjust Stock Modal ══════════════════════════════════════ -->
        <transition name="fade">
            <div v-if="adjustModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeAdjust">
                <div class="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b]">
                    <div class="border-b border-gray-200 p-5 dark:border-[#2d3e5c]">
                        <h4 class="font-bold dark:text-white">ปรับ Stock — ชั้น 1 (Available)</h4>
                        <p class="text-sm text-gray-400 mt-0.5">{{ adjustModal.productNameEn }}</p>
                        <div class="mt-3 grid grid-cols-3 gap-3 text-center">
                            <div class="rounded-lg bg-success/10 p-2">
                                <div class="text-xs text-gray-400">Available (ชั้น 1)</div>
                                <div class="text-lg font-bold text-success">{{ adjustModal.available }}</div>
                            </div>
                            <div class="rounded-lg bg-info/10 p-2">
                                <div class="text-xs text-gray-400">Reserved (ชั้น 2)</div>
                                <div class="text-lg font-bold text-info">{{ adjustModal.reserved }}</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 dark:bg-[#243150] p-2">
                                <div class="text-xs text-gray-400">รวม</div>
                                <div class="text-lg font-bold dark:text-white">{{ adjustModal.available + adjustModal.reserved }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4 p-5">
                        <div>
                            <label class="mb-2 block text-sm font-medium dark:text-white-light">ประเภทการปรับ (เฉพาะ ชั้น 1 Available)</label>
                            <div class="flex gap-3">
                                <label class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors"
                                    :class="adjustForm.direction === 'add' ? 'border-success bg-success/10 text-success' : 'border-gray-200 text-gray-400 dark:border-gray-600'">
                                    <input v-model="adjustForm.direction" type="radio" value="add" class="sr-only" />
                                    <span class="text-xl">📥</span><span class="font-semibold">เพิ่ม Available</span>
                                </label>
                                <label class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-3 transition-colors"
                                    :class="adjustForm.direction === 'subtract' ? 'border-danger bg-danger/10 text-danger' : 'border-gray-200 text-gray-400 dark:border-gray-600'">
                                    <input v-model="adjustForm.direction" type="radio" value="subtract" class="sr-only" />
                                    <span class="text-xl">📤</span><span class="font-semibold">ลด Available</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">จำนวน (ชุด) <span class="text-danger">*</span></label>
                            <input v-model.number="adjustForm.qty" type="number" min="1" class="form-input w-full" placeholder="ระบุจำนวน..." />
                            <p v-if="adjustForm.direction === 'subtract' && adjustForm.qty > adjustModal.available" class="mt-1 text-xs text-danger">
                                ⚠️ จำนวนที่ลดมากกว่า Available คงเหลือ ({{ adjustModal.available }} ชุด)
                            </p>
                        </div>

                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">เหตุผล <span class="text-danger">*</span></label>
                            <select v-model="adjustForm.reasonPreset" class="form-select w-full mb-2" @change="onReasonPreset">
                                <option value="">-- เลือกเหตุผล --</option>
                                <optgroup v-if="adjustForm.direction === 'add'" label="เพิ่ม Stock">
                                    <option value="รับสินค้าใหม่จาก Supplier">รับสินค้าใหม่จาก Supplier</option>
                                    <option value="ปรับปรุงบัญชีสต็อก (Stock Count)">ปรับปรุงบัญชีสต็อก (Stock Count)</option>
                                    <option value="คืนสินค้าจากลูกค้า">คืนสินค้าจากลูกค้า</option>
                                    <option value="เปิด Allocation เพิ่มเติม">เปิด Allocation เพิ่มเติม</option>
                                    <option value="other">อื่นๆ (ระบุเอง)</option>
                                </optgroup>
                                <optgroup v-if="adjustForm.direction === 'subtract'" label="ลด Stock">
                                    <option value="สินค้าเสียหาย/สูญหาย">สินค้าเสียหาย/สูญหาย</option>
                                    <option value="ปิด Allocation บางส่วน">ปิด Allocation บางส่วน</option>
                                    <option value="ปรับปรุงบัญชีสต็อก (Stock Count)">ปรับปรุงบัญชีสต็อก (Stock Count)</option>
                                    <option value="สินค้าหมดอายุ">สินค้าหมดอายุ</option>
                                    <option value="other">อื่นๆ (ระบุเอง)</option>
                                </optgroup>
                            </select>
                            <input v-if="adjustForm.reasonPreset === 'other' || !adjustForm.reasonPreset"
                                v-model="adjustForm.reasonText" type="text" class="form-input w-full" placeholder="ระบุเหตุผล..." />
                        </div>

                        <!-- Preview -->
                        <div v-if="adjustForm.qty > 0" class="rounded-lg p-3 text-sm border"
                            :class="adjustForm.direction === 'add' ? 'border-success bg-success/10 text-success' : 'border-danger bg-danger/10 text-danger'">
                            <div class="flex justify-between">
                                <span>Available หลังปรับ:</span>
                                <span class="font-bold">
                                    {{ adjustForm.direction === 'add'
                                        ? adjustModal.available + adjustForm.qty
                                        : Math.max(0, adjustModal.available - adjustForm.qty) }} ชุด
                                    <span class="opacity-70 font-normal">({{ adjustForm.direction === 'add' ? '+' : '−' }}{{ adjustForm.qty }})</span>
                                </span>
                            </div>
                            <div class="mt-1 flex justify-between text-gray-500 dark:text-gray-400">
                                <span>Reserved (ไม่เปลี่ยน):</span>
                                <span>{{ adjustModal.reserved }} ชุด</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <button class="btn btn-outline-secondary" @click="closeAdjust">ยกเลิก</button>
                        <button class="btn px-6" :class="adjustForm.direction === 'add' ? 'btn-success' : 'btn-danger'"
                            :disabled="!canSaveAdjust" @click="saveAdjust">
                            {{ adjustForm.direction === 'add' ? '+ เพิ่ม Available' : '− ลด Available' }}
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';
    import type { StockEntry, StockLogType } from '~/composables/useOrStock';

    useHead({ title: 'Stock Management | จัดการ Stock' });

    const { stock, stockLog, getStatus, adjustStock } = useOrStock();

    const innerTab = ref<'stock' | 'log'>('stock');
    const statusFilter = ref('all');
    const search = ref('');
    const logTypeFilter = ref('');

    const statusFilters = [
        { key: 'all', label: 'ทั้งหมด' },
        { key: 'ok', label: 'พร้อมจอง' },
        { key: 'low', label: 'ใกล้หมด' },
        { key: 'out', label: 'หมดสต็อก' },
    ];

    const stockEntries = computed(() => Object.entries(stock.value));
    const countByStatus = (status: 'ok' | 'low' | 'out') => stockEntries.value.filter(([id]) => getStatus(id) === status).length;
    const totalAvailable = computed(() => stockEntries.value.reduce((s, [, e]) => s + e.available, 0));
    const totalReserved  = computed(() => stockEntries.value.reduce((s, [, e]) => s + e.reserved,  0));

    const filteredStock = computed(() => {
        let list = stockEntries.value;
        if (statusFilter.value !== 'all') list = list.filter(([id]) => getStatus(id) === statusFilter.value);
        if (search.value) {
            const q = search.value.toLowerCase();
            list = list.filter(([id, e]) => id.toLowerCase().includes(q) || e.productNameEn.toLowerCase().includes(q));
        }
        return list;
    });

    // Top 8 for overview bar (sorted by total desc)
    const topAllocatedStock = computed(() =>
        [...stockEntries.value].sort((a, b) => (b[1].available + b[1].reserved) - (a[1].available + a[1].reserved)).slice(0, 8)
    );

    const filteredLog = computed(() => {
        if (!logTypeFilter.value) return stockLog.value;
        return stockLog.value.filter(l => l.type === logTypeFilter.value);
    });

    // ── Display Helpers ────────────────────────────────────────────
    const typeLabel     = (t: string) => ({ 'gift-set': 'Gift Set', premium: 'Premium', capsule: 'Capsule', tumbler: 'Tumbler', machine: 'เครื่องชง' } as any)[t] ?? t;
    const typeBadgeClass = (t: string) => ({ 'gift-set': 'badge-outline-primary', premium: 'badge-outline-secondary', capsule: 'badge-outline-info', tumbler: 'badge-outline-success', machine: 'badge-outline-warning' } as any)[t] ?? '';
    const statusLabel   = (id: string) => ({ ok: 'พร้อมจอง', low: 'ใกล้หมด', out: 'หมดสต็อก' }[getStatus(id)]);
    const statusBadge   = (id: string) => ({ ok: 'badge-outline-success', low: 'badge-outline-warning', out: 'badge-outline-danger' }[getStatus(id)]);
    const stockQtyClass = (id: string) => ({ ok: 'text-success', low: 'text-warning', out: 'text-danger' }[getStatus(id)]);
    const stockBarClass = (id: string) => ({ ok: 'bg-success', low: 'bg-warning', out: 'bg-danger' }[getStatus(id)]);

    // Stacked bar: shows reserved (left, blue) + available (right, status-color) out of total
    const allocationBarWidth = (id: string, entry: StockEntry, layer: 'reserved' | 'available') => {
        const total = entry.available + entry.reserved;
        const ref = Math.max(total, entry.minWarning * 5, 1);
        return layer === 'reserved' ? Math.min(100, Math.round((entry.reserved / ref) * 100)) : Math.min(100, Math.round((entry.available / ref) * 100));
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    // Log helpers
    const logTypeLabel = (t: StockLogType) => ({
        add: '+ รับเพิ่ม', subtract: '− ลด', reserve: '📦 จอง Order', release: '↩️ คืน Stock', adjust_reserve: '✏️ ปรับจำนวน',
    }[t] ?? t);
    const logBadgeClass = (t: StockLogType) => ({
        add: 'badge-outline-success', subtract: 'badge-outline-danger', reserve: 'badge-outline-info',
        release: 'badge-outline-warning', adjust_reserve: 'badge-outline-secondary',
    }[t] ?? '');
    const logQtyClass = (t: StockLogType) => (t === 'add' || t === 'release') ? 'text-success' : 'text-danger';
    const logQtySign  = (t: StockLogType) => (t === 'add' || t === 'release') ? '+' : '−';

    // ── Adjust Modal ───────────────────────────────────────────────
    const adjustModal = ref<{ id: string; productNameEn: string; available: number; reserved: number } | null>(null);
    const adjustForm  = ref({ direction: 'add' as 'add' | 'subtract', qty: 0, reasonPreset: '', reasonText: '' });

    const openAdjust = (id: string, entry: StockEntry) => {
        adjustModal.value = { id, productNameEn: entry.productNameEn, available: entry.available, reserved: entry.reserved };
        adjustForm.value  = { direction: 'add', qty: 0, reasonPreset: '', reasonText: '' };
    };
    const closeAdjust = () => { adjustModal.value = null; };
    const onReasonPreset = () => { if (adjustForm.value.reasonPreset !== 'other') adjustForm.value.reasonText = ''; };

    const canSaveAdjust = computed(() => {
        const { qty, reasonPreset, reasonText, direction } = adjustForm.value;
        const hasReason = (reasonPreset && reasonPreset !== 'other') ? true : !!reasonText.trim();
        const validQty  = qty > 0;
        const notOverStock = direction === 'subtract' ? qty <= (adjustModal.value?.available ?? 0) : true;
        return hasReason && validQty && notOverStock;
    });

    const saveAdjust = () => {
        if (!adjustModal.value || !canSaveAdjust.value) return;
        const reason = (adjustForm.value.reasonPreset && adjustForm.value.reasonPreset !== 'other')
            ? adjustForm.value.reasonPreset : adjustForm.value.reasonText;
        const delta = adjustForm.value.direction === 'add' ? adjustForm.value.qty : -adjustForm.value.qty;
        adjustStock(adjustModal.value.id, delta, reason);
        closeAdjust();
        innerTab.value = 'log';
    };
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.97); }
</style>
