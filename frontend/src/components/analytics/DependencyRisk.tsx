import { calculateDependencyMetrics } from '../../utils/analytics';
import type { Task } from '../../types/task';
import { AlertTriangle } from 'lucide-react';

export const DependencyRisk = ({ tasks, allTasks }: { tasks: Task[]; allTasks: Task[] }) => {
  const metrics = calculateDependencyMetrics(tasks, allTasks);

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Dependency Risk</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-neutral-50 rounded border border-border text-xs">
          <span className="text-text-secondary font-medium">Tasks with dependencies</span>
          <span className="font-mono font-semibold text-text-primary">{metrics.tasksWithDependencies}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded border border-amber-200 text-xs">
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-600" />
            <span className="font-medium text-amber-900">Blocked by dependencies</span>
          </div>
          <span className="font-mono font-bold text-amber-700">{metrics.tasksBlockedByDependencies}</span>
        </div>
      </div>
      
      {metrics.tasksBlockedByDependencies > 0 && (
        <p className="text-[11px] text-text-muted mt-2 font-medium">
          {metrics.tasksBlockedByDependencies} task(s) waiting on upstream deliverables.
        </p>
      )}
    </div>
  );
};

