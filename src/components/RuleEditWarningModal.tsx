import React, { useState } from 'react';
import { AlertTriangle, X, Settings } from 'lucide-react';
import type { Program, RuleType, ParticipationStatus } from '../types';

interface RuleEditWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
  onSaveRule: (updatedRule: Program['rule']) => void;
}

export const RuleEditWarningModal: React.FC<RuleEditWarningModalProps> = ({
  isOpen,
  onClose,
  program,
  onSaveRule,
}) => {
  const [ruleType, setRuleType] = useState<RuleType>(program.rule.ruleType);
  const [value, setValue] = useState<number>(program.rule.value);
  const [countableStatuses, setCountableStatuses] = useState<ParticipationStatus[]>(
    program.rule.countableStatuses
  );

  if (!isOpen) return null;

  const handleStatusToggle = (status: ParticipationStatus) => {
    if (countableStatuses.includes(status)) {
      if (countableStatuses.length === 1) return;
      setCountableStatuses(countableStatuses.filter((s) => s !== status));
    } else {
      setCountableStatuses([...countableStatuses, status]);
    }
  };

  const getGeneratedDescription = () => {
    if (ruleType === 'ROUNDS_INTERVENING') {
      return `Student can participate once every ${value} rounds`;
    } else if (ruleType === 'DAYS_INTERVAL') {
      return `Student must wait ${value} days between participation`;
    } else if (ruleType === 'ONCE_PER_MONTH') {
      return `Student can participate maximum once per calendar month`;
    } else {
      return `Student can participate maximum once per academic term`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRule({
      ruleType,
      value,
      countableStatuses,
      description: getGeneratedDescription(),
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card mobile-modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={22} className="text-primary" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Edit Rule: {program.name}
            </h3>
          </div>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700 }}>
                <AlertTriangle size={18} />
                <span>IMPORTANT RULE MODIFICATION WARNING</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', marginTop: '0.35rem' }}>
                Modifying the eligibility rule for <strong>{program.name}</strong> will dynamically recalculate student eligibility across all upcoming rounds. Historical participation logs will remain intact, but future registration checks will enforce this updated logic immediately.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Rule Type / Structure</label>
              <select
                className="form-control"
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as RuleType)}
              >
                <option value="CLASS_WISE_ROTATION">Class-Wise Team Set Rotation (2-Set / 3-Set Rotation per Class)</option>
                <option value="ROUNDS_INTERVENING">Wait N Intervening Rounds (e.g. Once every 6 rounds)</option>
                <option value="TEAM_ROTATION">House Team Rotation (Qurtuba, Nizamiyya, Azhar, Zitouna)</option>
                <option value="DAYS_INTERVAL">Wait N Days Interval (e.g. 30 days gap)</option>
                <option value="ONCE_PER_MONTH">Once Per Calendar Month</option>
              </select>
            </div>

            {(ruleType === 'ROUNDS_INTERVENING' || ruleType === 'DAYS_INTERVAL' || ruleType === 'CLASS_WISE_ROTATION' || ruleType === 'TEAM_ROTATION') && (
              <div className="form-group mb-4">
                <label className="form-label">
                  {ruleType === 'CLASS_WISE_ROTATION'
                    ? 'Participants / Round (Per Class Team)'
                    : ruleType === 'DAYS_INTERVAL'
                    ? 'Days Gap Required'
                    : 'Rounds to Wait'}
                </label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={50}
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Statuses That Count Toward Restriction Rule</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
                {(['Participated', 'Registered', 'Cancelled', 'Absent', 'Disqualified'] as ParticipationStatus[]).map(
                  (st) => {
                    const isChecked = countableStatuses.includes(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => handleStatusToggle(st)}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {st}
                      </button>
                    );
                  }
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.4rem' }}>
                Default: "Participated" & "Registered" count towards restriction. "Cancelled" does not trigger restriction unless selected.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                marginTop: '1rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#a5b4fc', textTransform: 'uppercase', fontWeight: 700 }}>
                Rule Description Preview
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '0.2rem' }}>
                "{getGeneratedDescription()}"
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save & Apply Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
