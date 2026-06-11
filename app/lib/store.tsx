'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppData,
  AttendanceStatus,
  CollectionPoint,
  CollectionPointStatus,
  CollectionSchedule,
  Invoice,
  InventoryItem,
  Material,
  MaterialType,
  Notification,
  OrderStatus,
  PointsHistory,
  RewardItem,
  Role,
  UserStatus,
} from './types';
import { generateInvoiceNumber, seedData } from './data';

interface AppStore extends AppData {
  addCollection: (payload: AppData['collections'][number]) => void;
  updateInventory: (payload: { centerId: string; materialId: MaterialType; quantity: number }) => void;
  deductInventory: (payload: { centerId: string; materialId: MaterialType; quantity: number }) => void;
  addInventoryItem: (payload: { centerId: string; item: InventoryItem }) => void;
  removeInventoryItem: (payload: { centerId: string; materialId: MaterialType }) => void;
  updateInventoryCapacity: (payload: { centerId: string; materialId: MaterialType; capacity: number }) => void;
  addOrder: (payload: AppData['orders'][number]) => void;
  updateOrderStatus: (payload: { orderId: string; status: OrderStatus }) => void;
  addShipment: (payload: AppData['shipments'][number]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updatePartnerProfile: (payload: Partial<AppData['partnerProfile']>) => void;
  addUser: (payload: AppData['users'][number]) => void;
  updateUserStatus: (payload: { userId: string; status: UserStatus }) => void;
  addNotification: (payload: Notification) => void;
  addInvoice: (payload: Invoice) => void;
  redeemReward: (payload: RewardItem) => void;
  addPointsHistory: (payload: PointsHistory) => void;
  addCollectorEarnings: (amount: number) => void;
  addMaterial: (payload: Material) => void;
  updateMaterial: (payload: Material) => void;
  deleteMaterial: (id: string) => void;
  addCollectionPoint: (payload: CollectionPoint) => void;
  updateCollectionPoint: (payload: CollectionPoint) => void;
  deleteCollectionPoint: (id: string) => void;
  setPointStatus: (payload: { id: string; status: CollectionPointStatus }) => void;
  login: (role: Role) => void;
  logout: () => void;
  setTab: (tab: string) => void;
  switchRole: (role: Role) => void;
  addSchedule: (payload: CollectionSchedule) => void;
  updateScheduleStatus: (payload: { id: string; status: AttendanceStatus }) => void;
  confirmAttendance: (id: string) => void;
  postponeAttendance: (payload: { id: string; newDate: string; newTime: string }) => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      ...seedData,

      addCollection: (payload) =>
        set((s) => ({ collections: [payload, ...s.collections] })),

      updateInventory: ({ centerId, materialId, quantity }) =>
        set((s) => ({
          inventory: s.inventory.map((center) =>
            center.centerId === centerId
              ? {
                  ...center,
                  items: center.items.map((item) =>
                    item.materialId === materialId
                      ? {
                          ...item,
                          quantity: item.quantity + quantity,
                          lastReceived: quantity,
                          lastReceivedLabel: `تم استلام ${quantity} ${item.materialId === 'printer_cartridge' || item.materialId === 'ink_cartridge' ? 'قطعة' : 'كجم'}`,
                        }
                      : item,
                  ),
                }
              : center,
          ),
        })),

      deductInventory: ({ centerId, materialId, quantity }) =>
        set((s) => ({
          inventory: s.inventory.map((center) =>
            center.centerId === centerId
              ? {
                  ...center,
                  items: center.items.map((item) =>
                    item.materialId === materialId
                      ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
                      : item,
                  ),
                }
              : center,
          ),
        })),

      addInventoryItem: ({ centerId, item }) =>
        set((s) => ({
          inventory: s.inventory.map((center) =>
            center.centerId === centerId
              ? { ...center, items: [...center.items, item] }
              : center,
          ),
        })),

      removeInventoryItem: ({ centerId, materialId }) =>
        set((s) => ({
          inventory: s.inventory.map((center) =>
            center.centerId === centerId
              ? { ...center, items: center.items.filter((i) => i.materialId !== materialId) }
              : center,
          ),
        })),

      updateInventoryCapacity: ({ centerId, materialId, capacity }) =>
        set((s) => ({
          inventory: s.inventory.map((center) =>
            center.centerId === centerId
              ? {
                  ...center,
                  items: center.items.map((item) =>
                    item.materialId === materialId ? { ...item, capacity } : item,
                  ),
                }
              : center,
          ),
        })),

      addOrder: (payload) =>
        set((s) => ({
          orders: [...s.orders, payload],
          invoices: [
            ...s.invoices,
            {
              id: `invoice-${Date.now()}`,
              orderId: payload.id,
              invoiceNumber: generateInvoiceNumber(),
              date: new Date().toLocaleDateString('fr-FR'),
              companyName: payload.factoryName,
              materialName: payload.materialName,
              quantity: payload.quantity,
              unitPrice: payload.materialId === 'battery' ? 135 : payload.materialId.includes('cartridge') ? 95 : 48,
              totalPrice:
                payload.quantity *
                (payload.materialId === 'battery' ? 135 : payload.materialId.includes('cartridge') ? 95 : 48),
              completed: false,
            },
          ],
        })),

      updateOrderStatus: ({ orderId, status }) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o,
          ),
          invoices: s.invoices.map((invoice) =>
            invoice.orderId === orderId && status !== 'pending'
              ? { ...invoice, completed: true }
              : invoice,
          ),
        })),

      addShipment: (payload) =>
        set((s) => ({ shipments: [...s.shipments, payload] })),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isNew: false } : n,
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isNew: false })),
        })),

      updatePartnerProfile: (payload) =>
        set((s) => ({
          partnerProfile: { ...s.partnerProfile, ...payload },
        })),

      addUser: (payload) =>
        set((s) => ({ users: [...s.users, payload] })),

      updateUserStatus: ({ userId, status }) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId ? { ...u, status } : u,
          ),
        })),

      addNotification: (payload) =>
        set((s) => ({
          notifications: [payload, ...s.notifications],
        })),

      addInvoice: (payload) =>
        set((s) => ({
          invoices: [...s.invoices, payload],
        })),

      redeemReward: (payload) =>
        set((s) => {
          if (s.partnerProfile.points < payload.pointsCost) return s;
          return {
            partnerProfile: {
              ...s.partnerProfile,
              points: s.partnerProfile.points - payload.pointsCost,
            },
            pointsHistory: [
              {
                id: `ph-redeem-${Date.now()}`,
                points: payload.pointsCost,
                reason: `استبدال ${payload.name} من ${payload.storeName}`,
                date: new Date().toLocaleDateString('fr-FR'),
                type: 'redeemed',
              },
              ...s.pointsHistory,
            ],
            notifications: [
              {
                id: `reward-${Date.now()}`,
                icon: '🎁',
                title: 'تم الاستبدال',
                text: `تم تأكيد استبدال ${payload.name} من ${payload.storeName}`,
                time: 'الآن',
                isNew: true,
                type: 'success',
                role: s.session.currentRole,
              },
              ...s.notifications,
            ],
          };
        }),

      addPointsHistory: (payload) =>
        set((s) => ({ pointsHistory: [payload, ...s.pointsHistory] })),

      addCollectorEarnings: (amount) =>
        set((s) => ({ collectorEarnings: s.collectorEarnings + amount })),

      addMaterial: (payload) =>
        set((s) => ({ materials: [...s.materials, payload] })),

      updateMaterial: (payload) =>
        set((s) => ({
          materials: s.materials.map((m) =>
            m.id === payload.id ? payload : m,
          ),
        })),

      deleteMaterial: (id) =>
        set((s) => ({
          materials: s.materials.filter((m) => m.id !== id),
        })),

      addCollectionPoint: (payload) =>
        set((s) => ({ collectionPoints: [...s.collectionPoints, payload] })),

      updateCollectionPoint: (payload) =>
        set((s) => ({
          collectionPoints: s.collectionPoints.map((p) =>
            p.id === payload.id ? payload : p,
          ),
        })),

      deleteCollectionPoint: (id) =>
        set((s) => ({
          collectionPoints: s.collectionPoints.filter((p) => p.id !== id),
        })),

      setPointStatus: ({ id, status }) =>
        set((s) => ({
          collectionPoints: s.collectionPoints.map((p) =>
            p.id === id ? { ...p, status } : p,
          ),
        })),

      login: (role) =>
        set((s) => ({
          session: { ...s.session, loggedIn: true, currentRole: role, currentTab: 'dashboard' },
        })),

      logout: () =>
        set((s) => ({
          session: { ...s.session, loggedIn: false },
        })),

      setTab: (tab) =>
        set((s) => ({
          session: { ...s.session, currentTab: tab },
        })),

      switchRole: (role) =>
        set((s) => ({
          session: { ...s.session, currentRole: role, currentTab: 'dashboard' },
        })),

      addSchedule: (payload) =>
        set((s) => ({ schedules: [...s.schedules, payload] })),

      updateScheduleStatus: ({ id, status }) =>
        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id ? { ...sch, status } : sch,
          ),
        })),

      confirmAttendance: (id) =>
        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id ? { ...sch, status: 'confirmed' } : sch,
          ),
        })),

      postponeAttendance: ({ id, newDate, newTime }) =>
        set((s) => ({
          schedules: s.schedules.map((sch) =>
            sch.id === id
              ? { ...sch, status: 'postponed', scheduledDate: newDate, scheduledTime: newTime }
              : sch,
          ),
        })),
    }),
    {
      name: 'cercly-storage-v2',
      partialize: (state) => {
        const { config: _, notifications: __, ...rest } = state;
        return rest;
      },
    },
  ),
);
