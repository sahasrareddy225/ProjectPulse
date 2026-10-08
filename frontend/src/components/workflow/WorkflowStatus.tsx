import type { Task } from '../../types/task';
import { calcStatusCounts } from '../../types/workflow';
import { ArrowRight } from 'lucide-react';

interface WorkflowStatusProps {
  tasks: Task[];
}

const FLOW_STAGES = [
  { key: 'TODO',        label: 'To Do',       barColor: 'bg-gray-300',       textColor: 'text-text-secondary' },
  { key: 'IN_PROGRESS', label: 'In Progress',  barColor: 'bg-primary',        textColor: 'text-primary' },
  { key: 'REVIEW',      label: 'Review',       barColor: 'bg-info',           textColor: 'text-info' },
  { key: 'COMPLETED',   label: 'Completed',    barColor: 'bg-success',        textColor: 'text-success' },
] as const;

export const WorkflowStatus = ({ tasks }: WorkflowStatusProps) => {
  const counts = calcStatusCounts(tasks);
  const total = counts.total || 1; // avoid divide-by-zero

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-background/30">
        <h3 className="font-bold text-text-primary">Workflow Status</h3>
        <p className="text-xs font-medium text-text-secondary mt-0.5">
          Task progression across workflow stages
        </p>
      </div>
      <div className="p-6">
        {/* Pipeline flow */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {FLOW_STAGES.map((stage, i) => {
            const count = counts[stage.key as keyof typeof counts] as number;
            const pct = Math.round((count / total) * 100);
            return (
              <div key={stage.key} className="flex items-center gap-1 flex-1 min-w-0">
                <div className="flex-1 min-w-[80px]">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-xs font-bold ${stage.textColor} whitespace-nowrap`}>{stage.label}</span>
                    <span className="text-xs font-bold text-text-primary ml-1">{count}</span>
                  </div>
                  <div className="h-2.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stage.barColor} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary mt-1 block">{pct}%</span>
                </div>
                {i < FLOW_STAGES.length - 1 && (
                  <ArrowRight size={16} className="text-border flex-shrink-0 mt-[-12px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Blocked row */}
        {counts.BLOCKED > 0 && (
          <div className="mt-2 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm font-semibold text-warning">Blocked</span>
              </div>
              <span className="text-sm font-bold text-text-primary">{counts.BLOCKED} task{counts.BLOCKED > 1 ? 's' : ''}</span>
            </div>
            <div className="mt-2 h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-warning transition-all duration-500"
                style={{ width: `${Math.round((counts.BLOCKED / total) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
