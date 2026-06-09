// Stock Allocation — 2-tier model
// ชั้น 1: available  = เปิดให้ลูกค้าจองได้
// ชั้น 2: reserved   = ลูกค้าสั่งแล้ว ยังไม่ขายจริง
// ใช้ใน: pages/stock/index.vue, pages/orders/create.vue, pages/orders/[id].vue, pages/master/product.vue

export type StockStatus = 'ok' | 'low' | 'out';

export interface StockEntry {
    available: number;    // ชั้น 1: จำนวนที่เปิดให้ลูกค้าจองได้
    reserved: number;     // ชั้น 2: จองแล้วยังไม่ขายจริง
    minWarning: number;   // threshold "ใกล้หมด" (เทียบกับ available)
    productNameEn: string;
    type: string;
}

export type StockLogType = 'add' | 'subtract' | 'reserve' | 'release' | 'adjust_reserve';

export interface StockLog {
    id: string;
    productId: string;
    productName: string;
    type: StockLogType;
    qty: number;
    reason: string;
    orderNo?: string;
    adjustedAt: string;
}

type StockMap = Record<string, StockEntry>;

export const useOrStock = () => {
    const stock = useState<StockMap>('or-stock', () => ({
        // Gift Sets
        'GS-01': { available: 96,  reserved: 24,  minWarning: 24, productNameEn: 'SIGNATURE BREW GIFT SET',                      type: 'gift-set' },
        'GS-02': { available: 80,  reserved: 0,   minWarning: 16, productNameEn: 'TEA OF JOY GIFT SET',                           type: 'gift-set' },
        'GS-03': { available: 96,  reserved: 24,  minWarning: 24, productNameEn: 'GREEN TEA JUMBO GIFT SET',                      type: 'gift-set' },
        'GS-04': { available: 120, reserved: 0,   minWarning: 24, productNameEn: 'COFFEE TO GO GIFT SET',                         type: 'gift-set' },
        'GS-05': { available: 80,  reserved: 0,   minWarning: 16, productNameEn: 'SENCHA MOMENT GIFT SET',                        type: 'gift-set' },
        'GS-06': { available: 80,  reserved: 0,   minWarning: 16, productNameEn: 'SILVER & STELLAR DRIP COFFEE GIFT SET',         type: 'gift-set' },
        'GS-07': { available: 68,  reserved: 12,  minWarning: 16, productNameEn: 'RHYTHM OF CAPSULE GIFT SET',                    type: 'gift-set' },
        // Machines
        'MC-01': { available: 16,  reserved: 4,   minWarning: 5,  productNameEn: 'NEW COFFEE CAPSULE MACHINE',                    type: 'machine'  },
        'MC-02': { available: 20,  reserved: 0,   minWarning: 5,  productNameEn: 'COFFEE CAPSULE BEGINNER SET',                   type: 'machine'  },
        'MC-03': { available: 0,   reserved: 0,   minWarning: 5,  productNameEn: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN',           type: 'machine'  },
        // Premium
        'PM-01': { available: 80,  reserved: 0,   minWarning: 16, productNameEn: 'MORNING DRIP BOX SET',                          type: 'premium'  },
        'PM-02': { available: 60,  reserved: 0,   minWarning: 12, productNameEn: 'TEA MOMENT BOX SET',                            type: 'premium'  },
        // Capsules
        'CP-01': { available: 240, reserved: 0,   minWarning: 48, productNameEn: 'COFFEE CAPSULE SPIRIT — Winery',                type: 'capsule'  },
        'CP-02': { available: 240, reserved: 0,   minWarning: 48, productNameEn: 'COFFEE CAPSULE SPIRIT — Brandy',                type: 'capsule'  },
        'CP-03': { available: 12,  reserved: 0,   minWarning: 48, productNameEn: 'COFFEE CAPSULE SPIRIT — Whisky',                type: 'capsule'  },
        // Tumblers
        'TB-01': { available: 240, reserved: 0,   minWarning: 48, productNameEn: 'ORDINARY TUMBLER 22oz',                         type: 'tumbler'  },
        'TB-03': { available: 120, reserved: 0,   minWarning: 24, productNameEn: 'STAINLESS STEEL GLASS TUMBLER 22oz (คละสี)',    type: 'tumbler'  },
        'TB-05': { available: 24,  reserved: 0,   minWarning: 36, productNameEn: 'GLITTER TUMBLER 22oz (คละสี)',                  type: 'tumbler'  },
        'TB-07': { available: 100, reserved: 0,   minWarning: 20, productNameEn: 'NYYY DESIGN TUMBLER 12oz',                      type: 'tumbler'  },
    }));

    const stockLog = useState<StockLog[]>('or-stock-log', () => [
        { id: 'LOG-001', productId: 'GS-01', productName: 'SIGNATURE BREW GIFT SET', type: 'add',     qty: 120, reason: 'รับสินค้าเริ่มต้น Campaign 2026', adjustedAt: '2026-01-01' },
        { id: 'LOG-002', productId: 'MC-03', productName: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN', type: 'subtract', qty: 5, reason: 'สินค้าเสียหายระหว่างขนส่ง', adjustedAt: '2026-01-10' },
        { id: 'LOG-003', productId: 'GS-01', productName: 'SIGNATURE BREW GIFT SET', type: 'reserve', qty: 24, reason: 'จอง Order', orderNo: 'QT-2026-0001', adjustedAt: '2026-01-15' },
        { id: 'LOG-004', productId: 'GS-03', productName: 'GREEN TEA JUMBO GIFT SET', type: 'reserve', qty: 24, reason: 'จอง Order', orderNo: 'QT-2026-0002', adjustedAt: '2026-01-16' },
        { id: 'LOG-005', productId: 'GS-07', productName: 'RHYTHM OF CAPSULE GIFT SET', type: 'reserve', qty: 12, reason: 'จอง Order', orderNo: 'QT-2026-0004', adjustedAt: '2026-01-18' },
        { id: 'LOG-006', productId: 'MC-01', productName: 'NEW COFFEE CAPSULE MACHINE', type: 'reserve', qty: 4, reason: 'จอง Order', orderNo: 'QT-2026-0004', adjustedAt: '2026-01-18' },
    ]);

    const getStock = (id: string): StockEntry =>
        stock.value[id] ?? { available: 0, reserved: 0, minWarning: 10, productNameEn: id, type: 'other' };

    const getStatus = (id: string): StockStatus => {
        const s = getStock(id);
        if (s.available <= 0) return 'out';
        if (s.available <= s.minWarning) return 'low';
        return 'ok';
    };

    // ── ชั้น 1 → ชั้น 2: เมื่อ submit order ───────────────────────────
    const reserveStock = (
        items: Array<{ productId: string; productNameEn: string; qty: number }>,
        orderNo: string
    ) => {
        for (const item of items) {
            const s = stock.value[item.productId];
            if (!s) continue;
            const take = Math.min(item.qty, s.available);
            s.available = Math.max(0, s.available - take);
            s.reserved += take;
            stockLog.value.unshift({
                id: `LOG-${Date.now()}-${item.productId}`,
                productId: item.productId, productName: item.productNameEn,
                type: 'reserve', qty: take, reason: 'จอง Order', orderNo,
                adjustedAt: new Date().toISOString().slice(0, 10),
            });
        }
    };

    // ── ชั้น 2 → ชั้น 1: คืน stock เมื่อ cancel order ─────────────────
    const releaseStock = (
        items: Array<{ productId: string; productNameEn: string; qty: number }>,
        orderNo: string
    ) => {
        for (const item of items) {
            const s = stock.value[item.productId];
            if (!s) continue;
            const ret = Math.min(item.qty, s.reserved);
            s.reserved = Math.max(0, s.reserved - ret);
            s.available += ret;
            stockLog.value.unshift({
                id: `LOG-${Date.now()}-${item.productId}`,
                productId: item.productId, productName: item.productNameEn,
                type: 'release', qty: ret, reason: `คืน Stock — ยกเลิก Order ${orderNo}`, orderNo,
                adjustedAt: new Date().toISOString().slice(0, 10),
            });
        }
    };

    // ── ปรับ reservation เมื่อแก้ไข qty ──────────────────────────────
    const adjustReservation = (
        oldItems: Array<{ productId: string; productNameEn: string; qty: number }>,
        newItems: Array<{ productId: string; productNameEn: string; qty: number }>,
        orderNo: string
    ) => {
        const allIds = new Set([...oldItems.map(i => i.productId), ...newItems.map(i => i.productId)]);
        for (const productId of allIds) {
            const s = stock.value[productId];
            if (!s) continue;
            const oldQty = oldItems.find(i => i.productId === productId)?.qty ?? 0;
            const newQty = newItems.find(i => i.productId === productId)?.qty ?? 0;
            const delta = newQty - oldQty; // บวก = ต้องการเพิ่ม reserved, ลบ = คืน available
            if (delta === 0) continue;

            const productName = stock.value[productId]?.productNameEn ?? productId;

            if (delta < 0) {
                // ลดจำนวน: คืน reserved → available
                const ret = Math.min(-delta, s.reserved);
                s.reserved = Math.max(0, s.reserved - ret);
                s.available += ret;
                stockLog.value.unshift({
                    id: `LOG-${Date.now()}-${productId}`,
                    productId, productName, type: 'release', qty: ret,
                    reason: `คืน Stock — แก้ไขลดจำนวน Order ${orderNo}`, orderNo,
                    adjustedAt: new Date().toISOString().slice(0, 10),
                });
            } else {
                // เพิ่มจำนวน: ดึงจาก available → reserved
                const take = Math.min(delta, s.available);
                s.available -= take;
                s.reserved += take;
                stockLog.value.unshift({
                    id: `LOG-${Date.now()}-${productId}`,
                    productId, productName, type: 'reserve', qty: take,
                    reason: `จอง Stock เพิ่ม — แก้ไขเพิ่มจำนวน Order ${orderNo}`, orderNo,
                    adjustedAt: new Date().toISOString().slice(0, 10),
                });
            }
        }
    };

    // ── Admin ปรับ available pool ──────────────────────────────────────
    const adjustStock = (productId: string, delta: number, reason: string) => {
        if (!stock.value[productId]) return;
        stock.value[productId].available = Math.max(0, stock.value[productId].available + delta);
        stockLog.value.unshift({
            id: `LOG-${Date.now()}`,
            productId,
            productName: stock.value[productId].productNameEn,
            type: delta > 0 ? 'add' : 'subtract',
            qty: Math.abs(delta),
            reason,
            adjustedAt: new Date().toISOString().slice(0, 10),
        });
    };

    return { stock, stockLog, getStock, getStatus, reserveStock, releaseStock, adjustReservation, adjustStock };
};
