import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import type { Student, Program, Round } from '../types';

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  program: Program;
  round: Round;
  restrictionReason: string;
  onConfirmOverride: (reason: string, adminName: string) => void;
}

export const OverrideModal: React.FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  student,
  program: _program,
  round,
  restrictionReason,
  onConfirmOverride,
}) => {
  const [reason, setReason] = useState('');
  const [adminName, setAdminName] = useState('School Principal / Admin');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !confirmed || !adminName.trim()) return;
    onConfirmOverride(reason.trim(), adminName.trim());
    setReason('');
    setConfirmed(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card mobile-modal"
        style={{ maxWidth: '520px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
            <ShieldAlert size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Admin Eligibility Override</h3>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
              <AlertTriangle size={16} />
              <span>Student Restricted</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              <strong>{student.fullName}</strong> ({student.studentId}, Class {student.classGrade}, {student.houseGroup} House) is blocked from <strong>Round {round.roundNumber}</strong>.
            </p>
            <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '0.25rem', fontStyle: 'italic' }}>
              {restrictionReason}
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Admin / Approver Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Principal Ahmed, Head Admin"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="form-label">
              Justification / Reason for Override *
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Special school principal exception, regional inter-school tournament representative, or team rotation adjustment."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            <input
              type="checkbox"
              id="confirm-override"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              style={{ marginTop: '0.2rem' }}
              required
            />
            <label htmlFor="confirm-override" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              I confirm that I am an authorized administrator and accept responsibility for overriding this restriction. This override will be recorded in the security audit logs.
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-warning"
              disabled={!reason.trim() || !confirmed || !adminName.trim()}
            >
              <ShieldAlert size={16} />
              <span>Confirm Override & Register</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
