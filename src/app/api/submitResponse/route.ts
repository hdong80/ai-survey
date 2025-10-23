import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { z } from 'zod';

const schema = z.object({
  form_id: z.string(),
  answers: z.record(z.any()),
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

  const { error } = await supabase.from('responses').insert({
    form_id: parsed.data.form_id,
    answers: parsed.data.answers,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}



