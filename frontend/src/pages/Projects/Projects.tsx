import { useState, useMemo, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, LayoutGrid, List, Loader2 } from 'lucide-react';
import type { Project, ProjectStatus } from '../../data/projectsData';
import { ProjectCard } from '../../components/projects/ProjectCard';
import { FormInput } from '../../components/common/FormInput';
import { projectService } from '../../services/projectService';
import { useAuthStore } from '../../store/authStore';

export const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreateProject = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    dueDate: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let isMounted = true;
    async function loadProjects() {
      setIsLoading(true);
      try {
        const data = await projectService.getProjects();
        if (isMounted) {
          setProjects(data);
          setApiError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setApiError(err instanceof Error ? err.message : 'Could not load projects');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Project name is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError(null);
    try {
      const created = await projectService.createProject({
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        owner: user?.name || user?.email || 'Owner',
        status: 'Active',
        health: 'Healthy'
      });

      setProjects(prev => [created, ...prev]);
      setIsModalOpen(false);
      setFormData({ name: '', description: '', startDate: '', dueDate: '' });

      // Trigger immediate notification refresh
      window.dispatchEvent(new CustomEvent('projectpulse:notification-refresh'));
      // Follow-up refresh to ensure Kafka consumption to Atlas is reflected
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('projectpulse:notification-refresh'));
      }, 1000);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Projects</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Operational workspace for active initiatives, milestones, and team members.
          </p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-white font-medium text-xs rounded-md hover:bg-primary/90 transition-colors shadow-none"
          >
            <Plus size={14} />
            New Project
          </button>
        )}
      </div>

      {apiError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="text-rose-500 hover:text-rose-700 text-xs font-semibold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-border rounded-md bg-surface text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'All')}
              className="py-1.5 pl-3 pr-8 border border-border rounded-md bg-surface text-xs font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center border border-border rounded-md p-0.5 bg-neutral-100/60 text-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === 'table' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <List size={13} />
            Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-surface text-text-primary shadow-xs' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <LayoutGrid size={13} />
            Grid
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {isLoading ? (
        <div className="bg-surface border border-border rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 size={24} className="animate-spin text-primary" />
          <p className="text-xs text-text-muted">Loading projects from Domain Service...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        viewMode === 'table' ? (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 text-text-muted font-semibold">
                  <th className="py-2.5 px-4">Project</th>
                  <th className="py-2.5 px-4">Owner</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Health</th>
                  <th className="py-2.5 px-4">Progress</th>
                  <th className="py-2.5 px-4 text-right">Members</th>
                  <th className="py-2.5 px-4 text-right">Tasks</th>
                  <th className="py-2.5 px-4 text-right">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProjects.map(project => (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="hover:bg-neutral-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {project.name}
                      <p className="text-[11px] font-normal text-text-muted truncate max-w-xs">{project.description}</p>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {project.owner || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-mono uppercase text-text-muted font-semibold px-1.5 py-0.5 rounded bg-neutral-100">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          project.health === 'Healthy' ? 'bg-emerald-500' :
                          project.health === 'At Risk' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {project.health}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="font-mono text-text-secondary text-[11px]">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-secondary">
                      {project.membersCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-secondary">
                      {project.tasksCount}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-text-muted">
                      {project.dueDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )
      ) : (
        <div className="bg-surface border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <Search size={20} className="text-text-muted mb-2" />
          <h3 className="text-sm font-semibold text-text-primary">No projects found</h3>
          <p className="text-xs text-text-muted mt-0.5 max-w-sm">
            We couldn't find any projects matching your search filter.
          </p>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40"
          onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="bg-surface rounded-lg shadow-lg w-full max-w-md overflow-hidden border border-border">
            <div className="flex justify-between items-center px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Create New Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-4 space-y-3 text-xs">
              <FormInput
                label="Project Name"
                placeholder="e.g. ProjectPulse Redesign"
                value={formData.name}
                onChange={e => updateForm('name', e.target.value)}
                error={formErrors.name}
              />

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Description</label>
                <textarea
                  placeholder="Briefly describe the project…"
                  value={formData.description}
                  onChange={e => updateForm('description', e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-surface text-text-primary text-xs focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
                />
                {formErrors.description && <span className="text-[11px] font-semibold text-red-500">{formErrors.description}</span>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormInput label="Start Date" type="date" value={formData.startDate} onChange={e => updateForm('startDate', e.target.value)} error={formErrors.startDate} />
                <FormInput label="Due Date"   type="date" value={formData.dueDate}   onChange={e => updateForm('dueDate',   e.target.value)} error={formErrors.dueDate} />
              </div>

              {apiError && (
                <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {apiError}
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-70"
                >
                  {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

