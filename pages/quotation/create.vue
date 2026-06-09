<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><NuxtLink to="/quotation" class="text-primary hover:underline">Quotation</NuxtLink></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>สร้างใบเสนอราคาใหม่</span></li>
        </ul>

        <form @submit.prevent="handleSubmit">
            <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">

                <!-- Left: Customer + Products -->
                <div class="xl:col-span-2 space-y-6">

                    <!-- Section 1: Customer Info -->
                    <div class="panel">
                        <h6 class="text-base font-semibold mb-4 dark:text-white-light">👤 ข้อมูลลูกค้า</h6>
                        <div class="mb-4 flex gap-3">
                            <button
                                type="button"
                                class="btn btn-sm"
                                :class="form.customerType === 'existing' ? 'btn-primary' : 'btn-outline-secondary'"
                                @click="form.customerType = 'existing'"
                            >
                                ลูกค้าเดิม
                            </button>
                            <button
                                type="button"
                                class="btn btn-sm"
                                :class="form.customerType === 'new' ? 'btn-primary' : 'btn-outline-secondary'"
                                @click="form.customerType = 'new'"
                            >
                                ลูกค้าใหม่
                            </button>
                        </div>

                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label class="block text-sm font-medium mb-1">
                                    ชื่อลูกค้า / Sold-to <span class="text-danger">*</span>
                                </label>
                                <input
                                    v-model="form.soldToName"
                                    type="text"
                                    class="form-input w-full"
                                    placeholder="ชื่อบริษัท / ลูกค้า"
                                    required
                                />
                            </div>
                            <div v-if="form.customerType === 'existing'">
                                <label class="block text-sm font-medium mb-1">Sold-to Code</label>
                                <input
                                    v-model="form.soldToCode"
                                    type="text"
                                    class="form-input w-full"
                                    placeholder="เช่น DEMO001"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">
                                    ที่อยู่จัดส่ง / Ship-to <span class="text-danger">*</span>
                                </label>
                                <input
                                    v-model="form.shipToName"
                                    type="text"
                                    class="form-input w-full"
                                    placeholder="ชื่อสถานที่จัดส่ง"
                                    required
                                />
                            </div>
                            <div v-if="form.customerType === 'existing'">
                                <label class="block text-sm font-medium mb-1">Ship-to Code</label>
                                <input
                                    v-model="form.shipToCode"
                                    type="text"
                                    class="form-input w-full"
                                    placeholder="เช่น DEMO001-01"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">ผู้ติดต่อ</label>
                                <input
                                    v-model="form.deliveryContact.name"
                                    type="text"
                                    class="form-input w-full"
                                    placeholder="ชื่อผู้ติดต่อ"
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">เบอร์โทร</label>
                                <input
                                    v-model="form.deliveryContact.phone"
                                    type="tel"
                                    class="form-input w-full"
                                    placeholder="0xx-xxx-xxxx"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Section 2: Products -->
                    <div class="panel">
                        <div class="mb-4 flex items-center justify-between">
                            <h6 class="text-base font-semibold dark:text-white-light">📦 รายการสินค้า</h6>
                            <button type="button" class="btn btn-outline-primary btn-sm" @click="addItem">
                                + เพิ่มสินค้า
                            </button>
                        </div>

                        <div v-if="form.items.length === 0" class="text-center text-gray-400 py-6">
                            ยังไม่มีรายการ — กด "เพิ่มสินค้า"
                        </div>

                        <div v-for="(item, idx) in form.items" :key="idx" class="mb-3 rounded-lg border p-3 dark:border-gray-700">
                            <div class="grid grid-cols-12 gap-2 items-end">
                                <!-- Product select -->
                                <div class="col-span-12 sm:col-span-5">
                                    <label class="block text-xs text-gray-500 mb-1">สินค้า</label>
                                    <select
                                        class="form-select w-full text-sm"
                                        :value="item.productId"
                                        @change="onProductChange(idx, ($event.target as HTMLSelectElement).value)"
                                    >
                                        <option value="">-- เลือกสินค้า --</option>
                                        <optgroup v-for="type in productTypes" :key="type" :label="type">
                                            <option
                                                v-for="(prod, pid) in productsByType[type]"
                                                :key="pid"
                                                :value="pid"
                                            >
                                                {{ pid }} — {{ prod.name }}
                                            </option>
                                        </optgroup>
                                    </select>
                                </div>
                                <!-- Qty -->
                                <div class="col-span-4 sm:col-span-2">
                                    <label class="block text-xs text-gray-500 mb-1">จำนวน</label>
                                    <input
                                        v-model.number="item.qty"
                                        type="number"
                                        min="1"
                                        class="form-input w-full text-sm"
                                        @input="recalcItem(idx)"
                                    />
                                </div>
                                <!-- Unit price -->
                                <div class="col-span-5 sm:col-span-3">
                                    <label class="block text-xs text-gray-500 mb-1">ราคา/หน่วย (รวม VAT)</label>
                                    <input
                                        v-model.number="item.priceInVat"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        class="form-input w-full text-sm"
                                        @input="recalcItem(idx)"
                                    />
                                </div>
                                <!-- Subtotal -->
                                <div class="col-span-9 sm:col-span-1 text-right">
                                    <label class="block text-xs text-gray-500 mb-1">รวม</label>
                                    <div class="text-sm font-semibold text-primary pt-2">
                                        {{ item.subtotalInVat.toLocaleString('th-TH') }}
                                    </div>
                                </div>
                                <!-- Remove -->
                                <div class="col-span-3 sm:col-span-1 text-right">
                                    <label class="block text-xs mb-1 opacity-0">-</label>
                                    <button
                                        type="button"
                                        class="btn btn-outline-danger btn-sm px-2"
                                        @click="removeItem(idx)"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Running total -->
                        <div v-if="form.items.length > 0" class="mt-4 border-t pt-3 dark:border-gray-700 text-sm space-y-1">
                            <div class="flex justify-end gap-12">
                                <span class="text-gray-500">ก่อนภาษี</span>
                                <span>{{ totalExVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                            </div>
                            <div class="flex justify-end gap-12">
                                <span class="text-gray-500">VAT 7%</span>
                                <span>{{ vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
                            </div>
                            <div class="flex justify-end gap-12 font-bold text-base border-t pt-1 dark:border-gray-700">
                                <span>รวมสุทธิ</span>
                                <span class="text-primary">{{ totalInVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Details + Actions -->
                <div class="space-y-6">

                    <!-- Section 3: Quotation Details -->
                    <div class="panel">
                        <h6 class="text-base font-semibold mb-4 dark:text-white-light">📋 รายละเอียด</h6>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">
                                    วันหมดอายุใบเสนอ <span class="text-danger">*</span>
                                </label>
                                <input
                                    v-model="form.validUntil"
                                    type="date"
                                    class="form-input w-full"
                                    :min="new Date().toISOString().slice(0, 10)"
                                    required
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">หมายเหตุ</label>
                                <textarea
                                    v-model="form.note"
                                    class="form-textarea w-full"
                                    rows="3"
                                    placeholder="หมายเหตุ / เงื่อนไขพิเศษ"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Section 4: Tax Invoice -->
                    <div class="panel">
                        <h6 class="text-base font-semibold mb-4 dark:text-white-light">🧾 ใบกำกับภาษี</h6>
                        <div class="mb-3 flex gap-3">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" :value="true"  v-model="form.taxInvoice.requested" class="form-radio" />
                                <span class="text-sm">ต้องการ</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="radio" :value="false" v-model="form.taxInvoice.requested" class="form-radio" />
                                <span class="text-sm">ไม่ต้องการ</span>
                            </label>
                        </div>
                        <div v-if="form.taxInvoice.requested" class="space-y-3">
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">ชื่อบริษัท (สำหรับใบกำกับ)</label>
                                <input v-model="form.taxInvoice.companyName" type="text" class="form-input w-full text-sm" />
                            </div>
                            <div>
                                <label class="block text-xs text-gray-500 mb-1">เลขประจำตัวผู้เสียภาษี</label>
                                <input v-model="form.taxInvoice.taxId" type="text" class="form-input w-full text-sm font-mono" maxlength="13" />
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="panel">
                        <div class="space-y-2">
                            <button
                                type="submit"
                                class="btn btn-primary w-full"
                                :disabled="!canSubmit"
                            >
                                💾 บันทึกใบเสนอราคา (Draft)
                            </button>
                            <NuxtLink to="/quotation" class="btn btn-outline-secondary w-full text-center">
                                ยกเลิก
                            </NuxtLink>
                        </div>
                        <p class="mt-3 text-xs text-gray-400 text-center">
                            บันทึกเป็น Draft — ส่งลูกค้าได้ในหน้า Detail
                        </p>
                    </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PRODUCT_CATALOG, useOrQuotation } from '~/composables/useOrQuotation';

useHead({ title: 'สร้างใบเสนอราคา' });
const router = useRouter();
const { createQuotation } = useOrQuotation();

// ── Product catalog helpers ────────────────────────────────────────────────────
const productTypes = computed(() => [...new Set(Object.values(PRODUCT_CATALOG).map(p => p.type))]);
const productsByType = computed(() => {
    const map: Record<string, Record<string, { name: string; defaultPrice: number; type: string }>> = {};
    for (const [id, prod] of Object.entries(PRODUCT_CATALOG)) {
        if (!map[prod.type]) map[prod.type] = {};
        map[prod.type][id] = prod;
    }
    return map;
});

// ── Form state ────────────────────────────────────────────────────────────────
const form = ref({
    customerType: 'existing' as 'existing' | 'new',
    soldToName: '',
    soldToCode: '',
    shipToName: '',
    shipToCode: '',
    deliveryContact: { name: '', phone: '' },
    validUntil: '',
    note: '',
    taxInvoice: { requested: null as boolean | null, companyName: '', taxId: '' },
    items: [] as Array<{ productId: string; productNameEn: string; qty: number; priceInVat: number; subtotalInVat: number }>,
});

// ── Computed totals ────────────────────────────────────────────────────────────
const totalInVat = computed(() => form.value.items.reduce((s, i) => s + i.subtotalInVat, 0));
const totalExVat = computed(() => totalInVat.value / 1.07);
const vatAmount  = computed(() => totalInVat.value - totalExVat.value);

const canSubmit = computed(() =>
    form.value.soldToName.trim() &&
    form.value.shipToName.trim() &&
    form.value.validUntil &&
    form.value.items.length > 0 &&
    form.value.items.every(i => i.productId && i.qty > 0 && i.priceInVat > 0)
);

// ── Item management ────────────────────────────────────────────────────────────
const addItem = () => {
    form.value.items.push({ productId: '', productNameEn: '', qty: 1, priceInVat: 0, subtotalInVat: 0 });
};

const removeItem = (idx: number) => {
    form.value.items.splice(idx, 1);
};

const onProductChange = (idx: number, productId: string) => {
    const prod = PRODUCT_CATALOG[productId];
    if (!prod) return;
    form.value.items[idx].productId     = productId;
    form.value.items[idx].productNameEn = prod.name;
    form.value.items[idx].priceInVat    = prod.defaultPrice;
    recalcItem(idx);
};

const recalcItem = (idx: number) => {
    const item = form.value.items[idx];
    item.subtotalInVat = Math.round(item.qty * item.priceInVat * 100) / 100;
};

// ── Submit ────────────────────────────────────────────────────────────────────
const handleSubmit = () => {
    if (!canSubmit.value) return;
    const q = createQuotation({
        customerType:    form.value.customerType,
        soldToName:      form.value.soldToName.trim(),
        soldToCode:      form.value.soldToCode.trim(),
        shipToName:      form.value.shipToName.trim(),
        shipToCode:      form.value.shipToCode.trim(),
        deliveryContact: { ...form.value.deliveryContact },
        validUntil:      form.value.validUntil,
        note:            form.value.note.trim(),
        taxInvoice:      { ...form.value.taxInvoice, companyName: form.value.taxInvoice.companyName || '', taxId: form.value.taxInvoice.taxId || '' },
        items:           form.value.items.map(i => ({ ...i })),
    });
    router.push(`/quotation/${q.id}`);
};
</script>
