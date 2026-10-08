import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  GitMerge, BarChart2, Sparkles, Settings, ChevronDown
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const navItems = [
  { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
  { name: 'Projects',     path: '/projects',     icon: FolderKanban },
  { name: 'Tasks',        path: '/tasks',        icon: CheckSquare },
  { name: 'Workflow',     path: '/workflow',     icon: GitMerge },
  { name: 'Analytics',   path: '/analytics',    icon: BarChart2 },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
];

const link = (isActive: boolean) =>
  `group flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors ${
    isActive
      ? 'bg-primary text-white'
      : 'text-text-secondary hover:text-text-primary hover:bg-border/40'
  }`;

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => (
  <>
    {/* Mobile overlay */}
    {isOpen && (
      <div
        className="fixed inset-0 z-40 bg-black/30 md:hidden"
        onClick={() => setIsOpen(false)}
      />
    )}

    <aside className={`
      fixed inset-y-0 left-0 z-50 w-56 bg-surface border-r border-border flex flex-col
      transform transition-transform duration-200 ease-out
      md:static md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="h-12 flex items-center gap-2.5 px-4 border-b border-border flex-shrink-0">
        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm leading-none select-none">P</span>
        </div>
        <span className="text-[14px] font-semibold tracking-tight text-text-primary select-none">
          ProjectPulse
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted select-none">
          Workspace
        </p>
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => link(isActive)}
          >
            <item.icon size={15} className="flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}

        <div className="pt-3 mt-3 border-t border-border">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted select-none">
            System
          </p>
          <NavLink
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) => link(isActive)}
          >
            <Settings size={15} className="flex-shrink-0" />
            Settings
          </NavLink>
        </div>
      </nav>

      {/* User row */}
      <div className="px-2 py-3 border-t border-border flex-shrink-0">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-border/40 transition-colors text-left">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-semibold">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate leading-tight">John Doe</p>
            <p className="text-[11px] text-text-muted truncate">Project Manager</p>
          </div>
          <ChevronDown size={13} className="text-text-muted flex-shrink-0" />
        </button>
      </div>
    </aside>
  </>
);
