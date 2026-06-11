'use client';

import { useStore } from '../lib/store';

interface NotifPanelProps {
  isOpen: boolean;
}

export default function NotifPanel({ isOpen }: NotifPanelProps) {
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationRead);
  const markAllRead = useStore((s) => s.markAllNotificationsRead);

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
        <span
          style={{ fontSize: '11px', color: 'var(--text-3)', cursor: 'pointer' }}
          onClick={() => markAllRead()}
        >
          تحديد الكل كمقروء
        </span>
      </div>
      {notifications.map((n) => (
        <div
          className="notif-item"
          key={n.id}
          onClick={() => markRead(n.id)}
          style={{ cursor: 'pointer' }}
        >
          <div
            className={`notif-dot-s${
              n.type === 'warning' ? ' orange' : n.type === 'success' ? ' green' : ''
            }`}
          ></div>
          <div>
            <div className="notif-text">{n.text}</div>
            <div className="notif-time">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
