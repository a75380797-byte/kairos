import type {
  Student,
  Program,
  Round,
  Registration,
  EligibilityResult,
} from '../types';

export const COMBINED_CLASS_PAIRS: { [key: string]: string[] } = {
  S1A: ['S1A', 'S2A'],
  S2A: ['S1A', 'S2A'],
  S1B: ['S1B', 'S2B'],
  S2B: ['S1B', 'S2B'],
  C1A: ['C1A', 'C2A'],
  C2A: ['C1A', 'C2A'],
  C1B: ['C1B', 'C2B'],
  C2B: ['C1B', 'C2B'],
  C1C: ['C1C', 'C2C'],
  C2C: ['C1C', 'C2C'],
};

export function getCombinedClassGroup(classGrade: string): string[] {
  if (!classGrade) return ['TBD'];
  const norm = classGrade.toUpperCase().trim();
  return COMBINED_CLASS_PAIRS[norm] || [norm];
}

export function getCombinedClassLabel(classGrade: string): string {
  const group = getCombinedClassGroup(classGrade);
  if (group.length > 1) {
    return group.join(' & ');
  }
  return classGrade || 'TBD';
}

export function checkStudentEligibility(
  student: Student,
  program: Program,
  targetRound: Round,
  allRounds: Round[],
  allRegistrations: Registration[],
  allStudents: Student[] = []
): EligibilityResult {
  const rule = program.rule;

  const studentProgramRegistrations = allRegistrations.filter(
    (reg) => reg.studentId === student.id && reg.programId === program.id
  );

  const countableRegistrations = studentProgramRegistrations.filter((reg) =>
    rule.countableStatuses.includes(reg.status)
  );

  const programRounds = allRounds
    .filter((r) => r.programId === program.id)
    .sort((a, b) => a.sequenceIndex - b.sequenceIndex);

  if (countableRegistrations.length === 0) {
    const combinedClassNote = getCombinedClassLabel(student.classGrade);
    return {
      isEligible: true,
      reason: `No previous participation recorded for ${program.name}. Combined Class ${combinedClassNote} (${student.houseGroup} Team) is fully eligible.`,
      student,
      program,
      targetRound,
      ruleApplied: rule,
    };
  }

  const participationRoundsWithReg = countableRegistrations
    .map((reg) => {
      const round = programRounds.find((r) => r.id === reg.roundId);
      return { reg, round };
    })
    .filter((item): item is { reg: Registration; round: Round } => item.round !== undefined)
    .sort((a, b) => b.round.sequenceIndex - a.round.sequenceIndex);

  if (participationRoundsWithReg.length === 0) {
    return {
      isEligible: true,
      reason: `Previous registrations do not count towards restriction. Student is eligible.`,
      student,
      program,
      targetRound,
      ruleApplied: rule,
    };
  }

  const lastParticipation = participationRoundsWithReg[0];
  const lastRound = lastParticipation.round;

  if (
    rule.ruleType === 'ROUNDS_INTERVENING' ||
    rule.ruleType === 'TEAM_ROTATION' ||
    rule.ruleType === 'CLASS_WISE_ROTATION'
  ) {
    let requiredInterval = rule.value; // default configured interval

    // Dynamic Combined Class Team Member Auto-Adjustment logic
    let classSetCount = rule.value;
    let classTeamStudentCount = 0;
    let isOddNumber = false;
    let combinedLabel = getCombinedClassLabel(student.classGrade);

    if (rule.ruleType === 'CLASS_WISE_ROTATION' && allStudents.length > 0) {
      const targetClasses = getCombinedClassGroup(student.classGrade);
      const classTeamMembers = allStudents.filter(
        (s) =>
          targetClasses.includes(s.classGrade.toUpperCase().trim()) &&
          s.houseGroup === student.houseGroup
      );
      classTeamStudentCount = classTeamMembers.length;
      
      const participantsPerRound = rule.value > 0 ? rule.value : 2; // e.g. 2 participants per round
      classSetCount = Math.max(1, Math.ceil(classTeamStudentCount / participantsPerRound));
      requiredInterval = classSetCount;
      isOddNumber = classTeamStudentCount % 2 !== 0;
    }

    const targetSeq = targetRound.sequenceIndex;
    const lastSeq = lastRound.sequenceIndex;
    const diff = targetSeq - lastSeq;

    // Calculate eligible round & date for all restricted cases
    const eligibleSeq = lastSeq + requiredInterval;
    const eligibleRound = programRounds.find((r) => r.sequenceIndex === eligibleSeq);
    
    let eligibleFromDate = eligibleRound?.date;
    if (!eligibleFromDate && programRounds.length >= 1) {
      const daysToAdd = requiredInterval * 7;
      const projected = new Date(lastRound.date);
      projected.setDate(projected.getDate() + daysToAdd);
      eligibleFromDate = projected.toISOString().split('T')[0];
    }

    const projectedRoundNumber = eligibleRound 
      ? eligibleRound.roundNumber 
      : `Round #${eligibleSeq}`;

    const roundsRemaining = Math.max(1, requiredInterval - Math.max(0, diff));

    if (diff <= 0 || diff < requiredInterval) {
      let ruleExplanation = `Must wait ${requiredInterval} rounds before re-entering.`;
      if (rule.ruleType === 'CLASS_WISE_ROTATION') {
        const oddNote = isOddNumber ? ` [${classTeamStudentCount} members auto-adjusted into ${classSetCount} sets]` : '';
        ruleExplanation = `Combined Class Pair (${combinedLabel}) - ${student.houseGroup} Team (${classTeamStudentCount || 5} members${oddNote}): Divided into ${classSetCount} sets. Set 1 played in Round ${lastRound.roundNumber}. All class sets complete after ${classSetCount} rounds → Eligible again in Round ${projectedRoundNumber}.`;
      } else if (rule.ruleType === 'TEAM_ROTATION') {
        ruleExplanation = `${student.houseGroup} House Team rotation requires waiting ${requiredInterval} rounds.`;
      }

      return {
        isEligible: false,
        reason: `Participated in Round ${lastRound.roundNumber} on ${lastRound.date}. ${ruleExplanation}`,
        student,
        program,
        targetRound,
        lastParticipation: {
          round: lastRound,
          registration: lastParticipation.reg,
          status: lastParticipation.reg.status,
        },
        roundsRemaining,
        eligibleFromRound: eligibleRound || {
          id: `projected-${eligibleSeq}`,
          programId: program.id,
          roundNumber: projectedRoundNumber,
          sequenceIndex: eligibleSeq,
          date: eligibleFromDate || 'TBD',
          regOpenDate: 'TBD',
          regCloseDate: 'TBD',
          status: 'Upcoming',
        },
        eligibleFromDate,
        ruleApplied: rule,
      };
    }
  } else if (rule.ruleType === 'DAYS_INTERVAL') {
    const requiredDays = rule.value;
    const lastDate = new Date(lastRound.date);
    const targetDate = new Date(targetRound.date);
    const diffMs = targetDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < requiredDays) {
      const eligibleDateObj = new Date(lastDate);
      eligibleDateObj.setDate(eligibleDateObj.getDate() + requiredDays);
      const eligibleFromDate = eligibleDateObj.toISOString().split('T')[0];

      return {
        isEligible: false,
        reason: `Participated in Round ${lastRound.roundNumber} on ${lastRound.date}. Minimum ${requiredDays} days interval required between participations.`,
        student,
        program,
        targetRound,
        lastParticipation: {
          round: lastRound,
          registration: lastParticipation.reg,
          status: lastParticipation.reg.status,
        },
        eligibleFromDate,
        ruleApplied: rule,
      };
    }
  }

  return {
    isEligible: true,
    reason: `Student participated in Round ${lastRound.roundNumber} on ${lastRound.date}, but has satisfied the required rotation interval. Fully eligible to participate!`,
    student,
    program,
    targetRound,
    lastParticipation: {
      round: lastRound,
      registration: lastParticipation.reg,
      status: lastParticipation.reg.status,
    },
    ruleApplied: rule,
  };
}
