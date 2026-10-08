// Notification data model for ProjectPulse
// Structured so mock state can later be replaced by a backend Notification Service API response.
// Future API shape: GET /notifications → Notification[]

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'TASK_COMPLETED'
  | 'PROJECT_STATUS_CHANGED'
  | 'PROJECT_HEALTH_CHANGED'
  | 'DEPENDENCY_BLOCKED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  createdAt: string; // ISO date string
  read: boolean;
}
