// Workflow-specific derived types and pure calculation functions.
// All data is derived from the existing Task model — no new data structures.

import type { Task } from './task';
import { isTaskOverdue } from './task';

export interface DependencyRelation {
  taskId: string;
  taskTitle: string;
  dependsOnId: string;
  dependsOnTitle: string;
  dependsOnStatus: Task['status'];
  isBlocking: boolean; // true if dependsOn is not COMPLETED
}

export interface WorkflowAttentionItem {
  type: 'overdue' | 'blocked' | 'critical-blocked' | 'dep-chain';
  message: string;
  taskId: string;
}

/** Counts tasks by status for a given task list */
export const calcStatusCounts = (tasks: Task[]) => ({
  TODO:        tasks.filter(t => t.status === 'TODO').length,
  IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
  REVIEW:      tasks.filter(t => t.status === 'REVIEW').length,
  COMPLETED:   tasks.filter(t => t.status === 'COMPLETED').length,
  BLOCKED:     tasks.filter(t => t.status === 'BLOCKED').length,
  total:       tasks.length,
});

/** Build all dependency relationships for display. Skips unknown IDs silently. */
export const buildDependencyRelations = (tasks: Task[]): DependencyRelation[] => {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const relations: DependencyRelation[] = [];

  for (const task of tasks) {
    for (const depId of task.dependencies) {
      if (depId === task.id) continue; // skip self-reference
      const dep = taskMap.get(depId);
      if (!dep) continue; // unknown ID — skip silently
      relations.push({
        taskId: task.id,
        taskTitle: task.title,
        dependsOnId: dep.id,
        dependsOnTitle: dep.title,
        dependsOnStatus: dep.status,
        isBlocking: dep.status !== 'COMPLETED',
      });
    }
  }

  return relations;
};

/** Rule-based attention items derived from task data. NOT AI. */
export const buildAttentionItems = (tasks: Task[]): WorkflowAttentionItem[] => {
  const items: WorkflowAttentionItem[] = [];
  const taskMap = new Map(tasks.map(t => [t.id, t]));

  const overdue = tasks.filter(isTaskOverdue);
  if (overdue.length > 0) {
    items.push({
      type: 'overdue',
      message: `${overdue.length} task${overdue.length > 1 ? 's are' : ' is'} past their due date and not completed.`,
      taskId: overdue[0].id,
    });
  }

  const blocked = tasks.filter(t => t.status === 'BLOCKED');
  if (blocked.length > 0) {
    items.push({
      type: 'blocked',
      message: `${blocked.length} task${blocked.length > 1 ? 's are' : ' is'} currently blocked and cannot progress.`,
      taskId: blocked[0].id,
    });
  }

  const criticalBlocked = tasks.filter(
    t => t.status === 'BLOCKED' && (t.priority === 'CRITICAL' || t.priority === 'HIGH')
  );
  if (criticalBlocked.length > 0) {
    items.push({
      type: 'critical-blocked',
      message: `${criticalBlocked.length} high-priority or critical task${criticalBlocked.length > 1 ? 's are' : ' is'} blocked — review dependencies.`,
      taskId: criticalBlocked[0].id,
    });
  }

  // Tasks waiting on unfinished dependencies (status !== BLOCKED but deps not done)
  const waitingOnDeps = tasks.filter(t => {
    if (t.status === 'COMPLETED' || t.status === 'BLOCKED') return false;
    return t.dependencies.some(id => {
      const dep = taskMap.get(id);
      return dep && dep.status !== 'COMPLETED';
    });
  });
  if (waitingOnDeps.length > 0) {
    items.push({
      type: 'dep-chain',
      message: `${waitingOnDeps.length} task${waitingOnDeps.length > 1 ? 's have' : ' has'} unresolved upstream dependencies that may slow progress.`,
      taskId: waitingOnDeps[0].id,
    });
  }

  return items;
};
