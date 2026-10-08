import { ArrowDownRight, ArrowUpRight, BellRing, Check, CircleAlert, Clock3, FolderKanban, ListTodo, Users } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import type { PageName, Project, Task } from '../../types'

const projects: Project[] = [
  { id: 'PR-24', name: 'Website redesign', category: 'Product design', owner: 'Mia Chen', dueDate: 'Oct 18', progress: 78, status: 'On track', color: '' },
  { id: 'PR-31', name: 'Q4 marketing campaign', category: 'Marketing', owner: 'Jordan Lee', dueDate: 'Oct 24', progress: 52, status: 'At risk', color: 'orange' },
  { id: 'PR-19', name: 'Mobile app launch', category: 'Engineering', owner: 'Sam Rivera', dueDate: 'Nov 02', progress: 64, status: 'On track', color: 'green' },
]

const tasks: Task[] = [
  { id: 'TK-104', title: 'Finalize onboarding wireframes', project: 'Website redesign', assignee: 'Mia Chen', dueDate: 'Today', priority: 'High', done: false },
  { id: 'TK-109', title: 'Review campaign landing page', project: 'Q4 marketing campaign', assignee: 'Alex Morgan', dueDate: 'Oct 09', priority: 'Medium', done: false },
  { id: 'TK-112', title: 'Share sprint notes with team', project: 'Mobile app launch', assignee: 'Sam Rivera', dueDate: 'Oct 11', priority: 'Low', done: true },
]

const activities = [
  { icon: 'MC', title: 'Mia Chen completed a task', detail: 'Updated the mobile navigation flow · 18 min ago', tag: 'Done', color: '' },
  { icon: 'JL', title: 'Jordan Lee added a comment', detail: '“The revised direction looks great.” · 1 hr ago', tag: 'Comment', color: 'blue' },
  { icon: 'SR', title: 'Sam Rivera created a task', detail: 'API integration checklist · 3 hrs ago', tag: 'New task', color: '' },
]

export function MetricCards() {
  const metrics = [
    { label: 'Active projects', value: '08', change: '+2 this month', trend: 'up', Icon: FolderKanban },
    { label: 'Tasks completed', value: '64', change: '+12.5%', trend: 'up', Icon: ListTodo },
    { label: 'Overdue tasks', value: '05', change: '2 fewer this week', trend: 'down', Icon: Clock3 },
    { label: 'Team members', value: '12', change: 'Across 4 teams', trend: 'up', Icon: Users },
  ]
  return <section className="metrics-grid">{metrics.map(({ label, value, change, trend, Icon }) => <article className="metric-card" key={label}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={14} /></span></div><div className="metric-value">{value}<span className={`metric-change ${trend === 'down' ? 'down' : ''}`}>{trend === 'down' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}{change}</span></div></article>)}</section>
}

export function ProductivityChart() {
  return <article className="panel"><div className="panel-heading"><div><h2>Team productivity</h2><p>Task completion over the last 8 weeks</p></div><button className="select-chip">Last 8 weeks⌄</button></div><div className="chart-wrap"><svg viewBox="0 0 600 190" role="img" aria-label="Team productivity chart"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4168d1" stopOpacity=".16" /><stop offset="100%" stopColor="#4168d1" stopOpacity="0" /></linearGradient></defs><line className="chart-grid" x1="36" y1="25" x2="590" y2="25"/><line className="chart-grid" x1="36" y1="66" x2="590" y2="66"/><line className="chart-grid" x1="36" y1="107" x2="590" y2="107"/><line className="chart-grid" x1="36" y1="148" x2="590" y2="148"/><text className="chart-label" x="4" y="28">100</text><text className="chart-label" x="11" y="69">75</text><text className="chart-label" x="11" y="110">50</text><text className="chart-label" x="11" y="151">25</text><path className="chart-area" d="M40 124 C76 119 82 105 115 108 S163 91 190 97 S238 79 265 84 S309 57 340 72 S390 55 416 62 S463 39 490 48 S541 31 580 40 L580 166 L40 166Z"/><path className="chart-line" d="M40 124 C76 119 82 105 115 108 S163 91 190 97 S238 79 265 84 S309 57 340 72 S390 55 416 62 S463 39 490 48 S541 31 580 40"/><path className="chart-line-secondary" d="M40 141 C79 135 84 125 115 127 S162 115 190 118 S240 109 265 112 S309 96 340 103 S389 88 416 96 S466 80 490 88 S542 74 580 78"/><text className="chart-label" x="33" y="183">Aug 19</text><text className="chart-label" x="166" y="183">Aug 26</text><text className="chart-label" x="301" y="183">Sep 02</text><text className="chart-label" x="438" y="183">Sep 09</text><text className="chart-label" x="548" y="183">Sep 16</text></svg></div><div className="chart-legend"><span className="legend-item"><i className="legend-dot" />Tasks completed</span><span className="legend-item"><i className="legend-dot green" />Team average</span></div></article>
}

