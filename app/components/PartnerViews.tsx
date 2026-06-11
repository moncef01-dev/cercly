'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import Chart from './Chart';
import { generateNotifId } from '../lib/data';
import { Check, X, Calendar, Clock, Plus, Gift, History, Star, Store, Droplets, TreePine, Wind } from 'lucide-react';

const PartnerMapView = lazy(() => import('./PartnerMapView'));

interface PartnerViewsProps {
  currentTab: Tab;
}

const allowedMaterials: MaterialType[] = ['plastic', 'carton', 'battery', 'printer_cartridge', 'ink_cartridge'];

function calcPoints(materialId: MaterialType, weight: number, bottles: number): number {
  let points = 0;
  const w = weight || 0;
  const b = bottles || 0;

  if (materialId === 'plastic') {
    if (b > 0) {
      if (b >= 10) points = 150;
      else if (b >= 5) points = 60;
      else points = 10 * b;
    } else {
      if (w >= 10) points = 150;
      else if (w >= 5) points = 60;
      else points = 10 * w;
    }
  } else if (materialId === 'carton') {
    if (w >= 10) points = 90;
    else if (w >= 5) points = 35;
    else points = 5 * w;
  } else if (materialId === 'battery') {
    const count = b > 0 ? b : w;
    if (count >= 10) points = 300;
    else if (count >= 5) points = 120;
    else points = 20 * count;
  } else if (materialId === 'printer_cartridge') {
    const count = b > 0 ? b : w;
    if (count >= 10) points = 700;
    else if (count >= 5) points = 300;
    else points = 50 * count;
  } else if (materialId === 'ink_cartridge') {
    const count = b > 0 ? b : w;
    if (count >= 10) points = 700;
    else if (count >= 5) points = 300;
    else points = 50 * count;
  }
  return points;
}

