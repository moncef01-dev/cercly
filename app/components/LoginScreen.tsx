'use client';

import { useState } from 'react';
import type { Role } from '../lib/types';
import { useStore } from '../lib/store';
import { Truck, Filter, Factory, Users } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

const roleEntries: { id: Role; icon: React.ReactNode; label: string }[] = [
  { id: 'collector', icon: <Truck size={24} />, label: 'فرق الجمع' },
  { id: 'sorter', icon: <Filter size={24} />, label: 'مراكز الفرز' },
  { id: 'factory', icon: <Factory size={24} />, label: 'المصانع' },
  { id: 'partner', icon: <Users size={24} />, label: 'الشركاء' },
];

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const config = useStore((s) => s.config);
  const [selectedRole, setSelectedRole] = useState<Role>('sorter');

  return (
    <div className="screen active" id="screen-login">
      <div className="login-wrap">
        <div className="login-logo">♻ CERCLY</div>
        <div className="login-sub">منصة إدارة جمع وإعادة تدوير النفايات</div>
        <div className="login-card">
          <h2>مرحباً بك</h2>
          <p>اختر نوع حسابك لتسجيل الدخول</p>
          <div className="role-grid">
            {roleEntries.map((r) => (
              <div
                key={r.id}
                className={`role-btn${selectedRole === r.id ? ' sel' : ''}`}
                onClick={() => setSelectedRole(r.id)}
              >
                {r.icon}
                <span>{config.roleNames[r.id]}</span>
              </div>
            ))}
          </div>
          <input className="inp" placeholder="البريد الإلكتروني" type="email" defaultValue="ahmed@cercy.dz" />
          <input className="inp" placeholder="كلمة المرور" type="password" defaultValue="••••••••" />
          <button className="btn-primary" onClick={() => onLogin(selectedRole)}>
            تسجيل الدخول ←
          </button>
          <div className="text-center mt-3" style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--text-3)' }}>
            ليس لديك حساب؟
            <span style={{ color: 'var(--green-mid)', cursor: 'pointer' }}>إنشاء حساب جديد</span>
          </div>
        </div>
      </div>
    </div>
  );
}
