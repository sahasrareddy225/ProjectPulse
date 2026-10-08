import { 
  FolderKanban, 
  CheckSquare, 
  AlertCircle, 
  Activity 
} from 'lucide-react';
import { dashboardData } from '../../data/dashboardData';
import { StatCard } from '../../components/dashboard/StatCard';
import { ProjectHealthCard } from '../../components/dashboard/ProjectHealthCard';
import { Notifications } from '../../components/dashboard/Notifications';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { TaskCompletionChart } from '../../components/dashboard/TaskCompletionChart';

export const Dashboard = () => {
  const { stats } = dashboardData;

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Dashboard</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Operational overview of active projects, task completion, and team health.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Projects" 
          value={stats.activeProjects} 
          icon={<FolderKanban size={16} />} 
          trend="+2 this month"
          trendPositive={true}
        />
        <StatCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          icon={<Activity size={16} />} 
          trend="12 due today"
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats.completedTasks} 
          icon={<CheckSquare size={16} />} 
          trend="+18% vs last week"
          trendPositive={true}
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats.overdueTasks} 
          icon={<AlertCircle size={16} />} 
          trend="-2 from yesterday"
          trendPositive={true}
        />
      </div>

      {/* Middle Row: Health, Chart, Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <ProjectHealthCard />
        </div>
        <div className="lg:col-span-1">
          <TaskCompletionChart />
        </div>
        <div className="lg:col-span-1">
          <Notifications />
        </div>
      </div>

      {/* Bottom Row: Recent Activity */}
      <div className="grid grid-cols-1 gap-4">
        <RecentActivity />
      </div>
    </div>
  );
};

