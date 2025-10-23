import { DynamicForm } from '@/components/DynamicForm';

// Static generation for export
export async function generateStaticParams() {
  return [
    { id: 'demo' },
    { id: 'counseling' },
    { id: 'survey' }
  ];
}

// Demo renderer: In production, fetch form schema by id from Supabase
export default function FormPage({ params }: { params: { id: string } }) {
  const demo = {
    id: params.id,
    title: '상담 설문',
    description: '학습과 생활 전반의 상담을 위한 설문',
    questions: [
      { id: 'name', label: '이름', type: 'text' as const, required: true },
      { id: 'grade', label: '학년', type: 'select' as const, options: ['1', '2', '3'], required: true },
      { id: 'issue', label: '현재 고민', type: 'textarea' as const },
      { id: 'support', label: '필요한 지원', type: 'checkbox' as const, options: ['멘토링', '시간관리', '과목별 튜터링'] },
    ],
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <DynamicForm
        formId={demo.id}
        title={demo.title}
        description={demo.description}
        questions={demo.questions}
      />
    </main>
  );
}


