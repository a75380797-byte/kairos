import type {
  Program,
  Round,
  Student,
  Registration,
  AuditLog,
} from '../types';
import { SQLiteService } from './sqliteStorage';

export const StorageService = {
  getPrograms: (): Program[] => SQLiteService.getPrograms(),
  savePrograms: (programs: Program[]) => SQLiteService.savePrograms(programs),

  getRounds: (): Round[] => SQLiteService.getRounds(),
  saveRounds: (rounds: Round[]) => SQLiteService.saveRounds(rounds),

  getStudents: (): Student[] => SQLiteService.getStudents(),
  saveStudents: (students: Student[]) => SQLiteService.saveStudents(students),

  getRegistrations: (): Registration[] => SQLiteService.getRegistrations(),
  saveRegistrations: (registrations: Registration[]) => SQLiteService.saveRegistrations(registrations),

  getAuditLogs: (): AuditLog[] => SQLiteService.getAuditLogs(),
  saveAuditLogs: (logs: AuditLog[]) => SQLiteService.saveAuditLogs(logs),

  clearDatabase: () => SQLiteService.clearAllSqliteData(),

  exportDatabaseJSON: (): string => SQLiteService.exportDatabaseDump(),

  importDatabaseJSON: (jsonString: string): boolean => SQLiteService.importDatabaseDump(jsonString),

  resetToDefault: () => SQLiteService.clearAllSqliteData(),
};
