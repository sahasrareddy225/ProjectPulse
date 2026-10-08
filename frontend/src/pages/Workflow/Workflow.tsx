import { useState, useMemo } from 'react';
import { initialTasks } from '../../data/tasksData';
import { initialProjects } from '../../data/projectsData';
import type { Task, TaskStatus, TaskPriority } from '../../types/task';
import { WorkflowSummary } from '../../components/workflow/WorkflowSummary';
import { WorkflowStatus } from '../../components/workflow/WorkflowStatus';
import { DependencyView } from '../../components/workflow/DependencyView';
import { BlockedTasks } from '../../components/workflow/BlockedTasks';
import { WorkflowAttention } from '../../components/workflow/WorkflowAttention';
import { Filter } from 'lucide-react';

export const Workflow = () => {
  const [allTasks] = useState<Task[]>(initialTasks);
  const [projectFilter, setProjectFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');

  const scopedTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (projectFilter !== 'ALL' && task.projectId !== projectFilter) return false;
      if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [allTasks, projectFilter, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Workflow</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Operational pipeline, task dependencies, and bottleneck analysis.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-text-muted font-medium">
            <Filter size={13} />
            Scope:
          </div>
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Projects</option>
            {initialProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
            className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="BLOCKED">Blocked</option>
          </select>
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'ALL')}
            className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          {(projectFilter !== 'ALL' || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => { setProjectFilter('ALL'); setStatusFilter('ALL'); setPriorityFilter('ALL'); }}
              className="text-xs text-primary hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <WorkflowSummary tasks={scopedTasks} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WorkflowStatus tasks={scopedTasks} />
        </div>
        <div className="lg:col-span-1">
          <WorkflowAttention tasks={scopedTasks} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DependencyView tasks={scopedTasks} />
        <BlockedTasks tasks={scopedTasks} allTasks={allTasks} />
      </div>
    </div>
  );
};

