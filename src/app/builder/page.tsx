"use client";
import { useState } from 'react';
import { DynamicForm } from '@/components/DynamicForm';

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [schema, setSchema] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/generateForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const json = await res.json();
      setSchema(json);
    } catch (error) {
      console.error('Error generating form:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 24,
        padding: '3rem 2rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🤖 AI 설문 생성기
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            원하는 설문 내용을 입력하면 AI가 자동으로 설문 폼을 생성합니다
          </p>
        </div>

        <div style={{ 
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: 16,
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '1rem', 
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#333'
          }}>
            📝 설문 내용을 입력하세요
          </label>
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            rows={6}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 12,
              border: '2px solid #e1e5e9',
              fontSize: '1rem',
              resize: 'vertical',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color 0.3s ease',
              boxSizing: 'border-box'
            }}
            placeholder="예: 학생들의 학습 스타일과 선호도를 조사하는 설문을 만들어주세요"
          />
          <button 
            onClick={generate}
            disabled={loading}
            style={{
              marginTop: '1rem',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 12,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            {loading ? '🔄 생성 중...' : '✨ AI 설문 생성'}
          </button>
        </div>

        {schema && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e1e5e9'
          }}>
            <h2 style={{ 
              fontSize: '1.8rem', 
              marginBottom: '1.5rem', 
              color: '#333',
              textAlign: 'center'
            }}>
              📋 생성된 설문 미리보기
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <DynamicForm
                formId={schema.id ?? 'demo-form'}
                title={schema.title ?? 'AI 설문'}
                description={schema.description}
                questions={schema.questions ?? []}
              />
            </div>

            <div style={{ 
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: 12,
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#333'
              }}>
                🔒 접근 비밀번호 (선택사항)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하면 보호된 설문이 됩니다"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 8,
                  border: '2px solid #e1e5e9',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                fontSize: '0.9rem', 
                color: '#666' 
              }}>
                비워두면 누구나 접근 가능한 공개 설문이 됩니다
              </p>
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/saveForm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: schema.title,
                      description: schema.description,
                      fields: schema.questions,
                      password: password || undefined,
                    }),
                  });
                  const json = await res.json();
                  if (json.formId) {
                    alert(`설문이 생성되었습니다!\nURL: ${window.location.origin}/form/${json.formId}`);
                    location.href = `/form/${json.formId}`;
                  }
                } catch (error) {
                  alert('설문 저장 중 오류가 발생했습니다.');
                  console.error(error);
                }
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: 12,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
              }}
            >
              🚀 설문 저장 및 배포하기
            </button>
          </div>
        )}
      </main>
    </div>
  );
}


