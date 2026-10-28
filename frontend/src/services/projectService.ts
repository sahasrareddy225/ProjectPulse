import type { Project } from '../data/projectsData';
import { initialProjects } from '../data/projectsData';

const BASE_URL = import.meta.env.VITE_DOMAIN_SERVICE_URL || 'http://localhost:8083';

export interface CreateProjectInput {
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  owner?: string;
  status?: string;
  health?: string;
}

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

export const projectService = {
  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/projects`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'omit',
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication required. Please log in.');
        }
        if (res.status === 403) {
          throw new Error('Access denied: You do not have permission to view projects.');
        }
        throw new Error(`Failed to load projects: ${res.statusText}`);
      }

      const data: Project[] = await res.json();
      return data && data.length > 0 ? data : initialProjects;
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Authentication required') || err.message.includes('Access denied'))) {
        throw err;
      }
      console.warn('[projectService] Live API fetch failed, falling back to local dataset:', err);
      return initialProjects;
    }
  },

  async getProjectById(id: string): Promise<Project | null> {
    const res = await fetch(`${BASE_URL}/api/projects/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'omit',
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (res.status === 403) {
        throw new Error('Access denied: You are not an authorized member of this project.');
      }
      if (res.status === 404) {
        return initialProjects.find(p => p.id === id) || null;
      }
      throw new Error(`Failed to fetch project ${id}: ${res.statusText}`);
    }

    return await res.json();
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Authentication required. Please log in.');
      }
      if (res.status === 403) {
        throw new Error('Access denied: Only Administrators and Project Managers can create projects.');
      }
      const errText = await res.text();
      throw new Error(`Failed to create project: ${errText || res.statusText}`);
    }

    return await res.json();
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.status === 403) {
        throw new Error('Access denied: You do not have permission to delete this project.');
      }
      return res.status === 204 || res.ok;
    } catch (err) {
      console.error(`[projectService] Failed to delete project ${id}:`, err);
      if (err instanceof Error && err.message.includes('Access denied')) {
        throw err;
      }
      return false;
    }
  }
};
