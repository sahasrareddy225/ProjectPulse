import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '../../types/task';
import { initialProjects } from '../../data/projectsData';
import { ALL_ASSIGNEES } from '../../data/tasksData';
import { FormInput } from '../common/FormInput';

interface TaskFormModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'BLOCKED', label: 'Blocked' },
];
const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const EMPTY_FORM = {
  title: '', description: '', projectId: '', assigneeId: '',
  status: 'TODO' as TaskStatus, priority: 'MEDIUM' as TaskPriority,
  dueDate: '', estimatedHours: '', tags: '',
};

const labelClass = 'text-xs font-bold uppercase tracking-wider text-text-secondary';
const selectClass = (hasError?: boolean) =>
  `py-2 px-3 border rounded-lg bg-surface text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors ${hasError ? 'border-red-400' : 'border-border'}`;

export const TaskFormModal = ({ mode, task, onSave, onClose }: TaskFormModalProps) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && task) {
      setForm({
        title: task.title, description: task.description, projectId: task.projectId,
        assigneeId: task.assignee.id, status: task.status, priority: task.priority,
        dueDate: task.dueDate, estimatedHours: task.estimatedHours?.toString() ?? '', tags: task.tags.join(', '),
      });
    }
  }, [mode, task]);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim())   e.title      = 'Required';
    if (!form.projectId)      e.projectId  = 'Required';
    if (!form.assigneeId)     e.assigneeId = 'Required';
    if (!form.dueDate)        e.dueDate    = 'Required';
    if (form.estimatedHours && isNaN(Number(form.estimatedHours))) e.estimatedHours = 'Must be a number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const assignee = ALL_ASSIGNEES.find(a => a.id === form.assigneeId)!;
    onSave({
      projectId: form.projectId, title: form.title.trim(), description: form.description.trim(),
      status: form.status, priority: form.priority, assignee,
      dueDate: form.dueDate,
      estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : undefined,
      actualHours: mode === 'edit' ? task?.actualHours : undefined,
      dependencies: mode === 'edit' ? (task?.dependencies ?? []) : [],
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-[3px]" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface rounded-2xl shadow-[var(--shadow-modal)] w-full max-w-lg border border-border overflow-hidden fade-scale-in">
        {/* Modal header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold tracking-tight text-text-primary">
            {mode === 'create' ? 'Create Task' : 'Edit Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          <FormInput
            label="Task Title"
            placeholder="e.g. Design authentication flow"
            value={form.title}
            onChange={e => update('title', e.target.value)}
            error={errors.title}
          />

          <div className="flex flex-col gap-1">
            <label className={labelClass}>Description</label>
            <textarea
              placeholder="What needs to be done?"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className="px-3 py-2.5 border border-border rounded-lg outline-none text-sm bg-surface text-text-primary focus:border-primary focus:ring-2 focus:ring-primary/30 transition-colors min-h-[80px] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Project {errors.projectId && <span className="text-red-500 normal-case font-medium ml-1">{errors.projectId}</span>}</label>
              <select value={form.projectId} onChange={e => update('projectId', e.target.value)} className={selectClass(!!errors.projectId)}>
                <option value="">Select project…</option>
                {initialProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Assignee {errors.assigneeId && <span className="text-red-500 normal-case font-medium ml-1">{errors.assigneeId}</span>}</label>
              <select value={form.assigneeId} onChange={e => update('assigneeId', e.target.value)} className={selectClass(!!errors.assigneeId)}>
                <option value="">Select assignee…</option>
                {ALL_ASSIGNEES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className={selectClass()}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Priority</label>
              <select value={form.priority} onChange={e => update('priority', e.target.value)} className={selectClass()}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormInput label="Due Date" type="date" value={form.dueDate} onChange={e => update('dueDate', e.target.value)} error={errors.dueDate} />
            <FormInput label="Estimated Hours" type="number" placeholder="e.g. 8" value={form.estimatedHours} onChange={e => update('estimatedHours', e.target.value)} error={errors.estimatedHours} />
          </div>

          <FormInput
            label="Tags (comma-separated)"
            placeholder="e.g. frontend, auth, design"
            value={form.tags}
            onChange={e => update('tags', e.target.value)}
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-background rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-surface text-sm font-bold rounded-lg hover:bg-primary-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
