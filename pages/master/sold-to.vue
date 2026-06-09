<template>
    <div>
        <!-- Breadcrumb -->
        <ul class="flex space-x-2 rtl:space-x-reverse mb-6">
            <li>
                <a href="javascript:;" class="text-primary hover:underline">Master</a>
            </li>
            <li class="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                <span>Sold-to / Ship-to</span>
            </li>
        </ul>

        <!-- Sold-to Table -->
        <div class="panel">
            <div class="mb-5 flex flex-col gap-5 md:flex-row md:items-center">
                <h5 class="text-lg font-semibold dark:text-white-light">รายการ Sold-to</h5>
                <div class="ltr:ml-auto rtl:mr-auto">
                    <input v-model="searchSoldTo" type="text" class="form-input w-auto" placeholder="ค้นหา Sold-to..." />
                </div>
            </div>

            <div class="table-responsive">
                <table class="table-hover">
                    <thead>
                        <tr style="background-color: #1b2e4b !important; color: white !important;">
                            <th class="w-20 !text-center">เลือก<br /><span class="text-xs font-normal opacity-80">Select</span></th>
                            <th class="w-16 !text-center">ลำดับ<br /><span class="text-xs font-normal opacity-80">Seq.</span></th>
                            <th class="w-44">Customer number<br /><span class="text-xs font-normal opacity-80">Sold-to</span></th>
                            <th>ชื่อลูกค้า / ชื่อบริษัท<br /><span class="text-xs font-normal opacity-80">Sold-to name</span></th>
                            <th class="w-44">เลขประจำตัวผู้เสียภาษี<br /><span class="text-xs font-normal opacity-80">Tax ID (Sold-to)</span></th>
                            <th>ข้อมูลออกใบกำกับภาษี<br /><span class="text-xs font-normal opacity-80">Tax invoice info (Sold-to)</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, idx) in filteredSoldToList"
                            :key="item.soldToCode"
                            class="cursor-pointer"
                            @click="selectSoldTo(item)"
                        >
                            <td class="!text-center">
                                <input
                                    type="radio"
                                    :value="item.soldToCode"
                                    v-model="selectedSoldToCode"
                                    class="form-radio text-primary cursor-pointer"
                                    @click.stop
                                />
                            </td>
                            <td class="!text-center text-gray-500 dark:text-gray-400">{{ idx + 1 }}.</td>
                            <td class="text-primary font-medium">{{ item.soldToCode }}</td>
                            <td class="dark:text-white-dark">{{ item.soldToName }}</td>
                            <td class="text-gray-600 dark:text-gray-300 font-mono text-sm">{{ item.taxId }}</td>
                            <td class="text-gray-600 dark:text-gray-300 text-sm">
                                <div>{{ item.taxName }}</div>
                                <div class="text-xs text-gray-400">{{ item.taxAddress }}</div>
                            </td>
                        </tr>
                        <tr v-if="filteredSoldToList.length === 0">
                            <td colspan="6" class="!text-center py-8 text-gray-400">ไม่พบข้อมูล</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Ship-to Table -->
        <transition name="fade">
            <div v-if="selectedSoldToCode" class="panel mt-6">
                <div class="mb-5">
                    <h5 class="text-lg font-semibold dark:text-white-light">รายการ Ship-to</h5>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Sold-to: <span class="font-semibold text-primary">{{ selectedSoldToCode }}</span>
                        <span class="mx-1.5 text-gray-400">—</span>
                        <span class="dark:text-white-dark">{{ selectedSoldToName }}</span>
                    </p>
                </div>

                <div class="table-responsive">
                    <table class="table-hover">
                        <thead>
                            <tr style="background-color: #1b2e4b !important; color: white !important;">
                                <th class="w-20 !text-center">เลือก<br /><span class="text-xs font-normal opacity-80">Select</span></th>
                                <th class="w-16 !text-center">ลำดับ<br /><span class="text-xs font-normal opacity-80">Seq.</span></th>
                                <th class="w-44">Ship-to code<br /><span class="text-xs font-normal opacity-80">สถานที่จัดส่ง</span></th>
                                <th class="w-52">ชื่อหน่วยงาน<br /><span class="text-xs font-normal opacity-80">สถานที่จัดส่ง</span></th>
                                <th class="w-52">ชื่อสถานที่จัดส่ง<br /><span class="text-xs font-normal opacity-80">Ship-to</span></th>
                                <th>ที่อยู่จัดส่ง<br /><span class="text-xs font-normal opacity-80">Ship-to</span></th>
                                <th class="w-52">จังหวัด / เขต / รหัสไปรษณีย์<br /><span class="text-xs font-normal opacity-80">Ship-to</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="(item, idx) in filteredShipToList"
                                :key="item.shipToCode"
                                class="cursor-pointer"
                                @click="selectedShipToCode = item.shipToCode"
                            >
                                <td class="!text-center">
                                    <input
                                        type="radio"
                                        :value="item.shipToCode"
                                        v-model="selectedShipToCode"
                                        class="form-radio text-primary cursor-pointer"
                                        @click.stop
                                    />
                                </td>
                                <td class="!text-center text-gray-500 dark:text-gray-400">{{ idx + 1 }}.</td>
                                <td class="text-primary font-medium">{{ item.shipToCode }}</td>
                                <td class="dark:text-white-dark">{{ item.unitName }}</td>
                                <td class="dark:text-white-dark">{{ item.shipToName }}</td>
                                <td class="text-gray-600 dark:text-gray-300 text-sm">{{ item.address }}</td>
                                <td class="text-gray-600 dark:text-gray-300 text-sm">
                                    <div>{{ item.province }}</div>
                                    <div class="text-xs text-gray-400">{{ item.district }} {{ item.postcode }}</div>
                                </td>
                            </tr>
                            <tr v-if="filteredShipToList.length === 0">
                                <td colspan="7" class="!text-center py-8 text-gray-400">ไม่พบข้อมูล Ship-to สำหรับ Sold-to นี้</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
    import { ref, computed } from 'vue';

    useHead({ title: 'Master Data | Sold-to / Ship-to' });

    interface SoldTo {
        soldToCode: string;
        soldToName: string;
        taxId: string;
        taxName: string;
        taxAddress: string;
    }

    interface ShipTo {
        soldToCode: string;
        shipToCode: string;
        unitName: string;
        shipToName: string;
        address: string;
        province: string;
        district: string;
        postcode: string;
    }

    const searchSoldTo = ref('');
    const selectedSoldToCode = ref<string | null>(null);
    const selectedShipToCode = ref<string | null>(null);

    // Mock data — แทนที่ด้วย useFetch('/api/master/sold-to') เมื่อ connect API
    const soldToList = ref<SoldTo[]>([
        {
            soldToCode: '0010000186',
            soldToName: 'บริษัท กฟผ. จำกัด (มหาชน)',
            taxId: '0107536001100',
            taxName: 'บริษัท กฟผ. จำกัด (มหาชน)',
            taxAddress: '53 หมู่ 2 ถ.จรัญสนิทวงศ์ บางกรวย นนทบุรี 11130',
        },
        {
            soldToCode: '0010000271',
            soldToName: 'นายประเสริฐ เลี้ยงปารุง',
            taxId: '1234567890123',
            taxName: 'นายประเสริฐ เลี้ยงปารุง',
            taxAddress: '123 ถ.พระราม 4 คลองเตย กรุงเทพมหานคร 10110',
        },
        {
            soldToCode: '0010000272',
            soldToName: 'นายสมชาติ องุ่นศร',
            taxId: '3100600215234',
            taxName: 'นายสมชาติ องุ่นศร',
            taxAddress: '456 ซ.สุขุมวิท 71 วัฒนา กรุงเทพมหานคร 10110',
        },
        {
            soldToCode: '0010000273',
            soldToName: 'นายวิศิษฎ์ เลิศพุทธิกุล',
            taxId: '3101200312455',
            taxName: 'นายวิศิษฎ์ เลิศพุทธิกุล',
            taxAddress: '789 ถ.เพชรบุรีตัดใหม่ ราชเทวี กรุงเทพมหานคร 10400',
        },
    ]);

    const shipToList = ref<ShipTo[]>([
        {
            soldToCode: '0010000186',
            shipToCode: '0010000079',
            unitName: 'ฝ่ายจัดซื้อสำนักงานใหญ่',
            shipToName: 'บริษัท กฟผ. จำกัด (มหาชน) — สำนักงานใหญ่',
            address: '53 หมู่ 2 ถ.จรัญสนิทวงศ์',
            province: 'นนทบุรี',
            district: 'บางกรวย',
            postcode: '11130',
        },
        {
            soldToCode: '0010000186',
            shipToCode: '0030000079',
            unitName: 'ฝ่ายบริหารทั่วไป เขื่อนภูมิพล',
            shipToName: 'บริษัท กฟผ. จำกัด (มหาชน) — เขื่อนภูมิพล',
            address: '999 ม.9 ต.สามเงา',
            province: 'ตาก',
            district: 'สามเงา',
            postcode: '63130',
        },
        {
            soldToCode: '0010000186',
            shipToCode: '0030002925',
            unitName: 'หน่วยงานสวัสดิการพนักงาน',
            shipToName: 'บริษัท กฟผ. จำกัด (มหาชน) — โรงไฟฟ้าแม่เมาะ',
            address: '800 ม.5 ต.แม่เมาะ',
            province: 'ลำปาง',
            district: 'แม่เมาะ',
            postcode: '52220',
        },
        {
            soldToCode: '0010000271',
            shipToCode: '0010000100',
            unitName: 'ฝ่ายจัดซื้อ สาขาที่ 1',
            shipToName: 'บริษัท ตัวอย่าง จำกัด สาขาที่ 1',
            address: '200 ถ.สีลม',
            province: 'กรุงเทพมหานคร',
            district: 'บางรัก',
            postcode: '10500',
        },
        {
            soldToCode: '0010000271',
            shipToCode: '0010000101',
            unitName: 'ฝ่ายจัดซื้อ สาขาที่ 2',
            shipToName: 'บริษัท ตัวอย่าง จำกัด สาขาที่ 2',
            address: '300 ถ.รัชดาภิเษก',
            province: 'กรุงเทพมหานคร',
            district: 'ห้วยขวาง',
            postcode: '10310',
        },
        {
            soldToCode: '0010000272',
            shipToCode: '0020000050',
            unitName: 'แผนกพัสดุ',
            shipToName: 'ห้างหุ้นส่วนจำกัด ตัวอย่าง',
            address: '55 ถ.นนทบุรี',
            province: 'นนทบุรี',
            district: 'เมืองนนทบุรี',
            postcode: '11000',
        },
    ]);

    const filteredSoldToList = computed(() => {
        if (!searchSoldTo.value) return soldToList.value;
        const q = searchSoldTo.value.toLowerCase();
        return soldToList.value.filter(
            (s) => s.soldToCode.includes(q) || s.soldToName.toLowerCase().includes(q) || s.taxId.includes(q)
        );
    });

    const selectedSoldToName = computed(
        () => soldToList.value.find((s) => s.soldToCode === selectedSoldToCode.value)?.soldToName ?? ''
    );

    const filteredShipToList = computed(() => {
        if (!selectedSoldToCode.value) return [];
        return shipToList.value.filter((s) => s.soldToCode === selectedSoldToCode.value);
    });

    const selectSoldTo = (item: SoldTo) => {
        selectedSoldToCode.value = item.soldToCode;
        selectedShipToCode.value = null;
    };
</script>

<style scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.25s ease, transform 0.25s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
        transform: translateY(-6px);
    }
</style>
