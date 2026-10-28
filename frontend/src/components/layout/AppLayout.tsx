import { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types/notification';
import { useAuthStore } from '../../store/authStore';

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const location = useLocation();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load notifications';
      console.warn('[AppLayout] Failed to load notifications:', msg);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();

    // Listen for custom event triggered after creating a project or task
    const handleRefresh = () => fetchNotifications();
    window.addEventListener('projectpulse:notification-refresh', handleRefresh);

    // Periodic poll every 15s to pick up newly consumed Kafka events
    const timer = setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      window.removeEventListener('projectpulse:notification-refresh', handleRefresh);
      clearInterval(timer);
    };
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('[AppLayout] Failed to sync markAsRead to backend:', err);
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('[AppLayout] Failed to sync markAllAsRead to backend:', err);
      fetchNotifications();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          notifications={notifications}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          isDropdownOpen={isNotifDropdownOpen}
          onToggleDropdown={() => setIsNotifDropdownOpen(prev => !prev)}
          isLoading={isLoading}
          error={error}
          onRefresh={fetchNotifications}
        />
        {/* key={location.pathname} remounts main on navigation → triggers page-enter animation */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 page-enter"
        >
          <Outlet context={{
            notifications,
            isLoading,
            error,
            onMarkRead: handleMarkRead,
            onMarkAllRead: handleMarkAllRead,
            onRefresh: fetchNotifications,
          }} />
        </main>
      </div>
    </div>
  );
};
