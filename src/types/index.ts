export type UserRole = 'SUPER_ADMIN' | 'EVENT_STAFF' | 'VIEWER';

export type FrequencyType = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';

export type HouseTeam = 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';

export type RuleType = 
  | 'ROUNDS_INTERVENING' // Must wait N rounds before participating again
  | 'CLASS_WISE_ROTATION'// Class-wise house team set rotation
  | 'TEAM_ROTATION'      // House team rotation
  | 'DAYS_INTERVAL'      // Must wait N days before participating again
  | 'ONCE_PER_MONTH';     // Maximum 1 participation per calendar month

export type ParticipationStatus = 
  | 'Registered' 
  | 'Participated' 
  | 'Cancelled' 
  | 'Absent' 
  | 'Disqualified';

export interface ProgramRule {
  ruleType: RuleType;
  value: number;
  countableStatuses: ParticipationStatus[];
  description: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  frequency: FrequencyType;
  startDate: string; // YYYY-MM-DD
  isRecurring: boolean;
  maxParticipants: number;
  autoGenerateRounds: boolean;
  rule: ProgramRule;
  createdAt: string;
}

export type RoundStatus = 'Upcoming' | 'Registration Open' | 'Closed' | 'Completed';

export interface Round {
  id: string;
  programId: string;
  roundNumber: string; // e.g. "11.1", "11.2", "5.1"
  sequenceIndex: number;
  date: string; // YYYY-MM-DD
  regOpenDate: string;
  regCloseDate: string;
  status: RoundStatus;
  notes?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU001
  fullName: string;
  classGrade: string; // e.g. S1A, S2A, C1A, C2A
  houseGroup: HouseTeam; // Qurtuba, Nizamiyya, Azhar, Zitouna
  createdAt: string;
}

export interface Registration {
  id: string;
  roundId: string;
  programId: string;
  studentId: string;
  registrationDate: string; // YYYY-MM-DD HH:mm
  status: ParticipationStatus;
  registeredBy: string;
  isOverridden?: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overrideTimestamp?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reason: string;
  student?: Student;
  program?: Program;
  targetRound?: Round;
  lastParticipation?: {
    round: Round;
    registration: Registration;
    status: ParticipationStatus;
  };
  roundsRemaining?: number;
  daysRemaining?: number;
  eligibleFromRound?: Round;
  eligibleFromDate?: string;
  ruleApplied: ProgramRule;
}

export type AuditActionType = 
  | 'STUDENT_REGISTERED'
  | 'REGISTRATION_CANCELLED'
  | 'REGISTRATION_STATUS_CHANGED'
  | 'RESTRICTED_ATTEMPT'
  | 'ELIGIBILITY_OVERRIDE'
  | 'PROGRAM_CREATED'
  | 'PROGRAM_RULE_MODIFIED'
  | 'ROUND_CREATED'
  | 'ROUND_STATUS_CHANGED'
  | 'STUDENT_CREATED'
  | 'STUDENT_UPDATED';

export interface AuditLog {
  id: string;
  action: AuditActionType;
  user: string;
  userRole: UserRole;
  timestamp: string;
  studentId?: string;
  studentName?: string;
  programId?: string;
  programName?: string;
  roundId?: string;
  roundNumber?: string;
  details: string;
  reason?: string;
}
