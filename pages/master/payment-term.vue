<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li><a href="javascript:;" class="text-primary hover:underline">Master</a></li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2"><span>Payment Term</span></li>
        </ul>

        <div class="panel">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">เงื่อนไขการชำระเงิน
                    <span class="text-sm font-normal text-gray-400 ml-2">Payment Term</span>
                </h5>
                <div class="ltr:ml-auto rtl:mr-auto">
                    <input v-model="search" type="text" class="form-input w-auto" placeholder="ค้นหา Payment Term..." />
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-20 !text-center">Seq.<br /><span class="text-xs font-normal opacity-80">ลำดับ</span></th>
                            <th class="w-40 !text-center">Payment Term<br /><span class="text-xs font-normal opacity-80">รหัส</span></th>
                            <th>Description<br /><span class="text-xs font-normal opacity-80">รายละเอียด</span></th>
                            <th class="w-32 !text-center">Days<br /><span class="text-xs font-normal opacity-80">จำนวนวัน</span></th>
                            <th class="w-40 !text-center">หมายเหตุ<br /><span class="text-xs font-normal opacity-80">Remark</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, idx) in filteredList" :key="item.code">
                            <td class="!text-center text-gray-500 dark:text-gray-400">{{ idx + 1 }}.</td>
                            <td class="!text-center font-mono font-semibold text-primary">{{ item.code }}</td>
                            <td class="dark:text-white-dark">{{ item.description }}</td>
                            <td class="!text-center text-gray-600 dark:text-gray-300">
                                <span v-if="item.days === 0" class="text-gray-400">—</span>
                                <span v-else>{{ item.days }} วัน</span>
                            </td>
                            <td class="!text-center text-sm text-gray-500 dark:text-gray-400">{{ item.remark || '—' }}</td>
                        </tr>
                        <tr v-if="filteredList.length === 0">
                            <td colspan="5" class="!text-center py-8 text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';

    useHead({ title: 'Master Data | Payment Term' });

    interface PaymentTerm {
        code: string;
        description: string;
        days: number;
        remark: string;
    }

    const search = ref('');

    const paymentTerms = ref<PaymentTerm[]>([
        { code: 'Y000', description: 'Due Immediately',      days: 0,  remark: 'ชำระทันที' },
        { code: 'Y001', description: 'Paid Within 7 days',  days: 7,  remark: '' },
        { code: 'Y002', description: 'Paid Within 10 days', days: 10, remark: '' },
        { code: 'Y003', description: 'Paid Within 15 days', days: 15, remark: '' },
        { code: 'Y004', description: 'Paid Within 30 days', days: 30, remark: '' },
        { code: 'Y005', description: 'Paid Within 45 days', days: 45, remark: '' },
        { code: 'Y006', description: 'Paid Within 60 days', days: 60, remark: '' },
        { code: 'Y007', description: 'Paid Within 90 days', days: 90, remark: '' },
    ]);

    const filteredList = computed(() => {
        if (!search.value) return paymentTerms.value;
        const q = search.value.toLowerCase();
        return paymentTerms.value.filter(
            (p) => p.code.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.remark.includes(q)
        );
    });
</script>