export default function PartnerViews({ currentTab }: PartnerViewsProps) {
  const profile = useStore((s) => s.partnerProfile);
  const updatePartnerProfile = useStore((s) => s.updatePartnerProfile);
  const addNotification = useStore((s) => s.addNotification);
  const addPointsHistory = useStore((s) => s.addPointsHistory);
  const schedules = useStore((s) => s.schedules);
  const confirmAttendance = useStore((s) => s.confirmAttendance);
  const postponeAttendance = useStore((s) => s.postponeAttendance);
  const materials = useStore((s) => s.materials);
  const collectionPoints = useStore((s) => s.collectionPoints);
  const addCollectionPoint = useStore((s) => s.addCollectionPoint);
  const addSchedule = useStore((s) => s.addSchedule);
  const rewards = useStore((s) => s.rewards);
  const redeemReward = useStore((s) => s.redeemReward);
  const pointsHistory = useStore((s) => s.pointsHistory);
  const greenPartnerStores = useStore((s) => s.greenPartnerStores);
  const recyclingCompanies = useStore((s) => s.recyclingCompanies);
  const trucks = useStore((s) => s.trucks);

  const [editAddress, setEditAddress] = useState(profile.address);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqAddress, setReqAddress] = useState('');
  const [reqMaterials, setReqMaterials] = useState<MaterialType[]>([]);
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('10:00');
  const [reqSubmitted, setReqSubmitted] = useState(false);
  const [reqWeight, setReqWeight] = useState('');
  const [reqBottles, setReqBottles] = useState('');

  function handleRequestCollection() {
    if (!reqAddress.trim() || reqMaterials.length === 0 || !reqDate) return;

    const pointId = `p-${Date.now()}`;
    const weight = parseInt(reqWeight) || 0;
    const bottles = parseInt(reqBottles) || 0;

    addCollectionPoint({
      id: pointId,
      name: reqAddress.trim(),
      address: reqAddress.trim(),
      lat: 36.3500 + Math.random() * 0.02,
      lng: 6.6200 + Math.random() * 0.02,
      materials: reqMaterials,
      status: 'upcoming',
      order: collectionPoints.length + 1,
      quantityMode: bottles > 0 ? 'bottles' : 'kg',
      quantityValue: bottles > 0 ? bottles : weight,
    });

    addSchedule({
      id: `sch-${Date.now()}`,
      partnerId: 'u4',
      pointId,
      pointName: reqAddress.trim(),
      address: reqAddress.trim(),
      scheduledDate: reqDate,
      scheduledTime: reqTime,
      status: 'pending',
      quantityMode: bottles > 0 ? 'bottles' : 'kg',
      quantityValue: bottles > 0 ? bottles : weight,
    });

    const totalPoints = reqMaterials.reduce((sum, mat) => sum + calcPoints(mat, weight / Math.max(reqMaterials.length, 1), bottles), 0);
    updatePartnerProfile({ points: profile.points + totalPoints, totalRecycled: profile.totalRecycled + (weight / 1000) });

    if (totalPoints > 0) {
      addPointsHistory({
        id: `ph-earn-${Date.now()}`,
        points: totalPoints,
        reason: `تقدير نقاط عن ${reqMaterials.length} مادة`,
        date: new Date().toLocaleDateString('fr-FR'),
        type: 'earned',
      });
    }

    addNotification({
      id: generateNotifId(),
      icon: '📦',
      title: 'طلب جمع جديد',
      text: `تم تقديم طلب جمع جديد في ${reqAddress.trim()}`,
      time: 'الآن', isNew: true, type: 'info',
      role: 'partner',
    });

    setReqSubmitted(true);
    setShowRequestForm(false);
    setReqAddress('');
    setReqMaterials([]);
    setReqDate('');
    setReqTime('10:00');
    setReqWeight('');
    setReqBottles('');
    setTimeout(() => setReqSubmitted(false), 3000);
  }

  function toggleReqMaterial(mat: MaterialType) {
    setReqMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat],
    );
  }

  const impactItems = useMemo(() => [
    { icon: <Wind size={24} />, label: 'CO₂ مخفض', val: `${Math.round(profile.totalRecycled * 158)} كجم` },
    { icon: <Droplets size={24} />, label: 'مياه موفرة', val: `${(profile.totalRecycled * 228).toLocaleString()} ل` },
    { icon: <TreePine size={24} />, label: 'أشجار محمية', val: `${Math.round(profile.totalRecycled * 1.5)}` },
  ], [profile]);

  const mySchedules = useMemo(
    () => schedules.filter((s) => s.partnerId === 'u4'),
    [schedules],
  );

  const pendingSchedules = useMemo(
    () => mySchedules.filter((s) => s.status === 'pending' || s.status === 'postponed'),
    [mySchedules],
  );

  const statusLabels: Record<string, { label: string; badge: string }> = {
    pending: { label: 'بانتظار التأكيد', badge: 'badge-orange' },
    confirmed: { label: 'تم التأكيد', badge: 'badge-green' },
    postponed: { label: 'مؤجل', badge: 'badge-blue' },
    completed: { label: 'تم الجمع', badge: 'badge-green' },
    cancelled: { label: 'ملغي', badge: 'badge-orange' },
  };

  function handleConfirm(id: string, pointName: string) {
    confirmAttendance(id);
    addNotification({
      id: generateNotifId(),
      icon: '✅',
      title: 'تأكيد حضور',
      text: `تم تأكيد حضور موعد الجمع في ${pointName}`,
      time: 'الآن', isNew: true, type: 'success',
      role: 'partner',
    });
  }

  function handlePostpone(id: string, pointName: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const day = tomorrow.getDate().toString().padStart(2, '0');
    const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
    const newDate = `${day}/${month}`;
    const newTime = '16:00';

    postponeAttendance({ id, newDate, newTime });
    addNotification({
      id: generateNotifId(),
      icon: '⏰',
      title: 'تأجيل موعد',
      text: `تم تأجيل موعد الجمع في ${pointName} إلى ${newDate} الساعة ${newTime}`,
      time: 'الآن', isNew: true, type: 'warning',
      role: 'partner',
    });
  }

  function handleSaveProfile() {
    updatePartnerProfile({ address: editAddress, phone: editPhone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleRedeem(reward: typeof rewards[number]) {
    redeemReward(reward);
  }

  const centerForMap = { name: 'مركز فرز قسنطينة', address: 'قسنطينة وسط', lat: 36.3650, lng: 6.6147 };

  const levelPoints = [0, 100, 250, 500, 800, 1200, 1800, 2500, 3500, 5000];
  const currentLevel = levelPoints.findIndex((p) => profile.points < p);
  const level = currentLevel === -1 ? levelPoints.length : currentLevel;
  const nextLevelPoints = levelPoints[currentLevel] || levelPoints[levelPoints.length - 1];
  const prevLevelPoints = currentLevel > 0 ? levelPoints[currentLevel - 1] : 0;
  const progress = nextLevelPoints > prevLevelPoints ? ((profile.points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100 : 100;

  if (currentTab === 'dashboard') {
    return (
      <>
        <div className="flex-between" style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '18px', fontWeight: 500 }}>فرد / مؤسسة</div>
          <span className="badge badge-green">مستوى {level}</span>
        </div>
        <div className="hero-card">
          <div className="hero-title">رصيد النقاط</div>
          <div className="hero-val">{profile.points.toLocaleString()}</div>
          <div className="hero-sub">اجمع لأثر يدوم • المواد المعاد تدويرها: {profile.totalRecycled} طن</div>
        </div>
        <div className="card" style={{ padding: '12px 16px' }}>
          <div className="flex-between" style={{ marginBottom: '6px' }}>
            <span className="text-sm">التقدم إلى المستوى {level + 1}</span>
            <span className="text-sm">{profile.points} / {nextLevelPoints} نقاط</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
        {reqSubmitted && (
          <div className="alert success"><Check size={16} /> تم تقديم طلب الجمع بنجاح</div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">طلب جمع جديد</span>
            {!showRequestForm && (
              <button className="btn-sm primary" onClick={() => setShowRequestForm(true)}>
                <Plus size={14} /> طلب جمع
              </button>
            )}
          </div>
          {showRequestForm && (
            <>
              <div className="form-row">
                <div className="form-label">العنوان</div>
                <input className="inp" type="text" style={{ margin: 0 }} value={reqAddress}
                  onChange={(e) => setReqAddress(e.target.value)} placeholder="أدخل عنوان موقع الجمع" />
              </div>
              <div className="form-row">
                <div className="form-label">المواد المراد جمعها</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {materials.filter((m) => allowedMaterials.includes(m.id)).map((m) => (
                    <label key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                      border: `1.5px solid ${reqMaterials.includes(m.id) ? 'var(--green-mid)' : 'var(--border)'}`,
                      borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                      background: reqMaterials.includes(m.id) ? 'var(--green-50)' : '#fff',
                    }}>
                      <input type="checkbox" checked={reqMaterials.includes(m.id)}
                        onChange={() => toggleReqMaterial(m.id)} /> {m.icon} {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">الوزن (كجم)</div>
                  <input className="inp" type="number" style={{ margin: 0 }} value={reqWeight}
                    onChange={(e) => setReqWeight(e.target.value)} placeholder="الوزن" />
                </div>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">عدد القوارير</div>
                  <input className="inp" type="number" style={{ margin: 0 }} value={reqBottles}
                    onChange={(e) => setReqBottles(e.target.value)} placeholder="عدد القوارير" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">التاريخ</div>
                  <input className="inp" type="text" style={{ margin: 0 }} value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)} placeholder="مثال: 15/06" />
                </div>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">الوقت</div>
                  <input className="inp" type="text" style={{ margin: 0 }} value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)} placeholder="مثال: 14:30" />
                </div>
              </div>
              {reqMaterials.length > 0 && (
                <div className="card" style={{ background: 'var(--green-50)', padding: '10px', marginBottom: '10px', border: 'none' }}>
                  <div className="text-sm" style={{ fontWeight: 500 }}>النقاط المتوقعة:</div>
                  {reqMaterials.map((mat) => {
                    const weight = parseInt(reqWeight) || 0;
                    const bottles = parseInt(reqBottles) || 0;
                    const pts = calcPoints(mat, weight / Math.max(reqMaterials.length, 1), bottles / Math.max(reqMaterials.length, 1));
                    const matName = materials.find((m) => m.id === mat)?.name ?? mat;
                    return <div key={mat} className="text-sm" style={{ marginTop: '2px' }}>+{pts} نقطة ({matName})</div>;
                  })}
                </div>
              )}
              <div className="btn-row">
                <button className="btn-sm primary" onClick={handleRequestCollection}>
                  <Check size={14} /> تأكيد الطلب
                </button>
                <button className="btn-sm" onClick={() => { setShowRequestForm(false); setReqMaterials([]); }}>
                  <X size={14} /> إلغاء
                </button>
              </div>
            </>
          )}
        </div>

        <div className="stats">
          <div className="stat-card">
            <div className="stat-val">{profile.points}</div>
            <div className="stat-label">نقاط المكافأة</div>
            <div className="stat-change">↑ {pointsHistory.filter((p) => p.type === 'earned').slice(0, 3).reduce((s, p) => s + p.points, 0)} هذا الأسبوع</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{profile.totalRecycled} طن</div>
            <div className="stat-label">إجمالي التدوير</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{Math.round(profile.co2Saved * 100)} كجم</div>
            <div className="stat-label">CO₂ مخفض</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">مستوى {level}</div>
            <div className="stat-label">درجة المشاركة</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>الأثر البيئي</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {impactItems.map((item, i) => (
              <div className="stat-card" style={{ textAlign: 'center', padding: '12px' }} key={i}>
                <div style={{ fontSize: '22px', color: 'var(--green-mid)', marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--green-mid)' }}>{item.val}</div>
                <div className="text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: '10px' }}>مواعيد الجمع القادمة</div>
          {pendingSchedules.length === 0 ? (
            <div className="text-sm" style={{ textAlign: 'center', padding: '16px' }}>
              لا توجد مواعيد جمع مجدولة حالياً
            </div>
          ) : (
            pendingSchedules.map((sch) => {
              const st = statusLabels[sch.status] || statusLabels.pending;
              return (
                <div className="card" style={{ marginBottom: '10px', padding: '12px' }} key={sch.id}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>{sch.pointName}</div>
                      <div className="text-sm" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {sch.scheduledDate}
                        <Clock size={14} style={{ marginRight: '8px' }} /> {sch.scheduledTime}
                      </div>
                    </div>
                    <span className={`badge ${st.badge}`}>{st.label}</span>
                  </div>
                  <div className="btn-row" style={{ marginTop: '8px' }}>
                    <button className="btn-sm primary" onClick={() => handleConfirm(sch.id, sch.pointName)}>
                      <Check size={14} /> تأكيد الحضور
                    </button>
                    <button className="btn-sm" onClick={() => handlePostpone(sch.id, sch.pointName)}>
                      <X size={14} /> تأجيل
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {mySchedules.filter((s) => s.status === 'confirmed' || s.status === 'completed').length > 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: '10px' }}>تاريخ المواعيد</div>
            {mySchedules.filter((s) => s.status === 'confirmed' || s.status === 'completed').map((sch) => {
              const st = statusLabels[sch.status] || statusLabels.pending;
              return (
                <div className="order-row" key={sch.id}>
                  <div className="order-info">
                    <div className="order-title">{sch.pointName}</div>
                    <div className="order-sub">{sch.scheduledDate} — {sch.scheduledTime}</div>
                  </div>
                  <span className={`badge ${st.badge}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'impact') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الأثر البيئي</div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: '14px' }}>مساهمتك البيئية</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {impactItems.map((item, i) => (
              <div className="stat-card" style={{ textAlign: 'center' }} key={i}>
                <div style={{ fontSize: '28px', color: 'var(--green-mid)' }}>{item.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--green-mid)' }}>{item.val}</div>
                <div className="text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <Chart />
      </>
    );
  }

  if (currentTab === 'map') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>خريطة المواقع</div>
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
          <div className="card-title" style={{ marginBottom: '10px' }}>تتبع الشاحنات</div>
          {trucks.map((truck, i) => (
            <div className="order-row" key={truck.id}>
              <div className="order-avatar" style={{ background: '#fff3e0', color: 'var(--orange)' }}>
                🚛
              </div>
              <div className="order-info">
                <div className="order-title">شاحنة {i + 1}</div>
                <div className="order-sub">{truck.name}</div>
              </div>
              <span className={`badge ${truck.status === 'loading' ? 'badge-orange' : truck.status === 'en_route' ? 'badge-blue' : 'badge-green'}`}>
                {truck.status === 'loading' ? 'تحميل' : truck.status === 'en_route' ? 'في الطريق' : 'تم التسليم'}
              </span>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (currentTab === 'rewards') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>المكافآت والنقاط</div>
        <div className="hero-card" style={{ background: 'linear-gradient(135deg,#e07b2a 0%,#f5a855 50%,#ffc107 100%)' }}>
          <div className="hero-title">رصيد النقاط الحالي</div>
          <div className="hero-val">{profile.points.toLocaleString()}</div>
          <div className="hero-sub">استبدل نقاطك بمكافآت رائعة</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><Gift size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />المكافآت المتاحة</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {rewards.map((reward) => (
              <div className="stat-card" style={{ textAlign: 'center', padding: '12px' }} key={reward.id}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>
                  <Gift size={24} style={{ color: 'var(--orange)' }} />
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{reward.name}</div>
                <div className="text-sm" style={{ margin: '4px 0' }}>{reward.storeName}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--orange)', marginBottom: '8px' }}>
                  {reward.pointsCost} نقطة
                </div>
                <button
                  className={`btn-sm ${profile.points >= reward.pointsCost ? 'primary' : ''}`}
                  style={{ width: '100%', fontSize: '11px' }}
                  disabled={profile.points < reward.pointsCost}
                  onClick={() => handleRedeem(reward)}
                >
                  {profile.points >= reward.pointsCost ? 'استبدال' : 'نقاط غير كافية'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><History size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />سجل النقاط</span>
          </div>
          {pointsHistory.slice(0, 10).map((ph) => (
            <div className="order-row" key={ph.id}>
              <div className="order-avatar" style={{
                background: ph.type === 'earned' ? 'var(--green-50)' : 'var(--orange-bg)',
                color: ph.type === 'earned' ? 'var(--green-mid)' : 'var(--orange)'
              }}>
                {ph.type === 'earned' ? '+' : '-'}
              </div>
              <div className="order-info">
                <div className="order-title">{ph.reason}</div>
                <div className="order-sub">{ph.date}</div>
              </div>
              <div style={{
                fontSize: '14px', fontWeight: 600,
                color: ph.type === 'earned' ? 'var(--green-mid)' : 'var(--orange)'
              }}>
                {ph.type === 'earned' ? '+' : '-'}{ph.points}
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title"><Store size={16} style={{ verticalAlign: 'middle', marginLeft: '6px' }} />متاجر التوفير الخضراء</span>
          </div>
          {greenPartnerStores.map((store) => (
            <div className="order-row" key={store.id}>
              <div className="order-avatar" style={{ color: 'var(--green-mid)' }}>
                <Store size={18} />
              </div>
              <div className="order-info">
                <div className="order-title">{store.name}</div>
                <div className="order-sub">{store.address}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {store.offers.map((offer, i) => (
                    <span className="tag" key={i} style={{ fontSize: '10px' }}>{offer}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (currentTab === 'profile') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الملف الشخصي</div>
        {saved && (
          <div className="alert success"><Check size={16} /> تم حفظ التعديلات بنجاح</div>
        )}
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 500, margin: '0 auto 12px' }}>
            <Star size={28} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.name}</div>
          <div className="text-sm" style={{ marginTop: '4px' }}>{profile.address}</div>
          <div style={{ marginTop: '12px' }}><span className="badge badge-green">مستوى {level} — مشارك نشط</span></div>
        </div>
        <div className="card">
          <div className="form-row">
            <div className="form-label">العنوان</div>
            <input className="inp" value={editAddress} style={{ margin: 0 }} onChange={(e) => setEditAddress(e.target.value)} />
          </div>
          <div className="form-row" style={{ marginTop: '10px' }}>
            <div className="form-label">الهاتف</div>
            <input className="inp" value={editPhone} style={{ margin: 0 }} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <div className="btn-row">
            <button className="btn-sm primary" style={{ flex: 1 }} onClick={handleSaveProfile}>
              <Check size={16} /> حفظ التعديلات
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}
