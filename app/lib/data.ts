import type {
  AppData,
  CollectionPoint,
  CollectionSchedule,
  Invoice,
  Material,
  MaterialType,
  PurchaseOrder,
  RecyclingCompany,
  RewardItem,
  TruckLocation,
} from './types';

export const seedMaterials: Material[] = [
  { id: 'plastic', name: 'بلاستيك', icon: '🧴', color: '#4eaa34', unit: 'كجم' },
  { id: 'carton', name: 'كرتون', icon: '📦', color: '#d28a2d', unit: 'كجم' },
  { id: 'battery', name: 'بطاريات', icon: '🔋', color: '#3b82f6', unit: 'كجم' },
  { id: 'printer_cartridge', name: 'خرطوشة طابعة', icon: '🖨️', color: '#8b5cf6', unit: 'قطعة' },
  { id: 'ink_cartridge', name: 'خرطوشة حبر', icon: '🧪', color: '#0f766e', unit: 'قطعة' },
];

export const seedCollectionPoints: CollectionPoint[] = [
  {
    id: 'p1',
    name: 'الحساب المسجل - أحمد بن يوسف',
    accountName: 'أحمد بن يوسف',
    address: 'علي منجلي',
    lat: 36.2452,
    lng: 6.5703,
    materials: ['plastic', 'carton'],
    status: 'completed',
    order: 1,
    quantityMode: 'kg',
    quantityValue: 34,
  },
  {
    id: 'p2',
    name: 'الحساب المسجل - سارة بوزيان',
    accountName: 'سارة بوزيان',
    address: 'سيدي مبروك',
    lat: 36.3492,
    lng: 6.6336,
    materials: ['battery', 'ink_cartridge'],
    status: 'completed',
    order: 2,
    quantityMode: 'kg',
    quantityValue: 18,
  },
  {
    id: 'p3',
    name: 'الحساب المسجل - جمعية المستقبل',
    accountName: 'جمعية المستقبل',
    address: 'قسنطينة وسط',
    lat: 36.3650,
    lng: 6.6147,
    materials: ['plastic', 'carton', 'printer_cartridge'],
    status: 'upcoming',
    order: 3,
    quantityMode: 'bottles',
    quantityValue: 220,
  },
  {
    id: 'p4',
    name: 'الحساب المسجل - نادي البيئة',
    accountName: 'نادي البيئة',
    address: 'جامعة قسنطينة 2',
    lat: 36.2618,
    lng: 6.5687,
    materials: ['plastic', 'battery'],
    status: 'upcoming',
    order: 4,
    quantityMode: 'bottles',
    quantityValue: 300,
  },
];

export const seedRecyclingCompanies: RecyclingCompany[] = [
  { id: 'rc1', name: 'شركة نوميديا للبلاستيك المعاد', address: 'الخروب', lat: 36.2635, lng: 6.6932, specialty: 'بلاستيك' },
  { id: 'rc2', name: 'شركة قسنطينة للكرتون الصناعي', address: 'بوسوف', lat: 36.3460, lng: 6.6401, specialty: 'كرتون' },
  { id: 'rc3', name: 'شركة البطاريات الخضراء', address: 'عين الباي', lat: 36.2875, lng: 6.6204, specialty: 'بطاريات' },
  { id: 'rc4', name: 'مخبر خرطوشة بلس', address: 'الزواغي', lat: 36.3390, lng: 6.6602, specialty: 'خراطيش طابعة' },
  { id: 'rc5', name: 'مركز إنك ريسايكل', address: 'علي منجلي', lat: 36.2508, lng: 6.5750, specialty: 'خراطيش حبر' },
  { id: 'rc6', name: 'مصنع الأثر الدائم', address: 'جامعة الأمير عبد القادر', lat: 36.3477, lng: 6.6264, specialty: 'فرز متعدد' },
];

