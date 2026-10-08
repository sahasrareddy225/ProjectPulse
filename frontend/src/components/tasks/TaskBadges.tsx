import type { TaskStatus, TaskPriority } from '../../types/task';

const dot = 'w-1.5 h-1.5 rounded-full flex-shrink-0';

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string; text: string }> = {
  TODO:        { label: 'To Do',       dot: 'bg-text-muted',   text: 'text-text-secondary' },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-primary',      text: 'text-primary' },
  REVIEW:      { label: 'Review',      dot: 'bg-info',         text: 'text-info' },
  COMPLETED:   { label: 'Completed',   dot: 'bg-success',      text: 'text-success' },
  BLOCKED:     { label: 'Blocked',     dot: 'bg-warning',      text: 'text-warning' },
};

export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap ${c.text}`}>
      <span className={`${dot} ${c.dot}`} />
      {c.label}
    </span>
  );
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; className: string }> = {
  LOW:      { label: 'Low',      className: 'text-text-muted   bg-surface-raised border-border' },
  MEDIUM:   { label: 'Medium',   className: 'text-text-secondary bg-surface-raised border-border' },
  HIGH:     { label: 'High',     className: 'text-warning bg-warning-light  border-warning/30' },
  CRITICAL: { label: 'Critical', className: 'text-error   bg-error-light    border-error/30' },
};

export const TaskPriorityBadge = ({ priority }: { priority: TaskPriority }) => {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${c.className}`}>
      {c.label}
    </span>
  );
};
