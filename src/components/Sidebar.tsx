import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  CalendarDays,
  Users,
  ShieldAlert,
  BarChart3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { resetDemoData } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'register', label: 'Register Terminal', icon: UserCheck, badge: 'Core' },
    { id: 'programs', label: 'Programs & Rounds', icon: CalendarDays },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: ShieldAlert },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="sidebar">
      <div className="brand-logo">
        <div className="brand-icon">
          <Sparkles size={22} />
        </div>
        <div>
          <div className="brand-text">KAIROOS</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 600 }}>
            Program Eligibility AI
          </div>
        </div>
      </div>

      <div className="nav-section-title">MAIN MENU</div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(item.id);
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </a>
          );
        })}
      </nav>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
          onClick={() => {
            if (window.confirm('Reset system data back to initial demo state?')) {
              resetDemoData();
            }
          }}
        >
          <RefreshCw size={14} />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
