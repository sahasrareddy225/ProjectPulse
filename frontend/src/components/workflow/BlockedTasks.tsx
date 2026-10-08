import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/task';
import { isTaskOverdue } from '../../types/task';
import { TaskStatusBadge, TaskPriorityBadge } from '../tasks/TaskBadges';
import { initialProjects } from '../../data/projectsData';
import { AlertTriangle, Calendar, User } from 'lucide-react';

interface BlockedTasksProps {
  tasks: Task[];
  allTasks: Task[]; // full list for resolving dependency titles
}

export const BlockedTasks = ({ tasks, allTasks }: BlockedTasksProps) => {
  const navigate = useNavigate();
  const blocked = tasks.filter(t => t.status === 'BLOCKED');
  const taskMap = new Map(allTasks.map(t => [t.id, t]));

  const getProjectName = (id: string) =>
    initialProjects.find(p => p.id === id)?.name ?? id;

  if (blocked.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-text-primary mb-4">Blocked Tasks</h3>
        <div className="flex items-center gap-3 py-4">
          <div className="w-8 h-8 rounded-full bg-success-light flex items-center justify-center">
            <AlertTriangle size={16} className="text-success" />
          </div>
          <p className="text-sm font-medium text-text-secondary">No blocked tasks — workflow is clear.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border bg-warning-light/40">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="font-bold text-text-primary">Blocked Tasks</h3>
          <span className="ml-auto text-xs font-bold text-warning bg-warning-light px-2 py-0.5 rounded-full border border-warning/20">
            {blocked.length}
          </span>
        </div>
      </div>
      <div className="divide-y divide-border">
        {blocked.map(task => {
          const overdue = isTaskOverdue(task);
          const blockingDeps = task.dependencies
            .map(id => taskMap.get(id))
            .filter((dep): dep is Task => !!dep && dep.status !== 'COMPLETED');

          return (
            <div key={task.id} className="p-5 hover:bg-background/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex-1">
                  <button
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className="text-left font-bold text-text-primary hover:text-primary transition-colors text-sm leading-snug"
                  >
                    {task.title}
                  </button>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-medium text-text-secondary">
                    <span className="font-semibold text-primary-light bg-primary-light text-primary px-1.5 py-0.5 rounded-md text-[11px]">
                      {getProjectName(task.projectId)}
                    </span>
                    <div className="flex items-center gap-1">
                      <User size={12} />{task.assignee.name.split(' ')[0]}
                    </div>
                    <div className={`flex items-center gap-1 ${overdue ? 'text-warning font-bold' : ''}`}>
                      <Calendar size={12} />
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {overdue && ' ⚠'}
                    </div>
                  </div>

                  {/* Blocking dependencies */}
                  {blockingDeps.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Waiting on:</p>
                      {blockingDeps.map(dep => (
                        <div key={dep.id} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-warning" />
                          <button
                            onClick={() => navigate(`/tasks/${dep.id}`)}
                            className="text-xs font-semibold text-text-secondary hover:text-primary transition-colors"
                          >
                            {dep.title}
                          </button>
                          <TaskStatusBadge status={dep.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
