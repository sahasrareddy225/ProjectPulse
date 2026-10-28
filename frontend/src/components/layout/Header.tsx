import { useRef, useEffect, useState } from 'react';
import { Bell, Menu, CheckCheck, LogOut, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';
import { NotificationIcon } from '../notifications/NotificationIcon';
import { relativeTime } from '../../utils/time';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';

interface HeaderProps {
  onMenuClick: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  isDropdownOpen: boolean;
  onToggleDropdown: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard', projects: 'Projects', tasks: 'Tasks',
  workflow: 'Workflow', analytics: 'Analytics', notifications: 'Notifications',
  'ai-assistant': 'AI Assistant', settings: 'Settings',
};

export const Header = ({
  onMenuClick,
  notifications,
  onMarkRead,
  onMarkAllRead,
  isDropdownOpen,
  onToggleDropdown,
  isLoading = false,
  error = null,
  onRefresh,
}: HeaderProps) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const dropRef   = useRef<HTMLDivElement>(null);
  const userDropRef = useRef<HTMLDivElement>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const segment   = location.pathname.split('/').filter(Boolean)[0] ?? 'dashboard';
  const title     = PAGE_TITLES[segment] ?? segment;
  const unread    = notifications.filter(n => !n.read).length;
  const recent    = notifications.slice(0, 5);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
    : 'U';

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await authService.logout();
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        if (isDropdownOpen) onToggleDropdown();
      }
      if (userDropRef.current && !userDropRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
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
                {isLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-text-muted">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <p className="text-xs">Loading notifications...</p>
                  </div>
                ) : error ? (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-red-600 mb-2">{error}</p>
                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        className="text-[11px] text-primary hover:underline font-medium"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                ) : recent.length === 0 ? (
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

        {/* User Avatar & Dropdown */}
        <div ref={userDropRef} className="relative ml-1">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all focus:outline-none"
            title={user?.name || 'User Profile'}
            aria-label="User account menu"
          >
            <span className="text-white text-[11px] font-semibold">{initials}</span>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-56 bg-surface border border-border rounded-lg shadow-[0_8px_24px_-4px_rgba(0,0,0,.12)] z-50 overflow-hidden fade-scale-in">
              <div className="p-3 border-b border-border bg-surface-raised">
                <p className="text-xs font-semibold text-text-primary truncate">{user?.name || 'Workspace User'}</p>
                <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email || 'Authenticated'}</p>
                {user?.role && (
                  <span className="inline-block mt-1.5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded bg-primary/10 text-primary border border-primary/20">
                    {user.role}
                  </span>
                )}
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-md transition-colors text-left"
                >
                  <LogOut size={14} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
