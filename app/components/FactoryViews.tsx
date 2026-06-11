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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const available = getAvailableQty(orderCenter, orderMaterial);
    if (qty > available) {
      setOrderError(`الكمية المتاحة فقط ${available.toLocaleString()} كجم`);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const center = inventory.find((c) => c.centerId === orderCenter);
      const mat = materials.find((m) => m.id === orderMaterial);
      const orderId = generateOrderId();

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
      setIsSubmitting(false);
      setTimeout(() => setOrderSent(false), 3000);
    }, 1000);
  }

  function getInvoiceForOrder(orderId: string) {
    return invoices.find((inv) => inv.orderId === orderId);
  }

  if (currentTab === 'dashboard') {
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const activeOrders = orders.filter((o) => o.status !== 'delivered').length;
    const completedInvoices = invoices.filter((inv) => inv.completed).length;
    const totalOrders = orders.length;

    // Factory summary: Total quantity purchased
    const totalPurchasedQty = orders
      .filter((o) => o.status === 'confirmed' || o.status === 'delivered')
      .reduce((s, o) => s + o.quantity, 0);

    if (viewFactory) {
      const factoryOrders = orders.filter((o) => o.factoryId === viewFactory);
      const companyName = factoryNames[viewFactory] || 'مصنع التدوير';
      return (
        <>
          <div className="flex-between" style={{ marginBottom: '14px' }}>
            <button className="btn-secondary" style={{ minHeight: '40px', borderRadius: '12px', padding: '6px 14px' }} onClick={() => setViewFactory(null)}>← العودة</button>
            <span className="badge badge-green">{companyName}</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-dark)' }}>
            <Factory size={20} style={{ verticalAlign: 'middle', marginLeft: '8px', color: 'var(--primary-green)' }} />
            {companyName}
          </div>
          <div className="kpi-grid" style={{ marginBottom: '16px' }}>
            <div className="kpi-card">
              <div className="kpi-metric">{factoryOrders.length}</div>
              <div className="kpi-label">الطلبات</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-metric">{factoryOrders.filter((o) => o.status === 'confirmed').length}</div>
              <div className="kpi-label">معتمدة</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {factoryOrders.map((o) => {
              const invoice = getInvoiceForOrder(o.id);
              return (
                <div className="card" key={o.id}>
                  <div className="flex-between">
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>طلب رقم: {o.id}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className={`badge ${o.status === 'pending' ? 'badge-orange' : 'badge-green'}`}>
                        {o.status === 'pending' ? 'معلق' : 'معتمد'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{o.materialName} — {o.quantity.toLocaleString()} كجم</div>
                  <div className="text-sm" style={{ opacity: 0.6 }}>{o.createdAt}</div>
                  
                  {invoice && (
                    <div className="invoice-card" style={{ padding: '14px', border: '1.5px solid var(--gold)', gap: '10px' }}>
                      <div className="flex-between" style={{ borderBottom: '1.5px dashed var(--surface)', paddingBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--gold)' }}>فاتورة: {invoice.invoiceNumber}</span>
                        <span className="text-sm">{invoice.date}</span>
                      </div>
                      <div className="flex-between">
                        <span className="text-sm">المجموع: {invoice.totalPrice.toLocaleString()} د.ج</span>
                        <span className="badge badge-gold">✓ مكتمل</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      );
    }

    return (
      <>
        {/* 1. Header is rendered by AppShell */}

        {/* 2. Hero Summary Card (Purchase Summary) */}
        <div className="hero-card">
          <div className="hero-title">إجمالي المشتريات المعتمدة</div>
          <div className="hero-val">{totalPurchasedQty.toLocaleString()} كجم</div>
          <div className="hero-sub">مواد قابلة للتدوير تم شراؤها</div>
        </div>

        {/* 3. KPI Cards - 2-column grid, centered metrics */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-metric">{totalOrders}</div>
            <div className="kpi-label">إجمالي الطلبات</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{activeOrders}</div>
            <div className="kpi-label">طلبات نشطة</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric" style={{ color: 'var(--gold)' }}>{completedInvoices}</div>
            <div className="kpi-label">فواتير مكتملة</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{shipments.filter((s) => s.status === 'in_transit').length}</div>
            <div className="kpi-label">شحنات في الطريق</div>
          </div>
        </div>

        {/* Alert Notifications */}
        {pendingOrders > 0 && (
          <div className="alert info">
            <Bell size={16} />
            <span>يوجد {pendingOrders} طلب شراء قيد المراجعة</span>
          </div>
        )}

        {/* 4. Primary Actions */}
        <div className="btn-row">
          <button className="btn-primary" onClick={() => onSetTab?.('orders')} style={{ width: '100%' }}>
            + إنشاء طلب شراء جديد
          </button>
        </div>

        {/* 5. Main Content - Recycling Companies list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">مصانع التدوير المسجلة</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {factoryList.map((f) => (
              <div className="order-row" key={f.id} style={{ cursor: 'pointer' }} onClick={() => setViewFactory(f.id)}>
                <div className="order-avatar" style={{ background: 'var(--light-green)', color: 'var(--primary-green)' }}>
                  <Factory size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{f.name}</div>
                  <div className="order-sub">{f.orders.length} طلبات شراء</div>
                </div>
                <span style={{ fontSize: '18px', color: 'var(--primary-green)' }}>←</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Recent Activity - Available Materials */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">المواد المتاحة للطلب</span>
            <span className="live-badge"><span className="live-dot"></span>مباشر</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {inventory[0].items.map((item) => {
              const mat = materials.find((m) => m.id === item.materialId);
              return (
                <div className="mat-row" key={item.materialId}>
                  <div className="mat-icon">{mat?.icon ?? '📦'}</div>
                  <div className="mat-info">
                    <div className="mat-name">{mat?.name ?? item.materialId}</div>
                    <div className="mat-qty">{inventory[0].centerName}</div>
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className="mat-val">{item.quantity.toLocaleString()} كجم</div>
                    <button className="btn-primary" style={{ minHeight: '34px', borderRadius: '10px', fontSize: '11px', padding: '4px 10px' }} onClick={() => { setOrderMaterial(item.materialId); setOrderCenter('sc1'); onSetTab?.('orders'); }}>
                      طلب
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'available') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>المخزون المتاح للطلب</div>
        <div className="alert success">
          <Check size={16} />
          <span>البيانات محدثة في الوقت الفعلي</span>
        </div>
        {inventory.map((c) => (
          <div className="card" key={c.centerId}>
            <div className="card-header">
              <span className="card-title">{c.centerName}</span>
              <span className="badge badge-green">{c.location}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {c.items.map((item) => {
                const mat = materials.find((m) => m.id === item.materialId);
                return (
                  <div className="mat-row" key={item.materialId}>
                    <div className="mat-info"><div className="mat-name">{mat?.name ?? item.materialId}</div></div>
                    <div className="mat-val">{item.quantity.toLocaleString()} كجم</div>
                    <span className="badge badge-green">متاح</span>
                  </div>
                );
              })}
            </div>
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
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      delivered: 'تم التسليم',
    };

    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>طلبات الشراء والتعاقد</div>
        {orderSent && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span>تمت العملية بنجاح - تم إرسال طلب الشراء بنجاح</span>
          </div>
        )}
        
        {/* Create Order form */}
        <div className="card">
          <div className="card-title">إنشاء طلب شراء جديد</div>
          <div className="form-row">
            <div className="form-label">الشركة المشتري</div>
            <select className="form-select" value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)}>
              {Object.entries(factoryNames).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">مركز الفرز المصدر</div>
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
            <input className="inp" type="number" placeholder="أدخل الكمية المطلوبة بالكجم" value={orderQty} onChange={(e) => { setOrderQty(e.target.value); setOrderError(''); }} />
          </div>
          <div className="text-sm" style={{ marginBottom: '8px', fontWeight: 600 }}>
            الكمية المتوفرة حالياً: {getAvailableQty(orderCenter, orderMaterial).toLocaleString()} كجم
          </div>
          {orderError && (
            <div className="alert danger" style={{ padding: '10px', fontSize: '13px', marginBottom: '8px' }}>
              {orderError}
            </div>
          )}
          <div className="btn-row" style={{ marginTop: '6px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleCreateOrder} disabled={isSubmitting}>
              {isSubmitting ? 'جارٍ المعالجة...' : 'إرسال طلب الشراء'}
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="card">
          <div className="card-title">سجل الطلبات والفواتير</div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>📄</span>
              <div className="empty-title">لا توجد طلبات شراء حالياً</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {orders.map((o) => {
                const invoice = getInvoiceForOrder(o.id);
                return (
                  <div className="order-row" key={o.id}>
                    <div className="order-avatar"><FileText size={18} /></div>
                    <div className="order-info">
                      <div className="order-title">{o.id} — {o.materialName}</div>
                      <div className="order-sub">{o.factoryName} • {o.quantity.toLocaleString()} كجم • {o.createdAt}</div>
                      {invoice && (
                        <div className="order-sub" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                          فاتورة: {invoice.invoiceNumber} — {invoice.totalPrice.toLocaleString()} د.ج
                        </div>
                      )}
                    </div>
                    <div className="order-right">
                      <span className={`badge ${statusBadge[o.status]}`}>{statusLabels[o.status]}</span>
                      {invoice?.completed && (
                        <span style={{ fontSize: '16px', color: 'var(--gold)', fontWeight: 700, marginTop: '2px' }}>✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  if (currentTab === 'shipments') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>الشحنات الصادرة</div>
        {shipments.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" style={{ fontSize: '32px' }}>🚛</span>
            <div className="empty-title">لا توجد شحنات واردة</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {shipments.map((s) => (
              <div className="card" key={s.id}>
                <div className="flex-between">
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>شحنة رقم: {s.id}</span>
                  <span className={`badge ${s.status === 'in_transit' ? 'badge-blue' : 'badge-orange'}`}>
                    {s.status === 'in_transit' ? 'في الطريق' : 'مجدول'}
                  </span>
                </div>
                <div className="text-sm">
                  <MapPin size={13} style={{ verticalAlign: 'middle', marginLeft: '6px', color: 'var(--primary-green)' }} /> من: {s.fromCenter}
                </div>
                <div className="text-sm">
                  <Package size={13} style={{ verticalAlign: 'middle', marginLeft: '6px', color: 'var(--primary-green)' }} /> {s.materialName} — {s.quantity.toLocaleString()} كجم
                </div>
                <div className="text-sm">
                  <Clock size={13} style={{ verticalAlign: 'middle', marginLeft: '6px', color: 'var(--primary-green)' }} /> وصول متوقع: {s.eta}
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'invoices') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>الفواتير المالية</div>
        {invoices.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" style={{ fontSize: '32px' }}>📄</span>
            <div className="empty-title">لا توجد فواتير حالياً</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {invoices.map((inv) => (
              <div className="invoice-card" key={inv.id}>
                <div className="invoice-header">
                  <span className="invoice-logo">♻ CERCLY</span>
                  <span className="invoice-title">فاتورة بيع مواد</span>
                </div>
                
                <div className="invoice-details-grid">
                  <div className="invoice-detail-item">
                    <span className="invoice-detail-label">رقم الفاتورة</span>
                    <span className="invoice-detail-val">{inv.invoiceNumber}</span>
                  </div>
                  <div className="invoice-detail-item">
                    <span className="invoice-detail-label">التاريخ</span>
                    <span className="invoice-detail-val">{inv.date}</span>
                  </div>
                  <div className="invoice-detail-item" style={{ gridColumn: 'span 2' }}>
                    <span className="invoice-detail-label">المشتري (مصنع التدوير)</span>
                    <span className="invoice-detail-val">{inv.companyName}</span>
                  </div>
                </div>

                <table className="invoice-items-table">
                  <thead>
                    <tr>
                      <th className="invoice-th" style={{ width: '40%' }}>المادة</th>
                      <th className="invoice-th" style={{ textAlign: 'center' }}>الكمية</th>
                      <th className="invoice-th" style={{ textAlign: 'left' }}>سعر الوحدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="invoice-td">{inv.materialName}</td>
                      <td className="invoice-td" style={{ textAlign: 'center' }}>{inv.quantity.toLocaleString()} كجم</td>
                      <td className="invoice-td" style={{ textAlign: 'left' }}>{inv.unitPrice.toLocaleString()} د.ج</td>
                    </tr>
                  </tbody>
                </table>

                <div className="invoice-footer">
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>المبلغ الإجمالي</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-green)' }}>
                    {inv.totalPrice.toLocaleString()} د.ج
                  </span>
                </div>
                
                <div className="flex-between">
                  <span className="text-sm">حالة الفاتورة</span>
                  <span className="badge badge-gold">✓ مكتملة ومعتمدة</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return null;
}
