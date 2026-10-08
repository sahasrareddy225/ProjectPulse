import { Search } from 'lucide-react';
import { initialProjects } from '../../data/projectsData';
import { ALL_ASSIGNEES } from '../../data/tasksData';
import type { TaskStatus, TaskPriority } from '../../types/task';

export type SortField = 'dueDate' | 'priority' | 'status' | 'createdAt';
export type SortDir = 'asc' | 'desc';

export interface TaskFiltersState {
  search: string;
  projectId: string;
  status: TaskStatus | 'ALL';
  priority: TaskPriority | 'ALL';
  assigneeId: string;
  sortField: SortField;
  sortDir: SortDir;
}

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (updated: Partial<TaskFiltersState>) => void;
}

export const TaskFilters = ({ filters, onChange }: TaskFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      {/* Search & Main Selects */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Filter tasks by name or assignee..."
            value={filters.search}
            onChange={e => onChange({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Project filter */}
        <select
          value={filters.projectId}
          onChange={e => onChange({ projectId: e.target.value })}
          className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Projects</option>
          {initialProjects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={e => onChange({ status: e.target.value as TaskStatus | 'ALL' })}
          className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">Todo</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="REVIEW">Review</option>
          <option value="COMPLETED">Completed</option>
          <option value="BLOCKED">Blocked</option>
        </select>

        {/* Priority filter */}
        <select
          value={filters.priority}
          onChange={e => onChange({ priority: e.target.value as TaskPriority | 'ALL' })}
          className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {/* Assignee filter */}
        <select
          value={filters.assigneeId}
          onChange={e => onChange({ assigneeId: e.target.value })}
          className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="ALL">All Assignees</option>
          {ALL_ASSIGNEES.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-1.5">
        <select
          value={filters.sortField}
          onChange={e => onChange({ sortField: e.target.value as SortField })}
          className="py-1.5 pl-2.5 pr-7 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
          <option value="createdAt">Created Date</option>
        </select>
        <button
          onClick={() => onChange({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
          className="px-2 py-1.5 border border-border rounded-md bg-surface text-xs font-mono font-medium text-text-muted hover:text-text-primary transition-colors"
          title={`Sort ${filters.sortDir === 'asc' ? 'descending' : 'ascending'}`}
        >
          {filters.sortDir === 'asc' ? 'ASC' : 'DESC'}
        </button>
      </div>
    </div>
  );
};

