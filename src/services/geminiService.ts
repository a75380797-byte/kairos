export interface ParsedStudentFromPaper {
  fullName: string;
  classGrade: string; // S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD
  houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';
  studentId?: string;
}

const DEFAULT_GEMINI_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

/**
 * Local regex fallback parser when network fetch fails or internet is unavailable
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

export const parsePaperWithGemini = async (
  paperContentTextOrBase64: string,
  customApiKey?: string
): Promise<ParsedStudentFromPaper[]> => {
  const apiKey =
    customApiKey && customApiKey.trim().length > 5
      ? customApiKey.trim()
      : localStorage.getItem('kairoos_gemini_key') || localStorage.getItem('kairoos_groq_key') || DEFAULT_GEMINI_KEY;

  const isBase64Image = paperContentTextOrBase64.startsWith('data:image/');

  const systemPrompt = `You are a high-precision AI document and paper scanner parser for a school system.
Read the provided paper attendance sheet / poster / scanned text and extract ALL student records.
Extract for each student:
- fullName (e.g. Ahmed Al-Mansoor)
- classGrade (strictly one of: S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD. Default to TBD if unspecified)
- houseGroup (strictly one of: Qurtuba, Nizamiyya, Azhar, Zitouna. Default to Qurtuba if unspecified)

Return ONLY a valid JSON array matching schema:
[
  {
    "fullName": "Student Name",
    "classGrade": "S1A",
    "houseGroup": "Qurtuba",
    "studentId": "STU..." (optional)
  }
]
Do NOT return any markdown wrapper code blocks or conversational text outside the raw JSON array.`;

  let contentsPayload: any[];

  if (isBase64Image) {
    const matches = paperContentTextOrBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : 'image/jpeg';
    const base64Data = matches ? matches[2] : paperContentTextOrBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

    contentsPayload = [
      {
        parts: [
          { text: `${systemPrompt}\n\nExtract all student records from this document image:` },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ];
  } else {
    contentsPayload = [
      {
        parts: [
          { text: `${systemPrompt}\n\nExtract all student details from this paper list/scan:\n${paperContentTextOrBase64}` },
        ],
      },
    ];
  }

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: contentsPayload,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 400 || response.status === 404) {
          lastError = new Error(`Gemini API Error (${response.status}): ${errText}`);
          continue;
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error('Gemini API Key is invalid or unauthorized (401/403). Please provide a valid Gemini API Key.');
        }
        if (response.status === 429) {
          throw new Error('Gemini AI API Rate Limit exceeded (429). Please try again in a few moments or use a custom API key.');
        }
        throw new Error(`Gemini AI Service Error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      
      let cleanStr = rawContent
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();
      const jsonMatch = cleanStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) cleanStr = jsonMatch[0];

      const parsedArray = JSON.parse(cleanStr);

      if (!Array.isArray(parsedArray)) {
        throw new Error('Gemini AI Service did not return a valid array of students.');
      }

      return parsedArray.map((item: any) => ({
        fullName: String(item.fullName || 'Unknown Student'),
        classGrade: String(item.classGrade || 'TBD'),
        houseGroup: ['Qurtuba', 'Nizamiyya', 'Azhar', 'Zitouna'].includes(item.houseGroup)
          ? item.houseGroup
          : 'Qurtuba',
        studentId: item.studentId ? String(item.studentId) : undefined,
      }));
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('401') || err.message?.includes('403') || err.message?.includes('429')) {
        throw err;
      }
    }
  }

  // Fallback to local regex parser if network fetch failed
  if (!isBase64Image && paperContentTextOrBase64.trim().length > 0) {
    const fallbackResults = fallbackLocalParseText(paperContentTextOrBase64);
    if (fallbackResults.length > 0) {
      console.warn('Gemini fetch failed, using offline fallback parser:', fallbackResults);
      return fallbackResults;
    }
  }

  throw lastError || new Error('Failed to parse document with Gemini AI.');
};

// Re-export alias for backwards compatibility
export const parsePaperWithGroq = parsePaperWithGemini;
