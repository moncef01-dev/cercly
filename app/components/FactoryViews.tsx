'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import { generateOrderId } from '../lib/data';
import { Bell, Check, Send, Package, Clock, MapPin, Factory, FileText, Award } from 'lucide-react';

interface FactoryViewsProps {
  currentTab: Tab;
  onSetTab?: (tab: Tab) => void;
}

const factoryNames: Record<string, string> = {
  f1: 'شركة نوميديا للبلاستيك المعاد',
  f2: 'شركة قسنطينة للكرتون الصناعي',
  f3: 'شركة البطاريات الخضراء',
  f4: 'مخبر خرطوشة بلس',
  f5: 'مركز إنك ريسايكل',
  f6: 'مصنع الأثر الدائم',
};

export default function FactoryViews({ currentTab, onSetTab }: FactoryViewsProps) {
  const inventory = useStore((s) => s.inventory);
  const orders = useStore((s) => s.orders);
  const shipments = useStore((s) => s.shipments);
  const invoices = useStore((s) => s.invoices);
  const addOrder = useStore((s) => s.addOrder);
  const deductInventory = useStore((s) => s.deductInventory);
  const addNotification = useStore((s) => s.addNotification);
  const materials = useStore((s) => s.materials);

  const [orderCenter, setOrderCenter] = useState('sc1');
  const [orderMaterial, setOrderMaterial] = useState<MaterialType>('plastic');
  const [orderQty, setOrderQty] = useState('');
  const [orderSent, setOrderSent] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [selectedFactory, setSelectedFactory] = useState('f1');
  const [viewFactory, setViewFactory] = useState<string | null>(null);

  const factoryList = useMemo(() =>
    ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].map((id) => ({
      id,
      name: factoryNames[id],
      orders: orders.filter((o) => o.factoryId === id),
    })),
    [orders],
  );

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
      factoryId: selectedFactory,
      factoryName: factoryNames[selectedFactory] || 'مصنع الأمل',
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
      icon: '📄',
      title: 'طلب شراء جديد',
      text: `طلب شراء جديد ${orderId} من ${factoryNames[selectedFactory]} — ${mat?.name} ${qty} كجم`,
      time: 'الآن',
      isNew: true,
      type: 'warning',
      role: 'factory',
    });

    setOrderSent(true);
    setOrderQty('');
    setTimeout(() => setOrderSent(false), 3000);
  }

  function getInvoiceForOrder(orderId: string) {
    return invoices.find((inv) => inv.orderId === orderId);
  }

  if (currentTab === 'dashboard') {
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;
    const completedInvoices = invoices.filter((inv) => inv.completed).length;
    const totalOrders = orders.length;

    if (viewFactory) {
      const factoryOrders = orders.filter((o) => o.factoryId === viewFactory);
      const companyName = factoryNames[viewFactory] || 'مصنع التدوير';
      return (
        <>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <button className="btn-sm" onClick={() => setViewFactory(null)}>← العودة</button>
            <span className="badge badge-green">{companyName}</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
            <Factory size={20} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
            {companyName}
          </div>
          <div className="stats">
            <div className="stat-card"><div className="stat-val">{factoryOrders.length}</div><div className="stat-label">الطلبات</div></div>
            <div className="stat-card"><div className="stat-val">{factoryOrders.filter((o) => o.status === 'confirmed').length}</div><div className="stat-label">معتمدة</div></div>
          </div>
          {factoryOrders.map((o) => {
            const invoice = getInvoiceForOrder(o.id);
            return (
              <div className="card" key={o.id}>
                <div className="flex-between" style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{o.id}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {o.status === 'confirmed' && invoice?.completed && (
                      <span style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>✅</span>
                    )}
                    <span className={`badge ${o.status === 'pending' ? 'badge-orange' : 'badge-green'}`}>
                      {o.status === 'pending' ? 'معلق' : 'معتمد'}
                    </span>
                  </div>
                </div>
                <div className="text-sm">{o.materialName} — {o.quantity.toLocaleString()} كجم</div>
                <div className="text-sm">{o.createdAt}</div>
                {invoice && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#fff8e1', borderRadius: '8px', border: '1px solid #ffe082' }}>
                    <div className="flex-between">
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>فاتورة: {invoice.invoiceNumber}</span>
                      <span style={{ fontSize: '12px', fontWeight: 500 }}>{invoice.date}</span>
                    </div>
                    <div className="flex-between" style={{ marginTop: '4px' }}>
                      <span className="text-sm">المبلغ: {invoice.totalPrice.toLocaleString()} د.ج</span>
                      {invoice.completed && <span style={{ fontSize: '16px', color: '#D4AF37' }}>✅</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </>
      );
    }

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
          <Factory size={20} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
          شركات التدوير — لوحة التحكم
        </div>
        {pendingOrders > 0 && (
          <div className="alert info"><Bell size={16} /> {pendingOrders} طلب شراء — قيد الموافقة</div>
        )}
        <div className="stats">
          <div className="stat-card"><div className="stat-val">{totalOrders}</div><div className="stat-label">إجمالي الطلبات</div></div>
          <div className="stat-card"><div className="stat-val">{activeOrders}</div><div className="stat-label">طلبات نشطة</div></div>
          <div className="stat-card"><div className="stat-val">{completedInvoices}</div><div className="stat-label">فواتير مكتملة</div></div>
          <div className="stat-card"><div className="stat-val">{shipments.filter((s) => s.status === 'in_transit').length}</div><div className="stat-label">شحنات في الطريق</div></div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Award size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />شركات التدوير</span>
          </div>
          {factoryList.map((f) => (
            <div className="order-row" key={f.id} style={{ cursor: 'pointer' }} onClick={() => setViewFactory(f.id)}>
              <div className="order-avatar" style={{ background: '#fff3e0', color: 'var(--orange)' }}>
                <Factory size={18} />
              </div>
              <div className="order-info">
                <div className="order-title">{f.name}</div>
                <div className="order-sub">{f.orders.length} طلبات</div>
              </div>
              <span style={{ fontSize: '16px', color: 'var(--text-3)' }}>←</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">المواد المتاحة</span>
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
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>المخزون المتاح — مركز فرز قسنطينة</div>
        <div className="alert success"><Check size={16} /> البيانات محدّثة في الوقت الفعلي</div>
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
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>إدارة الطلبات والفواتير</div>
        {orderSent && (
          <div className="alert success"><Check size={16} /> تم إرسال طلب الشراء بنجاح</div>
        )}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>إنشاء طلب شراء جديد</div>
          <div className="form-row">
            <div className="form-label">الشركة</div>
            <select className="form-select" value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)}>
              {Object.entries(factoryNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
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
          <div className="card-title" style={{ marginBottom: '10px' }}>الطلبات والفواتير</div>
          {orders.map((o) => {
            const invoice = getInvoiceForOrder(o.id);
            return (
              <div className="order-row" key={o.id}>
                <div className="order-avatar" style={{ fontSize: '11px', fontWeight: 500 }}>
                  <FileText size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{o.id} — {o.materialName}</div>
                  <div className="order-sub">{o.factoryName} • {o.quantity.toLocaleString()} كجم • {o.createdAt}</div>
                  {invoice && (
                    <div className="order-sub" style={{ color: '#b8860b' }}>
                      فاتورة: {invoice.invoiceNumber} — {invoice.totalPrice.toLocaleString()} د.ج
                    </div>
                  )}
                </div>
                <div className="order-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`badge ${statusBadge[o.status]}`}>{statusLabels[o.status]}</span>
                  {invoice?.completed && (
                    <span style={{ fontSize: '18px', color: '#D4AF37', fontWeight: 700 }}>✅</span>
                  )}
                </div>
              </div>
            );
          })}
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

  if (currentTab === 'invoices') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الفواتير</div>
        {invoices.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div className="text-sm">لا توجد فواتير بعد</div>
          </div>
        ) : (
          invoices.map((inv) => (
            <div className="card" key={inv.id}>
              <div className="flex-between" style={{ marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{inv.companyName}</div>
                  <div className="text-sm">فاتورة رقم: {inv.invoiceNumber}</div>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div className="text-sm">{inv.date}</div>
                  {inv.completed && <span style={{ fontSize: '20px', color: '#D4AF37' }}>✅</span>}
                </div>
              </div>
              <hr className="divider" />
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="text-sm">المادة</span>
                <span className="text-sm">{inv.materialName}</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="text-sm">الكمية</span>
                <span className="text-sm">{inv.quantity.toLocaleString()} كجم</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span className="text-sm">سعر الوحدة</span>
                <span className="text-sm">{inv.unitPrice.toLocaleString()} د.ج</span>
              </div>
              <hr className="divider" />
              <div className="flex-between">
                <span style={{ fontSize: '14px', fontWeight: 600 }}>المجموع</span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--green-mid)' }}>
                  {inv.totalPrice.toLocaleString()} د.ج
                </span>
              </div>
            </div>
          ))
        )}
      </>
    );
  }

  return null;
}
