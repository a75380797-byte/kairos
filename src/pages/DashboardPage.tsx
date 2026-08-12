import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  CalendarDays,
  ShieldAlert,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { checkStudentEligibility } from '../services/eligibilityEngine';

interface DashboardPageProps {
  onNavigate: (tab: string, params?: { programId?: string; studentId?: string; roundId?: string }) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { programs, rounds, students, registrations, auditLogs } = useApp();

  const [selectedProgId, setSelectedProgId] = useState<string>(programs[0]?.id || '');
  const [selectedRoundId, setSelectedRoundId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const programRounds = rounds
    .filter((r) => r.programId === selectedProgId)
    .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  const activeRound = selectedRoundId
    ? programRounds.find((r) => r.id === selectedRoundId)
    : programRounds.find((r) => r.status === 'Registration Open') || programRounds[0];

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentProgram = programs.find((p) => p.id === selectedProgId);

  const sandboxEligibility =
    currentStudent && currentProgram && activeRound
      ? checkStudentEligibility(currentStudent, currentProgram, activeRound, rounds, registrations)
      : null;

  const totalStudents = students.length;
  const totalPrograms = programs.length;
  const openRoundsCount = rounds.filter((r) => r.status === 'Registration Open').length;
  const restrictedAttemptsCount = auditLogs.filter((l) => l.action === 'RESTRICTED_ATTEMPT').length;
  const overridesCount = registrations.filter((r) => r.isOverridden).length;

  const openRoundsList = rounds.filter((r) => r.status === 'Registration Open' || r.status === 'Upcoming');

  return (
    <div>
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={16} />
            <span>Automated Rule Engine Active</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.3rem' }}>
            School Program Eligibility Terminal
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', marginTop: '0.4rem' }}>
            Real-time constraint solver preventing duplicate or frequent participation across weekly, bi-weekly, and monthly recurring events.
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => onNavigate('register')}
            style={{ gap: '0.75rem', boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)' }}
          >
            <Zap size={20} />
            <span>Open Registration Terminal</span>
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{totalStudents}</div>
            <div className="stat-lbl">Active Students</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="stat-val">{totalPrograms}</div>
            <div className="stat-lbl">Recurring Programs</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-val">{openRoundsCount}</div>
            <div className="stat-lbl">Open Rounds</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <AlertOctagon size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#f87171' }}>{restrictedAttemptsCount}</div>
            <div className="stat-lbl">Blocked Attempts</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#fbbf24' }}>{overridesCount}</div>
            <div className="stat-lbl">Admin Overrides</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div className="glass-card">
          <div className="flex-between mb-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} className="text-primary" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Quick Eligibility Inspector</h3>
            </div>
            <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)', padding: '0.25rem 0.6rem', borderRadius: '12px', color: 'var(--text-muted)' }}>
              Live Simulation
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Test instant student restriction rules without submitting a real registration.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="form-label">1. Select Program</label>
              <select
                className="form-control"
                value={selectedProgId}
                onChange={(e) => {
                  setSelectedProgId(e.target.value);
                  setSelectedRoundId('');
                }}
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.rule.description}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">2. Target Round</label>
                <select
                  className="form-control"
                  value={activeRound?.id || ''}
                  onChange={(e) => setSelectedRoundId(e.target.value)}
                >
                  {programRounds.map((r) => (
                    <option key={r.id} value={r.id}>
                      Round {r.roundNumber} ({r.date}) [{r.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">3. Student</label>
                <select
                  className="form-control"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentId} - Class {s.classGrade})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {sandboxEligibility && activeRound && currentStudent && (
              <div style={{ marginTop: '0.5rem' }}>
                {sandboxEligibility.isEligible ? (
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>
                        <CheckCircle2 size={24} />
                        <span>🟢 STUDENT ELIGIBLE</span>
                      </div>
                      <span className="badge badge-eligible">Eligible</span>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '0.5rem' }}>
                      <strong>{currentStudent.fullName}</strong> satisfies program rule "{currentProgram?.rule.description}".
                    </p>

                    {sandboxEligibility.lastParticipation ? (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        Last participated in Round {sandboxEligibility.lastParticipation.round.roundNumber} on {sandboxEligibility.lastParticipation.round.date}.
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        No previous participation records for this program.
                      </div>
                    )}

                    <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          onNavigate('register', {
                            programId: selectedProgId,
                            roundId: activeRound.id,
                            studentId: selectedStudentId,
                          })
                        }
                      >
                        <span>Proceed to Register</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1.5px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>
                        <XCircle size={24} />
                        <span>🔴 RESTRICTED STUDENT</span>
                      </div>
                      <span className="badge badge-restricted">Restricted</span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#fca5a5', marginTop: '0.5rem', fontWeight: 600 }}>
                      ⚠️ {sandboxEligibility.reason}
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        marginTop: '0.75rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Last Participation:</span>
                        <div style={{ fontWeight: 700 }}>
                          Round {sandboxEligibility.lastParticipation?.round.roundNumber} ({sandboxEligibility.lastParticipation?.round.date})
                        </div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-dim)' }}>Earliest Eligible Round:</span>
                        <div style={{ fontWeight: 700, color: '#60a5fa' }}>
                          {sandboxEligibility.eligibleFromRound?.roundNumber || 'TBD'} ({sandboxEligibility.eligibleFromDate || 'TBD'})
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active & Upcoming Rounds</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('programs')}
            >
              View All Programs
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {openRoundsList.slice(0, 5).map((r) => {
              const prog = programs.find((p) => p.id === r.programId);
              const roundRegs = registrations.filter((reg) => reg.roundId === r.id && reg.status !== 'Cancelled');
              return (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1rem',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>
                        {prog?.name} — Round {r.roundNumber}
                      </span>
                      <span className={`badge ${r.status === 'Registration Open' ? 'badge-eligible' : 'badge-info'}`}>
                        {r.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Event Date: {r.date} • Reg Closes: {r.regCloseDate} • Rule: {prog?.rule.description}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700 }}>{roundRegs.length} / {prog?.maxParticipants || 30}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Participants</div>
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onNavigate('register', { programId: r.programId, roundId: r.id })}
                    >
                      Register
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex-between mb-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} className="text-warning" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Recent Audit Logs & Restriction Events</h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('audit')}>
            View Full Audit Trail
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Student / Details</th>
                <th>Program & Round</th>
                <th>User / Role</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 6).map((log) => (
                <tr key={log.id}>
                  <td>
                    {log.action === 'RESTRICTED_ATTEMPT' && (
                      <span className="badge badge-restricted">Restricted Attempt</span>
                    )}
                    {log.action === 'ELIGIBILITY_OVERRIDE' && (
                      <span className="badge badge-overridden">Admin Override</span>
                    )}
                    {log.action === 'STUDENT_REGISTERED' && (
                      <span className="badge badge-eligible">Registered</span>
                    )}
                    {log.action === 'PROGRAM_RULE_MODIFIED' && (
                      <span className="badge badge-info">Rule Modified</span>
                    )}
                    {log.action === 'PROGRAM_CREATED' && (
                      <span className="badge badge-info">Program Created</span>
                    )}
                    {log.action === 'ROUND_CREATED' && (
                      <span className="badge badge-info">Round Created</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.studentName || log.details}</div>
                    {log.reason && (
                      <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontStyle: 'italic' }}>
                        Reason: {log.reason}
                      </div>
                    )}
                  </td>
                  <td>
                    {log.programName ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {log.programName} {log.roundNumber ? `(${log.roundNumber})` : ''}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.user}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{log.userRole}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
