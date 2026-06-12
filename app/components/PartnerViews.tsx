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

const allowedMaterials: MaterialType[] = ['plastic', 'carton', 'battery', 'printer_cartridge'];

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  function handleRequestCollection() {
    if (!reqAddress.trim() || reqMaterials.length === 0 || !reqDate) return;
    setIsSubmitting(true);

    setTimeout(() => {
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
      setIsSubmitting(false);
      setTimeout(() => setReqSubmitted(false), 3000);
    }, 1000);
  }

  function toggleReqMaterial(mat: MaterialType) {
    setReqMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat],
    );
  }

  // Enforce the exact environmental impact cards order
  const impactItems = useMemo(() => [
    { icon: "🌳", label: 'أشجار محمية', val: `${profile.treesProtected}` },
    { icon: "💧", label: 'مياه موفرة', val: `${(profile.waterSaved).toLocaleString()} ل` },
    { icon: "☁️", label: 'انبعاثات CO₂ المخفضة', val: `${Math.round(profile.co2Saved * 100)} كجم` },
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
    completed: { label: '✓ مكتمل', badge: 'badge-gold' },
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
    setIsSavingProfile(true);
    setTimeout(() => {
      updatePartnerProfile({ address: editAddress, phone: editPhone });
      setSaved(true);
      setIsSavingProfile(false);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  }

  function handleRedeem(reward: typeof rewards[number]) {
    setIsRedeeming(reward.id);
    setTimeout(() => {
      redeemReward(reward);
      setIsRedeeming(null);
    }, 1000);
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
        {/* 1. Header is rendered by AppShell */}

        {/* 2. Hero Summary Card (Points) - Radius 28px */}
        <div className="hero-card gold-card">
          <div className="hero-title">رصيد النقاط الحالي</div>
          <div className="hero-val">{profile.points.toLocaleString()} نقطة</div>
          <div className="hero-sub">اجمع لأثر يدوم • مستوى {level}</div>
        </div>

        {/* Level Progression Progress Bar Card */}
        <div className="card">
          <div className="flex-between">
            <span className="text-sm">التقدم إلى المستوى {level + 1}</span>
            <span className="text-sm" style={{ fontWeight: 600 }}>{profile.points} / {nextLevelPoints} نقطة</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>

        {/* 3. KPI Cards - 2-column grid, equal size, centered metrics, values converted to KG */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-metric">{profile.points}</div>
            <div className="kpi-label">نقطة مكافأة</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{Math.round(profile.totalRecycled * 1000).toLocaleString()}</div>
            <div className="kpi-label">كجم مجمع</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{Math.round(profile.co2Saved * 100)}</div>
            <div className="kpi-label">كجم CO₂ مخفض</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-metric">{profile.treesProtected}</div>
            <div className="kpi-label">شجرة محمية</div>
          </div>
        </div>

        {/* Success States */}
        {reqSubmitted && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span>تمت العملية بنجاح - تم تقديم طلب الجمع بنجاح</span>
          </div>
        )}

        {/* 4. Primary Actions - Create Request Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">طلب جمع جديد</span>
            {!showRequestForm && (
              <button className="btn-primary" style={{ minHeight: '40px', padding: '6px 14px', borderRadius: '12px' }} onClick={() => setShowRequestForm(true)}>
                <Plus size={14} /> طلب جمع
              </button>
            )}
          </div>
          {showRequestForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-row">
                <div className="form-label">العنوان</div>
                <input className="inp" type="text" value={reqAddress}
                  onChange={(e) => setReqAddress(e.target.value)} placeholder="أدخل عنوان موقع الجمع" />
              </div>
              <div className="form-row">
                <div className="form-label">المواد المراد جمعها</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                  {materials.filter((m) => allowedMaterials.includes(m.id)).map((m) => (
                    <label key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                      border: `1.5px solid ${reqMaterials.includes(m.id) ? 'var(--primary-green)' : 'var(--border)'}`,
                      borderRadius: '12px', cursor: 'pointer', fontSize: '13px',
                      background: reqMaterials.includes(m.id) ? 'var(--light-green)' : '#fff',
                      color: 'var(--text-dark)'
                    }}>
                      <input type="checkbox" checked={reqMaterials.includes(m.id)}
                        onChange={() => toggleReqMaterial(m.id)} /> {m.icon} {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">الوزن (كجم)</div>
                  <input className="inp" type="number" value={reqWeight}
                    onChange={(e) => setReqWeight(e.target.value)} placeholder="الوزن" />
                </div>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">عدد القوارير</div>
                  <input className="inp" type="number" value={reqBottles}
                    onChange={(e) => setReqBottles(e.target.value)} placeholder="عدد القوارير" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">التاريخ</div>
                  <input className="inp" type="text" value={reqDate}
                    onChange={(e) => setReqDate(e.target.value)} placeholder="مثال: 15/06" />
                </div>
                <div className="form-row" style={{ flex: 1 }}>
                  <div className="form-label">الوقت</div>
                  <input className="inp" type="text" value={reqTime}
                    onChange={(e) => setReqTime(e.target.value)} placeholder="مثال: 14:30" />
                </div>
              </div>
              {reqMaterials.length > 0 && (
                <div className="card" style={{ background: 'var(--light-green)', padding: '12px', border: 'none', gap: '4px' }}>
                  <div className="text-sm" style={{ fontWeight: 700, color: 'var(--primary-green)' }}>النقاط المتوقعة:</div>
                  {reqMaterials.map((mat) => {
                    const weight = parseInt(reqWeight) || 0;
                    const bottles = parseInt(reqBottles) || 0;
                    const pts = calcPoints(mat, weight / Math.max(reqMaterials.length, 1), bottles / Math.max(reqMaterials.length, 1));
                    const matName = materials.find((m) => m.id === mat)?.name ?? mat;
                    return <div key={mat} className="text-sm" style={{ color: 'var(--text-dark)', fontWeight: 600 }}>+{pts} نقطة ({matName})</div>;
                  })}
                </div>
              )}
              <div className="btn-row">
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleRequestCollection} disabled={isSubmitting}>
                  {isSubmitting ? 'جارٍ المعالجة...' : 'تأكيد الطلب'}
                </button>
                <button className="btn-secondary" onClick={() => { setShowRequestForm(false); setReqMaterials([]); }} disabled={isSubmitting}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Main Content - Environmental Impact section in correct order */}
        <div className="card">
          <div className="card-title">الأثر البيئي</div>
          <div className="impact-grid">
            {impactItems.map((item, i) => (
              <div className="impact-card" key={i}>
                <span className="impact-icon">{item.icon}</span>
                <span className="impact-val">{item.val}</span>
                <span className="impact-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Recent Activity - Upcoming Appointments */}
        <div className="card">
          <div className="card-title">مواعيد الجمع القادمة</div>
          {pendingSchedules.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" style={{ fontSize: '32px' }}>⏳</span>
              <div className="empty-title">لا توجد مواعيد حالياً</div>
              <div className="empty-desc">قم بإنشاء طلب جديد للبدء</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {pendingSchedules.map((sch) => {
                const st = statusLabels[sch.status] || statusLabels.pending;
                return (
                  <div className="card" style={{ padding: '14px', border: '1px solid var(--surface)' }} key={sch.id}>
                    <div className="flex-between" style={{ marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{sch.pointName}</div>
                        <div className="text-sm" style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> <span>{sch.scheduledDate}</span>
                          <Clock size={14} style={{ marginRight: '8px' }} /> <span>{sch.scheduledTime}</span>
                        </div>
                      </div>
                      <span className={`badge ${st.badge}`}>{st.label}</span>
                    </div>
                    <div className="btn-row">
                      <button className="btn-primary" style={{ minHeight: '44px', borderRadius: '12px', flex: 1 }} onClick={() => handleConfirm(sch.id, sch.pointName)}>
                        <Check size={14} /> تأكيد الحضور
                      </button>
                      <button className="btn-secondary" style={{ minHeight: '44px', borderRadius: '12px' }} onClick={() => handlePostpone(sch.id, sch.pointName)}>
                        تأجيل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* History Area */}
        {mySchedules.filter((s) => s.status === 'confirmed' || s.status === 'completed').length > 0 && (
          <div className="card">
            <div className="card-title">سجل المواعيد</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
          </div>
        )}
      </>
    );
  }

  if (currentTab === 'impact') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>الأثر البيئي</div>
        <div className="card">
          <div className="card-title">مساهمتك البيئية الإجمالية</div>
          <div className="impact-grid">
            {impactItems.map((item, i) => (
              <div className="impact-card" key={i}>
                <span className="impact-icon">{item.icon}</span>
                <span className="impact-val">{item.val}</span>
                <span className="impact-label">{item.label}</span>
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
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>خريطة المواقع</div>
        <div className="card" style={{ padding: '8px' }}>
          <Suspense fallback={
            <div style={{ height: '320px', borderRadius: 'var(--radius-card)', background: 'linear-gradient(90deg, #EBE8E0 25%, #F5F3EE 50%, #EBE8E0 75%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontSize: '13px' }}>
              جاري تحميل خريطة المواقع...
            </div>
          }>
            <PartnerMapView companies={recyclingCompanies} trucks={trucks} center={centerForMap} />
          </Suspense>
        </div>
        <div className="card">
          <div className="card-title">تتبع الدراجات</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {trucks.map((truck, i) => (
              <div className="order-row" key={truck.id}>
                <div className="order-avatar" style={{ background: '#FFFDF6', color: 'var(--gold)' }}>
                  🚲
                </div>
                <div className="order-info">
                  <div className="order-title">دراجة {i + 1}</div>
                  <div className="order-sub">{truck.name}</div>
                </div>
                <span className={`badge ${truck.status === 'loading' ? 'badge-orange' : truck.status === 'en_route' ? 'badge-blue' : 'badge-green'}`}>
                  {truck.status === 'loading' ? 'تحميل' : truck.status === 'en_route' ? 'في الطريق' : 'تم التسليم'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'rewards') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>المكافآت والنقاط</div>
        
        {/* Gold Summary Hero Card */}
        <div className="hero-card gold-card">
          <div className="hero-title">رصيد النقاط الحالي</div>
          <div className="hero-val">{profile.points.toLocaleString()} نقطة</div>
          <div className="hero-sub">استبدل نقاطك بمكافآت بيئية رائعة</div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={16} style={{ color: 'var(--gold)' }} />
              المكافآت المتاحة
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {rewards.map((reward) => (
              <div className="kpi-card" style={{ padding: '16px 12px', gap: '6px' }} key={reward.id}>
                <span style={{ fontSize: '26px' }}>🎁</span>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{reward.name}</div>
                <div className="text-sm" style={{ opacity: 0.8 }}>{reward.storeName}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold)' }}>
                  {reward.pointsCost} نقطة
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', minHeight: '38px', borderRadius: '12px', fontSize: '11px', padding: '4px' }}
                  disabled={profile.points < reward.pointsCost || isRedeeming !== null}
                  onClick={() => handleRedeem(reward)}
                >
                  {isRedeeming === reward.id ? 'جارٍ الاستبدال...' : profile.points >= reward.pointsCost ? 'استبدال' : 'نقاط غير كافية'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={16} style={{ color: 'var(--gold)' }} />
              سجل العمليات
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {pointsHistory.slice(0, 10).map((ph) => (
              <div className="order-row" key={ph.id}>
                <div className="order-avatar" style={{
                  background: ph.type === 'earned' ? 'var(--light-green)' : '#FFFDF6',
                  color: ph.type === 'earned' ? 'var(--primary-green)' : 'var(--gold)'
                }}>
                  {ph.type === 'earned' ? '+' : '-'}
                </div>
                <div className="order-info">
                  <div className="order-title">{ph.reason}</div>
                  <div className="order-sub">{ph.date}</div>
                </div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: ph.type === 'earned' ? 'var(--primary-green)' : 'var(--gold)'
                }}>
                  {ph.type === 'earned' ? '+' : '-'}{ph.points}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={16} style={{ color: 'var(--primary-green)' }} />
              شركاء الأثر الأخضر
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {greenPartnerStores.map((store) => (
              <div className="order-row" key={store.id}>
                <div className="order-avatar" style={{ color: 'var(--primary-green)', background: 'var(--light-green)' }}>
                  <Store size={18} />
                </div>
                <div className="order-info">
                  <div className="order-title">{store.name}</div>
                  <div className="order-sub">{store.address} • {store.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {store.offers.map((offer, i) => (
                      <span className="tag" key={i} style={{ fontSize: '10px' }}>{offer}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (currentTab === 'profile') {
    return (
      <>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>الملف الشخصي</div>
        {saved && (
          <div className="success-banner">
            <span className="success-icon">✓</span>
            <span>تمت العملية بنجاح - تم حفظ التعديلات بنجاح</span>
          </div>
        )}
        <div className="card" style={{ textAlign: 'center', padding: '24px', alignItems: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--light-green)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}>
            <Star size={28} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>{profile.name}</div>
          <div className="text-sm" style={{ marginTop: '2px' }}>{profile.address}</div>
          <div style={{ marginTop: '6px' }}><span className="badge badge-green">مستوى {level} — مشارك نشط</span></div>
        </div>
        <div className="card">
          <div className="form-row">
            <div className="form-label">العنوان</div>
            <input className="inp" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-label">الهاتف</div>
            <input className="inp" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
          </div>
          <div className="btn-row" style={{ marginTop: '6px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? 'جارٍ الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      </>
    );
  }

  return null;
}
