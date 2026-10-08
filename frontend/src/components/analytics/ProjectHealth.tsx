import { calculateProjectHealth } from '../../utils/analytics';
import type { Task } from '../../types/task';
import { ShieldCheck, AlertTriangle, XOctagon } from 'lucide-react';

export const ProjectHealth = ({ tasks }: { tasks: Task[] }) => {
  const health = calculateProjectHealth(tasks);

  const getHealthStyles = () => {
    switch (health.status) {
      case 'Healthy':
        return { text: 'text-emerald-600', dot: 'bg-emerald-500', icon: ShieldCheck };
      case 'At Risk':
        return { text: 'text-amber-600', dot: 'bg-amber-500', icon: AlertTriangle };
      case 'Critical':
        return { text: 'text-rose-600', dot: 'bg-rose-500', icon: XOctagon };
      default:
        return { text: 'text-slate-600', dot: 'bg-slate-400', icon: ShieldCheck };
    }
  };

  const styles = getHealthStyles();
  const Icon = styles.icon;

  return (
    <div className="bg-surface rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Health Status</span>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${styles.text}`}>
          <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
          {health.status}
        </span>
      </div>
      <div className="flex items-start gap-2 mt-2 pt-2 border-t border-border">
        <Icon size={14} className={`mt-0.5 flex-shrink-0 ${styles.text}`} />
        <p className="text-xs text-text-secondary leading-relaxed">
          {health.explanation}
        </p>
      </div>
    </div>
  );
};

