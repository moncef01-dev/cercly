'use client';

import { useMemo } from 'react';
import { useStore } from '../lib/store';
import type { Role } from '../lib/types';

interface NotifPanelProps {
  isOpen: boolean;
  currentRole: Role;
}

const categoryColors: Record<string, string> = {
  success: 'var(--green-mid)',
  info: 'var(--blue)',
  warning: 'var(--orange)',
  system: '#8e44ad',
  reward: '#d4a017',
  transaction: '#2980b9',
  environment: '#27ae60',
};

const categoryBg: Record<string, string> = {
  success: 'var(--green-50)',
  info: 'var(--blue-light)',
  warning: 'var(--orange-bg)',
  system: '#f3e8ff',
  reward: '#fef7e0',
  transaction: '#e1f0fa',
  environment: '#e8f8e8',
};

export default function NotifPanel({ isOpen, currentRole }: NotifPanelProps) {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);

  console.log('NotifPanel — Current Role:', currentRole);
  console.log('NotifPanel — Total Notifications:', notifications.length);
  const filteredNotifications = notifications.filter((n) => n.role === currentRole);
  console.log('NotifPanel — Filtered Notifications:', filteredNotifications);
  console.log('NotifPanel — Filtered Count:', filteredNotifications.length);

  const roleNotifs = useMemo(
    () => notifications.filter((n) => n.role === currentRole),
    [notifications, currentRole],
  );

  const hasNew = useMemo(() => roleNotifs.some((n) => n.isNew), [roleNotifs]);

  return (
    <div className={`notif-panel${isOpen ? ' open' : ''}`} id="notif-panel">
      <div
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text)',
          marginBottom: '10px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        الإشعارات
        {hasNew && (
          <span
            style={{ fontSize: '11px', color: 'var(--text-3)', cursor: 'pointer' }}
            onClick={() => markAllRead()}
          >
            تحديد الكل كمقروء
          </span>
        )}
      </div>
      {roleNotifs.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--text-3)',
            fontSize: '12px',
            padding: '20px 0',
          }}
        >
          لا توجد إشعارات
        </div>
      )}
      {roleNotifs.map((n) => (
        <div
          className={`notif-item${n.isNew ? ' unread' : ''}`}
          key={n.id}
          onClick={() => markRead(n.id)}
          style={{ cursor: 'pointer' }}
        >
          <div
            className="notif-icon"
            style={{
              background: categoryBg[n.type] || categoryBg.info,
              color: categoryColors[n.type] || categoryColors.info,
            }}
          >
            {n.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: n.isNew ? 700 : 500,
                color: 'var(--text)',
                marginBottom: 1,
              }}
            >
              {n.title}
            </div>
            <div className="notif-text">{n.text}</div>
            <div className="notif-time">{n.time}</div>
          </div>
          {n.isNew && (
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: categoryColors[n.type] || categoryColors.info,
                flexShrink: 0,
                marginTop: 4,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
