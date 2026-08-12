import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Settings,
  Plus,
  Calendar,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react';
import { RuleEditWarningModal } from '../components/RuleEditWarningModal';
import type { RoundStatus } from '../types';

interface ProgramDetailPageProps {
  programId: string;
  onBack: () => void;
  onNavigateToRegister: (programId: string, roundId: string) => void;
}

export const ProgramDetailPage: React.FC<ProgramDetailPageProps> = ({
  programId,
  onBack,
  onNavigateToRegister,
}) => {
  const {
    programs,
    rounds,
    registrations,
    updateProgramRule,
    updateRoundStatus,
    generateFutureRounds,
    addRound,
    currentUserRole,
  } = useApp();

  const program = programs.find((p) => p.id === programId);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);

  const [newRoundNum, setNewRoundNum] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('2026-08-30');

  if (!program) {
    return (
      <div>
        <button className="btn btn-secondary mb-4" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Programs
        </button>
        <div style={{ color: 'var(--text-muted)' }}>Program not found.</div>
      </div>
    );
  }

  const programRounds = rounds
    .filter((r) => r.programId === program.id)
    .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  const handleManualAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundNum.trim() || !newRoundDate) return;

    const nextSeq = programRounds.length > 0 ? programRounds[programRounds.length - 1].sequenceIndex + 1 : 1;

    addRound({
      programId: program.id,
      roundNumber: newRoundNum.trim(),
      sequenceIndex: nextSeq,
      date: newRoundDate,
      regOpenDate: new Date().toISOString().split('T')[0],
      regCloseDate: newRoundDate,
      status: 'Registration Open',
    });

    setIsAddRoundOpen(false);
    setNewRoundNum('');
  };

  return (
    <div>
      <button className="btn btn-secondary mb-4" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Programs List
      </button>

      <div className="card mb-6">
        <div className="flex-between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>{program.name}</h2>
              <span className="badge badge-eligible">{program.frequency}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              {program.description || 'No description provided.'}
            </p>
          </div>

          {currentUserRole === 'SUPER_ADMIN' && (
            <button className="btn btn-warning" onClick={() => setIsRuleModalOpen(true)}>
              <Settings size={16} />
              <span>Edit Program Rule</span>
            </button>
          )}
        </div>

        <div
          style={{
            marginTop: '1.25rem',
            padding: '1rem',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 800 }}>
              Active Restriction Rule
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
              {program.rule.description}
            </div>
          </div>

          <span className="badge badge-info">{program.rule.ruleType}</span>
        </div>
      </div>

      <div className="flex-between mb-4">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Rounds Sequence</h3>
        </div>

        {currentUserRole !== 'VIEWER' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => generateFutureRounds(program.id, 5)}
            >
              <Sparkles size={14} />
              <span>Auto 5 Rounds</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsAddRoundOpen(true)}>
              <Plus size={14} />
              <span>+ Create Round</span>
            </button>
          </div>
        )}
      </div>

      <div className="card mb-6">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Seq #</th>
                <th>Round Number</th>
                <th>Event Date</th>
                <th>Status</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programRounds.map((r) => {
                const roundRegs = registrations.filter(
                  (reg) => reg.roundId === r.id && reg.status !== 'Cancelled'
                );
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-dim)' }}>#{r.sequenceIndex}</td>
                    <td style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                      Round {r.roundNumber}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} className="text-muted" />
                        <span>{r.date}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="form-control"
                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.78rem', width: 'auto' }}
                        value={r.status}
                        onChange={(e) => updateRoundStatus(r.id, e.target.value as RoundStatus)}
                        disabled={currentUserRole === 'VIEWER'}
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Registration Open">Registration Open</option>
                        <option value="Closed">Closed</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {roundRegs.length} / {program.maxParticipants}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onNavigateToRegister(program.id, r.id)}
                      >
                        <UserCheck size={14} />
                        <span>Register</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RuleEditWarningModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        program={program}
        onSaveRule={(newRule) => updateProgramRule(program.id, newRule)}
      />

      {/* POPUP MODAL FOR ADDING ROUND */}
      {isAddRoundOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsAddRoundOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Create Round for {program.name}</h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsAddRoundOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddRound}>
              <div className="form-group mb-4">
                <label className="form-label">Round Number * (e.g. 11.8 or 12.1)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 11.8"
                  value={newRoundNum}
                  onChange={(e) => setNewRoundNum(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={newRoundDate}
                  onChange={(e) => setNewRoundDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddRoundOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Round Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
