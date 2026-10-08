import { AlertTriangle, AlertCircle, Clock, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/task';
import { buildAttentionItems } from '../../types/workflow';

interface WorkflowAttentionProps {
  tasks: Task[];
}

const ICON_MAP = {
  'overdue':          { Icon: Clock,         color: 'text-warning',   bg: 'bg-warning-light' },
  'blocked':          { Icon: AlertCircle,   color: 'text-warning',   bg: 'bg-warning-light' },
  'critical-blocked': { Icon: AlertTriangle, color: 'text-red-500',   bg: 'bg-red-50' },
  'dep-chain':        { Icon: Link2,         color: 'text-primary',   bg: 'bg-primary-light' },
} as const;

export const WorkflowAttention = ({ tasks }: WorkflowAttentionProps) => {
  const navigate = useNavigate();
  const items = buildAttentionItems(tasks);

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-background/30">
        <h3 className="font-bold text-text-primary">Workflow Attention</h3>
        <p className="text-xs font-medium text-text-secondary mt-0.5">
          Rule-based observations derived from your task data
        </p>
      </div>
      <div className="p-6">
        {items.length === 0 ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center">
              <AlertCircle size={16} className="text-success" />
            </div>
            <p className="text-sm font-medium text-text-secondary">No workflow issues detected. All tasks are on track.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const { Icon, color, bg } = ICON_MAP[item.type];
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-background/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/tasks/${item.taskId}`)}
                >
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={15} className={color} />
                  </div>
                  <p className="text-sm font-semibold text-text-primary leading-snug">{item.message}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
