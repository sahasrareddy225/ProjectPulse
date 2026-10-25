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

export const projectService = {
  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/projects`, { credentials: 'omit' });
      if (!res.ok) {
        throw new Error(`Failed to load projects: ${res.statusText}`);
      }
      const data: Project[] = await res.json();
      return data && data.length > 0 ? data : initialProjects;
    } catch (err) {
      console.warn('[projectService] Live API fetch failed, falling back to local dataset:', err);
      return initialProjects;
    }
  },

  async getProjectById(id: string): Promise<Project | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${encodeURIComponent(id)}`, { credentials: 'omit' });
      if (!res.ok) {
        if (res.status === 404) {
          // Check fallback dataset
          return initialProjects.find(p => p.id === id) || null;
        }
        throw new Error(`Failed to fetch project ${id}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[projectService] Error fetching project ${id}:`, err);
      return initialProjects.find(p => p.id === id) || null;
    }
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    const res = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to create project: ${errText || res.statusText}`);
    }

    return await res.json();
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.status === 204 || res.ok;
    } catch (err) {
      console.error(`[projectService] Failed to delete project ${id}:`, err);
      return false;
    }
  }
};
