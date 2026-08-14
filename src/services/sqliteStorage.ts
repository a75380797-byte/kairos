import type {
  Program,
  Round,
  Student,
  Registration,
  AuditLog,
  DisciplinaryRecord,
} from '../types';

const STORAGE_KEYS = {
  PROGRAMS: 'kairoos_sqlite3_programs_v14',
  ROUNDS: 'kairoos_sqlite3_rounds_v14',
  STUDENTS: 'kairoos_sqlite3_students_v14',
  REGISTRATIONS: 'kairoos_sqlite3_registrations_v14',
  AUDIT_LOGS: 'kairoos_sqlite3_audit_logs_v14',
  DISCIPLINARY_RECORDS: 'kairoos_sqlite3_disciplinary_v14',
};

// Purge legacy storage keys
const LEGACY_KEYS = [
  'kairoos_programs_v4',
  'kairoos_rounds_v4',
  'kairoos_students_v4',
  'kairoos_registrations_v4',
  'kairoos_audit_logs_v4',
  'kairoos_db_programs_v1',
  'kairoos_db_rounds_v1',
  'kairoos_db_students_v1',
  'kairoos_db_registrations_v1',
  'kairoos_db_audit_logs_v1',
  'kairoos_sqlite3_db_file_v1_programs',
  'kairoos_sqlite3_db_file_v1_rounds',
  'kairoos_sqlite3_db_file_v1_students',
  'kairoos_sqlite3_db_file_v1_registrations',
  'kairoos_sqlite3_db_file_v1_audit_logs',
  'kairoos_sqlite3_programs_v2',
  'kairoos_sqlite3_rounds_v2',
  'kairoos_sqlite3_students_v2',
  'kairoos_sqlite3_registrations_v2',
  'kairoos_sqlite3_audit_logs_v2',
  'kairoos_sqlite3_programs_v3',
  'kairoos_sqlite3_rounds_v3',
  'kairoos_sqlite3_students_v3',
  'kairoos_sqlite3_registrations_v3',
  'kairoos_sqlite3_audit_logs_v3',
  'kairoos_sqlite3_programs_v4',
  'kairoos_sqlite3_rounds_v4',
  'kairoos_sqlite3_students_v4',
  'kairoos_sqlite3_registrations_v4',
  'kairoos_sqlite3_audit_logs_v4',
  'kairoos_sqlite3_programs_v5',
  'kairoos_sqlite3_rounds_v5',
  'kairoos_sqlite3_students_v5',
  'kairoos_sqlite3_registrations_v5',
  'kairoos_sqlite3_audit_logs_v5',
  'kairoos_sqlite3_programs_v6',
  'kairoos_sqlite3_rounds_v6',
  'kairoos_sqlite3_students_v6',
  'kairoos_sqlite3_registrations_v6',
  'kairoos_sqlite3_audit_logs_v6',
  'kairoos_sqlite3_programs_v7',
  'kairoos_sqlite3_rounds_v7',
  'kairoos_sqlite3_students_v7',
  'kairoos_sqlite3_registrations_v7',
  'kairoos_sqlite3_audit_logs_v7',
  'kairoos_sqlite3_programs_v8',
  'kairoos_sqlite3_rounds_v8',
  'kairoos_sqlite3_students_v8',
  'kairoos_sqlite3_registrations_v8',
  'kairoos_sqlite3_audit_logs_v8',
  'kairoos_sqlite3_programs_v9',
  'kairoos_sqlite3_rounds_v9',
  'kairoos_sqlite3_students_v9',
  'kairoos_sqlite3_registrations_v9',
  'kairoos_sqlite3_audit_logs_v9',
  'kairoos_sqlite3_programs_v10',
  'kairoos_sqlite3_rounds_v10',
  'kairoos_sqlite3_students_v10',
  'kairoos_sqlite3_registrations_v10',
  'kairoos_sqlite3_audit_logs_v10',
  'kairoos_sqlite3_programs_v11',
  'kairoos_sqlite3_rounds_v11',
  'kairoos_sqlite3_students_v11',
  'kairoos_sqlite3_registrations_v11',
  'kairoos_sqlite3_audit_logs_v11',
  'kairoos_sqlite3_programs_v12',
  'kairoos_sqlite3_rounds_v12',
  'kairoos_sqlite3_students_v12',
  'kairoos_sqlite3_registrations_v12',
  'kairoos_sqlite3_audit_logs_v12',
  'kairoos_sqlite3_programs_v13',
  'kairoos_sqlite3_rounds_v13',
  'kairoos_sqlite3_students_v13',
  'kairoos_sqlite3_registrations_v13',
  'kairoos_sqlite3_audit_logs_v13',
];

const purgeLegacyStorage = () => {
  LEGACY_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
};

purgeLegacyStorage();

