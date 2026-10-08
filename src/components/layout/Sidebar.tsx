import { Activity, BarChart3, Bot, BriefcaseBusiness, CheckSquare2, ChevronDown, CircleHelp, Command, FolderKanban, Shield, Users } from 'lucide-react'
import type { PageName } from '../../types'

const navigation: { label: PageName; icon: typeof Command; count?: string }[] = [
  { label: 'Dashboard', icon: Command },
  { label: 'Projects', icon: FolderKanban, count: '8' },
  { label: 'Project Overview', icon: BarChart3 },
  { label: 'New Project', icon: Command },
  { label: 'Project Review', icon: Activity },
  { label: 'Team', icon: Users },
  { label: 'Tasks', icon: CheckSquare2, count: '12' },
  { label: 'Task Details', icon: CheckSquare2 },
  { label: 'Admin Users', icon: Shield },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'Assistant', icon: Bot },
]

export function Sidebar({ active, onNavigate }: { active: PageName; onNavigate: (page: PageName) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Activity size={18} strokeWidth={2.5} /></div><span className="brand-name">Project<span>Pulse</span></span></div>
      <button className="workspace-switch"><span className="workspace-avatar">AC</span><span className="workspace-copy"><strong>Acme Creative</strong><span>Pro workspace</span></span><ChevronDown size={13} color="#8792a3" /></button>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, count }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => onNavigate(label)}><Icon size={16} strokeWidth={1.8} /><span>{label}</span>{count && <span className="nav-trailing">{count}</span>}</button>)}
      </nav>
      <div className="nav-label" style={{ marginTop: 28 }}>PREFERENCES</div>
      <nav className="nav-list" aria-label="Preferences">
        <button className="nav-item" onClick={() => onNavigate('Admin Users')}><Shield size={16} strokeWidth={1.8} /><span>Administration</span></button>
        <button className="nav-item"><CircleHelp size={16} strokeWidth={1.8} /><span>Help center</span></button>
      </nav>
      <div className="sidebar-bottom">
        <div className="upgrade-box"><strong>Make room for more</strong><p>You’re using 8 of 10 active projects.</p><button>Explore plans <span>→</span></button></div>
        <div className="user-profile"><span className="avatar">AM</span><span className="user-meta"><strong>Alex Morgan</strong><span>Product manager</span></span><BriefcaseBusiness size={14} color="#929bab" /></div>
      </div>
    </aside>
  )
}