'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { useStore } from '../lib/store';
import type { Tab, Role } from '../lib/types';
import Chart from './Chart';
import { AlertTriangle, AlertCircle, CircleDot, Check, X, Truck, Map, Users, BarChart3, Factory, Gift, Wind, Droplets, TreePine, Inbox } from 'lucide-react';

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

  const [isUpdatingUser, setIsUpdatingUser] = useState<Record<string, boolean>>({});
  const [isApproving, setIsApproving] = useState<Record<string, boolean>>({});

  const filteredUsers = useMemo(() => {
    const roleFilter = roleFilterLabels[userFilter] as Role | null;
    return users.filter((u) => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (userSearch && !u.name.includes(userSearch)) return false;
      return true;
    });
  }, [users, userSearch, userFilter]);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;

  const totalRecycledKG = collections.reduce((sum, c) => sum + c.weight, 0);
  const co2Saved = Math.round((totalRecycledKG / 1000) * 158);
  const waterSaved = Math.round((totalRecycledKG / 1000) * 228);
  const treesProtected = Math.round((totalRecycledKG / 1000) * 1.5);

  function toggleUserStatus(userId: string, current: 'active' | 'inactive') {
    setIsUpdatingUser((prev) => ({ ...prev, [userId]: true }));
    setTimeout(() => {
      updateUserStatus({ userId, status: current === 'active' ? 'inactive' : 'active' });
      setIsUpdatingUser((prev) => ({ ...prev, [userId]: false }));
    }, 600);
  }

  function handleApproveOrder(orderId: string) {
    setIsApproving((prev) => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      updateOrderStatus({ orderId, status: 'confirmed' });
      setIsApproving((prev) => ({ ...prev, [orderId]: false }));
    }, 600);
  }

  if (currentTab === 'dashboard') {
    const partnerCount = users.filter((u) => u.role === 'partner').length;
    const collectorCount = users.filter((u) => u.role === 'collector').length;
    const sorterCount = users.filter((u) => u.role === 'sorter').length;
    const factoryCount = users.filter((u) => u.role === 'factory').length;

    return (
      <>
        {/* 1. Header is rendered by AppShell */}

        {/* 2. Hero Summary Card (System Overview) */}
        <div className="hero-card">
          <div className="hero-title">إجمالي المواد المفروزة بالمنصة</div>
          <div className="hero-val">{totalRecycledKG.toLocaleString()} كجم</div>
          <div className="hero-sub">اجمع لأثر يدوم • الأثر البيئي الإجمالي متزايد</div>
        </div>

        {/* 3. KPI Cards - 2-column grid, centered metrics, units in KG */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-metric">{partnerCount}</div>
            <div className="kpi-label">فرد / مؤسسة</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{totalRecycledKG.toLocaleString()}</div>
            <div className="kpi-label">كجم مجمع</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{inventory.length}</div>
            <div className="kpi-label">مراكز الفرز</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{factoryCount}</div>
            <div className="kpi-label">مصانع تدوير</div>
          </div>
        </div>

        {/* Warnings alert */}
        {pendingOrdersCount > 0 && (
          <div className="alert warning">
            <AlertTriangle size={16} />
            <span>يوجد {pendingOrdersCount} طلب شراء معلق بانتظار الموافقة</span>
          </div>
        )}

        {/* 4. Primary Actions */}
        <div className="btn-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-button)' }}>
          <button className="btn-primary" onClick={() => { }} style={{ width: '100%', pointerEvents: 'none', opacity: 0.9 }}>
            <Users size={16} /> لوحة الإدارة العامة
          </button>
          <button className="btn-secondary" onClick={() => { }} style={{ width: '100%', pointerEvents: 'none', opacity: 0.9 }}>
            <BarChart3 size={16} /> مؤشرات العمليات
          </button>
        </div>

        {/* 5. Main Content - Environmental Impact Cards in Correct Order */}
        <div className="card">
          <div className="card-title">الأثر البيئي الإجمالي للمنصة</div>
          <div className="impact-grid">
            <div className="impact-card">
              <span className="impact-icon">🌳</span>
              <span className="impact-val">{treesProtected}</span>
              <span className="impact-label">أشجار محمية</span>
            </div>
            <div className="impact-card">
              <span className="impact-icon">💧</span>
              <span className="impact-val">{waterSaved.toLocaleString()} ل</span>
              <span className="impact-label">مياه موفرة</span>
            </div>
            <div className="impact-card">
              <span className="impact-icon">☁️</span>
              <span className="impact-val">{co2Saved} كجم</span>
              <span className="impact-label">انبعاثات CO₂ المخفضة</span>
            </div>
          </div>
        </div>

        {/* 6. Recent Activity - Operations Status */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">حالة العمليات اليوم</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { r: 'الجامعون', n: collectorCount, s: 'نشط' },
              { r: 'مركز الفرز', n: sorterCount, s: 'نشط' },
              { r: 'طلبات شراء معلقة', n: pendingOrdersCount, s: pendingOrdersCount > 0 ? 'معلق' : 'نشط' },
              { r: 'شحنات اليوم', n: shipments.length, s: shipments.length > 0 ? 'جارٍ' : 'نشط' },
            ].map((o, i) => (
              <div className="order-row" key={i}>
                <div className="order-avatar"><CircleDot size={18} /></div>
                <div className="order-info"><div className="order-title">{o.r}</div></div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-green)', marginLeft: '12px' }}>{o.n}</div>
                <span className={`badge ${o.s === 'نشط' ? 'badge-green' : o.s === 'معلق' ? 'badge-orange' : 'badge-blue'}`}>{o.s}</span>
              </div>
            ))}
          </div>
        </div>

        <Chart />
      </>
    );
  }

  if (currentTab === 'users') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>إدارة مستخدمي المنصة</div>
        <div className="card" style={{ padding: '10px' }}>
          <input className="inp" placeholder="بحث عن اسم مستخدم..." style={{ height: '46px' }} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredUsers.map((u) => (
            <div className="card" style={{ padding: '14px' }} key={u.id}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--light-green)',
                      color: 'var(--primary-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '13px',
                      fontWeight: 700
                    }}
                  >
                    {u.name.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{u.name}</div>
                    <div className="text-sm">{config.roleNames[u.role]}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-orange'}`}>
                    {u.status === 'active' ? 'نشط' : 'معلق'}
                  </span>
                  <button className="btn-secondary" style={{ minHeight: '38px', borderRadius: '12px', padding: '6px 12px', fontSize: '11px' }} onClick={() => toggleUserStatus(u.id, u.status)} disabled={!!isUpdatingUser[u.id]}>
                    {isUpdatingUser[u.id] ? '...' : u.status === 'active' ? 'تعليق' : 'تفعيل'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>🔍</span>
              <div className="empty-title">لا توجد نتائج للبحث</div>
            </div>
          )}
        </div>
      </>
    );
  }

  if (currentTab === 'operations') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>مراقبة العمليات اليومية</div>
        {pendingOrdersCount > 0 && (
          <div className="alert warning">
            <AlertTriangle size={16} />
            <span>توجد {pendingOrdersCount} طلبات شراء بانتظار الموافقة</span>
          </div>
        )}
        <div className="card">
          <div className="card-header">
            <span className="card-title">طلبات شراء معلقة</span>
          </div>
          {orders.filter((o) => o.status === 'pending').map((o) => (
            <div className="order-row" key={o.id}>
              <div className="order-avatar"><AlertCircle size={18} style={{ color: 'var(--pending)' }} /></div>
              <div className="order-info">
                <div className="order-title">{o.id} — {o.materialName}</div>
                <div className="order-sub">{o.factoryName} ← {o.centerName} • {o.quantity.toLocaleString()} كجم</div>
              </div>
              <button className="btn-primary" style={{ minHeight: '38px', borderRadius: '12px', fontSize: '11px', padding: '6px 12px' }} onClick={() => handleApproveOrder(o.id)} disabled={!!isApproving[o.id]}>
                {isApproving[o.id] ? 'جاري...' : 'موافقة'}
              </button>
            </div>
          ))}
          {pendingOrdersCount === 0 && (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>📄</span>
              <div className="empty-title">لا توجد طلبات معلقة</div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">المكافآت المتاحة بالمنصة ({rewards.length})</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {rewards.map((r) => (
              <div className="kpi-card" style={{ padding: '12px 6px', minHeight: '90px', gap: '4px' }} key={r.id}>
                <Gift size={20} style={{ color: 'var(--gold)' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dark)' }}>{r.name}</div>
                <div className="text-sm" style={{ fontWeight: 600, color: 'var(--gold)' }}>{r.pointsCost} نقطة</div>
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
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>مواقع التدوير والشاحنات</div>
        <div className="card" style={{ padding: '8px' }}>
          <Suspense fallback={
            <div style={{ height: '320px', borderRadius: 'var(--radius-card)', background: 'linear-gradient(90deg, #EBE8E0 25%, #F5F3EE 50%, #EBE8E0 75%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontSize: '13px' }}>
              جاري تحميل الخريطة...
            </div>
          }>
            <PartnerMapView companies={recyclingCompanies} trucks={trucks} center={centerForMap} />
          </Suspense>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">تتبع الشاحنات النشطة</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {trucks.map((truck, i) => {
              const locations = ['علي منجلي', 'الخروب', 'قسنطينة وسط'];
              return (
                <div className="order-row" key={truck.id}>
                  <div className="order-avatar" style={{ background: '#FFFDF6', color: 'var(--gold)' }}>
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
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">شركاء إعادة التدوير</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recyclingCompanies.map((c) => (
              <div className="order-row" key={c.id}>
                <div className="order-avatar" style={{ background: 'var(--light-green)', color: 'var(--primary-green)' }}>
                  <Factory size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{c.name}</div>
                  <div className="order-sub">{c.address} • التخصص: {c.specialty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">مركز فرز قسنطينة</span>
          </div>
          <div className="order-row">
            <div className="order-avatar" style={{ background: 'var(--light-green)', color: 'var(--primary-green)' }}>♻</div>
            <div className="order-info">
              <div className="order-title">مركز فرز قسنطينة الرئيسي</div>
              <div className="order-sub">قسنطينة وسط — الجزائر</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
}
