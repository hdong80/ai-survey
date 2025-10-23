import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { title, description, fields, type, password } = await request.json();

    if (!title || !fields) {
      return NextResponse.json({ error: 'Title and fields are required' }, { status: 400 });
    }

    // 폼을 데이터베이스에 저장
    const passwordHash = password ? crypto.createHash('sha256').update(password).digest('hex') : null;

    const schema = {
      type: type || 'general',
      fields,
      protected: Boolean(passwordHash),
      passwordHash,
    };

    const { data, error } = await supabase
      .from('forms')
      .insert([
        {
          title,
          description,
          schema,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving form:', error);
      return NextResponse.json({ error: 'Failed to save form' }, { status: 500 });
    }

    // 자동으로 생성된 URL과 함께 응답
    return NextResponse.json({
      formId: data.id,
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/form/${data.id}`,
      message: 'Form created successfully'
    });

  } catch (error) {
    console.error('Error in saveForm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
