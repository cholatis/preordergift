<template>
    <div>
        <!-- ══════════════ SCREEN VIEW ══════════════ -->
        <div class="print:hidden">
            <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
                <li><NuxtLink to="/orders" class="text-primary hover:underline">รายการคำสั่งซื้อ</NuxtLink></li>
                <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>{{ order?.orderNo ?? '...' }}</span></li>
            </ul>

            <div v-if="order" class="space-y-5">

                <!-- ── Header Card ─────────────────────────────────────────── -->
                <div class="panel">
                    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <div class="flex flex-wrap items-center gap-3 mb-1">
                                <h4 class="text-xl font-bold dark:text-white">{{ order.orderNo }}</h4>
                                <span class="badge text-sm" :class="statusBadge(order.status)">{{ statusLabel(order.status) }}</span>
                            </div>
                            <p class="text-sm text-gray-400">วันที่สร้าง: {{ formatDate(order.createdAt) }}</p>
                            <div v-if="order.requestedDeliveryDate" class="mt-1 text-sm text-gray-500">
                                📅 ต้องการรับสินค้า: <span class="font-medium text-gray-700 dark:text-gray-200">{{ formatDate(order.requestedDeliveryDate) }}</span>
                            </div>

                            <!-- Edit window countdown -->
                            <div v-if="canEdit" class="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-700">
                                ⏳ แก้ไขได้อีก <span class="font-mono font-bold">{{ editTimeRemaining }}</span>
                            </div>
                            <div v-else-if="order.editDeadline && !canEdit && order.status === 'submitted'" class="mt-2 inline-flex items-center gap-2 text-xs text-gray-400">
                                🔒 หมดเวลาแก้ไข ({{ EDIT_WINDOW_MIN }} นาที)
                            </div>

                            <!-- Tracking -->
                            <div v-if="order.trackingInfo?.trackingNo" class="mt-2 flex items-center gap-2 text-sm">
                                <span class="text-gray-400">📦 Tracking:</span>
                                <span class="font-mono font-medium text-info">{{ order.trackingInfo.trackingNo }}</span>
                                <span v-if="order.trackingInfo.carrier" class="text-xs text-gray-400">({{ order.trackingInfo.carrier }})</span>
                            </div>
                            <div v-if="order.deliveredAt" class="mt-1 text-sm text-success font-medium">
                                ✅ ส่งถึงแล้ว: {{ formatDate(order.deliveredAt) }}
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div class="flex flex-wrap items-center gap-2">
                            <button v-if="order.status !== 'cancelled'" class="btn btn-primary flex items-center gap-2" @click="printQuotation">🖨️ พิมพ์ใบเสนอราคา</button>
                            <button v-if="canEdit && !editMode" class="btn btn-outline-warning" @click="startEdit">✏️ แก้ไข</button>
                            <button v-if="editMode" class="btn btn-success" @click="saveEdit">บันทึกแก้ไข</button>
                            <button v-if="editMode" class="btn btn-outline-secondary" @click="cancelEdit">ยกเลิกแก้ไข</button>
                            <button v-if="order.status === 'submitted' && !canEdit" class="btn btn-outline-info" @click="showAdvanceModal = 'prepare_delivery'">📦 เริ่มจัดส่ง</button>
                            <button v-if="order.status === 'prepare_delivery'" class="btn btn-outline-success" @click="showAdvanceModal = 'done'">✅ ยืนยันส่งสินค้าแล้ว</button>
                            <button v-if="order.status === 'draft' || order.status === 'submitted'" class="btn btn-outline-danger" @click="cancelOrder">ยกเลิก Order</button>
                        </div>
                    </div>

                    <!-- Status pipeline -->
                    <div class="mt-5 pt-4 border-t border-gray-200 dark:border-[#2d3e5c]">
                        <div class="flex items-center gap-0">
                            <div v-for="(step, idx) in statusPipeline" :key="step.key" class="flex items-center flex-1 last:flex-none">
                                <div class="flex flex-col items-center text-center">
                                    <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-colors"
                                        :class="isPipelineActive(step.key) ? 'border-primary bg-primary text-white' : isPipelineDone(step.key) ? 'border-success bg-success text-white' : 'border-gray-300 dark:border-gray-600 text-gray-400'">
                                        <span v-if="isPipelineDone(step.key)">✓</span><span v-else>{{ idx + 1 }}</span>
                                    </div>
                                    <div class="mt-1 text-xs whitespace-nowrap" :class="isPipelineActive(step.key) ? 'text-primary font-semibold' : isPipelineDone(step.key) ? 'text-success' : 'text-gray-400'">
                                        {{ step.label }}
                                    </div>
                                </div>
                                <div v-if="idx < statusPipeline.length - 1" class="flex-1 h-0.5 mx-1 mb-4" :class="isPipelineDone(step.key) ? 'bg-success' : 'bg-gray-200 dark:bg-gray-700'"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ── Customer Info ────────────────────────────────────────── -->
                <div class="panel">
                    <h5 class="mb-4 font-semibold dark:text-white-light">ข้อมูลลูกค้า</h5>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="rounded-lg bg-gray-50 dark:bg-[#1a2941] p-4">
                            <div class="mb-1 text-xs font-semibold uppercase text-gray-400">{{ order.customerType === 'new' ? 'ผู้ติดต่อ (ลูกค้าใหม่)' : 'Sold-to' }}</div>
                            <div class="font-semibold dark:text-white">{{ order.soldToName }}</div>
                            <div class="text-sm text-gray-400 font-mono">{{ order.customerType === 'new' ? order.phone : order.soldToCode }}</div>
                        </div>
                        <div class="rounded-lg bg-gray-50 dark:bg-[#1a2941] p-4">
                            <div class="mb-1 text-xs font-semibold uppercase text-gray-400">สถานที่จัดส่ง (Ship-to)</div>
                            <div class="font-semibold dark:text-white">{{ order.shipToName }}</div>
                            <div class="text-sm text-gray-400 font-mono">{{ order.customerType === 'new' ? '' : order.shipToCode }}</div>
                        </div>
                    </div>
                </div>

                <!-- ── Order Items ───────────────────────────────────────────── -->
                <div class="panel">
                    <h5 class="mb-4 font-semibold dark:text-white-light">รายการสินค้า</h5>

                    <!-- View Mode -->
                    <div v-if="!editMode">
                        <div class="table-responsive">
                            <table>
                                <thead>
                                    <tr style="background-color: #1b2e4b !important; color: white !important;">
                                        <th class="w-12 !text-center">ลำดับ</th>
                                        <th class="w-24">รหัส</th>
                                        <th>ชื่อสินค้า</th>
                                        <th class="w-36 !text-right">ราคา/ชุด (incl.VAT)</th>
                                        <th class="w-24 !text-center">จำนวน (ชุด)</th>
                                        <th class="w-36 !text-right">ยอดรวม (incl.VAT)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, idx) in order.items" :key="item.productId">
                                        <td class="!text-center text-gray-500">{{ idx + 1 }}</td>
                                        <td class="text-xs text-gray-400 font-mono">{{ item.productId }}</td>
                                        <td class="font-medium dark:text-white-dark">{{ item.productNameEn }}</td>
                                        <td class="!text-right text-gray-600 dark:text-gray-300">{{ item.priceInVat.toLocaleString('th-TH') }} ฿</td>
                                        <td class="!text-center">{{ item.qty }}</td>
                                        <td class="!text-right font-semibold text-primary">{{ item.subtotalInVat.toLocaleString('th-TH') }} ฿</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-5 ltr:ml-auto rtl:mr-auto w-full max-w-sm rounded-xl bg-gray-50 dark:bg-[#1a2941] p-4 space-y-1.5">
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>รวมก่อน VAT</span><span>{{ order.totalExVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span></div>
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>VAT 7%</span><span>{{ order.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span></div>
                            <div class="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold dark:text-white">
                                <span>ยอดรวมทั้งสิ้น</span><span class="text-primary text-lg">{{ order.totalInVat.toLocaleString('th-TH') }} ฿</span>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Mode — item qty editor -->
                    <div v-else>
                        <div class="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 px-3 py-2 text-sm text-amber-700 dark:text-amber-300 mb-4">
                            ✏️ แก้ไขจำนวนสินค้า — ลดจำนวนจะคืน Stock ชั้น 1 (Available) โดยอัตโนมัติ
                        </div>
                        <div class="space-y-3">
                            <div v-for="item in editForm.items" :key="item.productId"
                                class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                <div class="flex-1 min-w-0">
                                    <div class="font-medium dark:text-white-dark text-sm truncate">{{ item.productNameEn }}</div>
                                    <div class="text-xs text-gray-400 font-mono">{{ item.productId }} · {{ item.priceInVat.toLocaleString('th-TH') }} ฿/ชุด</div>
                                    <div class="text-xs text-gray-400 mt-0.5">
                                        Available เพิ่มได้อีก: <span class="text-success font-medium">{{ getStock(item.productId).available }}</span> ชุด
                                    </div>
                                </div>
                                <div class="flex items-center gap-2 shrink-0">
                                    <button class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-lg font-bold leading-none hover:border-danger hover:text-danger transition-colors"
                                        @click="editQty(item, -1)" :disabled="item.qty <= 1">−</button>
                                    <input v-model.number="item.qty" type="number" min="1"
                                        :max="(originalItems.find(o => o.productId === item.productId)?.qty ?? item.qty) + getStock(item.productId).available"
                                        class="form-input w-16 text-center py-1" @input="clampEditQty(item)" />
                                    <button class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-lg font-bold leading-none hover:border-success hover:text-success transition-colors"
                                        @click="editQty(item, 1)"
                                        :disabled="item.qty >= (originalItems.find(o => o.productId === item.productId)?.qty ?? item.qty) + getStock(item.productId).available">+</button>
                                    <span class="text-sm font-semibold text-primary w-32 text-right">{{ (item.priceInVat * item.qty).toLocaleString('th-TH') }} ฿</span>
                                </div>
                                <!-- Delta indicator -->
                                <div class="w-full pl-1" v-if="item.qty !== (originalItems.find(o => o.productId === item.productId)?.qty ?? item.qty)">
                                    <span v-if="item.qty < (originalItems.find(o => o.productId === item.productId)?.qty ?? item.qty)" class="text-xs text-warning">
                                        ↩️ ลด {{ (originalItems.find(o => o.productId === item.productId)?.qty ?? 0) - item.qty }} ชุด — คืน Available
                                    </span>
                                    <span v-else class="text-xs text-info">
                                        📦 เพิ่ม {{ item.qty - (originalItems.find(o => o.productId === item.productId)?.qty ?? 0) }} ชุด — ตัด Available
                                    </span>
                                </div>
                            </div>
                        </div>
                        <!-- Edit totals preview -->
                        <div class="mt-4 ltr:ml-auto rtl:mr-auto w-full max-w-sm rounded-xl bg-amber-50 dark:bg-amber-900/10 p-4 space-y-1.5 border border-amber-200 dark:border-amber-800">
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>รวมก่อน VAT (ใหม่)</span><span>{{ (editTotalInVat / 1.07).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span></div>
                            <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300"><span>VAT 7%</span><span>{{ (editTotalInVat - editTotalInVat / 1.07).toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span></div>
                            <div class="border-t border-amber-300 dark:border-amber-700 pt-2 flex justify-between font-bold dark:text-white">
                                <span>ยอดรวมทั้งสิ้น (ใหม่)</span><span class="text-primary text-lg">{{ editTotalInVat.toLocaleString('th-TH') }} ฿</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ── Extra Info (Contact, Tax, Notes) ─────────────────────── -->
                <div class="panel">
                    <div class="mb-4 flex items-center justify-between">
                        <h5 class="font-semibold dark:text-white-light">ข้อมูลเพิ่มเติม</h5>
                        <button v-if="canEdit && !editMode" class="btn btn-outline-warning px-3 py-1.5 text-sm" @click="startEdit">✏️ แก้ไข</button>
                    </div>

                    <!-- View Mode -->
                    <div v-if="!editMode" class="space-y-5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div class="rounded-lg bg-gray-50 dark:bg-[#1a2941] p-4">
                                <div class="mb-1 text-xs font-semibold uppercase text-gray-400">ผู้ติดต่อปลายทาง</div>
                                <div v-if="order.deliveryContact?.name">
                                    <div class="font-semibold dark:text-white">{{ order.deliveryContact.name }}</div>
                                    <div class="text-sm text-gray-400">{{ order.deliveryContact.phone }}</div>
                                </div>
                                <div v-else class="text-sm text-gray-400 italic">ไม่ระบุ</div>
                            </div>
                            <div class="rounded-lg bg-gray-50 dark:bg-[#1a2941] p-4">
                                <div class="mb-1 text-xs font-semibold uppercase text-gray-400">ใบกำกับภาษี</div>
                                <div v-if="order.taxInvoice?.requested === false" class="text-sm text-gray-400 italic">ไม่ขอใบกำกับภาษี</div>
                                <div v-else-if="order.taxInvoice?.requested === true" class="text-sm space-y-0.5">
                                    <div class="font-semibold dark:text-white">{{ order.taxInvoice.taxName }}</div>
                                    <div class="text-xs text-gray-400 font-mono">เลขภาษี: {{ order.taxInvoice.taxId }}</div>
                                    <div v-if="order.taxInvoice.branch" class="text-xs text-gray-400">สาขา: {{ order.taxInvoice.branch }}</div>
                                    <div class="text-xs text-gray-500">{{ order.taxInvoice.taxAddress }}</div>
                                </div>
                                <div v-else class="text-sm text-gray-400 italic">ไม่ระบุ</div>
                            </div>
                        </div>
                        <div v-if="order.deliveryNote || order.note" class="space-y-2">
                            <div v-if="order.deliveryNote" class="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm">
                                <span class="font-medium text-amber-700 dark:text-amber-400">หมายเหตุการจัดส่ง: </span><span class="text-gray-700 dark:text-gray-200">{{ order.deliveryNote }}</span>
                            </div>
                            <div v-if="order.note" class="rounded-lg bg-gray-50 dark:bg-[#1a2941] px-4 py-3 text-sm">
                                <span class="font-medium text-gray-500">หมายเหตุ: </span><span class="text-gray-700 dark:text-gray-200">{{ order.note }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Edit Mode — contact / tax / notes -->
                    <div v-else class="space-y-5">
                        <div class="rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                            ✏️ โหมดแก้ไข — <span class="font-mono font-bold">{{ editTimeRemaining }}</span> คงเหลือ
                        </div>
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label class="mb-1.5 block text-xs font-medium dark:text-white-light">ชื่อผู้ติดต่อปลายทาง <span class="text-danger">*</span></label>
                                <input v-model="editForm.deliveryContact.name" type="text" class="form-input w-full" />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-xs font-medium dark:text-white-light">เบอร์โทร <span class="text-danger">*</span></label>
                                <input v-model="editForm.deliveryContact.phone" type="tel" class="form-input w-full" />
                            </div>
                        </div>
                        <div>
                            <label class="mb-2 block text-xs font-medium dark:text-white-light">ใบกำกับภาษี</label>
                            <div class="flex flex-wrap gap-3 mb-3">
                                <label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors" :class="editForm.taxInvoice.requested === true ? 'border-success bg-success/5' : 'border-gray-300 dark:border-[#2d3e5c]'">
                                    <input type="radio" :value="true" v-model="editForm.taxInvoice.requested" class="form-radio text-success" /><span class="text-sm font-medium">ขอใบกำกับภาษี</span>
                                </label>
                                <label class="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors" :class="editForm.taxInvoice.requested === false ? 'border-gray-400 bg-gray-50 dark:bg-gray-800' : 'border-gray-300 dark:border-[#2d3e5c]'">
                                    <input type="radio" :value="false" v-model="editForm.taxInvoice.requested" class="form-radio" /><span class="text-sm font-medium">ไม่ขอ</span>
                                </label>
                            </div>
                            <div v-if="editForm.taxInvoice.requested === true" class="space-y-3">
                                <div><label class="mb-1 block text-xs font-medium dark:text-white-light">ชื่อ</label><input v-model="editForm.taxInvoice.taxName" type="text" class="form-input w-full" /></div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">เลขภาษี</label><input v-model="editForm.taxInvoice.taxId" type="text" class="form-input w-full font-mono" maxlength="13" /></div>
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">สาขา</label><input v-model="editForm.taxInvoice.branch" type="text" class="form-input w-full" /></div>
                                </div>
                                <div><label class="mb-1 block text-xs font-medium dark:text-white-light">ที่อยู่</label><textarea v-model="editForm.taxInvoice.taxAddress" rows="2" class="form-textarea w-full resize-none"></textarea></div>
                            </div>
                        </div>
                        <div class="space-y-3">
                            <div><label class="mb-1.5 block text-xs font-medium dark:text-white-light">หมายเหตุการจัดส่ง</label><textarea v-model="editForm.deliveryNote" rows="2" class="form-textarea w-full resize-none"></textarea></div>
                            <div><label class="mb-1.5 block text-xs font-medium dark:text-white-light">หมายเหตุคำสั่งซื้อ</label><textarea v-model="editForm.note" rows="2" class="form-textarea w-full resize-none"></textarea></div>
                        </div>
                        <p v-if="editError" class="text-danger text-sm">{{ editError }}</p>
                        <div class="flex gap-3">
                            <button class="btn btn-success px-5" @click="saveEdit">บันทึกการแก้ไข</button>
                            <button class="btn btn-outline-secondary" @click="cancelEdit">ยกเลิก</button>
                        </div>
                    </div>
                </div>

                <!-- ── History ─────────────────────────────────────────────── -->
                <div v-if="order.history?.length" class="panel">
                    <h5 class="mb-4 font-semibold dark:text-white-light">ประวัติคำสั่งซื้อ</h5>
                    <div class="relative">
                        <div class="absolute left-4 top-1 bottom-1 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                        <div class="space-y-3 pl-10">
                            <div v-for="(entry, idx) in [...order.history].reverse()" :key="idx" class="relative">
                                <div class="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs" :class="historyDotClass(entry.action)">{{ historyIcon(entry.action) }}</div>
                                <div class="rounded-lg border border-gray-100 dark:border-gray-700 p-3">
                                    <div class="flex items-center justify-between flex-wrap gap-1">
                                        <span class="text-sm font-medium dark:text-white-dark">{{ historyLabel(entry.action) }}</span>
                                        <span class="text-xs text-gray-400">{{ formatDatetime(entry.ts) }}</span>
                                    </div>
                                    <p v-if="entry.detail" class="mt-0.5 text-xs text-gray-500">{{ entry.detail }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div v-else class="panel py-16 text-center text-gray-400">
                ไม่พบคำสั่งซื้อนี้ — <NuxtLink to="/orders" class="text-primary hover:underline">กลับไปรายการ</NuxtLink>
            </div>
        </div>

        <!-- ══════════════ Advance Status Modal ══════════════ -->
        <transition name="fade">
            <div v-if="showAdvanceModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div class="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b]">
                    <template v-if="showAdvanceModal === 'prepare_delivery'">
                        <div class="border-b border-gray-200 dark:border-[#2d3e5c] p-5">
                            <h4 class="font-bold dark:text-white">📦 เริ่มดำเนินการจัดส่ง</h4>
                            <p class="text-sm text-gray-400 mt-0.5">สถานะจะเปลี่ยนเป็น "กำลังจัดส่ง" — ลูกค้าจะไม่สามารถแก้ไข Order ได้อีก</p>
                        </div>
                        <div class="p-5 space-y-3">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ขนส่ง / Carrier</label>
                                <select v-model="advanceForm.carrier" class="form-select w-full">
                                    <option value="">-- เลือกขนส่ง --</option>
                                    <option>Kerry Express</option><option>Flash Express</option><option>J&T Express</option>
                                    <option>Thailand Post EMS</option><option>DHL</option><option>จัดส่งเอง</option>
                                </select>
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">Tracking Number</label>
                                <input v-model="advanceForm.trackingNo" type="text" class="form-input w-full font-mono" placeholder="เลขพัสดุ" />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">หมายเหตุ</label>
                                <textarea v-model="advanceForm.note" rows="2" class="form-textarea w-full resize-none" placeholder="เช่น นัดส่ง, ข้อควรระวัง..."></textarea>
                            </div>
                        </div>
                        <div class="flex justify-between gap-3 border-t border-gray-200 dark:border-[#2d3e5c] px-5 py-3">
                            <button class="btn btn-outline-secondary" @click="showAdvanceModal = null">ยกเลิก</button>
                            <button class="btn btn-info px-6" @click="advanceStatus('prepare_delivery')">ยืนยัน — เริ่มจัดส่ง</button>
                        </div>
                    </template>
                    <template v-else-if="showAdvanceModal === 'done'">
                        <div class="border-b border-gray-200 dark:border-[#2d3e5c] p-5">
                            <h4 class="font-bold dark:text-white">✅ ยืนยันส่งสินค้าสำเร็จ</h4>
                            <p class="text-sm text-gray-400 mt-0.5">ยืนยันว่าลูกค้าได้รับสินค้าแล้ว — สถานะจะเปลี่ยนเป็น "เสร็จสิ้น"</p>
                        </div>
                        <div class="p-5 space-y-3">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">วันที่ส่งสำเร็จ <span class="text-danger">*</span></label>
                                <input v-model="advanceForm.deliveredAt" type="date" class="form-input w-full" />
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">หมายเหตุ</label>
                                <textarea v-model="advanceForm.note" rows="2" class="form-textarea w-full resize-none" placeholder="เช่น ลูกค้าเซ็นรับแล้ว, ส่งให้รปภ.ฯ"></textarea>
                            </div>
                        </div>
                        <div class="flex justify-between gap-3 border-t border-gray-200 dark:border-[#2d3e5c] px-5 py-3">
                            <button class="btn btn-outline-secondary" @click="showAdvanceModal = null">ยกเลิก</button>
                            <button class="btn btn-success px-6" @click="advanceStatus('done')">ยืนยัน — เสร็จสิ้น</button>
                        </div>
                    </template>
                </div>
            </div>
        </transition>

        <!-- ══════════════ PRINT QUOTATION ══════════════ -->
        <div v-if="order" id="quotation-print" class="hidden print:block">
            <div class="quotation-wrapper">
                <div class="q-header">
                    <div class="q-logo-area"><div class="q-logo-box">☕ Café Amazon</div><div class="q-or">OR Group | ขฟ.บอธ.</div></div>
                    <div class="q-title-area"><div class="q-title">ใบเสนอราคา</div><div class="q-title-en">QUOTATION</div></div>
                </div>
                <div class="q-info-row">
                    <div class="q-info-block">
                        <div class="q-info-label">ผู้ซื้อ / Bill to</div>
                        <div class="q-info-value bold">{{ order.soldToName }}</div>
                        <div class="q-info-value gray">{{ order.customerType === 'new' ? order.phone : order.soldToCode }}</div>
                    </div>
                    <div class="q-info-block">
                        <div class="q-info-label">สถานที่จัดส่ง / Ship to</div>
                        <div class="q-info-value bold">{{ order.shipToName }}</div>
                        <div class="q-info-value gray">{{ order.customerType === 'new' ? '' : order.shipToCode }}</div>
                        <div v-if="order.deliveryContact?.name" class="q-info-value gray" style="margin-top:4px">ผู้รับ: {{ order.deliveryContact.name }} {{ order.deliveryContact.phone }}</div>
                    </div>
                    <div class="q-info-block right">
                        <table class="q-meta-table">
                            <tr><td class="q-meta-label">เลขที่:</td><td class="q-meta-value bold">{{ order.orderNo }}</td></tr>
                            <tr><td class="q-meta-label">วันที่:</td><td class="q-meta-value">{{ formatDate(order.createdAt) }}</td></tr>
                            <tr v-if="order.requestedDeliveryDate"><td class="q-meta-label">ต้องการรับ:</td><td class="q-meta-value">{{ formatDate(order.requestedDeliveryDate) }}</td></tr>
                            <tr><td class="q-meta-label">อายุใบ:</td><td class="q-meta-value">30 วัน</td></tr>
                        </table>
                    </div>
                </div>
                <div v-if="order.taxInvoice?.requested === true" class="q-tax-row">
                    <span class="bold">ออกใบกำกับภาษีในนาม: </span>{{ order.taxInvoice.taxName }}
                    <span class="gray" style="margin-left:16px">เลขภาษี: {{ order.taxInvoice.taxId }}</span>
                    <span v-if="order.taxInvoice.branch" class="gray" style="margin-left:8px">สาขา: {{ order.taxInvoice.branch }}</span>
                    <div class="gray small">{{ order.taxInvoice.taxAddress }}</div>
                </div>
                <table class="q-table">
                    <thead>
                        <tr>
                            <th class="center" style="width:40px">ลำดับ</th>
                            <th>ชื่อสินค้า / Description</th>
                            <th class="center" style="width:70px">จำนวน</th>
                            <th class="right" style="width:110px">ราคา/ชุด (฿)</th>
                            <th class="right" style="width:120px">ยอดรวม (฿)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, idx) in order.items" :key="item.productId">
                            <td class="center">{{ idx + 1 }}</td>
                            <td><div class="bold">{{ item.productNameEn }}</div><div class="gray small">รหัส: {{ item.productId }}</div></td>
                            <td class="center">{{ item.qty }}</td>
                            <td class="right">{{ item.priceInVat.toLocaleString('th-TH') }}</td>
                            <td class="right bold">{{ item.subtotalInVat.toLocaleString('th-TH') }}</td>
                        </tr>
                        <tr v-for="n in Math.max(0, 5 - order.items.length)" :key="`fill-${n}`" class="filler"><td></td><td></td><td></td><td></td><td></td></tr>
                    </tbody>
                    <tfoot>
                        <tr class="total-row"><td colspan="3"></td><td class="right">รวมก่อน VAT:</td><td class="right">{{ order.totalExVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</td></tr>
                        <tr class="total-row"><td colspan="3"></td><td class="right">VAT 7%:</td><td class="right">{{ order.vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</td></tr>
                        <tr class="grand-total-row"><td colspan="3"></td><td class="right bold">ยอดรวมทั้งสิ้น:</td><td class="right bold grand">{{ order.totalInVat.toLocaleString('th-TH') }} ฿</td></tr>
                    </tfoot>
                </table>
                <div v-if="order.deliveryNote || order.note" class="q-note">
                    <span v-if="order.deliveryNote"><span class="bold">หมายเหตุการจัดส่ง:</span> {{ order.deliveryNote }}</span>
                    <span v-if="order.note"><span class="bold"> หมายเหตุ:</span> {{ order.note }}</span>
                </div>
                <div class="q-terms">
                    <p>• สินค้าในใบเสนอราคานี้เป็นราคา incl. VAT 7% ทุกรายการ</p>
                    <p>• กรุณาตรวจสอบรายการสินค้าและจำนวนก่อนลงนาม</p>
                    <p>• ใบเสนอราคานี้มีอายุ 30 วันนับจากวันที่ออก</p>
                    <p>• ติดต่อสอบถาม: cafeamazonofftrade@pttor.com | 063-198-7555</p>
                </div>
                <div class="q-signatures">
                    <div class="q-sig-block"><div class="q-sig-line"></div><div class="q-sig-label">ลงชื่อผู้เสนอราคา</div><div class="q-sig-name">(........................................)</div><div class="q-sig-date">วันที่: ............/............/............</div></div>
                    <div class="q-sig-block"><div class="q-sig-line"></div><div class="q-sig-label">ลงชื่อผู้อนุมัติ</div><div class="q-sig-name">(........................................)</div><div class="q-sig-date">วันที่: ............/............/............</div></div>
                    <div class="q-sig-block"><div class="q-sig-line"></div><div class="q-sig-label">ลงชื่อผู้รับสินค้า</div><div class="q-sig-name">(........................................)</div><div class="q-sig-date">วันที่: ............/............/............</div></div>
                </div>
                <div class="q-footer">ออกโดยระบบ ORPortal | Café Amazon Off-Trade | {{ order.orderNo }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted, onUnmounted } from 'vue';

    const route = useRoute();
    useHead({ title: 'Order Management | รายละเอียดคำสั่งซื้อ' });

    const EDIT_WINDOW_MIN = 30;

    type HistoryAction = 'draft' | 'submit' | 'edit' | 'cancel' | 'prepare_delivery' | 'done';

    const orders = useState<any[]>('or-orders', () => []);
    const { getStock, releaseStock, adjustReservation } = useOrStock();

    const order = computed(() => orders.value.find(o => o.id === route.params.id));

    // ── Status helpers ──────────────────────────────────────────────
    const statusLabel = (s: string) => ({ draft: 'ร่าง', submitted: 'รอดำเนินการ', prepare_delivery: 'กำลังจัดส่ง', done: 'เสร็จสิ้น', cancelled: 'ยกเลิก' }[s] ?? s);
    const statusBadge = (s: string) => ({ draft: 'badge-outline-secondary', submitted: 'badge-outline-info', prepare_delivery: 'badge-outline-warning', done: 'badge-outline-success', cancelled: 'badge-outline-danger' }[s] ?? 'badge-outline-secondary');

    const formatDate     = (d: string) => new Date(d).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatDatetime = (ts: string) => { const d = new Date(ts); return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); };

    // ── Status Pipeline ─────────────────────────────────────────────
    const statusPipeline = [{ key: 'draft', label: 'ร่าง' }, { key: 'submitted', label: 'รอดำเนินการ' }, { key: 'prepare_delivery', label: 'กำลังจัดส่ง' }, { key: 'done', label: 'เสร็จสิ้น' }];
    const pipelineOrder  = ['draft', 'submitted', 'prepare_delivery', 'done'];
    const isPipelineActive = (key: string) => order.value?.status === key;
    const isPipelineDone   = (key: string) => pipelineOrder.indexOf(key) < pipelineOrder.indexOf(order.value?.status);

    // ── Edit Window ─────────────────────────────────────────────────
    const now = ref(new Date());
    let timer: ReturnType<typeof setInterval> | null = null;
    onMounted(() => { timer = setInterval(() => { now.value = new Date(); }, 1000); });
    onUnmounted(() => { if (timer) clearInterval(timer); });

    const canEdit = computed(() => {
        if (!order.value?.editDeadline || order.value.status !== 'submitted') return false;
        return now.value.getTime() < new Date(order.value.editDeadline).getTime();
    });
    const editTimeRemaining = computed(() => {
        if (!order.value?.editDeadline) return '';
        const diff = new Date(order.value.editDeadline).getTime() - now.value.getTime();
        if (diff <= 0) return '00:00';
        const mins = Math.floor(diff / 60000); const secs = Math.floor((diff % 60000) / 1000);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    });

    // ── History ─────────────────────────────────────────────────────
    const historyLabel    = (a: HistoryAction) => ({ draft: 'บันทึกร่าง', submit: 'ส่งคำสั่งซื้อ', edit: 'แก้ไขคำสั่งซื้อ', cancel: 'ยกเลิก', prepare_delivery: 'เริ่มดำเนินการจัดส่ง', done: 'เสร็จสิ้น / ส่งถึงแล้ว' }[a] ?? a);
    const historyIcon     = (a: HistoryAction) => ({ draft: '📝', submit: '✅', edit: '✏️', cancel: '❌', prepare_delivery: '📦', done: '🎉' }[a] ?? '•');
    const historyDotClass = (a: HistoryAction) => ({ draft: 'bg-gray-200 dark:bg-gray-600', submit: 'bg-primary/20', edit: 'bg-amber-100 dark:bg-amber-800', cancel: 'bg-red-100 dark:bg-red-800', prepare_delivery: 'bg-blue-100 dark:bg-blue-800', done: 'bg-green-100 dark:bg-green-800' }[a] ?? 'bg-gray-200');

    // ── Edit Mode ───────────────────────────────────────────────────
    const editMode    = ref(false);
    const editError   = ref('');
    const originalItems = ref<any[]>([]);

    const editForm = ref({
        deliveryContact: { name: '', phone: '' },
        deliveryNote: '',
        taxInvoice: { requested: null as boolean | null, taxName: '', taxId: '', taxAddress: '', branch: '' },
        note: '',
        items: [] as Array<{ productId: string; productNameEn: string; priceInVat: number; qty: number; subtotalInVat: number }>,
    });

    const editTotalInVat = computed(() => editForm.value.items.reduce((s, i) => s + i.priceInVat * i.qty, 0));

    const startEdit = () => {
        if (!order.value) return;
        editForm.value = {
            deliveryContact: { ...(order.value.deliveryContact ?? { name: '', phone: '' }) },
            deliveryNote: order.value.deliveryNote ?? '',
            taxInvoice: { ...(order.value.taxInvoice ?? { requested: null, taxName: '', taxId: '', taxAddress: '', branch: '' }) },
            note: order.value.note ?? '',
            items: order.value.items.map((i: any) => ({ ...i })),
        };
        originalItems.value = order.value.items.map((i: any) => ({ ...i }));
        editError.value = '';
        editMode.value  = true;
    };
    const cancelEdit = () => { editMode.value = false; editError.value = ''; };

    const editQty = (item: any, delta: number) => {
        const orig   = originalItems.value.find(o => o.productId === item.productId);
        const maxQty = (orig?.qty ?? item.qty) + getStock(item.productId).available;
        item.qty = Math.max(1, Math.min(item.qty + delta, maxQty));
    };
    const clampEditQty = (item: any) => {
        const orig   = originalItems.value.find(o => o.productId === item.productId);
        const maxQty = (orig?.qty ?? item.qty) + getStock(item.productId).available;
        if (!item.qty || item.qty < 1) item.qty = 1;
        if (item.qty > maxQty) item.qty = maxQty;
    };

    const saveEdit = () => {
        if (!order.value) return;
        if (!editForm.value.deliveryContact.name.trim()) { editError.value = 'กรุณาระบุชื่อผู้ติดต่อปลายทาง'; return; }
        if (!editForm.value.deliveryContact.phone.trim()) { editError.value = 'กรุณาระบุเบอร์โทร'; return; }

        order.value.deliveryContact = { ...editForm.value.deliveryContact };
        order.value.deliveryNote    = editForm.value.deliveryNote;
        order.value.taxInvoice      = { ...editForm.value.taxInvoice };
        order.value.note            = editForm.value.note;

        // Check if any item qty changed → adjust stock reservation
        const qtyChanged = editForm.value.items.some(i => {
            const orig = originalItems.value.find(o => o.productId === i.productId);
            return orig && orig.qty !== i.qty;
        });
        if (qtyChanged) {
            adjustReservation(
                originalItems.value.map((i: any) => ({ productId: i.productId, productNameEn: i.productNameEn, qty: i.qty })),
                editForm.value.items.map((i: any) => ({ productId: i.productId, productNameEn: i.productNameEn, qty: i.qty })),
                order.value.orderNo,
            );
            order.value.items = editForm.value.items.map((i: any) => ({ ...i, subtotalInVat: i.priceInVat * i.qty }));
            const newTotal = order.value.items.reduce((s: number, i: any) => s + i.subtotalInVat, 0);
            order.value.totalInVat = newTotal;
            order.value.totalExVat = newTotal / 1.07;
            order.value.vatAmount  = newTotal - order.value.totalExVat;
        }

        if (!order.value.history) order.value.history = [];
        const changesDesc: string[] = [];
        if (qtyChanged) changesDesc.push('จำนวนสินค้า (Stock ปรับอัตโนมัติ)');
        order.value.history.push({ ts: new Date().toISOString(), action: 'edit', detail: 'แก้ไข: ' + (changesDesc.length ? changesDesc.join(', ') : 'ข้อมูลผู้ติดต่อ / ใบกำกับภาษี / หมายเหตุ') });

        editMode.value  = false;
        editError.value = '';
    };

    // ── Advance Status ──────────────────────────────────────────────
    const showAdvanceModal = ref<null | 'prepare_delivery' | 'done'>(null);
    const advanceForm = ref({ carrier: '', trackingNo: '', note: '', deliveredAt: '' });

    const advanceStatus = (toStatus: 'prepare_delivery' | 'done') => {
        if (!order.value) return;
        const ts = new Date().toISOString();
        if (!order.value.history) order.value.history = [];

        if (toStatus === 'prepare_delivery') {
            order.value.status = 'prepare_delivery';
            order.value.trackingInfo = { carrier: advanceForm.value.carrier, trackingNo: advanceForm.value.trackingNo, note: advanceForm.value.note };
            const detail = ['เริ่มดำเนินการจัดส่ง', advanceForm.value.carrier, advanceForm.value.trackingNo].filter(Boolean).join(' — ');
            order.value.history.push({ ts, action: 'prepare_delivery', detail });
        } else if (toStatus === 'done') {
            if (!advanceForm.value.deliveredAt) return;
            order.value.status = 'done';
            order.value.deliveredAt = advanceForm.value.deliveredAt;
            const detail = `ลูกค้าได้รับสินค้าแล้ว${advanceForm.value.note ? ' — ' + advanceForm.value.note : ''}`;
            order.value.history.push({ ts, action: 'done', detail });
        }
        advanceForm.value = { carrier: '', trackingNo: '', note: '', deliveredAt: '' };
        showAdvanceModal.value = null;
    };

    // ── Cancel → คืน Stock ─────────────────────────────────────────
    const cancelOrder = () => {
        if (!order.value) return;
        if (!window.confirm('ยืนยันการยกเลิกคำสั่งซื้อนี้?')) return;
        // คืน reserved → available (เฉพาะ submitted; draft ไม่เคยตัด stock)
        if (order.value.status === 'submitted') {
            releaseStock(
                order.value.items.map((i: any) => ({ productId: i.productId, productNameEn: i.productNameEn, qty: i.qty })),
                order.value.orderNo,
            );
        }
        order.value.status = 'cancelled';
        if (!order.value.history) order.value.history = [];
        order.value.history.push({ ts: new Date().toISOString(), action: 'cancel', detail: order.value.status === 'submitted' ? 'ยกเลิก Order — คืน Stock reserved → available อัตโนมัติ' : 'ยกเลิก Order (ร่าง)' });
    };

    const printQuotation = () => window.print();
</script>

<style>
@media print {
    body * { visibility: hidden !important; }
    #quotation-print, #quotation-print * { visibility: visible !important; }
    #quotation-print { position: absolute; inset: 0; display: block !important; }

    .quotation-wrapper { font-family: 'Sarabun', 'TH Sarabun New', Arial, sans-serif; font-size: 11pt; color: #000; padding: 12mm 15mm; max-width: 210mm; margin: 0 auto; }
    .q-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #1b2e4b; padding-bottom: 8px; margin-bottom: 12px; }
    .q-logo-box { font-size: 20pt; font-weight: bold; color: #1b2e4b; }
    .q-or { font-size: 9pt; color: #666; margin-top: 2px; }
    .q-title { font-size: 22pt; font-weight: bold; color: #1b2e4b; text-align: right; }
    .q-title-en { font-size: 11pt; color: #888; text-align: right; }
    .q-info-row { display: grid; grid-template-columns: 1fr 1fr 200px; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f5f7fa; border-radius: 4px; }
    .q-info-label { font-size: 8pt; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
    .q-info-value { font-size: 10pt; }
    .q-info-value.bold { font-weight: bold; }
    .q-info-value.gray { color: #666; }
    .q-info-block.right { text-align: right; }
    .q-meta-table { font-size: 10pt; border-collapse: collapse; width: 100%; }
    .q-meta-label { color: #666; padding-right: 6px; white-space: nowrap; }
    .q-meta-value.bold { font-weight: bold; }
    .q-tax-row { margin: 6px 0 10px; padding: 6px 10px; background: #f0f8ff; border-left: 3px solid #1b2e4b; font-size: 9.5pt; border-radius: 2px; }
    .q-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10pt; }
    .q-table thead tr { background-color: #1b2e4b !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .q-table th { padding: 7px 8px; text-align: left; font-weight: 600; }
    .q-table th.center { text-align: center; }
    .q-table th.right { text-align: right; }
    .q-table td { padding: 6px 8px; border-bottom: 1px solid #e0e6ed; vertical-align: top; }
    .q-table td.center { text-align: center; }
    .q-table td.right { text-align: right; }
    .q-table td.bold { font-weight: bold; }
    .q-table td.gray { color: #666; }
    .q-table td.small { font-size: 8.5pt; }
    .q-table tr.filler td { height: 22px; }
    .q-table tfoot .total-row td { padding: 4px 8px; border-bottom: none; font-size: 10pt; color: #333; }
    .q-table tfoot .grand-total-row td { padding: 6px 8px; background: #f0f4f8; font-weight: bold; font-size: 12pt; }
    .q-table tfoot .grand-total-row td.grand { color: #1b2e4b; font-size: 13pt; }
    .q-note { margin: 8px 0; padding: 8px 12px; background: #fff8e8; border-left: 3px solid #f59e0b; font-size: 9.5pt; border-radius: 2px; }
    .q-terms { margin: 10px 0; padding: 8px 12px; background: #f5f7fa; border-radius: 4px; font-size: 8.5pt; color: #555; line-height: 1.8; }
    .q-signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 24px; padding-top: 16px; }
    .q-sig-block { text-align: center; }
    .q-sig-line { border-top: 1px solid #888; margin-bottom: 6px; margin-top: 30px; }
    .q-sig-label { font-weight: bold; font-size: 10pt; }
    .q-sig-name { font-size: 9.5pt; color: #555; margin-top: 2px; }
    .q-sig-date { font-size: 8.5pt; color: #777; margin-top: 4px; }
    .q-footer { margin-top: 16px; text-align: center; font-size: 8pt; color: #aaa; border-top: 1px solid #ddd; padding-top: 6px; }

    .fade-enter-active, .fade-leave-active { transition: none; }
}
</style>
