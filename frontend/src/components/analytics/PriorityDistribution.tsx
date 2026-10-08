import { calculatePriorityDistribution } from '../../utils/analytics';
import type { Task } from '../../types/task';

export const PriorityDistribution = ({ tasks }: { tasks: Task[] }) => {
  const dist = calculatePriorityDistribution(tasks);
  const total = tasks.length || 1;

  const priorities = [
    { label: 'CRITICAL', count: dist.CRITICAL, color: 'bg-rose-500', text: 'text-rose-600' },
    { label: 'HIGH', count: dist.HIGH, color: 'bg-amber-500', text: 'text-amber-600' },
    { label: 'MEDIUM', count: dist.MEDIUM, color: 'bg-indigo-500', text: 'text-indigo-600' },
    { label: 'LOW', count: dist.LOW, color: 'bg-slate-400', text: 'text-slate-500' },
  ];

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Priority Distribution</h3>
        <span className="text-xs text-text-muted">{tasks.length} total tasks</span>
      </div>

      <div className="space-y-2.5">
        {priorities.map(p => {
          const pct = Math.round((p.count / total) * 100);
          return (
            <div key={p.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className={`font-semibold ${p.text}`}>{p.label}</span>
                <span className="text-text-muted font-mono">{p.count} ({pct}%)</span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${p.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

