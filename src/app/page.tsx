import Link from 'next/link';

export default function HomePage() {
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
            fontSize: '3.5rem', 
            marginBottom: '1rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>
            🤖 풍문 자동 설문 플랫폼
          </h1>
          <p style={{ 
            fontSize: '1.3rem', 
            color: '#666', 
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            AI가 자동으로 설문을 생성하고, 비밀번호로 보호하거나 공개로 공유할 수 있습니다
          </p>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          <Link href="/builder" style={{ 
            display: 'block', 
            padding: '2rem', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 16, 
            textDecoration: 'none', 
            color: 'white',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            border: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginRight: '1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                📝
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                AI 설문 생성기
              </h2>
            </div>
            <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
              AI가 자동으로 설문을 만들어드립니다. 어떤 내용이든 입력하면 적절한 설문 형태로 변환됩니다.
            </p>
          </Link>
          
          <Link href="/counseling" style={{ 
            display: 'block', 
            padding: '2rem', 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: 16, 
            textDecoration: 'none', 
            color: 'white',
            boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)',
            transition: 'all 0.3s ease',
            transform: 'translateY(0)',
            border: 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                marginRight: '1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🎯
              </div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>
                상담 설문 생성기
              </h2>
            </div>
            <p style={{ margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
              상담용 설문을 전문적으로 생성합니다. 학생들의 진로와 상담에 특화된 설문을 만들 수 있습니다.
            </p>
          </Link>
        </div>

        <div style={{ 
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: 16,
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '1rem', 
            color: '#333',
            fontWeight: 'bold'
          }}>
            ✨ 주요 기능
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 12 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>AI 자동 생성</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>내용을 입력하면 AI가 자동으로 설문 형태로 변환</p>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 12 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>비밀번호 보호</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>설문을 비밀번호로 보호하거나 공개로 설정</p>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 12 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>AI 분석</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>응답 결과를 AI가 분석하여 인사이트 제공</p>
            </div>
            <div style={{ padding: '1rem', background: 'white', borderRadius: 12 }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔗</div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>즉시 공유</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>생성된 설문을 바로 URL로 공유 가능</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


