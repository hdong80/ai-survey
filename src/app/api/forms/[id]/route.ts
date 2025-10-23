import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formId = params.id;
    const { password } = await req.json().catch(() => ({ password: undefined as string | undefined }));

    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (error || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const schema = form.schema ?? {};
    const protectedFlag = Boolean(schema?.protected);
    const hash = (val: string) => crypto.createHash('sha256').update(val).digest('hex');

    if (protectedFlag) {
      if (!password) {
        return NextResponse.json({ error: 'PASSWORD_REQUIRED', protected: true }, { status: 401 });
      }
      if (schema.passwordHash && hash(password) !== schema.passwordHash) {
        return NextResponse.json({ error: 'INVALID_PASSWORD', protected: true }, { status: 401 });
      }
    }

    return NextResponse.json({
      id: form.id,
      title: form.title,
      description: form.description,
      schema,
      protected: protectedFlag,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}



