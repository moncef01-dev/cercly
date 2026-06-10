'use client';

import { useState, useRef } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
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
} from 'lucide-react';

interface SorterViewsProps {
  currentTab: Tab;
  onSetTab: (tab: Tab) => void;
}

const materialTypeOptions: MaterialType[] = ['plastic', 'paper', 'metal', 'glass', 'mixed'];

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
  const notifCounter = useRef(0);

  const [formTeam, setFormTeam] = useState(collectors[0]?.name || '');
  const [formMaterial, setFormMaterial] = useState<MaterialType>('plastic');
  const [formWeight, setFormWeight] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const [editCapacity, setEditCapacity] = useState<Record<string, string>>({});
  const [newMatId, setNewMatId] = useState<MaterialType>('plastic');
  const [newMatCapacity, setNewMatCapacity] = useState('1000');
  const [showAddMat, setShowAddMat] = useState(false);

  function handleSubmitReception() {
    const weight = parseInt(formWeight);
    if (!weight || weight <= 0) return;

    const mat = materials.find((m) => m.id === formMaterial);
    const matName = mat?.name ?? formMaterial;

    updateInventory({ centerId: myInventory.centerId, materialId: formMaterial, quantity: weight });

    notifCounter.current += 1;
    addNotification({
      id: `notif-${notifCounter.current}`,
      text: `تم استلام ${weight} كجم من ${matName} من ${formTeam}`,
      time: 'الآن',
      isNew: true,
      type: 'info',
    });

    setFormWeight('');
    setFormNotes('');
  }

  function handleApproveOrder(orderId: string) {
    updateOrderStatus({ orderId, status: 'confirmed' });
  }

  function handleAddInventoryItem() {
    if (myInventory.items.some((i) => i.materialId === newMatId)) return;
    addInventoryItem({
      centerId: myInventory.centerId,
      item: {
        materialId: newMatId,
        quantity: 0,
        capacity: parseInt(newMatCapacity) || 1000,
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
    const cap = parseInt(editCapacity[materialId] || '');
    if (!cap || cap <= 0) return;
    updateInventoryCapacity({ centerId: myInventory.centerId, materialId, capacity: cap });
    setEditCapacity((p) => ({ ...p, [materialId]: '' }));
  }

  function handleUpdateQuantity(materialId: MaterialType) {
    const qty = parseInt(editCapacity[materialId] || '');
    if (!qty || qty <= 0) return;
    updateInventory({ centerId: myInventory.centerId, materialId, quantity: qty });
    setEditCapacity((p) => ({ ...p, [materialId]: '' }));
  }

  if (currentTab === 'dashboard') {
    const totalReceived = collections
      .filter((c) => c.date === 'اليوم')
      .reduce((sum, c) => sum + c.weight, 0);

    return (
      <>
        <div className="flex-between" style={{ marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text)' }}>{myInventory.centerName}</div>
            <div className="live-badge"><span className="live-dot"></span>مباشر — تحديث فوري</div>
          </div>
          <div className="tag">{myInventory.location}</div>
        </div>
        {orders.filter((o) => o.status === 'pending').length > 0 && (
          <div className="alert warning">
            <AlertTriangle size={16} /> طلب شراء جديد من {orders.find((o) => o.status === 'pending')?.factoryName} — بانتظار موافقتك
          </div>
        )}
        <div className="stats">
          <div className="stat-card">
            <div className="stat-val">{totalReceived / 1000} طن</div>
            <div className="stat-label">مستلم اليوم</div>
            <div className="stat-change">↑ 12% من أمس</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{Math.round(totalReceived * 0.75 / 1000)} طن</div>
            <div className="stat-label">مفروز</div>
            <div className="stat-change">↑ 8%</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{Math.round(totalReceived * 0.25 / 1000)} طن</div>
            <div className="stat-label">قيد الفرز</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">94%</div>
            <div className="stat-label">كفاءة الفرز</div>
            <div className="stat-change">↑ 2%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">المخزون حسب المادة</span>
            <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot"></span>مباشر</span>
          </div>
          {myInventory.items.map((item) => {
            const mat = materials.find((m) => m.id === item.materialId);
            const pct = Math.round((item.quantity / item.capacity) * 100);
            return (
              <div className="mat-row" key={item.materialId}>
                <div className="mat-icon" style={{ background: '#fff3e0' }}>{mat?.icon ?? '📦'}</div>
                <div className="mat-info">
                  <div className="mat-name">{mat?.name ?? item.materialId}</div>
                  <div className="mat-qty">{item.lastReceived > 0 ? `آخر استلام: ${item.lastReceived} كجم` : ''}</div>
                </div>
                <div>
                  <div className="mat-val">{item.quantity.toLocaleString()} كجم</div>
                  <div className="prog-bar" style={{ width: '80px', marginTop: '4px' }}>
                    <div className="prog-fill" style={{ width: `${pct}%`, background: mat?.color }} />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="btn-row">
            <button className="btn-sm primary" onClick={() => onSetTab('inventory')}>
              <Package size={16} /> إدارة المخزون
            </button>
            <button className="btn-sm" onClick={() => onSetTab('quantities')}>
              <Plus size={16} /> تسجيل استلام
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">طلبات الشراء الواردة</span></div>
          {orders.map((o) => (
            <div className="order-row" key={o.id}>
              <div className="order-avatar"><Factory size={18} /></div>
              <div className="order-info">
                <div className="order-title">{o.factoryName}</div>
                <div className="order-sub">{o.materialName} — {o.quantity.toLocaleString()} كجم</div>
              </div>
              <div className="order-right">
                {o.status === 'pending' ? (
                  <button className="btn-sm primary" style={{ fontSize: '11px' }} onClick={() => handleApproveOrder(o.id)}>
                    <CheckCircle size={14} /> موافقة
                  </button>
                ) : (
                  <span className="badge badge-green">موافق</span>
                )}
                <div className="order-date">{o.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (currentTab === 'quantities') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>تسجيل استلام جديد</div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '14px' }}>بيانات الاستلام</div>
          <div className="form-row">
            <div className="form-label">فريق الجمع</div>
            <select className="form-select" value={formTeam} onChange={(e) => setFormTeam(e.target.value)}>
              {collectors.length === 0 && <option>لا توجد فرق جمع</option>}
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
            <div className="form-label">الكمية (كجم)</div>
            <input
              className="inp" type="number" placeholder="أدخل الوزن بالكيلوغرام"
              style={{ margin: 0 }} value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-label">ملاحظات</div>
            <input
              className="inp" placeholder="ملاحظات إضافية..."
              style={{ margin: 0 }} value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
          <div className="btn-row">
            <button className="btn-sm primary" style={{ flex: 1 }} onClick={handleSubmitReception}>
              <Check size={16} /> تأكيد الاستلام
            </button>
            <button className="btn-sm" onClick={() => { setFormWeight(''); setFormNotes(''); }}>
              <X size={16} /> إلغاء
            </button>
          </div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '12px' }}>آخر الاستلامات</div>
          {collections.slice(0, 5).map((c) => (
            <div className="order-row" key={c.id}>
              <div className="order-avatar" style={{ fontSize: '13px', background: 'var(--green-50)', color: 'var(--green-mid)' }}>
                {c.collectorId.slice(-2)}
              </div>
              <div className="order-info">
                <div className="order-title">{c.pointName}</div>
                <div className="order-sub">{materials.find((m) => m.id === c.materials[0])?.name ?? ''} • {c.weight} كجم</div>
              </div>
              <div className="order-right">
                <span className="badge badge-green">مقبول</span>
                <div className="order-date">{c.time}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (currentTab === 'inventory') {
    return (
      <>
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>إدارة المخزون</div>
          <button className="btn-sm primary" onClick={() => {
            const firstAvailable = materialTypeOptions.find((id) => !myInventory.items.some((i) => i.materialId === id));
            if (firstAvailable) setNewMatId(firstAvailable);
            setShowAddMat(true);
          }}>
            <Plus size={14} /> إضافة مادة
          </button>
        </div>
        <div className="alert success"><Check size={16} /> المخزون محدّث — آخر مزامنة منذ 3 دقائق</div>

        {myInventory.items.map((item) => {
          const mat = materials.find((m) => m.id === item.materialId);
          const pct = Math.round((item.quantity / item.capacity) * 100);
          const isEditing = editCapacity[item.materialId] !== undefined;
          const editVal = editCapacity[item.materialId] ?? '';

          return (
            <div className="card" key={item.materialId}>
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="card-title">{mat?.name ?? item.materialId}</span>
                  <button
                    className="btn-sm"
                    style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '2px' }}
                    onClick={() => handleRemoveItem(item.materialId)}
                    title="حذف المادة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <span className="live-badge" style={{ fontSize: '10px' }}><span className="live-dot"></span>مباشر</span>
              </div>
              <div className="flex-between" style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: 500, color: mat?.color }}>
                  {item.quantity.toLocaleString()} كجم
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isEditing ? (
                    <>
                      <input
                        className="inp"
                        type="number"
                        style={{ width: '80px', margin: 0, fontSize: '12px', padding: '4px 6px' }}
                        value={editVal}
                        onChange={(e) => setEditCapacity((p) => ({ ...p, [item.materialId]: e.target.value }))}
                        placeholder="كمية"
                      />
                      <button className="btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => setEditCapacity((p) => ({ ...p, [item.materialId]: '' }))}>
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <button className="btn-sm" style={{ fontSize: '10px', padding: '3px 6px' }} onClick={() => setEditCapacity((p) => ({ ...p, [item.materialId]: '' }))}>
                      إضافة كمية
                    </button>
                  )}
                </div>
                {isEditing && (
                  <button className="btn-sm primary" style={{ fontSize: '10px', padding: '3px 8px' }} onClick={() => handleUpdateQuantity(item.materialId)}>
                    <Check size={12} /> حفظ
                  </button>
                )}
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${pct}%`, background: mat?.color }} />
              </div>
              <div className="flex-between" style={{ marginTop: '8px' }}>
                <span className="text-sm">{pct}% ممتلئ</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="text-sm">الطاقة: {item.capacity.toLocaleString()} كجم</span>
                  <Settings size={12} style={{ color: 'var(--text-3)', cursor: 'pointer' }}
                    onClick={() => {
                      const newCap = prompt('السعة الجديدة (كجم):', String(item.capacity));
                      if (newCap) handleSaveCapacity(item.materialId);
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        {showAddMat && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: '10px' }}>إضافة مادة جديدة للمخزون</div>
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
              <input className="inp" type="number" style={{ margin: 0 }} value={newMatCapacity}
                onChange={(e) => setNewMatCapacity(e.target.value)} />
            </div>
            <div className="btn-row">
              <button className="btn-sm primary" onClick={handleAddInventoryItem}>
                <Check size={14} /> إضافة
              </button>
              <button className="btn-sm" onClick={() => setShowAddMat(false)}>
                <X size={14} /> إلغاء
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'reports') {
    return <Chart />;
  }

  return null;
}
