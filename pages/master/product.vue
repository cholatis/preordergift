<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Master</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>สินค้า / Product</span></li>
        </ul>

        <!-- Category Filter Tabs -->
        <div class="mb-5 overflow-x-auto">
            <ul class="flex flex-nowrap border-b border-white-light dark:border-[#191e3a] min-w-max">
                <li v-for="tab in tabs" :key="tab.key">
                    <button
                        class="flex items-center gap-2 border border-transparent px-4 py-2.5 -mb-[1px] font-semibold transition-colors"
                        :class="
                            activeTab === tab.key
                                ? 'text-primary !border-white-light !border-b-white dark:!border-[#191e3a] dark:!border-b-black'
                                : 'text-gray-500 hover:text-primary dark:text-gray-400'
                        "
                        @click="activeTab = tab.key"
                    >
                        {{ tab.label }}
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

        <!-- Product Table -->
        <div class="panel">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">
                    รายการสินค้า Gift Set 2026
                    <span class="ml-2 text-sm font-normal text-gray-400">Café Amazon</span>
                </h5>
                <div class="ltr:ml-auto rtl:mr-auto">
                    <input v-model="search" type="text" class="form-input w-auto" placeholder="ค้นหา รหัส / ชื่อสินค้า..." />
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-16 !text-center">รูปภาพ<br /><span class="text-xs font-normal opacity-70">Image</span></th>
                            <th class="w-24">รหัสสินค้า<br /><span class="text-xs font-normal opacity-70">Product code</span></th>
                            <th>ชื่อสินค้า / รายละเอียด<br /><span class="text-xs font-normal opacity-70">Product name</span></th>
                            <th class="w-28 !text-center">หมวดหมู่<br /><span class="text-xs font-normal opacity-70">Category</span></th>
                            <th class="w-20 !text-center">ชิ้น/ชุด<br /><span class="text-xs font-normal opacity-70">Qty / unit</span></th>
                            <th class="w-32 !text-right">ราคา (incl.VAT)<br /><span class="text-xs font-normal opacity-70">฿ / unit</span></th>
                            <th class="w-24 !text-center">MOQ<br /><span class="text-xs font-normal opacity-70">ขั้นต่ำ</span></th>
                            <th class="w-32 !text-center">จำกัด/Order<br /><span class="text-xs font-normal opacity-70">ต่อลูกค้า</span></th>
                            <th class="w-40 !text-center">Campaign Period<br /><span class="text-xs font-normal opacity-70">ช่วงเวลาขาย</span></th>
                            <th class="w-28 !text-center">สถานะสินค้า<br /><span class="text-xs font-normal opacity-70">Status</span></th>
                            <th class="w-28 !text-center">จัดการ<br /><span class="text-xs font-normal opacity-70">Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in filteredProducts" :key="item.id">
                            <!-- Image -->
                            <td class="!text-center">
                                <div class="mx-auto flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white-light dark:bg-[#1a2941]">
                                    <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.nameEn" class="h-full w-full object-cover" />
                                    <span v-else class="text-xl">{{ categoryEmoji(item.category) }}</span>
                                </div>
                            </td>

                            <!-- Code -->
                            <td class="font-mono text-sm font-semibold text-primary">{{ item.id }}</td>

                            <!-- Name + Description -->
                            <td>
                                <div class="font-medium dark:text-white-dark">{{ item.nameEn }}</div>
                                <div class="mt-0.5 text-xs text-gray-400">{{ item.nameTh }}</div>
                                <div v-if="item.description" class="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</div>
                                <div v-if="item.expiryNote" class="mt-1 text-xs text-amber-500">⚠️ {{ item.expiryNote }}</div>
                            </td>

                            <!-- Category -->
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap" :class="categoryBadgeClass(item.category)">
                                    {{ categoryLabel(item.category) }}
                                </span>
                            </td>

                            <!-- Qty per unit -->
                            <td class="!text-center text-gray-600 dark:text-gray-300">{{ item.qtyPerCarton }} ชิ้น</td>

                            <!-- Price -->
                            <td class="!text-right font-semibold text-primary">
                                {{ item.priceInVat.toLocaleString('th-TH') }} ฿
                                <div class="text-[10px] font-normal text-gray-400">
                                    excl. {{ item.priceExVat.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} ฿
                                </div>
                            </td>

                            <!-- MOQ -->
                            <td class="!text-center">
                                <span class="font-semibold text-gray-700 dark:text-gray-200">{{ item.moq }}</span>
                                <div class="text-[10px] text-gray-400">ชุดขั้นต่ำ</div>
                            </td>

                            <!-- Order / Customer Limit -->
                            <td class="!text-center text-sm">
                                <div class="text-gray-600 dark:text-gray-300">
                                    <span class="font-medium">{{ item.orderLimit ?? '—' }}</span>
                                    <span class="text-[10px] text-gray-400 block">ต่อ Order</span>
                                </div>
                                <div class="mt-0.5 text-gray-600 dark:text-gray-300">
                                    <span class="font-medium">{{ item.customerLimit ?? '—' }}</span>
                                    <span class="text-[10px] text-gray-400 block">ต่อลูกค้า</span>
                                </div>
                            </td>

                            <!-- Campaign Period -->
                            <td class="!text-center">
                                <template v-if="item.campaignStart && item.campaignEnd">
                                    <div class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.campaignStart) }}</div>
                                    <div class="text-[10px] text-gray-400">ถึง</div>
                                    <div class="text-xs font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.campaignEnd) }}</div>
                                </template>
                                <span v-else class="text-xs italic text-gray-400">ยังไม่กำหนด</span>
                            </td>

                            <!-- Status (4 states) -->
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap" :class="productStatusBadge(item)">
                                    {{ productStatusLabel(item) }}
                                </span>
                                <div class="mt-1 text-[10px] text-gray-400">Stock: {{ getStock(item.id).qty }} ชุด</div>
                            </td>

                            <!-- Actions -->
                            <td class="!text-center">
                                <div class="flex flex-col items-center gap-1.5">
                                    <button class="btn btn-outline-primary px-2 py-1 text-xs w-full" @click="openViewModal(item)">
                                        ดูรายละเอียด
                                    </button>
                                    <button class="btn btn-outline-warning px-2 py-1 text-xs w-full" @click="openSettingModal(item)">
                                        ตั้งค่า
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <tr v-if="filteredProducts.length === 0">
                            <td colspan="11" class="!text-center py-10 text-gray-400">ไม่พบสินค้า</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ===================== View Detail Modal ===================== -->
        <transition name="fade">
            <div v-if="viewModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="viewModal = null">
                <div class="w-full max-w-xl rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b] max-h-[90vh] flex flex-col">
                    <!-- Header -->
                    <div class="flex items-start justify-between border-b border-gray-200 p-5 dark:border-[#2d3e5c] shrink-0">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-sm text-gray-400">{{ viewModal.id }}</span>
                                <span class="badge text-xs" :class="categoryBadgeClass(viewModal.category)">{{ categoryLabel(viewModal.category) }}</span>
                            </div>
                            <h4 class="mt-1 text-lg font-bold dark:text-white">{{ viewModal.nameEn }}</h4>
                            <p class="mt-0.5 text-sm text-gray-400">{{ viewModal.nameTh }}</p>
                        </div>
                        <button class="ml-4 text-xl leading-none text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" @click="viewModal = null">✕</button>
                    </div>

                    <!-- Body -->
                    <div class="overflow-y-auto p-5 space-y-4">
                        <!-- Description -->
                        <div v-if="viewModal.description" class="rounded-lg bg-gray-50 p-3 dark:bg-[#243150]">
                            <div class="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">รายละเอียดสินค้า</div>
                            <p class="text-sm text-gray-700 dark:text-gray-200">{{ viewModal.description }}</p>
                        </div>

                        <!-- Price + Qty grid -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="rounded-lg bg-blue-50 p-3 dark:bg-[#1a2941]">
                                <div class="text-xs text-gray-400 mb-1">ราคา/ชุด (incl. VAT)</div>
                                <div class="text-2xl font-bold text-primary">{{ viewModal.priceInVat.toLocaleString() }} ฿</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 p-3 dark:bg-[#243150]">
                                <div class="text-xs text-gray-400 mb-1">ราคา/ชุด (excl. VAT)</div>
                                <div class="text-lg font-semibold dark:text-white-dark">{{ viewModal.priceExVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 p-3 dark:bg-[#243150]">
                                <div class="text-xs text-gray-400 mb-1">จำนวนชิ้นต่อชุด</div>
                                <div class="font-semibold dark:text-white-dark">{{ viewModal.qtyPerCarton }} ชิ้น</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 p-3 dark:bg-[#243150]">
                                <div class="text-xs text-gray-400 mb-1">ราคา/ลัง (incl. VAT)</div>
                                <div class="font-semibold dark:text-white-dark">{{ viewModal.priceCartonInVat.toLocaleString() }} ฿</div>
                            </div>
                        </div>

                        <!-- MOQ + Limits -->
                        <div class="grid grid-cols-3 gap-3">
                            <div class="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center">
                                <div class="text-xs text-gray-400 mb-1">MOQ / ขั้นต่ำ</div>
                                <div class="text-xl font-bold text-primary">{{ viewModal.moq }}</div>
                                <div class="text-[10px] text-gray-400">ชุด</div>
                            </div>
                            <div class="rounded-lg border border-gray-200 p-3 text-center dark:border-[#2d3e5c]">
                                <div class="text-xs text-gray-400 mb-1">จำกัดต่อ Order</div>
                                <div class="text-xl font-bold dark:text-white-dark">{{ viewModal.orderLimit ?? '∞' }}</div>
                                <div class="text-[10px] text-gray-400">ชุด</div>
                            </div>
                            <div class="rounded-lg border border-gray-200 p-3 text-center dark:border-[#2d3e5c]">
                                <div class="text-xs text-gray-400 mb-1">จำกัดต่อลูกค้า</div>
                                <div class="text-xl font-bold dark:text-white-dark">{{ viewModal.customerLimit ?? '∞' }}</div>
                                <div class="text-[10px] text-gray-400">ชุด</div>
                            </div>
                        </div>

                        <!-- Contents -->
                        <div>
                            <div class="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">ประกอบด้วย</div>
                            <ul class="space-y-1.5">
                                <li v-for="(c, i) in viewModal.contents" :key="i" class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span class="mt-0.5 font-bold text-primary">{{ i + 1 }}.</span>
                                    <span>{{ c }}</span>
                                </li>
                            </ul>
                        </div>

                        <!-- Expiry -->
                        <div v-if="viewModal.expiryNote" class="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                            ⚠️ {{ viewModal.expiryNote }}
                        </div>

                        <!-- Campaign + Status -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                                <div class="mb-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">Campaign Period</div>
                                <div v-if="viewModal.campaignStart && viewModal.campaignEnd" class="text-sm text-indigo-700 dark:text-indigo-200">
                                    {{ formatDate(viewModal.campaignStart) }}<br />— {{ formatDate(viewModal.campaignEnd) }}
                                </div>
                                <div v-else class="text-sm italic text-indigo-400">ยังไม่กำหนด</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 p-3 dark:bg-[#243150]">
                                <div class="mb-1 text-xs font-semibold text-gray-500">สถานะสินค้า</div>
                                <span class="badge" :class="productStatusBadge(viewModal)">{{ productStatusLabel(viewModal) }}</span>
                                <div class="mt-2 text-xs text-gray-400">Stock คงเหลือ: {{ getStock(viewModal.id).qty }} ชุด</div>
                            </div>
                        </div>
                    </div>

                    <div class="shrink-0 border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c] flex justify-end">
                        <button class="btn btn-outline-primary px-6" @click="viewModal = null">ปิด</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ===================== ตั้งค่าสินค้า Modal ===================== -->
        <transition name="fade">
            <div v-if="settingModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeSettingModal">
                <div class="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b] max-h-[90vh] flex flex-col">
                    <!-- Header -->
                    <div class="border-b border-gray-200 p-5 dark:border-[#2d3e5c] shrink-0">
                        <h4 class="font-bold dark:text-white">ตั้งค่าสินค้า</h4>
                        <p class="mt-1 text-sm text-gray-400">{{ settingModal.id }} — {{ settingModal.nameEn }}</p>
                    </div>

                    <!-- Body -->
                    <div class="overflow-y-auto p-5 space-y-5">

                        <!-- หมวดหมู่ -->
                        <div>
                            <label class="mb-2 block text-sm font-medium dark:text-white-light">หมวดหมู่สินค้า <span class="text-danger">*</span></label>
                            <div class="grid grid-cols-2 gap-2">
                                <label
                                    v-for="cat in categoryOptions"
                                    :key="cat.key"
                                    class="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors"
                                    :class="settingForm.category === cat.key ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-[#2d3e5c] hover:border-primary/50'"
                                >
                                    <input type="radio" :value="cat.key" v-model="settingForm.category" class="form-radio text-primary" />
                                    <span class="text-sm font-medium dark:text-white-dark">{{ cat.label }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">รายละเอียดสินค้า</label>
                            <textarea
                                v-model="settingForm.description"
                                rows="3"
                                class="form-textarea w-full resize-none"
                                placeholder="อธิบายรายละเอียดสินค้า..."
                            ></textarea>
                        </div>

                        <!-- MOQ + Limits -->
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="mb-1.5 block text-xs font-medium dark:text-white-light">MOQ / ขั้นต่ำ <span class="text-danger">*</span></label>
                                <input v-model.number="settingForm.moq" type="number" min="1" class="form-input w-full text-center" />
                                <div class="mt-0.5 text-[10px] text-gray-400 text-center">ชุด/Order</div>
                            </div>
                            <div>
                                <label class="mb-1.5 block text-xs font-medium dark:text-white-light">จำกัดต่อ Order</label>
                                <input v-model.number="settingForm.orderLimit" type="number" min="1" class="form-input w-full text-center" placeholder="—" />
                                <div class="mt-0.5 text-[10px] text-gray-400 text-center">ว่าง = ไม่จำกัด</div>
                            </div>
                            <div>
                                <label class="mb-1.5 block text-xs font-medium dark:text-white-light">จำกัดต่อลูกค้า</label>
                                <input v-model.number="settingForm.customerLimit" type="number" min="1" class="form-input w-full text-center" placeholder="—" />
                                <div class="mt-0.5 text-[10px] text-gray-400 text-center">ว่าง = ไม่จำกัด</div>
                            </div>
                        </div>

                        <!-- Campaign Period -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">วันเริ่มต้น Campaign</label>
                                <input v-model="settingForm.campaignStart" type="date" class="form-input w-full" :max="settingForm.campaignEnd || undefined" />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">วันสิ้นสุด Campaign</label>
                                <input v-model="settingForm.campaignEnd" type="date" class="form-input w-full" :min="settingForm.campaignStart || undefined" />
                            </div>
                        </div>

                        <!-- Campaign preview -->
                        <div v-if="settingForm.campaignStart && settingForm.campaignEnd" class="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary dark:bg-primary/10">
                            Campaign: {{ formatDate(settingForm.campaignStart) }} — {{ formatDate(settingForm.campaignEnd) }}
                            <span class="ml-2 text-gray-400">({{ campaignDays }} วัน)</span>
                        </div>

                        <!-- สถานะ เปิด/ปิดขาย -->
                        <div class="rounded-lg bg-gray-50 p-4 dark:bg-[#243150]">
                            <label class="flex cursor-pointer items-center gap-3">
                                <input v-model="settingForm.isActive" type="checkbox" class="form-checkbox text-success h-5 w-5" />
                                <div>
                                    <span class="font-medium dark:text-white-dark">เปิดขาย (Active)</span>
                                    <p class="text-xs text-gray-400 mt-0.5">ลูกค้า B2B จะมองเห็นและสั่งซื้อสินค้านี้ได้</p>
                                </div>
                            </label>
                            <div class="mt-3 flex items-center gap-2">
                                <span class="text-xs text-gray-500">สถานะปัจจุบัน:</span>
                                <span class="badge text-xs" :class="previewStatusBadge">{{ previewStatusLabel }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="shrink-0 flex justify-end gap-3 border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <button class="btn btn-outline-danger" @click="closeSettingModal">ยกเลิก</button>
                        <button class="btn btn-primary" @click="saveSetting">บันทึก</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';

    useHead({ title: 'Master | สินค้า / Product' });

    const { getStock, getStatus } = useOrStock();

    type ProductCategory = 'gift-set' | 'premium' | 'home-used' | 'add-on';
    type ProductType = 'gift-set' | 'premium' | 'capsule' | 'tumbler' | 'machine';

    interface Product {
        id: string;
        nameEn: string;
        nameTh: string;
        description: string;
        category: ProductCategory;
        type: ProductType;
        priceInVat: number;
        priceExVat: number;
        priceCartonInVat: number;
        qtyPerCarton: number;
        moq: number;
        orderLimit: number | null;
        customerLimit: number | null;
        contents: string[];
        expiryNote: string;
        imageUrl: string;
        campaignStart: string | null;
        campaignEnd: string | null;
        isActive: boolean;
    }

    // ── Category options ──────────────────────────────────────────────
    const categoryOptions = [
        { key: 'gift-set' as ProductCategory, label: 'Gift Set' },
        { key: 'premium' as ProductCategory, label: 'Premium' },
        { key: 'home-used' as ProductCategory, label: 'Home used' },
        { key: 'add-on' as ProductCategory, label: 'Add on' },
    ];

    const tabs = [
        { key: 'all', label: 'ทั้งหมด' },
        { key: 'gift-set', label: 'Gift Set' },
        { key: 'premium', label: 'Premium' },
        { key: 'home-used', label: 'Home used' },
        { key: 'add-on', label: 'Add on' },
    ] as const;

    const activeTab = ref<string>('all');
    const search = ref('');

    // ── Mock data ─────────────────────────────────────────────────────
    const products = ref<Product[]>([
        {
            id: 'GS-01', nameEn: 'SIGNATURE BREW GIFT SET', nameTh: 'ของขวัญแทนใจ สำหรับคนรักกาแฟไทยจาก 4 แหล่งปลูก',
            description: 'เซตกาแฟดริปพรีเมียมจาก 4 แหล่งปลูกชื่อดังในไทย พร้อมแก้วสเตนเลส 22 oz เหมาะสำหรับมอบเป็นของขวัญในโอกาสพิเศษ',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 699, priceExVat: 653.27, priceCartonInVat: 4194, qtyPerCarton: 6,
            moq: 6, orderLimit: null, customerLimit: null,
            contents: ['กาแฟดริป ปางขอน 1 กล่อง', 'กาแฟดริป อินทนนท์ 1 กล่อง', 'กาแฟดริป ผาลั้ง 1 กล่อง', 'กาแฟดริป เชียงใหม่ ฮันนีโปรเซส 1 กล่อง', 'แก้วสเตนเลสเก็บความเย็น (22 ออนซ์) 1 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกรกฎาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-02', nameEn: 'TEA OF JOY GIFT SET', nameTh: 'เติมเต็มช่วงเวลาดีๆ ด้วยชาไทยและชาเขียว 2 รสชาติ',
            description: 'เซตชาพรีเมียม 2 รสชาติ ชาเขียวและชาไทย พร้อมแก้วสเตนเลส 16 oz ดีไซน์สวยงาม',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 479, priceExVat: 447.66, priceCartonInVat: 1916, qtyPerCarton: 4,
            moq: 4, orderLimit: null, customerLimit: null,
            contents: ['ชาเขียวนมปรุงสาเร็จ 1 กล่อง', 'ชาไทยนมปรุงสาเร็จ 1 กล่อง', 'แก้วสเตนเลสเก็บความเย็น (16 ออนซ์) 1 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนสิงหาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-03', nameEn: 'GREEN TEA JUMBO GIFT SET', nameTh: 'สายชาเขียวนมตัวจริง พร้อมแก้วสเตนเลส 30 oz จุใจ',
            description: 'สำหรับสายชาเขียวนมตัวจริง บรรจุชาเขียวนม 4 กล่องพร้อมแก้วสเตนเลส 30 oz และกระเป๋าผ้า',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 749, priceExVat: 700, priceCartonInVat: 4494, qtyPerCarton: 6,
            moq: 6, orderLimit: null, customerLimit: null,
            contents: ['ชาเขียวนมปรุงสาเร็จ 4 กล่อง', 'แก้วสเตนเลสเก็บความเย็น (30 ออนซ์) 1 ใบ', 'กระเป๋าผ้าไนล่อน 1 ใบ (55x44.5x15 ซม.)'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนสิงหาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-04', nameEn: 'COFFEE TO GO GIFT SET', nameTh: 'เติมเต็มทุกการเดินทางด้วยกาแฟพร้อมดื่มและกระเป๋าสุดเก๋',
            description: 'เซตสำหรับคนรักการเดินทาง กาแฟพร้อมดื่ม 5 ขวดพร้อมกระเป๋าผ้าสุดเก๋',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 349, priceExVat: 326.17, priceCartonInVat: 2094, qtyPerCarton: 6,
            moq: 6, orderLimit: null, customerLimit: null,
            contents: ['กระเป๋าผ้าไนล่อน 1 ใบ (15x19x15 ซม.)', 'กาแฟพร้อมดื่ม Café Amazon 5 ขวด'],
            expiryNote: 'สินค้าภายในกระเป๋าหมดอายุเดือนตุลาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-05', nameEn: 'SENCHA MOMENT GIFT SET', nameTh: 'ดื่มด่ำช่วงเวลาสุดพิเศษกับ Matcha Latte Set ทำเองที่บ้าน',
            description: 'เซตชงมัทฉะที่บ้าน พร้อมถ้วยชงชา แท่นวาง และแปรงชงชา สำหรับประสบการณ์ชาแบบญี่ปุ่น',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 449, priceExVat: 419.63, priceCartonInVat: 1796, qtyPerCarton: 4,
            moq: 4, orderLimit: null, customerLimit: null,
            contents: ['มัทฉะลาเต้ปรุงสาเร็จ 1 กล่อง', 'ถ้วยชงชามัทฉะ 1 ใบ', 'แท่นวางแปรงชงชา 1 ใบ', 'แปรงชงชา 1 ชิ้น'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนสิงหาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-06', nameEn: 'SILVER & STELLAR DRIP COFFEE GIFT SET', nameTh: 'มอบกาแฟดริปพรีเมียม พร้อมสไตล์ล้ำยุค',
            description: 'กาแฟดริป 7 รสชาติสุดพรีเมียมในกล่องสวยงาม พร้อมแก้วสเตนเลส LocknLock และกระเป๋า',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 699, priceExVat: 653.27, priceCartonInVat: 2796, qtyPerCarton: 4,
            moq: 4, orderLimit: null, customerLimit: null,
            contents: ['กาแฟดริป 7 ซอง (7 รสชาติ)', 'แก้วสเตนเลส 460 ml LocknLock 1 ใบ', 'กระเป๋า 1 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกันยายน 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'GS-07', nameEn: 'RHYTHM OF CAPSULE GIFT SET', nameTh: 'ปลุกประสาทสัมผัสด้วยกาแฟแคปซูล 4 รสชาติสุดพรีเมียม',
            description: 'เซตกาแฟแคปซูล 4 รสชาติสุดพรีเมียม พร้อมถ้วยสเตนเลส 2 ขนาด สำหรับนักชิมกาแฟ',
            category: 'gift-set', type: 'gift-set',
            priceInVat: 1279, priceExVat: 1195.33, priceCartonInVat: 5116, qtyPerCarton: 4,
            moq: 4, orderLimit: null, customerLimit: null,
            contents: ['กาแฟแคปซูล ซิกเนเจอร์ 1 กล่อง', 'กาแฟแคปซูล ช็อกโกแลตฟัดจ์ 1 กล่อง', 'กาแฟแคปซูล คาราเมลสเวิร์ล 1 กล่อง', 'กาแฟแคปซูล วานิลลา ครีม 1 กล่อง', 'ถ้วยสเตนเลส 70 ml 2 ใบ', 'ถ้วยสเตนเลส 140 ml 2 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนสิงหาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'PM-01', nameEn: 'MORNING DRIP BOX SET', nameTh: 'เติมความสุขทุกเช้าด้วยกาแฟดริปพรีเมียม + แก้วเซรามิก',
            description: 'กาแฟดริปพรีเมียม 2 รสชาติพร้อมแก้วเซรามิก NYYY Design และกาดริป สำหรับประสบการณ์ดริปแบบ Pro',
            category: 'premium', type: 'premium',
            priceInVat: 630, priceExVat: 588.79, priceCartonInVat: 2520, qtyPerCarton: 4,
            moq: 4, orderLimit: null, customerLimit: null,
            contents: ['กาแฟดริป Signature 1 กล่อง', 'กาแฟดริป เชียงใหม่ ฮันนีโปรเซส 1 กล่อง', 'แก้วเซรามิก NYYY Design 1 ใบ', 'กาดริป 1 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกรกฎาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'PM-02', nameEn: 'TEA MOMENT BOX SET', nameTh: 'มอบช่วงเวลาสุดพิเศษให้ทุกการดื่มชา',
            description: 'เซตชาคุณภาพพรีเมียม ชาเขียวและชาไทยนม พร้อมแก้วใสสวมปลอกซิลิโคน ดีไซน์หรูหรา',
            category: 'premium', type: 'premium',
            priceInVat: 299, priceExVat: 279.44, priceCartonInVat: 897, qtyPerCarton: 3,
            moq: 3, orderLimit: null, customerLimit: null,
            contents: ['ชาเขียวนมปรุงสาเร็จ 1 กล่อง', 'ชาไทยนมปรุงสาเร็จ 1 กล่อง', 'แก้วใสสวมปลอกซิลิโคน สีแดง (16 ออนซ์) 1 ใบ'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกรกฎาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'MC-01', nameEn: 'NEW COFFEE CAPSULE MACHINE', nameTh: 'เครื่องชงกาแฟแคปซูล รุ่นใหม่ หน้าจอดิจิตอล สีขาว/สีเทา',
            description: 'เครื่องชงกาแฟแคปซูลรุ่นล่าสุด หน้าจอดิจิทัล ใช้งานง่าย พร้อมกาแฟแคปซูล 4 รสชาติ',
            category: 'home-used', type: 'machine',
            priceInVat: 3399, priceExVat: 3176.64, priceCartonInVat: 3399, qtyPerCarton: 1,
            moq: 1, orderLimit: 2, customerLimit: 2,
            contents: ['เครื่องชงกาแฟแคปซูล รุ่นใหม่ หน้าจอดิจิตอล 1 เครื่อง (สีขาว/สีเทา)', 'กาแฟแคปซูล Signature 1 กล่อง', 'กาแฟแคปซูล Selected 1 กล่อง', 'กาแฟแคปซูล ปางขอน 1 กล่อง', 'กาแฟแคปซูล อินทนนท์ 1 กล่อง'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกุมภาพันธ์ 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'MC-02', nameEn: 'COFFEE CAPSULE BEGINNER SET', nameTh: 'เริ่มต้นประสบการณ์กาแฟแคปซูลได้ง่ายๆ เหมาะสำหรับมือใหม่',
            description: 'เซตเริ่มต้นสำหรับมือใหม่หัดชงกาแฟแคปซูล พร้อมกาแฟ 4 รสชาติ ราคาเข้าถึงได้',
            category: 'home-used', type: 'machine',
            priceInVat: 2999, priceExVat: 2802.80, priceCartonInVat: 2999, qtyPerCarton: 1,
            moq: 1, orderLimit: 2, customerLimit: 2,
            contents: ['เครื่องชงกาแฟแคปซูล (สีเขียว/สีดำ) 1 เครื่อง', 'กาแฟแคปซูล Signature 1 กล่อง', 'กาแฟแคปซูล Selected 1 กล่อง', 'กาแฟแคปซูล ปางขอน 1 กล่อง', 'กาแฟแคปซูล อินทนนท์ 1 กล่อง'],
            expiryNote: 'สินค้าภายในกล่องหมดอายุเดือนกุมภาพันธ์ 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'MC-03', nameEn: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN', nameTh: 'เครื่องชงกาแฟแคปซูล รุ่นใหม่ หน้าจอดิจิทัล ระบบสัมผัส สีขาว/สีเทา',
            description: 'เครื่องชงกาแฟแคปซูล Digital Touch Screen ดีไซน์ล้ำสมัย ควบคุมด้วยหน้าจอสัมผัส',
            category: 'home-used', type: 'machine',
            priceInVat: 2999, priceExVat: 2802.80, priceCartonInVat: 2999, qtyPerCarton: 1,
            moq: 1, orderLimit: 2, customerLimit: 2,
            contents: ['เครื่องชงกาแฟแคปซูล Digital Touch Screen (สีขาว/สีเทา)'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-01', nameEn: 'ORDINARY TUMBLER 22oz', nameTh: 'แก้วสเตนเลส รุ่น Ordinary 22 oz ดีไซน์เรียบหรู มินิมอล (คละ 3 สี)',
            description: 'แก้วสเตนเลสเก็บความเย็น/ร้อน 22 oz ดีไซน์มินิมอล เรียบหรู คละ 3 สี',
            category: 'home-used', type: 'tumbler',
            priceInVat: 280, priceExVat: 261.68, priceCartonInVat: 3360, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วสเตนเลส Ordinary 22 oz (คละ 3 สี สีละ 4 ใบ)'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-02', nameEn: 'METALLIC TUMBLER 22oz — Cocoa Bronze', nameTh: 'แก้วสเตนเมทัลลิก 22 oz สีพิเศษ Cocoa Bronze',
            description: 'แก้วสเตนเมทัลลิก 22 oz สีพิเศษ Cocoa Bronze ดูหรูหราและมีเอกลักษณ์',
            category: 'home-used', type: 'tumbler',
            priceInVat: 280, priceExVat: 261.68, priceCartonInVat: 3360, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วสเตนเมทัลลิก 22 oz สี Cocoa Bronze'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-03', nameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz (คละสี)', nameTh: 'แก้วใสสเตนเลส 22 oz 1 ใบ 2 สไตล์ (คละ 4 สี)',
            description: 'แก้วใสสเตนเลส 22 oz สไตล์โมเดิร์น คละ 4 สี เหมาะสำหรับใช้ในชีวิตประจำวัน',
            category: 'home-used', type: 'tumbler',
            priceInVat: 289, priceExVat: 270.09, priceCartonInVat: 3468, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วใสสเตนเลส 22 oz (คละ 4 สี)'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-04', nameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz — Flat White', nameTh: 'แก้วใสสเตนเลส 22 oz สีพิเศษ Flat White',
            description: 'แก้วใสสเตนเลส 22 oz สีพิเศษ Flat White สะอาด เรียบ และดูดี',
            category: 'home-used', type: 'tumbler',
            priceInVat: 259, priceExVat: 242.06, priceCartonInVat: 3108, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วใสสเตนเลส 22 oz สี Flat White'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-05', nameEn: 'GLITTER TUMBLER 22oz (คละสี)', nameTh: 'แก้วสเตนเลสกากเพชร 22 oz หรูหรา ประกายกากเพชร (คละ 4 สี)',
            description: 'แก้วสเตนเลสกากเพชร 22 oz ประกายแวววาว เหมาะสำหรับมอบเป็นของขวัญหรือใช้เองในโอกาสพิเศษ',
            category: 'home-used', type: 'tumbler',
            priceInVat: 359, priceExVat: 335.51, priceCartonInVat: 4308, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วสเตนเลสกากเพชร 22 oz (คละ 4 สี)'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-06', nameEn: 'GLITTER TUMBLER 22oz — Rosy Gold', nameTh: 'แก้วสเตนเลสกากเพชร 22 oz สีพิเศษ Rosy Gold',
            description: 'แก้วสเตนเลสกากเพชร 22 oz สีพิเศษ Rosy Gold สวยงามหรูหราเหมาะสำหรับเป็นของขวัญ',
            category: 'home-used', type: 'tumbler',
            priceInVat: 329, priceExVat: 307.48, priceCartonInVat: 3948, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['แก้วสเตนเลสกากเพชร 22 oz สี Rosy Gold'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'TB-07', nameEn: 'NYYY DESIGN TUMBLER 12oz', nameTh: 'แก้วสเตนเลส 12 oz เก็บทั้งร้อนและเย็น ออกแบบโดย Designer',
            description: 'แก้วสเตนเลส 12 oz ออกแบบโดย NYYY Designer เก็บทั้งร้อนและเย็น ดีไซน์ unique ไม่ซ้ำใคร',
            category: 'home-used', type: 'tumbler',
            priceInVat: 299, priceExVat: 279.44, priceCartonInVat: 5980, qtyPerCarton: 20,
            moq: 20, orderLimit: null, customerLimit: null,
            contents: ['แก้วสเตนเลส NYYY Design 12 oz'],
            expiryNote: '', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'CP-01', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Winery', nameTh: 'กาแฟแคปซูล Spirit Series กลิ่น Winery (10 แคปซูล/กล่อง)',
            description: 'กาแฟแคปซูล Spirit Series กลิ่น Winery ให้กลิ่นหอมของไวน์แดง เหมาะสำหรับผู้ที่ชอบกลิ่นหอมเฉพาะตัว',
            category: 'add-on', type: 'capsule',
            priceInVat: 180, priceExVat: 168.22, priceCartonInVat: 2160, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['กาแฟแคปซูล Winery 10 แคปซูล'],
            expiryNote: 'สินค้าหมดอายุเดือนมีนาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'CP-02', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Brandy', nameTh: 'กาแฟแคปซูล Spirit Series กลิ่น Brandy (10 แคปซูล/กล่อง)',
            description: 'กาแฟแคปซูล Spirit Series กลิ่น Brandy ผสมกลิ่นบรั่นดี อ่อนหวานและซับซ้อน',
            category: 'add-on', type: 'capsule',
            priceInVat: 180, priceExVat: 168.22, priceCartonInVat: 2160, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['กาแฟแคปซูล Brandy 10 แคปซูล'],
            expiryNote: 'สินค้าหมดอายุเดือนมีนาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
        {
            id: 'CP-03', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Whisky', nameTh: 'กาแฟแคปซูล Spirit Series กลิ่น Whisky (10 แคปซูล/กล่อง)',
            description: 'กาแฟแคปซูล Spirit Series กลิ่น Whisky ให้กลิ่นหอมของวิสกี้ เข้มข้นและซับซ้อน',
            category: 'add-on', type: 'capsule',
            priceInVat: 180, priceExVat: 168.22, priceCartonInVat: 2160, qtyPerCarton: 12,
            moq: 12, orderLimit: null, customerLimit: null,
            contents: ['กาแฟแคปซูล Whisky 10 แคปซูล'],
            expiryNote: 'สินค้าหมดอายุเดือนมีนาคม 2569', imageUrl: '', campaignStart: null, campaignEnd: null, isActive: false,
        },
    ]);

    // ── Helpers ───────────────────────────────────────────────────────
    const tabCount = (key: string) => {
        if (key === 'all') return products.value.length;
        return products.value.filter((p) => p.category === key).length;
    };

    const filteredProducts = computed(() => {
        let list = activeTab.value === 'all' ? products.value : products.value.filter((p) => p.category === activeTab.value);
        if (search.value) {
            const q = search.value.toLowerCase();
            list = list.filter((p) => p.nameEn.toLowerCase().includes(q) || p.nameTh.includes(q) || p.id.toLowerCase().includes(q));
        }
        return list;
    });

    const categoryLabel = (cat: ProductCategory) => {
        const map: Record<ProductCategory, string> = {
            'gift-set': 'Gift Set',
            premium: 'Premium',
            'home-used': 'Home used',
            'add-on': 'Add on',
        };
        return map[cat];
    };

    const categoryBadgeClass = (cat: ProductCategory) => {
        const map: Record<ProductCategory, string> = {
            'gift-set': 'badge-outline-primary',
            premium: 'badge-outline-secondary',
            'home-used': 'badge-outline-success',
            'add-on': 'badge-outline-info',
        };
        return map[cat];
    };

    const categoryEmoji = (cat: ProductCategory) => {
        const map: Record<ProductCategory, string> = {
            'gift-set': '🎁',
            premium: '⭐',
            'home-used': '🏠',
            'add-on': '☕',
        };
        return map[cat];
    };

    // สถานะสินค้า 4 states: เปิดขาย / ใกล้หมด / ปิดขาย / หมด
    const productStatusLabel = (item: Product) => {
        if (getStatus(item.id) === 'out') return 'หมด';
        if (getStatus(item.id) === 'low') return 'ใกล้หมด';
        if (!item.isActive) return 'ปิดขาย';
        return 'เปิดขาย';
    };

    const productStatusBadge = (item: Product) => {
        if (getStatus(item.id) === 'out') return 'badge-outline-danger';
        if (getStatus(item.id) === 'low') return 'badge-outline-warning';
        if (!item.isActive) return 'badge-outline-secondary';
        return 'badge-outline-success';
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // ── View Modal ────────────────────────────────────────────────────
    const viewModal = ref<Product | null>(null);
    const openViewModal = (item: Product) => { viewModal.value = item; };

    // ── Setting Modal ─────────────────────────────────────────────────
    const settingModal = ref<Product | null>(null);
    const settingForm = ref({
        category: 'gift-set' as ProductCategory,
        description: '',
        moq: 1,
        orderLimit: null as number | null,
        customerLimit: null as number | null,
        campaignStart: '',
        campaignEnd: '',
        isActive: false,
    });

    const campaignDays = computed(() => {
        if (!settingForm.value.campaignStart || !settingForm.value.campaignEnd) return 0;
        const diff = new Date(settingForm.value.campaignEnd).getTime() - new Date(settingForm.value.campaignStart).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    });

    const previewStatusLabel = computed(() => {
        const stockStatus = settingModal.value ? getStatus(settingModal.value.id) : 'ok';
        if (stockStatus === 'out') return 'หมด';
        if (stockStatus === 'low') return 'ใกล้หมด';
        if (!settingForm.value.isActive) return 'ปิดขาย';
        return 'เปิดขาย';
    });

    const previewStatusBadge = computed(() => {
        const stockStatus = settingModal.value ? getStatus(settingModal.value.id) : 'ok';
        if (stockStatus === 'out') return 'badge-outline-danger';
        if (stockStatus === 'low') return 'badge-outline-warning';
        if (!settingForm.value.isActive) return 'badge-outline-secondary';
        return 'badge-outline-success';
    });

    const openSettingModal = (item: Product) => {
        settingModal.value = item;
        settingForm.value = {
            category: item.category,
            description: item.description,
            moq: item.moq,
            orderLimit: item.orderLimit,
            customerLimit: item.customerLimit,
            campaignStart: item.campaignStart ?? '',
            campaignEnd: item.campaignEnd ?? '',
            isActive: item.isActive,
        };
    };

    const closeSettingModal = () => {
        settingModal.value = null;
    };

    const saveSetting = () => {
        if (!settingModal.value) return;
        const target = products.value.find((p) => p.id === settingModal.value!.id);
        if (target) {
            target.category = settingForm.value.category;
            target.description = settingForm.value.description;
            target.moq = settingForm.value.moq;
            target.orderLimit = settingForm.value.orderLimit || null;
            target.customerLimit = settingForm.value.customerLimit || null;
            target.campaignStart = settingForm.value.campaignStart || null;
            target.campaignEnd = settingForm.value.campaignEnd || null;
            target.isActive = settingForm.value.isActive;
        }
        closeSettingModal();
    };
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
        transform: scale(0.97);
    }
</style>
