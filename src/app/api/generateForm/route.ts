import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // API 키 확인
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY is not set');
      throw new Error('API key not configured');
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // 타임아웃 설정 (30초)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 30000)
    );

    const apiPromise = model.generateContent(`Create a Korean survey form from the user's request below. Return only valid JSON, no prose.

Format:
{
  "title": "Survey Title",
  "description": "Survey Description", 
  "questions": [
    {
      "id": "q1",
      "label": "Question text",
      "type": "text",
      "required": true
    }
  ]
}

Request: ${prompt}`);

    const result = await Promise.race([apiPromise, timeoutPromise]) as any;

    if (!result || !result.response) {
      throw new Error('Invalid API response');
    }

    const responseText = result.response.text();

    const clean = (text: string) => {
      // strip code fences and non-json pre/post text
      const fenced = text.match(/```json\n([\s\S]*?)\n```/i);
      if (fenced) return fenced[1];
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
      return text.trim();
    };

    let parsed: any;
    try {
      const cleanedText = clean(responseText);
      if (!cleanedText || cleanedText.trim() === '') {
        throw new Error('Empty response');
      }
      parsed = JSON.parse(cleanedText);
    } catch (e) {
      console.error('JSON parsing failed:', e);
      throw new Error('Failed to parse AI JSON');
    }

    // normalize to questions array if fields provided
    if (!parsed.questions && parsed.fields) {
      parsed.questions = parsed.fields;
      delete parsed.fields;
    }

    // ensure each question has id
    if (Array.isArray(parsed.questions)) {
      parsed.questions = parsed.questions.map((q: any, idx: number) => ({
        id: q.id || `q_${idx + 1}`,
        label: q.label || `문항 ${idx + 1}`,
        type: q.type || 'text',
        required: Boolean(q.required),
        options: Array.isArray(q.options) ? q.options : undefined,
      }));
    }

    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Error generating form:', error);
    return NextResponse.json({ error: 'AI_GENERATION_FAILED' }, { status: 500 });
  }
}


