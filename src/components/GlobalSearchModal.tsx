import React, { useState, useEffect } from 'react';
import { Search, X, User, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Student } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const { students } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredStudents = query.trim()
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query.toLowerCase()) ||
          s.studentId.toLowerCase().includes(query.toLowerCase()) ||
          s.classGrade.toLowerCase().includes(query.toLowerCase()) ||
          s.houseGroup.toLowerCase().includes(query.toLowerCase())
      )
    : students.slice(0, 5);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{ padding: '0.75rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <Search size={20} className="text-muted" />
            <input
              type="text"
              autoFocus
              placeholder="Type student name, ID (e.g. STU001), class (XI), section (A)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            />
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '0.75rem' }}>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)', padding: '0.4rem 0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
            {query ? `Found ${filteredStudents.length} Students` : 'Quick Student Lookup'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No students match "{query}"
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    onSelectStudent(s);
                    onClose();
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(99, 102, 241, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#a5b4fc',
                      }}
                    >
                      <User size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.fullName}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                        <span>ID: <strong>{s.studentId}</strong></span>
                        <span>•</span>
                        <span>Class <strong>{s.classGrade}</strong></span>
                        <span>•</span>
                        <span style={{ color: '#a5b4fc' }}>{s.houseGroup}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Check Eligibility</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
