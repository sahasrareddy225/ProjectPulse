import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { dashboardData } from '../../data/dashboardData';

export const Notifications = () => {
  return (
    <div className="bg-surface rounded-lg border border-border flex flex-col h-full overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
        <button className="text-xs text-primary hover:underline font-medium">
          Mark all read
        </button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border min-h-[220px]">
        {dashboardData.notifications.map((notif) => {
          let Icon = Info;
          let iconClass = 'text-sky-600 bg-sky-50';
          
          if (notif.type === 'warning') {
            Icon = AlertTriangle;
            iconClass = 'text-amber-600 bg-amber-50';
          } else if (notif.type === 'success') {
            Icon = CheckCircle;
            iconClass = 'text-emerald-600 bg-emerald-50';
          }

          return (
            <div key={notif.id} className="flex items-start gap-3 p-3 hover:bg-neutral-50/60 transition-colors">
              <div className={`mt-0.5 w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${iconClass}`}>
                <Icon size={13} />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary leading-snug">{notif.message}</p>
                <span className="text-[11px] text-text-muted mt-0.5">{notif.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

