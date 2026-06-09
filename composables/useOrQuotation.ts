// Quotation composable — CRUD สำหรับใบเสนอราคา

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';

export interface QuotationItem {
    productId: string;
    productNameEn: string;
    qty: number;
    priceInVat: number;
    subtotalInVat: number;
}

export interface Quotation {
    id: string;
    quotationNo: string;
    status: QuotationStatus;
    createdAt: string;
    validUntil: string;
    customerType: 'new' | 'existing';
    soldToName: string;
    soldToCode: string;
    shipToName: string;
    shipToCode: string;
    deliveryContact: { name: string; phone: string };
    items: QuotationItem[];
    totalExVat: number;
    vatAmount: number;
    totalInVat: number;
    note: string;
    taxInvoice: { requested: boolean | null; companyName: string; taxId: string };
    convertedOrderNo: string;
    history: Array<{ ts: string; action: string; detail: string }>;
}

// Product catalog with default prices (สำหรับ product picker ใน create)
export const PRODUCT_CATALOG: Record<string, { name: string; defaultPrice: number; type: string }> = {
    'GS-01': { name: 'SIGNATURE BREW GIFT SET',              defaultPrice: 1500,  type: 'Gift Set'  },
    'GS-02': { name: 'TEA OF JOY GIFT SET',                  defaultPrice: 1200,  type: 'Gift Set'  },
    'GS-03': { name: 'GREEN TEA JUMBO GIFT SET',              defaultPrice: 1800,  type: 'Gift Set'  },
    'GS-04': { name: 'COFFEE TO GO GIFT SET',                 defaultPrice: 2000,  type: 'Gift Set'  },
    'GS-05': { name: 'SENCHA MOMENT GIFT SET',                defaultPrice: 1400,  type: 'Gift Set'  },
    'GS-06': { name: 'SILVER & STELLAR DRIP COFFEE GIFT SET', defaultPrice: 1600,  type: 'Gift Set'  },
    'GS-07': { name: 'RHYTHM OF CAPSULE GIFT SET',            defaultPrice: 2200,  type: 'Gift Set'  },
    'MC-01': { name: 'NEW COFFEE CAPSULE MACHINE',            defaultPrice: 8500,  type: 'Machine'   },
    'MC-02': { name: 'COFFEE CAPSULE BEGINNER SET',           defaultPrice: 6500,  type: 'Machine'   },
    'MC-03': { name: 'COFFEE CAPSULE DIGITAL TOUCH SCREEN',   defaultPrice: 12000, type: 'Machine'   },
    'PM-01': { name: 'MORNING DRIP BOX SET',                  defaultPrice: 2500,  type: 'Premium'   },
    'PM-02': { name: 'TEA MOMENT BOX SET',                    defaultPrice: 2000,  type: 'Premium'   },
    'CP-01': { name: 'COFFEE CAPSULE SPIRIT — Winery',        defaultPrice: 250,   type: 'Capsule'   },
    'CP-02': { name: 'COFFEE CAPSULE SPIRIT — Brandy',        defaultPrice: 250,   type: 'Capsule'   },
    'CP-03': { name: 'COFFEE CAPSULE SPIRIT — Whisky',        defaultPrice: 280,   type: 'Capsule'   },
    'TB-01': { name: 'ORDINARY TUMBLER 22oz',                 defaultPrice: 350,   type: 'Tumbler'   },
    'TB-03': { name: 'STAINLESS STEEL GLASS TUMBLER 22oz',    defaultPrice: 450,   type: 'Tumbler'   },
    'TB-05': { name: 'GLITTER TUMBLER 22oz',                  defaultPrice: 550,   type: 'Tumbler'   },
    'TB-07': { name: 'NYYY DESIGN TUMBLER 12oz',              defaultPrice: 380,   type: 'Tumbler'   },
};

let _seq = 5;
const nextNo = () => `QUO-2026-${String(_seq++).padStart(4, '0')}`;

