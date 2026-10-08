import { useRef, useEffect } from 'react';
import { Bell, Menu, CheckCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { relativeTime } from '../../utils/time';

interface HeaderProps {
  onMenuClick: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', projects: 'Projects', tasks: 'Tasks',
  workflow: 'Workflow', analytics: 'Analytics', notifications: 'Notifications',
  'ai-assistant': 'AI Assistant', settings: 'Settings',
};

export const Header = ({ onMenuClick, notifications, onMarkRead, onMarkAllRead, isDropdownOpen, onToggleDropdown }: HeaderProps) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const dropRef   = useRef<HTMLDivElement>(null);
  const segment   = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const title     = PAGE_TITLES[segment] ?? segment;
  const unread    = notifications.filter(n => !n.read).length;
  const recent    = notifications.slice(0, 5);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        if (isDropdownOpen) onToggleDropdown();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isDropdownOpen, onToggleDropdown]);

  return (
    <header className="h-12 flex-shrink-0 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-5 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-border/40 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>
        <span className="text-[14px] font-semibold text-text-primary">{title}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Bell */}
        <div ref={dropRef} className="relative">
          <button
            onClick={onToggleDropdown}
            className={`relative p-1.5 rounded transition-colors ${isDropdownOpen ? 'bg-primary-light text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-border/40'}`}
            aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-1 ring-2 ring-white leading-none">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-80 bg-surface border border-border rounded-lg shadow-[0_8px_24px_-4px_rgba(0,0,0,.12)] z-50 overflow-hidden fade-scale-in">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-raised">
                <span className="text-[13px] font-semibold text-text-primary">
                  Notifications {unread > 0 && <span className="ml-1 text-[11px] font-bold bg-primary text-white px-1.5 py-0.5 rounded">{unread}</span>}
                </span>
                <div className="flex gap-3">
                  {unread > 0 && (
                    <button onClick={onMarkAllRead} className="text-[12px] font-medium text-primary hover:underline flex items-center gap-1">
                      <CheckCheck size={12} /> All read
                    </button>
                  )}
                  <button onClick={() => { onToggleDropdown(); navigate('/notifications'); }} className="text-[12px] font-medium text-text-secondary hover:text-text-primary">
                    View all
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto max-h-72 divide-y divide-border">
                {recent.length === 0 ? (
                  <p className="py-8 text-center text-sm text-text-muted">No notifications</p>
                ) : recent.map(n => (
                  <div
                    key={n.id}
                    onClick={() => { onMarkRead(n.id); onToggleDropdown(); if (n.taskId) navigate(`/tasks/${n.taskId}`); else if (n.projectId) navigate(`/projects/${n.projectId}`); }}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-raised transition-colors ${!n.read ? 'bg-primary-light/20' : ''}`}
                  >
                    <NotificationIcon type={n.type} size={13} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[12px] leading-snug ${!n.read ? 'font-semibold text-text-primary' : 'font-medium text-text-secondary'}`}>{n.title}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-text-muted whitespace-nowrap">{relativeTime(n.createdAt)}</span>
                          {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="ml-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer" title="John Doe">
          <span className="text-white text-[11px] font-semibold">JD</span>
        </div>
      </div>
    </header>
  );
};
