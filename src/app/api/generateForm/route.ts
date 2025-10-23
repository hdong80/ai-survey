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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 타임아웃 설정 (30초)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API timeout')), 30000)
    );

    const apiPromise = model.generateContent(`Create a Korean survey form. Return only valid JSON.

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
      // fallback minimal structure
      parsed = { title: 'AI 설문', description: '', questions: [] };
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
    
    // 프롬프트 기반 간단한 설문 생성
    const simpleQuestions = [];
    const promptText = String(prompt);
    
    if (promptText.includes('학생') || promptText.includes('교육')) {
      simpleQuestions.push(
        { id: 'grade', label: '학년', type: 'select', required: true, options: ['1학년', '2학년', '3학년'] },
        { id: 'subject', label: '가장 관심 있는 과목', type: 'text', required: true },
        { id: 'difficulty', label: '학습 난이도', type: 'radio', required: true, options: ['쉬움', '보통', '어려움'] },
        { id: 'opinion', label: '추가 의견', type: 'textarea', required: false }
      );
    } else if (promptText.includes('만족도') || promptText.includes('평가')) {
      simpleQuestions.push(
        { id: 'satisfaction', label: '전체적인 만족도', type: 'radio', required: true, options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] },
        { id: 'reason', label: '이유', type: 'textarea', required: false }
      );
    } else {
      simpleQuestions.push(
        { id: 'name', label: '이름', type: 'text', required: true },
        { id: 'opinion', label: '의견을 작성해 주세요', type: 'textarea', required: false }
      );
    }
    
    const fallback = {
      title: 'AI 설문',
      description: '요청하신 내용을 바탕으로 생성된 설문입니다.',
      questions: simpleQuestions,
      aiError: String(error?.message ?? error ?? 'unknown')
    };
    return NextResponse.json(fallback, { status: 200 });
  }
}