// Full 324 Students Roster (All Classes set to 'TBD' for manual user assignment)
const ALL_324_STUDENTS_ROSTER: Student[] = [
  // ==========================================
  // --- 1. AL AZHAR GIRLS (24 Students) ---
  // ==========================================
  { id: 'stu-101', studentId: 'STU101', fullName: 'ADHILA FATHIMA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-102', studentId: 'STU102', fullName: 'SARAH THOTATHIL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-103', studentId: 'STU103', fullName: 'SHANIBA KHALID', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-104', studentId: 'STU104', fullName: 'MINHA FATHIMA OM', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-105', studentId: 'STU105', fullName: 'ADILA SULTHANA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-106', studentId: 'STU106', fullName: 'NITHA FATHIMA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-107', studentId: 'STU107', fullName: 'HALA SAMSEER', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-108', studentId: 'STU108', fullName: 'NISHMA KARVEL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-109', studentId: 'STU109', fullName: 'RIFA FATHIMA P', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-110', studentId: 'STU110', fullName: 'SHAZA MUHAMMED ALI', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-111', studentId: 'STU111', fullName: 'HANANA ABRAR', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-112', studentId: 'STU112', fullName: 'FATHIMA SHAIKHA M', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-113', studentId: 'STU113', fullName: 'SULAIKHA SULFIKAR', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-114', studentId: 'STU114', fullName: 'ALEENA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-115', studentId: 'STU115', fullName: 'NAHA FILZ', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-116', studentId: 'STU116', fullName: 'RIYA FATHIMA P', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-117', studentId: 'STU117', fullName: 'AYSHA HANOONA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-118', studentId: 'STU118', fullName: 'ASBIN JAHAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-119', studentId: 'STU119', fullName: 'FELLAH NOUFAL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-120', studentId: 'STU120', fullName: 'ISHA KK', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-121', studentId: 'STU121', fullName: 'FATHIMATH NIHLA RASHID', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-122', studentId: 'STU122', fullName: 'AYSHA LIYANA BINSHAD', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-123', studentId: 'STU123', fullName: 'NIYA FATHIMA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-124', studentId: 'STU124', fullName: 'AYSHA ISMA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },

  // ===========================================
  // --- 2. AL NIZAMIYYA GIRLS (24 Students) ---
  // ===========================================
  { id: 'stu-201', studentId: 'STU201', fullName: 'RIYA FATHIMA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-202', studentId: 'STU202', fullName: 'AIDAH PA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-203', studentId: 'STU203', fullName: 'JUNAH MEHRIN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-204', studentId: 'STU204', fullName: 'FETHIN RAHMAN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-205', studentId: 'STU205', fullName: 'FATHIMATHU SAFWA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-206', studentId: 'STU206', fullName: 'MAEDA DARJAH', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-207', studentId: 'STU207', fullName: 'FATHIMA NILUFER', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-208', studentId: 'STU208', fullName: 'AYSHA ZAYANA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-209', studentId: 'STU209', fullName: 'KHADEEJA PT', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-210', studentId: 'STU210', fullName: 'HANA FATHIMA KM', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-211', studentId: 'STU211', fullName: 'RUBIYA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-212', studentId: 'STU212', fullName: 'FATHIMA ZOYA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-213', studentId: 'STU213', fullName: 'MINHA PARAKKAL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-214', studentId: 'STU214', fullName: 'FIDHA FAKRUDHEEN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-215', studentId: 'STU215', fullName: 'RIYA FATHIMA (S1A)', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-216', studentId: 'STU216', fullName: 'HAWVA SHAHEEL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-217', studentId: 'STU217', fullName: 'MINHA SEHABIN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-218', studentId: 'STU218', fullName: 'SIBA FATHIMA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-219', studentId: 'STU219', fullName: 'FATHIMA BY', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-220', studentId: 'STU220', fullName: 'INSHA FATHIMA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-221', studentId: 'STU221', fullName: 'FATHIMA AFSHEEN KARI', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-222', studentId: 'STU222', fullName: 'FATHIMA MUSTHAFA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-223', studentId: 'STU223', fullName: 'HESSA FATHIMA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-224', studentId: 'STU224', fullName: 'AYSHA MINHA MK', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },

  // ============================================
  // --- 3. AL QURTUBA GIRLS (25 Students) ---
  // ============================================
  { id: 'stu-301', studentId: 'STU301', fullName: 'HANIYA HARIS', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-302', studentId: 'STU302', fullName: 'NUHA FATHIMA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-303', studentId: 'STU303', fullName: 'NAJA FATHIMA P', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-304', studentId: 'STU304', fullName: 'FADIYA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-305', studentId: 'STU305', fullName: 'MINHA IQBAL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-306', studentId: 'STU306', fullName: 'SIDRA FATHIMA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-307', studentId: 'STU307', fullName: 'ZAIMA ZAKIR', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-308', studentId: 'STU308', fullName: 'RIFA FATHIMA HARSHAD', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-309', studentId: 'STU309', fullName: 'MANHA NASEER ALI', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-310', studentId: 'STU310', fullName: 'RIDHA ADIL P', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-311', studentId: 'STU311', fullName: 'HANIYA PK', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-312', studentId: 'STU312', fullName: 'FATHIMA SANA MV', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-313', studentId: 'STU313', fullName: 'NAFEESA FELLAH', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-314', studentId: 'STU314', fullName: 'IZA MARYAM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-315', studentId: 'STU315', fullName: 'SHAZA VN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-316', studentId: 'STU316', fullName: 'AYSHA WAFA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-317', studentId: 'STU317', fullName: 'MANHA HASHIM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-318', studentId: 'STU318', fullName: 'FATHIN M', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-319', studentId: 'STU319', fullName: 'FATHIMA RANA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-320', studentId: 'STU320', fullName: 'AMINA AM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-321', studentId: 'STU321', fullName: 'AYSHA HANNA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-322', studentId: 'STU322', fullName: 'AYSHA HADIYA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-323', studentId: 'STU323', fullName: 'HIBA FATHIMA TV', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-324', studentId: 'STU324', fullName: 'KADEEJATHU SHAHARBAN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-325', studentId: 'STU325', fullName: 'NAILA SHIHAB', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },

  // ============================================
  // --- 4. EZ ZITOUNA GIRLS (25 Students) ---
  // ============================================
  { id: 'stu-401', studentId: 'STU401', fullName: 'ZARA MARYAM', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-402', studentId: 'STU402', fullName: 'FATHIMA MUFLIHA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-403', studentId: 'STU403', fullName: 'SANA FATHIMA VK', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-404', studentId: 'STU404', fullName: 'ZAREEN SHIBAS', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-405', studentId: 'STU405', fullName: 'MINHA FATHIMA VT', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-406', studentId: 'STU406', fullName: 'AINA FATHIMA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-407', studentId: 'STU407', fullName: 'IFRA THAHANI', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-408', studentId: 'STU408', fullName: 'KADEEJA MISBA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-409', studentId: 'STU409', fullName: 'UMM HABEEBA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-410', studentId: 'STU410', fullName: 'KHADEEJA AMNA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-411', studentId: 'STU411', fullName: 'MINHA FATHIMA PUTHUKKUDI', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-412', studentId: 'STU412', fullName: 'THOIBA FATHIMA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-413', studentId: 'STU413', fullName: 'HIBA FATHIMA M', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-414', studentId: 'STU414', fullName: 'ZABA FATHIMA P', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-415', studentId: 'STU415', fullName: 'NAIZA FATHIMA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-416', studentId: 'STU416', fullName: 'HEZA AYSHA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-417', studentId: 'STU417', fullName: 'AYSHA LAYINA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-418', studentId: 'STU418', fullName: 'LAMHA NIYAZ', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-419', studentId: 'STU419', fullName: 'AALIYA MARYAM', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-420', studentId: 'STU420', fullName: 'KHADEEJA ABDUL LATHIEF', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-421', studentId: 'STU421', fullName: 'ALFINA PARVEEN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-422', studentId: 'STU422', fullName: 'AMINA DIYA TK', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-423', studentId: 'STU423', fullName: 'HANNA SAEED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-424', studentId: 'STU424', fullName: 'AYSHA LAMIA MK', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-425', studentId: 'STU425', fullName: 'NASHWA ZAINAB', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },

  // ===========================================
  // --- 5. AL AZHAR BOYS (56 Students) ---
  // ===========================================
  { id: 'stu-501', studentId: 'STU501', fullName: 'MUHAMMED HAMID TK', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-502', studentId: 'STU502', fullName: 'SHAHIR O', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-503', studentId: 'STU503', fullName: 'MUHAMMED AMEEN PV', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-504', studentId: 'STU504', fullName: 'ALI SHAMIL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-505', studentId: 'STU505', fullName: 'IHSAN ABDULLA MUHAMMED', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-506', studentId: 'STU506', fullName: 'MUHAMMED SINAN KT', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-507', studentId: 'STU507', fullName: 'MUHAMMED RASHID', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-508', studentId: 'STU508', fullName: 'MUHAMMED SINAN M', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-509', studentId: 'STU509', fullName: 'ATHIF THUFAIL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-510', studentId: 'STU510', fullName: 'MUHAMMED FARHAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-511', studentId: 'STU511', fullName: 'RAYYAN MUHAMMED', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-512', studentId: 'STU512', fullName: 'SHAMMAS ASHRAF', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-513', studentId: 'STU513', fullName: 'MUHAMMED FIZAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-514', studentId: 'STU514', fullName: 'MUHAMMED MUHSIN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-515', studentId: 'STU515', fullName: 'ABDUNNOOR', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-516', studentId: 'STU516', fullName: 'NAHYAN ABDULLA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-517', studentId: 'STU517', fullName: 'JAUHAR SHAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-518', studentId: 'STU518', fullName: 'AMEN TK', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-519', studentId: 'STU519', fullName: 'MUHAMMED CP', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-520', studentId: 'STU520', fullName: 'MUHAMMED SHAHRAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-521', studentId: 'STU521', fullName: 'MUHAMMED AMEEN IBRAHIM', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-522', studentId: 'STU522', fullName: 'AZIN .E', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-523', studentId: 'STU523', fullName: 'MISBAH ABDULLAH', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-524', studentId: 'STU524', fullName: 'MOHAMMED SWALIH', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-525', studentId: 'STU525', fullName: 'ABDULLA BIN FAISAL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-526', studentId: 'STU526', fullName: 'MUHAMMED SAJAD', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-527', studentId: 'STU527', fullName: 'HIFAZ BIN MUHAMMED AFTHAB', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-528', studentId: 'STU528', fullName: 'MUHAMMED HANAN MATTAI', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-529', studentId: 'STU529', fullName: 'IMRAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-530', studentId: 'STU530', fullName: 'AHAMMAD SHADIL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-531', studentId: 'STU531', fullName: 'AMAN MANGALAT', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-532', studentId: 'STU532', fullName: 'FAHEEM MUHAMMED', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-533', studentId: 'STU533', fullName: 'MUHAMMED AMAN TP', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-534', studentId: 'STU534', fullName: 'MUHAMMED HANEEN NH', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-535', studentId: 'STU535', fullName: 'HIZAN BIN MUHAMMED', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-536', studentId: 'STU536', fullName: 'SHEZIN HAMDAN', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-537', studentId: 'STU537', fullName: 'FADHI ANWAR', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-538', studentId: 'STU538', fullName: 'ABDUL SAMAD CA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-539', studentId: 'STU539', fullName: 'ZUNNOON', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-540', studentId: 'STU540', fullName: 'ZAINUL ABIDHIN M', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-541', studentId: 'STU541', fullName: 'MOHAMMED', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-542', studentId: 'STU542', fullName: 'MUHAMMED MURSHID', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-543', studentId: 'STU543', fullName: 'FAAZ MUHAMMAD PS', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-544', studentId: 'STU544', fullName: 'MUHAMMED RIYAN KV', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-545', studentId: 'STU545', fullName: 'MUHAMMED MUJTHABA', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-546', studentId: 'STU546', fullName: 'ABDUL HADHI K.S', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-547', studentId: 'STU547', fullName: 'MUHAMMED MISBAH', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-548', studentId: 'STU548', fullName: 'ABDUL HADHI SS', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-549', studentId: 'STU549', fullName: 'ALAN BACKER', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-550', studentId: 'STU550', fullName: 'FAAZ MUHAMMED K', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-551', studentId: 'STU551', fullName: 'MOHAMMED AJMAL', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-552', studentId: 'STU552', fullName: 'MUHAMMED YASEEN V', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-553', studentId: 'STU553', fullName: 'MUHAMMED SHEZIN SADIKH', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-554', studentId: 'STU554', fullName: 'MUHAMMED FADI KT', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-555', studentId: 'STU555', fullName: 'AYAAN MOHAMMED NAYEEM', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },
  { id: 'stu-556', studentId: 'STU556', fullName: 'MUHAMMED ESHAN P', classGrade: 'TBD', houseGroup: 'Azhar', createdAt: new Date().toISOString() },

  // ==============================================
  // --- 6. AL NIZAMIYYA BOYS (58 Students) ---
  // ==============================================
  { id: 'stu-601', studentId: 'STU601', fullName: 'MAHDI MUHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-602', studentId: 'STU602', fullName: 'MUHAMMED IZAN DARVISH', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-603', studentId: 'STU603', fullName: 'MUHAMMED MINHAJ K', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-604', studentId: 'STU604', fullName: 'REYHAN ANEES MALABARI', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-605', studentId: 'STU605', fullName: 'MUHAMMED SHAFEEQ', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-606', studentId: 'STU606', fullName: 'MUHAMMED IRFAN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-607', studentId: 'STU607', fullName: 'MUHAMMED HAMDAN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-608', studentId: 'STU608', fullName: 'SAVAD MUHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-609', studentId: 'STU609', fullName: 'HAROON ASLAM', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-610', studentId: 'STU610', fullName: 'MUHAMMED MINHAJ PC', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-611', studentId: 'STU611', fullName: 'MUAD CK', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-612', studentId: 'STU612', fullName: 'MUHAMMED SINAN VK', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-613', studentId: 'STU613', fullName: 'MUHAMMED AMAN VK', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-614', studentId: 'STU614', fullName: 'MUHAMMED SUFYAN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-615', studentId: 'STU615', fullName: 'K MUHAMMED FADHIL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-616', studentId: 'STU616', fullName: 'MUHAMMED RASHID T', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-617', studentId: 'STU617', fullName: 'MUHAMMED ZABIN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-618', studentId: 'STU618', fullName: 'MUHAMMED SINAN K', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-619', studentId: 'STU619', fullName: 'SYED RAHIL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-620', studentId: 'STU620', fullName: 'UMMER SHAIKALI', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-621', studentId: 'STU621', fullName: 'MAIZ MUHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-622', studentId: 'STU622', fullName: 'ZAHI ABOOBACKER', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-623', studentId: 'STU623', fullName: 'NOUMAN ALI', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-624', studentId: 'STU624', fullName: 'MIDLAJ T P', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-625', studentId: 'STU625', fullName: 'FEMIL MUHAMMED T', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-626', studentId: 'STU626', fullName: 'HAFI YOOSUF A T', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-627', studentId: 'STU627', fullName: 'NAASHITH ALI C K', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-628', studentId: 'STU628', fullName: 'ABDUL FATHAH FIROS', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-629', studentId: 'STU629', fullName: 'MUHAMMED HISHAM', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-630', studentId: 'STU630', fullName: 'MUHAMMED HAMMAZ', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-631', studentId: 'STU631', fullName: 'RADIN T', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-632', studentId: 'STU632', fullName: 'MUHAMMED HAZEEN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-633', studentId: 'STU633', fullName: 'AYAZ MUHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-634', studentId: 'STU634', fullName: 'SHAMMAS ASLAM', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-635', studentId: 'STU635', fullName: 'MUHAMMED FAAZ KP', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-636', studentId: 'STU636', fullName: 'SIDAN HASSAN PS', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-637', studentId: 'STU637', fullName: 'SHAZIN NAUSHAD', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-638', studentId: 'STU638', fullName: 'RAFAN MOHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-639', studentId: 'STU639', fullName: 'MUADDAB', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-640', studentId: 'STU640', fullName: 'MUHAMMED FAAZ BIN FAISAL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-641', studentId: 'STU641', fullName: 'MUHAMMED RASAL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-642', studentId: 'STU642', fullName: 'MUHAMMED AMEEN ASHFAQ', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-643', studentId: 'STU643', fullName: 'SAHL ABDULLA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-644', studentId: 'STU644', fullName: 'MUHAMMED YASEEN', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-645', studentId: 'STU645', fullName: 'REHAN MUHAMMED SAHIR', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-646', studentId: 'STU646', fullName: 'LUQMANUL HAKEEM', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-647', studentId: 'STU647', fullName: 'MUHAMMED AFLAH', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-648', studentId: 'STU648', fullName: 'MUHAMMED RASIL MP', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-649', studentId: 'STU649', fullName: 'HANI MUAAD P C', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-650', studentId: 'STU650', fullName: 'AHMED SAHL', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-651', studentId: 'STU651', fullName: 'MUHAMMED MUJTHABA', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-652', studentId: 'STU652', fullName: 'HAROON RASHEED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-653', studentId: 'STU653', fullName: 'RISWAN M', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-654', studentId: 'STU654', fullName: 'HADI MUHAMMED EP', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-655', studentId: 'STU655', fullName: 'MUHAMMED NIHAL KP', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-656', studentId: 'STU656', fullName: 'RIZAN MUHAMMED', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-657', studentId: 'STU657', fullName: 'HASHIN EH', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },
  { id: 'stu-658', studentId: 'STU658', fullName: 'SHABIL ASHRAF M K', classGrade: 'TBD', houseGroup: 'Nizamiyya', createdAt: new Date().toISOString() },

  // ==============================================
  // --- 7. AL QURTUBA BOYS (57 Students) ---
  // ==============================================
  { id: 'stu-701', studentId: 'STU701', fullName: 'IHAN INTHIKAF', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-702', studentId: 'STU702', fullName: 'MUHAMMED SWALAH', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-703', studentId: 'STU703', fullName: 'LABEEB NOUSHAD', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-704', studentId: 'STU704', fullName: 'DILHAQ HASSAN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-705', studentId: 'STU705', fullName: 'MOHAMMED AFIL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-706', studentId: 'STU706', fullName: 'AMAN MUHAMMED RAFEEK', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-707', studentId: 'STU707', fullName: 'MUHAMED NAZAL V', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-708', studentId: 'STU708', fullName: 'MUHAMMED RASIL P', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-709', studentId: 'STU709', fullName: 'MUHAMMED P', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-710', studentId: 'STU710', fullName: 'MUHAMMED FADHI RN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-711', studentId: 'STU711', fullName: 'UNAIS T', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-712', studentId: 'STU712', fullName: 'MUHAMMED ISSAM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-713', studentId: 'STU713', fullName: 'MUHAMMED K', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-714', studentId: 'STU714', fullName: 'MOHAMMED AMEEN PK', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-715', studentId: 'STU715', fullName: 'RAZI MUHAMMED VF', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-716', studentId: 'STU716', fullName: 'AFHAM SHAHEER', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-717', studentId: 'STU717', fullName: 'MUHAMMED MUHSIN KONDTY', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-718', studentId: 'STU718', fullName: 'MINHAJ THUVVAKKUNN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-719', studentId: 'STU719', fullName: 'MUHAMMED JISAL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-720', studentId: 'STU720', fullName: 'MUHAMMED NASH TT', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-721', studentId: 'STU721', fullName: 'ABDULLAH KASSIM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-722', studentId: 'STU722', fullName: 'SHAFIN MUHAMMED SHAMSUDDHEEN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-723', studentId: 'STU723', fullName: 'NITHASH ALI M', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-724', studentId: 'STU724', fullName: 'MUHAMMED MUBARIZ CK', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-725', studentId: 'STU725', fullName: 'HAFIZ MUHAMMAD K', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-726', studentId: 'STU726', fullName: 'MUHAMMED ZAYAN.C', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-727', studentId: 'STU727', fullName: 'IMAN MUHAMMAD P T', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-728', studentId: 'STU728', fullName: 'AAMIR BIN USMAN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-729', studentId: 'STU729', fullName: 'HUMAYL MOHAMMED', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-730', studentId: 'STU730', fullName: 'SAVAD M', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-731', studentId: 'STU731', fullName: 'AYAZ JABIR', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-732', studentId: 'STU732', fullName: 'IJLAN THOTTUNGAL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-733', studentId: 'STU733', fullName: 'FAID SANEEN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-734', studentId: 'STU734', fullName: 'MUHAMMED RASEEM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-735', studentId: 'STU735', fullName: 'MUHAMMED YOUNUS P', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-736', studentId: 'STU736', fullName: 'MUHAMMED NIHAL B', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-737', studentId: 'STU737', fullName: 'MUHAMMED FADHIL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-738', studentId: 'STU738', fullName: 'HADHI SAEED', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-739', studentId: 'STU739', fullName: 'AZMI MUHAMMED', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-740', studentId: 'STU740', fullName: 'AZAAN MAHWISH ASHRAF', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-741', studentId: 'STU741', fullName: 'AMIN RIHAN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-742', studentId: 'STU742', fullName: 'MUHAMMED MISHAL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-743', studentId: 'STU743', fullName: 'MUHAMMED NADUVILOTHI', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-744', studentId: 'STU744', fullName: 'MUHAMMED ATHIF AS', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-745', studentId: 'STU745', fullName: 'ADHIL HANAN', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-746', studentId: 'STU746', fullName: 'MUHAMMED EASA', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-747', studentId: 'STU747', fullName: 'MUHAMMED RAFAN MM', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-748', studentId: 'STU748', fullName: 'AHAMMED MAJID', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-749', studentId: 'STU749', fullName: 'MUHAMMED UNAIS', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-750', studentId: 'STU750', fullName: 'MUHAMMED NIHAL PB', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-751', studentId: 'STU751', fullName: 'AHLAN K', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-752', studentId: 'STU752', fullName: 'SAHIL MOHAMMED SAHEER', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-753', studentId: 'STU753', fullName: 'AHMED WAFIN K', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-754', studentId: 'STU754', fullName: 'RAZIN MUHAMMED', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-755', studentId: 'STU755', fullName: 'MUHAMMED ATHIQ', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-756', studentId: 'STU756', fullName: 'FAHZAN SHAREEF', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },
  { id: 'stu-757', studentId: 'STU757', fullName: 'YAHYA IBNU NOUFEL', classGrade: 'TBD', houseGroup: 'Qurtuba', createdAt: new Date().toISOString() },

  // ==============================================
  // --- 8. EZ ZITOUNA BOYS (55 Students) ---
  // ==============================================
  { id: 'stu-801', studentId: 'STU801', fullName: 'HATHIM ZAMAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-802', studentId: 'STU802', fullName: 'MUHAMMED HANAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-803', studentId: 'STU803', fullName: 'MUHAMMED IMRAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-804', studentId: 'STU804', fullName: 'SHAHAN SHABEEB', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-805', studentId: 'STU805', fullName: 'MUHAMMED SAHAL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-806', studentId: 'STU806', fullName: 'MUHAMMED ISMAIL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-807', studentId: 'STU807', fullName: 'MUHAMMED SINAN CHEKIAD', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-808', studentId: 'STU808', fullName: 'MUHAMMED JASWIN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-809', studentId: 'STU809', fullName: 'MUFTI MUHAMMED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-810', studentId: 'STU810', fullName: 'MUHAMMED SAFWAN MM', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-811', studentId: 'STU811', fullName: 'FADL AHMED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-812', studentId: 'STU812', fullName: 'AZAH OMAR', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-813', studentId: 'STU813', fullName: 'MUHAMMED SAHEER', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-814', studentId: 'STU814', fullName: 'ASHIQ ABDULLA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-815', studentId: 'STU815', fullName: 'MUHAMMED JASIL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-816', studentId: 'STU816', fullName: 'MUHAMMED NAZAL CK', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-817', studentId: 'STU817', fullName: 'MUHAMMED HADI NAZAL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-818', studentId: 'STU818', fullName: 'MUHAMMED YOUSUF', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-819', studentId: 'STU819', fullName: 'AZEEM AHMED YM', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-820', studentId: 'STU820', fullName: 'AHAMMED YASEEN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-821', studentId: 'STU821', fullName: 'FAZAL AHMED M', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-822', studentId: 'STU822', fullName: 'MOHAMMED AZEEM V', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-823', studentId: 'STU823', fullName: 'AMAL RAHMAN M.P', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-824', studentId: 'STU824', fullName: 'TA ALI ZAKWAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-825', studentId: 'STU825', fullName: 'MUHAMMED YAMIN ANSARI M A', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-826', studentId: 'STU826', fullName: 'YAZAN MUHAMMED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-827', studentId: 'STU827', fullName: 'MUHAMMED RAZI K', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-828', studentId: 'STU828', fullName: 'JAZEEM HANEEFA', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-829', studentId: 'STU829', fullName: 'ALI MIYAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-830', studentId: 'STU830', fullName: 'MUHAMMED SIDHAN V P', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-831', studentId: 'STU831', fullName: 'AHMAD MUNEER', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-832', studentId: 'STU832', fullName: 'MUHAMMED HADHIN FARHAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-833', studentId: 'STU833', fullName: 'MUHAMMED YASEEN MP', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-834', studentId: 'STU834', fullName: 'ABDULLA WAIZ NP', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-835', studentId: 'STU835', fullName: 'HAROON SAMI VEZHAPPILLY', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-836', studentId: 'STU836', fullName: 'AMAN ABDULLA KT', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-837', studentId: 'STU837', fullName: 'SHAZIN HUSSAIN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-838', studentId: 'STU838', fullName: 'MUHAMMED HADHI', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-839', studentId: 'STU839', fullName: 'MUHAMMED HASHIM P', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-840', studentId: 'STU840', fullName: 'MUHAMMED MUNAZIR', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-841', studentId: 'STU841', fullName: 'FAVAS M', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-842', studentId: 'STU842', fullName: 'MUHAMMED AMAN P', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-843', studentId: 'STU843', fullName: 'REZIN MUHAMMED RIYAS', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-844', studentId: 'STU844', fullName: 'MUHAMMED ABAAN V', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-845', studentId: 'STU845', fullName: 'HANIN AHMED FIZIN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-846', studentId: 'STU846', fullName: 'RAMIN MUHAMMED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-847', studentId: 'STU847', fullName: 'AMEN EHSAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-848', studentId: 'STU848', fullName: 'FAIHAN FIROZ', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-849', studentId: 'STU849', fullName: 'MUHAMMED NIHAD K', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-850', studentId: 'STU850', fullName: 'ADEEB SULAIMAN', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-851', studentId: 'STU851', fullName: 'NAZIH ALI MOHAMMED', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-852', studentId: 'STU852', fullName: 'MOHAMMED SHAMMAS', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-853', studentId: 'STU853', fullName: 'AMAN USMAN KALATHINGAL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-854', studentId: 'STU854', fullName: 'HADI MUHAMMED CM', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
  { id: 'stu-855', studentId: 'STU855', fullName: 'ABDULLA MUZAMMIL', classGrade: 'TBD', houseGroup: 'Zitouna', createdAt: new Date().toISOString() },
];

const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-bru',
    name: 'Business Round Up',
    description: 'Weekly student business pitch and case study competition.',
    frequency: 'WEEKLY',
    startDate: '2026-08-01',
    isRecurring: true,
    maxParticipants: 30,
    autoGenerateRounds: true,
    rule: {
      ruleType: 'CLASS_WISE_ROTATION',
      value: 2,
      countableStatuses: ['Participated', 'Registered'],
      description: 'Class-Wise Auto Set Rotation: 2 participants per round per class team',
    },
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    id: 'prog-nq',
    name: 'N-Quest Science Challenge',
    description: 'Bi-weekly scientific inquiry and laboratory challenge.',
    frequency: 'BIWEEKLY',
    startDate: '2026-08-05',
    isRecurring: true,
    maxParticipants: 25,
    autoGenerateRounds: true,
    rule: {
      ruleType: 'TEAM_ROTATION',
      value: 3,
      countableStatuses: ['Participated', 'Registered'],
      description: 'House Team Rotation (Qurtuba, Nizamiyya, Azhar, Zitouna) — Wait 3 weeks',
    },
    createdAt: '2026-08-05T09:30:00.000Z',
  },
];

const INITIAL_ROUNDS: Round[] = [
  {
    id: 'round-bru-1.1',
    programId: 'prog-bru',
    roundNumber: '1.1',
    sequenceIndex: 1,
    date: '2026-08-15',
    regOpenDate: '2026-08-01',
    regCloseDate: '2026-08-14',
    status: 'Registration Open',
  },
  {
    id: 'round-bru-1.2',
    programId: 'prog-bru',
    roundNumber: '1.2',
    sequenceIndex: 2,
    date: '2026-08-22',
    regOpenDate: '2026-08-15',
    regCloseDate: '2026-08-21',
    status: 'Upcoming',
  },
  {
    id: 'round-nq-1.1',
    programId: 'prog-nq',
    roundNumber: '1.1',
    sequenceIndex: 1,
    date: '2026-08-18',
    regOpenDate: '2026-08-05',
    regCloseDate: '2026-08-17',
    status: 'Registration Open',
  },
];

const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-501',
    roundId: 'round-bru-1.1',
    programId: 'prog-bru',
    studentId: 'stu-501',
    registrationDate: '2026-08-10 10:00',
    status: 'Participated',
    registeredBy: 'Event Admin',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-init-roster-full-324',
    action: 'STUDENT_CREATED',
    user: 'AI Roster Scanner',
    userRole: 'SUPER_ADMIN',
    timestamp: new Date().toISOString(),
    details: 'Imported all 324 students across Al-Azhar, Al-Nizamiyya, Al-Qurtuba, and Ez-Zitouna House Teams into SQLite3 Database (All classes set to TBD for manual assignment).',
  },
];

