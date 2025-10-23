"use client";
import { useState } from 'react';

type Question = {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  options?: string[];
};

export function DynamicForm({
  formId,
  title,
  description,
  questions,
  onSubmitted,
}: {
  formId: string;
  title: string;
  description?: string;
  questions: Question[];
  onSubmitted?: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (id: string, value: any) => {
    setValues((v) => ({ ...v, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/submitResponse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form_id: formId, answers: values }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '제출 실패');
      onSubmitted?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      display: 'grid', 
      gap: '1.5rem',
      background: 'white',
      padding: '2rem',
      borderRadius: 16,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem', 
          color: '#333',
          fontWeight: 'bold'
        }}>
          {title}
        </h2>
        {description && (
          <p style={{ 
            color: '#666', 
            fontSize: '1.1rem',
            lineHeight: 1.6,
            margin: 0
          }}>
            {description}
          </p>
        )}
      </div>
      
      {questions.map((q) => {
        const commonProps = {
          id: q.id,
          name: q.id,
          required: q.required,
          value: values[q.id] ?? '',
          onChange: (e: any) => handleChange(q.id, e.target?.value),
          style: {
            width: '100%',
            padding: '0.8rem',
            borderRadius: 8,
            border: '2px solid #e1e5e9',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            boxSizing: 'border-box' as const
          }
        };
        
        return (
          <div key={q.id} style={{ marginBottom: '1rem' }}>
            <label 
              htmlFor={q.id} 
              style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              {q.label}{q.required ? ' *' : ''}
            </label>
            
            {q.type === 'text' && <input type="text" {...commonProps} />}
            {q.type === 'number' && <input type="number" {...commonProps} />}
            {q.type === 'textarea' && (
              <textarea 
                {...commonProps} 
                rows={4}
                style={{ ...commonProps.style, resize: 'vertical' }}
              />
            )}
            {q.type === 'select' && (
              <select {...commonProps}>
                <option value="">선택하세요</option>
                {(q.options || []).map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
            {q.type === 'radio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(q.options || []).map((opt) => (
                  <label 
                    key={opt} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: '0.5rem',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                      backgroundColor: values[q.id] === opt ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                    }}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={values[q.id] === opt}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
            {q.type === 'checkbox' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {(q.options || []).map((opt) => {
                  const selected: string[] = values[q.id] || [];
                  const checked = selected.includes(opt);
                  return (
                    <label 
                      key={opt} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        padding: '0.5rem',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: checked ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(selected);
                          if (e.target.checked) next.add(opt); else next.delete(opt);
                          handleChange(q.id, Array.from(next));
                        }}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          padding: '0.8rem',
          borderRadius: 8,
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}
      
      <button 
        type="submit" 
        disabled={submitting}
        style={{
          background: submitting ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '1rem 2rem',
          borderRadius: 12,
          fontSize: '1.1rem',
          fontWeight: 'bold',
          cursor: submitting ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          marginTop: '1rem'
        }}
      >
        {submitting ? '🔄 제출 중...' : '✨ 설문 제출하기'}
      </button>
    </form>
  );
}


