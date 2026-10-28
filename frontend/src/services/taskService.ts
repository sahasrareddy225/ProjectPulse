import type { Task } from '../types/task';
import { initialTasks } from '../data/tasksData';

const BASE_URL = import.meta.env.VITE_DOMAIN_SERVICE_URL || 'http://localhost:8083';

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

export const taskService = {
  async getTasks(projectId?: string): Promise<Task[]> {
    try {
      const url = projectId && projectId !== 'ALL'
        ? `${BASE_URL}/api/tasks?projectId=${encodeURIComponent(projectId)}`
        : `${BASE_URL}/api/tasks`;

      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'omit',
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication required. Please log in.');
        if (res.status === 403) throw new Error('Access denied: You do not have permission to view tasks.');
        throw new Error(`Failed to load tasks: ${res.statusText}`);
      }

      const data: Task[] = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : initialTasks;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Authentication required') || err.message.includes('Access denied'))) {
        throw err;
      }
      console.warn('[taskService] Live fetch failed, using local fallback:', err);
      return initialTasks;
    }
  },

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/tasks/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'omit',
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error('Authentication required. Please log in.');
        if (res.status === 404) return initialTasks.find(t => t.id === id) || null;
        throw new Error(`Failed to load task ${id}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`[taskService] Live fetch failed for task ${id}:`, err);
      return initialTasks.find(t => t.id === id) || null;
    }
  },

  async createTask(task: Partial<Task>): Promise<Task> {
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const errorMsg = errorJson?.message || res.statusText || 'Failed to create task';
      throw new Error(errorMsg);
    }

    const created: Task = await res.json();
    window.dispatchEvent(new CustomEvent('projectpulse:notification-refresh'));
    return created;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const res = await fetch(`${BASE_URL}/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      const errorMsg = errorJson?.message || res.statusText || 'Failed to update task';
      throw new Error(errorMsg);
    }

    const updated: Task = await res.json();
    window.dispatchEvent(new CustomEvent('projectpulse:notification-refresh'));
    return updated;
  },

  async deleteTask(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/api/tasks/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      if (res.status === 403) throw new Error('Access denied: You do not have permission to delete this task.');
      return false;
    }

    window.dispatchEvent(new CustomEvent('projectpulse:notification-refresh'));
    return res.status === 204 || res.ok;
  },
};
