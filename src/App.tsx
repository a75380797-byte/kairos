import React, { useState, useRef, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import {
  UserCheck,
  CalendarDays,
  Users,
  ShieldAlert,
  Sparkles,
  Shield,
  User,
  Eye,
  Database,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';

import { RegistrationPage } from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { StudentsPage } from './pages/StudentsPage';
import { StudentDetailPage } from './pages/StudentDetailPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import type { UserRole } from './types';

const MainApp: React.FC = () => {
  const {
    currentUserRole,
    setCurrentUserRole,
    clearAllData,
    exportDatabaseJSON,
    importDatabaseJSON,
    resetDemoData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('register');
  const [isDbMenuOpen, setIsDbMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = () => {
      try {
        const raw = localStorage.getItem('kairoos_session');
        if (!raw) return false;
        const s = JSON.parse(raw);
        if (!s || !s.expiry) return false;
        return s.expiry > Date.now();
      } catch (e) {
        return false;
      }
    };
    setIsAuthenticated(checkSession());
  }, []);

  // Sub-navigation state
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [selectedRoundId, setSelectedRoundId] = useState<string | undefined>(undefined);
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);

  const handleSelectProgram = (progId: string) => {
    setSelectedProgramId(progId);
    setActiveTab('program-detail');
  };

  const handleSelectStudent = (stId: string) => {
    setSelectedStudentId(stId);
    setActiveTab('student-detail');
  };

  const handleNavigateToRegister = (pId?: string, rId?: string, sId?: string) => {
    if (pId) setSelectedProgramId(pId);
    if (rId) setSelectedRoundId(rId);
    if (sId) setSelectedStudentId(sId);
    setActiveTab('register');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDatabaseJSON(content);
        if (ok) {
          alert('Database restored successfully from JSON backup!');
        } else {
          alert('Failed to import database. Please verify valid JSON backup file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {!isAuthenticated && (
        <LoginPage
          onLogin={() => {
            setIsAuthenticated(true);
          }}
        />
      )}

      {isAuthenticated && (
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Top Navigation Shell */}
      <header className="app-header">
        <div className="brand">
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div className="brand-title">KAIROS</div>
          </div>
          <span className="brand-badge">School Eligibility AI</span>
        </div>

        {/* Minimal Main Tabs (Desktop) */}
        <nav className="tab-nav tab-nav-desktop">
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <UserCheck size={16} />
            <span>1. Register & Eligibility</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'programs' || activeTab === 'program-detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('programs')}
          >
            <CalendarDays size={16} />
            <span>2. Programs & Rules</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'students' || activeTab === 'student-detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} />
            <span>3. Student Database</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <ShieldAlert size={16} />
            <span>Audit Logs</span>
          </button>
        </nav>

        {/* User Role Switcher & Database Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255, 255, 255, 0.15)',
              padding: '0.3rem 0.6rem',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {currentUserRole === 'SUPER_ADMIN' && <Shield size={14} style={{ color: '#f87171' }} />}
            {currentUserRole === 'EVENT_STAFF' && <User size={14} style={{ color: '#93c5fd' }} />}
            {currentUserRole === 'VIEWER' && <Eye size={14} style={{ color: '#cbd5e1' }} />}

            <select
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
              }}
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
            >
              <option value="SUPER_ADMIN" style={{ color: '#0f172a' }}>Role: Super Admin</option>
              <option value="EVENT_STAFF" style={{ color: '#0f172a' }}>Role: Event Staff</option>
              <option value="VIEWER" style={{ color: '#0f172a' }}>Role: Read-Only Viewer</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800 }}
              onClick={() => setIsDbMenuOpen(!isDbMenuOpen)}
            >
              <Database size={14} />
              <span>Database Tools</span>
            </button>

            {isDbMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 30px rgba(15,23,42,0.2)',
                  minWidth: '220px',
                  zIndex: 200,
                  padding: '0.5rem',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 800, padding: '0.4rem 0.6rem', textTransform: 'uppercase' }}>
                  School Database Management
                </div>

                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.6rem',
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() => {
                    exportDatabaseJSON();
                    setIsDbMenuOpen(false);
                  }}
                >
                  <Download size={14} className="text-primary" />
                  <span>Export DB Backup (JSON)</span>
                </button>

                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.6rem',
                    background: 'none',
                    border: 'none',
                    color: '#0f172a',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsDbMenuOpen(false);
                  }}
                >
                  <Upload size={14} className="text-primary" />
                  <span>Import DB Backup (JSON)</span>
                </button>

                <div style={{ height: '1px', background: '#e2e8f0', margin: '0.35rem 0' }} />

                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.6rem',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() => {
                    if (window.confirm('Clear all school database records (students, programs, registrations)?')) {
                      clearAllData();
                      alert('Database cleared successfully.');
                    }
                    setIsDbMenuOpen(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Clear All Database Records</span>
                </button>

                <button
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.5rem 0.6rem',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onClick={() => {
                    if (window.confirm('Reset database back to initial sample state?')) {
                      resetDemoData();
                    }
                    setIsDbMenuOpen(false);
                  }}
                >
                  <span>Reset Initial Schema</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {isAuthenticated && (
        <main className="main-layout">
        {activeTab === 'register' && (
          <RegistrationPage
            initialProgramId={selectedProgramId}
            initialRoundId={selectedRoundId}
            initialStudentId={selectedStudentId}
            onNavigateToStudent={handleSelectStudent}
          />
        )}

        {activeTab === 'programs' && (
          <ProgramsPage onSelectProgram={handleSelectProgram} />
        )}

        {activeTab === 'program-detail' && selectedProgramId && (
          <ProgramDetailPage
            programId={selectedProgramId}
            onBack={() => setActiveTab('programs')}
            onNavigateToRegister={(pId, rId) => handleNavigateToRegister(pId, rId)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsPage onSelectStudent={handleSelectStudent} />
        )}

        {activeTab === 'student-detail' && selectedStudentId && (
          <StudentDetailPage
            studentId={selectedStudentId}
            onBack={() => setActiveTab('students')}
            onNavigateToRegister={(pId, rId, sId) => handleNavigateToRegister(pId, rId, sId)}
          />
        )}

        {activeTab === 'audit' && <AuditLogsPage />}
        </main>
      )}

      {/* Fixed Bottom Navigation Bar (Mobile View) */}
      <nav className="bottom-nav-mobile">
        <button
          className={`bottom-nav-item ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          <UserCheck size={20} />
          <span>Register</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'programs' || activeTab === 'program-detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          <CalendarDays size={20} />
          <span>Programs</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'students' || activeTab === 'student-detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={20} />
          <span>Students</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <ShieldAlert size={20} />
          <span>Audit Logs</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
