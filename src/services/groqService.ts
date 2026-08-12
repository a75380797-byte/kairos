export interface ParsedStudentFromPaper {
  fullName: string;
  classGrade: string; // S1A, S1B, S2A, S2B, C1A, C1B, C1C, C2A, C2B, C2C, 8, 9, TBD
  houseGroup: 'Qurtuba' | 'Nizamiyya' | 'Azhar' | 'Zitouna';
  studentId?: string;
}

const DEFAULT_AI_KEY = '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';

export const parsePaperWithGroq = async (
  paperContentTextOrBase64: string,
  customApiKey?: string
): Promise<ParsedStudentFromPaper[]> => {
  const apiKey = (customApiKey && customApiKey.trim().length > 5) ? customApiKey.trim() : DEFAULT_AI_KEY;

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

  const userPrompt = `Extract all student details from this paper list/scan:
${paperContentTextOrBase64}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI Scan Service Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '[]';
    const jsonStr = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedArray = JSON.parse(jsonStr);

    if (!Array.isArray(parsedArray)) {
      throw new Error('AI Service did not return a valid array of students.');
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
    console.error('Groq AI Scanner Error:', err);
    throw err;
  }
};
