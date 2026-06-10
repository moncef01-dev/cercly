'use client';

import { useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Tab, MaterialType } from '../lib/types';
import Chart from './Chart';
import { Check, X, Calendar, Clock, Plus, MapPin } from 'lucide-react';

interface PartnerViewsProps {
  currentTab: Tab;
}

export default function PartnerViews({ currentTab }: PartnerViewsProps) {
  const profile = useStore((s) => s.partnerProfile);
  const updatePartnerProfile = useStore((s) => s.updatePartnerProfile);
  const addNotification = useStore((s) => s.addNotification);
  const schedules = useStore((s) => s.schedules);
  const confirmAttendance = useStore((s) => s.confirmAttendance);
  const postponeAttendance = useStore((s) => s.postponeAttendance);

  const [editAddress, setEditAddress] = useState(profile.address);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [saved, setSaved] = useState(false);

  const materials = useStore((s) => s.materials);
  const collectionPoints = useStore((s) => s.collectionPoints);
  const addCollectionPoint = useStore((s) => s.addCollectionPoint);
  const addSchedule = useStore((s) => s.addSchedule);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqAddress, setReqAddress] = useState('');
  const [reqMaterials, setReqMaterials] = useState<MaterialType[]>([]);
  const [reqDate, setReqDate] = useState('');
  const [reqTime, setReqTime] = useState('10:00');
  const [reqSubmitted, setReqSubmitted] = useState(false);

  function handleRequestCollection() {
    if (!reqAddress.trim() || reqMaterials.length === 0 || !reqDate) return;

    const pointId = `p-${Date.now()}`;
    addCollectionPoint({
      id: pointId,
      name: reqAddress.trim(),
      address: reqAddress.trim(),
      lat: 36.3500 + Math.random() * 0.02,
      lng: 6.6200 + Math.random() * 0.02,
      materials: reqMaterials,
      status: 'upcoming',
      order: collectionPoints.length + 1,
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
    });

    addNotification({
      id: `n-req-${Date.now()}`,
      text: `تم تقديم طلب جمع جديد — ${reqAddress.trim()}`,
      time: 'الآن', isNew: true, type: 'info',
    });

    setReqSubmitted(true);
    setShowRequestForm(false);
    setReqAddress('');
    setReqMaterials([]);
    setReqDate('');
    setReqTime('10:00');
    setTimeout(() => setReqSubmitted(false), 3000);
  }

  function toggleReqMaterial(mat: MaterialType) {
    setReqMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat],
    );
  }

  const impactItems = useMemo(() => [
    { icon: '🌳', label: 'أشجار محمية', val: Math.round(profile.totalRecycled * 10).toString() },
    { icon: '💧', label: 'مياه موفرة', val: `${(profile.totalRecycled * 228).toLocaleString()} ل` },
    { icon: '⚡', label: 'طاقة موفرة', val: `${Math.round(profile.totalRecycled * 48)} كواط` },
    { icon: '🌍', label: 'CO₂ مخفض', val: `${profile.co2Saved} طن` },
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
      id: `n-confirm-${Date.now()}`,
      text: `تم تأكيد حضور موعد الجمع — ${pointName}`,
      time: 'الآن', isNew: true, type: 'info',
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
      id: `n-postpone-${Date.now()}`,
      text: `تم تأجيل موعد الجمع في ${pointName} إلى ${newDate} الساعة ${newTime}`,
      time: 'الآن', isNew: true, type: 'warning',
    });
  }

  function handleSaveProfile() {
    updatePartnerProfile({ address: editAddress, phone: editPhone });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (currentTab === 'dashboard') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>شركاء CERCLY</div>
        <div className="hero-card">
          <div className="hero-title">المواد المعاد تدويرها منذ الانضمام</div>
          <div className="hero-val">{profile.totalRecycled} طن</div>
          <div className="hero-sub">عدد العمليات: {profile.operations} • هذا الشهر: 2.4 طن</div>
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
                  {materials.map((m) => (
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
            <div className="stat-change">↑ 45 هذا الأسبوع</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{profile.totalRecycled} طن</div>
            <div className="stat-label">إجمالي التدوير</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">{profile.co2Saved} طن</div>
            <div className="stat-label">CO₂ موفر</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">مستوى {profile.level}</div>
            <div className="stat-label">درجة المشاركة</div>
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
                <div style={{ fontSize: '28px' }}>{item.icon}</div>
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

  if (currentTab === 'reports') {
    return <Chart />;
  }

  if (currentTab === 'profile') {
    return (
      <>
        <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '14px' }}>الملف الشخصي</div>
        {saved && (
          <div className="alert success"><Check size={16} /> تم حفظ التعديلات بنجاح</div>
        )}
        <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--green-50)', color: 'var(--green-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 500, margin: '0 auto 12px' }}>أح</div>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>{profile.name}</div>
          <div className="text-sm" style={{ marginTop: '4px' }}>{profile.address}</div>
          <div style={{ marginTop: '12px' }}><span className="badge badge-green">مستوى {profile.level} — مشارك نشط</span></div>
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
