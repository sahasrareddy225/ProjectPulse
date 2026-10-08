import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../../types/notification';
import { NotificationIcon } from '../../components/notifications/NotificationIcon';
import { relativeTime } from '../../utils/time';
import { CheckCheck } from 'lucide-react';

type FilterTab = 'ALL' | 'UNREAD' | 'TASKS' | 'PROJECTS' | 'WORKFLOW';

interface NotificationsPageProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

const TASK_TYPES = new Set(['TASK_ASSIGNED', 'TASK_DUE_SOON', 'TASK_OVERDUE', 'TASK_COMPLETED']);
const PROJECT_TYPES = new Set(['PROJECT_STATUS_CHANGED', 'PROJECT_HEALTH_CHANGED']);
const WORKFLOW_TYPES = new Set(['DEPENDENCY_BLOCKED']);

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'ALL',      label: 'All' },
  { key: 'UNREAD',   label: 'Unread' },
  { key: 'TASKS',    label: 'Tasks' },
  { key: 'PROJECTS', label: 'Projects' },
  { key: 'WORKFLOW', label: 'Workflow' },
];

export const Notifications = ({ notifications, onMarkRead, onMarkAllRead }: NotificationsPageProps) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'UNREAD':   return notifications.filter(n => !n.read);
      case 'TASKS':    return notifications.filter(n => TASK_TYPES.has(n.type));
      case 'PROJECTS': return notifications.filter(n => PROJECT_TYPES.has(n.type));
      case 'WORKFLOW': return notifications.filter(n => WORKFLOW_TYPES.has(n.type));
      default:         return notifications;
    }
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = (notif: Notification) => {
    onMarkRead(notif.id);
    if (notif.taskId) navigate(`/tasks/${notif.taskId}`);
    else if (notif.projectId) navigate(`/projects/${notif.projectId}`);
  };

  const getEmptyMessage = () => {
    if (activeTab === 'UNREAD') return 'No unread notifications.';
    if (filtered.length === 0) return 'No notifications match this filter.';
    return "You're all caught up.";
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Notifications</h1>
          <p className="text-xs text-text-muted mt-0.5">
            System activity alerts, task deadlines, and project updates.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-surface text-xs font-medium text-text-primary rounded-md hover:bg-neutral-50 transition-colors"
          >
            <CheckCheck size={14} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border border-border rounded-md p-0.5 bg-neutral-100/60 text-xs w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-surface text-text-primary shadow-xs'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
            {tab.key === 'UNREAD' && unreadCount > 0 && (
              <span className="ml-1.5 font-mono text-[10px] bg-primary text-white px-1.5 py-0.2 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-10 flex flex-col items-center justify-center text-center">
          <CheckCheck size={20} className="text-emerald-500 mb-2" />
          <p className="text-sm font-semibold text-text-primary">{getEmptyMessage()}</p>
          <p className="text-xs text-text-muted mt-0.5">No notifications require your attention.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border overflow-hidden">
          {filtered.map(notif => (
            <div
              key={notif.id}
              onClick={() => handleNotifClick(notif)}
              className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-neutral-50/70 ${
                !notif.read ? 'bg-primary-light/10' : ''
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                <NotificationIcon type={notif.type} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs ${!notif.read ? 'font-semibold text-text-primary' : 'font-medium text-text-primary'}`}>
                    {notif.title}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] text-text-muted font-mono whitespace-nowrap">
                      {relativeTime(notif.createdAt)}
                    </span>
                    {!notif.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 leading-snug">
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

