import { Edit3, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../types/task';
import { isTaskOverdue } from '../../types/task';
import { TaskStatusBadge, TaskPriorityBadge } from './TaskBadges';
import { initialProjects } from '../../data/projectsData';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

export const TaskTable = ({ tasks, onEdit }: TaskTableProps) => {
  const navigate = useNavigate();

  const getProjectName = (projectId: string) =>
    initialProjects.find(p => p.id === projectId)?.name ?? projectId;

  if (tasks.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-10 flex flex-col items-center justify-center text-center">
        <ListChecks size={20} className="text-text-muted mb-2" />
        <h3 className="text-sm font-semibold text-text-primary">No tasks found</h3>
        <p className="text-xs text-text-muted max-w-xs mt-0.5">
          No tasks match your filter criteria. Try adjusting your parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-50/50 border-b border-border text-text-muted font-semibold">
              <th className="py-2.5 px-4 w-72">Task</th>
              <th className="py-2.5 px-4">Project</th>
              <th className="py-2.5 px-4">Assignee</th>
              <th className="py-2.5 px-4">Priority</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Due Date</th>
              <th className="py-2.5 px-3 w-10 text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map(task => {
              const overdue = isTaskOverdue(task);
              return (
                <tr
                  key={task.id}
                  className={`group hover:bg-neutral-50/60 transition-colors ${overdue && task.status !== 'COMPLETED' ? 'bg-amber-50/30' : ''}`}
                >
                  <td className="py-2.5 px-4">
                    <button
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="text-left font-semibold text-text-primary hover:text-primary transition-colors line-clamp-1"
                    >
                      {task.title}
                    </button>
                    {task.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-mono text-text-muted bg-neutral-100 px-1 py-0.2 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-text-secondary whitespace-nowrap">
                    {getProjectName(task.projectId)}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-neutral-100 border border-neutral-200 text-text-primary font-semibold text-[10px] flex items-center justify-center flex-shrink-0">
                        {task.assignee.initials}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {task.assignee.name.split(' ')[0]}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap font-mono text-xs">
                    <span className={overdue && task.status !== 'COMPLETED' ? 'text-amber-600 font-semibold' : 'text-text-muted'}>
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onEdit(task)}
                      className="p-1 rounded text-text-muted hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit task"
                    >
                      <Edit3 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="md:hidden divide-y divide-border">
        {tasks.map(task => {
          const overdue = isTaskOverdue(task);
          return (
            <div key={task.id} className={`p-3 text-xs ${overdue ? 'bg-amber-50/30' : ''}`}>
              <div className="flex justify-between items-start gap-2 mb-1">
                <button
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="text-left font-semibold text-text-primary hover:text-primary leading-tight"
                >
                  {task.title}
                </button>
                <button onClick={() => onEdit(task)} className="p-1 text-text-muted hover:text-text-primary">
                  <Edit3 size={13} />
                </button>
              </div>
              <p className="text-[11px] text-text-muted mb-2">{getProjectName(task.projectId)}</p>
              <div className="flex flex-wrap gap-2 items-center text-[11px]">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
                <span className="font-mono text-text-muted ml-auto">
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

