<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><NuxtLink to="/orders" class="text-primary hover:underline">รายการคำสั่งซื้อ</NuxtLink></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>สร้างคำสั่งซื้อใหม่</span></li>
        </ul>

        <div class="space-y-6">

            <!-- ══ Panel 1: ข้อมูลลูกค้า ══════════════════════════════════ -->
            <div class="panel">
                <div class="mb-5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">1</div>
                        <h5 class="text-lg font-semibold dark:text-white-light">ข้อมูลลูกค้า</h5>
                    </div>
                    <button v-if="selectedCustomer" class="btn btn-outline-secondary px-3 py-1.5 text-sm" @click="reopenPicker">เปลี่ยนลูกค้า</button>
                </div>

                <div v-if="!selectedCustomer" class="rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                    <div class="text-3xl mb-2">👤</div>
                    <div class="text-sm">กรุณาเลือกลูกค้าก่อนเริ่มสร้างคำสั่งซื้อ</div>
                </div>

                <div v-else-if="selectedCustomer.type === 'existing'" class="rounded-xl bg-gray-50 dark:bg-[#1a2941] p-4">
                    <span class="badge badge-outline-primary text-xs mb-3 inline-block">ลูกค้าเก่า</span>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Sold-to</div>
                            <div class="font-semibold dark:text-white-dark">{{ selectedCustomer.soldToName }}</div>
                            <div class="text-xs text-gray-400 font-mono">{{ selectedCustomer.soldToCode }}</div>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Ship-to (สถานที่จัดส่ง)</div>
                            <div class="font-semibold dark:text-white-dark">{{ selectedCustomer.shipToName }}</div>
                            <div class="text-xs text-gray-400 font-mono">{{ selectedCustomer.shipToCode }}</div>
                            <div v-if="selectedCustomer.shipToAddress" class="text-xs text-gray-500 mt-0.5">{{ selectedCustomer.shipToAddress }}</div>
                        </div>
                    </div>
                </div>

                <div v-else class="rounded-xl bg-gray-50 dark:bg-[#1a2941] p-4">
                    <span class="badge badge-outline-success text-xs mb-3 inline-block">ลูกค้าใหม่</span>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="space-y-1.5 text-sm">
                            <div><span class="text-gray-400">ผู้ติดต่อ:</span> <span class="font-semibold dark:text-white-dark">{{ selectedCustomer.contactName }}</span></div>
                            <div><span class="text-gray-400">โทร:</span> <span class="dark:text-gray-200">{{ selectedCustomer.phone }}</span></div>
                            <div><span class="text-gray-400">อีเมล:</span> <span class="dark:text-gray-200">{{ selectedCustomer.email }}</span></div>
                        </div>
                        <div>
                            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">ที่อยู่จัดส่ง</div>
                            <div class="text-sm dark:text-gray-200">{{ selectedCustomer.shipToAddress }}</div>
                            <div class="text-xs text-gray-400 mt-0.5">{{ [selectedCustomer.subdistrict, selectedCustomer.district, selectedCustomer.province, selectedCustomer.postcode].filter(Boolean).join(' ') }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ══ Panel 2: รายการสินค้า ══════════════════════════════════ -->
            <div class="panel">
                <div class="mb-5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">2</div>
                        <h5 class="text-lg font-semibold dark:text-white-light">รายการสินค้า</h5>
                    </div>
                    <button class="btn btn-outline-primary" @click="showProductModal = true" :disabled="!selectedCustomer">+ เพิ่มสินค้า</button>
                </div>

                <p v-if="errors.items" class="mb-3 text-sm text-danger">{{ errors.items }}</p>

                <div v-if="form.items.length > 0" class="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr style="background-color: #1b2e4b !important; color: white !important;">
                                <th class="w-12 !text-center">ลำดับ</th>
                                <th class="w-24">รหัส</th>
                                <th>ชื่อสินค้า</th>
                                <th class="w-32 !text-right">ราคา/ชุด (incl.)</th>
                                <th class="w-36 !text-center">จำนวน (ชุด)</th>
                                <th class="w-36 !text-right">ยอดรวม</th>
                                <th class="w-12 !text-center">ลบ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in form.items" :key="item.productId">
                                <td class="!text-center text-gray-500">{{ idx + 1 }}</td>
                                <td class="text-xs text-gray-400 font-mono">{{ item.productId }}</td>
                                <td>
                                    <div class="font-medium dark:text-white-dark">{{ item.productNameEn }}</div>
                                    <div v-if="item.expiryNote" class="text-xs text-amber-500 mt-0.5">⚠️ {{ item.expiryNote }}</div>
                                </td>
                                <td class="!text-right text-gray-600 dark:text-gray-300">{{ item.priceInVat.toLocaleString('th-TH') }} ฿</td>
                                <td class="!text-center">
                                    <div class="flex items-center justify-center gap-1">
                                        <button class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600" @click="changeQty(item, -1)">−</button>
                                        <input v-model.number="item.qty" type="number" min="1" :max="getStock(item.productId).available" class="form-input w-16 text-center py-1 px-1" @input="clampQty(item)" />
                                        <button class="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 dark:border-gray-600" @click="changeQty(item, 1)">+</button>
                                    </div>
                                </td>
                                <td class="!text-right font-semibold text-primary">{{ (item.priceInVat * item.qty).toLocaleString('th-TH') }} ฿</td>
                                <td class="!text-center">
                                    <button class="text-danger hover:opacity-70" @click="removeItem(item.productId)">✕</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="mb-5 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-10 text-center text-gray-400">
                    ยังไม่มีสินค้า — กด "+ เพิ่มสินค้า" เพื่อเลือกจาก catalog
                </div>

                <div v-if="form.items.length > 0" class="ltr:ml-auto rtl:mr-auto w-full max-w-xs rounded-xl bg-gray-50 dark:bg-[#1a2941] p-4 space-y-1.5">
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>รวมก่อน VAT</span><span>{{ totalExVat.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span>
                    </div>
                    <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                        <span>VAT 7%</span><span>{{ vatAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }} ฿</span>
                    </div>
                    <div class="border-t border-gray-300 dark:border-gray-600 pt-2 flex justify-between font-bold dark:text-white">
                        <span>ยอดรวมทั้งสิ้น</span>
                        <span class="text-primary text-lg">{{ totalInVat.toLocaleString('th-TH') }} ฿</span>
                    </div>
                </div>
            </div>

            <!-- ══ Panel 3: ผู้ติดต่อปลายทาง ══════════════════════════════ -->
            <div class="panel">
                <div class="mb-5 flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">3</div>
                    <div>
                        <h5 class="text-lg font-semibold dark:text-white-light">ผู้ติดต่อปลายทาง</h5>
                        <p class="text-xs text-gray-400 mt-0.5">บุคคลที่จะรับสินค้า ณ สถานที่จัดส่ง</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ชื่อผู้ติดต่อปลายทาง <span class="text-danger">*</span></label>
                        <input v-model="form.deliveryContact.name" type="text" class="form-input w-full" :class="errors.deliveryContactName ? 'border-danger' : ''" placeholder="ชื่อ-นามสกุล ผู้รับสินค้า" />
                        <p v-if="errors.deliveryContactName" class="text-danger text-xs mt-1">{{ errors.deliveryContactName }}</p>
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">เบอร์โทรผู้ติดต่อ <span class="text-danger">*</span></label>
                        <input v-model="form.deliveryContact.phone" type="tel" class="form-input w-full" :class="errors.deliveryContactPhone ? 'border-danger' : ''" placeholder="0xx-xxx-xxxx" />
                        <p v-if="errors.deliveryContactPhone" class="text-danger text-xs mt-1">{{ errors.deliveryContactPhone }}</p>
                    </div>
                </div>
            </div>

            <!-- ══ Panel 4: ใบกำกับภาษี ═══════════════════════════════════ -->
            <div class="panel">
                <div class="mb-5 flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">4</div>
                    <h5 class="text-lg font-semibold dark:text-white-light">ใบกำกับภาษี</h5>
                </div>

                <div class="mb-4">
                    <label class="mb-2 block text-sm font-medium dark:text-white-light">ต้องการขอใบกำกับภาษีหรือไม่? <span class="text-danger">*</span></label>
                    <div class="flex flex-wrap gap-3">
                        <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 transition-colors"
                            :class="form.taxInvoice.requested === true ? 'border-success bg-success/5 dark:bg-success/10' : 'border-gray-300 dark:border-[#2d3e5c]'">
                            <input type="radio" :value="true" v-model="form.taxInvoice.requested" class="form-radio text-success" @change="onTaxRequest(true)" />
                            <span class="font-medium">🧾 ขอใบกำกับภาษี</span>
                        </label>
                        <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border px-4 py-2.5 transition-colors"
                            :class="form.taxInvoice.requested === false ? 'border-secondary bg-gray-50 dark:bg-gray-800/30' : 'border-gray-300 dark:border-[#2d3e5c]'">
                            <input type="radio" :value="false" v-model="form.taxInvoice.requested" class="form-radio" @change="onTaxRequest(false)" />
                            <span class="font-medium">ไม่ขอ</span>
                        </label>
                    </div>
                    <p v-if="errors.taxInvoice" class="text-danger text-xs mt-2">{{ errors.taxInvoice }}</p>
                </div>

                <transition name="slide-down">
                    <div v-if="form.taxInvoice.requested === true" class="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div v-if="selectedCustomer?.type === 'existing'" class="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-xs text-blue-600 dark:text-blue-300">
                            💡 Auto-fill จากข้อมูล Sold-to — แก้ไขได้ตามต้องการ
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ชื่อบริษัท/บุคคล <span class="text-danger">*</span></label>
                            <input v-model="form.taxInvoice.taxName" type="text" class="form-input w-full" :class="errors.taxName ? 'border-danger' : ''" placeholder="ชื่อตามทะเบียน" />
                            <p v-if="errors.taxName" class="text-danger text-xs mt-1">{{ errors.taxName }}</p>
                        </div>
                        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">เลขประจำตัวผู้เสียภาษี <span class="text-danger">*</span></label>
                                <input v-model="form.taxInvoice.taxId" type="text" class="form-input w-full font-mono" :class="errors.taxId ? 'border-danger' : ''" maxlength="13" placeholder="0000000000000" />
                                <p v-if="errors.taxId" class="text-danger text-xs mt-1">{{ errors.taxId }}</p>
                            </div>
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">สาขา</label>
                                <input v-model="form.taxInvoice.branch" type="text" class="form-input w-full" placeholder="สำนักงานใหญ่ / เลขสาขา" />
                            </div>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ที่อยู่สำหรับออกใบกำกับภาษี <span class="text-danger">*</span></label>
                            <textarea v-model="form.taxInvoice.taxAddress" rows="2" class="form-textarea w-full resize-none" :class="errors.taxAddress ? 'border-danger' : ''" placeholder="ที่อยู่ตามทะเบียนบริษัท"></textarea>
                            <p v-if="errors.taxAddress" class="text-danger text-xs mt-1">{{ errors.taxAddress }}</p>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- ══ Panel 5: หมายเหตุ ══════════════════════════════════════ -->
            <div class="panel">
                <div class="mb-5 flex items-center gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white font-bold text-sm flex-shrink-0">5</div>
                    <h5 class="text-lg font-semibold dark:text-white-light">หมายเหตุ</h5>
                </div>
                <div class="space-y-4">
                    <div class="max-w-xs">
                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">
                            📅 วันที่ต้องการรับสินค้า
                            <span class="text-xs font-normal text-gray-400 ml-1">(ระบุเพื่อความสะดวกในการจัดส่ง)</span>
                        </label>
                        <input v-model="form.requestedDeliveryDate" type="date" class="form-input w-full" :min="new Date().toISOString().slice(0, 10)" />
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">หมายเหตุการจัดส่ง</label>
                        <textarea v-model="form.deliveryNote" class="form-textarea w-full resize-none" rows="2" placeholder="เช่น วันเวลาที่ต้องการให้จัดส่ง, ข้อควรระวัง, จุดสังเกตสถานที่..."></textarea>
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">หมายเหตุคำสั่งซื้อ</label>
                        <textarea v-model="form.note" class="form-textarea w-full resize-none" rows="2" placeholder="หมายเหตุทั่วไปของคำสั่งซื้อ..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Action Bar -->
            <div class="flex items-center justify-end gap-3">
                <NuxtLink to="/orders" class="btn btn-outline-danger">ยกเลิก</NuxtLink>
                <button class="btn btn-outline-secondary" @click="handleDraft" :disabled="!selectedCustomer">บันทึกร่าง</button>
                <button class="btn btn-primary px-6" @click="handleSubmit" :disabled="!selectedCustomer">ตรวจสอบ & ส่งคำสั่งซื้อ →</button>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════
             Modal 1: Customer Picker
        ═══════════════════════════════════════════════════════════ -->
        <transition name="fade">
            <div v-if="showCustomerPicker" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div class="w-full max-w-xl rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b] max-h-[90vh] flex flex-col">
                    <div class="border-b border-gray-200 p-5 dark:border-[#2d3e5c] shrink-0">
                        <h4 class="font-bold dark:text-white">เลือกข้อมูลลูกค้า</h4>
                        <p class="mt-0.5 text-sm text-gray-400">กรุณาระบุประเภทลูกค้าก่อนสร้างคำสั่งซื้อ</p>
                    </div>
                    <div class="border-b border-gray-200 dark:border-[#2d3e5c] px-5 pt-4 pb-0 shrink-0">
                        <div class="flex">
                            <button class="flex-1 rounded-tl-lg border px-4 py-2.5 text-sm font-semibold transition-colors"
                                :class="pickerType === 'existing' ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:text-primary dark:border-[#2d3e5c]'"
                                @click="pickerType = 'existing'">
                                👤 ลูกค้าเก่า <span class="ml-1 text-xs font-normal opacity-80">เลือกจากระบบ</span>
                            </button>
                            <button class="flex-1 rounded-tr-lg border-t border-b border-r px-4 py-2.5 text-sm font-semibold transition-colors"
                                :class="pickerType === 'new' ? 'bg-success text-white border-success' : 'border-gray-300 text-gray-500 hover:text-success dark:border-[#2d3e5c]'"
                                @click="pickerType = 'new'">
                                ✨ ลูกค้าใหม่ <span class="ml-1 text-xs font-normal opacity-80">กรอกข้อมูลเอง</span>
                            </button>
                        </div>
                    </div>
                    <div class="overflow-y-auto flex-1 p-5">
                        <div v-if="pickerType === 'existing'" class="space-y-4">
                            <div>
                                <label class="mb-1.5 block text-sm font-medium dark:text-white-light">Sold-to <span class="text-danger">*</span></label>
                                <select v-model="pickerSoldToCode" class="form-select w-full" @change="pickerShipToCode = ''">
                                    <option value="">-- เลือก Sold-to --</option>
                                    <option v-for="s in soldToList" :key="s.soldToCode" :value="s.soldToCode">{{ s.soldToCode }} — {{ s.soldToName }}</option>
                                </select>
                            </div>
                            <div v-if="pickerSoldToCode">
                                <label class="mb-2 block text-sm font-medium dark:text-white-light">สถานที่จัดส่ง <span class="text-danger">*</span> <span class="text-xs font-normal text-gray-400">({{ pickerAvailableShipTo.length }} สถานที่)</span></label>
                                <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
                                    <label v-for="s in pickerAvailableShipTo" :key="s.shipToCode"
                                        class="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors"
                                        :class="pickerShipToCode === s.shipToCode ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-gray-200 hover:border-primary/40 dark:border-[#2d3e5c]'">
                                        <input type="radio" :value="s.shipToCode" v-model="pickerShipToCode" class="form-radio mt-0.5 text-primary" />
                                        <div>
                                            <div class="font-medium dark:text-white-dark">{{ s.unitName ? s.unitName + ' — ' : '' }}{{ s.shipToName }}</div>
                                            <div class="text-xs text-gray-400 font-mono">{{ s.shipToCode }}</div>
                                            <div v-if="s.address" class="text-xs text-gray-500 mt-0.5">{{ s.address }}</div>
                                            <div v-if="s.province" class="text-xs text-gray-400">{{ [s.district, s.province, s.postcode].filter(Boolean).join(' ') }}</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div v-else class="rounded-lg bg-gray-50 dark:bg-[#243150] p-4 text-sm text-gray-400 text-center">เลือก Sold-to ก่อนเพื่อแสดงสถานที่จัดส่ง</div>
                        </div>
                        <div v-else class="space-y-4">
                            <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-700 dark:text-blue-300">💡 กรอกข้อมูลผู้ติดต่อและที่อยู่จัดส่ง ระบบจะบันทึกสำหรับ Order นี้</div>
                            <div class="space-y-3">
                                <h6 class="text-xs font-semibold uppercase tracking-wide text-gray-500">ข้อมูลผู้ติดต่อ</h6>
                                <div>
                                    <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ชื่อผู้ติดต่อ <span class="text-danger">*</span></label>
                                    <input v-model="newCustomer.contactName" type="text" class="form-input w-full" placeholder="ชื่อ-นามสกุล" />
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div>
                                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">เบอร์โทร <span class="text-danger">*</span></label>
                                        <input v-model="newCustomer.phone" type="tel" class="form-input w-full" placeholder="0xx-xxx-xxxx" />
                                    </div>
                                    <div>
                                        <label class="mb-1.5 block text-sm font-medium dark:text-white-light">อีเมล <span class="text-danger">*</span></label>
                                        <input v-model="newCustomer.email" type="email" class="form-input w-full" placeholder="example@email.com" />
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-3">
                                <h6 class="text-xs font-semibold uppercase tracking-wide text-gray-500">ที่อยู่จัดส่ง</h6>
                                <div>
                                    <label class="mb-1.5 block text-sm font-medium dark:text-white-light">ที่อยู่ <span class="text-danger">*</span></label>
                                    <textarea v-model="newCustomer.address" rows="2" class="form-textarea w-full resize-none" placeholder="บ้านเลขที่ ซอย ถนน..."></textarea>
                                </div>
                                <div class="grid grid-cols-2 gap-3">
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">แขวง/ตำบล</label><input v-model="newCustomer.subdistrict" type="text" class="form-input w-full" /></div>
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">เขต/อำเภอ</label><input v-model="newCustomer.district" type="text" class="form-input w-full" /></div>
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">จังหวัด</label><input v-model="newCustomer.province" type="text" class="form-input w-full" /></div>
                                    <div><label class="mb-1 block text-xs font-medium dark:text-white-light">รหัสไปรษณีย์</label><input v-model="newCustomer.postcode" type="text" class="form-input w-full" maxlength="5" /></div>
                                </div>
                            </div>
                        </div>
                        <p v-if="pickerError" class="text-sm text-danger mt-3">{{ pickerError }}</p>
                    </div>
                    <div class="shrink-0 flex justify-between gap-3 border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <button class="btn btn-outline-danger" @click="cancelPicker">ยกเลิก</button>
                        <button class="btn btn-primary px-6" @click="confirmPicker">ยืนยันข้อมูลลูกค้า →</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ═══════════════════════════════════════════════════════════
             Modal 2: Product Picker
        ═══════════════════════════════════════════════════════════ -->
        <transition name="fade">
            <div v-if="showProductModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" @click.self="showProductModal = false">
                <div class="flex h-[80vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b]">
                    <div class="flex items-center justify-between border-b border-gray-200 p-5 dark:border-[#2d3e5c]">
                        <h4 class="font-bold dark:text-white">เลือกสินค้า</h4>
                        <button class="text-gray-400 hover:text-gray-600 text-xl" @click="showProductModal = false">✕</button>
                    </div>
                    <div class="border-b border-gray-100 dark:border-[#2d3e5c] p-4 flex flex-col gap-3 sm:flex-row">
                        <input v-model="productSearch" type="text" class="form-input flex-1" placeholder="ค้นหาสินค้า..." />
                        <div class="flex flex-wrap gap-2">
                            <button v-for="t in productTypeTabs" :key="t.key"
                                class="rounded-full px-3 py-1 text-xs font-medium border transition-colors"
                                :class="productTypeFilter === t.key ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500 hover:border-primary hover:text-primary dark:border-gray-600'"
                                @click="productTypeFilter = t.key">{{ t.label }}</button>
                        </div>
                    </div>
                    <div class="flex-1 overflow-y-auto p-4 space-y-2">
                        <div v-for="product in filteredModalProducts" :key="product.id"
                            class="flex items-center justify-between rounded-lg border border-gray-200 dark:border-[#2d3e5c] p-3 transition-colors"
                            :class="isAdded(product.id) ? 'bg-primary/5 border-primary/30' : getStatus(product.id) === 'out' ? 'opacity-50 bg-red-50 dark:bg-red-900/10 border-red-200' : 'hover:bg-gray-50 dark:hover:bg-[#243150] cursor-pointer'"
                            @click="!isAdded(product.id) && getStatus(product.id) !== 'out' && addProduct(product)">
                            <div class="flex items-center gap-3">
                                <span class="text-2xl">{{ typeEmoji(product.type) }}</span>
                                <div>
                                    <div class="text-sm font-medium dark:text-white-dark">{{ product.nameEn }}</div>
                                    <div class="text-xs text-gray-400 flex flex-wrap items-center gap-x-2">
                                        <span class="badge badge-outline-primary text-[10px]">{{ product.id }}</span>
                                        <span>{{ product.priceInVat.toLocaleString() }} ฿/ชุด</span>
                                        <span :class="getStatus(product.id) === 'out' ? 'text-danger' : getStatus(product.id) === 'low' ? 'text-warning' : 'text-success'">
                                            Available: {{ getStock(product.id).available }}<span v-if="getStatus(product.id) === 'out'"> (หมด)</span><span v-else-if="getStatus(product.id) === 'low'"> (ใกล้หมด)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex-shrink-0">
                                <span v-if="isAdded(product.id)" class="text-xs text-primary font-medium">✓ เพิ่มแล้ว</span>
                                <span v-else-if="getStatus(product.id) === 'out'" class="text-xs text-danger">หมดสต็อก</span>
                                <button v-else class="btn btn-sm btn-outline-primary px-3 py-1 text-xs" @click.stop="addProduct(product)">+ เพิ่ม</button>
                            </div>
                        </div>
                        <div v-if="filteredModalProducts.length === 0" class="py-10 text-center text-gray-400">ไม่พบสินค้า</div>
                    </div>
                    <div class="border-t border-gray-200 dark:border-[#2d3e5c] p-4 flex justify-between items-center">
                        <span class="text-sm text-gray-500">เลือกแล้ว {{ form.items.length }} รายการ</span>
                        <button class="btn btn-primary px-6" @click="showProductModal = false">ยืนยัน</button>
                    </div>
                </div>
            </div>
        </transition>

        <!-- ═══════════════════════════════════════════════════════════
             Modal 3: Confirm Summary ก่อน Submit
        ═══════════════════════════════════════════════════════════ -->
        <transition name="fade">
            <div v-if="showConfirmModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                <div class="w-full max-w-2xl rounded-xl bg-white shadow-2xl dark:bg-[#1b2e4b] max-h-[92vh] flex flex-col">
                    <div class="border-b border-gray-200 dark:border-[#2d3e5c] p-5 shrink-0">
                        <h4 class="font-bold dark:text-white">✅ ตรวจสอบคำสั่งซื้อก่อนส่ง</h4>
                        <p class="text-sm text-gray-400 mt-0.5">กรุณาตรวจสอบข้อมูลทั้งหมดให้ถูกต้องก่อนยืนยัน</p>
                    </div>

                    <div class="overflow-y-auto flex-1 p-5 space-y-5">
                        <!-- ข้อมูลลูกค้า -->
                        <div class="rounded-xl bg-gray-50 dark:bg-[#243150] p-4">
                            <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">ข้อมูลลูกค้า</div>
                            <div v-if="selectedCustomer?.type === 'existing'" class="grid grid-cols-2 gap-3 text-sm">
                                <div><span class="text-gray-400">Sold-to: </span><span class="font-medium dark:text-white-dark">{{ selectedCustomer.soldToName }}</span></div>
                                <div><span class="text-gray-400">Ship-to: </span><span class="font-medium dark:text-white-dark">{{ selectedCustomer.shipToName }}</span></div>
                                <div v-if="selectedCustomer.shipToAddress" class="col-span-2 text-xs text-gray-500">{{ selectedCustomer.shipToAddress }}</div>
                            </div>
                            <div v-else class="grid grid-cols-2 gap-3 text-sm">
                                <div><span class="text-gray-400">ผู้ติดต่อ: </span><span class="font-medium dark:text-white-dark">{{ selectedCustomer?.contactName }}</span></div>
                                <div><span class="text-gray-400">โทร: </span><span class="dark:text-gray-200">{{ selectedCustomer?.phone }}</span></div>
                                <div class="col-span-2"><span class="text-gray-400">ที่อยู่: </span><span class="dark:text-gray-200">{{ selectedCustomer?.shipToAddress }}</span></div>
                            </div>
                        </div>

                        <!-- รายการสินค้า -->
                        <div>
                            <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">รายการสินค้า ({{ form.items.length }} รายการ)</div>
                            <div class="rounded-xl border border-gray-200 dark:border-[#2d3e5c] overflow-hidden">
                                <table class="w-full text-sm">
                                    <thead>
                                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                                            <th class="px-3 py-2 text-left">สินค้า</th>
                                            <th class="px-3 py-2 text-center w-20">จำนวน</th>
                                            <th class="px-3 py-2 text-right w-32">ยอดรวม</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                                        <tr v-for="item in form.items" :key="item.productId">
                                            <td class="px-3 py-2 font-medium dark:text-white-dark">{{ item.productNameEn }} <span class="text-xs text-gray-400 font-mono">({{ item.productId }})</span></td>
                                            <td class="px-3 py-2 text-center">{{ item.qty }} ชุด</td>
                                            <td class="px-3 py-2 text-right font-semibold text-primary">{{ (item.priceInVat * item.qty).toLocaleString('th-TH') }} ฿</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="bg-gray-50 dark:bg-[#1a2941] font-bold">
                                            <td class="px-3 py-2" colspan="2">ยอดรวมทั้งสิ้น (incl. VAT 7%)</td>
                                            <td class="px-3 py-2 text-right text-primary text-base">{{ totalInVat.toLocaleString('th-TH') }} ฿</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <!-- ผู้ติดต่อ + ใบกำกับ -->
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div class="rounded-xl bg-gray-50 dark:bg-[#243150] p-4">
                                <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">ผู้ติดต่อปลายทาง</div>
                                <div class="text-sm">
                                    <div class="font-medium dark:text-white-dark">{{ form.deliveryContact.name }}</div>
                                    <div class="text-gray-500">{{ form.deliveryContact.phone }}</div>
                                </div>
                            </div>
                            <div class="rounded-xl bg-gray-50 dark:bg-[#243150] p-4">
                                <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">ใบกำกับภาษี</div>
                                <div v-if="form.taxInvoice.requested === false" class="text-sm text-gray-500">ไม่ขอใบกำกับภาษี</div>
                                <div v-else class="text-sm space-y-0.5">
                                    <div class="font-medium dark:text-white-dark">{{ form.taxInvoice.taxName }}</div>
                                    <div class="text-gray-400 font-mono text-xs">เลขภาษี: {{ form.taxInvoice.taxId }}</div>
                                    <div class="text-gray-500 text-xs">{{ form.taxInvoice.taxAddress }}</div>
                                </div>
                            </div>
                        </div>

                        <!-- วันที่ต้องการรับสินค้า -->
                        <div v-if="form.requestedDeliveryDate" class="rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 p-3 flex items-center gap-2">
                            <span class="text-indigo-500">📅</span>
                            <span class="text-sm text-gray-700 dark:text-gray-200"><span class="font-medium">ต้องการรับสินค้า:</span> {{ form.requestedDeliveryDate }}</span>
                        </div>

                        <!-- หมายเหตุ -->
                        <div v-if="form.deliveryNote || form.note" class="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4">
                            <div class="text-xs font-semibold uppercase tracking-wide text-amber-600 mb-2">หมายเหตุ</div>
                            <div v-if="form.deliveryNote" class="text-sm text-gray-700 dark:text-gray-200"><span class="font-medium">การจัดส่ง:</span> {{ form.deliveryNote }}</div>
                            <div v-if="form.note" class="text-sm text-gray-700 dark:text-gray-200 mt-1"><span class="font-medium">ทั่วไป:</span> {{ form.note }}</div>
                        </div>

                        <div class="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-xs text-blue-700 dark:text-blue-300">
                            💡 หลังส่งคำสั่งซื้อ คุณสามารถกลับมาแก้ไขได้ภายใน <strong>{{ EDIT_WINDOW_MIN }} นาที</strong>
                        </div>
                    </div>

                    <div class="shrink-0 flex justify-between gap-3 border-t border-gray-200 px-5 py-3 dark:border-[#2d3e5c]">
                        <button class="btn btn-outline-secondary" @click="showConfirmModal = false">← ย้อนกลับแก้ไข</button>
                        <button class="btn btn-primary px-6" @click="confirmSubmit">ยืนยันส่งคำสั่งซื้อ ✓</button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed, onMounted } from 'vue';

    useHead({ title: 'Order Management | สร้างคำสั่งซื้อ' });

    const EDIT_WINDOW_MIN = 30;
    type CustomerType = 'existing' | 'new';
    type ProductType = 'gift-set' | 'premium' | 'capsule' | 'tumbler' | 'machine';

    interface SoldToData { soldToCode: string; soldToName: string; taxId: string; taxName: string; taxAddress: string; }
    interface ShipToData { soldToCode: string; shipToCode: string; shipToName: string; unitName?: string; address?: string; province?: string; district?: string; postcode?: string; }
    interface SelectedCustomer { type: CustomerType; soldToCode: string; soldToName: string; shipToCode: string; shipToName: string; shipToAddress?: string; contactName?: string; phone?: string; email?: string; subdistrict?: string; district?: string; province?: string; postcode?: string; }
    interface Product { id: string; nameEn: string; nameTh: string; type: ProductType; priceInVat: number; priceExVat: number; qtyPerCarton: number; expiryNote: string; }
    interface OrderItem { productId: string; productNameEn: string; priceInVat: number; priceExVat: number; qty: number; expiryNote: string; }

    const router = useRouter();
    const orders = useState<any[]>('or-orders', () => []);
    const { getStock, getStatus, reserveStock } = useOrStock();

    // ── Master Data ──────────────────────────────────────────────────
    const soldToList = ref<SoldToData[]>([
        { soldToCode: '0010000186', soldToName: 'บริษัท กฟผ. จำกัด (มหาชน)',     taxId: '0107537000289', taxName: 'บริษัท กฟผ. จำกัด (มหาชน)',     taxAddress: '53 หมู่ 2 ถ.จรัญสนิทวงศ์ ต.บางกรวย อ.บางกรวย จ.นนทบุรี 11130' },
        { soldToCode: '0010000271', soldToName: 'นายประเสริฐ เลี้ยงปารุง',        taxId: '3100600123456', taxName: 'นายประเสริฐ เลี้ยงปารุง',        taxAddress: '200 ถ.สีลม แขวงบางรัก เขตบางรัก กรุงเทพฯ 10500' },
        { soldToCode: '0010000272', soldToName: 'นายสมชาติ องุ่นศร',              taxId: '3100600654321', taxName: 'นายสมชาติ องุ่นศร',              taxAddress: '55 ถ.นนทบุรี ต.สวนใหญ่ อ.เมือง จ.นนทบุรี 11000' },
        { soldToCode: '0010000273', soldToName: 'นายวิศิษฎ์ เลิศพุทธิกุล',       taxId: '3100700112233', taxName: 'นายวิศิษฎ์ เลิศพุทธิกุล',       taxAddress: '789 ถ.เพชรบุรีตัดใหม่ แขวงมักกะสัน เขตราชเทวี กรุงเทพฯ 10400' },
    ]);

    const shipToList = ref<ShipToData[]>([
        { soldToCode: '0010000186', shipToCode: '0010000079', shipToName: 'สำนักงานใหญ่',   unitName: 'ฝ่ายจัดซื้อ',         address: '53 หมู่ 2 ถ.จรัญสนิทวงศ์', province: 'นนทบุรี', district: 'บางกรวย', postcode: '11130' },
        { soldToCode: '0010000186', shipToCode: '0030000079', shipToName: 'เขื่อนภูมิพล',   unitName: 'ฝ่ายบริหาร',           address: '999 ม.9 ต.สามเงา',          province: 'ตาก',     district: 'สามเงา',  postcode: '63130' },
        { soldToCode: '0010000186', shipToCode: '0030002925', shipToName: 'โรงไฟฟ้าแม่เมาะ', unitName: 'สวัสดิการพนักงาน',   address: '800 ม.5 ต.แม่เมาะ',         province: 'ลำปาง',  district: 'แม่เมาะ', postcode: '52220' },
        { soldToCode: '0010000271', shipToCode: '0010000100', shipToName: 'บ้านพัก',         address: '200 ถ.สีลม',             province: 'กรุงเทพฯ', district: 'บางรัก',  postcode: '10500' },
        { soldToCode: '0010000272', shipToCode: '0020000050', shipToName: 'บ้านพัก',         address: '55 ถ.นนทบุรี',           province: 'นนทบุรี', district: 'เมือง',    postcode: '11000' },
        { soldToCode: '0010000273', shipToCode: '0020000051', shipToName: 'บ้านพัก',         address: '789 ถ.เพชรบุรีตัดใหม่', province: 'กรุงเทพฯ', district: 'ราชเทวี', postcode: '10400' },
    ]);

    // ── Customer Picker ──────────────────────────────────────────────
    const showCustomerPicker = ref(true);
    const pickerType = ref<CustomerType>('existing');
    const pickerSoldToCode = ref('');
    const pickerShipToCode = ref('');
    const pickerError = ref('');
    const newCustomer = ref({ contactName: '', phone: '', email: '', address: '', subdistrict: '', district: '', province: '', postcode: '' });
    const selectedCustomer = ref<SelectedCustomer | null>(null);
    const pickerAvailableShipTo = computed(() => pickerSoldToCode.value ? shipToList.value.filter(s => s.soldToCode === pickerSoldToCode.value) : []);

    onMounted(() => { showCustomerPicker.value = true; });

    const confirmPicker = () => {
        pickerError.value = '';
        if (pickerType.value === 'existing') {
            if (!pickerSoldToCode.value) { pickerError.value = 'กรุณาเลือก Sold-to'; return; }
            if (!pickerShipToCode.value) { pickerError.value = 'กรุณาเลือกสถานที่จัดส่ง'; return; }
            const soldTo = soldToList.value.find(s => s.soldToCode === pickerSoldToCode.value)!;
            const shipTo = shipToList.value.find(s => s.shipToCode === pickerShipToCode.value)!;
            selectedCustomer.value = {
                type: 'existing', soldToCode: soldTo.soldToCode, soldToName: soldTo.soldToName,
                shipToCode: shipTo.shipToCode,
                shipToName: `${shipTo.unitName ? shipTo.unitName + ' — ' : ''}${shipTo.shipToName}`,
                shipToAddress: shipTo.address, province: shipTo.province, district: shipTo.district, postcode: shipTo.postcode,
            };
        } else {
            if (!newCustomer.value.contactName.trim()) { pickerError.value = 'กรุณาระบุชื่อผู้ติดต่อ'; return; }
            if (!newCustomer.value.phone.trim()) { pickerError.value = 'กรุณาระบุเบอร์โทร'; return; }
            if (!newCustomer.value.email.trim()) { pickerError.value = 'กรุณาระบุอีเมล'; return; }
            if (!newCustomer.value.address.trim()) { pickerError.value = 'กรุณาระบุที่อยู่จัดส่ง'; return; }
            selectedCustomer.value = {
                type: 'new', soldToCode: 'NEW', soldToName: newCustomer.value.contactName,
                shipToCode: 'NEW-SHIP', shipToName: newCustomer.value.address, shipToAddress: newCustomer.value.address,
                contactName: newCustomer.value.contactName, phone: newCustomer.value.phone, email: newCustomer.value.email,
                subdistrict: newCustomer.value.subdistrict, district: newCustomer.value.district,
                province: newCustomer.value.province, postcode: newCustomer.value.postcode,
            };
        }
        showCustomerPicker.value = false;
    };
    const cancelPicker = () => { if (!selectedCustomer.value) router.push('/orders'); else showCustomerPicker.value = false; };
    const reopenPicker = () => { pickerError.value = ''; showCustomerPicker.value = true; };

    // ── Tax Invoice Auto-fill ────────────────────────────────────────
    const onTaxRequest = (requested: boolean) => {
        if (requested && selectedCustomer.value?.type === 'existing') {
            const soldTo = soldToList.value.find(s => s.soldToCode === selectedCustomer.value?.soldToCode);
            if (soldTo) {
                form.value.taxInvoice.taxName = soldTo.taxName;
                form.value.taxInvoice.taxId = soldTo.taxId;
                form.value.taxInvoice.taxAddress = soldTo.taxAddress;
            }
        }
        if (!requested) { form.value.taxInvoice.taxName = ''; form.value.taxInvoice.taxId = ''; form.value.taxInvoice.taxAddress = ''; form.value.taxInvoice.branch = ''; }
    };

    // ── Product Catalog ──────────────────────────────────────────────
    const productCatalog = ref<Product[]>([
        { id: 'GS-01', nameEn: 'SIGNATURE BREW GIFT SET',              nameTh: '',type:'gift-set',priceInVat:699, priceExVat:653.27,qtyPerCarton:6, expiryNote:'หมด ก.ค. 2569' },
        { id: 'GS-02', nameEn: 'TEA OF JOY GIFT SET',                  nameTh: '',type:'gift-set',priceInVat:479, priceExVat:447.66,qtyPerCarton:4, expiryNote:'หมด ส.ค. 2569' },
        { id: 'GS-03', nameEn: 'GREEN TEA JUMBO GIFT SET',             nameTh: '',type:'gift-set',priceInVat:749, priceExVat:700,   qtyPerCarton:6, expiryNote:'หมด ส.ค. 2569' },
        { id: 'GS-04', nameEn: 'COFFEE TO GO GIFT SET',                nameTh: '',type:'gift-set',priceInVat:349, priceExVat:326.17,qtyPerCarton:6, expiryNote:'หมด ต.ค. 2569' },
        { id: 'GS-05', nameEn: 'SENCHA MOMENT GIFT SET',               nameTh: '',type:'gift-set',priceInVat:449, priceExVat:419.63,qtyPerCarton:4, expiryNote:'หมด ส.ค. 2569' },
        { id: 'GS-06', nameEn: 'SILVER & STELLAR DRIP COFFEE GIFT SET',nameTh: '',type:'gift-set',priceInVat:699, priceExVat:653.27,qtyPerCarton:4, expiryNote:'หมด ก.ย. 2569' },
        { id: 'GS-07', nameEn: 'RHYTHM OF CAPSULE GIFT SET',           nameTh: '',type:'gift-set',priceInVat:1279,priceExVat:1195.33,qtyPerCarton:4,expiryNote:'หมด ส.ค. 2569' },
        { id: 'MC-01', nameEn: 'NEW COFFEE CAPSULE MACHINE',           nameTh: '',type:'machine', priceInVat:3399,priceExVat:3176.64,qtyPerCarton:1,expiryNote:'' },
        { id: 'MC-02', nameEn: 'COFFEE CAPSULE BEGINNER SET',          nameTh: '',type:'machine', priceInVat:2999,priceExVat:2802.80,qtyPerCarton:1,expiryNote:'' },
        { id: 'PM-01', nameEn: 'MORNING DRIP BOX SET',                 nameTh: '',type:'premium', priceInVat:630, priceExVat:588.79,qtyPerCarton:4, expiryNote:'หมด ก.ค. 2569' },
        { id: 'PM-02', nameEn: 'TEA MOMENT BOX SET',                   nameTh: '',type:'premium', priceInVat:299, priceExVat:279.44,qtyPerCarton:3, expiryNote:'หมด ก.ค. 2569' },
        { id: 'CP-01', nameEn: 'COFFEE CAPSULE SPIRIT — Winery',       nameTh: '',type:'capsule', priceInVat:180, priceExVat:168.22,qtyPerCarton:12,expiryNote:'หมด มี.ค. 2569' },
        { id: 'CP-02', nameEn: 'COFFEE CAPSULE SPIRIT — Brandy',       nameTh: '',type:'capsule', priceInVat:180, priceExVat:168.22,qtyPerCarton:12,expiryNote:'หมด มี.ค. 2569' },
        { id: 'CP-03', nameEn: 'COFFEE CAPSULE SPIRIT — Whisky',       nameTh: '',type:'capsule', priceInVat:180, priceExVat:168.22,qtyPerCarton:12,expiryNote:'หมด มี.ค. 2569' },
        { id: 'TB-01', nameEn: 'ORDINARY TUMBLER 22oz',                nameTh: '',type:'tumbler', priceInVat:280, priceExVat:261.68,qtyPerCarton:12,expiryNote:'' },
        { id: 'TB-03', nameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz',   nameTh: '',type:'tumbler', priceInVat:289, priceExVat:270.09,qtyPerCarton:12,expiryNote:'' },
        { id: 'TB-05', nameEn: 'GLITTER TUMBLER 22oz',                 nameTh: '',type:'tumbler', priceInVat:359, priceExVat:335.51,qtyPerCarton:12,expiryNote:'' },
        { id: 'TB-07', nameEn: 'NYYY DESIGN TUMBLER 12oz',             nameTh: '',type:'tumbler', priceInVat:299, priceExVat:279.44,qtyPerCarton:20,expiryNote:'' },
        { id: 'MC-03', nameEn: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN',  nameTh: '',type:'machine', priceInVat:2999,priceExVat:2802.80,qtyPerCarton:1,expiryNote:'' },
    ]);

    const productTypeTabs = [
        { key: 'all', label: 'ทั้งหมด' }, { key: 'gift-set', label: 'Gift Set' },
        { key: 'premium', label: 'Premium' }, { key: 'capsule', label: 'Capsule' },
        { key: 'tumbler', label: 'Tumbler' }, { key: 'machine', label: 'เครื่องชง' },
    ];
    const typeEmoji = (type: ProductType) => ({ 'gift-set': '🎁', premium: '⭐', capsule: '☕', tumbler: '🥤', machine: '⚙️' }[type] ?? '📦');

    // ── Form State ───────────────────────────────────────────────────
    const form = ref({
        items: [] as OrderItem[],
        deliveryContact: { name: '', phone: '' },
        requestedDeliveryDate: '',
        deliveryNote: '',
        taxInvoice: { requested: null as boolean | null, taxName: '', taxId: '', taxAddress: '', branch: '' },
        note: '',
    });
    const errors = ref({ items: '', deliveryContactName: '', deliveryContactPhone: '', taxInvoice: '', taxName: '', taxId: '', taxAddress: '' });

    const isAdded = (id: string) => form.value.items.some(i => i.productId === id);
    const addProduct = (p: Product) => {
        if (isAdded(p.id) || getStatus(p.id) === 'out') return;
        form.value.items.push({ productId: p.id, productNameEn: p.nameEn, priceInVat: p.priceInVat, priceExVat: p.priceExVat, qty: p.qtyPerCarton, expiryNote: p.expiryNote });
    };
    const removeItem = (id: string) => { form.value.items = form.value.items.filter(i => i.productId !== id); };
    const changeQty = (item: OrderItem, delta: number) => { item.qty = Math.max(1, Math.min(item.qty + delta, getStock(item.productId).available)); };
    const clampQty = (item: OrderItem) => {
        const max = getStock(item.productId).available;
        if (!item.qty || item.qty < 1) item.qty = 1;
        if (item.qty > max) item.qty = max;
    };

    const totalInVat = computed(() => form.value.items.reduce((s, i) => s + i.priceInVat * i.qty, 0));
    const totalExVat = computed(() => totalInVat.value / 1.07);
    const vatAmount = computed(() => totalInVat.value - totalExVat.value);

    // ── Product Modal ────────────────────────────────────────────────
    const showProductModal = ref(false);
    const productSearch = ref('');
    const productTypeFilter = ref('all');
    const filteredModalProducts = computed(() => {
        let list = productTypeFilter.value === 'all' ? productCatalog.value : productCatalog.value.filter(p => p.type === productTypeFilter.value);
        if (productSearch.value) { const q = productSearch.value.toLowerCase(); list = list.filter(p => p.nameEn.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)); }
        return list;
    });

    // ── Confirm Modal ────────────────────────────────────────────────
    const showConfirmModal = ref(false);

    const validateAll = (): boolean => {
        let ok = true;
        errors.value = { items: '', deliveryContactName: '', deliveryContactPhone: '', taxInvoice: '', taxName: '', taxId: '', taxAddress: '' };
        if (form.value.items.length === 0) { errors.value.items = 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ'; ok = false; }
        if (!form.value.deliveryContact.name.trim()) { errors.value.deliveryContactName = 'กรุณาระบุชื่อผู้ติดต่อปลายทาง'; ok = false; }
        if (!form.value.deliveryContact.phone.trim()) { errors.value.deliveryContactPhone = 'กรุณาระบุเบอร์โทร'; ok = false; }
        if (form.value.taxInvoice.requested === null) { errors.value.taxInvoice = 'กรุณาเลือกว่าต้องการขอใบกำกับภาษีหรือไม่'; ok = false; }
        if (form.value.taxInvoice.requested === true) {
            if (!form.value.taxInvoice.taxName.trim()) { errors.value.taxName = 'กรุณาระบุชื่อสำหรับออกใบกำกับ'; ok = false; }
            if (!form.value.taxInvoice.taxId.trim()) { errors.value.taxId = 'กรุณาระบุเลขผู้เสียภาษี'; ok = false; }
            if (!form.value.taxInvoice.taxAddress.trim()) { errors.value.taxAddress = 'กรุณาระบุที่อยู่'; ok = false; }
        }
        return ok;
    };

    const handleSubmit = () => { if (!validateAll()) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; } showConfirmModal.value = true; };
    const handleDraft = () => {
        errors.value.items = '';
        if (form.value.items.length === 0) { errors.value.items = 'กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ'; return; }
        doSubmit('draft');
    };
    const confirmSubmit = () => { showConfirmModal.value = false; doSubmit('submitted'); };

    const doSubmit = (status: 'draft' | 'submitted') => {
        if (!selectedCustomer.value) return;
        const c = selectedCustomer.value;
        const now = new Date();
        const editDeadline = new Date(now.getTime() + EDIT_WINDOW_MIN * 60 * 1000).toISOString();
        const newId = `ORD${String(orders.value.length + 1).padStart(3, '0')}`;
        const newNo = `QT-2026-${String(orders.value.length + 1).padStart(4, '0')}`;

        const newOrder = {
            id: newId, orderNo: newNo,
            soldToCode: c.soldToCode, soldToName: c.soldToName,
            shipToCode: c.shipToCode, shipToName: c.shipToName,
            customerType: c.type,
            contactName: c.contactName, phone: c.phone, email: c.email,
            deliveryContact: { ...form.value.deliveryContact },
            requestedDeliveryDate: form.value.requestedDeliveryDate || null,
            deliveryNote: form.value.deliveryNote,
            taxInvoice: { ...form.value.taxInvoice },
            items: form.value.items.map(i => ({ ...i, subtotalInVat: i.priceInVat * i.qty })),
            totalExVat: totalExVat.value, vatAmount: vatAmount.value, totalInVat: totalInVat.value,
            note: form.value.note,
            status,
            createdAt: now.toISOString().slice(0, 10),
            submittedAt: status === 'submitted' ? now.toISOString() : null,
            editDeadline: status === 'submitted' ? editDeadline : null,
            history: [{ ts: now.toISOString(), action: status === 'submitted' ? 'submit' : 'draft', detail: status === 'submitted' ? 'สร้างและส่งคำสั่งซื้อ' : 'บันทึกเป็นร่าง' }],
        };

        orders.value.unshift(newOrder);
        if (status === 'submitted') {
            reserveStock(newOrder.items.map((i: any) => ({ productId: i.productId, productNameEn: i.productNameEn, qty: i.qty })), newNo);
        }
        router.push(`/orders/${newId}`);
    };
</script>

<style scoped>
    .fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
    .fade-enter-from, .fade-leave-to { opacity: 0; transform: scale(0.97); }
    .slide-down-enter-active, .slide-down-leave-active { transition: opacity 0.2s ease, max-height 0.3s ease; overflow: hidden; }
    .slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; }
    .slide-down-enter-to, .slide-down-leave-from { opacity: 1; max-height: 600px; }
</style>
