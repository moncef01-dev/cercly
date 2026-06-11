'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentType } from 'react';
import type { Tab } from '../lib/types';
import { useStore } from '../lib/store';
import NotifPanel from './NotifPanel';
import SorterViews from './SorterViews';
import CollectorViews from './CollectorViews';
import FactoryViews from './FactoryViews';
import PartnerViews from './PartnerViews';
import AdminViews from './AdminViews';
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  Layers,
  Package,
  BarChart3,
  Map,
  Truck,
  History,
  Eye,
  Receipt,
  Leaf,
  User,
  Users,
  Settings,
  Gift,
  FileText,
  LogOut,
} from 'lucide-react';

interface AppShellProps {
  currentTab: Tab;
  onSetTab: (tab: Tab) => void;
}

interface NavItem {
  id: Tab;
  icon: ComponentType<{ size?: number }>;
  label: string;
}

const navConfig: Record<string, NavItem[]> = {
  sorter: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'quantities', icon: Layers, label: 'الكميات' },
    { id: 'inventory', icon: Package, label: 'المخزون' },
    { id: 'reports', icon: BarChart3, label: 'التقارير' },
  ],
  collector: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'routes', icon: Map, label: 'الخريطة' },
    { id: 'collection', icon: Truck, label: 'الجمع' },
    { id: 'history', icon: History, label: 'السجل' },
  ],
  factory: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'available', icon: Eye, label: 'المتاح' },
    { id: 'orders', icon: Receipt, label: 'الطلبات' },
    { id: 'shipments', icon: Package, label: 'الشحنات' },
    { id: 'invoices', icon: FileText, label: 'الفواتير' },
  ],
  partner: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'impact', icon: Leaf, label: 'الأثر' },
    { id: 'map', icon: Map, label: 'الخريطة' },
    { id: 'rewards', icon: Gift, label: 'المكافآت' },
    { id: 'profile', icon: User, label: 'الحساب' },
  ],
  admin: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'users', icon: Users, label: 'المستخدمون' },
    { id: 'operations', icon: Settings, label: 'العمليات' },
    { id: 'reports', icon: BarChart3, label: 'التقارير' },
  ],
};

const roles = ['sorter', 'collector', 'factory', 'partner', 'admin'] as const;

export default function AppShell({ currentTab, onSetTab }: AppShellProps) {
  const currentRole = useStore((s) => s.session.currentRole);
  const config = useStore((s) => s.config);
  const switchRole = useStore((s) => s.switchRole);
  const logout = useStore((s) => s.logout);
  const notifications = useStore((s) => s.notifications);

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: MouseEvent) => {
    if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
      const target = e.target as HTMLElement;
      if (!target.closest('.notif-btn')) {
        setNotifOpen(false);
      }
    }
    if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
      setRoleOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [handleClick]);

  useEffect(() => {
    setIsTabLoading(true);
    const timer = setTimeout(() => setIsTabLoading(false), 600);
    return () => clearTimeout(timer);
  }, [currentRole, currentTab]);

  const navItems = navConfig[currentRole] || navConfig.sorter;
  const unreadCount = notifications.filter((n) => n.isNew && n.role === currentRole).length;

  // Render standardized placeholder skeleton while transitioning
  function renderSkeleton() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-section)' }}>
        {/* Shimmer Title */}
        <div className="shimmer skeleton-title" style={{ height: '28px', width: '160px' }}></div>
        
        {/* Shimmer Hero Card */}
        <div className="shimmer" style={{ height: '140px', borderRadius: 'var(--radius-hero)', width: '100%' }}></div>
        
        {/* Shimmer KPI Grid */}
        <div className="kpi-grid">
          <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--radius-card)' }}></div>
          <div className="shimmer" style={{ height: '110px', borderRadius: 'var(--radius-card)' }}></div>
        </div>

        {/* Shimmer List Cards */}
        <div className="skeleton-card">
          <div className="shimmer skeleton-title" style={{ height: '16px', width: '60%' }}></div>
          <div className="shimmer skeleton-body" style={{ height: '14px', width: '90%' }}></div>
          <div className="shimmer skeleton-body-short" style={{ height: '14px', width: '40%' }}></div>
        </div>
      </div>
    );
  }

  function renderViews() {
    switch (currentRole) {
      case 'sorter':
        return <SorterViews currentTab={currentTab} onSetTab={onSetTab} />;
      case 'collector':
        return <CollectorViews currentTab={currentTab} onSetTab={onSetTab} />;
      case 'factory':
        return <FactoryViews currentTab={currentTab} onSetTab={onSetTab} />;
      case 'partner':
        return <PartnerViews currentTab={currentTab} />;
      case 'admin':
        return <AdminViews currentTab={currentTab} />;
      default:
        return null;
    }
  }

  // Override role names to display standard labels locally in the avatar if needed
  const displayRoleAvatars: Record<string, string> = {
    sorter: "فر",
    collector: "جم",
    factory: "دو",
    partner: "فر", // Standardized to 'فر' (فرد/مؤسسة) instead of 'شر'
    admin: "إد",
  };

  return (
    <div className="screen active" id="screen-app">
      <div className="app-shell">
        <div className="topbar">
          <div className="topbar-inner">
            <div className="topbar-right">
              <div className="role-wrap" ref={roleRef}>
                <div className="user-chip" onClick={() => setRoleOpen((p) => !p)}>
                  <div className="avatar">{displayRoleAvatars[currentRole] || config.roleAvatars[currentRole]}</div>
                  <span>{config.roleNames[currentRole]}</span>
                  <ChevronDown size={12} />
                </div>
                {roleOpen && (
                  <div className="role-dropdown">
                    <div className="role-dropdown-header">تغيير الدور</div>
                    {roles.map((r) => (
                      <button
                        key={r}
                        className={`role-option${r === currentRole ? ' active' : ''}`}
                        onClick={() => { switchRole(r); setRoleOpen(false); }}
                      >
                        <div className="avatar-sm">{displayRoleAvatars[r] || config.roleAvatars[r]}</div>
                        <span>{config.roleNames[r]}</span>
                        {r === currentRole && <span className="role-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--gold)',
                    color: 'var(--black)',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--primary-green)',
                    zIndex: 2,
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              <button className="notif-btn" onClick={() => logout()} title="تسجيل الخروج">
                <LogOut size={16} />
              </button>
            </div>
            <div>
              <div className="topbar-logo">
                <span style={{ fontSize: '24px', verticalAlign: 'middle' }}>♻</span>
                <span style={{ verticalAlign: 'middle', marginRight: '6px' }}>CERCLY</span>
              </div>
              <div className="topbar-slogan">اجمع لأثر يدوم</div>
            </div>
          </div>
        </div>

        <div className="content" id="main-content">
          {isTabLoading ? renderSkeleton() : renderViews()}
        </div>

        <nav className="bottom-nav" id="bottom-nav">
          <div className="bottom-nav-inner">
            {navItems.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  className={`nav-item${currentTab === n.id ? ' active' : ''}`}
                  onClick={() => onSetTab(n.id)}
                >
                  <Icon size={22} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div ref={notifRef}>
        <NotifPanel isOpen={notifOpen} currentRole={currentRole} />
      </div>
    </div>
  );
}
