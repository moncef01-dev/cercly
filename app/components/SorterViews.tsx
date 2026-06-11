'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import { generateNotifId } from '../lib/data';
import Chart from './Chart';
import {
  AlertTriangle,
  Package,
  Plus,
  Check,
  X,
  Factory,
  CheckCircle,
  Trash2,
  Settings,
  Truck,
  BarChart3,
  Archive,
} from 'lucide-react';

interface SorterViewsProps {
  currentTab: Tab;
  onSetTab: (tab: Tab) => void;
}

const materialTypeOptions: MaterialType[] = ['plastic', 'carton', 'battery', 'printer_cartridge', 'ink_cartridge'];

const factoryNames: Record<string, string> = {
  f1: 'شركة نوميديا للبلاستيك المعاد',
  f2: 'شركة قسنطينة للكرتون الصناعي',
  f3: 'شركة البطاريات الخضراء',
  f4: 'مخبر خرطوشة بلس',
  f5: 'مركز إنك ريسايكل',
  f6: 'مصنع الأثر الدائم',
};

export default function SorterViews({ currentTab, onSetTab }: SorterViewsProps) {
  const collections = useStore((s) => s.collections);
  const myInventory = useStore((s) => s.inventory[0]);
  const orders = useStore((s) => s.orders);
  const updateInventory = useStore((s) => s.updateInventory);
  const addNotification = useStore((s) => s.addNotification);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const materials = useStore((s) => s.materials);
  const users = useStore((s) => s.users);
  const addInventoryItem = useStore((s) => s.addInventoryItem);
  const removeInventoryItem = useStore((s) => s.removeInventoryItem);
  const updateInventoryCapacity = useStore((s) => s.updateInventoryCapacity);

  const collectors = users.filter((u) => u.role === 'collector' && u.status === 'active');

  const factoryList = useMemo(() =>
    ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'].map((id) => ({
      id,
      name: factoryNames[id],
      orders: orders.filter((o) => o.factoryId === id),
    })),
    [orders],
  );

  const [formCollector, setFormCollector] = useState(collectors[0]?.name || '');
  const [formMaterial, setFormMaterial] = useState<MaterialType>('plastic');
  const [formWeight, setFormWeight] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [capacityDraft, setCapacityDraft] = useState<Record<string, string>>({});
  const [quantityDraft, setQuantityDraft] = useState<Record<string, string>>({});
  const [newMatId, setNewMatId] = useState<MaterialType>('plastic');
  const [newMatCapacity, setNewMatCapacity] = useState('1000');
  const [showAddMat, setShowAddMat] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});

  function handleSubmitReception() {
    const weight = parseInt(formWeight, 10);
    if (!weight || weight <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const mat = materials.find((m) => m.id === formMaterial);
      const matName = mat?.name ?? formMaterial;

      updateInventory({ centerId: myInventory.centerId, materialId: formMaterial, quantity: weight });
      addNotification({
        id: generateNotifId(),
        icon: '📦',
        title: 'شحنة واردة',
        text: `تم استلام ${weight} ${mat?.unit ?? 'كجم'} من ${matName} بمركز فرز قسنطينة من ${formCollector}`,
        time: 'الآن',
        isNew: true,
        type: 'info',
        role: 'sorter',
      });

      setFormWeight('');
      setFormNotes('');
      setIsSubmitting(false);
    }, 1000);
  }

  function handleApproveOrder(orderId: string, factoryName: string, materialName: string) {
    setIsApproving((prev) => ({ ...prev, [orderId]: true }));

    setTimeout(() => {
      updateOrderStatus({ orderId, status: 'confirmed' });
      addNotification({
        id: generateNotifId(),
        icon: '✅',
        title: 'تم الاعتماد',
        text: `تم اعتماد طلب شراء ${materialName} لصالح ${factoryName}`,
        time: 'الآن',
        isNew: true,
        type: 'success',
        role: 'sorter',
      });
      setIsApproving((prev) => ({ ...prev, [orderId]: false }));
    }, 1000);
  }

  function handleAddInventoryItem() {
    if (myInventory.items.some((i) => i.materialId === newMatId)) return;
    addInventoryItem({
      centerId: myInventory.centerId,
      item: {
        materialId: newMatId,
        quantity: 0,
        capacity: parseInt(newMatCapacity, 10) || 1000,
        lastReceived: 0,
        lastReceivedLabel: '',
      },
    });
    setShowAddMat(false);
    setNewMatCapacity('1000');
  }

  function handleRemoveItem(materialId: MaterialType) {
    removeInventoryItem({ centerId: myInventory.centerId, materialId });
  }

  function handleSaveCapacity(materialId: MaterialType) {
    const cap = parseInt(capacityDraft[materialId] || '', 10);
    if (!cap || cap <= 0) return;
    updateInventoryCapacity({ centerId: myInventory.centerId, materialId, capacity: cap });
    setCapacityDraft((prev) => ({ ...prev, [materialId]: '' }));
  }

  function handleUpdateQuantity(materialId: MaterialType) {
    const qty = parseInt(quantityDraft[materialId] || '', 10);
    if (!qty || qty <= 0) return;
    updateInventory({ centerId: myInventory.centerId, materialId, quantity: qty });
    setQuantityDraft((prev) => ({ ...prev, [materialId]: '' }));
  }

  if (currentTab === 'dashboard') {
    const totalReceived = collections
      .filter((c) => c.date === 'اليوم')
      .reduce((sum, c) => sum + c.weight, 0);
    const totalSorted = Math.round(totalReceived * 0.86);
    const incomingDeliveries = collections.filter((c) => c.date === 'اليوم').length;

    // Sorter Hero Card displays Inventory Capacity Summary
    const totalCurrentQty = myInventory.items.reduce((s, i) => s + i.quantity, 0);
    const totalCapacity = myInventory.items.reduce((s, i) => s + i.capacity, 0);
    const capacityPct = Math.min(Math.round((totalCurrentQty / totalCapacity) * 100), 100);

    return (
      <>
        {/* 1. Header is rendered by AppShell */}

        {/* 2. Hero Summary Card (Inventory Summary) */}
        <div className="hero-card">
          <div className="hero-title">السعة الإجمالية المستخدمة</div>
          <div className="hero-val">{capacityPct}% ممتلئ</div>
          <div className="hero-sub">{totalCurrentQty.toLocaleString()} كجم / {totalCapacity.toLocaleString()} كجم</div>
        </div>

        {/* Capacity Progress Bar Card */}
        <div className="card">
          <div className="flex-between">
            <span className="text-sm">سعة مركز فرز قسنطينة</span>
            <span className="text-sm" style={{ fontWeight: 600 }}>{capacityPct}%</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${capacityPct}%` }} />
          </div>
        </div>

        {/* 3. KPI Cards - 2-column grid, centered metrics, quantities in KG */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-metric">{incomingDeliveries}</div>
            <div className="kpi-label">الواردات اليوم</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{totalReceived.toLocaleString()}</div>
            <div className="kpi-label">كجم مستلم اليوم</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{totalSorted.toLocaleString()}</div>
            <div className="kpi-label">كجم مفروز اليوم</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{orders.filter((o) => o.status === 'confirmed').length}</div>
            <div className="kpi-label">طلبات معتمدة</div>
          </div>
        </div>

        {/* Warning alerts */}
        {orders.filter((o) => o.status === 'pending').length > 0 && (
          <div className="alert warning">
            <AlertTriangle size={16} />
            <span>توجد طلبات شراء بانتظار الاعتماد</span>
          </div>
        )}

        {/* 4. Primary Actions */}
        <div className="btn-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-button)' }}>
          <button className="btn-primary" onClick={() => onSetTab('quantities')} style={{ width: '100%' }}>
            <Plus size={16} /> تسجيل استلام
          </button>
          <button className="btn-secondary" onClick={() => onSetTab('inventory')} style={{ width: '100%' }}>
            <Archive size={16} /> إدارة المخزون
          </button>
        </div>

        {/* 5. Main Content - Inventory list */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">المخزون المتوفر حالياً</span>
            <span className="live-badge"><span className="live-dot"></span>مباشر</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {myInventory.items.map((item) => {
              const mat = materials.find((m) => m.id === item.materialId);
              const pct = Math.min(Math.round((item.quantity / item.capacity) * 100), 100);
              return (
                <div className="mat-row" key={item.materialId}>
                  <div className="mat-icon">{mat?.icon ?? '📦'}</div>
                  <div className="mat-info">
                    <div className="mat-name">{mat?.name ?? item.materialId}</div>
                    <div className="mat-qty">{item.lastReceivedLabel || `آخر استلام: ${item.lastReceived} كجم`}</div>
                  </div>
                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className="mat-val">{item.quantity.toLocaleString()} كجم</div>
                    <div className="prog-bar" style={{ width: '70px', height: '6px' }}>
                      <div className="prog-fill" style={{ width: `${pct}%`, background: mat?.color || 'var(--primary-green)' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Recent Activity - Incoming Purchase Orders */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">طلبات الشراء الواردة من المصانع</span>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>📄</span>
              <div className="empty-title">لا توجد عمليات شراء حالياً</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {orders.map((o) => (
                <div className="order-row" key={o.id}>
                  <div className="order-avatar"><Factory size={18} /></div>
                  <div className="order-info">
                    <div className="order-title">{o.factoryName}</div>
                    <div className="order-sub">{o.materialName} — {o.quantity.toLocaleString()} كجم</div>
                  </div>
                  <div className="order-right">
                    {o.status === 'pending' ? (
                      <button className="btn-primary" style={{ minHeight: '38px', borderRadius: '12px', fontSize: '11px', padding: '6px 12px' }} onClick={() => handleApproveOrder(o.id, o.factoryName, o.materialName)} disabled={!!isApproving[o.id]}>
                        {isApproving[o.id] ? 'جاري الاعتماد...' : 'اعتماد'}
                      </button>
                    ) : (
                      <span className="badge badge-green">✓ معتمد</span>
                    )}
                    <div className="order-date" style={{ marginTop: '2px' }}>{o.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  if (currentTab === 'quantities') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>تسجيل استلام شحنة</div>
        <div className="card">
          <div className="form-row">
            <div className="form-label">الجامع</div>
            <select className="form-select" value={formCollector} onChange={(e) => setFormCollector(e.target.value)}>
              {collectors.length === 0 && <option>لا يوجد جامعون</option>}
              {collectors.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">نوع المادة</div>
            <select className="form-select" value={formMaterial} onChange={(e) => setFormMaterial(e.target.value as MaterialType)}>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">الوزن المستلم (كجم)</div>
            <input
              className="inp"
              type="number"
              placeholder="أدخل الوزن بالكجم"
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-label">ملاحظات الشحنة</div>
            <input
              className="inp"
              placeholder="ملاحظات إضافية..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
          <div className="btn-row" style={{ marginTop: '6px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmitReception} disabled={isSubmitting}>
              {isSubmitting ? 'جارٍ المعالجة...' : 'تأكيد الاستلام'}
            </button>
            <button className="btn-secondary" onClick={() => { setFormWeight(''); setFormNotes(''); }} disabled={isSubmitting}>
              إلغاء
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-title">آخر التوريدات المستلمة</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {collections.slice(0, 5).map((c) => (
              <div className="order-row" key={c.id}>
                <div className="order-avatar" style={{ fontSize: '13px', background: 'var(--light-green)', color: 'var(--primary-green)', fontWeight: 700 }}>
                  {c.collectorId.slice(-2)}
                </div>
                <div className="order-info">
                  <div className="order-title">{c.pointName}</div>
                  <div className="order-sub">{materials.find((m) => m.id === c.materials[0])?.name ?? ''} • {c.weight} كجم</div>
                </div>
                <div className="order-right">
                  <span className="badge badge-green">تم الاستلام</span>
                  <div className="order-date">{c.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'inventory') {
    return (
      <>
        <div className="flex-between" style={{ marginBottom: '4px' }}>
          <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-dark)' }}>إدارة المخزون والسعة</div>
          <button className="btn-primary" style={{ minHeight: '40px', padding: '6px 14px', borderRadius: '12px' }} onClick={() => {
            const firstAvailable = materialTypeOptions.find((id) => !myInventory.items.some((i) => i.materialId === id));
            if (firstAvailable) setNewMatId(firstAvailable);
            setShowAddMat(true);
          }}>
            <Plus size={14} /> إضافة مادة
          </button>
        </div>

        {myInventory.items.map((item) => {
          const mat = materials.find((m) => m.id === item.materialId);
          const pct = Math.min(Math.round((item.quantity / item.capacity) * 100), 100);

          return (
            <div className="card" key={item.materialId}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="card-title">{mat?.name ?? item.materialId}</span>
                  <button
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px', minHeight: 'auto', display: 'flex', alignItems: 'center' }}
                    onClick={() => handleRemoveItem(item.materialId)}
                    title="حذف المادة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className="live-badge"><span className="live-dot"></span>مباشر</span>
              </div>

              <div className="flex-between">
                <span style={{ fontSize: '22px', fontWeight: 700, color: mat?.color || 'var(--primary-green)' }}>
                  {item.quantity.toLocaleString()} كجم
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    className="inp"
                    type="number"
                    style={{ width: '90px', height: '40px', fontSize: '12px', padding: '6px 10px' }}
                    value={quantityDraft[item.materialId] ?? ''}
                    onChange={(e) => setQuantityDraft((p) => ({ ...p, [item.materialId]: e.target.value }))}
                    placeholder="إضافة"
                  />
                  <button className="btn-primary" style={{ minHeight: '40px', padding: '6px 12px', borderRadius: '12px', fontSize: '11px' }} onClick={() => handleUpdateQuantity(item.materialId)}>
                    حفظ
                  </button>
                </div>
              </div>
              <div className="prog-bar" style={{ margin: '4px 0' }}>
                <div className="prog-fill" style={{ width: `${pct}%`, background: mat?.color || 'var(--primary-green)' }} />
              </div>
              <div className="flex-between">
                <span className="text-sm">{pct}% ممتلئ (الحد الأقصى: {item.capacity} كجم)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    className="inp"
                    type="number"
                    style={{ width: '90px', height: '40px', fontSize: '12px', padding: '6px 10px' }}
                    value={capacityDraft[item.materialId] ?? ''}
                    onChange={(e) => setCapacityDraft((p) => ({ ...p, [item.materialId]: e.target.value }))}
                    placeholder="سعة"
                  />
                  <button className="btn-secondary" style={{ minHeight: '40px', padding: '6px 12px', borderRadius: '12px', fontSize: '11px' }} onClick={() => handleSaveCapacity(item.materialId)}>
                    تعديل
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {showAddMat && (
          <div className="card">
            <div className="card-title">إضافة مادة جديدة للمستودع</div>
            <div className="form-row">
              <div className="form-label">المادة</div>
              <select className="form-select" value={newMatId} onChange={(e) => setNewMatId(e.target.value as MaterialType)}>
                {materialTypeOptions
                  .filter((id) => !myInventory.items.some((i) => i.materialId === id))
                  .map((id) => {
                    const mat = materials.find((m) => m.id === id);
                    return <option key={id} value={id}>{mat?.name ?? id}</option>;
                  })}
              </select>
            </div>
            <div className="form-row">
              <div className="form-label">السعة القصوى (كجم)</div>
              <input className="inp" type="number" value={newMatCapacity}
                onChange={(e) => setNewMatCapacity(e.target.value)} />
            </div>
            <div className="btn-row">
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleAddInventoryItem}>
                إضافة للمخزن
              </button>
              <button className="btn-secondary" onClick={() => setShowAddMat(false)}>
                إلغاء
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'reports') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>تقارير الكميات المفروزة</div>
        <Chart />

        {/* Registered Factories List for Sorter */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">مصانع التدوير المسجلة</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {factoryList.map((f) => (
              <div className="order-row" key={f.id}>
                <div className="order-avatar" style={{ background: 'var(--light-green)', color: 'var(--primary-green)' }}>
                  <Factory size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{f.name}</div>
                  <div className="order-sub">{f.orders.length} طلبات شراء</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  return null;
}