export const seedTrucks: TruckLocation[] = [
  { id: 't1', name: 'شاحنة CERCLY 01', lat: 36.3280, lng: 6.6230, status: 'loading' },
  { id: 't2', name: 'شاحنة CERCLY 02', lat: 36.2780, lng: 6.6120, status: 'en_route' },
  { id: 't3', name: 'شاحنة CERCLY 03', lat: 36.3592, lng: 6.6040, status: 'delivered' },
];

export function generateOrderId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `INV-${num}`;
}

export function generateShipmentId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `SHP-${num}`;
}

export function generateCollectionId(): string {
  return `COL-${Date.now()}`;
}

export function generateInvoiceNumber(): string {
  const num = Math.floor(Math.random() * 90000) + 10000;
  return `CRL-${num}`;
}

export function formatTimestamp(date: Date): { date: string; time: string } {
  const now = date;
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return { date: `${day}/${month}`, time: `${h}:${m}` };
}

export function formatTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  return `منذ ${days} يوم`;
}

const roleNames = {
  sorter: 'مركز الفرز',
  collector: 'الجامع',
  factory: 'شركة التدوير',
  partner: 'الشركاء',
  admin: 'الإدارة العامة',
};

const roleAvatars = {
  sorter: 'فر',
  collector: 'جم',
  factory: 'دو',
  partner: 'شر',
  admin: 'إد',
};

export const seedSchedules: CollectionSchedule[] = [
  {
    id: 'sch-1',
    partnerId: 'u4',
    pointId: 'p3',
    pointName: 'الحساب المسجل - جمعية المستقبل',
    address: 'قسنطينة وسط',
    scheduledDate: 'غداً',
    scheduledTime: '14:30',
    status: 'pending',
    quantityMode: 'bottles',
    quantityValue: 220,
  },
  {
    id: 'sch-2',
    partnerId: 'u5',
    pointId: 'p4',
    pointName: 'الحساب المسجل - نادي البيئة',
    address: 'جامعة قسنطينة 2',
    scheduledDate: '15/06',
    scheduledTime: '11:00',
    status: 'confirmed',
    quantityMode: 'kg',
    quantityValue: 26,
  },
];

const seedOrders: PurchaseOrder[] = [
  {
    id: 'INV-2026-0042',
    factoryId: 'f1',
    factoryName: 'شركة نوميديا للبلاستيك المعاد',
    centerId: 'sc1',
    centerName: 'مركز فرز قسنطينة',
    materialId: 'plastic',
    materialName: 'بلاستيك',
    quantity: 1200,
    status: 'pending',
    createdAt: 'اليوم',
  },
  {
    id: 'INV-2026-0038',
    factoryId: 'f2',
    factoryName: 'شركة قسنطينة للكرتون الصناعي',
    centerId: 'sc1',
    centerName: 'مركز فرز قسنطينة',
    materialId: 'carton',
    materialName: 'كرتون',
    quantity: 850,
    status: 'confirmed',
    createdAt: 'أمس',
  },
  {
    id: 'INV-2026-0031',
    factoryId: 'f3',
    factoryName: 'شركة البطاريات الخضراء',
    centerId: 'sc1',
    centerName: 'مركز فرز قسنطينة',
    materialId: 'battery',
    materialName: 'بطاريات',
    quantity: 340,
    status: 'confirmed',
    createdAt: 'أمس',
  },
];

const seedInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    orderId: 'INV-2026-0038',
    invoiceNumber: 'CRL-54012',
    date: '10/06/2026',
    companyName: 'شركة قسنطينة للكرتون الصناعي',
    materialName: 'كرتون',
    quantity: 850,
    unitPrice: 48,
    totalPrice: 40800,
    completed: true,
  },
  {
    id: 'invoice-2',
    orderId: 'INV-2026-0031',
    invoiceNumber: 'CRL-54018',
    date: '10/06/2026',
    companyName: 'شركة البطاريات الخضراء',
    materialName: 'بطاريات',
    quantity: 340,
    unitPrice: 135,
    totalPrice: 45900,
    completed: true,
  },
];

