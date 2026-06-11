'use client';

import { useState, lazy, Suspense, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import { generateCollectionId, formatTimestamp } from '../lib/data';
import { MapPin, Check, Camera, Map, Bell, UserCheck, UserX, X } from 'lucide-react';

const MapView = lazy(() => import('./MapView'));

interface CollectorViewsProps {
  currentTab: Tab;
  onSetTab: (tab: Tab) => void;
}

export default function CollectorViews({ currentTab, onSetTab }: CollectorViewsProps) {
  const collections = useStore((s) => s.collections);
  const addCollection = useStore((s) => s.addCollection);
  const addNotification = useStore((s) => s.addNotification);
  const collectionPoints = useStore((s) => s.collectionPoints);
  const setPointStatus = useStore((s) => s.setPointStatus);
  const materials = useStore((s) => s.materials);
  const schedules = useStore((s) => s.schedules);
  const users = useStore((s) => s.users);

  const partnerUsers = useMemo(
    () => users.filter((u) => u.role === 'partner' && u.status === 'active'),
    [users],
  );

  const pointAttendance = useMemo(() => {
    const map: Record<string, { status: string }> = {};
    schedules.forEach((sch) => {
      if (sch.status === 'confirmed' || sch.status === 'pending') {
        map[sch.pointId] = { status: sch.status };
      }
    });
    return map;
  }, [schedules]);

  const [collPoint, setCollPoint] = useState('p3');
  const [collWeight, setCollWeight] = useState('');
  const [collMaterials, setCollMaterials] = useState<MaterialType[]>([]);
  const [collSubmitted, setCollSubmitted] = useState(false);

  const [mapCollectPoint, setMapCollectPoint] = useState<typeof collectionPoints[number] | null>(null);
  const [mapCollectWeight, setMapCollectWeight] = useState('');
  const [mapCollectMaterials, setMapCollectMaterials] = useState<MaterialType[]>([]);
  const [mapCollectSubmitted, setMapCollectSubmitted] = useState(false);

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

  function getPartnerName(pointId: string) {
    const point = collectionPoints.find((p) => p.id === pointId);
    return point?.accountName ?? point?.name ?? '';
  }

  function handleMapCollection() {
    const weight = parseInt(mapCollectWeight, 10);
    if (!weight || weight <= 0 || !mapCollectPoint) return;

    const now = new Date();
    const stamp = formatTimestamp(now);

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

    addNotification({
      id: `n-map-${Date.now()}`,
      text: `تم استلام المواد بمركز فرز قسنطينة بعد جمع حساب ${mapCollectPoint.accountName ?? mapCollectPoint.name}`,
      time: 'الآن',
      isNew: true,
      type: 'success',
    });

    setMapCollectSubmitted(true);
    setMapCollectPoint(null);
    setMapCollectWeight('');
    setMapCollectMaterials([]);
    setTimeout(() => setMapCollectSubmitted(false), 3000);
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

    const point = collectionPoints.find((p) => p.id === collPoint);
    const now = new Date();
    const { date, time } = formatTimestamp(now);

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

    const partnerName = point?.accountName ?? point?.name ?? '';
    addNotification({
      id: `notif-${Date.now()}`,
      text: `تم قبول طلب ${partnerName} من طرف الجامع أحمد وتحويله إلى مركز فرز قسنطينة`,
      time: 'الآن',
      isNew: true,
      type: 'success',
    });

    setCollSubmitted(true);
    setCollWeight('');
    setCollMaterials([]);
    setTimeout(() => setCollSubmitted(false), 3000);
  }

  if (currentTab === 'dashboard') {
    const todayTotal = collections
      .filter((c) => c.date === 'اليوم')
      .reduce((sum, c) => sum + c.weight, 0);
    const target = 1500;
    const pct = Math.round((todayTotal / target) * 100);
    const upcomingPoints = collectionPoints.filter((p) => p.status === 'upcoming');
    const completedCount = collectionPoints.filter((p) => p.status === 'completed').length;
    const confirmedCount = Object.values(pointAttendance).filter((a) => a.status === 'confirmed').length;

    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الجامع — قسنطينة</div>
        <div className="hero-card">
          <div className="hero-title">المجموع المجمع اليوم</div>
          <div className="hero-val">{todayTotal.toLocaleString()} كجم</div>
          <div className="hero-sub">الهدف اليومي: {target} كجم • {pct}% منجز</div>
        </div>
        <div className="stats">
          <div className="stat-card"><div className="stat-val">{collections.filter((c) => c.date === 'اليوم').length}</div><div className="stat-label">عمليات جمع</div></div>
          <div className="stat-card"><div className="stat-val">{upcomingPoints.length}</div><div className="stat-label">حسابات متبقية</div></div>
          <div className="stat-card"><div className="stat-val">{completedCount}</div><div className="stat-label">حسابات منجزة</div></div>
          <div className="stat-card"><div className="stat-val">{confirmedCount}</div><div className="stat-label">تأكيد حضور</div></div>
        </div>
        <div className="alert info">
          <Bell size={16} /> طلب جديد من جامعة قسنطينة 2 بخصوص عبوات بلاستيكية
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">الحسابات المسجلة اليوم</span></div>
          {collectionPoints.map((p) => {
            const att = pointAttendance[p.id];
            const materialNames = p.materials.map((id) => materials.find((m) => m.id === id)?.name ?? id).join(' + ');
            return (
              <div className="order-row" key={p.id}>
                <div className="order-avatar" style={p.status === 'upcoming' ? { color: 'var(--orange)' } : {}}>
                  <MapPin size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{p.accountName}</div>
                  <div className="order-sub" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {att?.status === 'confirmed' ? (
                      <span style={{ color: 'var(--green-mid)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <UserCheck size={12} /> مؤكد
                      </span>
                    ) : att?.status === 'pending' ? (
                      <span style={{ color: 'var(--orange)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <UserX size={12} /> بانتظار التأكيد
                      </span>
                    ) : null}
                    <span>{p.address} • {materialNames}</span>
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
          <div className="btn-row">
            <button className="btn-sm primary" onClick={() => onSetTab('routes')}>
              <Map size={16} /> فتح الخريطة
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'routes') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الخريطة التفاعلية</div>
        <div className="card" style={{ padding: '8px' }}>
          <Suspense fallback={
            <div style={{ height: '320px', borderRadius: 'var(--radius)', background: 'linear-gradient(160deg,#dcecd4,#e8f0e0)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
              جاري تحميل الخريطة…
            </div>
          }>
            <MapView points={collectionPoints} onCollect={handleMapCollect} />
          </Suspense>
        </div>

        {mapCollectSubmitted && (
          <div className="alert success"><Check size={16} /> تم تسجيل الجمع بنجاح</div>
        )}

        {mapCollectPoint && !mapCollectSubmitted && (
          <div className="card">
            <div className="card-header">
              <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {mapCollectPoint.accountName}
              </span>
              <button className="btn-sm" style={{ border: 'none', background: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '4px' }}
                onClick={() => { setMapCollectPoint(null); setMapCollectMaterials([]); }}>
                <X size={16} />
              </button>
            </div>
            <div className="text-sm" style={{ marginBottom: '10px' }}>
              {mapCollectPoint.address} • {mapCollectPoint.quantityMode === 'bottles'
                ? `${mapCollectPoint.quantityValue} قارورة`
                : `${mapCollectPoint.quantityValue} كجم`}
            </div>
            <div className="form-row">
              <div className="form-label">الوزن (كجم)</div>
              <input className="inp" type="number" style={{ margin: 0 }} value={mapCollectWeight}
                onChange={(e) => setMapCollectWeight(e.target.value)} placeholder="أدخل الوزن" />
            </div>
            <div className="form-row">
              <div className="form-label">المواد</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                {materials.map((m) => (
                  <label key={m.id} style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                    border: `1.5px solid ${mapCollectMaterials.includes(m.id) ? 'var(--green-mid)' : 'var(--border)'}`,
                    borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                    background: mapCollectMaterials.includes(m.id) ? 'var(--green-50)' : '#fff',
                  }}>
                    <input type="checkbox" checked={mapCollectMaterials.includes(m.id)}
                      onChange={() => toggleMapMaterial(m.id)} /> {m.icon} {m.name}
                  </label>
                ))}
              </div>
            </div>
            <div className="btn-row">
              <button className="btn-sm primary" onClick={handleMapCollection}>
                <Check size={14} /> تأكيد الجمع
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>المسار الأمثل اليوم</div>
          {[...collectionPoints].sort((a, b) => a.order - b.order).map((p) => {
            const isCompleted = p.status === 'completed';
            const bg = isCompleted ? 'var(--green-50)' : '#fff3e0';
            const color = isCompleted ? 'var(--green-mid)' : 'var(--orange)';
            const badge = isCompleted ? 'badge-green' : 'badge-orange';
            const label = isCompleted ? 'منجز' : 'قادم';
            return (
              <div className="order-row" key={p.id} onClick={() => !isCompleted && handleMapCollect(p)}
                style={{ cursor: isCompleted ? 'default' : 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, flexShrink: 0 }}>
                  {p.order}
                </div>
                <div className="order-info"><div className="order-title" style={{ fontSize: '13px' }}>{p.accountName}</div></div>
                <span className={`badge ${badge}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  if (currentTab === 'collection') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>تسجيل عملية جمع</div>
        {collSubmitted && (
          <div className="alert success"><Check size={16} /> تم تسجيل عملية الجمع بنجاح</div>
        )}
        <div className="card">
          <div className="form-row">
            <div className="form-label">الحساب المسجل</div>
            <select className="form-select" value={collPoint} onChange={(e) => setCollPoint(e.target.value)}>
              {collectionPoints.map((p) => {
                const matchingUser = partnerUsers.find((user) => user.name === p.accountName);
                return (
                  <option key={p.id} value={p.id}>
                    {(matchingUser?.name ?? p.accountName)} - {p.address}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-row">
            <div className="form-label">وزن المواد المستلمة</div>
            <input
              className="inp" type="number" placeholder="كجم"
              style={{ margin: 0 }} value={collWeight}
              onChange={(e) => setCollWeight(e.target.value)}
            />
          </div>
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-label">أنواع المواد المجمعة</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
              {materials.map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px',
                    border: `1.5px solid ${collMaterials.includes(m.id) ? 'var(--green-mid)' : 'var(--border)'}`,
                    borderRadius: '10px', cursor: 'pointer', fontSize: '13px',
                    background: collMaterials.includes(m.id) ? 'var(--green-50)' : '#fff',
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
          <div className="form-row" style={{ marginTop: '12px' }}>
            <div className="form-label">صورة للتوثيق</div>
            <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: '13px', cursor: 'pointer' }}>
              <Camera size={22} style={{ marginLeft: '8px' }} /> التقاط صورة
            </div>
          </div>
          <div className="btn-row">
            <button className="btn-sm primary" style={{ flex: 1 }} onClick={handleSubmitCollection}>
              <Check size={16} /> تأكيد الجمع
            </button>
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'history') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>سجل العمليات</div>
        {collections.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
            <div className="text-sm">لا توجد عمليات جمع مسجلة</div>
          </div>
        ) : (
          collections.map((r) => (
            <div className="card" style={{ marginBottom: '10px' }} key={r.id}>
              <div className="flex-between">
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{r.registeredUserName ?? r.pointName}</div>
                  <div className="text-sm">{r.date} — {r.time}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--green-mid)' }}>{r.weight} كجم</div>
                  <div className="text-sm">{r.materials.map((m) => materials.find((mat) => mat.id === m)?.name ?? m).join('، ')}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </>
    );
  }

  return null;
}
