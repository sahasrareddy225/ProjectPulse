import { useState } from 'react'
import { Bell, ChevronDown, Command, Plus, Search } from 'lucide-react'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './pages/Dashboard/index'
import { Login } from './pages/Login/index'
import { AnalyticsPage } from './pages/Analytics/index'
import { AssistantPage } from './pages/AIAssistant/index'
import { ProjectsPage } from './pages/Projects/index'
import { TasksPage } from './pages/Tasks/index'
import { AdminUsersPage } from './pages/AdminUsers'
import { NewProjectPage } from './pages/NewProject'
import { ProjectOverviewPage } from './pages/ProjectOverview'
import { ProjectReviewPage } from './pages/ProjectReview'
import { TeamDashboardPage } from './pages/TeamDashboard'
import { TaskDetailsPage } from './pages/TaskDetails'
import { readLastPage, saveLastPage } from './store'
import type { PageName } from './types'
import './styles/ProjectPulse.css'

const pageTitles: Record<PageName, string> = {
  Dashboard: 'Good morning, Alex',
  Projects: 'Projects',
  'Project Overview': 'Project overview',
  'New Project': 'Create a project',
  'Project Review': 'Project risk review',
  Team: 'Team dashboard',
  Tasks: 'Task management',
  'Task Details': 'Task details & collaboration',
  'Admin Users': 'User management',
  Analytics: 'Analytics',
  Assistant: 'AI assistant',
}

function App() {
  const [page, setPage] = useState<PageName>(readLastPage)
  const [showLogin, setShowLogin] = useState(false)
  const navigate = (nextPage: PageName) => {
    setPage(nextPage)
    saveLastPage(nextPage)
  }

  if (showLogin) return <Login onBack={() => setShowLogin(false)} />

  return (
    <div className="app-shell">
      <Sidebar active={page} onNavigate={navigate} />
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-divider">/</span><strong>{page}</strong></div>
          <div className="topbar-actions">
            <button className="search-trigger" aria-label="Search"><Search size={15} /><span>Search anything</span><kbd><Command size={11} /> K</kbd></button>
            <button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><i /></button>
            <button className="profile-trigger" onClick={() => setShowLogin(true)} aria-label="Open account"><span className="avatar avatar-small">AM</span><ChevronDown size={14} /></button>
          </div>
        </header>
        <div className="page-content">
          <div className="page-heading">
            <div><div className="eyebrow">WEDNESDAY, OCTOBER 7, 2026</div><h1>{pageTitles[page]}</h1></div>
            <button className="primary-button" onClick={() => navigate(page === 'Tasks' || page === 'Task Details' ? 'Task Details' : 'New Project')}><Plus size={16} />{page === 'Tasks' || page === 'Task Details' ? 'New task' : 'New project'}</button>
          </div>
          {page === 'Dashboard' && <Dashboard onNavigate={navigate} />}
          {page === 'Projects' && <ProjectsPage />}
          {page === 'Project Overview' && <ProjectOverviewPage />}
          {page === 'New Project' && <NewProjectPage />}
          {page === 'Project Review' && <ProjectReviewPage />}
          {page === 'Team' && <TeamDashboardPage />}
          {page === 'Tasks' && <TasksPage />}
          {page === 'Task Details' && <TaskDetailsPage />}
          {page === 'Admin Users' && <AdminUsersPage />}
          {page === 'Analytics' && <AnalyticsPage />}
          {page === 'Assistant' && <AssistantPage />}
          <footer className="footer"><span>ProjectPulse</span><span>All changes saved</span></footer>
        </div>
      </main>
    </div>
  )
}

export default App