export function ProjectHealth() {
  return <article className="panel"><div className="panel-heading"><div><h2>Project health</h2><p>Current status across your workspace</p></div><button className="text-button">View all</button></div><div className="project-health"><div className="health-ring"><svg width="111" height="111" viewBox="0 0 100 100"><circle className="ring-track" cx="50" cy="50" r="40"/><circle className="ring-progress" cx="50" cy="50" r="40"/></svg><div className="ring-number">78%</div></div><div className="health-legend"><div><i className="status-dot"/>On track <strong>6</strong></div><div><i className="status-dot amber"/>At risk <strong>2</strong></div><div><i className="status-dot red"/>Behind <strong>0</strong></div></div></div></article>
}

export function ActivityPanel({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return <article className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>What’s happening with your team</p></div><button className="text-button" onClick={() => onNavigate('Projects')}>See all</button></div><div className="activity-list">{activities.map((activity) => <div className="activity-row" key={activity.title}><Avatar name={activity.icon} className="avatar-small"/><div className="activity-copy"><strong>{activity.title}</strong><span>{activity.detail}</span></div><span className={`activity-tag ${activity.color}`}>{activity.tag}</span></div>)}</div></article>
}

export function NotificationsPanel() {
  const notifications = [
    { title: 'Campaign timeline needs attention', detail: 'Two deliverables are at risk · 24 min ago', Icon: CircleAlert },
    { title: 'You were added to a project', detail: 'Mobile app launch · 2 hrs ago', Icon: Users },
  ]
  return <article className="panel"><div className="panel-heading"><div><h2>Important updates</h2><p>Things that may need your attention</p></div><button className="text-button">See all</button></div><div className="notifications-list">{notifications.map(({ title, detail, Icon }) => <div className="notification-row" key={title}><span className="notification-mark"><Icon size={13}/></span><div><strong>{title}</strong><span>{detail}</span></div><BellRing size={13} color="#a0a8b5" /></div>)}</div></article>
}

export function ProjectsOverview() {
  return <article className="panel"><div className="panel-heading"><div><h2>Projects in motion</h2><p>A snapshot of your active work</p></div><button className="text-button">View all</button></div><div className="project-mini-list">{projects.map(project => <div className="project-mini" key={project.id}><i className={`project-color ${project.color}`} /><div className="project-mini-copy"><strong>{project.name}</strong><span>{project.category} · {project.dueDate}</span></div><span className="progress-value">{project.progress}%</span><div className="progress-track"><div className="progress-fill" style={{ width: `${project.progress}%` }} /></div></div>)}</div></article>
}

export function TasksOverview({ onNavigate }: { onNavigate: (page: PageName) => void }) {
  return <article className="panel"><div className="panel-heading"><div><h2>Your priority tasks</h2><p>A short list to keep your day moving</p></div><button className="text-button" onClick={() => onNavigate('Tasks')}>Open task list</button></div><div>{tasks.map(task => <div className="task-row" key={task.id}><span className={`task-check ${task.done ? 'done' : ''}`}>{task.done && <Check size={11}/>}</span><div><strong>{task.title}</strong><small>{task.project} · {task.assignee}</small></div><span className="task-due">{task.dueDate}</span></div>)}</div></article>
}

export function SprintOverview() {
  return <article className="panel"><div className="panel-heading"><div><h2>Current sprint</h2><p>Sprint 12 · Sep 30 – Oct 11</p></div><button className="text-button">View board</button></div><div className="sprint-summary"><svg className="sprint-ring" viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="none" stroke="#edf0f5" strokeWidth="6"/><circle cx="30" cy="30" r="24" fill="none" stroke="#4fae9b" strokeWidth="6" strokeLinecap="round" strokeDasharray="151" strokeDashoffset="55" transform="rotate(-90 30 30)"/><text x="30" y="34" textAnchor="middle" fill="#33415b" fontSize="12" fontWeight="700">64%</text></svg><div className="sprint-copy"><strong>14 of 22 tasks completed</strong><span>4 days left in this sprint</span></div></div><div className="sprint-progress"><div className="progress-track"><div className="progress-fill" style={{ width: '64%' }} /></div></div></article>
}