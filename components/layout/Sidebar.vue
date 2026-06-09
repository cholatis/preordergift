<template>
    <div :class="{ 'dark text-white-dark': store.semidark }">
        <nav class="sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300">
            <div class="h-full bg-white dark:bg-[#0e1726]">
                <div class="flex items-center justify-between px-4 py-3">
                    <NuxtLink to="/" class="main-logo flex shrink-0 items-center">
                        <img class="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="" />
                        <span class="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">VRISTO</span>
                    </NuxtLink>
                    <a
                        href="javascript:;"
                        class="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 hover:text-primary rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                        @click="store.toggleSidebar()"
                    >
                        <icon-carets-down class="m-auto rotate-90" />
                    </a>
                </div>
                <client-only>
                    <perfect-scrollbar
                        :options="{
                            swipeEasing: true,
                            wheelPropagation: false,
                        }"
                        class="relative h-[calc(100vh-80px)]"
                    >
                        <ul class="relative space-y-0.5 p-4 py-0 font-semibold">
                            <li class="menu nav-item">
                                <button
                                    type="button"
                                    class="nav-link group w-full"
                                    :class="{ active: activeDropdown === 'dashboard' }"
                                    @click="activeDropdown === 'dashboard' ? (activeDropdown = null) : (activeDropdown = 'dashboard')"
                                >
                                    <div class="flex items-center">
                                        <icon-menu-dashboard class="shrink-0 group-hover:!text-primary" />
                                        <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            {{ $t('dashboard') }}
                                        </span>
                                    </div>
                                    <div :class="{ '-rotate-90 rtl:rotate-90': activeDropdown !== 'dashboard' }">
                                        <icon-caret-down />
                                    </div>
                                </button>
                                <vue-collapsible :isOpen="activeDropdown === 'dashboard'">
                                    <ul class="sub-menu text-gray-500">
                                        <li>
                                            <NuxtLink to="/" @click="toggleMobileMenu">{{ $t('sales') }}</NuxtLink>
                                        </li>
                                    </ul>
                                </vue-collapsible>
                            </li>

                            <h2 class="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <icon-minus class="hidden h-5 w-4 flex-none" />
                                <span>Master</span>
                            </h2>

                            <li class="menu nav-item">
                                <button
                                    type="button"
                                    class="nav-link group w-full"
                                    :class="{ active: activeDropdown === 'master' }"
                                    @click="activeDropdown === 'master' ? (activeDropdown = null) : (activeDropdown = 'master')"
                                >
                                    <div class="flex items-center">
                                        <icon-box class="shrink-0 group-hover:!text-primary" />
                                        <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            Master Data
                                        </span>
                                    </div>
                                    <div :class="{ '-rotate-90 rtl:rotate-90': activeDropdown !== 'master' }">
                                        <icon-caret-down />
                                    </div>
                                </button>
                                <vue-collapsible :isOpen="activeDropdown === 'master'">
                                    <ul class="sub-menu text-gray-500">
                                        <li>
                                            <NuxtLink to="/master/sold-to" @click="toggleMobileMenu">Sold-to / Ship-to</NuxtLink>
                                        </li>
                                        <li>
                                            <NuxtLink to="/master/product" @click="toggleMobileMenu">สินค้า / Product</NuxtLink>
                                        </li>
                                        <li>
                                            <NuxtLink to="/master/payment-term" @click="toggleMobileMenu">Payment Term</NuxtLink>
                                        </li>
                                        <li>
                                            <NuxtLink to="/master/campaign" @click="toggleMobileMenu">Campaign</NuxtLink>
                                        </li>
                                    </ul>
                                </vue-collapsible>
                            </li>

                            <h2 class="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <icon-minus class="hidden h-5 w-4 flex-none" />
                                <span>Order Management</span>
                            </h2>

                            <li class="menu nav-item">
                                <NuxtLink to="/stock" class="nav-link group" @click="toggleMobileMenu">
                                    <div class="flex items-center">
                                        <icon-list-check class="shrink-0 group-hover:!text-primary" />
                                        <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            Stock Management
                                        </span>
                                    </div>
                                </NuxtLink>
                            </li>

                            <li class="menu nav-item">
                                <button
                                    type="button"
                                    class="nav-link group w-full"
                                    :class="{ active: activeDropdown === 'orders' }"
                                    @click="activeDropdown === 'orders' ? (activeDropdown = null) : (activeDropdown = 'orders')"
                                >
                                    <div class="flex items-center">
                                        <icon-shopping-cart class="shrink-0 group-hover:!text-primary" />
                                        <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            คำสั่งซื้อ
                                        </span>
                                    </div>
                                    <div :class="{ '-rotate-90 rtl:rotate-90': activeDropdown !== 'orders' }">
                                        <icon-caret-down />
                                    </div>
                                </button>
                                <vue-collapsible :isOpen="activeDropdown === 'orders'">
                                    <ul class="sub-menu text-gray-500">
                                        <li>
                                            <NuxtLink to="/orders" @click="toggleMobileMenu">รายการคำสั่งซื้อ</NuxtLink>
                                        </li>
                                        <li>
                                            <NuxtLink to="/orders/create" @click="toggleMobileMenu">สร้างคำสั่งซื้อใหม่</NuxtLink>
                                        </li>
                                    </ul>
                                </vue-collapsible>
                            </li>

                            <li class="menu nav-item">
                                <button
                                    type="button"
                                    class="nav-link group w-full"
                                    :class="{ active: activeDropdown === 'quotation' }"
                                    @click="activeDropdown === 'quotation' ? (activeDropdown = null) : (activeDropdown = 'quotation')"
                                >
                                    <div class="flex items-center">
                                        <icon-menu-invoice class="shrink-0 group-hover:!text-primary" />
                                        <span class="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">
                                            Quotation
                                        </span>
                                    </div>
                                    <div :class="{ '-rotate-90 rtl:rotate-90': activeDropdown !== 'quotation' }">
                                        <icon-caret-down />
                                    </div>
                                </button>
                                <vue-collapsible :isOpen="activeDropdown === 'quotation'">
                                    <ul class="sub-menu text-gray-500">
                                        <li>
                                            <NuxtLink to="/quotation" @click="toggleMobileMenu">รายการใบเสนอราคา</NuxtLink>
                                        </li>
                                        <li>
                                            <NuxtLink to="/quotation/create" @click="toggleMobileMenu">สร้างใบเสนอราคาใหม่</NuxtLink>
                                        </li>
                                    </ul>
                                </vue-collapsible>
                            </li>

                        </ul>
                    </perfect-scrollbar>
                </client-only>
            </div>
        </nav>
    </div>
</template>

<script lang="ts" setup>
    import { ref, onMounted } from 'vue';

    import { useAppStore } from '@/stores/index';
    import VueCollapsible from 'vue-height-collapsible/vue3';
    const store = useAppStore();
    const activeDropdown: any = ref('');
    const subActive: any = ref('');

    onMounted(() => {
        setTimeout(() => {
            const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');

            if (selector) {
                selector.classList.add('active');
                const ul: any = selector.closest('ul.sub-menu');
                if (ul) {
                    let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];

                    if (ele.length) {
                        ele = ele[0];
                        setTimeout(() => {
                            ele.click();
                        });
                    }
                }
            }
        });
    });

    const toggleMobileMenu = () => {
        if (window.innerWidth < 1024) {
            store.toggleSidebar();
        }
    };
</script>