const calcTotals = (items: QuotationItem[]) => {
    const totalInVat  = items.reduce((s, i) => s + i.subtotalInVat, 0);
    const totalExVat  = totalInVat / 1.07;
    const vatAmount   = totalInVat - totalExVat;
    return { totalInVat, totalExVat, vatAmount };
};

export const useOrQuotation = () => {
    const quotations = useState<Quotation[]>('or-quotations', () => [
        {
            id: 'q1',
            quotationNo: 'QUO-2026-0001',
            status: 'draft',
            createdAt: '2026-06-01T09:00:00.000Z',
            validUntil: '2026-06-30',
            customerType: 'existing',
            soldToName: 'บริษัท เดโม่ จำกัด',
            soldToCode: 'DEMO001',
            shipToName: 'สาขา ลาดพร้าว',
            shipToCode: 'DEMO001-01',
            deliveryContact: { name: 'คุณสมชาย', phone: '081-000-0001' },
            items: [
                { productId: 'GS-01', productNameEn: 'SIGNATURE BREW GIFT SET',  qty: 10, priceInVat: 1500, subtotalInVat: 15000 },
                { productId: 'GS-02', productNameEn: 'TEA OF JOY GIFT SET',       qty: 5,  priceInVat: 1200, subtotalInVat: 6000  },
            ],
            totalExVat: 19626.17, vatAmount: 1373.83, totalInVat: 21000,
            note: 'ราคายังไม่รวมค่าจัดส่ง',
            taxInvoice: { requested: false, companyName: '', taxId: '' },
            convertedOrderNo: '',
            history: [{ ts: '2026-06-01T09:00:00.000Z', action: 'create', detail: 'สร้างใบเสนอราคา' }],
        },
        {
            id: 'q2',
            quotationNo: 'QUO-2026-0002',
            status: 'sent',
            createdAt: '2026-06-03T10:30:00.000Z',
            validUntil: '2026-07-03',
            customerType: 'existing',
            soldToName: 'ห้างหุ้นส่วน อัลฟ่า',
            soldToCode: 'ALPHA001',
            shipToName: 'คลังสินค้าหลัก',
            shipToCode: 'ALPHA001-WH',
            deliveryContact: { name: 'คุณมานี', phone: '082-000-0002' },
            items: [
                { productId: 'GS-03', productNameEn: 'GREEN TEA JUMBO GIFT SET',     qty: 20, priceInVat: 1800, subtotalInVat: 36000 },
                { productId: 'MC-01', productNameEn: 'NEW COFFEE CAPSULE MACHINE',   qty: 2,  priceInVat: 8500, subtotalInVat: 17000 },
            ],
            totalExVat: 49532.71, vatAmount: 3467.29, totalInVat: 53000,
            note: '',
            taxInvoice: { requested: true, companyName: 'ห้างหุ้นส่วน อัลฟ่า', taxId: '0123456789012' },
            convertedOrderNo: '',
            history: [
                { ts: '2026-06-03T10:30:00.000Z', action: 'create', detail: 'สร้างใบเสนอราคา' },
                { ts: '2026-06-04T08:00:00.000Z', action: 'send',   detail: 'ส่งใบเสนอราคาให้ลูกค้าแล้ว' },
            ],
        },
        {
            id: 'q3',
            quotationNo: 'QUO-2026-0003',
            status: 'accepted',
            createdAt: '2026-05-28T14:00:00.000Z',
            validUntil: '2026-06-27',
            customerType: 'new',
            soldToName: 'คุณวิภา ใจดี',
            soldToCode: '',
            shipToName: 'บ้านลูกค้า (ปทุมธานี)',
            shipToCode: '',
            deliveryContact: { name: 'คุณวิภา', phone: '083-000-0003' },
            items: [
                { productId: 'GS-07', productNameEn: 'RHYTHM OF CAPSULE GIFT SET', qty: 5,  priceInVat: 2200, subtotalInVat: 11000 },
                { productId: 'TB-01', productNameEn: 'ORDINARY TUMBLER 22oz',       qty: 10, priceInVat: 350,  subtotalInVat: 3500  },
            ],
            totalExVat: 13551.40, vatAmount: 948.60, totalInVat: 14500,
            note: 'ลูกค้าต้องการให้ห่อของขวัญ',
            taxInvoice: { requested: null, companyName: '', taxId: '' },
            convertedOrderNo: '',
            history: [
                { ts: '2026-05-28T14:00:00.000Z', action: 'create', detail: 'สร้างใบเสนอราคา' },
                { ts: '2026-05-30T09:00:00.000Z', action: 'send',   detail: 'ส่งใบเสนอราคาให้ลูกค้าแล้ว' },
                { ts: '2026-06-02T11:00:00.000Z', action: 'accept', detail: 'ลูกค้ายืนยันรับใบเสนอราคา' },
            ],
        },
        {
            id: 'q4',
            quotationNo: 'QUO-2026-0004',
            status: 'converted',
            createdAt: '2026-05-20T09:00:00.000Z',
            validUntil: '2026-06-19',
            customerType: 'existing',
            soldToName: 'บริษัท เทค โซลูชัน จำกัด',
            soldToCode: 'TECH001',
            shipToName: 'สำนักงานใหญ่ สาทร',
            shipToCode: 'TECH001-01',
            deliveryContact: { name: 'คุณสมศักดิ์', phone: '084-000-0004' },
            items: [
                { productId: 'CP-01', productNameEn: 'COFFEE CAPSULE SPIRIT — Winery', qty: 48, priceInVat: 250, subtotalInVat: 12000 },
                { productId: 'CP-02', productNameEn: 'COFFEE CAPSULE SPIRIT — Brandy', qty: 48, priceInVat: 250, subtotalInVat: 12000 },
            ],
            totalExVat: 22429.91, vatAmount: 1570.09, totalInVat: 24000,
            note: '',
            taxInvoice: { requested: true, companyName: 'บริษัท เทค โซลูชัน จำกัด', taxId: '9876543210987' },
            convertedOrderNo: 'QT-2026-0010',
            history: [
                { ts: '2026-05-20T09:00:00.000Z', action: 'create',  detail: 'สร้างใบเสนอราคา' },
                { ts: '2026-05-21T10:00:00.000Z', action: 'send',    detail: 'ส่งใบเสนอราคาให้ลูกค้าแล้ว' },
                { ts: '2026-05-25T14:00:00.000Z', action: 'accept',  detail: 'ลูกค้ายืนยันรับใบเสนอราคา' },
                { ts: '2026-05-26T09:00:00.000Z', action: 'convert', detail: 'แปลงเป็น Order: QT-2026-0010' },
            ],
        },
    ]);

    const createQuotation = (
        data: Omit<Quotation, 'id' | 'quotationNo' | 'status' | 'createdAt' | 'convertedOrderNo' | 'history' | 'totalExVat' | 'vatAmount' | 'totalInVat'>
    ): Quotation => {
        const totals = calcTotals(data.items);
        const q: Quotation = {
            id: `q${Date.now()}`,
            quotationNo: nextNo(),
            status: 'draft',
            createdAt: new Date().toISOString(),
            convertedOrderNo: '',
            history: [{ ts: new Date().toISOString(), action: 'create', detail: 'สร้างใบเสนอราคา' }],
            ...data,
            ...totals,
        };
        quotations.value.unshift(q);
        return q;
    };

    const updateQuotation = (id: string, patch: Partial<Quotation>) => {
        const idx = quotations.value.findIndex(q => q.id === id);
        if (idx === -1) return;
        const updated = { ...quotations.value[idx], ...patch };
        // recalc totals if items changed
        if (patch.items) Object.assign(updated, calcTotals(patch.items));
        quotations.value[idx] = updated;
    };

    const deleteQuotation = (id: string) => {
        quotations.value = quotations.value.filter(q => q.id !== id);
    };

    const getQuotation = (id: string) => quotations.value.find(q => q.id === id) ?? null;

    return { quotations, createQuotation, updateQuotation, deleteQuotation, getQuotation };
};
