import { parsePaperWithGemini } from './geminiService';

export interface ParsedStudentFromPaper {
  fullName: string;
  classGrade: string; // S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD
  houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';
  studentId?: string;
}

const DEFAULT_GROQ_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || '';

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

export const parsePaperWithGroq = async (
  paperContentTextOrBase64: string,
  customApiKey?: string
): Promise<ParsedStudentFromPaper[]> => {
  const apiKey =
    customApiKey && customApiKey.trim().length > 5
      ? customApiKey.trim()
      : localStorage.getItem('kairoos_groq_key') || DEFAULT_GROQ_KEY;

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

  let messagesPayload: any[];

  if (isBase64Image) {
    // Note: Groq vision models do NOT support separate system role messages. Put system prompt inside user content.
    messagesPayload = [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${systemPrompt}\n\nExtract all student records from this document image:` },
          { type: 'image_url', image_url: { url: paperContentTextOrBase64 } },
        ],
      },
    ];
  } else {
    messagesPayload = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Extract all student details from this paper list/scan:\n${paperContentTextOrBase64}` },
    ];
  }

  const modelToUse = isBase64Image ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messagesPayload,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq AI Service Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';
    const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedArray = JSON.parse(jsonStr);

    if (!Array.isArray(parsedArray)) {
      throw new Error('Groq AI Service did not return a valid array of students.');
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
    console.warn('Groq AI Scanner Error, attempting Gemini AI fallback...', err);

    // Fallback 1: Try Gemini AI automatically
    try {
      const geminiResults = await parsePaperWithGemini(paperContentTextOrBase64, customApiKey);
      if (geminiResults && geminiResults.length > 0) {
        console.log('Gemini AI Fallback scanner succeeded:', geminiResults);
        return geminiResults;
      }
    } catch (geminiErr) {
      console.warn('Gemini AI Fallback also failed:', geminiErr);
    }

    // Fallback 2: Offline regex parser if plain text
    if (!isBase64Image && paperContentTextOrBase64.trim().length > 0) {
      const fallbackResults = fallbackLocalParseText(paperContentTextOrBase64);
      if (fallbackResults.length > 0) {
        console.warn('Using offline fallback regex parser:', fallbackResults);
        return fallbackResults;
      }
    }

    throw err;
  }
};
