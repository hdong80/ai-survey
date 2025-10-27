import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const inputSchema = z.object({
  formTitle: z.string(),
  responses: z.array(z.record(z.any())),
  instructions: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  const sys = `You are an analyst. Given survey responses, produce strictly JSON with keys: key_insights (array of strings), summary (string), stats (object with aggregates per question). Output valid JSON only.`;
  const user = JSON.stringify({
    formTitle: parsed.data.formTitle,
    responses: parsed.data.responses,
    instructions: parsed.data.instructions ?? '',
  });

  const result = await model.generateContent([sys, user].join('\n\n'));
  const content = (await result.response).text();
  try {
    const json = JSON.parse(content);
    return NextResponse.json(json);
  } catch {
    return NextResponse.json({ raw: content }, { status: 200 });
  }
}


