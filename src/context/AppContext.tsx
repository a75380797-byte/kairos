import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  Program,
  Round,
  Student,
  Registration,
  AuditLog,
  UserRole,
  ProgramRule,
  ParticipationStatus,
  RoundStatus,
  AuditActionType,
} from '../types';
import { StorageService } from '../services/storage';
import { checkStudentEligibility } from '../services/eligibilityEngine';

interface AppContextType {
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  programs: Program[];
  rounds: Round[];
  students: Student[];
  registrations: Registration[];
  auditLogs: AuditLog[];
  
  registerStudent: (
    studentId: string,
    roundId: string,
    isOverridden?: boolean,
    overrideReason?: string,
    overriddenBy?: string
  ) => { success: boolean; message: string; isRestricted?: boolean };
  
  cancelRegistration: (registrationId: string) => void;
  updateRegistrationStatus: (registrationId: string, status: ParticipationStatus) => void;
  
  addProgram: (program: Omit<Program, 'id' | 'createdAt'>) => Program;
  updateProgramRule: (programId: string, newRule: ProgramRule) => void;
  
  addRound: (round: Omit<Round, 'id'>) => Round;
  updateRoundStatus: (roundId: string, status: RoundStatus) => void;
  generateFutureRounds: (programId: string, count: number) => void;
  
  addStudent: (student: Omit<Student, 'id' | 'createdAt'>) => Student;
  updateStudent: (student: Student) => void;
  
  logAuditAction: (
    action: AuditActionType,
    details: string,
    meta?: {
      studentId?: string;
      studentName?: string;
      programId?: string;
      programName?: string;
      roundId?: string;
      roundNumber?: string;
      reason?: string;
    }
  ) => void;

