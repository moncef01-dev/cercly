export type Role = 'sorter' | 'collector' | 'factory' | 'partner' | 'admin';
export type Tab = string;

export type MaterialType = 'plastic' | 'paper' | 'metal' | 'glass' | 'mixed';
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
  type: 'info' | 'warning';
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
  operations: number;
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
  config: AppConfig;
  session: AppSession;
}

export type AppAction =
  | { type: 'ADD_COLLECTION'; payload: CollectionRecord }
  | { type: 'UPDATE_INVENTORY'; payload: { centerId: string; materialId: MaterialType; quantity: number } }
  | { type: 'ADD_INVENTORY_ITEM'; payload: { centerId: string; item: InventoryItem } }
  | { type: 'REMOVE_INVENTORY_ITEM'; payload: { centerId: string; materialId: MaterialType } }
  | { type: 'UPDATE_INVENTORY_CAPACITY'; payload: { centerId: string; materialId: MaterialType; capacity: number } }
  | { type: 'ADD_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'ADD_SHIPMENT'; payload: Shipment }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'UPDATE_PARTNER_PROFILE'; payload: Partial<PartnerProfile> }
  | { type: 'ADD_USER'; payload: PlatformUser }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; status: UserStatus } }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'ADD_MATERIAL'; payload: Material }
  | { type: 'UPDATE_MATERIAL'; payload: Material }
  | { type: 'DELETE_MATERIAL'; payload: string }
  | { type: 'ADD_COLLECTION_POINT'; payload: CollectionPoint }
  | { type: 'UPDATE_COLLECTION_POINT'; payload: CollectionPoint }
  | { type: 'DELETE_COLLECTION_POINT'; payload: string }
  | { type: 'SET_POINT_STATUS'; payload: { id: string; status: CollectionPointStatus } }
  | { type: 'SET_SESSION'; payload: AppSession }
  | { type: 'UPDATE_CONFIG'; payload: Partial<AppConfig> }
  | { type: 'ADD_SCHEDULE'; payload: CollectionSchedule }
  | { type: 'UPDATE_SCHEDULE_STATUS'; payload: { id: string; status: AttendanceStatus } }
  | { type: 'CONFIRM_ATTENDANCE'; payload: string }
  | { type: 'POSTPONE_ATTENDANCE'; payload: { id: string; newDate: string; newTime: string } };
