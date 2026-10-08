import { calculateCompletionMetrics } from '../../utils/analytics';
import type { Task } from '../../types/task';

export const CompletionOverview = ({ tasks }: { tasks: Task[] }) => {
  const metrics = calculateCompletionMetrics(tasks);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div>
          <h3 className="font-semibold text-sm text-text-primary">Completion Overview</h3>
          <p className="text-xs text-text-muted">Task status distribution across selected scope</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Rate:</span>
          <span className="text-lg font-bold text-emerald-600 font-mono">{metrics.completionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block mb-1">Total</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.total}</span>
        </div>
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 block mb-1">Completed</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.completed}</span>
        </div>
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block mb-1">In Progress</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.inProgress}</span>
        </div>
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">To Do</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.todo}</span>
        </div>
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 block mb-1">Review</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.review}</span>
        </div>
        <div className="bg-neutral-50/70 rounded-md p-3 border border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 block mb-1">Blocked</span>
          <span className="text-xl font-bold text-text-primary font-mono">{metrics.blocked}</span>
        </div>
      </div>
    </div>
  );
};

