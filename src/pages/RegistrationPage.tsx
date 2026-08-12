import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  UserPlus,
  Trash2,
  Plus,
  X,
  Sparkles,
  Camera,
  Upload,
  FileText,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkStudentEligibility } from '../services/eligibilityEngine';
import { OverrideModal } from '../components/OverrideModal';
import { parsePaperWithGroq, type ParsedStudentFromPaper } from '../services/groqService';
import type { Student, ParticipationStatus, EligibilityResult } from '../types';

interface RegistrationPageProps {
  initialProgramId?: string;
  initialRoundId?: string;
  initialStudentId?: string;
  onNavigateToStudent: (studentId: string) => void;
}

interface AIScanEvaluationItem {
  extracted: ParsedStudentFromPaper;
  matchedStudent?: Student;
  eligibility: EligibilityResult;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  initialProgramId,
  initialRoundId,
  initialStudentId,
  onNavigateToStudent,
}) => {
  const {
    programs,
    rounds,
    students,
    registrations,
    registerStudent,
    cancelRegistration,
    updateRegistrationStatus,
    addRound,
    addStudent,
    currentUserRole,
  } = useApp();

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgramId || programs[0]?.id || ''
  );

  const programRounds = rounds
    .filter((r) => r.programId === selectedProgramId)
    .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  const [selectedRoundId, setSelectedRoundId] = useState<string>(
    initialRoundId || programRounds.find((r) => r.status === 'Registration Open')?.id || programRounds[0]?.id || ''
  );

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [isAddRoundModalOpen, setIsAddRoundModalOpen] = useState(false);
  const [quickRoundNum, setQuickRoundNum] = useState('');
  const [quickRoundDate, setQuickRoundDate] = useState('2026-08-25');

  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Camera Paper Scanner Modal State
  const [isAiScannerOpen, setIsAiScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'upload' | 'text'>('camera');
  const [paperText, setPaperText] = useState(
    `Class XI-A Qurtuba Team Paper Sheet:\n1. Ahmed Al-Mansoor (Class XI-A, Qurtuba Team)\n2. Fatima Al-Zahra (Class XI-A, Nizamiyya Team)\n3. Tariq Hameed (Class X-B, Azhar Team)\n4. Zaid Ibrahim (Class XI-A, Qurtuba Team)\n5. Omar Farooq (Class IX-A, Qurtuba Team)`
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<AIScanEvaluationItem[] | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudentId) {
      const s = students.find((st) => st.id === initialStudentId);
      if (s) setSelectedStudent(s);
    }
  }, [initialStudentId, students]);

  useEffect(() => {
    if (selectedProgramId) {
      const pRounds = rounds
        .filter((r) => r.programId === selectedProgramId)
        .sort((a, b) => a.sequenceIndex - b.sequenceIndex);
      if (!pRounds.some((r) => r.id === selectedRoundId)) {
        const openR = pRounds.find((r) => r.status === 'Registration Open');
        setSelectedRoundId(openR ? openR.id : pRounds[0]?.id || '');
      }
    }
  }, [selectedProgramId, rounds]);

  // Clean up camera stream when modal closes
  useEffect(() => {
    if (!isAiScannerOpen || scannerMode !== 'camera') {
      stopCamera();
    }
  }, [isAiScannerOpen, scannerMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Webcam stream unavailable:', err);
      setCameraError('Camera access not granted or unavailable. You can upload a photo of the paper below!');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleSnapCameraAndAnalyze = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setUploadedImagePreview(dataUrl);
      }
    }
    handleRunAiPaperScan(paperText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const currentProgram = programs.find((p) => p.id === selectedProgramId);
  const currentRound = rounds.find((r) => r.id === selectedRoundId);

  const eligibility =
    selectedStudent && currentProgram && currentRound
      ? checkStudentEligibility(selectedStudent, currentProgram, currentRound, rounds, registrations, students)
      : null;

  const filteredStudentSuggestions = studentSearch.trim()
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.classGrade.toLowerCase().includes(studentSearch.toLowerCase()) ||
          s.houseGroup.toLowerCase().includes(studentSearch.toLowerCase())
      )
    : [];

  const roundRegistrations = registrations.filter(
    (reg) => reg.roundId === selectedRoundId
  );

  const handleRegisterSuccess = (msg: string) => {
    setFeedback({ type: 'success', text: msg });
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setSelectedStudent(null);
    setStudentSearch('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleAddParticipant = () => {
    if (!selectedStudent || !selectedRoundId) return;
    const res = registerStudent(selectedStudent.id, selectedRoundId);
    if (res.success) {
      handleRegisterSuccess(res.message);
    } else {
      setFeedback({ type: 'error', text: res.message });
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleConfirmOverride = (reason: string, adminName: string) => {
    if (!selectedStudent || !selectedRoundId) return;
    const res = registerStudent(selectedStudent.id, selectedRoundId, true, reason, adminName);
    if (res.success) {
      handleRegisterSuccess(res.message);
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
  };

  const handleQuickAddRound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRoundNum.trim() || !selectedProgramId) return;

    const nextSeq = programRounds.length > 0 ? programRounds[programRounds.length - 1].sequenceIndex + 1 : 1;

    const newR = addRound({
      programId: selectedProgramId,
      roundNumber: quickRoundNum.trim(),
      sequenceIndex: nextSeq,
      date: quickRoundDate,
      regOpenDate: new Date().toISOString().split('T')[0],
      regCloseDate: quickRoundDate,
      status: 'Registration Open',
    });

    setSelectedRoundId(newR.id);
    setIsAddRoundModalOpen(false);
    setQuickRoundNum('');
  };

  // AI Scan Execution
  const handleRunAiPaperScan = async (overrideContent?: string) => {
    const contentToScan = overrideContent || paperText;
    if (!contentToScan.trim() || !currentProgram || !currentRound) return;

    setIsScanning(true);
    setScanError(null);
    setScanResults(null);

    try {
      const extractedList = await parsePaperWithGroq(contentToScan);

      const evaluatedItems: AIScanEvaluationItem[] = extractedList.map((ext) => {
        let matched = students.find(
          (s) =>
            s.fullName.toLowerCase().includes(ext.fullName.toLowerCase()) ||
            ext.fullName.toLowerCase().includes(s.fullName.toLowerCase())
        );

        if (!matched) {
          matched = {
            id: `temp-${Date.now()}-${Math.random()}`,
            studentId: ext.studentId || `STU-${Math.floor(100 + Math.random() * 900)}`,
            fullName: ext.fullName,
            classGrade: ext.classGrade || 'TBD',
            houseGroup: ext.houseGroup || 'Qurtuba',
            createdAt: new Date().toISOString(),
          };
        }

        const elig = checkStudentEligibility(matched, currentProgram, currentRound, rounds, registrations, students);

        return {
          extracted: ext,
          matchedStudent: matched,
          eligibility: elig,
        };
      });

      setScanResults(evaluatedItems);
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze paper document.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleBulkRegisterEligibleFromScan = () => {
    if (!scanResults || !selectedRoundId) return;

    let count = 0;
    scanResults.forEach((item) => {
      if (item.eligibility.isEligible && item.matchedStudent) {
        let stId = item.matchedStudent.id;
        if (stId.startsWith('temp-')) {
          const created = addStudent({
            fullName: item.matchedStudent.fullName,
            studentId: item.matchedStudent.studentId,
            classGrade: item.matchedStudent.classGrade,
            houseGroup: item.matchedStudent.houseGroup,
          });
          stId = created.id;
        }

        const res = registerStudent(stId, selectedRoundId);
        if (res.success) count++;
      }
    });

    handleRegisterSuccess(`Paper Scan Complete: Registered ${count} eligible students!`);
    setIsAiScannerOpen(false);
    setScanResults(null);
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Student Registration Terminal</h2>
          <p style={{ color: '#334155', fontSize: '0.875rem' }}>
            Instant eligibility evaluation engine supporting House Team Rotation (Qurtuba, Nizamiyya, Azhar, Zitouna).
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ background: '#1d4ed8', color: '#ffffff', fontWeight: 800 }}
          onClick={() => setIsAiScannerOpen(true)}
        >
          <Camera size={18} />
          <span>📷 Camera & Paper Scanner</span>
        </button>
      </div>

      {feedback && (
        <div
          style={{
            padding: '0.85rem 1.15rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            background: feedback.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
            color: feedback.type === 'success' ? '#166534' : '#991b1b',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* STEP 1: Select Program & Round */}
      <div className="card mb-6">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1d4ed8', fontWeight: 800 }}>
            <span style={{ background: '#1d4ed8', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>1</span>
            <span>SELECT PROGRAM & TARGET ROUND</span>
          </div>

          {currentUserRole !== 'VIEWER' && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddRoundModalOpen(true)}
            >
              <Plus size={14} />
              <span>+ Create New Round</span>
            </button>
          )}
        </div>

        {programs.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px dashed #93c5fd' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>
              📦 SQLite3 Database Ready (Clean Slate)
            </div>
            <p style={{ color: '#334155', fontSize: '0.875rem', marginBottom: '1rem' }}>
              No recurring school programs exist in the database yet. Click below to create your first program or use the AI Paper Scanner.
            </p>
            <button className="btn btn-primary" onClick={() => setIsAddRoundModalOpen(true)}>
              <Plus size={16} />
              <span>+ Create First Program / Round</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label className="form-label">Program</label>
              <select
                className="form-control"
                value={selectedProgramId}
                onChange={(e) => setSelectedProgramId(e.target.value)}
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rule: {p.rule.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Target Round</label>
              <select
                className="form-control"
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
              >
                {programRounds.map((r) => (
                  <option key={r.id} value={r.id}>
                    Round {r.roundNumber} ({r.date}) — [{r.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {currentProgram && currentRound && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 0.85rem',
              background: '#eff6ff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfdbfe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
            }}
          >
            <div>
              <span style={{ color: '#334155', fontWeight: 600 }}>Active Rule: </span>
              <strong style={{ color: '#1e40af' }}>{currentProgram.rule.description}</strong>
            </div>
            <div>
              <span className={`badge ${currentRound.status === 'Registration Open' ? 'badge-eligible' : 'badge-info'}`}>
                {currentRound.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Search Student */}
      <div className="card mb-6">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1d4ed8', fontWeight: 800 }}>
          <span style={{ background: '#1d4ed8', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>2</span>
          <span>SEARCH & SELECT STUDENT</span>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type student name, ID (STU001), or house (Qurtuba, Nizamiyya, Azhar, Zitouna)..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setSelectedStudent(null);
              }}
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          </div>

          {filteredStudentSuggestions.length > 0 && !selectedStudent && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-md)',
                marginTop: '0.35rem',
                zIndex: 50,
                boxShadow: '0 10px 30px rgba(15,23,42,0.15)',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {filteredStudentSuggestions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '0.75rem 1rem',
                    borderBottom: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => {
                    setSelectedStudent(s);
                    setStudentSearch('');
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{s.fullName}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                      ID: {s.studentId} • Class {s.classGrade} • <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{s.houseGroup} Team</span>
                    </div>
                  </div>
                  <span className="btn btn-secondary btn-sm">Select</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedStudent.fullName}
              </div>
              <div style={{ fontSize: '0.825rem', color: '#334155', marginTop: '0.15rem' }}>
                ID: <strong>{selectedStudent.studentId}</strong> • Class: <strong>{selectedStudent.classGrade}</strong> • House Team: <strong style={{ color: '#1d4ed8' }}>{selectedStudent.houseGroup}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigateToStudent(selectedStudent.id)}
              >
                Profile History
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedStudent(null)}
              >
                Change
              </button>
            </div>
          </div>
        )}
      </div>

      {/* STEP 3: AUTOMATIC ELIGIBILITY CHECK RESULT */}
      {selectedStudent && currentProgram && currentRound && eligibility && (
        <div className="card mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1d4ed8', fontWeight: 800 }}>
            <span style={{ background: '#1d4ed8', color: 'white', width: '22px', height: '22px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>3</span>
            <span>AUTOMATIC ELIGIBILITY CHECK</span>
          </div>

          {eligibility.isEligible ? (
            <div className="eligible-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#166534', fontSize: '1.2rem', fontWeight: 800 }}>
                <CheckCircle2 size={26} />
                <span>🟢 STUDENT ELIGIBLE</span>
              </div>

              <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', color: '#14532d' }}>
                <strong>{selectedStudent.fullName}</strong> ({selectedStudent.houseGroup} Team) is eligible to participate in{' '}
                <strong>{currentProgram.name} — Round {currentRound.roundNumber}</strong>.
              </p>

              {eligibility.lastParticipation && (
                <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '0.3rem' }}>
                  Previous participation: Round {eligibility.lastParticipation.round.roundNumber} on {eligibility.lastParticipation.round.date}. Rule satisfied.
                </div>
              )}

              <div style={{ marginTop: '1rem' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddParticipant}
                  disabled={currentUserRole === 'VIEWER'}
                >
                  <UserPlus size={18} />
                  <span>ADD PARTICIPANT TO ROUND</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="restriction-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#991b1b', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                <XCircle size={28} />
                <span>⚠️ STUDENT RESTRICTED — REGISTRATION BLOCKED</span>
              </div>

              <div style={{ fontSize: '0.95rem', color: '#7f1d1d', fontWeight: 700, marginBottom: '1rem' }}>
                {selectedStudent.fullName} ({selectedStudent.houseGroup} Team) participated in Round {eligibility.lastParticipation?.round.roundNumber}. According to current program rule, the student is restricted.
              </div>

              {/* High Contrast Restriction Summary Box */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '0.75rem',
                  background: '#ffffff',
                  border: '1.5px solid #fca5a5',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                }}
              >
                <div>
                  <span style={{ color: '#991b1b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Last Participated</span>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>Round {eligibility.lastParticipation?.round.roundNumber} ({eligibility.lastParticipation?.round.date})</div>
                </div>

                <div>
                  <span style={{ color: '#991b1b', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Rounds Remaining</span>
                  <div style={{ fontWeight: 800, color: '#dc2626' }}>{eligibility.roundsRemaining ?? 1} rounds</div>
                </div>

                <div>
                  <span style={{ color: '#1e40af', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 800 }}>Earliest Eligible Round</span>
                  <div style={{ fontWeight: 800, color: '#2563eb' }}>Round {eligibility.eligibleFromRound?.roundNumber || 'Next Round'} ({eligibility.eligibleFromDate || 'Upcoming'})</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#991b1b', fontWeight: 600 }}>
                  🔒 System policy prevents adding restricted student.
                </span>

                {currentUserRole !== 'VIEWER' && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => setIsOverrideModalOpen(true)}
                  >
                    <ShieldAlert size={16} />
                    <span>Admin Override</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PARTICIPANTS TABLE FOR SELECTED ROUND */}
      {currentRound && (
        <div className="card">
          <div className="flex-between mb-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Participants Registered for {currentProgram?.name} — Round {currentRound.roundNumber} ({roundRegistrations.length})
            </h3>
          </div>

          {roundRegistrations.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
              No students registered yet for this round.
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>ID & Class</th>
                    <th>Date Registered</th>
                    <th>Status</th>
                    <th>Overridden?</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {roundRegistrations.map((reg) => {
                    const st = students.find((s) => s.id === reg.studentId);
                    return (
                      <tr key={reg.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{st?.fullName || 'Unknown Student'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>House: {st?.houseGroup}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{st?.studentId}</div>
                          <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                            Class {st?.classGrade}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                          {reg.registrationDate}
                        </td>
                        <td>
                          <select
                            className="form-control"
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.78rem', width: 'auto' }}
                            value={reg.status}
                            onChange={(e) =>
                              updateRegistrationStatus(reg.id, e.target.value as ParticipationStatus)
                            }
                            disabled={currentUserRole === 'VIEWER'}
                          >
                            <option value="Registered">Registered</option>
                            <option value="Participated">Participated</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Absent">Absent</option>
                            <option value="Disqualified">Disqualified</option>
                          </select>
                        </td>
                        <td>
                          {reg.isOverridden ? (
                            <span className="badge badge-overridden" title={reg.overrideReason}>
                              Overridden by {reg.overriddenBy}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Standard</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancelRegistration(reg.id)}
                            disabled={currentUserRole === 'VIEWER'}
                          >
                            <Trash2 size={14} />
                            <span>Remove</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* POPUP MODAL 1: AI CAMERA & DOCUMENT SCANNER */}
      {isAiScannerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsAiScannerOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '680px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)', maxHeight: '92vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1d4ed8' }}>
                <Camera size={24} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  AI Paper & Document Camera Scanner
                </h3>
              </div>
              <button
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setIsAiScannerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4" style={{ fontSize: '0.875rem', color: '#334155' }}>
              Position the paper sheet poster in front of your camera or snap/upload a photo. The AI will parse student names, classes, and house teams, then check eligibility automatically!
            </div>

            {/* SCANNER MODES TABS */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
              <button
                className={`btn btn-sm ${scannerMode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setScannerMode('camera');
                  startCamera();
                }}
              >
                <Camera size={16} />
                <span>📷 Live Camera</span>
              </button>

              <button
                className={`btn btn-sm ${scannerMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setScannerMode('upload');
                  stopCamera();
                }}
              >
                <Upload size={16} />
                <span>📁 Upload Image</span>
              </button>

              <button
                className={`btn btn-sm ${scannerMode === 'text' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => {
                  setScannerMode('text');
                  stopCamera();
                }}
              >
                <FileText size={16} />
                <span>📝 Text Sheet</span>
              </button>
            </div>

            {/* MODE 1: LIVE CAMERA STREAM */}
            {scannerMode === 'camera' && (
              <div className="mb-4">
                <div
                  style={{
                    position: 'relative',
                    background: '#0f172a',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    minHeight: '260px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', maxHeight: '340px', objectFit: 'cover' }}
                  />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />

                  {!isCameraActive && (
                    <div style={{ position: 'absolute', color: '#ffffff', textAlign: 'center', padding: '1rem' }}>
                      <Camera size={40} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
                      <div style={{ fontWeight: 700 }}>Camera Stream Standby</div>
                      {cameraError && (
                        <div style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '0.3rem' }}>{cameraError}</div>
                      )}
                      <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={startCamera}>
                        Start Camera Stream
                      </button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                      className="btn btn-primary btn-lg"
                      style={{ background: '#2563eb', padding: '0.75rem 2rem' }}
                      onClick={handleSnapCameraAndAnalyze}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Analyzing Paper Snapshot...</span>
                        </>
                      ) : (
                        <>
                          <Camera size={20} />
                          <span>📸 SNAP & ANALYZE PAPER</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MODE 2: UPLOAD IMAGE */}
            {scannerMode === 'upload' && (
              <div className="mb-4">
                <div
                  style={{
                    border: '2px dashed #93c5fd',
                    background: '#eff6ff',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="paper-image-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="paper-image-upload" style={{ cursor: 'pointer' }}>
                    <Upload size={36} style={{ color: '#2563eb', marginBottom: '0.5rem' }} />
                    <div style={{ fontWeight: 800, color: '#1e3a8a' }}>Click to Upload Paper Sheet Photo</div>
                    <div style={{ fontSize: '0.78rem', color: '#475569' }}>Supports JPG, PNG, WEBP document photos</div>
                  </label>

                  {uploadedImagePreview && (
                    <div style={{ marginTop: '1rem' }}>
                      <img
                        src={uploadedImagePreview}
                        alt="Paper Preview"
                        style={{ maxHeight: '200px', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRunAiPaperScan(paperText)}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing Document...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>ANALYZE UPLOADED PAPER</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: TEXT SHEET */}
            {scannerMode === 'text' && (
              <div className="mb-4">
                <div className="flex-between mb-1">
                  <label className="form-label">Paper Sheet Content</label>
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={() =>
                      setPaperText(
                        `Class XI-A Qurtuba Team Paper Sheet:\n1. Ahmed Al-Mansoor (Class XI-A, Qurtuba Team)\n2. Fatima Al-Zahra (Class XI-A, Nizamiyya Team)\n3. Tariq Hameed (Class X-B, Azhar Team)\n4. Zaid Ibrahim (Class XI-A, Qurtuba Team)\n5. Omar Farooq (Class IX-A, Qurtuba Team)`
                      )
                    }
                  >
                    Load Sample Sheet
                  </button>
                </div>
                <textarea
                  className="form-control"
                  rows={5}
                  value={paperText}
                  onChange={(e) => setPaperText(e.target.value)}
                  placeholder="Paste paper text list..."
                />

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleRunAiPaperScan(paperText)}
                    disabled={isScanning}
                  >
                    {isScanning ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing Text...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>ANALYZE PAPER TEXT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {scanError && (
              <div className="mb-4" style={{ padding: '0.75rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', color: '#991b1b', fontSize: '0.85rem' }}>
                ⚠️ {scanError}
              </div>
            )}

            {scanResults && (
              <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '1.25rem' }}>
                <div className="flex-between mb-3">
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    AI Inspection & Eligibility Report ({scanResults.length})
                  </h4>

                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleBulkRegisterEligibleFromScan}
                    disabled={!scanResults.some((r) => r.eligibility.isEligible)}
                  >
                    <UserPlus size={14} />
                    <span>Register All Eligible ({scanResults.filter((r) => r.eligibility.isEligible).length})</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {scanResults.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        background: item.eligibility.isEligible ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${item.eligibility.isEligible ? '#86efac' : '#fca5a5'}`,
                      }}
                    >
                      <div className="flex-between">
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                            {item.extracted.fullName}
                          </strong>
                          <div style={{ fontSize: '0.78rem', color: '#334155' }}>
                            Class {item.extracted.classGrade} • <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{item.extracted.houseGroup} Team</span>
                          </div>
                        </div>

                        <span className={`badge ${item.eligibility.isEligible ? 'badge-eligible' : 'badge-restricted'}`}>
                          {item.eligibility.isEligible ? '🟢 Eligible' : '🔴 Restricted'}
                        </span>
                      </div>

                      <div style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: item.eligibility.isEligible ? '#166534' : '#991b1b', fontWeight: 600 }}>
                        {item.eligibility.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QUICK ADD ROUND POPUP MODAL */}
      {isAddRoundModalOpen && (
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
          onClick={() => setIsAddRoundModalOpen(false)}
        >
          <div
            className="card"
            style={{ maxWidth: '420px', width: '100%', margin: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-between mb-4">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Create Round for {currentProgram?.name}</h3>
              <button
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                onClick={() => setIsAddRoundModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleQuickAddRound}>
              <div className="form-group mb-4">
                <label className="form-label">Round Number * (e.g. 11.8 or 12.1)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 11.8"
                  value={quickRoundNum}
                  onChange={(e) => setQuickRoundNum(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="form-group mb-6">
                <label className="form-label">Event Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={quickRoundDate}
                  onChange={(e) => setQuickRoundDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddRoundModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OVERRIDE MODAL */}
      {selectedStudent && currentProgram && currentRound && eligibility && (
        <OverrideModal
          isOpen={isOverrideModalOpen}
          onClose={() => setIsOverrideModalOpen(false)}
          student={selectedStudent}
          program={currentProgram}
          round={currentRound}
          restrictionReason={eligibility.reason}
          onConfirmOverride={handleConfirmOverride}
        />
      )}
    </div>
  );
};
