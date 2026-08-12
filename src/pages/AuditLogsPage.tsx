import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      (log.studentName && log.studentName.toLowerCase().includes(search.toLowerCase())) ||
      (log.programName && log.programName.toLowerCase().includes(search.toLowerCase())) ||
      log.user.toLowerCase().includes(search.toLowerCase());

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Audit Logs</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Immutable chronological audit record of registrations, restricted attempts, admin overrides, and rule changes.
          </p>
        </div>
      </div>

      <div className="glass-card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Search Log Trail</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Student, Program, Staff name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.2rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label className="form-label">Filter by Action Type</label>
            <select
              className="form-control"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">All Audit Actions ({auditLogs.length})</option>
              <option value="RESTRICTED_ATTEMPT">Blocked Restricted Attempts</option>
              <option value="ELIGIBILITY_OVERRIDE">Admin Eligibility Overrides</option>
              <option value="STUDENT_REGISTERED">Student Registrations</option>
              <option value="REGISTRATION_CANCELLED">Cancellations</option>
              <option value="PROGRAM_RULE_MODIFIED">Program Rule Modifications</option>
              <option value="PROGRAM_CREATED">Program Creations</option>
              <option value="ROUND_CREATED">Round Creations</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action Type</th>
                <th>Details / Description</th>
                <th>Student</th>
                <th>Program & Round</th>
                <th>User / Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
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
                    {log.action === 'REGISTRATION_CANCELLED' && (
                      <span className="badge badge-danger">Cancelled</span>
                    )}
                    {log.action === 'PROGRAM_RULE_MODIFIED' && (
                      <span className="badge badge-warning">Rule Modified</span>
                    )}
                    {log.action === 'PROGRAM_CREATED' && (
                      <span className="badge badge-info">Program Created</span>
                    )}
                    {log.action === 'ROUND_CREATED' && (
                      <span className="badge badge-info">Round Created</span>
                    )}
                    {log.action === 'STUDENT_CREATED' && (
                      <span className="badge badge-info">Student Created</span>
                    )}
                  </td>
                  <td style={{ maxWidth: '350px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{log.details}</div>
                    {log.reason && (
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#fbbf24',
                          marginTop: '0.2rem',
                          background: 'rgba(245,158,11,0.1)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          display: 'inline-block',
                        }}
                      >
                        Justification: "{log.reason}"
                      </div>
                    )}
                  </td>
                  <td>
                    {log.studentName ? (
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{log.studentName}</div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {log.programName ? (
                      <div>
                        <div style={{ fontSize: '0.85rem' }}>{log.programName}</div>
                        {log.roundNumber && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Round {log.roundNumber}
                          </div>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.user}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>{log.userRole}</div>
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
