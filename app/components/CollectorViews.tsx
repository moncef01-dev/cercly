'use client';

import { useState, lazy, Suspense, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import { generateCollectionId, formatTimestamp } from '../lib/data';
import { MapPin, Check, Camera, Map, Bell, UserCheck, UserX, X, Wallet, TrendingUp, Clock, User } from 'lucide-react';

const MapView = lazy(() => import('./MapView'));

interface CollectorViewsProps {
  currentTab: Tab;
  onSetTab: (tab: Tab) => void;
}

export default function CollectorViews({ currentTab, onSetTab }: CollectorViewsProps) {
  const collections = useStore((s) => s.collections);
  const addCollection = useStore((s) => s.addCollection);
  const addNotification = useStore((s) => s.addNotification);
  const addPointsHistory = useStore((s) => s.addPointsHistory);
  const collectionPoints = useStore((s) => s.collectionPoints);
  const setPointStatus = useStore((s) => s.setPointStatus);
  const materials = useStore((s) => s.materials);
  const schedules = useStore((s) => s.schedules);
  const users = useStore((s) => s.users);
  const addCollectorEarnings = useStore((s) => s.addCollectorEarnings);
  const collectorEarnings = useStore((s) => s.collectorEarnings);

  const pointAttendance = useMemo(() => {
    const mapObj: Record<string, { status: string }> = {};
    schedules.forEach((sch) => {
      if (sch.status === 'confirmed' || sch.status === 'pending') {
        mapObj[sch.pointId] = { status: sch.status };
      }
    });
    return mapObj;
  }, [schedules]);

  const [collPoint, setCollPoint] = useState('p3');
  const [collWeight, setCollWeight] = useState('');
  const [collMaterials, setCollMaterials] = useState<MaterialType[]>([]);
  const [collSubmitted, setCollSubmitted] = useState(false);

  const [mapCollectPoint, setMapCollectPoint] = useState<typeof collectionPoints[number] | null>(null);
  const [mapCollectWeight, setMapCollectWeight] = useState('');
  const [mapCollectMaterials, setMapCollectMaterials] = useState<MaterialType[]>([]);
  const [mapCollectSubmitted, setMapCollectSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapSubmitting, setIsMapSubmitting] = useState(false);

  function calcPoints(materialId: MaterialType, weight: number, bottles: number): number {
    let points = 0;
    const w = weight || 0;
    const b = bottles || 0;
    if (materialId === 'plastic') {
      if (b > 0) { if (b >= 10) points = 150; else if (b >= 5) points = 60; else points = 10 * b; }
      else { if (w >= 10) points = 150; else if (w >= 5) points = 60; else points = 10 * w; }
    } else if (materialId === 'carton') {
      if (w >= 10) points = 90; else if (w >= 5) points = 35; else points = 5 * w;
    } else if (materialId === 'battery') {
      const count = b > 0 ? b : w;
      if (count >= 10) points = 300; else if (count >= 5) points = 120; else points = 20 * count;
    } else if (materialId === 'printer_cartridge' || materialId === 'ink_cartridge') {
      const count = b > 0 ? b : w;
      if (count >= 10) points = 700; else if (count >= 5) points = 300; else points = 50 * count;
    }
    return points;
  }

  function toggleMaterial(mat: MaterialType) {
    setCollMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat],
    );
  }

  function toggleMapMaterial(mat: MaterialType) {
    setMapCollectMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat],
    );
  }

  function handleMapCollection() {
    const weight = parseInt(mapCollectWeight, 10);
    if (!weight || weight <= 0 || !mapCollectPoint) return;
    setIsMapSubmitting(true);

    setTimeout(() => {
      const now = new Date();
      const stamp = formatTimestamp(now);
      const totalPoints = mapCollectMaterials.reduce((sum, mat) => sum + calcPoints(mat, weight / Math.max(mapCollectMaterials.length, 1), 0), 0);

      addCollection({
        id: generateCollectionId(),
        collectorId: 'u2',
        pointId: mapCollectPoint.id,
        pointName: mapCollectPoint.name,
        registeredUserName: mapCollectPoint.accountName,
        weight,
        materials: mapCollectMaterials.length > 0 ? mapCollectMaterials : mapCollectPoint.materials as MaterialType[],
        timestamp: now.toISOString(),
        date: stamp.date,
        time: stamp.time,
        bottleCount: mapCollectPoint.quantityMode === 'bottles' ? mapCollectPoint.quantityValue : undefined,
      });

      setPointStatus({ id: mapCollectPoint.id, status: 'completed' });
      addCollectorEarnings(Math.round(weight * 0.5));

      const partnerUser = users.find((u) => u.name === mapCollectPoint.accountName);
      if (partnerUser && totalPoints > 0) {
        addPointsHistory({
          id: `ph-${Date.now()}`,
          points: totalPoints,
          reason: `جمع مواد من ${mapCollectPoint.accountName}`,
          date: stamp.date,
          type: 'earned',
        });
      }

      addNotification({
        id: `n-map-${Date.now()}`,
        icon: '♻',
        title: 'تم الاستلام',
        text: `تم استلام المواد بمركز فرز قسنطينة بعد جمع حساب ${mapCollectPoint.accountName ?? mapCollectPoint.name}`,
        time: 'الآن',
        isNew: true,
        type: 'success',
        role: 'collector',
      });

      setMapCollectSubmitted(true);
      setMapCollectPoint(null);
      setMapCollectWeight('');
      setMapCollectMaterials([]);
      setIsMapSubmitting(false);
      setTimeout(() => setMapCollectSubmitted(false), 3000);
    }, 1000);
  }

  function handleMapCollect(point: typeof collectionPoints[number]) {
    setMapCollectPoint(point);
    setMapCollectMaterials(point.materials as MaterialType[]);
    setMapCollectWeight('');
    setMapCollectSubmitted(false);
  }

  function handleSubmitCollection() {
    const weight = parseInt(collWeight, 10);
    if (!weight || weight <= 0 || collMaterials.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const point = collectionPoints.find((p) => p.id === collPoint);
      const now = new Date();
      const { date, time } = formatTimestamp(now);
      const totalPoints = collMaterials.reduce((sum, mat) => sum + calcPoints(mat, weight / Math.max(collMaterials.length, 1), 0), 0);

      addCollection({
        id: generateCollectionId(),
        collectorId: 'u2',
        pointId: collPoint,
        pointName: point?.name ?? '',
        registeredUserName: point?.accountName,
        weight,
        materials: collMaterials,
        timestamp: now.toISOString(),
        date,
        time,
        bottleCount: point?.quantityMode === 'bottles' ? point.quantityValue : undefined,
      });

      if (point) {
        setPointStatus({ id: point.id, status: 'completed' });
      }
      addCollectorEarnings(Math.round(weight * 0.5));

      const partnerUser = users.find((u) => u.name === point?.accountName);
      if (partnerUser && totalPoints > 0) {
        addPointsHistory({
          id: `ph-col-${Date.now()}`,
          points: totalPoints,
          reason: `جمع مواد من ${point?.accountName}`,
          date,
          type: 'earned',
        });
      }

      const partnerName = point?.accountName ?? point?.name ?? '';
      addNotification({
        id: `notif-${Date.now()}`,
        icon: '✅',
        title: 'طلب مقبول',
        text: `تم قبول طلب ${partnerName} من طرف جامع أحمد في قسنطينة وسط`,
        time: 'الآن',
        isNew: true,
        type: 'success',
        role: 'collector',
      });

      setCollSubmitted(true);
      setCollWeight('');
      setCollMaterials([]);
      setIsSubmitting(false);
      setTimeout(() => setCollSubmitted(false), 3000);
    }, 1000);
  }

  if (currentTab === 'dashboard') {
    const todayTotal = collections
      .filter((c) => c.date === 'اليوم')
      .reduce((sum, c) => sum + c.weight, 0);
    const target = 1500;
    const pct = Math.min(Math.round((todayTotal / target) * 100), 100);
    const upcomingPoints = collectionPoints.filter((p) => p.status === 'upcoming');
    const completedCount = collectionPoints.filter((p) => p.status === 'completed').length;
    const pendingTasks = schedules.filter((s) => s.status === 'pending').length;

    return (
      <>
        {/* 1. Header is rendered by AppShell */}

        {/* 2. Hero Summary Card (Daily Collection) */}
        <div className="hero-card">
          <div className="hero-title">المجموع المجمع اليوم</div>
          <div className="hero-val">{todayTotal.toLocaleString()} كجم</div>
          <div className="hero-sub">الهدف اليومي: {target.toLocaleString()} كجم • {pct}% منجز</div>
        </div>

        {/* Progress Card */}
        <div className="card">
          <div className="flex-between">
            <span className="text-sm">تقدم الهدف اليومي</span>
            <span className="text-sm" style={{ fontWeight: 600 }}>{todayTotal} / {target} كجم</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* 3. KPI Cards - 2-column grid, centered metrics */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-metric">{collections.filter((c) => c.date === 'اليوم').length}</div>
            <div className="kpi-label">عمليات اليوم</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{upcomingPoints.length}</div>
            <div className="kpi-label">مهام متبقية</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{completedCount}</div>
            <div className="kpi-label">مهام منجزة</div>
          </div>
        </div>

        {/* 4. Primary Actions */}
        <div className="btn-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-button)' }}>
          <button className="btn-primary" onClick={() => onSetTab('routes')} style={{ width: '100%' }}>
            <Map size={16} /> خريطة المسار
          </button>
          <button className="btn-secondary" onClick={() => onSetTab('collection')} style={{ width: '100%' }}>
            <Check size={16} /> تسجيل عملية جمع
          </button>
        </div>

        {/* Alert Banner */}
        <div className="alert info">
          <Bell size={16} />
          <span>طلب جديد من حي المنظر الجميل بخصوص عبوات بلاستيكية</span>
        </div>

        {/* 5. Main Content - Tasks List */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">المهام الحالية</span>
          </div>
          {upcomingPoints.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {upcomingPoints.map((p) => {
                const att = pointAttendance[p.id];
                return (
                  <div className="order-row" key={p.id}>
                    <div className="order-avatar" style={{ color: 'var(--pending)' }}>
                      <Clock size={18} />
                    </div>
                    <div className="order-info">
                      <div className="order-title">{p.accountName}</div>
                      <div className="order-sub">{p.address} • {p.materials.map((id) => materials.find((m) => m.id === id)?.name ?? id).join('، ')}</div>
                    </div>
                    <span className={`badge ${att?.status === 'confirmed' ? 'badge-green' : 'badge-orange'}`}>
                      {att?.status === 'confirmed' ? 'مؤكد' : 'معلق'}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>📋</span>
              <div className="empty-title">لا توجد مهام حالياً</div>
              <div className="empty-desc">أنت جاهز لليوم!</div>
            </div>
          )}
        </div>

        {/* 6. Recent Activity - Accounts Registered today */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">الحسابات المسجلة اليوم</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {collectionPoints.map((p) => {
              const att = pointAttendance[p.id];
              const materialNames = p.materials.map((id) => materials.find((m) => m.id === id)?.name ?? id).join(' + ');
              return (
                <div className="order-row" key={p.id}>
                  <div className="order-avatar" style={p.status === 'upcoming' ? { color: 'var(--pending)' } : { color: 'var(--primary-green)' }}>
                    <MapPin size={18} />
                  </div>
                  <div className="order-info">
                    <div className="order-title">{p.accountName}</div>
                    <div className="order-sub">
                      {p.address} • {materialNames}
                    </div>
                  </div>
                  <div className="order-right">
                    <span className={`badge ${p.status === 'completed' ? 'badge-green' : 'badge-orange'}`}>
                      {p.status === 'completed' ? 'منجز' : 'قادم'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'routes') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>الخريطة التفاعلية</div>
        <div className="card" style={{ padding: '8px' }}>
          <Suspense fallback={
            <div style={{ height: '320px', borderRadius: 'var(--radius-card)', background: 'linear-gradient(90deg, #EBE8E0 25%, #F5F3EE 50%, #EBE8E0 75%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontSize: '13px' }}>
              جاري تحميل الخريطة…
            </div>
          }>
            <MapView points={collectionPoints} onCollect={handleMapCollect} />
          </Suspense>
        </div>

        {mapCollectSubmitted && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span>تمت العملية بنجاح - تم تسجيل الجمع بنجاح</span>
          </div>
        )}

        {mapCollectPoint && !mapCollectSubmitted && (
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {mapCollectPoint.accountName}
              </span>
              <button className="btn-sm" style={{ border: 'none', background: 'none', color: 'var(--text-dark)', cursor: 'pointer', padding: '4px', minHeight: 'auto' }}
                onClick={() => { setMapCollectPoint(null); setMapCollectMaterials([]); }}>
                <X size={16} />
              </button>
            </div>
            <div className="text-sm">
              {mapCollectPoint.address} • {mapCollectPoint.quantityMode === 'bottles'
                ? `${mapCollectPoint.quantityValue} قارورة`
                : `${mapCollectPoint.quantityValue} كجم`}
            </div>
            <div className="form-row">
              <div className="form-label">الوزن المستلم (كجم)</div>
              <input className="inp" type="number" value={mapCollectWeight}
                onChange={(e) => setMapCollectWeight(e.target.value)} placeholder="أدخل الوزن" />
            </div>
            <div className="form-row">
              <div className="form-label">المواد</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                {materials.filter((m) => m.id !== 'ink_cartridge').map((m) => (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                    border: `1.5px solid ${mapCollectMaterials.includes(m.id) ? 'var(--primary-green)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer', fontSize: '13px',
                    background: mapCollectMaterials.includes(m.id) ? 'var(--light-green)' : '#fff',
                    color: 'var(--text-dark)'
                  }}>
                    <input type="checkbox" checked={mapCollectMaterials.includes(m.id)}
                      onChange={() => toggleMapMaterial(m.id)} /> {m.icon} {m.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="btn-row">
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleMapCollection} disabled={isMapSubmitting}>
                {isMapSubmitting ? 'جارٍ المعالجة...' : 'تأكيد الجمع'}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title">المسار الأمثل اليوم</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[...collectionPoints].sort((a, b) => a.order - b.order).map((p) => {
              const isCompleted = p.status === 'completed';
              const bg = isCompleted ? 'var(--light-green)' : '#FCF5E8';
              const color = isCompleted ? 'var(--primary-green)' : 'var(--pending)';
              const badge = isCompleted ? 'badge-green' : 'badge-orange';
              const label = isCompleted ? 'منجز' : 'قادم';
              return (
                <div className="order-row" key={p.id} onClick={() => !isCompleted && handleMapCollect(p)}
                  style={{ cursor: isCompleted ? 'default' : 'pointer' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                    {p.order}
                  </div>
                  <div className="order-info"><div className="order-title">{p.accountName}</div></div>
                  <span className={`badge ${badge}`}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'collection') {
    const registeredAccounts = collectionPoints.map((p) => ({
      id: p.id,
      name: p.accountName ?? p.name,
      address: p.address,
    }));

    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>تسجيل عملية جمع</div>
        {collSubmitted && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span>تمت العملية بنجاح - تم تسجيل عملية الجمع بنجاح</span>
          </div>
        )}
        <div className="card">
          <div className="form-row">
            <div className="form-label">الحساب المسجل</div>
            <select className="form-select" value={collPoint} onChange={(e) => setCollPoint(e.target.value)}>
              {registeredAccounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} - {acc.address}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">وزن المواد المستلمة (كجم)</div>
            <input
              className="inp" type="number" placeholder="أدخل الوزن بالكجم"
              value={collWeight}
              onChange={(e) => setCollWeight(e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-label">أنواع المواد المجمعة</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              {materials.filter((m) => m.id !== 'ink_cartridge').map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px',
                    border: `1.5px solid ${collMaterials.includes(m.id) ? 'var(--primary-green)' : 'var(--border)'}`,
                    borderRadius: '12px', cursor: 'pointer', fontSize: '13px',
                    background: collMaterials.includes(m.id) ? 'var(--light-green)' : '#fff',
                    color: 'var(--text-dark)'
                  }}
                >
                  <input
                    type="checkbox" checked={collMaterials.includes(m.id)}
                    onChange={() => toggleMaterial(m.id)}
                  /> {m.icon} {m.name}
                </label>
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-label">صورة للتوثيق</div>
            <div style={{ border: '2px dashed var(--surface)', borderRadius: '16px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', opacity: 0.8, fontSize: '13px', cursor: 'pointer', background: '#fff' }}>
              <Camera size={22} style={{ marginLeft: '8px', color: 'var(--primary-green)' }} /> التقاط صورة
            </div>
          </div>
          <div className="btn-row" style={{ marginTop: '6px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmitCollection} disabled={isSubmitting}>
              {isSubmitting ? 'جارٍ المعالجة...' : 'تأكيد الجمع'}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'history') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>سجل العمليات</div>
        <div className="card">
          <div className="flex-between">
            <div>
              <div className="kpi-metric" style={{ fontSize: '22px' }}>{collections.length}</div>
              <div className="kpi-label">عمليات منجزة</div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="kpi-metric" style={{ fontSize: '22px' }}>{collections.reduce((s, c) => s + c.weight, 0).toLocaleString()}</div>
              <div className="kpi-label">إجمالي كجم مجموع</div>
            </div>
          </div>
        </div>
        {collections.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" style={{ fontSize: '32px' }}>📊</span>
            <div className="empty-title">لا توجد عمليات جمع مسجلة</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {collections.map((r) => (
              <div className="card" style={{ padding: '14px' }} key={r.id}>
                <div className="flex-between">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{r.registeredUserName ?? r.pointName}</div>
                    <div className="text-sm" style={{ marginTop: '2px' }}>{r.date} — {r.time}</div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-green)' }}>{r.weight} كجم</div>
                    <div className="text-sm" style={{ marginTop: '2px' }}>{r.materials.map((m) => materials.find((mat) => mat.id === m)?.name ?? m).join('، ')}</div>
                  </div>
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
