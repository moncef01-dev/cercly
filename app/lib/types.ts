export type Role = 'sorter' | 'collector' | 'factory' | 'partner' | 'admin';
export type Tab = string;

export type MaterialType =
  | 'plastic'
  | 'carton'
  | 'battery'
  | 'printer_cartridge'
  | 'ink_cartridge';
export type OrderStatus = 'pending' | 'confirmed' | 'delivered';
export type CollectionPointStatus = 'completed' | 'upcoming' | 'pending';
export type ShipmentStatus = 'in_transit' | 'scheduled';
export type UserStatus = 'active' | 'inactive';
export type CenterStatus = 'active' | 'inactive';
export type AttendanceStatus = 'pending' | 'confirmed' | 'postponed' | 'completed' | 'cancelled';

export interface Material {
  id: MaterialType;
  name: string;
  icon: string;
  color: string;
  unit: string;
}

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  materials: MaterialType[];
  status: CollectionPointStatus;
  schedule?: string;
  order: number;
  accountName?: string;
  quantityMode?: 'kg' | 'bottles';
  quantityValue?: number;
}

export interface CollectionRecord {
  id: string;
  collectorId: string;
  pointId: string;
  pointName: string;
  weight: number;
  materials: MaterialType[];
  photo?: string;
  timestamp: string;
  date: string;
  time: string;
  registeredUserName?: string;
  bottleCount?: number;
}

export interface InventoryItem {
  materialId: MaterialType;
  quantity: number;
  capacity: number;
  lastReceived: number;
  lastReceivedLabel: string;
}

export interface CenterInventory {
  centerId: string;
  centerName: string;
  location: string;
  items: InventoryItem[];
}

export interface PurchaseOrder {
  id: string;
  factoryId: string;
  factoryName: string;
  centerId: string;
  centerName: string;
  materialId: MaterialType;
  materialName: string;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  fromCenter: string;
  materialName: string;
  quantity: number;
  eta: string;
  status: ShipmentStatus;
}

export interface PlatformUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  phone: string;
  address: string;
  status: UserStatus;
  joinDate: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  isNew: boolean;
  type: 'info' | 'warning' | 'success';
}

export interface CollectionSchedule {
  id: string;
  partnerId: string;
  pointId: string;
  pointName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: AttendanceStatus;
  notes?: string;
  quantityMode?: 'kg' | 'bottles';
  quantityValue?: number;
}

export interface PartnerProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  level: number;
  points: number;
  totalRecycled: number;
  co2Saved: number;
  waterSaved: number;
  treesProtected: number;
  operations: number;
}

export interface RecyclingCompany {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  specialty: string;
}

export interface TruckLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'loading' | 'en_route' | 'delivered';
}

export interface RewardItem {
  id: string;
  name: string;
  pointsCost: number;
  storeName: string;
  category: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  date: string;
  companyName: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  completed: boolean;
}

export interface AppConfig {
  roleNames: Record<Role, string>;
  roleAvatars: Record<Role, string>;
}

export interface AppSession {
  loggedIn: boolean;
  currentRole: Role;
  currentTab: string;
}

export interface AppData {
  materials: Material[];
  collectionPoints: CollectionPoint[];
  collections: CollectionRecord[];
  inventory: CenterInventory[];
  orders: PurchaseOrder[];
  shipments: Shipment[];
  notifications: Notification[];
  partnerProfile: PartnerProfile;
  users: PlatformUser[];
  schedules: CollectionSchedule[];
  recyclingCompanies: RecyclingCompany[];
  trucks: TruckLocation[];
  rewards: RewardItem[];
  invoices: Invoice[];
  config: AppConfig;
  session: AppSession;
}
