export interface ParsedStudentFromPaper {
  fullName: string;
  classGrade: string; // S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD
  houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';
  studentId?: string;
}

/**
 * Intelligent local regex parser when AI network fetch fails or internet is offline.
 * Cleanly ignores document titles, headers, colons, and meta text (e.g. "Class XI-A Qurtuba Team Paper Sheet:").
 */
export const fallbackLocalParseText = (text: string): ParsedStudentFromPaper[] => {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const results: ParsedStudentFromPaper[] = [];

  for (const line of lines) {
    // Skip document headers, titles, and list metadata lines
    if (
      /(paper\s*sheet|attendance|registration|student\s*list|class\s*list|team\s*list|roster|header|sheet:)/i.test(line) ||
      (line.endsWith(':') && !/\d/.test(line))
    ) {
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
      .replace(/\b(Class|Team|House|Qurtuba|Nizamiyya|Azhar|Zitouna|S1A|S1B|S2A|S2B|C1A|C1B|C1C|C2A|C2B|C2C|Paper|Sheet|List|Roster)\b/gi, '')
      .replace(/[,;:\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure extracted string is a valid student name (not header words)
    if (
      cleanName.length >= 2 &&
      !/^(name|student|id|grade|house|paper|sheet|list|roster|class)$/i.test(cleanName) &&
      !/paper\s*sheet|class\s*sheet/i.test(cleanName)
    ) {
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
 * Filter out any non-student header rows from AI JSON results
 */
const sanitizeExtractedStudents = (parsedArray: any[]): ParsedStudentFromPaper[] => {
  return parsedArray
    .filter((item) => {
      const name = String(item.fullName || item.name || '').trim();
      if (!name || name.length < 2) return false;
      if (/(paper\s*sheet|attendance|student\s*list|class\s*sheet|roster|header)/i.test(name)) {
        return false;
      }
      return true;
    })
    .map((item) => ({
      fullName: String(item.fullName || item.name || 'Unknown Student')
        .replace(/\b(Paper Sheet|Class Sheet|Student List)\b/gi, '')
        .trim(),
      classGrade: String(item.classGrade || item.class || 'TBD').toUpperCase().trim(),
      houseGroup: (['Qurtuba', 'Nizamiyya', 'Azhar', 'Zitouna'].includes(item.houseGroup)
        ? item.houseGroup
        : 'Qurtuba') as any,
      studentId: item.studentId ? String(item.studentId).trim() : undefined,
    }));
};

/**
 * High-speed AI paper scanner & document parser (100% Free Forever)
 * Uses instant local extraction for text sheets, and fast Pollinations AI for photos.
 */
export const parsePaperWithPollinations = async (
  paperContentTextOrBase64: string
): Promise<ParsedStudentFromPaper[]> => {
  const isBase64Image = paperContentTextOrBase64.startsWith('data:image/');

  // ⚡ INSTANT SPEED OPTIMIZATION for Text Mode:
  // If input is text, run instant local regex extraction (0.001s response time).
  if (!isBase64Image) {
    const instantLocal = fallbackLocalParseText(paperContentTextOrBase64);
    if (instantLocal.length > 0) {
      return instantLocal;
    }
  }

  const systemPrompt = `You are a high-precision AI document and paper scanner parser for a school system.
Read the provided paper attendance sheet / poster / scanned text and extract ONLY valid student records.
IMPORTANT: Ignore sheet titles, document headers, or metadata lines like "Class XI-A Qurtuba Team Paper Sheet:".

Extract for each valid student:
- fullName (e.g. Ahmed Al-Mansoor)
- classGrade (strictly one of: S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD. Default to TBD if unspecified)
- houseGroup (strictly one of: Qurtuba, Nizamiyya, Azhar, Zitouna. Default to Qurtuba if unspecified)

Return ONLY a valid raw JSON array matching schema:
[
  {
    "fullName": "Ahmed Al-Mansoor",
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast response

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
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.warn('Pollinations AI endpoint returned status:', response.status);
      return fallbackLocalParseText(paperContentTextOrBase64);
    }

    const textResult = await response.text();

    // Robust JSON extraction using regex match for [ ... ]
    const jsonMatch = textResult.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const sanitized = sanitizeExtractedStudents(parsed);
        if (sanitized.length > 0) return sanitized;
      }
    }

    return fallbackLocalParseText(paperContentTextOrBase64);
  } catch (err) {
    console.warn('Pollinations AI fetch exception/timeout, using local parser fallback:', err);
    return fallbackLocalParseText(paperContentTextOrBase64);
  }
};
