import { DynamicForm } from '@/components/DynamicForm';

export default async function FormPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/forms/${params.id}` || `/api/forms/${params.id}` , {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // No password by default; protected forms will return 401
    body: JSON.stringify({}),
    cache: 'no-store'
  });

  if (res.status === 404) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <p>설문을 찾을 수 없습니다.</p>
      </main>
    );
  }

  if (res.status === 401) {
    return (
      <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ marginBottom: 12 }}>보호된 설문입니다</h2>
        <p>통계 접근 비밀번호가 설정된 설문입니다. 올바른 경로로 접근해 주세요.</p>
      </main>
    );
  }

  const json = await res.json();

  const fields = Array.isArray(json?.schema?.fields) ? json.schema.fields : [];
  const questions = fields.map((f: any) => ({
    id: f.id,
    label: f.label,
    type: f.type,
    required: Boolean(f.required),
    options: Array.isArray(f.options) ? f.options : undefined,
  }));

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <DynamicForm
        formId={json.id}
        title={json.title}
        description={json.description}
        questions={questions}
      />
    </main>
  );
}


