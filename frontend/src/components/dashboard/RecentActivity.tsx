import { dashboardData } from '../../data/dashboardData';

export const RecentActivity = () => {
  return (
    <div className="bg-surface rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm text-text-primary">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border">
        {dashboardData.activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-neutral-50/60 transition-colors">
            <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-text-primary">
              {activity.user.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary leading-tight">{activity.description}</p>
              <span className="text-[11px] text-text-muted mt-0.5">{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

