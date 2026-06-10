'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ComponentType } from 'react';
import type { Tab, Role } from '../lib/types';
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
  ],
  partner: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'الرئيسية' },
    { id: 'impact', icon: Leaf, label: 'الأثر' },
    { id: 'reports', icon: BarChart3, label: 'التقارير' },
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

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
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

  const navItems = navConfig[currentRole] || navConfig.sorter;

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

  return (
    <div className="screen active" id="screen-app">
      <div className="app-shell">
        <div className="topbar">
          <div className="topbar-inner">
            <div className="topbar-logo">♻ CERCLY</div>
            <div className="topbar-right">
              <button className="notif-btn" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell size={18} />
                <span className="notif-dot"></span>
              </button>
              <div className="role-wrap" ref={roleRef}>
                <div className="user-chip" onClick={() => setRoleOpen((p) => !p)}>
                  <div className="avatar">{config.roleAvatars[currentRole]}</div>
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
                        <div className="avatar-sm">{config.roleAvatars[r]}</div>
                        <span>{config.roleNames[r]}</span>
                        {r === currentRole && <span className="role-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="content" id="main-content">
          {renderViews()}
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
        <NotifPanel isOpen={notifOpen} />
      </div>
    </div>
  );
}
