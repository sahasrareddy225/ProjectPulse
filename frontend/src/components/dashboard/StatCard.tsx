import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard = ({ title, value, icon, trend, trendPositive }: StatCardProps) => {
  return (
    <div className="bg-surface rounded-lg p-4 border border-border flex flex-col justify-between transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">{title}</span>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-text-primary">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trendPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};

