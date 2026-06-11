'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { useStore } from '../lib/store';
import type { Tab, Role } from '../lib/types';
import Chart from './Chart';
import { AlertTriangle, AlertCircle, CircleDot, Check, X, Truck, Map, Users, BarChart3, Factory, Gift, Wind, Droplets, TreePine } from 'lucide-react';

const PartnerMapView = lazy(() => import('./PartnerMapView'));

interface AdminViewsProps {
  currentTab: Tab;
}

const roleFilterLabels: Record<string, Role | null> = {
  all: null,
  partners: 'partner',
  collectors: 'collector',
  centers: 'sorter',
};

const centerForMap = { name: 'مركز فرز قسنطينة', address: 'قسنطينة وسط', lat: 36.3650, lng: 6.6147 };

export default function AdminViews({ currentTab }: AdminViewsProps) {
  const users = useStore((s) => s.users);
  const orders = useStore((s) => s.orders);
  const inventory = useStore((s) => s.inventory);
  const shipments = useStore((s) => s.shipments);
  const collections = useStore((s) => s.collections);
  const config = useStore((s) => s.config);
  const updateUserStatus = useStore((s) => s.updateUserStatus);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const recyclingCompanies = useStore((s) => s.recyclingCompanies);
  const trucks = useStore((s) => s.trucks);
  const rewards = useStore((s) => s.rewards);

  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  const filteredUsers = useMemo(() => {
    const roleFilter = roleFilterLabels[userFilter] as Role | null;
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (userSearch && !u.name.includes(userSearch)) return false;
      return true;
    });
  }, [users, userSearch, userFilter]);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const totalRecycled = collections.reduce((sum, c) => sum + c.weight, 0) / 1000;
  const co2Saved = Math.round(totalRecycled * 158);
  const waterSaved = Math.round(totalRecycled * 228);
  const treesProtected = Math.round(totalRecycled * 1.5);

  function toggleUserStatus(userId: string, current: 'active' | 'inactive') {
    updateUserStatus({ userId, status: current === 'active' ? 'inactive' : 'active' });
  }

  if (currentTab === 'dashboard') {
    const partnerCount = users.filter((u) => u.role === 'partner').length;
    const collectorCount = users.filter((u) => u.role === 'collector').length;
    const sorterCount = users.filter((u) => u.role === 'sorter').length;
    const factoryCount = users.filter((u) => u.role === 'factory').length;

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
          الإدارة — CERCLY
        </div>
        <div className="hero-card">
          <div className="hero-title">الأثر البيئي الإجمالي</div>
          <div className="hero-val">{totalRecycled.toFixed(1)} طن</div>
          <div className="hero-sub">
            <span style={{ marginLeft: '12px' }}>🌳 {treesProtected} شجرة</span>
            <span style={{ marginLeft: '12px' }}>💧 {waterSaved} ل</span>
            <span>🌍 {co2Saved} كجم CO₂</span>
          </div>
        </div>
        <div className="stats">
          <div className="stat-card">          <div className="stat-val">{partnerCount}</div><div className="stat-label">فرد / مؤسسة مسجل</div><div className="stat-change">↑ {partnerCount > 0 ? Math.round(partnerCount * 2.5) : 0}%</div></div>
          <div className="stat-card"><div className="stat-val">{totalRecycled.toFixed(1)} طن</div><div className="stat-label">إجمالي التدوير</div></div>
          <div className="stat-card"><div className="stat-val">{inventory.length}</div><div className="stat-label">مركز فرز</div></div>
          <div className="stat-card">          <div className="stat-val">{factoryCount}</div><div className="stat-label">مصانع تدوير</div></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>حالة العمليات اليوم</div>
          {[
            { r: 'الجامعون', n: collectorCount, s: 'نشط' },
            { r: 'مركز الفرز', n: sorterCount, s: 'نشط' },
            { r: 'طلبات شراء', n: pendingOrdersCount, s: pendingOrdersCount > 0 ? 'معلق' : 'نشط' },
            { r: 'شحنات اليوم', n: shipments.length, s: shipments.length > 0 ? 'جارٍ' : 'نشط' },
          ].map((o, i) => (
            <div className="order-row" key={i}>
              <div className="order-avatar"><CircleDot size={18} /></div>
              <div className="order-info"><div className="order-title">{o.r}</div></div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)', marginRight: '8px' }}>{o.n}</div>
              <span className={`badge ${o.s === 'نشط' ? 'badge-green' : o.s === 'معلق' ? 'badge-orange' : 'badge-blue'}`}>{o.s}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>الأثر البيئي للمنصة</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div className="stat-card" style={{ textAlign: 'center', padding: '12px' }}>
              <Wind size={22} style={{ color: 'var(--green-mid)', marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)' }}>{co2Saved} كجم</div>
              <div className="text-sm">CO₂ مخفض</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '12px' }}>
              <Droplets size={22} style={{ color: 'var(--green-mid)', marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)' }}>{waterSaved.toLocaleString()} ل</div>
              <div className="text-sm">مياه موفرة</div>
            </div>
            <div className="stat-card" style={{ textAlign: 'center', padding: '12px' }}>
              <TreePine size={22} style={{ color: 'var(--green-mid)', marginBottom: '4px' }} />
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)' }}>{treesProtected}</div>
              <div className="text-sm">أشجار محمية</div>
            </div>
          </div>
        </div>
        <Chart />
      </>
    );
  }

  if (currentTab === 'users') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
          <Users size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
          إدارة المستخدمين
        </div>
        <div className="card" style={{ padding: '10px' }}>
          <input className="inp" placeholder="بحث عن مستخدم..." style={{ marginBottom: 0 }} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
        <div className="tabs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'partners', label: 'فرد / مؤسسة' },
            { id: 'collectors', label: 'الجامعون' },
            { id: 'centers', label: 'المراكز' },
          ].map((t) => (
            <button key={t.id} className={`tab${userFilter === t.id ? ' active' : ''}`} onClick={() => setUserFilter(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {filteredUsers.map((u) => (
          <div className="card" style={{ marginBottom: '8px' }} key={u.id}>
            <div className="flex-between">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 500 }}>
                  {u.name.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{u.name}</div>
                  <div className="text-sm">{config.roleNames[u.role]}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                  {u.status === 'active' ? 'نشط' : 'معلق'}
                </span>
                <button className="btn-sm" onClick={() => toggleUserStatus(u.id, u.status)}>
                  {u.status === 'active' ? <X size={14} /> : <Check size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div className="text-sm">لا توجد نتائج للبحث</div>
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'operations') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
          <BarChart3 size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
          مراقبة العمليات
        </div>
        {pendingOrdersCount > 0 && (
          <div className="alert warning"><AlertTriangle size={16} /> {pendingOrdersCount} طلبات شراء بانتظار الموافقة</div>
        )}
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>طلبات شراء معلقة</div>
          {orders.filter((o) => o.status === 'pending').map((o) => (
            <div className="order-row" key={o.id}>
              <div className="order-avatar"><AlertCircle size={18} style={{ color: 'var(--orange)' }} /></div>
              <div className="order-info">
                <div className="order-title">{o.id} — {o.materialName}</div>
                <div className="order-sub">{o.factoryName} ← {o.centerName} • {o.quantity.toLocaleString()} كجم</div>
              </div>
              <button className="btn-sm primary" style={{ fontSize: '11px' }} onClick={() => updateOrderStatus({ orderId: o.id, status: 'confirmed' })}>
                موافقة مطلوبة
              </button>
            </div>
          ))}
          {pendingOrdersCount === 0 && (
            <div className="text-sm" style={{ textAlign: 'center', padding: '12px' }}>لا توجد طلبات معلقة</div>
          )}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>المكافآت المتاحة ({rewards.length})</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {rewards.map((r) => (
              <div className="stat-card" style={{ textAlign: 'center', padding: '10px' }} key={r.id}>
                <Gift size={18} style={{ color: 'var(--orange)', marginBottom: '4px' }} />
                <div style={{ fontSize: '12px', fontWeight: 500 }}>{r.name}</div>
                <div className="text-sm">{r.pointsCost} نقطة</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'reports') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>
          <Map size={18} style={{ verticalAlign: 'middle', marginLeft: '8px' }} />
          خريطة المواقع وتتبع الشاحنات
        </div>
        <div className="card" style={{ padding: '8px' }}>
          <Suspense fallback={
            <div style={{ height: '320px', borderRadius: 'var(--radius)', background: 'linear-gradient(160deg,#dcecd4,#eef6e8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              جاري تحميل خريطة المواقع...
            </div>
          }>
            <PartnerMapView companies={recyclingCompanies} trucks={trucks} center={centerForMap} />
          </Suspense>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><Truck size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />تتبع الشاحنات</span>
          </div>
          {trucks.map((truck, i) => {
            const locations = ['علي منجلي', 'الخروب', 'قسنطينة وسط'];
            return (
              <div className="order-row" key={truck.id}>
                <div className="order-avatar" style={{ background: '#fff3e0', color: 'var(--orange)' }}>
                  🚛
                </div>
                <div className="order-info">
                  <div className="order-title">{truck.name}</div>
                  <div className="order-sub">الموقع: {locations[i] || 'غير معروف'}</div>
                </div>
                <span className={`badge ${truck.status === 'loading' ? 'badge-orange' : truck.status === 'en_route' ? 'badge-blue' : 'badge-green'}`}>
                  {truck.status === 'loading' ? 'تحميل' : truck.status === 'en_route' ? 'في الطريق' : 'تم التسليم'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><Factory size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />مواقع الشركات</span>
          </div>
          {recyclingCompanies.map((c) => (
            <div className="order-row" key={c.id}>
              <div className="order-avatar" style={{ color: 'var(--orange)' }}>
                <Factory size={18} />
              </div>
              <div className="order-info">
                <div className="order-title">{c.name}</div>
                <div className="order-sub">{c.address} • {c.specialty}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><Map size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />موقع مركز الفرز</span>
          </div>
          <div className="order-row">
            <div className="order-avatar">♻</div>
            <div className="order-info">
              <div className="order-title">مركز فرز قسنطينة</div>
              <div className="order-sub">قسنطينة وسط</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
