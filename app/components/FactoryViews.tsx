'use client';

import { useState } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import { generateOrderId } from '../lib/data';
import { Bell, Check, Send, Package, Clock, MapPin, Factory } from 'lucide-react';

interface FactoryViewsProps {
  currentTab: Tab;
  onSetTab?: (tab: Tab) => void;
}

export default function FactoryViews({ currentTab, onSetTab }: FactoryViewsProps) {
  const inventory = useStore((s) => s.inventory);
  const orders = useStore((s) => s.orders);
  const shipments = useStore((s) => s.shipments);
  const addOrder = useStore((s) => s.addOrder);
  const deductInventory = useStore((s) => s.deductInventory);
  const addNotification = useStore((s) => s.addNotification);
  const materials = useStore((s) => s.materials);

  const [orderCenter, setOrderCenter] = useState('sc1');
  const [orderMaterial, setOrderMaterial] = useState<MaterialType>('plastic');
  const [orderQty, setOrderQty] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [orderError, setOrderError] = useState('');

  function getAvailableQty(centerId: string, materialId: string): number {
    const center = inventory.find((c) => c.centerId === centerId);
    if (!center) return 0;
    const item = center.items.find((i) => i.materialId === materialId);
    return item?.quantity ?? 0;
  }

  function handleCreateOrder() {
    setOrderError('');
    const qty = parseInt(orderQty);
    if (!qty || qty <= 0) {
      setOrderError('الرجاء إدخال كمية صالحة');
      return;
    }

    const center = inventory.find((c) => c.centerId === orderCenter);
    const mat = materials.find((m) => m.id === orderMaterial);
    const orderId = generateOrderId();

    const available = getAvailableQty(orderCenter, orderMaterial);
    if (qty > available) {
      setOrderError(`الكمية المتاحة فقط ${available.toLocaleString()} كجم`);
      return;
    }

    addOrder({
      id: orderId,
      factoryId: 'f1',
      factoryName: 'مصنع الأمل',
      centerId: orderCenter,
      centerName: center?.centerName ?? '',
      materialId: orderMaterial,
      materialName: mat?.name ?? orderMaterial,
      quantity: qty,
      status: 'pending',
      createdAt: 'اليوم',
    });

    deductInventory({ centerId: orderCenter, materialId: orderMaterial, quantity: qty });

    addNotification({
      id: `notif-${Date.now()}`,
      text: `طلب شراء جديد ${orderId} — ${mat?.name} ${qty} كجم من ${center?.centerName}`,
      time: 'الآن',
      isNew: true,
      type: 'warning',
    });

    setOrderSent(true);
    setOrderQty('');
    setTimeout(() => setOrderSent(false), 3000);
  }

  if (currentTab === 'dashboard') {
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>مصنع الأمل — لوحة التحكم</div>
        {pendingOrders > 0 && (
          <div className="alert info"><Bell size={16} /> {pendingOrders} طلب شراء — قيد الموافقة</div>
        )}
        <div className="stats">
          <div className="stat-card"><div className="stat-val">4.8 طن</div><div className="stat-label">استلام هذا الأسبوع</div></div>
          <div className="stat-card"><div className="stat-val">{activeOrders}</div><div className="stat-label">طلبات نشطة</div></div>
          <div className="stat-card"><div className="stat-val">12.4 طن</div><div className="stat-label">مواد هذا الشهر</div></div>
          <div className="stat-card">          <div className="stat-val">{shipments.filter((s) => s.status === 'in_transit').length}</div><div className="stat-label">شحنات في الطريق</div></div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">المواد المتاحة في المراكز</span>
            <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot"></span>مباشر</span>
          </div>
          {inventory[0].items.map((item) => {
            const mat = materials.find((m) => m.id === item.materialId);
            return (
              <div className="mat-row" key={item.materialId}>
                <div className="mat-icon" style={{ background: mat ? '#fff3e0' : '#e8f0ff' }}>{mat?.icon ?? '📦'}</div>
                <div className="mat-info">
                  <div className="mat-name">{mat?.name ?? item.materialId}</div>
                  <div className="mat-qty">{inventory[0].centerName}</div>
                </div>
                <div>
                  <div className="mat-val">{item.quantity.toLocaleString()} كجم</div>
                    <button className="btn-sm primary" style={{ marginTop: '4px', fontSize: '11px' }} onClick={() => { setOrderMaterial(item.materialId); setOrderCenter('sc1'); onSetTab?.('orders'); }}>
                    طلب شراء
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (currentTab === 'available') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>المخزون المتاح — جميع المراكز</div>
        <div className="alert success"><Check size={16} /> البيانات محدّثة في الوقت الفعلي من مراكز الفرز</div>
        {inventory.map((c) => (
          <div className="card" key={c.centerId}>
            <div className="card-header">
              <span className="card-title">{c.centerName}</span>
              <span className="text-sm">{c.location}</span>
            </div>
            {c.items.map((item) => {
              const mat = materials.find((m) => m.id === item.materialId);
              return (
                <div className="mat-row" key={item.materialId}>
                  <div className="mat-info"><div className="mat-name">{mat?.name ?? item.materialId}</div></div>
                  <div className="mat-val" style={{ marginRight: '8px' }}>{item.quantity.toLocaleString()} كجم</div>
                  <span className="badge badge-green">متاح</span>
                </div>
              );
            })}
          </div>
        ))}
      </>
    );
  }

  if (currentTab === 'orders') {
    const statusBadge: Record<string, string> = {
      pending: 'badge-orange',
      confirmed: 'badge-green',
      delivered: 'badge-blue',
    };
    const statusLabels: Record<string, string> = {
      pending: 'انتظار',
      confirmed: 'مؤكد',
      delivered: 'تسليم',
    };

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>إدارة الطلبات</div>
        {orderSent && (
          <div className="alert success"><Check size={16} /> تم إرسال طلب الشراء بنجاح</div>
        )}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>إنشاء طلب شراء جديد</div>
          <div className="form-row">
            <div className="form-label">مركز الفرز</div>
            <select className="form-select" value={orderCenter} onChange={(e) => setOrderCenter(e.target.value)}>
        {inventory.map((c) => (
                <option key={c.centerId} value={c.centerId}>{c.centerName}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">نوع المادة</div>
            <select className="form-select" value={orderMaterial} onChange={(e) => setOrderMaterial(e.target.value as MaterialType)}>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">الكمية المطلوبة (كجم)</div>
            <input className="inp" type="number" style={{ margin: 0 }} placeholder="أدخل الكمية" value={orderQty} onChange={(e) => { setOrderQty(e.target.value); setOrderError(''); }} />
          </div>
          <div className="text-sm" style={{ color: '#666', marginBottom: '8px' }}>
            المتوفر: {getAvailableQty(orderCenter, orderMaterial).toLocaleString()} كجم
          </div>
          {orderError && (
            <div className="alert danger" style={{ padding: '8px', fontSize: '12px', marginBottom: '8px' }}>
              {orderError}
            </div>
          )}
          <div className="btn-row">
            <button className="btn-sm primary" style={{ flex: 1 }} onClick={handleCreateOrder}>
              <Send size={16} /> إرسال طلب الشراء
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>الطلبات الجارية</div>
          {orders.map((o) => (
            <div className="order-row" key={o.id}>
              <div className="order-avatar" style={{ fontSize: '11px', fontWeight: 500 }}>
                <Factory size={18} />
              </div>
              <div className="order-info">
                <div className="order-title">{o.id} — {o.materialName}</div>
                <div className="order-sub">{o.quantity.toLocaleString()} كجم • {o.createdAt}</div>
              </div>
              <span className={`badge ${statusBadge[o.status]}`}>{statusLabels[o.status]}</span>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="text-sm" style={{ textAlign: 'center', padding: '16px' }}>لا توجد طلبات بعد</div>
          )}
        </div>
      </>
    );
  }

  if (currentTab === 'shipments') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الشحنات الواردة</div>
        {shipments.map((s) => (
          <div className="card" key={s.id}>
            <div className="flex-between" style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.id}</span>
              <span className={`badge ${s.status === 'in_transit' ? 'badge-blue' : 'badge-orange'}`}>
                {s.status === 'in_transit' ? 'في الطريق' : 'مجدول'}
              </span>
            </div>
            <div className="text-sm" style={{ marginBottom: '4px' }}>
              <MapPin size={13} style={{ verticalAlign: 'middle' }} /> من: {s.fromCenter}
            </div>
            <div className="text-sm" style={{ marginBottom: '4px' }}>
              <Package size={13} style={{ verticalAlign: 'middle' }} /> {s.materialName} — {s.quantity.toLocaleString()} كجم
            </div>
            <div className="text-sm">
              <Clock size={13} style={{ verticalAlign: 'middle' }} /> وصول متوقع: {s.eta}
            </div>
          </div>
        ))}
        {shipments.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div className="text-sm">لا توجد شحنات واردة</div>
          </div>
        )}
      </>
    );
  }

  return null;
}
