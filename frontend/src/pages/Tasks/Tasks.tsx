import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import type { Task } from '../../types/task';
import { isTaskOverdue } from '../../types/task';
import { TaskSummary } from '../../components/tasks/TaskSummary';
import { TaskFilters } from '../../components/tasks/TaskFilters';
import type { TaskFiltersState, SortField } from '../../components/tasks/TaskFilters';
import { TaskTable } from '../../components/tasks/TaskTable';
import { TaskFormModal } from '../../components/tasks/TaskFormModal';

const PRIORITY_WEIGHT: Record<string, number> = {
  CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1,
};
const STATUS_WEIGHT: Record<string, number> = {
  BLOCKED: 5, IN_PROGRESS: 4, TODO: 3, REVIEW: 2, COMPLETED: 1,
};

const DEFAULT_FILTERS: TaskFiltersState = {
  search: '',
  projectId: 'ALL',
  status: 'ALL',
  priority: 'ALL',
  assigneeId: 'ALL',
  sortField: 'dueDate',
  sortDir: 'asc',
};

interface TasksProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
}

export const Tasks = ({ tasks, onTasksChange }: TasksProps) => {
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const updateFilters = (patch: Partial<TaskFiltersState>) =>
    setFilters(prev => ({ ...prev, ...patch }));

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      const q = filters.search.toLowerCase();
      if (q) {
        const hit =
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q) ||
          task.assignee.name.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filters.projectId !== 'ALL' && task.projectId !== filters.projectId) return false;
      if (filters.status !== 'ALL' && task.status !== filters.status) return false;
      if (filters.priority !== 'ALL' && task.priority !== filters.priority) return false;
      if (filters.assigneeId !== 'ALL' && task.assignee.id !== filters.assigneeId) return false;
      return true;
    });

    const dir = filters.sortDir === 'asc' ? 1 : -1;
    const field = filters.sortField as SortField;

    result = [...result].sort((a, b) => {
      if (field === 'dueDate')    return dir * (new Date(a.dueDate).getTime()   - new Date(b.dueDate).getTime());
      if (field === 'priority')  return dir * ((PRIORITY_WEIGHT[a.priority] ?? 0) - (PRIORITY_WEIGHT[b.priority] ?? 0));
      if (field === 'status')    return dir * ((STATUS_WEIGHT[a.status] ?? 0)   - (STATUS_WEIGHT[a.status] ?? 0));
      if (field === 'createdAt') return dir * (new Date(a.createdAt).getTime()  - new Date(b.createdAt).getTime());
      return 0;
    });

    result.sort((a, b) => {
      const ao = isTaskOverdue(a) ? -1 : 0;
      const bo = isTaskOverdue(b) ? -1 : 0;
      return ao - bo;
    });

    return result;
  }, [tasks, filters]);

  const handleCreate = (data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    onTasksChange([newTask, ...tasks]);
    setIsCreating(false);
  };

  const handleEdit = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    onTasksChange(tasks.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    setEditingTask(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Tasks</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Operational task registry across projects, assignees, and milestone deadlines.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white font-medium text-xs rounded-md hover:bg-primary/90 transition-colors shadow-none"
        >
          <Plus size={14} />
          Create Task
        </button>
      </div>

      <TaskSummary tasks={tasks} />
      <TaskFilters filters={filters} onChange={updateFilters} />

      <div className="flex items-center justify-between text-xs text-text-muted pt-1">
        <span>
          Showing <strong className="text-text-primary font-mono">{filteredTasks.length}</strong> of{' '}
          <strong className="text-text-primary font-mono">{tasks.length}</strong> tasks
        </span>
      </div>

      <TaskTable tasks={filteredTasks} onEdit={task => setEditingTask(task)} />

      {isCreating && (
        <TaskFormModal mode="create" onSave={handleCreate} onClose={() => setIsCreating(false)} />
      )}
      {editingTask && (
        <TaskFormModal mode="edit" task={editingTask} onSave={handleEdit} onClose={() => setEditingTask(null)} />
      )}
    </div>
  );
};

