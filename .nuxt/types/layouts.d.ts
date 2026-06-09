import type { ComputedRef, MaybeRef } from 'vue'
export type LayoutKey = "auth-layout" | "default"
declare module "../../node_modules/.pnpm/nuxt@3.15.4_@parcel+watcher@2.5.6_cac@6.7.14_db0@0.3.4_ioredis@5.10.0_magicast@0.5.2_ro_69727c57c7aa6c222a75b15ffa761d5d/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    layout?: MaybeRef<LayoutKey | false> | ComputedRef<LayoutKey | false>
  }
}