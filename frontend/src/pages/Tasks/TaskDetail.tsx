import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Edit3, Clock, Calendar, User, Tag, Link2 } from 'lucide-react';
import type { Task } from '../../types/task';
import { isTaskOverdue } from '../../types/task';
import { TaskStatusBadge, TaskPriorityBadge } from '../../components/tasks/TaskBadges';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';
import { initialProjects } from '../../data/projectsData';
import { initialTasks } from '../../data/tasksData';

// TaskDetail is a standalone view that can be accessed at /tasks/:taskId
// It reads from the same task store as the list page.
// In production this would be a GET /tasks/:id API call.

interface TaskDetailProps {
  tasks: Task[];
  onEdit: (updated: Task) => void;
}

export const TaskDetail = ({ tasks, onEdit }: TaskDetailProps) => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <h2 className="text-xl font-bold text-text-primary">Task not found</h2>
        <p className="text-sm text-text-secondary">This task may have been deleted or the ID is invalid.</p>
        <button
          onClick={() => navigate('/tasks')}
          className="px-4 py-2 bg-primary text-surface font-semibold rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const projectName = initialProjects.find(p => p.id === task.projectId)?.name ?? task.projectId;
  const overdue = isTaskOverdue(task);

  // Resolve dependency titles from the shared task list
  const dependencyTasks = initialTasks.filter(t => task.dependencies.includes(t.id));
  const blockedByThis = initialTasks.filter(t => t.dependencies.includes(task.id));

  const handleSave = (data: Omit<Task, 'id' | 'createdAt'>) => {
    onEdit({ ...task, ...data });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-8">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
        <ArrowLeft size={16} />
        Back to Tasks
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">{task.title}</h1>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {overdue && (
                <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border bg-warning-light text-warning border-warning/30">
                  Overdue
                </span>
              )}
            </div>
            {task.description && (
              <p className="text-sm font-medium text-text-secondary leading-relaxed max-w-2xl">
                {task.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-border bg-background text-text-primary font-semibold text-sm rounded-lg hover:bg-border transition-colors shadow-sm flex-shrink-0"
          >
            <Edit3 size={15} />
            Edit Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata grid */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-5">Task Details</h3>
            <div className="grid grid-cols-2 gap-y-6 gap-x-6">
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Project</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Link2 size={15} className="text-text-secondary" />
                  {projectName}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Assignee</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-primary-light text-primary text-[10px] font-bold flex items-center justify-center border border-primary/10">
                    {task.assignee.initials}
                  </div>
                  {task.assignee.name}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Due Date</span>
                <div className={`flex items-center gap-2 text-sm font-semibold ${overdue ? 'text-warning' : 'text-text-primary'}`}>
                  <Calendar size={15} className="text-text-secondary" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Created</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <User size={15} className="text-text-secondary" />
                  {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Estimated Hours</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Clock size={15} className="text-text-secondary" />
                  {task.estimatedHours != null ? `${task.estimatedHours}h` : '—'}
                </div>
              </div>
              <div>
                <span className="block text-xs font-medium text-text-secondary mb-1">Actual Hours</span>
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Clock size={15} className="text-text-secondary" />
                  {task.actualHours != null ? `${task.actualHours}h` : '—'}
                </div>
              </div>
            </div>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="mt-6 pt-5 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={14} className="text-text-secondary" />
                  <span className="text-xs font-medium text-text-secondary">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 text-xs font-semibold bg-primary-light text-primary rounded-md border border-primary/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Dependencies */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-4">Dependencies</h3>
            
            {dependencyTasks.length === 0 && blockedByThis.length === 0 ? (
              <p className="text-sm text-text-secondary font-medium">No dependencies.</p>
            ) : (
              <div className="space-y-5">
                {dependencyTasks.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Blocked by</p>
                    <div className="space-y-2">
                      {dependencyTasks.map(dep => (
                        <div key={dep.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-warning-light border border-warning/20">
                          <span className="text-sm font-semibold text-text-primary">{dep.title}</span>
                          <TaskStatusBadge status={dep.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {blockedByThis.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Blocks</p>
                    <div className="space-y-2">
                      {blockedByThis.map(dep => (
                        <div key={dep.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-background border border-border">
                          <span className="text-sm font-semibold text-text-primary">{dep.title}</span>
                          <TaskStatusBadge status={dep.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assignee sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-text-primary mb-4">Assignee</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary font-bold flex items-center justify-center border border-primary/10 text-sm flex-shrink-0">
                {task.assignee.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary">{task.assignee.name}</p>
                <p className="text-xs font-medium text-text-secondary">{task.assignee.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <TaskFormModal
          mode="edit"
          task={task}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};
