'use client';

import { useState, useCallback } from 'react';
import type { Role } from '../lib/types';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

const roleOptions: { id: Role; label: string }[] = [
  { id: 'partner', label: 'فرد / مؤسسة' },
  { id: 'collector', label: 'جامع' },
  { id: 'sorter', label: 'مركز الفرز' },
  { id: 'factory', label: 'مصنع التدوير' },
  { id: 'admin', label: 'الإدارة' },
];

const roleEmailMap: Record<Role, string> = {
  partner: 'provider@cercly.dz',
  collector: 'collector@cercly.dz',
  sorter: 'sorting@cercly.dz',
  factory: 'recycling@cercly.dz',
  admin: 'admin@cercly.dz',
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<Role>('partner');
  const [email, setEmail] = useState(roleEmailMap[selectedRole]);
  const [password, setPassword] = useState('123456');

  const selectRole = useCallback((role: Role) => {
    setSelectedRole(role);
    setEmail(roleEmailMap[role]);
    setPassword('123456');
  }, []);

  const handleLogin = useCallback(() => {
    onLogin(selectedRole);
  }, [onLogin, selectedRole]);

  return (
    <div className="screen active" id="screen-login">
      <div className="login-wrap">
        <div className="login-bg-deco">
          <span style={{ top: '10%', left: '5%' }}>♻</span>
          <span style={{ top: '40%', right: '8%', fontSize: '60px' }}>♻</span>
          <span style={{ bottom: '20%', left: '15%', fontSize: '50px' }}>♻</span>
          <span style={{ top: '60%', right: '5%' }}>♻</span>
        </div>

        <div className="login-header">
          <div className="login-logo">♻</div>
          <div className="login-name">CERCLY</div>
          <div className="login-slogan">اجمع لأثر يدوم</div>

        </div>

        <div className="login-card">
          <div className="login-card-title">تسجيل الدخول</div>

          <div className="login-field">
            <label>البريد الإلكتروني</label>
            <input
              className="login-inp"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
          </div>

          <div className="login-field">
            <label>كلمة المرور</label>
            <input
              className="login-inp"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="login-role-selector">
            {roleOptions.map((r) => (
              <button
                key={r.id}
                className={`login-role-pill${selectedRole === r.id ? ' active' : ''}`}
                onClick={() => selectRole(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button className="login-btn" onClick={handleLogin}>
            تسجيل الدخول
          </button>
        </div>



        <div className="login-footer">
          <div className="login-footer-text">♻ إعادة التدوير تبدأ بخطوة صغيرة</div>
          <div className="login-footer-copy">CERCLY © 2026</div>
        </div>
      </div>
    </div>
  );
}
