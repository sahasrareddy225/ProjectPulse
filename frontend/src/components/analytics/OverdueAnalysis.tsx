import { calculateOverdueMetrics } from '../../utils/analytics';
import type { Task } from '../../types/task';
import { CalendarX2 } from 'lucide-react';

export const OverdueAnalysis = ({ tasks }: { tasks: Task[] }) => {
  const metrics = calculateOverdueMetrics(tasks);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Overdue Analysis</h3>
        <span className={`text-xs font-mono font-semibold ${metrics.totalOverdue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {metrics.totalOverdue} overdue ({metrics.overduePercentage}%)
        </span>
      </div>

      {metrics.highestPriorityOverdue.length > 0 ? (
        <div className="space-y-2 mt-2">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">Critical & High Priority Overdue</span>
          <div className="space-y-1.5">
            {metrics.highestPriorityOverdue.map(task => (
              <div key={task.id} className="flex items-center justify-between p-2 rounded bg-neutral-50 border border-border text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarX2 size={13} className="text-amber-600 flex-shrink-0" />
                  <span className="font-medium text-text-primary truncate">{task.title}</span>
                </div>
                <span className="text-text-muted text-[11px] font-mono whitespace-nowrap ml-2">
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-text-muted italic py-1">No critical or high priority tasks are overdue.</p>
      )}
    </div>
  );
};

