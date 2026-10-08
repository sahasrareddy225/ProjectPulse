import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/task';
import { buildDependencyRelations } from '../../types/workflow';
import { TaskStatusBadge } from '../tasks/TaskBadges';
import { ArrowDown, Link2 } from 'lucide-react';

interface DependencyViewProps {
  tasks: Task[];
}

export const DependencyView = ({ tasks }: DependencyViewProps) => {
  const navigate = useNavigate();
  const relations = buildDependencyRelations(tasks);

  // Group by upstream task (the one being depended on) so we can render chains
  // For display we show each relation as a dependency pair
  const grouped = new Map<string, typeof relations>();
  for (const rel of relations) {
    const existing = grouped.get(rel.dependsOnId) ?? [];
    existing.push(rel);
    grouped.set(rel.dependsOnId, existing);
  }

  if (relations.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-text-primary mb-4">Dependency Map</h3>
        <p className="text-sm font-medium text-text-secondary">
          No dependencies found for the selected project scope.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-background/30">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-primary" />
          <h3 className="font-bold text-text-primary">Dependency Map</h3>
          <span className="ml-auto text-xs font-semibold text-text-secondary">
            {relations.length} relationship{relations.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="text-xs font-medium text-text-secondary mt-0.5">
          Tasks connected by upstream dependencies
        </p>
      </div>

      <div className="p-6 space-y-3">
        {/* Render each dependency as a vertical pair: upstream ↓ downstream */}
        {Array.from(grouped.entries()).map(([upstreamId, downstreamRels]) => {
          const upstreamTask = tasks.find(t => t.id === upstreamId);
          if (!upstreamTask) return null;
          return (
            <div key={upstreamId} className="bg-background rounded-lg border border-border overflow-hidden">
              {/* Upstream (depended-on) task */}
              <div className="p-3 flex items-center justify-between gap-3">
                <button
                  onClick={() => navigate(`/tasks/${upstreamTask.id}`)}
                  className="text-sm font-bold text-text-primary hover:text-primary transition-colors text-left flex-1 leading-tight"
                >
                  {upstreamTask.title}
                </button>
                <TaskStatusBadge status={upstreamTask.status} />
              </div>

              {/* Arrow + downstream tasks */}
              {downstreamRels.map(rel => (
                <div key={rel.taskId}>
                  <div className="flex items-center gap-2 px-4">
                    <div className="w-px h-4 bg-border ml-2" />
                    <ArrowDown size={14} className={rel.isBlocking ? 'text-warning' : 'text-success'} />
                    {rel.isBlocking && (
                      <span className="text-[10px] font-bold text-warning uppercase tracking-wider">blocking</span>
                    )}
                  </div>
                  <div className={`p-3 border-t flex items-center justify-between gap-3 ${rel.isBlocking ? 'bg-warning-light/30' : ''}`}>
                    <button
                      onClick={() => navigate(`/tasks/${rel.taskId}`)}
                      className="text-sm font-semibold text-text-primary hover:text-primary transition-colors text-left flex-1 leading-tight"
                    >
                      {rel.taskTitle}
                    </button>
                    <TaskStatusBadge status={tasks.find(t => t.id === rel.taskId)?.status ?? 'TODO'} />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
