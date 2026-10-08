import type { Task } from '../../types/task';
import { calcStatusCounts } from '../../types/workflow';

interface WorkflowSummaryProps {
  tasks: Task[];
}

export const WorkflowSummary = ({ tasks }: WorkflowSummaryProps) => {
  const counts = calcStatusCounts(tasks);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-surface p-3 border border-border rounded-lg text-xs">
      <div className="px-2">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Total Tasks</span>
        <span className="text-xl font-bold font-mono text-text-primary">{counts.total}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">To Do</span>
        <span className="text-xl font-bold font-mono text-slate-600">{counts.TODO}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">In Progress</span>
        <span className="text-xl font-bold font-mono text-primary">{counts.IN_PROGRESS}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">In Review</span>
        <span className="text-xl font-bold font-mono text-sky-600">{counts.REVIEW}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Completed</span>
        <span className="text-xl font-bold font-mono text-emerald-600">{counts.COMPLETED}</span>
      </div>
      <div className="px-2 border-l border-border">
        <span className="text-[10px] uppercase font-semibold text-text-muted block">Blocked</span>
        <span className={`text-xl font-bold font-mono ${counts.BLOCKED > 0 ? 'text-rose-600' : 'text-text-muted'}`}>{counts.BLOCKED}</span>
      </div>
    </div>
  );
};

