import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Plus, ArrowRight, X, Edit2 } from 'lucide-react';
import type { Student, HouseTeam } from '../types';

interface StudentsPageProps {
  onSelectStudent: (studentId: string) => void;
}

const CLASS_OPTIONS = [
  'TBD',
  'S1A',
  'S1B',
  'S2A',
  'S2B',
  'C1A',
  'C1B',
  'C1C',
  'C2A',
  'C2B',
  'C2C',
  '8',
  '9',
];

export const StudentsPage: React.FC<StudentsPageProps> = ({ onSelectStudent }) => {
  const { students, addStudent, updateStudent, currentUserRole, resetDemoData } = useApp();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [houseFilter, setHouseFilter] = useState('ALL');

  // Add Student Modal State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');
  const [classGrade, setClassGrade] = useState('TBD');
  const [houseGroup, setHouseGroup] = useState<HouseTeam>('Qurtuba');

  // Edit Student Modal State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'ALL' || s.classGrade === classFilter;
    const matchesHouse = houseFilter === 'ALL' || s.houseGroup === houseFilter;
    return matchesSearch && matchesClass && matchesHouse;
  });

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !studentIdInput.trim()) return;

    addStudent({
      fullName: fullName.trim(),
      studentId: studentIdInput.trim().toUpperCase(),
      classGrade,
      houseGroup,
    });

    setIsAddStudentOpen(false);
    setFullName('');
    setStudentIdInput('');
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.fullName.trim() || !editingStudent.studentId.trim()) return;

    updateStudent(editingStudent);
    setEditingStudent(null);
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Student Database</h2>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Manage student records, class grades, and house team affiliations.
          </p>
        </div>

        {currentUserRole !== 'VIEWER' && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={resetDemoData} title="Load all 324 transcribed students into database">
              <span>⚡ Load 324 Students (Class TBD)</span>
            </button>
            <button className="btn btn-primary" onClick={() => setIsAddStudentOpen(true)}>
              <Plus size={18} />
              <span>+ Add New Student</span>
            </button>
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="card mb-6">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label className="form-label">Search Student</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Name or STU ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          <div>
            <label className="form-label">Filter by Class</label>
            <select
              className="form-control"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="ALL">All Classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Filter by House Team</label>
            <select
              className="form-control"
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
            >
              <option value="ALL">All House Teams</option>
              <option value="Qurtuba">Qurtuba</option>
              <option value="Nizamiyya">Nizamiyya</option>
              <option value="Azhar">Azhar</option>
              <option value="Zitouna">Zitouna</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student List Table */}
      <div className="card">
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Registered Students ({filteredStudents.length})
          </h3>
          <button className="btn btn-secondary btn-sm" onClick={resetDemoData}>
            <span>⚡ Reload All 324 Students (Class TBD)</span>
          </button>
        </div>

        {filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px dashed #93c5fd' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
              📦 No Students Matching Current Filter
            </div>
            <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Click below to load all 324 transcribed students (with Class Grade set to TBD for manual assignment) or clear your search filters.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={resetDemoData}>
                <span>⚡ Load All 324 Students (Class TBD)</span>
              </button>
              {currentUserRole !== 'VIEWER' && (
                <button className="btn btn-secondary" onClick={() => setIsAddStudentOpen(true)}>
                  <Plus size={16} />
                  <span>+ Add Custom Student</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>Class Grade</th>
                  <th>House Team</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 800, color: '#1d4ed8' }}>{s.studentId}</td>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>{s.fullName}</td>
                    <td style={{ fontWeight: 700, color: s.classGrade === 'TBD' ? '#d97706' : '#0f172a' }}>
                      Class {s.classGrade}
                    </td>
                    <td>
                      <span className="badge badge-info">{s.houseGroup} Team</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {currentUserRole !== 'VIEWER' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditingStudent({ ...s })}
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                        )}

                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onSelectStudent(s.id)}
                        >
                          <span>Profile & History</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP MODAL 1: ADD STUDENT */}
      {isAddStudentOpen && (
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
          onClick={() => setIsAddStudentOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '480px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Add New Student</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setIsAddStudentOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateStudent}>
              <div className="form-group mb-4">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Ahmed Al-Mansoor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Student ID * (e.g. STU011)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. STU011"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="mb-6">
                <div>
                  <label className="form-label">Class Grade</label>
                  <select
                    className="form-control"
                    value={classGrade}
                    onChange={(e) => setClassGrade(e.target.value)}
                  >
                    {CLASS_OPTIONS.map((cls) => (
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
                    value={houseGroup}
                    onChange={(e) => setHouseGroup(e.target.value as HouseTeam)}
                  >
                    <option value="Qurtuba">Qurtuba</option>
                    <option value="Nizamiyya">Nizamiyya</option>
                    <option value="Azhar">Azhar</option>
                    <option value="Zitouna">Zitouna</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddStudentOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: EDIT STUDENT */}
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
            className="card"
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
                  <label className="form-label">Class Grade</label>
                  <select
                    className="form-control"
                    value={editingStudent.classGrade}
                    onChange={(e) => setEditingStudent({ ...editingStudent, classGrade: e.target.value })}
                  >
                    {CLASS_OPTIONS.map((cls) => (
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
