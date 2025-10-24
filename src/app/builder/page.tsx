"use client";
import { useState } from 'react';
import { DynamicForm } from '@/components/DynamicForm';

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('상담 설문: 학습 고민, 스트레스 원인, 지원 희망');
  const [schema, setSchema] = useState<any | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      // Google Gemini API 직접 호출
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDnP1uDj3iHsaNIBF-tLaV42nvFGxkoBMY', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `한국어로 설문지를 만들어주세요. 다음 형식의 JSON만 반환해주세요:

{
  "title": "설문 제목",
  "description": "설문 설명",
  "questions": [
    {
      "id": "q1",
      "label": "질문 내용",
      "type": "text|textarea|radio|checkbox|select|number|email",
      "required": true,
      "options": ["선택지1", "선택지2"] // radio, checkbox, select일 때만
    }
  ]
}

요청사항: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!responseText) {
        throw new Error('No response from API');
      }

      // JSON 파싱
      const clean = (text: string) => {
        const fenced = text.match(/```json\n([\s\S]*?)\n```/i);
        if (fenced) return fenced[1];
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) return text.slice(start, end + 1);
        return text.trim();
      };

      const cleanedText = clean(responseText);
      const parsed = JSON.parse(cleanedText);

      // 질문 정규화
      if (Array.isArray(parsed.questions)) {
        parsed.questions = parsed.questions.map((q: any, idx: number) => ({
          id: q.id || `q_${idx + 1}`,
          label: q.label || `문항 ${idx + 1}`,
          type: q.type || 'text',
          required: Boolean(q.required),
          options: Array.isArray(q.options) ? q.options : undefined,
        }));
      }

      setSchema(parsed);
    } catch (error) {
      console.error('Error generating form:', error);
      // 오류 시 프롬프트 기반 간단한 설문 생성
      const simpleQuestions = [];
      const promptText = String(prompt);
      
      if (promptText.includes('학생') || promptText.includes('교육') || promptText.includes('학습')) {
        simpleQuestions.push(
          { id: 'grade', label: '학년', type: 'select', required: true, options: ['1학년', '2학년', '3학년'] },
          { id: 'subject', label: '가장 관심 있는 과목', type: 'text', required: true },
          { id: 'difficulty', label: '학습 난이도', type: 'radio', required: true, options: ['쉬움', '보통', '어려움'] },
          { id: 'stress', label: '주요 스트레스 요인', type: 'checkbox', required: false, options: ['성적', '친구관계', '가족', '미래진로'] },
          { id: 'support', label: '필요한 지원', type: 'textarea', required: false }
        );
      } else if (promptText.includes('만족도') || promptText.includes('평가') || promptText.includes('후기')) {
        simpleQuestions.push(
          { id: 'satisfaction', label: '전체적인 만족도', type: 'radio', required: true, options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] },
          { id: 'strength', label: '좋았던 점', type: 'textarea', required: false },
          { id: 'improvement', label: '개선이 필요한 점', type: 'textarea', required: false },
          { id: 'recommend', label: '다른 사람에게 추천하시겠습니까?', type: 'radio', required: true, options: ['매우 추천', '추천', '보통', '비추천'] }
        );
      } else if (promptText.includes('상담') || promptText.includes('고민') || promptText.includes('심리')) {
        simpleQuestions.push(
          { id: 'name', label: '이름', type: 'text', required: true },
          { id: 'age', label: '나이', type: 'number', required: true },
          { id: 'concern', label: '주요 고민사항', type: 'textarea', required: true },
          { id: 'duration', label: '고민 기간', type: 'select', required: true, options: ['1개월 미만', '1-3개월', '3-6개월', '6개월 이상'] },
          { id: 'support_type', label: '원하는 지원 유형', type: 'checkbox', required: false, options: ['개별 상담', '그룹 상담', '전화 상담', '온라인 상담'] },
          { id: 'additional', label: '추가 의견', type: 'textarea', required: false }
        );
      } else {
        // 일반적인 설문
        simpleQuestions.push(
          { id: 'name', label: '이름', type: 'text', required: true },
          { id: 'email', label: '이메일', type: 'email', required: false },
          { id: 'opinion', label: '의견을 작성해 주세요', type: 'textarea', required: true },
          { id: 'rating', label: '전체적인 평가', type: 'radio', required: true, options: ['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨'] }
        );
      }
      
      const fallbackSchema = {
        title: promptText.includes('학생') ? '학생 상담 설문' : 
               promptText.includes('만족도') ? '만족도 조사' :
               promptText.includes('상담') ? '상담 신청서' : 'AI 설문',
        description: `요청하신 내용을 바탕으로 생성된 설문입니다: ${promptText}`,
        questions: simpleQuestions
      };
      setSchema(fallbackSchema);
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


