"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface AnalysisData {
  summary: string;
  insights: string[];
  statistics: Record<string, any>;
  recommendations: string[];
  detailedAnalysis?: {
    긍정적피드백?: string;
    개선필요영역?: string;
    특이사항?: string;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const formId = params.id as string;
  
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResponses, setTotalResponses] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [password, setPassword] = useState('');
  const [needPassword, setNeedPassword] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/analyzeResponses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formId, password: password || undefined }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          if (response.status === 401) {
            setNeedPassword(true);
          }
          throw new Error(data.error || '분석 실패');
        }
        
        setAnalysis(data.analysis);
        setTotalResponses(data.totalResponses);
        setFormTitle(data.formTitle);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (formId) {
      fetchAnalysis();
    }
  }, [formId, password]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>분석 중...</h2>
        <p>AI가 응답을 분석하고 있습니다.</p>
      </div>
    );
  }

  if (needPassword) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <h2>비밀번호가 필요합니다</h2>
        <p>설문 작성자가 비밀번호로 보호했습니다. 비밀번호를 입력하세요.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          style={{ width: '100%', padding: 12, marginTop: 12 }}
        />
        <button
          onClick={() => setLoading(true)}
          style={{ marginTop: 12, padding: '10px 20px' }}
        >
          확인
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>오류 발생</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h2>분석 데이터 없음</h2>
        <p>분석할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>📊 설문 결과 분석</h1>
        <h2 style={{ fontSize: '1.5rem', color: '#666', marginBottom: 16 }}>{formTitle}</h2>
        <div style={{ 
          background: '#f0f8ff', 
          padding: 16, 
          borderRadius: 8, 
          border: '1px solid #0070f3' 
        }}>
          <strong>총 응답 수: {totalResponses}개</strong>
        </div>
      </div>

      {/* 요약 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#333' }}>📋 전체 요약</h3>
        <div style={{ 
          background: '#f9f9f9', 
          padding: 20, 
          borderRadius: 8, 
          borderLeft: '4px solid #0070f3',
          fontSize: '1.1rem',
          lineHeight: 1.6
        }}>
          {analysis.summary}
        </div>
      </div>

      {/* 주요 인사이트 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#333' }}>💡 주요 인사이트</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {analysis.insights.map((insight, index) => (
            <div key={index} style={{ 
              background: '#fff3cd', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #ffeaa7',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <span style={{ 
                background: '#f39c12', 
                color: 'white', 
                borderRadius: '50%', 
                width: 24, 
                height: 24, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12,
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{insight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#333' }}>📈 통계</h3>
        <div style={{ 
          background: '#e8f5e8', 
          padding: 20, 
          borderRadius: 8, 
          border: '1px solid #4caf50'
        }}>
          {Object.entries(analysis.statistics).map(([key, value]) => (
            <div key={key} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 8,
              fontSize: '1.1rem'
            }}>
              <strong>{key}:</strong>
              <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 상세 분석 */}
      {analysis.detailedAnalysis && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#333' }}>🔍 상세 분석</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {analysis.detailedAnalysis.긍정적피드백 && (
              <div style={{ 
                background: '#d4edda', 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid #c3e6cb'
              }}>
                <h4 style={{ color: '#155724', marginBottom: 8 }}>✅ 긍정적 피드백</h4>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{analysis.detailedAnalysis.긍정적피드백}</p>
              </div>
            )}
            {analysis.detailedAnalysis.개선필요영역 && (
              <div style={{ 
                background: '#f8d7da', 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid #f5c6cb'
              }}>
                <h4 style={{ color: '#721c24', marginBottom: 8 }}>⚠️ 개선 필요 영역</h4>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{analysis.detailedAnalysis.개선필요영역}</p>
              </div>
            )}
            {analysis.detailedAnalysis.특이사항 && (
              <div style={{ 
                background: '#d1ecf1', 
                padding: 16, 
                borderRadius: 8, 
                border: '1px solid #bee5eb'
              }}>
                <h4 style={{ color: '#0c5460', marginBottom: 8 }}>🔍 특이사항</h4>
                <p style={{ margin: 0, lineHeight: 1.5 }}>{analysis.detailedAnalysis.특이사항}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 개선 제안 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: 16, color: '#333' }}>🚀 개선 제안</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} style={{ 
              background: '#e3f2fd', 
              padding: 16, 
              borderRadius: 8, 
              border: '1px solid #bbdefb',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              <span style={{ 
                background: '#2196f3', 
                color: 'white', 
                borderRadius: '50%', 
                width: 24, 
                height: 24, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 12,
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                💡
              </span>
              <span style={{ flex: 1, lineHeight: 1.5 }}>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 새로고침 버튼 */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          🔄 분석 새로고침
        </button>
      </div>
    </div>
  );
}