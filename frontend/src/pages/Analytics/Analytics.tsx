import { useState, useMemo } from 'react';
import { initialTasks } from '../../data/tasksData';
import { initialProjects } from '../../data/projectsData';
import { calculateCompletionMetrics, calculateProjectHealth, calculateOverdueMetrics } from '../../utils/analytics';
import { CompletionOverview } from '../../components/analytics/CompletionOverview';
import { ProjectHealth } from '../../components/analytics/ProjectHealth';
import { OverdueAnalysis } from '../../components/analytics/OverdueAnalysis';
import { PriorityDistribution } from '../../components/analytics/PriorityDistribution';
import { DependencyRisk } from '../../components/analytics/DependencyRisk';
import { WorkloadAnalysis } from '../../components/analytics/WorkloadAnalysis';
import { CompletionTrendChart } from '../../components/analytics/CompletionTrendChart';
import { ProjectComparison } from '../../components/analytics/ProjectComparison';
import { Filter } from 'lucide-react';

export const Analytics = () => {
  const [projectFilter, setProjectFilter] = useState<string>('ALL');

  const scopedTasks = useMemo(() => {
    if (projectFilter === 'ALL') return initialTasks;
    return initialTasks.filter(task => task.projectId === projectFilter);
  }, [projectFilter]);

  const topMetrics = useMemo(() => {
    const completion = calculateCompletionMetrics(scopedTasks);
    const overdue = calculateOverdueMetrics(scopedTasks);
    const health = calculateProjectHealth(scopedTasks);
    return {
      completionRate: completion.completionRate,
      overdueCount: overdue.totalOverdue,
      blockedCount: completion.blocked,
      healthStatus: health.status
    };
  }, [scopedTasks]);

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Analytics</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Project performance and operational insights
          </p>
        </div>

        {/* Scope Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Filter size={13} />
            <span className="font-medium">Project:</span>
          </div>
          <select
            value={projectFilter}
            onChange={e => setProjectFilter(e.target.value)}
            className="py-1.5 px-3 border border-border rounded-md bg-surface text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
          >
            <option value="ALL">All Projects ({initialProjects.length})</option>
            {initialProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface p-3 border border-border rounded-lg">
        <div className="px-2">
          <span className="text-[10px] uppercase font-semibold text-text-muted block">Completion Rate</span>
          <span className="text-xl font-bold font-mono text-emerald-600">{topMetrics.completionRate}%</span>
        </div>
        <div className="px-2 border-l border-border">
          <span className="text-[10px] uppercase font-semibold text-text-muted block">Overdue Tasks</span>
          <span className={`text-xl font-bold font-mono ${topMetrics.overdueCount > 0 ? 'text-amber-600' : 'text-text-primary'}`}>
            {topMetrics.overdueCount}
          </span>
        </div>
        <div className="px-2 border-l border-border">
          <span className="text-[10px] uppercase font-semibold text-text-muted block">Blocked</span>
          <span className={`text-xl font-bold font-mono ${topMetrics.blockedCount > 0 ? 'text-rose-600' : 'text-text-primary'}`}>
            {topMetrics.blockedCount}
          </span>
        </div>
        <div className="px-2 border-l border-border">
          <span className="text-[10px] uppercase font-semibold text-text-muted block">Health</span>
          <span className={`text-xl font-bold ${
            topMetrics.healthStatus === 'Healthy' ? 'text-emerald-600' :
            topMetrics.healthStatus === 'At Risk' ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {topMetrics.healthStatus}
          </span>
        </div>
      </div>

      {/* Primary Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <CompletionOverview tasks={scopedTasks} />
          <CompletionTrendChart tasks={scopedTasks} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProjectHealth tasks={scopedTasks} />
            <WorkloadAnalysis tasks={scopedTasks} />
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-4">
          <OverdueAnalysis tasks={scopedTasks} />
          <PriorityDistribution tasks={scopedTasks} />
          <DependencyRisk tasks={scopedTasks} allTasks={initialTasks} />
        </div>
      </div>

      {/* Project Comparison Table */}
      {projectFilter === 'ALL' && (
        <div className="pt-2">
          <ProjectComparison allTasks={initialTasks} />
        </div>
      )}
    </div>
  );
};

