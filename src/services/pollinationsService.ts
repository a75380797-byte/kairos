export interface ParsedStudentFromPaper {
  fullName: string;
  classGrade: string; // S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD
  houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';
  studentId?: string;
}

/**
 * Local regex fallback parser when network fetch fails or internet is offline
 */
export const fallbackLocalParseText = (text: string): ParsedStudentFromPaper[] => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const results: ParsedStudentFromPaper[] = [];

  for (const line of lines) {
    if (/^(class|sheet|team|paper|student|list|registration|attendance)/i.test(line) && !line.includes(':') && !/\d/.test(line)) {
      continue;
    }

    let houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna' = 'Qurtuba';
    if (/nizamiyya/i.test(line)) houseGroup = 'Nizamiyya';
    else if (/azhar/i.test(line)) houseGroup = 'Azhar';
    else if (/zitouna/i.test(line)) houseGroup = 'Zitouna';

    let classGrade = 'TBD';
    const gradeMatch = line.match(/\b(S[12][AB]|C[12][ABC]|[89]|XI?[- ]?[AB]?|X[- ]?[AB]?)\b/i);
    if (gradeMatch) {
      classGrade = gradeMatch[1].toUpperCase().replace(/\s+/g, '');
    }

    let cleanName = line
      .replace(/^\d+[\.\)\-]?\s*/, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\b(Class|Team|House|Qurtuba|Nizamiyya|Azhar|Zitouna|S1A|S1B|S2A|S2B|C1A|C1B|C1C|C2A|C2B|C2C)\b/gi, '')
      .replace(/[,;:\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanName.length >= 2 && !/^(name|student|id|grade|house)$/i.test(cleanName)) {
      results.push({
        fullName: cleanName,
        classGrade,
        houseGroup,
      });
    }
  }

  return results;
};

/**
 * Parses paper text or scanned image using Pollinations AI (100% Free Forever API)
 */
export const parsePaperWithPollinations = async (
  paperContentTextOrBase64: string
): Promise<ParsedStudentFromPaper[]> => {
  const isBase64Image = paperContentTextOrBase64.startsWith('data:image/');

  const systemPrompt = `You are a high-precision AI document and paper scanner parser for a school system.
Read the provided paper attendance sheet / poster / scanned text and extract ALL student records.
Extract for each student:
- fullName (e.g. Ahmed Al-Mansoor)
- classGrade (strictly one of: S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD. Default to TBD if unspecified)
- houseGroup (strictly one of: Qurtuba, Nizamiyya, Azhar, Zitouna. Default to Qurtuba if unspecified)

Return ONLY a valid raw JSON array matching schema:
[
  {
    "fullName": "Student Name",
    "classGrade": "S1A",
    "houseGroup": "Qurtuba",
    "studentId": "STU..." (optional)
  }
]
Do NOT return any markdown wrapper, code blocks, or conversational text outside the raw JSON array.`;

  try {
    let payloadMessages: any[];

    if (isBase64Image) {
      payloadMessages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: `${systemPrompt}\n\nExtract all student records from this document image:` },
            { type: 'image_url', image_url: { url: paperContentTextOrBase64 } },
          ],
        },
      ];
    } else {
      payloadMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract all student details from this paper list/scan:\n${paperContentTextOrBase64}` },
      ];
    }

    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: payloadMessages,
        model: 'openai',
        jsonMode: true,
      }),
    });

    if (!response.ok) {
      console.warn('Pollinations AI endpoint returned error status:', response.status);
      return fallbackLocalParseText(paperContentTextOrBase64);
    }

    const textResult = await response.text();

    // Clean JSON response (strip potential markdown backticks)
    const jsonCleaned = textResult
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(jsonCleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((item) => ({
        fullName: String(item.fullName || item.name || 'Unknown Student').trim(),
        classGrade: String(item.classGrade || item.class || 'TBD').toUpperCase().trim(),
        houseGroup: (['Qurtuba', 'Nizamiyya', 'Azhar', 'Zitouna'].includes(item.houseGroup)
          ? item.houseGroup
          : 'Qurtuba') as any,
        studentId: item.studentId ? String(item.studentId).trim() : undefined,
      }));
    }

    return fallbackLocalParseText(paperContentTextOrBase64);
  } catch (err) {
    console.warn('Pollinations AI fetch exception, using local parser fallback:', err);
    return fallbackLocalParseText(paperContentTextOrBase64);
  }
};
