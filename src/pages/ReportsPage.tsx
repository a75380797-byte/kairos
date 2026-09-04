import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Printer, Award, ShieldAlert, Users } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { programs, rounds, students, registrations, auditLogs } = useApp();

  const [selectedProgFilter, setSelectedProgFilter] = useState('ALL');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');

  const filteredRegistrations = registrations.filter((r) => {
    const st = students.find((s) => s.id === r.studentId);
    const matchesProg = selectedProgFilter === 'ALL' || r.programId === selectedProgFilter;
    const matchesClass = selectedClassFilter === 'ALL' || st?.classGrade === selectedClassFilter;
    return matchesProg && matchesClass;
  });

  const studentParticipationCounts: { [studentId: string]: number } = {};
  filteredRegistrations.forEach((r) => {
    if (r.status === 'Participated' || r.status === 'Registered') {
      studentParticipationCounts[r.studentId] = (studentParticipationCounts[r.studentId] || 0) + 1;
    }
  });

  const mostActiveStudents = Object.entries(studentParticipationCounts)
    .map(([stId, count]) => {
      const student = students.find((s) => s.id === stId);
      return { student, count };
    })
    .filter((item): item is { student: typeof students[0]; count: number } => item.student !== undefined)
    .sort((a, b) => b.count - a.count);

  const restrictedAttempts = auditLogs.filter((l) => l.action === 'RESTRICTED_ATTEMPT');
  const overridesCount = registrations.filter((r) => r.isOverridden).length;

  const handleExportCSV = () => {
    const headers = ['Registration ID', 'Student Name', 'Student ID', 'Class', 'Program', 'Round', 'Status', 'Date', 'Overridden'];
    const rows = filteredRegistrations.map((r) => {
      const st = students.find((s) => s.id === r.studentId);
      const prog = programs.find((p) => p.id === r.programId);
      const rd = rounds.find((rnd) => rnd.id === r.roundId);
      return [
        r.id,
        `"${st?.fullName || 'Unknown'}"`,
        st?.studentId || '',
        `"${st?.classGrade || ''}"`,
        `"${prog?.name || ''}"`,
        rd?.roundNumber || '',
        r.status,
        r.registrationDate,
        r.isOverridden ? 'YES' : 'NO',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kairoos_participation_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex-between mb-6 responsive-flex">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Participation & Restriction Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive reporting on program attendance, rule enforcement efficiency, and student leaderboards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={18} />
            <span>Export CSV Report</span>
          </button>
          <button className="btn btn-primary" onClick={handlePrintReport}>
            <Printer size={18} />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      <div className="glass-card mb-6" style={{ padding: '1rem 1.25rem' }}>
        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Filter Program</label>
            <select
              className="form-control"
              value={selectedProgFilter}
              onChange={(e) => setSelectedProgFilter(e.target.value)}
            >
              <option value="ALL">All Programs</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Filter Class</label>
            <select
              className="form-control"
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
            >
              <option value="ALL">All Classes</option>
              <option value="IX">Class IX</option>
              <option value="X">Class X</option>
              <option value="XI">Class XI</option>
              <option value="XII">Class XII</option>
            </select>
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{filteredRegistrations.length}</div>
            <div className="stat-lbl">Total Registrations Evaluated</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#f87171' }}>{restrictedAttempts.length}</div>
            <div className="stat-lbl">Restricted Attempts Prevented</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-val" style={{ color: '#fbbf24' }}>{overridesCount}</div>
            <div className="stat-lbl">Admin Overrides Granted</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Award size={20} className="text-warning" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Most Active Student Participants</h3>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>House</th>
                  <th>Participations</th>
                </tr>
              </thead>
              <tbody>
                {mostActiveStudents.slice(0, 6).map((item, idx) => (
                  <tr key={item.student.id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>#{idx + 1}</td>
                    <td style={{ fontWeight: 700 }}>{item.student.fullName}</td>
                    <td>{item.student.classGrade}</td>
                    <td><span className="badge badge-info">{item.student.houseGroup}</span></td>
                    <td style={{ fontWeight: 800, color: '#10b981' }}>{item.count} events</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={20} className="text-primary" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Program Participation Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {programs.map((p) => {
              const progRegs = registrations.filter((r) => r.programId === p.id && r.status !== 'Cancelled');
              const percent = Math.min(100, Math.round((progRegs.length / (registrations.length || 1)) * 100));

              return (
                <div key={p.id}>
                  <div className="flex-between mb-2">
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {progRegs.length} entries ({percent}%)
                    </span>
                  </div>

                  <div
                    style={{
                      height: '10px',
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: '5px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${percent}%`,
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                        borderRadius: '5px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
