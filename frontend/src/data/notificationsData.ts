import type { Notification } from '../types/notification';

// Mock notifications referencing real project/task IDs from projectsData and tasksData.
// Replace this array with a GET /notifications API response when the backend is ready.

export const initialNotifications: Notification[] = [
  {
    id: 'n-001',
    type: 'TASK_ASSIGNED',
    title: 'Task assigned to you',
    message: 'Authentication UI has been assigned to you.',
    projectId: 'projectpulse',
    taskId: 'task-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    read: false,
  },
  {
    id: 'n-002',
    type: 'TASK_DUE_SOON',
    title: 'Task deadline approaching',
    message: 'Dashboard API Contract is due in 1 day.',
    projectId: 'projectpulse',
    taskId: 'task-002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hrs ago
    read: false,
  },
  {
    id: 'n-003',
    type: 'TASK_OVERDUE',
    title: 'Task is overdue',
    message: 'Project Health Algorithm is past its due date and not completed.',
    projectId: 'projectpulse',
    taskId: 'task-006',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hrs ago
    read: false,
  },
  {
    id: 'n-004',
    type: 'DEPENDENCY_BLOCKED',
    title: 'Task is blocked',
    message: 'Notification Service Design is blocked by incomplete upstream tasks.',
    projectId: 'projectpulse',
    taskId: 'task-007',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hrs ago
    read: false,
  },
  {
    id: 'n-005',
    type: 'TASK_COMPLETED',
    title: 'Task completed',
    message: 'Authentication UI has been marked as completed.',
    projectId: 'projectpulse',
    taskId: 'task-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: 'n-006',
    type: 'TASK_OVERDUE',
    title: 'Task is overdue',
    message: 'Asset Tracking Schema is past its due date and still in progress.',
    projectId: 'alga-asset-care',
    taskId: 'task-008',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), // 26 hrs ago
    read: true,
  },
  {
    id: 'n-007',
    type: 'PROJECT_HEALTH_CHANGED',
    title: 'Project health changed',
    message: 'Alga Asset Care has changed to At Risk due to overdue tasks.',
    projectId: 'alga-asset-care',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(), // 30 hrs ago
    read: true,
  },
  {
    id: 'n-008',
    type: 'PROJECT_STATUS_CHANGED',
    title: 'Project status changed',
    message: 'Alga Asset Care project has been placed On Hold.',
    projectId: 'alga-asset-care',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    read: true,
  },
];
