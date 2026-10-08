import type { NotificationType } from '../../types/notification';
import {
  UserCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HeartPulse,
  Link2,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';

interface NotifIconConfig {
  Icon: ComponentType<LucideProps>;
  color: string;
  bg: string;
}

const ICON_CONFIG: Record<NotificationType, NotifIconConfig> = {
  TASK_ASSIGNED:           { Icon: UserCheck,     color: 'text-primary',  bg: 'bg-primary-light' },
  TASK_DUE_SOON:           { Icon: Clock,         color: 'text-warning',  bg: 'bg-warning-light' },
  TASK_OVERDUE:            { Icon: AlertCircle,   color: 'text-warning',  bg: 'bg-warning-light' },
  TASK_COMPLETED:          { Icon: CheckCircle2,  color: 'text-success',  bg: 'bg-success-light' },
  PROJECT_STATUS_CHANGED:  { Icon: RefreshCw,     color: 'text-info',     bg: 'bg-info-light' },
  PROJECT_HEALTH_CHANGED:  { Icon: HeartPulse,    color: 'text-warning',  bg: 'bg-warning-light' },
  DEPENDENCY_BLOCKED:      { Icon: Link2,         color: 'text-red-500',  bg: 'bg-red-50' },
};

export const NotificationIcon = ({ type, size = 16 }: { type: NotificationType; size?: number }) => {
  const cfg = ICON_CONFIG[type];
  return (
    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
      <cfg.Icon size={size} className={cfg.color} />
    </div>
  );
};
