'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, Role } from '../lib/types';
import Chart from './Chart';
import { AlertTriangle, AlertCircle, CircleDot, Check, X } from 'lucide-react';

interface AdminViewsProps {
  currentTab: Tab;
}

const roleFilterLabels: Record<string, Role | null> = {
  all: null,
  partners: 'partner',
  collectors: 'collector',
  centers: 'sorter',
};

export default function AdminViews({ currentTab }: AdminViewsProps) {
  const users = useStore((s) => s.users);
  const orders = useStore((s) => s.orders);
  const inventory = useStore((s) => s.inventory);
  const shipments = useStore((s) => s.shipments);
  const config = useStore((s) => s.config);
  const updateUserStatus = useStore((s) => s.updateUserStatus);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);

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

  function toggleUserStatus(userId: string, current: 'active' | 'inactive') {
    updateUserStatus({ userId, status: current === 'active' ? 'inactive' : 'active' });
  }

  if (currentTab === 'dashboard') {
    const operationStats = [
      { r: 'فرق الجمع', n: users.filter((u) => u.role === 'collector').length, s: 'نشط' },
      { r: 'مراكز الفرز', n: users.filter((u) => u.role === 'sorter').length, s: 'نشط' },
      { r: 'طلبات شراء', n: pendingOrdersCount, s: pendingOrdersCount > 0 ? 'معلق' : 'نشط' },
      { r: 'شحنات اليوم', n: shipments.length, s: shipments.length > 0 ? 'جارٍ' : 'نشط' },
    ];

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الإدارة العامة — CERCLY</div>
        <div className="stats">
          <div className="stat-card"><div className="stat-val">{users.filter((u) => u.role === 'partner').length}</div><div className="stat-label">شركاء مسجلون</div><div className="stat-change">↑ 28 هذا الأسبوع</div></div>
          <div className="stat-card"><div className="stat-val">48 طن</div><div className="stat-label">إجمالي التدوير</div></div>
          <div className="stat-card"><div className="stat-val">{inventory.length}</div><div className="stat-label">مراكز فرز</div></div>
          <div className="stat-card"><div className="stat-val">{users.filter((u) => u.role === 'factory').length}</div><div className="stat-label">مصانع شريكة</div></div>
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>حالة العمليات اليوم</div>
          {operationStats.map((o, i) => (
            <div className="order-row" key={i}>
              <div className="order-avatar"><CircleDot size={18} /></div>
              <div className="order-info"><div className="order-title">{o.r}</div></div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)', marginRight: '8px' }}>{o.n}</div>
              <span className={`badge ${o.s === 'نشط' ? 'badge-green' : o.s === 'معلق' ? 'badge-orange' : 'badge-blue'}`}>{o.s}</span>
            </div>
          ))}
        </div>
        <Chart />
      </>
    );
  }

  if (currentTab === 'users') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>إدارة المستخدمين</div>
        <div className="card" style={{ padding: '10px' }}>
          <input className="inp" placeholder="بحث عن مستخدم..." style={{ marginBottom: 0 }} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
        <div className="tabs">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'partners', label: 'الشركاء' },
            { id: 'collectors', label: 'فرق الجمع' },
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
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>مراقبة العمليات</div>
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
      </>
    );
  }

  if (currentTab === 'reports') {
    return <Chart />;
  }

  return null;
}