  clearAllData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => boolean;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('SUPER_ADMIN');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    reloadFromStorage();
  }, []);

  const reloadFromStorage = () => {
    setPrograms(StorageService.getPrograms());
    setRounds(StorageService.getRounds());
    setStudents(StorageService.getStudents());
    setRegistrations(StorageService.getRegistrations());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const updateProgramsState = (newPrograms: Program[]) => {
    setPrograms(newPrograms);
    StorageService.savePrograms(newPrograms);
  };

  const updateRoundsState = (newRounds: Round[]) => {
    setRounds(newRounds);
    StorageService.saveRounds(newRounds);
  };

  const updateStudentsState = (newStudents: Student[]) => {
    setStudents(newStudents);
    StorageService.saveStudents(newStudents);
  };

  const updateRegistrationsState = (newRegs: Registration[]) => {
    setRegistrations(newRegs);
    StorageService.saveRegistrations(newRegs);
  };

  const updateAuditLogsState = (newLogs: AuditLog[]) => {
    setAuditLogs(newLogs);
    StorageService.saveAuditLogs(newLogs);
  };

  const getUserNameForRole = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'EVENT_STAFF':
        return 'Event Staff';
      case 'VIEWER':
        return 'Read-Only Viewer';
    }
  };

  const logAuditAction = (
    action: AuditActionType,
    details: string,
    meta?: {
      studentId?: string;
      studentName?: string;
      programId?: string;
      programName?: string;
      roundId?: string;
      roundNumber?: string;
      reason?: string;
    }
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      user: getUserNameForRole(currentUserRole),
      userRole: currentUserRole,
      timestamp: new Date().toISOString(),
      details,
      ...meta,
    };
    const updated = [newLog, ...auditLogs];
    updateAuditLogsState(updated);
  };

  const registerStudent = (
    studentId: string,
    roundId: string,
    isOverridden = false,
    overrideReason = '',
    overriddenBy = ''
  ) => {
    if (currentUserRole === 'VIEWER') {
      return { success: false, message: 'Viewers cannot modify registration data.' };
    }

    const student = students.find((s) => s.id === studentId);
    const round = rounds.find((r) => r.id === roundId);
    if (!student || !round) {
      return { success: false, message: 'Student or Round not found.' };
    }

    const program = programs.find((p) => p.id === round.programId);
    if (!program) {
      return { success: false, message: 'Program not found.' };
    }

    const existingActiveReg = registrations.find(
      (r) => r.roundId === roundId && r.studentId === studentId && r.status !== 'Cancelled'
    );
    if (existingActiveReg) {
      return {
        success: false,
        message: `${student.fullName} is already registered for Round ${round.roundNumber}.`,
      };
    }

    const eligibility = checkStudentEligibility(student, program, round, rounds, registrations, students);

    if (!eligibility.isEligible && !isOverridden) {
      logAuditAction(
        'RESTRICTED_ATTEMPT',
        `Attempted registration blocked for ${student.fullName} (${student.houseGroup} Team) in ${program.name} (${round.roundNumber}). ${eligibility.reason}`,
        {
          studentId: student.id,
          studentName: student.fullName,
          programId: program.id,
          programName: program.name,
          roundId: round.id,
          roundNumber: round.roundNumber,
        }
      );

      return {
        success: false,
        isRestricted: true,
        message: `Student is restricted: ${eligibility.reason}`,
      };
    }

    const adminName = overriddenBy || getUserNameForRole(currentUserRole);

    const newReg: Registration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roundId: round.id,
      programId: program.id,
      studentId: student.id,
      registrationDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Registered',
      registeredBy: adminName,
      ...(isOverridden
        ? {
            isOverridden: true,
            overrideReason,
            overriddenBy: adminName,
            overrideTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          }
        : {}),
    };

    updateRegistrationsState([newReg, ...registrations]);

    if (isOverridden) {
      logAuditAction(
        'ELIGIBILITY_OVERRIDE',
        `Admin Override approved by ${adminName} for ${student.fullName} in ${program.name} Round ${round.roundNumber}.`,
        {
          studentId: student.id,
          studentName: student.fullName,
          programId: program.id,
          programName: program.name,
          roundId: round.id,
          roundNumber: round.roundNumber,
          reason: overrideReason,
        }
      );
    } else {
      logAuditAction(
        'STUDENT_REGISTERED',
        `Registered ${student.fullName} for ${program.name} Round ${round.roundNumber}.`,
        {
          studentId: student.id,
          studentName: student.fullName,
          programId: program.id,
          programName: program.name,
          roundId: round.id,
          roundNumber: round.roundNumber,
        }
      );
    }

    return {
      success: true,
      message: isOverridden
        ? `[ADMIN OVERRIDE] ${student.fullName} successfully registered for Round ${round.roundNumber}!`
        : `${student.fullName} successfully registered for ${program.name} Round ${round.roundNumber}!`,
    };
  };

  const cancelRegistration = (registrationId: string) => {
    if (currentUserRole === 'VIEWER') return;
    const target = registrations.find((r) => r.id === registrationId);
    if (!target) return;

    const updated = registrations.map((r) =>
      r.id === registrationId ? { ...r, status: 'Cancelled' as ParticipationStatus } : r
    );
    updateRegistrationsState(updated);

    const student = students.find((s) => s.id === target.studentId);
    const round = rounds.find((r) => r.id === target.roundId);
    const program = programs.find((p) => p.id === target.programId);

    logAuditAction(
      'REGISTRATION_CANCELLED',
      `Registration cancelled for ${student?.fullName || 'Student'} in ${program?.name || 'Program'} Round ${round?.roundNumber || ''}.`,
      {
        studentId: target.studentId,
        studentName: student?.fullName,
        programId: target.programId,
        programName: program?.name,
        roundId: target.roundId,
        roundNumber: round?.roundNumber,
      }
    );
  };

  const updateRegistrationStatus = (registrationId: string, status: ParticipationStatus) => {
    if (currentUserRole === 'VIEWER') return;
    const updated = registrations.map((r) =>
      r.id === registrationId ? { ...r, status } : r
    );
    updateRegistrationsState(updated);

    const target = registrations.find((r) => r.id === registrationId);
    if (target) {
      const student = students.find((s) => s.id === target.studentId);
      const round = rounds.find((r) => r.id === target.roundId);
      const program = programs.find((p) => p.id === target.programId);

      logAuditAction(
        'REGISTRATION_STATUS_CHANGED',
        `Updated participation status for ${student?.fullName} to "${status}" in ${program?.name} Round ${round?.roundNumber}.`,
        {
          studentId: target.studentId,
          studentName: student?.fullName,
          programId: target.programId,
          programName: program?.name,
          roundId: target.roundId,
          roundNumber: round?.roundNumber,
        }
      );
    }
  };

  const addProgram = (programData: Omit<Program, 'id' | 'createdAt'>) => {
    const id = `prog-${Date.now()}`;
    const newProg: Program = {
      ...programData,
      id,
      createdAt: new Date().toISOString(),
    };

    const updatedProgs = [...programs, newProg];
    updateProgramsState(updatedProgs);

    logAuditAction(
      'PROGRAM_CREATED',
      `Created program "${newProg.name}" with rule: ${newProg.rule.description}`,
      {
        programId: newProg.id,
        programName: newProg.name,
      }
    );

    if (newProg.autoGenerateRounds) {
      generateInitialRoundsForProgram(newProg, rounds);
    }

    return newProg;
  };

  const generateInitialRoundsForProgram = (
    prog: Program,
    existingRounds: Round[]
  ) => {
    const newRoundsList: Round[] = [];
    const startDate = new Date(prog.startDate || '2026-08-01');

    for (let i = 1; i <= 8; i++) {
      const roundDate = new Date(startDate);
      if (prog.frequency === 'WEEKLY') {
        roundDate.setDate(startDate.getDate() + (i - 1) * 7);
      } else if (prog.frequency === 'BIWEEKLY') {
        roundDate.setDate(startDate.getDate() + (i - 1) * 14);
      } else if (prog.frequency === 'MONTHLY') {
        roundDate.setMonth(startDate.getMonth() + (i - 1));
      } else {
        roundDate.setDate(startDate.getDate() + (i - 1) * 10);
      }

      const dateStr = roundDate.toISOString().split('T')[0];
      const openDate = new Date(roundDate);
      openDate.setDate(openDate.getDate() - 7);

      const status: RoundStatus = i === 1 ? 'Registration Open' : 'Upcoming';

      newRoundsList.push({
        id: `round-${prog.id}-1.${i}`,
        programId: prog.id,
        roundNumber: `1.${i}`,
        sequenceIndex: i,
        date: dateStr,
        regOpenDate: openDate.toISOString().split('T')[0],
        regCloseDate: dateStr,
        status,
      });
    }

    const updatedRounds = [...existingRounds, ...newRoundsList];
    updateRoundsState(updatedRounds);
  };

  const generateFutureRounds = (programId: string, count: number) => {
    const prog = programs.find((p) => p.id === programId);
    if (!prog) return;

    const progRounds = rounds
      .filter((r) => r.programId === programId)
      .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

    const lastRound = progRounds[progRounds.length - 1];
    const startSeq = lastRound ? lastRound.sequenceIndex + 1 : 1;
    const baseDate = lastRound ? new Date(lastRound.date) : new Date(prog.startDate);

    const newRounds: Round[] = [];
    for (let i = 0; i < count; i++) {
      const seqIndex = startSeq + i;
      const roundDate = new Date(baseDate);

      if (prog.frequency === 'WEEKLY') {
        roundDate.setDate(baseDate.getDate() + (i + 1) * 7);
      } else if (prog.frequency === 'BIWEEKLY') {
        roundDate.setDate(baseDate.getDate() + (i + 1) * 14);
      } else if (prog.frequency === 'MONTHLY') {
        roundDate.setMonth(baseDate.getMonth() + (i + 1));
      } else {
        roundDate.setDate(baseDate.getDate() + (i + 1) * 10);
      }

      const dateStr = roundDate.toISOString().split('T')[0];
      const regOpenDate = new Date(roundDate);
      regOpenDate.setDate(regOpenDate.getDate() - 7);

      newRounds.push({
        id: `round-${prog.id}-${seqIndex}`,
        programId: prog.id,
        roundNumber: `1.${seqIndex}`,
        sequenceIndex: seqIndex,
        date: dateStr,
        regOpenDate: regOpenDate.toISOString().split('T')[0],
        regCloseDate: dateStr,
        status: 'Upcoming',
      });
    }

    updateRoundsState([...rounds, ...newRounds]);
    logAuditAction(
      'ROUND_CREATED',
      `Auto-generated ${count} future rounds for ${prog.name}.`,
      { programId: prog.id, programName: prog.name }
    );
  };

  const updateProgramRule = (programId: string, newRule: ProgramRule) => {
    if (currentUserRole !== 'SUPER_ADMIN') return;
    const prog = programs.find((p) => p.id === programId);
    if (!prog) return;

    const oldDesc = prog.rule.description;
    const updatedProgs = programs.map((p) =>
      p.id === programId ? { ...p, rule: newRule } : p
    );
    updateProgramsState(updatedProgs);

    logAuditAction(
      'PROGRAM_RULE_MODIFIED',
      `Updated eligibility rule for ${prog.name} from "${oldDesc}" to "${newRule.description}".`,
      {
        programId: prog.id,
        programName: prog.name,
      }
    );
  };

  const addRound = (roundData: Omit<Round, 'id'>) => {
    const id = `round-${Date.now()}`;
    const newRound: Round = { ...roundData, id };
    const updated = [...rounds, newRound];
    updateRoundsState(updated);

    const prog = programs.find((p) => p.id === roundData.programId);
    logAuditAction(
      'ROUND_CREATED',
      `Manually created Round ${newRound.roundNumber} for ${prog?.name || 'Program'} scheduled for ${newRound.date}.`,
      {
        programId: newRound.programId,
        programName: prog?.name,
        roundId: newRound.id,
        roundNumber: newRound.roundNumber,
      }
    );
    return newRound;
  };

  const updateRoundStatus = (roundId: string, status: RoundStatus) => {
    if (currentUserRole === 'VIEWER') return;
    const updated = rounds.map((r) => (r.id === roundId ? { ...r, status } : r));
    updateRoundsState(updated);

    const r = rounds.find((rd) => rd.id === roundId);
    const prog = programs.find((p) => p.id === r?.programId);
    logAuditAction(
      'ROUND_STATUS_CHANGED',
      `Changed round ${r?.roundNumber} status to "${status}".`,
      {
        programId: r?.programId,
        programName: prog?.name,
        roundId: r?.id,
        roundNumber: r?.roundNumber,
      }
    );
  };

  const addStudent = (studentData: Omit<Student, 'id' | 'createdAt'>) => {
    const id = `stu-${Date.now()}`;
    const newStudent: Student = {
      ...studentData,
      id,
      createdAt: new Date().toISOString(),
    };
    updateStudentsState([...students, newStudent]);
    logAuditAction(
      'STUDENT_CREATED',
      `Added new student ${newStudent.fullName} (ID: ${newStudent.studentId}, Class: ${newStudent.classGrade}, House: ${newStudent.houseGroup}).`,
      { studentId: newStudent.id, studentName: newStudent.fullName }
    );
    return newStudent;
  };

  const updateStudent = (updatedStudent: Student) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    updateStudentsState(updated);
    logAuditAction(
      'STUDENT_UPDATED',
      `Updated profile information for ${updatedStudent.fullName} (${updatedStudent.studentId}).`,
      { studentId: updatedStudent.id, studentName: updatedStudent.fullName }
    );
  };

  const clearAllData = () => {
    StorageService.clearDatabase();
    reloadFromStorage();
  };

  const exportDatabaseJSON = () => {
    const json = StorageService.exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kairoos_school_db_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = (jsonString: string) => {
    const ok = StorageService.importDatabaseJSON(jsonString);
    if (ok) reloadFromStorage();
    return ok;
  };

  const resetDemoData = () => {
    StorageService.resetToDefault();
    reloadFromStorage();
  };

  return (
    <AppContext.Provider
      value={{
        currentUserRole,
        setCurrentUserRole,
        programs,
        rounds,
        students,
        registrations,
        auditLogs,
        registerStudent,
        cancelRegistration,
        updateRegistrationStatus,
        addProgram,
        updateProgramRule,
        addRound,
        updateRoundStatus,
        generateFutureRounds,
        addStudent,
        updateStudent,
        logAuditAction,
        clearAllData,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