export const SQLiteService = {
  getPrograms: (): Program[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(INITIAL_PROGRAMS));
    return INITIAL_PROGRAMS;
  },

  savePrograms: (programs: Program[]) => {
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs));
  },

  getRounds: (): Round[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUNDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(INITIAL_ROUNDS));
    return INITIAL_ROUNDS;
  },

  saveRounds: (rounds: Round[]) => {
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(rounds));
  },

  getStudents: (): Student[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 300) {
          return parsed;
        }
      } catch {
        // Fallthrough
      }
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(ALL_324_STUDENTS_ROSTER));
    return ALL_324_STUDENTS_ROSTER;
  },

  saveStudents: (students: Student[]) => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  getRegistrations: (): Registration[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
    return INITIAL_REGISTRATIONS;
  },

  saveRegistrations: (registrations: Registration[]) => {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
  },

  getAuditLogs: (): AuditLog[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  },

  saveAuditLogs: (logs: AuditLog[]) => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  getDisciplinaryRecords: (): DisciplinaryRecord[] => {
    const raw = localStorage.getItem(STORAGE_KEYS.DISCIPLINARY_RECORDS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fallthrough
      }
    }
    localStorage.setItem(STORAGE_KEYS.DISCIPLINARY_RECORDS, JSON.stringify([]));
    return [];
  },

  saveDisciplinaryRecords: (records: DisciplinaryRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.DISCIPLINARY_RECORDS, JSON.stringify(records));
  },

  clearAllSqliteData: () => {
    purgeLegacyStorage();
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(INITIAL_PROGRAMS));
    localStorage.setItem(STORAGE_KEYS.ROUNDS, JSON.stringify(INITIAL_ROUNDS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(ALL_324_STUDENTS_ROSTER));
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.DISCIPLINARY_RECORDS, JSON.stringify([]));
  },

  exportDatabaseDump: (): string => {
    const dump = {
      dbEngine: 'SQLite3',
      exportedAt: new Date().toISOString(),
      programs: SQLiteService.getPrograms(),
      rounds: SQLiteService.getRounds(),
      students: SQLiteService.getStudents(),
      registrations: SQLiteService.getRegistrations(),
      auditLogs: SQLiteService.getAuditLogs(),
      disciplinaryRecords: SQLiteService.getDisciplinaryRecords(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importDatabaseDump: (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      const tables = parsed.tables || parsed;
      if (Array.isArray(tables.programs)) SQLiteService.savePrograms(tables.programs);
      if (Array.isArray(tables.rounds)) SQLiteService.saveRounds(tables.rounds);
      if (Array.isArray(tables.students)) SQLiteService.saveStudents(tables.students);
      if (Array.isArray(tables.registrations)) SQLiteService.saveRegistrations(tables.registrations);
      if (Array.isArray(tables.audit_logs || tables.auditLogs)) {
        SQLiteService.saveAuditLogs(tables.audit_logs || tables.auditLogs);
      }
      if (Array.isArray(tables.disciplinary_records || tables.disciplinaryRecords)) {
        SQLiteService.saveDisciplinaryRecords(tables.disciplinary_records || tables.disciplinaryRecords);
      }
      return true;
    } catch {
      return false;
    }
  },
};
