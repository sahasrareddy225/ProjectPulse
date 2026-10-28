import type { Notification } from '../types/notification';

const BASE_URL = import.meta.env.VITE_NOTIFICATION_SERVICE_URL || 'http://localhost:8085';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('projectpulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const token = localStorage.getItem('projectpulse_token');
    if (!token) {
      return [];
    }

    const res = await fetch(`${BASE_URL}/api/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'omit',
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (res.status === 403) {
        throw new Error('Access denied: You do not have permission to view notifications.');
      }
      throw new Error(`Failed to load notifications: ${res.statusText}`);
    }

    const data: Notification[] = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async markAsRead(id: string): Promise<Notification> {
    const res = await fetch(`${BASE_URL}/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'omit',
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (res.status === 403) {
        throw new Error('Access denied: You cannot modify another user\'s notification.');
      }
      throw new Error(`Failed to mark notification as read: ${res.statusText}`);
    }

    return await res.json();
  },

  async markAllAsRead(): Promise<{ message: string; count: number }> {
    const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      credentials: 'omit',
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (res.status === 403) {
        throw new Error('Access denied: You do not have permission to modify notifications.');
      }
      throw new Error(`Failed to mark all notifications as read: ${res.statusText}`);
    }

    return await res.json();
  },

  async getStatus(): Promise<{ service: string; status: string; receivedEventsCount: number }> {
    const res = await fetch(`${BASE_URL}/api/notifications/status`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`Notification status check failed: ${res.statusText}`);
    }
    return await res.json();
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
    } catch {
      return 0;
    }
  },
};
