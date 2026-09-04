import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Student, SheetType, DisciplinaryRecord } from '../types';
import { isBanActive } from '../services/eligibilityEngine';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Search,
  Filter,
  User,
  X,
  Plus,
  ShieldCheck,
  FileText,
  Building2,
} from 'lucide-react';

export const DisciplinaryPage: React.FC = () => {
  const {
    students,
    disciplinaryRecords,
    issueDisciplinarySheet,
    revokeDisciplinarySheet,
    currentUserRole,
  } = useApp();

  // Navigation / View Tab
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'records'>('roster');

  // Filters for Roster
  const [searchQuery, setSearchQuery] = useState('');
  const [houseFilter, setHouseFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BLACK' | 'YELLOW' | 'ANY_BAN' | 'CLEAN'>('ALL');

  // Issue Sheet Modal State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedStudentForSheet, setSelectedStudentForSheet] = useState<Student | null>(null);
  const [sheetType, setSheetType] = useState<SheetType>('BLACK');
  const [reasonInput, setReasonInput] = useState('');
  const [issueError, setIssueError] = useState<string | null>(null);
  const [issueSuccess, setIssueSuccess] = useState<string | null>(null);

  // Revoke Modal State
  const [selectedRecordForRevoke, setSelectedRecordForRevoke] = useState<DisciplinaryRecord | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to calculate active status for a student
  const getStudentActiveBan = (studentId: string): DisciplinaryRecord | undefined => {
    return disciplinaryRecords.find(
      (r) => r.studentId === studentId && isBanActive(r, todayStr)
    );
  };

  // Helper to calculate remaining days
  const getRemainingDays = (endDateStr: string): number => {
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Metrics
  const activeBlackSheets = disciplinaryRecords.filter(
    (r) => r.sheetType === 'BLACK' && isBanActive(r, todayStr)
  );
  const activeYellowSheets = disciplinaryRecords.filter(
    (r) => r.sheetType === 'YELLOW' && isBanActive(r, todayStr)
  );

  const bannedStudentIds = new Set(
    disciplinaryRecords
      .filter((r) => isBanActive(r, todayStr))
      .map((r) => r.studentId)
  );

  const cleanStudentsCount = students.length - bannedStudentIds.size;

  // Filtered Students List
  const filteredStudents = students.filter((st) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      st.fullName.toLowerCase().includes(q) ||
      st.studentId.toLowerCase().includes(q) ||
      st.classGrade.toLowerCase().includes(q) ||
      st.houseGroup.toLowerCase().includes(q);

    const matchesHouse = houseFilter === 'ALL' || st.houseGroup === houseFilter;

    const activeBan = getStudentActiveBan(st.id);
    let matchesStatus = true;

    if (statusFilter === 'BLACK') {
      matchesStatus = activeBan?.sheetType === 'BLACK';
    } else if (statusFilter === 'YELLOW') {
      matchesStatus = activeBan?.sheetType === 'YELLOW';
    } else if (statusFilter === 'ANY_BAN') {
      matchesStatus = activeBan !== undefined;
    } else if (statusFilter === 'CLEAN') {
      matchesStatus = activeBan === undefined;
    }

    return matchesSearch && matchesHouse && matchesStatus;
  });

  const handleOpenIssueModal = (student?: Student) => {
    setSelectedStudentForSheet(student || null);
    setSheetType('BLACK');
    setReasonInput('');
    setIssueError(null);
    setIssueSuccess(null);
    setIsIssueModalOpen(true);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForSheet) {
      setIssueError('Please select a student.');
      return;
    }
    if (!reasonInput.trim()) {
      setIssueError('Please enter a reason for issuing this sheet.');
      return;
    }

    const res = issueDisciplinarySheet(selectedStudentForSheet.id, sheetType, reasonInput);
    if (res.success) {
      setIssueSuccess(res.message);
      setTimeout(() => {
        setIsIssueModalOpen(false);
        setIssueSuccess(null);
      }, 1200);
    } else {
      setIssueError(res.message);
    }
  };

  const handleRevokeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForRevoke) return;

    const res = revokeDisciplinarySheet(selectedRecordForRevoke.id, revokeReasonInput);
    if (res.success) {
      setSelectedRecordForRevoke(null);
      setRevokeReasonInput('');
      setRevokeError(null);
    } else {
      setRevokeError(res.message);
    }
  };

  // Preview dates for issue modal
  const calcDuration = sheetType === 'BLACK' ? 15 : 3;
  const calcEndDate = new Date();
  calcEndDate.setDate(calcEndDate.getDate() + calcDuration);
  const calcEndDateStr = calcEndDate.toISOString().split('T')[0];

  return (
    <div className="page-container" style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div
        className="responsive-flex banner-responsive"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #311b92 50%, #4527a0 100%)',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(49, 27, 146, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f87171',
              }}
            >
              <ShieldAlert size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: '#ffffff' }}>
                Discipline & Ban Management
              </h1>
              <span style={{ fontSize: '0.85rem', color: '#c7d2fe', fontWeight: 500 }}>
                Issue Black Sheets (15-Day All-Program Ban) & Yellow Sheets (3-Day Ban)
              </span>
            </div>
          </div>
        </div>

        {currentUserRole !== 'VIEWER' && (
          <button
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              fontWeight: 700,
              padding: '0.75rem 1.4rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onClick={() => handleOpenIssueModal()}
          >
            <Plus size={18} />
            <span>Issue Disciplinary Sheet</span>
          </button>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div
        className="responsive-grid stat-cards-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Roster */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(15,23,42,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Roster
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>{students.length}</div>
          </div>
        </div>

        {/* Active Black Sheets */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #fee2e2',
            boxShadow: '0 4px 12px rgba(239,68,68,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#18181b',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ef4444',
            }}
          >
            <AlertOctagon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 700, textTransform: 'uppercase' }}>
              Black Sheets (15d Ban)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b' }}>{activeBlackSheets.length}</div>
          </div>
        </div>

        {/* Active Yellow Sheets */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #fef08a',
            boxShadow: '0 4px 12px rgba(234,179,8,0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#fef9c3',
              color: '#ca8a04',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ca8a04',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: 700, textTransform: 'uppercase' }}>
              Yellow Sheets (3d Ban)
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a16207' }}>{activeYellowSheets.length}</div>
          </div>
        </div>

        {/* Clean Eligible Roster */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #dcfce7',
            boxShadow: '0 4px 12px rgba(34,197,94,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>
              Clean Eligible Roster
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>{cleanStudentsCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        className="sub-tabs-scroll"
        style={{
          display: 'flex',
          gap: '0.75rem',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: '1.5rem',
        }}
      >
        <button
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'roster' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeSubTab === 'roster' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
          }}
          onClick={() => setActiveSubTab('roster')}
        >
          <User size={18} />
          <span>Student Roster & Ban Status ({students.length})</span>
        </button>

        <button
          style={{
            padding: '0.75rem 1.25rem',
            fontWeight: 700,
            fontSize: '0.95rem',
            background: 'none',
            border: 'none',
            borderBottom: activeSubTab === 'records' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeSubTab === 'records' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '-2px',
          }}
          onClick={() => setActiveSubTab('records')}
        >
          <FileText size={18} />
          <span>Disciplinary Records Log ({disciplinaryRecords.length})</span>
        </button>
      </div>

      {/* SUBTAB 1: Student Roster */}
      {activeSubTab === 'roster' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          {/* Controls Bar */}
          <div
            className="responsive-flex"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '300px', flex: 1 }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                type="text"
                className="input"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="Search by student name, ID (e.g. STU101), class, house..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* House Team Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} style={{ color: '#64748b' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>House:</span>
              <select
                className="input"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
                value={houseFilter}
                onChange={(e) => setHouseFilter(e.target.value)}
              >
                <option value="ALL">All Houses</option>
                <option value="Azhar">Azhar</option>
                <option value="Nizamiyya">Nizamiyya</option>
                <option value="Qurtuba">Qurtuba</option>
                <option value="Zitouna">Zitouna</option>
              </select>
            </div>

            {/* Ban Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={16} style={{ color: '#64748b' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Ban Status:</span>
              <select
                className="input"
                style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Roster</option>
                <option value="ANY_BAN">🚨 Any Active Ban</option>
                <option value="BLACK">⬛ Black Sheet (15d Ban)</option>
                <option value="YELLOW">🨨 Yellow Sheet (3d Ban)</option>
                <option value="CLEAN">🟢 Clean Eligible</option>
              </select>
            </div>
          </div>

          {/* Roster Table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>STUDENT ID</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>FULL NAME</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>HOUSE TEAM</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>CLASS</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>CURRENT BAN STATUS</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No students found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const activeBan = getStudentActiveBan(st.id);
                    const remainingDays = activeBan ? getRemainingDays(activeBan.endDate) : 0;

                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'monospace', color: '#334155' }}>
                          {st.studentId}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#0f172a' }}>
                          {st.fullName}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background:
                                st.houseGroup === 'Azhar'
                                  ? '#eff6ff'
                                  : st.houseGroup === 'Nizamiyya'
                                  ? '#fef3c7'
                                  : st.houseGroup === 'Qurtuba'
                                  ? '#f0fdf4'
                                  : '#faf5ff',
                              color:
                                st.houseGroup === 'Azhar'
                                  ? '#1d4ed8'
                                  : st.houseGroup === 'Nizamiyya'
                                  ? '#b45309'
                                  : st.houseGroup === 'Qurtuba'
                                  ? '#15803d'
                                  : '#6b21a8',
                            }}
                          >
                            {st.houseGroup}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#475569' }}>
                          {st.classGrade || 'TBD'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {activeBan ? (
                            activeBan.sheetType === 'BLACK' ? (
                              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    background: '#18181b',
                                    color: '#f87171',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    border: '1px solid #ef4444',
                                  }}
                                >
                                  <AlertOctagon size={13} />
                                  <span>⬛ BLACK SHEET (15d Ban)</span>
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#991b1b', fontWeight: 600 }}>
                                  Until {activeBan.endDate} ({remainingDays} {remainingDays === 1 ? 'day' : 'days'} left)
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '2px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.35rem',
                                    background: '#fef9c3',
                                    color: '#854d0e',
                                    padding: '0.3rem 0.65rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 800,
                                    border: '1px solid #ca8a04',
                                  }}
                                >
                                  <AlertTriangle size={13} />
                                  <span>🨨 YELLOW SHEET (3d Ban)</span>
                                </span>
                                <span style={{ fontSize: '0.72rem', color: '#a16207', fontWeight: 600 }}>
                                  Until {activeBan.endDate} ({remainingDays} {remainingDays === 1 ? 'day' : 'days'} left)
                                </span>
                              </div>
                            )
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#f0fdf4',
                                color: '#16a34a',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                              }}
                            >
                              <ShieldCheck size={13} />
                              <span>Clean / Eligible</span>
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          {currentUserRole !== 'VIEWER' && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: activeBan ? '#f1f5f9' : '#1e293b',
                                color: activeBan ? '#334155' : '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                              }}
                              onClick={() => handleOpenIssueModal(st)}
                            >
                              {activeBan ? 'Issue New Sheet' : '+ Issue Sheet'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Disciplinary Records History Log */}
      {activeSubTab === 'records' && (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            All Issued Disciplinary Sheets
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>SHEET TYPE</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>STUDENT</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>BAN DATES</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>REASON</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>ISSUED BY</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {disciplinaryRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No disciplinary sheets have been issued yet.
                    </td>
                  </tr>
                ) : (
                  disciplinaryRecords.map((rec) => {
                    const active = isBanActive(rec, todayStr);
                    const remaining = getRemainingDays(rec.endDate);

                    return (
                      <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {rec.sheetType === 'BLACK' ? (
                            <span
                              style={{
                                background: '#18181b',
                                color: '#f87171',
                                border: '1px solid #ef4444',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              ⬛ BLACK (15d)
                            </span>
                          ) : (
                            <span
                              style={{
                                background: '#fef9c3',
                                color: '#854d0e',
                                border: '1px solid #ca8a04',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              🨨 YELLOW (3d)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.studentName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {rec.studentCode} • Class {rec.classGrade} ({rec.houseGroup})
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155' }}>
                          <div><strong>Issued:</strong> {rec.issueDate}</div>
                          <div><strong>Ends:</strong> {rec.endDate}</div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '300px', fontSize: '0.85rem', color: '#334155' }}>
                          {rec.reason}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#64748b' }}>
                          {rec.issuedBy}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {rec.status === 'REVOKED' ? (
                            <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                              Revoked
                            </span>
                          ) : active ? (
                            <span style={{ padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                              ACTIVE BAN ({remaining}d left)
                            </span>
                          ) : (
                            <span style={{ padding: '0.25rem 0.5rem', background: '#e2e8f0', color: '#475569', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                              Expired
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          {rec.status === 'ACTIVE' && active && currentUserRole !== 'VIEWER' && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}
                              onClick={() => {
                                setSelectedRecordForRevoke(rec);
                                setRevokeReasonInput('');
                                setRevokeError(null);
                              }}
                            >
                              Revoke Ban
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE DISCIPLINARY SHEET MODAL */}
      {isIssueModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="mobile-modal"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: sheetType === 'BLACK' ? '#18181b' : '#ca8a04',
                color: '#ffffff',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={22} />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                  Issue Disciplinary Sheet
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
                onClick={() => setIsIssueModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleIssueSubmit} style={{ padding: '1.5rem' }}>
              {issueError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    color: '#991b1b',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {issueError}
                </div>
              )}

              {issueSuccess && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#166534',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {issueSuccess}
                </div>
              )}

              {/* Select Student */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
                  Target Student
                </label>
                <select
                  className="input"
                  style={{ width: '100%', padding: '0.65rem 0.8rem', fontWeight: 600 }}
                  value={selectedStudentForSheet?.id || ''}
                  onChange={(e) => {
                    const st = students.find((s) => s.id === e.target.value);
                    setSelectedStudentForSheet(st || null);
                  }}
                >
                  <option value="">-- Select Student from Roster --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.studentId} • Class {s.classGrade} • {s.houseGroup})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sheet Type Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '0.5rem' }}>
                  Disciplinary Sheet Type
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {/* Black Sheet Option */}
                  <div
                    style={{
                      border: sheetType === 'BLACK' ? '2px solid #ef4444' : '1px solid #cbd5e1',
                      background: sheetType === 'BLACK' ? '#18181b' : '#fafafa',
                      color: sheetType === 'BLACK' ? '#ffffff' : '#1e293b',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSheetType('BLACK')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '0.3rem', color: sheetType === 'BLACK' ? '#f87171' : '#dc2626' }}>
                      <AlertOctagon size={18} />
                      <span>Black Sheet</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>15-Day All-Program Ban</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Blocks student from registering in any program for 15 days.</div>
                  </div>

                  {/* Yellow Sheet Option */}
                  <div
                    style={{
                      border: sheetType === 'YELLOW' ? '2px solid #ca8a04' : '1px solid #cbd5e1',
                      background: sheetType === 'YELLOW' ? '#fef9c3' : '#fafafa',
                      color: sheetType === 'YELLOW' ? '#854d0e' : '#1e293b',
                      borderRadius: '10px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSheetType('YELLOW')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, marginBottom: '0.3rem', color: '#a16207' }}>
                      <AlertTriangle size={18} />
                      <span>Yellow Sheet</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.2rem' }}>3-Day Ban</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Blocks student from registering in any program for 3 days.</div>
                  </div>
                </div>
              </div>

              {/* Ban Preview Info Card */}
              <div
                style={{
                  background: sheetType === 'BLACK' ? '#fff1f2' : '#fefce8',
                  border: sheetType === 'BLACK' ? '1px solid #fecdd3' : '1px solid #fef08a',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.83rem',
                  color: sheetType === 'BLACK' ? '#9f1239' : '#713f12',
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                  🗓️ Effective Ban Period ({calcDuration} Days):
                </div>
                <div>Starts: <strong>{todayStr}</strong> (Today)</div>
                <div>Expires: <strong>{calcEndDateStr}</strong></div>
              </div>

              {/* Reason */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
                  Reason for Disciplinary Action
                </label>
                <textarea
                  className="input"
                  rows={3}
                  style={{ width: '100%', padding: '0.65rem 0.8rem', fontSize: '0.85rem' }}
                  placeholder="Describe the incident or reason for issuing this disciplinary sheet..."
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsIssueModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: sheetType === 'BLACK' ? '#18181b' : '#ca8a04',
                    color: '#ffffff',
                    fontWeight: 700,
                  }}
                >
                  Issue {sheetType === 'BLACK' ? 'Black Sheet (15d)' : 'Yellow Sheet (3d)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVOKE BAN MODAL */}
      {selectedRecordForRevoke && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            className="mobile-modal"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            <div style={{ background: '#334155', color: '#ffffff', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Revoke Disciplinary Ban</h3>
              <button style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }} onClick={() => setSelectedRecordForRevoke(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRevokeSubmit} style={{ padding: '1.5rem' }}>
              {revokeError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {revokeError}
                </div>
              )}

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#334155' }}>
                Are you sure you want to revoke the <strong>{selectedRecordForRevoke.sheetType} Sheet</strong> ban for <strong>{selectedRecordForRevoke.studentName}</strong>?
              </p>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#334155', marginBottom: '0.4rem' }}>
                  Reason for Revocation
                </label>
                <input
                  type="text"
                  className="input"
                  style={{ width: '100%', padding: '0.65rem 0.8rem' }}
                  placeholder="e.g. Apology accepted, appeal granted, accidental entry..."
                  value={revokeReasonInput}
                  onChange={(e) => setRevokeReasonInput(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRecordForRevoke(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" style={{ fontWeight: 700 }}>
                  Confirm Revoke Ban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisciplinaryPage;
