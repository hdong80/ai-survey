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
      // 오류 시 지능적인 설문 생성
      const smartQuestions = [];
      const promptText = String(prompt);
      
      // 기본 정보 (항상 포함)
      smartQuestions.push(
        { id: 'student_id', label: '학번 (5자리 숫자)', type: 'text', required: true },
        { id: 'name', label: '이름 (한글)', type: 'text', required: true }
      );
      
      // 프롬프트 분석하여 맞춤 설문 생성
      if (promptText.includes('상담') || promptText.includes('고민') || promptText.includes('심리') || promptText.includes('학생')) {
        // 상담/학생 관련 설문
        smartQuestions.push(
          { 
            id: 'grade', 
            label: '학년', 
            type: 'select', 
            required: true, 
            options: ['1학년', '2학년', '3학년'] 
          },
          { 
            id: 'current_concern', 
            label: '현재 가장 큰 고민이나 걱정은 무엇인가요?', 
            type: 'radio', 
            required: true, 
            options: ['학업 성적', '진로 고민', '인간관계', '가족 문제', '기타'] 
          },
          { 
            id: 'stress_level', 
            label: '전반적인 스트레스 수준은 어느 정도인가요?', 
            type: 'radio', 
            required: true, 
            options: ['매우 높음', '높음', '보통', '낮음', '매우 낮음'] 
          },
          { 
            id: 'support_needed', 
            label: '필요한 지원이나 도움이 있다면 무엇인가요? (복수 선택 가능)', 
            type: 'checkbox', 
            required: false, 
            options: ['학습 방법 상담', '진로 상담', '심리 상담', '인간관계 상담', '기타'] 
          },
          { 
            id: 'detailed_concern', 
            label: '구체적인 고민이나 상황을 자유롭게 작성해 주세요', 
            type: 'textarea', 
            required: false 
          },
          { 
            id: 'preferred_contact', 
            label: '상담 결과를 어떻게 받고 싶으신가요?', 
            type: 'radio', 
            required: true, 
            options: ['개별 면담', '전화 상담', '온라인 상담', '문자 메시지'] 
          }
        );
      } else if (promptText.includes('만족도') || promptText.includes('평가') || promptText.includes('후기')) {
        // 만족도 조사 설문
        smartQuestions.push(
          { 
            id: 'overall_satisfaction', 
            label: '전체적인 만족도는 어떠신가요?', 
            type: 'radio', 
            required: true, 
            options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'] 
          },
          { 
            id: 'satisfaction_areas', 
            label: '만족한 영역은 무엇인가요? (복수 선택 가능)', 
            type: 'checkbox', 
            required: false, 
            options: ['내용의 질', '전문성', '친절함', '시간 배분', '시설 환경', '기타'] 
          },
          { 
            id: 'improvement_areas', 
            label: '개선이 필요한 영역은 무엇인가요? (복수 선택 가능)', 
            type: 'checkbox', 
            required: false, 
            options: ['내용의 질', '전문성', '친절함', '시간 배분', '시설 환경', '기타'] 
          },
          { 
            id: 'strengths', 
            label: '특히 좋았던 점이나 장점을 자유롭게 작성해 주세요', 
            type: 'textarea', 
            required: false 
          },
          { 
            id: 'improvements', 
            label: '개선이 필요한 점이나 아쉬웠던 점을 자유롭게 작성해 주세요', 
            type: 'textarea', 
            required: false 
          },
          { 
            id: 'recommendation', 
            label: '다른 사람에게 추천하시겠습니까?', 
            type: 'radio', 
            required: true, 
            options: ['매우 추천', '추천', '보통', '비추천', '매우 비추천'] 
          }
        );
      } else if (promptText.includes('학습') || promptText.includes('교육')) {
        // 학습/교육 관련 설문
        smartQuestions.push(
          { 
            id: 'grade', 
            label: '학년', 
            type: 'select', 
            required: true, 
            options: ['1학년', '2학년', '3학년'] 
          },
          { 
            id: 'favorite_subject', 
            label: '가장 관심 있는 과목은 무엇인가요?', 
            type: 'text', 
            required: true 
          },
          { 
            id: 'learning_style', 
            label: '자신의 학습 스타일은 어떤 편인가요?', 
            type: 'radio', 
            required: true, 
            options: ['시각적 학습 (그림, 차트, 영상)', '청각적 학습 (강의, 토론)', '체험적 학습 (실습, 실험)', '독서 중심 학습'] 
          },
          { 
            id: 'difficulty_subjects', 
            label: '어려움을 느끼는 과목은 무엇인가요? (복수 선택 가능)', 
            type: 'checkbox', 
            required: false, 
            options: ['국어', '영어', '수학', '사회', '과학', '기타'] 
          },
          { 
            id: 'study_time', 
            label: '하루 평균 공부 시간은 얼마나 되나요?', 
            type: 'radio', 
            required: true, 
            options: ['1시간 미만', '1-2시간', '2-3시간', '3-4시간', '4시간 이상'] 
          },
          { 
            id: 'learning_goals', 
            label: '현재 가장 중요하게 생각하는 학습 목표는 무엇인가요?', 
            type: 'textarea', 
            required: true 
          }
        );
      } else {
        // 일반적인 설문
        smartQuestions.push(
          { 
            id: 'participation_reason', 
            label: '이 설문에 참여하게 된 이유는 무엇인가요?', 
            type: 'radio', 
            required: true, 
            options: ['관심 있어서', '요청받아서', '의무적으로', '기타'] 
          },
          { 
            id: 'main_opinion', 
            label: '주요 의견이나 생각을 자유롭게 작성해 주세요', 
            type: 'textarea', 
            required: true 
          },
          { 
            id: 'rating', 
            label: '전체적인 평가는 어떠신가요?', 
            type: 'radio', 
            required: true, 
            options: ['매우 좋음', '좋음', '보통', '나쁨', '매우 나쁨'] 
          },
          { 
            id: 'additional_comments', 
            label: '추가 의견이나 제안사항이 있다면 작성해 주세요', 
            type: 'textarea', 
            required: false 
          }
        );
      }
      
      const fallbackSchema = {
        title: promptText.includes('상담') ? '학생 상담 신청서' : 
               promptText.includes('만족도') ? '만족도 조사' :
               promptText.includes('학습') ? '학습 현황 조사' : '설문 조사',
        description: `요청하신 내용을 바탕으로 생성된 설문입니다: ${promptText}`,
        questions: smartQuestions
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


