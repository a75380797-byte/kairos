import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Plus,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import type { FrequencyType, RuleType } from '../types';

interface ProgramsPageProps {
  onSelectProgram: (programId: string) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ onSelectProgram }) => {
  const { programs, rounds, addProgram, addRound, generateFutureRounds, currentUserRole } = useApp();

  // Create Program Modal State
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('WEEKLY');
  const [startDate] = useState('2026-08-15');
  const [maxParticipants, setMaxParticipants] = useState(30);

  // Rule configuration
  const [ruleType, setRuleType] = useState<RuleType>('CLASS_WISE_ROTATION');
  const [ruleValue, setRuleValue] = useState(2); // 2 participants per round per class team

  // Add Round Modal State
  const [isAddRoundOpen, setIsAddRoundOpen] = useState(false);
  const [selectedProgForRound, setSelectedProgForRound] = useState<string>('');
  const [newRoundNum, setNewRoundNum] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('2026-08-25');

  const getRuleDesc = () => {
    if (ruleType === 'CLASS_WISE_ROTATION') {
      return `Class-Wise Auto Set Rotation: ${ruleValue || 2} participants per round per class team (System auto-adjusts sets & odd numbers)`;
    } else if (ruleType === 'ROUNDS_INTERVENING') {
      return `Student can participate once every ${ruleValue} rounds`;
    } else if (ruleType === 'TEAM_ROTATION') {
      return `House Team Rotation (Qurtuba, Nizamiyya, Azhar, Zitouna) — Wait ${ruleValue} rounds`;
    } else if (ruleType === 'DAYS_INTERVAL') {
      return `Student must wait ${ruleValue} days between participation`;
    } else {
      return `Student can participate maximum once per month`;
    }
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addProgram({
      name: name.trim(),
      description: description.trim(),
      frequency,
      startDate,
      isRecurring: true,
      maxParticipants,
      autoGenerateRounds: true,
      rule: {
        ruleType,
        value: ruleValue,
        countableStatuses: ['Participated', 'Registered'],
        description: getRuleDesc(),
      },
    });

    setIsCreateProgramOpen(false);
    setName('');
    setDescription('');
  };

  const handleManualAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoundNum.trim() || !selectedProgForRound) return;

    const progRounds = rounds
      .filter((r) => r.programId === selectedProgForRound)
      .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

    const nextSeq = progRounds.length > 0 ? progRounds[progRounds.length - 1].sequenceIndex + 1 : 1;

    addRound({
      programId: selectedProgForRound,
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
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Programs & Eligibility Rules</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage recurring school activities and participation restriction rules.
          </p>
        </div>

        {currentUserRole !== 'VIEWER' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={() => setIsCreateProgramOpen(true)}>
              <Plus size={18} />
              <span>+ Create New Program</span>
            </button>
          </div>
        )}
      </div>

      {/* Program Cards Grid */}
      {programs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#ffffff', border: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
            📦 SQLite3 Relational Database Ready (Clean Slate)
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            There are no programs registered in the database yet. Click the button below to create a new program and define its eligibility rule!
          </p>
          <button className="btn btn-primary" onClick={() => setIsCreateProgramOpen(true)}>
            <Plus size={18} />
            <span>+ Create New Program</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {programs.map((p) => {
            const progRounds = rounds
              .filter((r) => r.programId === p.id)
              .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

            return (
              <div key={p.id} className="card">
                <div className="flex-between mb-2">
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#29180d' }}>
                    {p.name}
                  </h3>
                  <span className="badge badge-info">{p.frequency}</span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  {p.description || 'No description provided.'}
                </p>

                {/* Rule Box */}
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', color: '#1d4ed8', textTransform: 'uppercase', fontWeight: 800 }}>
                    Eligibility Rule
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                    {p.rule.description}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <div>Total Rounds: <strong>{progRounds.length}</strong></div>
                  <div>Max Cap: <strong>{p.maxParticipants}</strong></div>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {currentUserRole !== 'VIEWER' && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedProgForRound(p.id);
                          setIsAddRoundOpen(true);
                        }}
                      >
                        <Plus size={14} />
                        <span>+ Create Round</span>
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => generateFutureRounds(p.id, 5)}
                      >
                        <Sparkles size={14} />
                        <span>Auto 5 Rounds</span>
                      </button>
                    </>
                  )}

                  <button className="btn btn-primary btn-sm" onClick={() => onSelectProgram(p.id)}>
                    <span>View All Rounds</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* POPUP MODAL 1: CREATE NEW PROGRAM */}
      {isCreateProgramOpen && (
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
          onClick={() => setIsCreateProgramOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '560px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <CalendarDays size={22} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Recurring Program</h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsCreateProgramOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProgram}>
              <div className="form-group mb-4">
                <label className="form-label">Program Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Business Round Up, N-Quest, Debate League"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Short description of this program..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="mb-4">
                <div>
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-control"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Every 2 Weeks</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Max Participants Per Round</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    max={200}
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div
                style={{
                  background: '#f5efe6',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #e7dbc9',
                }}
                className="mb-6"
              >
                <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#784421', marginBottom: '0.5rem' }}>
                  AUTOMATIC ELIGIBILITY RULE
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Rule Type</label>
                    <select
                      className="form-control"
                      value={ruleType}
                      onChange={(e) => {
                        const newType = e.target.value as RuleType;
                        setRuleType(newType);
                        if (newType === 'CLASS_WISE_ROTATION') setRuleValue(2);
                        else if (newType === 'TEAM_ROTATION') setRuleValue(3);
                        else if (newType === 'ROUNDS_INTERVENING') setRuleValue(6);
                      }}
                    >
                      <option value="CLASS_WISE_ROTATION">Class-Wise Team Auto Set Rotation</option>
                      <option value="ROUNDS_INTERVENING">Wait N Intervening Rounds</option>
                      <option value="TEAM_ROTATION">House Team Rotation (Qurtuba, Nizamiyya, Azhar, Zitouna)</option>
                      <option value="DAYS_INTERVAL">Wait N Days Gap</option>
                      <option value="ONCE_PER_MONTH">Once Per Month</option>
                    </select>
                  </div>

                  {(ruleType === 'ROUNDS_INTERVENING' || ruleType === 'DAYS_INTERVAL' || ruleType === 'CLASS_WISE_ROTATION' || ruleType === 'TEAM_ROTATION') && (
                    <div>
                      <label className="form-label">
                        {ruleType === 'CLASS_WISE_ROTATION'
                          ? 'Participants / Round (Per Class)'
                          : ruleType === 'DAYS_INTERVAL'
                          ? 'Days Gap'
                          : 'Rounds to Wait'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min={1}
                        max={50}
                        value={ruleValue}
                        onChange={(e) => setRuleValue(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#57534e', marginTop: '0.5rem', fontWeight: 600 }}>
                  Preview: "{getRuleDesc()}"
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateProgramOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Program & Generate Rounds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: CREATE NEW ROUND */}
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
            style={{ maxWidth: '450px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Create New Round</h3>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                onClick={() => setIsAddRoundOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleManualAddRound}>
              <div className="form-group mb-4">
                <label className="form-label">Select Program *</label>
                <select
                  className="form-control"
                  value={selectedProgForRound}
                  onChange={(e) => setSelectedProgForRound(e.target.value)}
                  required
                >
                  <option value="">Select a program...</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

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
