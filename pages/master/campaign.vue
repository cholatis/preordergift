<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Master</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Campaign</span></li>
        </ul>

        <!-- Campaign Table -->
        <div class="panel">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">
                    รายการ Campaign
                    <span class="ml-2 text-sm font-normal text-gray-400">ช่วงเวลาเปิด/ปิดขายสินค้า</span>
                </h5>
                <div class="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
                    <input v-model="search" type="text" class="form-input w-auto" placeholder="ค้นหา Campaign..." />
                    <button class="btn btn-primary whitespace-nowrap" @click="openCreateModal">
                        + สร้าง Campaign
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-16 !text-center">ลำดับ<br /><span class="text-xs font-normal opacity-70">Seq.</span></th>
                            <th>ชื่อ Campaign<br /><span class="text-xs font-normal opacity-70">Campaign name</span></th>
                            <th class="w-52">ช่วงเวลาเปิดขาย<br /><span class="text-xs font-normal opacity-70">Selling period</span></th>
                            <th class="w-24 !text-center">ระยะเวลา<br /><span class="text-xs font-normal opacity-70">Days</span></th>
                            <th class="w-24 !text-center">สินค้า<br /><span class="text-xs font-normal opacity-70">Products</span></th>
                            <th class="w-32 !text-center">สถานะ<br /><span class="text-xs font-normal opacity-70">Status</span></th>
                            <th class="w-36 !text-center">จัดการ<br /><span class="text-xs font-normal opacity-70">Action</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, idx) in filteredCampaigns" :key="item.id">
                            <td class="!text-center text-gray-500">{{ idx + 1 }}.</td>
                            <td>
                                <div class="font-semibold dark:text-white-dark">{{ item.name }}</div>
                                <div v-if="item.description" class="mt-0.5 text-xs text-gray-400 line-clamp-1">{{ item.description }}</div>
                            </td>
                            <td>
                                <div class="flex items-center gap-2 text-sm">
                                    <div class="text-center">
                                        <div class="font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.startDate) }}</div>
                                        <div class="text-[10px] text-gray-400">เริ่มต้น</div>
                                    </div>
                                    <div class="text-gray-400">→</div>
                                    <div class="text-center">
                                        <div class="font-medium text-gray-700 dark:text-gray-200">{{ formatDate(item.endDate) }}</div>
                                        <div class="text-[10px] text-gray-400">สิ้นสุด</div>
                                    </div>
                                </div>
                            </td>
                            <td class="!text-center">
                                <span class="font-semibold text-gray-700 dark:text-gray-200">{{ campaignDays(item) }}</span>
                                <div class="text-[10px] text-gray-400">วัน</div>
                            </td>
                            <td class="!text-center">
                                <button class="badge badge-outline-primary cursor-pointer hover:bg-primary hover:text-white transition-colors"
                                    @click="openProductsModal(item)">
                                    {{ item.productIds.length }} รายการ
                                </button>
                            </td>
                            <td class="!text-center">
                                <span class="badge whitespace-nowrap" :class="statusBadge(item)">
                                    {{ statusLabel(item) }}
                                </span>
                                <div v-if="campaignStatus(item) === 'active'" class="mt-1 text-[10px] text-success">
                                    เหลือ {{ daysRemaining(item) }} วัน
                                </div>
                                <div v-if="campaignStatus(item) === 'upcoming'" class="mt-1 text-[10px] text-info">
                                    อีก {{ daysUntilStart(item) }} วัน
                                </div>
                            </td>
                            <td class="!text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button class="btn btn-outline-primary px-2 py-1 text-xs" @click="openEditModal(item)">แก้ไข</button>
                                    <button
                                        class="btn px-2 py-1 text-xs"
                                        :class="item.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                                        @click="toggleActive(item)"
                                    >
                                        {{ item.isActive ? 'ปิด' : 'เปิด' }}
                                    </button>
                                </div>
                            </td>
                        </tr>
                        <tr v-if="filteredCampaigns.length === 0">
                            <td colspan="7" class="!text-center py-10 text-gray-400">ไม่พบ Campaign</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- ===================== Create / Edit Campaign Modal ===================== -->
        <transition name="fade">
            <div v-if="formModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="closeFormModal">
                <div class="w-full max-w-lg rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b]">
                    <!-- Header -->
                    <div class="border-b border-gray-200 p-5 dark:border-[#2d3e5c]">
                        <h4 class="font-bold dark:text-white">{{ isEditing ? 'แก้ไข Campaign' : 'สร้าง Campaign ใหม่' }}</h4>
                        <p class="mt-0.5 text-sm text-gray-400">กำหนดช่วงเวลาเปิด/ปิดขายสินค้า</p>
                    </div>

                    <!-- Body -->
                    <div class="p-5 space-y-4">
                        <!-- Campaign name -->
                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">
                                ชื่อ Campaign <span class="text-danger">*</span>
                            </label>
                            <input
                                v-model="form.name"
                                type="text"
                                class="form-input w-full"
                                placeholder="เช่น Gift Set New Year 2026"
                            />
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">รายละเอียด Campaign</label>
                            <textarea
                                v-model="form.description"
                                rows="2"
                                class="form-textarea w-full resize-none"
                                placeholder="อธิบาย Campaign นี้..."
                            ></textarea>
                        </div>

                        <!-- Period -->
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">
                                    วันเริ่มต้น <span class="text-danger">*</span>
                                </label>
                                <input v-model="form.startDate" type="date" class="form-input w-full" :max="form.endDate || undefined" />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">
                                    วันสิ้นสุด <span class="text-danger">*</span>
                                </label>
                                <input v-model="form.endDate" type="date" class="form-input w-full" :min="form.startDate || undefined" />
                            </div>
                        </div>

                        <!-- Period preview -->
                        <div v-if="form.startDate && form.endDate" class="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary dark:bg-primary/10">
                            <span class="font-semibold">{{ form.name || 'Campaign' }}</span>
                            <span class="mx-2 text-gray-400">|</span>
                            {{ formatDate(form.startDate) }} — {{ formatDate(form.endDate) }}
                            <span class="ml-2 text-gray-400">({{ formDays }} วัน)</span>
                        </div>

                        <!-- Active toggle -->
                        <div class="rounded-lg bg-gray-50 p-4 dark:bg-[#243150]">
                            <label class="flex cursor-pointer items-center gap-3">
                                <input v-model="form.isActive" type="checkbox" class="form-checkbox h-5 w-5 text-success" />
                                <div>
                                    <span class="font-medium dark:text-white-dark">เปิดใช้งาน Campaign (Active)</span>
                                    <p class="mt-0.5 text-xs text-gray-400">สินค้าใน Campaign นี้จะเปิดให้สั่งซื้อได้ตามช่วงเวลาที่กำหนด</p>
                                </div>
                            </label>
                        </div>

                        <!-- Validation -->
                        <div v-if="formError" class="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
                            {{ formError }}
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex justify-between border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <div>
                            <button v-if="isEditing" class="btn btn-outline-info px-4 text-sm" @click="openProductsModal(editTarget!)">
                                📦 เลือกสินค้าใน Campaign
                            </button>
                        </div>
                        <div class="flex gap-3">
                            <button class="btn btn-outline-danger" @click="closeFormModal">ยกเลิก</button>
                            <button class="btn btn-primary" @click="saveForm">{{ isEditing ? 'บันทึก' : 'สร้าง Campaign' }}</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ===================== Products in Campaign Modal ===================== -->
        <transition name="fade">
            <div v-if="productsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="productsModal = null">
                <div class="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b] max-h-[90vh] flex flex-col">
                    <!-- Header -->
                    <div class="border-b border-gray-200 p-5 dark:border-[#2d3e5c] shrink-0">
                        <h4 class="font-bold dark:text-white">สินค้าใน Campaign</h4>
                        <p class="mt-0.5 text-sm text-gray-400">{{ productsModal.name }} | {{ formatDate(productsModal.startDate) }} — {{ formatDate(productsModal.endDate) }}</p>
                    </div>

                    <!-- Body: product checklist -->
                    <div class="overflow-y-auto p-5">
                        <p class="mb-3 text-xs text-gray-500">เลือกสินค้าที่ต้องการรวมใน Campaign นี้</p>
                        <div class="space-y-2">
                            <label
                                v-for="p in allProducts"
                                :key="p.id"
                                class="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                                :class="productsModal.productIds.includes(p.id)
                                    ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                                    : 'border-gray-200 hover:border-primary/30 dark:border-[#2d3e5c]'"
                            >
                                <input
                                    type="checkbox"
                                    :value="p.id"
                                    v-model="productsModal.productIds"
                                    class="form-checkbox text-primary"
                                />
                                <div class="flex flex-1 items-center justify-between gap-2">
                                    <div>
                                        <span class="font-mono text-xs text-gray-400 mr-2">{{ p.id }}</span>
                                        <span class="text-sm font-medium dark:text-white-dark">{{ p.nameEn }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 shrink-0">
                                        <span class="badge text-[10px]" :class="catBadge(p.category)">{{ catLabel(p.category) }}</span>
                                        <span class="text-sm font-semibold text-primary">{{ p.priceInVat.toLocaleString() }} ฿</span>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="shrink-0 flex items-center justify-between border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <span class="text-sm text-gray-500">เลือกแล้ว {{ productsModal.productIds.length }} รายการ</span>
                        <button class="btn btn-primary px-6" @click="productsModal = null">บันทึก</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';

    useHead({ title: 'Master | Campaign' });

    type CampaignStatus = 'active' | 'upcoming' | 'ended' | 'disabled';
    type ProductCategory = 'gift-set' | 'premium' | 'home-used' | 'add-on';

    interface Campaign {
        id: string;
        name: string;
        description: string;
        startDate: string;
        endDate: string;
        isActive: boolean;
        productIds: string[];
    }

    interface ProductRef {
        id: string;
        nameEn: string;
        category: ProductCategory;
        priceInVat: number;
    }

    const today = new Date().toISOString().slice(0, 10);
    const search = ref('');

    // ── Mock campaigns ────────────────────────────────────────────────
    const campaigns = ref<Campaign[]>([
        {
            id: 'CP-2025-01',
            name: 'Gift Set New Year 2026',
            description: 'Campaign ของขวัญปีใหม่ 2026 สำหรับลูกค้า B2B ทุกกลุ่ม',
            startDate: '2025-10-01',
            endDate: '2025-12-15',
            isActive: true,
            productIds: ['GS-01', 'GS-02', 'GS-03', 'GS-04', 'GS-05', 'GS-06', 'GS-07'],
        },
        {
            id: 'CP-2026-01',
            name: 'Songkran Gift Set 2026',
            description: 'Campaign ของขวัญสงกรานต์ 2026',
            startDate: '2026-03-01',
            endDate: '2026-04-20',
            isActive: true,
            productIds: ['GS-01', 'GS-03', 'TB-01', 'TB-05'],
        },
        {
            id: 'CP-2026-02',
            name: 'Premium Home Collection Q2/2026',
            description: 'สินค้า Home used และ Premium สำหรับไตรมาสที่ 2',
            startDate: '2026-04-01',
            endDate: '2026-06-30',
            isActive: false,
            productIds: ['PM-01', 'PM-02', 'MC-01', 'MC-02', 'TB-01', 'TB-02'],
        },
    ]);

    // Product list สำหรับ checklist (ดึงจาก mock ของ product.vue)
    const allProducts = ref<ProductRef[]>([
        { id: 'GS-01', nameEn: 'SIGNATURE BREW GIFT SET',            category: 'gift-set',  priceInVat: 699  },
        { id: 'GS-02', nameEn: 'TEA OF JOY GIFT SET',                category: 'gift-set',  priceInVat: 479  },
        { id: 'GS-03', nameEn: 'GREEN TEA JUMBO GIFT SET',            category: 'gift-set',  priceInVat: 749  },
        { id: 'GS-04', nameEn: 'COFFEE TO GO GIFT SET',               category: 'gift-set',  priceInVat: 349  },
        { id: 'GS-05', nameEn: 'SENCHA MOMENT GIFT SET',              category: 'gift-set',  priceInVat: 449  },
        { id: 'GS-06', nameEn: 'SILVER & STELLAR DRIP COFFEE GIFT SET', category: 'gift-set', priceInVat: 699 },
        { id: 'GS-07', nameEn: 'RHYTHM OF CAPSULE GIFT SET',          category: 'gift-set',  priceInVat: 1279 },
        { id: 'PM-01', nameEn: 'MORNING DRIP BOX SET',                category: 'premium',   priceInVat: 630  },
        { id: 'PM-02', nameEn: 'TEA MOMENT BOX SET',                  category: 'premium',   priceInVat: 299  },
        { id: 'MC-01', nameEn: 'NEW COFFEE CAPSULE MACHINE',          category: 'home-used', priceInVat: 3399 },
        { id: 'MC-02', nameEn: 'COFFEE CAPSULE BEGINNER SET',         category: 'home-used', priceInVat: 2999 },
        { id: 'MC-03', nameEn: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN', category: 'home-used', priceInVat: 2999 },
        { id: 'TB-01', nameEn: 'ORDINARY TUMBLER 22oz',               category: 'home-used', priceInVat: 280  },
        { id: 'TB-02', nameEn: 'METALLIC TUMBLER 22oz — Cocoa Bronze',category: 'home-used', priceInVat: 280  },
        { id: 'TB-03', nameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz', category: 'home-used', priceInVat: 289  },
        { id: 'TB-04', nameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz — Flat White', category: 'home-used', priceInVat: 259 },
        { id: 'TB-05', nameEn: 'GLITTER TUMBLER 22oz (คละสี)',        category: 'home-used', priceInVat: 359  },
        { id: 'TB-06', nameEn: 'GLITTER TUMBLER 22oz — Rosy Gold',    category: 'home-used', priceInVat: 329  },
        { id: 'TB-07', nameEn: 'NYYY DESIGN TUMBLER 12oz',            category: 'home-used', priceInVat: 299  },
        { id: 'CP-01', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Winery',  category: 'add-on', priceInVat: 180  },
        { id: 'CP-02', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Brandy',  category: 'add-on', priceInVat: 180  },
        { id: 'CP-03', nameEn: 'COFFEE CAPSULE SPIRIT SERIES — Whisky',  category: 'add-on', priceInVat: 180  },
    ]);

    // ── Computed ──────────────────────────────────────────────────────
    const filteredCampaigns = computed(() => {
        if (!search.value) return campaigns.value;
        const q = search.value.toLowerCase();
        return campaigns.value.filter(
            (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
    });

    // ── Status helpers ────────────────────────────────────────────────
    const campaignStatus = (c: Campaign): CampaignStatus => {
        if (!c.isActive) return 'disabled';
        if (today < c.startDate) return 'upcoming';
        if (today > c.endDate) return 'ended';
        return 'active';
    };

    const statusLabel = (c: Campaign) => {
        const map: Record<CampaignStatus, string> = {
            active: 'เปิดขายอยู่',
            upcoming: 'ยังไม่ถึงเวลา',
            ended: 'หมดเวลาแล้ว',
            disabled: 'ปิดการใช้งาน',
        };
        return map[campaignStatus(c)];
    };

    const statusBadge = (c: Campaign) => {
        const map: Record<CampaignStatus, string> = {
            active: 'badge-outline-success',
            upcoming: 'badge-outline-info',
            ended: 'badge-outline-secondary',
            disabled: 'badge-outline-danger',
        };
        return map[campaignStatus(c)];
    };

    const campaignDays = (c: Campaign) => {
        const diff = new Date(c.endDate).getTime() - new Date(c.startDate).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    };

    const daysRemaining = (c: Campaign) => {
        const diff = new Date(c.endDate).getTime() - new Date(today).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const daysUntilStart = (c: Campaign) => {
        const diff = new Date(c.startDate).getTime() - new Date(today).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

    // ── Category badge for product list ──────────────────────────────
    const catLabel = (cat: ProductCategory) => {
        const map: Record<ProductCategory, string> = {
            'gift-set': 'Gift Set', premium: 'Premium', 'home-used': 'Home used', 'add-on': 'Add on',
        };
        return map[cat];
    };
    const catBadge = (cat: ProductCategory) => {
        const map: Record<ProductCategory, string> = {
            'gift-set': 'badge-outline-primary', premium: 'badge-outline-secondary',
            'home-used': 'badge-outline-success', 'add-on': 'badge-outline-info',
        };
        return map[cat];
    };

    // ── Toggle active ─────────────────────────────────────────────────
    const toggleActive = (c: Campaign) => {
        c.isActive = !c.isActive;
    };

    // ── Create / Edit Form ────────────────────────────────────────────
    const formModal = ref(false);
    const isEditing = ref(false);
    const editTarget = ref<Campaign | null>(null);
    const formError = ref('');

    const form = ref({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });

    const formDays = computed(() => {
        if (!form.value.startDate || !form.value.endDate) return 0;
        const diff = new Date(form.value.endDate).getTime() - new Date(form.value.startDate).getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    });

    const openCreateModal = () => {
        isEditing.value = false;
        editTarget.value = null;
        formError.value = '';
        form.value = { name: '', description: '', startDate: '', endDate: '', isActive: true };
        formModal.value = true;
    };

    const openEditModal = (c: Campaign) => {
        isEditing.value = true;
        editTarget.value = c;
        formError.value = '';
        form.value = {
            name: c.name,
            description: c.description,
            startDate: c.startDate,
            endDate: c.endDate,
            isActive: c.isActive,
        };
        formModal.value = true;
    };

    const closeFormModal = () => {
        formModal.value = false;
        editTarget.value = null;
    };

    const saveForm = () => {
        formError.value = '';
        if (!form.value.name.trim()) { formError.value = 'กรุณาระบุชื่อ Campaign'; return; }
        if (!form.value.startDate) { formError.value = 'กรุณาระบุวันเริ่มต้น'; return; }
        if (!form.value.endDate) { formError.value = 'กรุณาระบุวันสิ้นสุด'; return; }
        if (form.value.startDate > form.value.endDate) { formError.value = 'วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น'; return; }

        if (isEditing.value && editTarget.value) {
            const target = campaigns.value.find((c) => c.id === editTarget.value!.id);
            if (target) {
                target.name = form.value.name;
                target.description = form.value.description;
                target.startDate = form.value.startDate;
                target.endDate = form.value.endDate;
                target.isActive = form.value.isActive;
            }
        } else {
            const newId = `CP-${new Date().getFullYear()}-${String(campaigns.value.length + 1).padStart(2, '0')}`;
            campaigns.value.push({
                id: newId,
                name: form.value.name,
                description: form.value.description,
                startDate: form.value.startDate,
                endDate: form.value.endDate,
                isActive: form.value.isActive,
                productIds: [],
            });
        }
        closeFormModal();
    };

    // ── Products Modal ────────────────────────────────────────────────
    const productsModal = ref<Campaign | null>(null);

    const openProductsModal = (c: Campaign) => {
        productsModal.value = c;
        formModal.value = false;
    };
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
    .fade-enter-from,
    .fade-leave-to { opacity: 0; transform: scale(0.97); }
</style>
