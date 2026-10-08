import type { Task } from '../../types/task';
import { isTaskOverdue } from '../../types/task';

interface TaskSummaryProps {
  tasks: Task[];
}

export const TaskSummary = ({ tasks }: TaskSummaryProps) => {
  const total = tasks.length;
  const todo = tasks.filter(t => t.status === 'TODO').length;
  const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  const overdue = tasks.filter(isTaskOverdue).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-surface p-3 border border-border rounded-lg">
      <div className="px-2">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Total Tasks</span>
        <span className="text-xl font-bold font-mono text-text-primary">{total}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">To Do</span>
        <span className="text-xl font-bold font-mono text-slate-600">{todo}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">In Progress</span>
        <span className="text-xl font-bold font-mono text-primary">{inProgress}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Completed</span>
        <span className="text-xl font-bold font-mono text-emerald-600">{completed}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Overdue</span>
        <span className={`text-xl font-bold font-mono ${overdue > 0 ? 'text-amber-600' : 'text-text-muted'}`}>{overdue}</span>
      </div>
    </div>
  );
};

