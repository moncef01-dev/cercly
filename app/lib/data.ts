import type { AppData, Material, PurchaseOrder, CollectionPoint, CollectionSchedule, MaterialType } from './types';

export const seedMaterials: Material[] = [
  { id: 'plastic', name: 'بلاستيك', icon: '🧴', color: '#e07b2a', unit: 'كجم' },
  { id: 'paper', name: 'ورق وكرتون', icon: '📰', color: '#3a6fd4', unit: 'كجم' },
  { id: 'metal', name: 'معادن', icon: '🥫', color: '#7a4fc0', unit: 'كجم' },
  { id: 'glass', name: 'زجاج', icon: '🍶', color: '#2d8a3e', unit: 'كجم' },
  { id: 'mixed', name: 'مختلط', icon: '♻️', color: '#6b7280', unit: 'كجم' },
];

export const seedCollectionPoints: CollectionPoint[] = [
  { id: 'p1', name: 'شارع ١٢ نوفمبر، وسط المدينة', address: 'شارع ١٢ نوفمبر', lat: 36.3520, lng: 6.6110, materials: ['plastic', 'paper'] as MaterialType[], status: 'completed' as const, order: 1 },
  { id: 'p2', name: 'حي النصر، عمارة ٢٨', address: 'حي النصر', lat: 36.3580, lng: 6.6150, materials: ['plastic'] as MaterialType[], status: 'completed' as const, order: 2 },
  { id: 'p3', name: 'حي بونوارة، عمارة ١٥', address: 'حي بونوارة', lat: 36.3450, lng: 6.6250, materials: ['mixed'] as MaterialType[], status: 'upcoming' as const, order: 3 },
  { id: 'p4', name: 'مركز فرز قسنطينة', address: 'المنطقة الصناعية', lat: 36.3400, lng: 6.6350, materials: [] as MaterialType[], status: 'upcoming' as const, order: 4 },
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

const roleNames: Record<string, string> = {
  sorter: 'مركز الفرز',
  collector: 'فريق الجمع',
  factory: 'مصنع التدوير',
  partner: 'الشركاء',
  admin: 'الإدارة العامة',
};

const roleAvatars: Record<string, string> = {
  sorter: 'فر',
  collector: 'جم',
  factory: 'مص',
  partner: 'شر',
  admin: 'إد',
};

export const seedSchedules: CollectionSchedule[] = [
  {
    id: 'sch-1', partnerId: 'u4', pointId: 'p3',
    pointName: 'حي بونوارة، عمارة ١٥', address: 'حي بونوارة',
    scheduledDate: 'غداً', scheduledTime: '14:30',
    status: 'pending',
  },
];

export const seedData: AppData = {
  materials: seedMaterials,
  collectionPoints: seedCollectionPoints,
  schedules: seedSchedules,
  collections: [
    {
      id: 'COL-1', collectorId: 'c1', pointId: 'p1', pointName: 'شارع ١٢ نوفمبر، وسط المدينة',
      weight: 280, materials: ['plastic', 'paper'], timestamp: new Date().toISOString(),
      date: 'اليوم', time: '09:30',
    },
    {
      id: 'COL-2', collectorId: 'c1', pointId: 'p2', pointName: 'حي النصر، عمارة ٢٨',
      weight: 320, materials: ['paper'], timestamp: new Date().toISOString(),
      date: 'اليوم', time: '11:00',
    },
  ],
  inventory: [
    {
      centerId: 'sc1', centerName: 'مركز فرز قسنطينة', location: 'المنطقة الصناعية، قسنطينة',
      items: [
        { materialId: 'plastic', quantity: 1240, capacity: 2000, lastReceived: 450, lastReceivedLabel: 'آخر استلام: 450 كجم' },
        { materialId: 'paper', quantity: 890, capacity: 2000, lastReceived: 320, lastReceivedLabel: 'آخر استلام: 320 كجم' },
        { materialId: 'metal', quantity: 560, capacity: 1500, lastReceived: 180, lastReceivedLabel: 'آخر استلام: 180 كجم' },
        { materialId: 'glass', quantity: 400, capacity: 1000, lastReceived: 200, lastReceivedLabel: 'آخر استلام: 200 كجم' },
      ],
    },
    {
      centerId: 'sc2', centerName: 'مركز فرز حي الزواغي', location: 'حي الزواغي، قسنطينة',
      items: [
        { materialId: 'glass', quantity: 720, capacity: 1000, lastReceived: 300, lastReceivedLabel: '' },
        { materialId: 'plastic', quantity: 380, capacity: 800, lastReceived: 150, lastReceivedLabel: '' },
      ],
    },
  ],
  orders: [
    {
      id: 'INV-0042', factoryId: 'f1', factoryName: 'مصنع تدوير الورق قسنطينة',
      centerId: 'sc1', centerName: 'مركز فرز قسنطينة',
      materialId: 'paper', materialName: 'ورق وكرتون',
      quantity: 2000, status: 'pending', createdAt: 'اليوم',
    },
    {
      id: 'INV-0038', factoryId: 'f1', factoryName: 'مصنع تدوير الورق قسنطينة',
      centerId: 'sc1', centerName: 'مركز فرز قسنطينة',
      materialId: 'plastic', materialName: 'بلاستيك',
      quantity: 1500, status: 'confirmed', createdAt: 'أمس',
    },
  ] as PurchaseOrder[],
  shipments: [
    {
      id: 'SHP-112', orderId: 'INV-0038',
      fromCenter: 'مركز فرز قسنطينة', materialName: 'بلاستيك',
      quantity: 1200, eta: 'غداً 10:00', status: 'in_transit',
    },
    {
      id: 'SHP-110', orderId: 'INV-0035',
      fromCenter: 'مركز فرز حي الزواغي', materialName: 'زجاج',
      quantity: 600, eta: 'بعد غد', status: 'scheduled',
    },
  ],
  notifications: [
    { id: 'n1', text: 'تم استلام 450 كجم من البلاستيك في مركز فرز قسنطينة', time: 'منذ 5 دقائق', isNew: true, type: 'info' },
    { id: 'n2', text: 'مصنع تدوير الورق قسنطينة يطلب 2 طن من الورق — موعد التسليم غداً', time: 'منذ 30 دقيقة', isNew: true, type: 'warning' },
    { id: 'n3', text: 'تم تأكيد دفع فاتورة رقم INV-2026-0042', time: 'منذ ساعة', isNew: true, type: 'info' },
    { id: 'n4', text: 'تنبيه: جمع المواد في حي بونوارة مجدول اليوم', time: 'منذ 2 ساعة', isNew: true, type: 'warning' },
  ],
  partnerProfile: {
    name: 'أحمد بلقاسم', address: 'حي النصر، عمارة ٢٨', phone: '+213 550 123 456',
    email: 'ahmed@cercy.dz', level: 4, points: 320,
    totalRecycled: 18.4, co2Saved: 2.3, operations: 142,
  },
  users: [
    { id: 'u1', name: 'مركز فرز قسنطينة', role: 'sorter', email: 'sorter@cercy.dz', phone: '', address: 'المنطقة الصناعية، قسنطينة', status: 'active', joinDate: '2025-01-15' },
    { id: 'u2', name: 'فريق وسط المدينة', role: 'collector', email: 'centre@cercy.dz', phone: '', address: 'وسط المدينة، قسنطينة', status: 'active', joinDate: '2025-02-10' },
    { id: 'u3', name: 'فريق حي النصر', role: 'collector', email: 'nasr@cercy.dz', phone: '', address: 'حي النصر، قسنطينة', status: 'active', joinDate: '2025-02-15' },
    { id: 'u6', name: 'فريق حي بونوارة', role: 'collector', email: 'bounerou@cercy.dz', phone: '', address: 'حي بونوارة، قسنطينة', status: 'active', joinDate: '2025-03-01' },
    { id: 'u7', name: 'مصنع تدوير الورق قسنطينة', role: 'factory', email: 'factory@cercy.dz', phone: '', address: 'المنطقة الصناعية، قسنطينة', status: 'active', joinDate: '2025-03-01' },
    { id: 'u4', name: 'أحمد بلقاسم', role: 'partner', email: 'ahmed@cercy.dz', phone: '+213 550 123 456', address: 'حي النصر، عمارة ٢٨', status: 'active', joinDate: '2025-04-20' },
    { id: 'u5', name: 'سعيدة عمراوي', role: 'partner', email: 'saida@cercy.dz', phone: '', address: 'حي بونوارة، عمارة ١٥', status: 'inactive', joinDate: '2025-05-01' },
  ],
  config: { roleNames, roleAvatars },
  session: { loggedIn: false, currentRole: 'sorter', currentTab: 'dashboard' },
};
