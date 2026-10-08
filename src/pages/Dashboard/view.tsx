import { ActivityPanel, MetricCards, NotificationsPanel, ProductivityChart, ProjectHealth, ProjectsOverview, SprintOverview, TasksOverview } from '../../components/dashboard/DashboardPanels'
import type { PageName } from '../../types'

export function Dashboard({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return <>
    <MetricCards />
    <div className="dashboard-grid"><div><ProductivityChart /><div className="tasks-overview"><ActivityPanel onNavigate={onNavigate} /><SprintOverview /></div></div><div className="right-stack"><ProjectHealth /><NotificationsPanel /><ProjectsOverview /></div></div>
    <div className="tasks-overview"><TasksOverview onNavigate={onNavigate} /><article className="panel"><div className="panel-heading"><div><h2>Team pulse</h2><p>How the team is feeling this week</p></div><span className="status-pill">Looking good</span></div><div className="sprint-summary"><span className="activity-icon">✦</span><div className="sprint-copy"><strong>Team focus is up 8%</strong><span>12 teammates checked in this week</span></div></div><div className="sprint-progress"><div className="progress-track"><div className="progress-fill" style={{ width: '82%' }} /></div></div></article></div>
  </>
}