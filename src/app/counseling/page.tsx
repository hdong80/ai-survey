"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CounselingFormBuilder() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<any>(null);
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generateCounselingForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const formData = await response.json();
      setGeneratedForm(formData);
    } catch (error) {
      console.error('Error generating form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!generatedForm) return;
    
    try {
      // Supabase에 폼 저장
      const response = await fetch('/api/saveForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedForm.title,
          description: generatedForm.description,
          fields: generatedForm.fields,
          type: 'counseling',
          password: password || undefined
        }),
      });
      
      const result = await response.json();
      if (result.formId) {
        // 설문 URL로 이동
        router.push(`/form/${result.formId}`);
      }
    } catch (error) {
      console.error('Error deploying form:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
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
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🎯 상담 설문 생성기
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#666', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            중·하위권 학생 진로 상담을 위한 전문 AI 설문을 생성합니다
          </p>
        </div>
        
        <div style={{ 
          background: 'rgba(240, 147, 251, 0.1)',
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
            📝 추가 요구사항 (선택사항)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 특정 학년 대상, 특정 주제 강조 등..."
            style={{
              width: '100%',
              height: 120,
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
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              background: loading ? '#ccc' : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: 12,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)'
            }}
          >
            {loading ? '🔄 생성 중...' : '✨ AI 상담 설문 생성'}
          </button>
        </div>

        {generatedForm && (
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e1e5e9'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                marginBottom: '0.5rem', 
                color: '#333',
                fontWeight: 'bold'
              }}>
                {generatedForm.title}
              </h2>
              <p style={{ 
                color: '#666', 
                fontSize: '1.1rem',
                lineHeight: 1.6,
                margin: 0
              }}>
                {generatedForm.description}
              </p>
            </div>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.3rem', 
                marginBottom: '1rem', 
                color: '#333',
                fontWeight: 'bold'
              }}>
                📋 생성된 질문들
              </h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {generatedForm.fields.map((field: any, index: number) => (
                  <div 
                    key={field.id} 
                    style={{ 
                      padding: '1rem',
                      background: 'rgba(240, 147, 251, 0.1)',
                      borderRadius: 12,
                      border: '1px solid rgba(240, 147, 251, 0.2)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        padding: '0.3rem 0.8rem',
                        borderRadius: 20,
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        marginRight: '0.8rem'
                      }}>
                        {index + 1}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#333' }}>
                        {field.label}
                      </strong>
                      <span style={{ 
                        color: '#666', 
                        marginLeft: '0.8rem',
                        fontSize: '0.9rem'
                      }}>
                        ({field.type})
                        {field.required && ' *'}
                      </span>
                    </div>
                    {field.options && (
                      <div style={{ 
                        marginLeft: '2rem', 
                        color: '#888',
                        fontSize: '0.9rem'
                      }}>
                        옵션: {field.options.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ 
              background: 'rgba(240, 147, 251, 0.1)',
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
              onClick={handleDeploy}
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
              🚀 상담 설문 배포하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
