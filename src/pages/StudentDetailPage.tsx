import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  CheckCircle2,
  Zap,
  Edit2,
  X,
  Trash2,
} from 'lucide-react';
import { checkStudentEligibility } from '../services/eligibilityEngine';
import type { Student, HouseTeam } from '../types';

interface StudentDetailPageProps {
  studentId: string;
  onBack: () => void;
  onNavigateToRegister: (programId: string, roundId: string, studentId: string) => void;
}

export const StudentDetailPage: React.FC<StudentDetailPageProps> = ({
  studentId,
  onBack,
  onNavigateToRegister,
}) => {
  const { students, programs, rounds, registrations, updateStudent, deleteStudent, currentUserRole } = useApp();

  const student = students.find((s) => s.id === studentId);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  if (!student) {
    return (
      <div>
        <button className="btn btn-secondary mb-4" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <div>Student profile not found.</div>
      </div>
    );
  }

  const studentRegs = registrations
    .filter((r) => r.studentId === student.id)
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent);
    setEditingStudent(null);
  };

  return (
    <div>
      <button className="btn btn-secondary mb-4" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Student Directory
      </button>

      <div className="card mb-6" style={{ background: '#1e3a8a', color: '#ffffff' }}>
        <div className="flex-between responsive-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 800,
              }}
            >
              {student.fullName.charAt(0)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>{student.fullName}</h2>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#ffffff' }}>{student.studentId}</span>
                <span className="badge" style={{ background: '#2563eb', color: '#ffffff' }}>{student.houseGroup} House</span>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.35rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
                <div>Class: <strong style={{ color: '#ffffff' }}>{student.classGrade}</strong></div>
                <div>House Team: <strong style={{ color: '#ffffff' }}>{student.houseGroup}</strong></div>
              </div>
            </div>
          </div>

          {currentUserRole !== 'VIEWER' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                style={{ background: '#ffffff', color: '#1e3a8a', fontWeight: 800 }}
                onClick={() => setEditingStudent({ ...student })}
              >
                <Edit2 size={16} />
                <span>Edit Details</span>
              </button>
              <button
                className="btn btn-secondary"
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 800 }}
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete student "${student.fullName}" (${student.studentId}) from database?`)) {
                    deleteStudent(student.id);
                    onBack();
                  }
                }}
              >
                <Trash2 size={16} />
                <span>Delete Student</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1d4ed8' }}>
          <Zap size={18} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Program-by-Program Live Eligibility</h3>
        </div>

        <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {programs.map((prog) => {
            const progRounds = rounds
              .filter((r) => r.programId === prog.id)
              .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

            const targetRound =
              progRounds.find((r) => r.status === 'Registration Open') ||
              progRounds.find((r) => r.status === 'Upcoming') ||
              progRounds[progRounds.length - 1];

            if (!targetRound) return null;

            const elig = checkStudentEligibility(student, prog, targetRound, rounds, registrations, students);

            return (
              <div
                key={prog.id}
                style={{
                  background: elig.isEligible ? '#f0fdf4' : '#fef2f2',
                  border: `1.5px solid ${elig.isEligible ? '#86efac' : '#fca5a5'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                }}
              >
                <div className="flex-between">
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    {prog.name}
                  </div>
                  <span className={`badge ${elig.isEligible ? 'badge-eligible' : 'badge-restricted'}`}>
                    {elig.isEligible ? 'Eligible' : 'Restricted'}
                  </span>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.25rem', fontWeight: 500 }}>
                  Rule: {prog.rule.description}
                </div>

                <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                  {elig.isEligible ? (
                    <div style={{ color: '#166534', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Ready for Round {targetRound.roundNumber} ({targetRound.date})</span>
                    </div>
                  ) : (
                    <div style={{ color: '#991b1b', fontWeight: 700 }}>
                      <div>⚠️ Last: Round {elig.lastParticipation?.round.roundNumber} ({elig.lastParticipation?.round.date})</div>
                      <div style={{ color: '#1d4ed8', marginTop: '0.2rem', fontWeight: 800 }}>
                        Eligible from: Round {elig.eligibleFromRound?.roundNumber || 'Next Round'} ({elig.eligibleFromDate || 'Upcoming'})
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '0.85rem', textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onNavigateToRegister(prog.id, targetRound.id, student.id)}
                  >
                    <span>Check / Register</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Participation History Log</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Total Events: {studentRegs.length}
          </span>
        </div>

        {studentRegs.length === 0 ? (
          <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
            No participation records found for this student.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Round</th>
                  <th>Event Date</th>
                  <th>Status</th>
                  <th>Registered Date</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {studentRegs.map((reg) => {
                  const prog = programs.find((p) => p.id === reg.programId);
                  const rd = rounds.find((r) => r.id === reg.roundId);
                  return (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{prog?.name}</td>
                      <td style={{ fontWeight: 800, color: '#1d4ed8' }}>
                        Round {rd?.roundNumber || 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155' }}>{rd?.date || 'N/A'}</td>
                      <td>
                        <span
                          className={`badge ${
                            reg.status === 'Participated'
                              ? 'badge-eligible'
                              : reg.status === 'Registered'
                              ? 'badge-info'
                              : 'badge-restricted'
                          }`}
                        >
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {reg.registrationDate}
                      </td>
                      <td>
                        {reg.isOverridden ? (
                          <span className="badge badge-overridden" title={reg.overrideReason}>
                            Overridden ({reg.overriddenBy})
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT STUDENT PROFILE MODAL */}
      {editingStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setEditingStudent(null)}
        >
          <div
            className="card mobile-modal"
            style={{ maxWidth: '480px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Edit Student Details</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setEditingStudent(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentSubmit}>
              <div className="form-group mb-4">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Student ID *</label>
                <input
                  type="text"
                  className="form-control"
                  value={editingStudent.studentId}
                  onChange={(e) => setEditingStudent({ ...editingStudent, studentId: e.target.value.toUpperCase() })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="mb-6">
                <div>
                  <label className="form-label">Class</label>
                  <select
                    className="form-control"
                    value={editingStudent.classGrade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classGrade: e.target.value })}
                  >
                    {['TBD', 'S1A', 'S1B', 'S2A', 'S2B', 'C1A', 'C1B', 'C1C', 'C2A', 'C2B', 'C2C', '8', '9'].map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">House Team</label>
                  <select
                    className="form-control"
                    value={editingStudent.houseGroup}
                    onChange={(e) => setEditingStudent({ ...editingStudent, houseGroup: e.target.value as HouseTeam })}
                  >
                    <option value="Qurtuba">Qurtuba</option>
                    <option value="Nizamiyya">Nizamiyya</option>
                    <option value="Azhar">Azhar</option>
                    <option value="Zitouna">Zitouna</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingStudent(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
