import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { initialNotifications } from '../../data/notificationsData';
import type { Notification } from '../../types/notification';

export const AppLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const location = useLocation();

  const handleMarkRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
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
        />
        {/* key={location.pathname} remounts main on navigation → triggers page-enter animation */}
        <main
          key={location.pathname}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 page-enter"
        >
          <Outlet context={{ notifications, onMarkRead: handleMarkRead, onMarkAllRead: handleMarkAllRead }} />
        </main>
      </div>
    </div>
  );
};
