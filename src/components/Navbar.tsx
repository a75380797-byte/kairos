import React from 'react';
import type { UserRole } from '../types';
import { useApp } from '../context/AppContext';
import { Shield, User, Eye, Search } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSearchClick }) => {
  const { currentUserRole, setCurrentUserRole } = useApp();

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Overview', desc: 'School recurring programs & student eligibility status' };
      case 'register':
        return { title: 'Registration & Eligibility Check', desc: 'Real-time student restriction engine' };
      case 'programs':
        return { title: 'Programs & Round Management', desc: 'Configure eligibility rules and recurring schedules' };
      case 'students':
        return { title: 'Student Database', desc: 'Student history, profiles, and participation history' };
      case 'audit':
        return { title: 'Security & Audit Logs', desc: 'Immutable track of registrations, attempts, & admin overrides' };
      case 'reports':
        return { title: 'Analytics & Export Reports', desc: 'Participation metrics and restriction trends' };
      default:
        return { title: 'Management System', desc: 'Recurring program eligibility' };
    }
  };

  const { title, desc } = getPageTitle(activeTab);

  return (
    <header className="top-header">
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{title}</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{desc}</p>
      </div>

      <div className="top-header-right">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onSearchClick}
          style={{ gap: '0.5rem', color: 'var(--text-muted)' }}
        >
          <Search size={15} />
          <span>Search Student...</span>
          <kbd
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              color: 'var(--text-main)',
            }}
          >
            Ctrl+K
          </kbd>
        </button>

        <div className="role-switcher">
          {currentUserRole === 'SUPER_ADMIN' && <Shield size={16} style={{ color: '#ef4444' }} />}
          {currentUserRole === 'EVENT_STAFF' && <User size={16} style={{ color: '#3b82f6' }} />}
          {currentUserRole === 'VIEWER' && <Eye size={16} style={{ color: '#9ca3af' }} />}

          <select
            className="role-select"
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
          >
            <option value="SUPER_ADMIN">Role: Super Admin</option>
            <option value="EVENT_STAFF">Role: Event Staff</option>
            <option value="VIEWER">Role: Viewer (Read-only)</option>
          </select>

          <span
            className={`role-badge ${
              currentUserRole === 'SUPER_ADMIN'
                ? 'super-admin'
                : currentUserRole === 'EVENT_STAFF'
                ? 'staff'
                : 'viewer'
            }`}
          >
            {currentUserRole === 'SUPER_ADMIN'
              ? 'Admin'
              : currentUserRole === 'EVENT_STAFF'
              ? 'Staff'
              : 'Read-Only'}
          </span>
        </div>
      </div>
    </header>
  );
};