const seedRewards: RewardItem[] = [
  { id: 'rw1', name: 'ميدالية CERCLY', pointsCost: 120, storeName: 'متجر الشريك الأخضر - علي منجلي', category: 'هدايا' },
  { id: 'rw2', name: 'حقيبة تسوق CERCLY', pointsCost: 180, storeName: 'متجر الشريك الأخضر - سيدي مبروك', category: 'أدوات يومية' },
  { id: 'rw3', name: 'قسيمة خصم 15%', pointsCost: 220, storeName: 'متجر الشريك الأخضر - قسنطينة وسط', category: 'قسائم' },
];

export const seedData: AppData = {
  materials: seedMaterials,
  collectionPoints: seedCollectionPoints,
  schedules: seedSchedules,
  recyclingCompanies: seedRecyclingCompanies,
  trucks: seedTrucks,
  rewards: seedRewards,
  invoices: seedInvoices,
  collections: [
    {
      id: 'COL-1',
      collectorId: 'u2',
      pointId: 'p1',
      pointName: 'الحساب المسجل - أحمد بن يوسف',
      registeredUserName: 'أحمد بن يوسف',
      weight: 280,
      materials: ['plastic', 'carton'],
      timestamp: new Date().toISOString(),
      date: 'اليوم',
      time: '09:30',
    },
    {
      id: 'COL-2',
      collectorId: 'u3',
      pointId: 'p2',
      pointName: 'الحساب المسجل - سارة بوزيان',
      registeredUserName: 'سارة بوزيان',
      weight: 95,
      materials: ['battery'],
      timestamp: new Date().toISOString(),
      date: 'اليوم',
      time: '11:00',
      bottleCount: 0,
    },
  ],
  inventory: [
    {
      centerId: 'sc1',
      centerName: 'مركز فرز قسنطينة',
      location: 'قسنطينة وسط',
      items: [
        { materialId: 'plastic', quantity: 1240, capacity: 2200, lastReceived: 280, lastReceivedLabel: 'تم استلام البلاستيك من الجامع أحمد' },
        { materialId: 'carton', quantity: 890, capacity: 1800, lastReceived: 180, lastReceivedLabel: 'تم استلام الكرتون من الجامع خالد' },
        { materialId: 'battery', quantity: 320, capacity: 900, lastReceived: 95, lastReceivedLabel: 'تم استلام البطاريات من الجامع أيمن' },
        { materialId: 'printer_cartridge', quantity: 140, capacity: 450, lastReceived: 30, lastReceivedLabel: 'تم استلام خراطيش الطابعة من جامعة قسنطينة 2' },
        { materialId: 'ink_cartridge', quantity: 110, capacity: 400, lastReceived: 22, lastReceivedLabel: 'تم استلام خراطيش الحبر من سيدي مبروك' },
      ],
    },
  ],
  orders: seedOrders,
  shipments: [
    {
      id: 'SHP-112',
      orderId: 'INV-2026-0038',
      fromCenter: 'مركز فرز قسنطينة',
      materialName: 'كرتون',
      quantity: 850,
      eta: 'غداً 10:00',
      status: 'in_transit',
    },
    {
      id: 'SHP-110',
      orderId: 'INV-2026-0031',
      fromCenter: 'مركز فرز قسنطينة',
      materialName: 'بطاريات',
      quantity: 340,
      eta: '15/06 09:30',
      status: 'scheduled',
    },
  ],
  notifications: [
    { id: 'n1', text: 'تم قبول طلبك من طرف الجامع أحمد في قسنطينة وسط', time: 'منذ 5 دقائق', isNew: true, type: 'success' },
    { id: 'n2', text: 'تم استلام المواد بمركز فرز قسنطينة وتحديث المخزون', time: 'منذ 18 دقيقة', isNew: true, type: 'info' },
    { id: 'n3', text: 'تم إضافة 50 نقطة إلى حسابك بعد عملية جمع ناجحة', time: 'منذ 40 دقيقة', isNew: true, type: 'success' },
    { id: 'n4', text: 'تم اعتماد طلب شراء المواد لشركة قسنطينة للكرتون الصناعي', time: 'منذ ساعة', isNew: true, type: 'warning' },
  ],
  partnerProfile: {
    name: 'أحمد بن يوسف',
    address: 'علي منجلي',
    phone: '+213 550 123 456',
    email: 'ahmed@cercly.dz',
    level: 4,
    points: 320,
    totalRecycled: 18.4,
    co2Saved: 2.9,
    waterSaved: 4200,
    treesProtected: 28,
    operations: 142,
  },
  users: [
    { id: 'u1', name: 'مركز فرز قسنطينة', role: 'sorter', email: 'sorter@cercly.dz', phone: '+213 31 000 001', address: 'قسنطينة وسط', status: 'active', joinDate: '2025-01-15' },
    { id: 'u2', name: 'الجامع أحمد', role: 'collector', email: 'ahmed.collector@cercly.dz', phone: '+213 550 111 111', address: 'الخروب', status: 'active', joinDate: '2025-02-10' },
    { id: 'u3', name: 'الجامع خالد', role: 'collector', email: 'khaled.collector@cercly.dz', phone: '+213 550 222 222', address: 'عين الباي', status: 'active', joinDate: '2025-02-15' },
    { id: 'u6', name: 'الجامع أيمن', role: 'collector', email: 'aymen.collector@cercly.dz', phone: '+213 550 333 333', address: 'الزواغي', status: 'active', joinDate: '2025-03-01' },
    { id: 'f1', name: 'شركة نوميديا للبلاستيك المعاد', role: 'factory', email: 'numidia@cercly.dz', phone: '+213 31 010 001', address: 'الخروب', status: 'active', joinDate: '2025-03-01' },
    { id: 'f2', name: 'شركة قسنطينة للكرتون الصناعي', role: 'factory', email: 'carton@cercly.dz', phone: '+213 31 010 002', address: 'بوسوف', status: 'active', joinDate: '2025-03-05' },
    { id: 'f3', name: 'شركة البطاريات الخضراء', role: 'factory', email: 'battery@cercly.dz', phone: '+213 31 010 003', address: 'عين الباي', status: 'active', joinDate: '2025-03-06' },
    { id: 'f4', name: 'مخبر خرطوشة بلس', role: 'factory', email: 'printer@cercly.dz', phone: '+213 31 010 004', address: 'الزواغي', status: 'active', joinDate: '2025-03-07' },
    { id: 'f5', name: 'مركز إنك ريسايكل', role: 'factory', email: 'ink@cercly.dz', phone: '+213 31 010 005', address: 'علي منجلي', status: 'active', joinDate: '2025-03-08' },
    { id: 'f6', name: 'مصنع الأثر الدائم', role: 'factory', email: 'impact@cercly.dz', phone: '+213 31 010 006', address: 'جامعة الأمير عبد القادر', status: 'active', joinDate: '2025-03-09' },
    { id: 'u4', name: 'أحمد بن يوسف', role: 'partner', email: 'ahmed@cercly.dz', phone: '+213 550 123 456', address: 'علي منجلي', status: 'active', joinDate: '2025-04-20' },
    { id: 'u5', name: 'سارة بوزيان', role: 'partner', email: 'sara@cercly.dz', phone: '+213 550 888 555', address: 'سيدي مبروك', status: 'active', joinDate: '2025-05-01' },
    { id: 'u7', name: 'جمعية المستقبل', role: 'partner', email: 'future@cercly.dz', phone: '+213 31 020 100', address: 'قسنطينة وسط', status: 'active', joinDate: '2025-05-08' },
    { id: 'u8', name: 'نادي البيئة', role: 'partner', email: 'eco.club@cercly.dz', phone: '+213 31 020 200', address: 'جامعة قسنطينة 2', status: 'active', joinDate: '2025-05-10' },
  ],
  config: { roleNames, roleAvatars },
  session: { loggedIn: false, currentRole: 'sorter', currentTab: 'dashboard' },
};
