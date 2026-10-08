// Task data model for ProjectPulse
// These types form the foundation for Workflow, Analytics, and AI Intelligence layers.

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'BLOCKED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskAssignee {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface Task {
  id: string;
  projectId: string;       // Must always reference an existing project
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: TaskAssignee;
  createdAt: string;       // ISO date string
  dueDate: string;         // ISO date string — used for overdue calculation
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];  // Array of task IDs this task depends on
  tags: string[];
}

// Helper: calculate overdue state from task data (not a stored field)
// dueDate < today AND status !== COMPLETED
export const isTaskOverdue = (task: Task): boolean => {
  if (task.status === 'COMPLETED') return false;
  return new Date(task.dueDate) < new Date(new Date().toDateString());
};
