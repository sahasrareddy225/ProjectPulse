import type { Task } from '../types/task';
import { isTaskOverdue } from '../types/task';

// --- Completion Metrics ---
export interface CompletionMetrics {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  review: number;
  blocked: number;
  completionRate: number;
}

export const calculateCompletionMetrics = (tasks: Task[]): CompletionMetrics => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todo = tasks.filter(t => t.status === 'TODO').length;
  const review = tasks.filter(t => t.status === 'REVIEW').length;
  const blocked = tasks.filter(t => t.status === 'BLOCKED').length;

  return {
    total,
    completed,
    inProgress,
    todo,
    review,
    blocked,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
};

// --- Overdue Metrics ---
export interface OverdueMetrics {
  totalOverdue: number;
  overduePercentage: number;
  highestPriorityOverdue: Task[];
  overdueByProject: Record<string, number>;
}

export const calculateOverdueMetrics = (tasks: Task[]): OverdueMetrics => {
  const overdueTasks = tasks.filter(isTaskOverdue);
  const totalOverdue = overdueTasks.length;
  const overduePercentage = tasks.length === 0 ? 0 : Math.round((totalOverdue / tasks.length) * 100);

  const overdueByProject = overdueTasks.reduce((acc, task) => {
    acc[task.projectId] = (acc[task.projectId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const highestPriorityOverdue = overdueTasks
    .filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH')
    .sort((a, b) => {
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
      if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
      return 0;
    })
    .slice(0, 5);

  return {
    totalOverdue,
    overduePercentage,
    highestPriorityOverdue,
    overdueByProject,
  };
};

// --- Workload Analysis ---
export interface MemberWorkload {
  id: string;
  name: string;
  assigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
}

export const calculateWorkload = (tasks: Task[]): MemberWorkload[] => {
  const workloadMap = new Map<string, MemberWorkload>();

  tasks.forEach(task => {
    const { assignee } = task;
    if (!workloadMap.has(assignee.id)) {
      workloadMap.set(assignee.id, {
        id: assignee.id,
        name: assignee.name,
        assigned: 0,
        completed: 0,
        inProgress: 0,
        overdue: 0,
      });
    }
    const wl = workloadMap.get(assignee.id)!;
    wl.assigned += 1;
    if (task.status === 'COMPLETED') wl.completed += 1;
    if (task.status === 'IN_PROGRESS') wl.inProgress += 1;
    if (isTaskOverdue(task)) wl.overdue += 1;
  });

  return Array.from(workloadMap.values()).sort((a, b) => b.assigned - a.assigned);
};

// --- Priority Distribution ---
export interface PriorityDistribution {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

export const calculatePriorityDistribution = (tasks: Task[]): PriorityDistribution => {
  const dist = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  tasks.forEach(t => {
    if (dist[t.priority] !== undefined) {
      dist[t.priority] += 1;
    }
  });
  return dist;
};

// --- Dependency Metrics ---
export interface DependencyMetrics {
  tasksWithDependencies: number;
  blockedTasks: number;
  tasksBlockedByDependencies: number; // Blocked specifically due to unfinished dependencies
}

export const calculateDependencyMetrics = (tasks: Task[], allTasks: Task[]): DependencyMetrics => {
  const taskMap = new Map(allTasks.map(t => [t.id, t]));
  const tasksWithDependencies = tasks.filter(t => t.dependencies.length > 0).length;
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length;

  const tasksBlockedByDependencies = tasks.filter(t => {
    if (t.status === 'COMPLETED') return false;
    return t.dependencies.some(depId => {
      const dep = taskMap.get(depId);
      return dep && dep.status !== 'COMPLETED';
    });
  }).length;

  return {
    tasksWithDependencies,
    blockedTasks,
    tasksBlockedByDependencies,
  };
};

// --- Project Health ---
export type HealthStatus = 'Healthy' | 'At Risk' | 'Critical';

export interface ProjectHealthResult {
  status: HealthStatus;
  explanation: string;
}

export const calculateProjectHealth = (tasks: Task[]): ProjectHealthResult => {
  if (tasks.length === 0) {
    return { status: 'Healthy', explanation: 'No active tasks.' };
  }

  const { completionRate } = calculateCompletionMetrics(tasks);
  const overdueTasks = tasks.filter(isTaskOverdue);
  const blockedTasks = tasks.filter(t => t.status === 'BLOCKED');
  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'COMPLETED');
  
  const overdueCount = overdueTasks.length;
  const blockedCount = blockedTasks.length;
  const criticalCount = criticalTasks.length;

  // Critical Rules
  if (criticalCount >= 3 || overdueCount > tasks.length * 0.3 || blockedCount > tasks.length * 0.2) {
    return {
      status: 'Critical',
      explanation: `Multiple critical tasks are pending, or a large portion of work is overdue/blocked (${overdueCount} overdue, ${blockedCount} blocked).`,
    };
  }

  // At Risk Rules
  if (overdueCount > 0 || blockedCount > 0 || completionRate < 20) {
    return {
      status: 'At Risk',
      explanation: `${overdueCount} task(s) are overdue and ${blockedCount} task(s) are blocked. Progress may be slowing.`,
    };
  }

  // Healthy Rules
  return {
    status: 'Healthy',
    explanation: 'Most tasks are progressing as planned with no significant overdue or blocked work.',
  };
};
