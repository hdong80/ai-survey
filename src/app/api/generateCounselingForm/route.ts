import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const counselingScript = `
    중·하위권 학생 진로 프로그램 개발을 위한 교사-학생 심층 인터뷰 문항

    1. 자기 탐색 및 흥미 (성적 외 강점 찾기)
    - 학교 공부는 잠깐 잊어보고. 너 그냥 '이거 할 때 시간 가는 줄 모르겠다' 싶은 거 있어?
    - 네가 생각할 때, 너의 제일 큰 장점은 뭐야?
    - 반대로, '아무리 해도 이건 나랑 진짜 안 맞는다' 싶은 활동이나 분야는 뭐야?
    - 혹시 '와, 저렇게 살고 싶다' 하고 부러웠던 어른이나 유튜버, 연예인이 있어?

    2. 진로 장벽 및 현실 인식 (어려움 공감하기)
    - 진로를 생각하면 솔직히 어떤 기분이 제일 먼저 들어?
    - 진로를 정해야겠다고 생각은 하는데, 막상 딱 멈추게 되는 이유가 뭐야?
    - 솔직하게, '내 성적'이 진로를 찾는 데 얼마나 영향을 미치는 것 같아?
    - 진로 정보를 찾다가 '아... 이건 다 공부 잘하는 애들 얘기네' 하고 그냥 창을 닫아버린 경험이 있어?

    3. 진학 및 '취업' 경로 탐색 (새로운 대안 제시)
    - 대학 가는 거에 대해서는 어떻게 생각해?
    - 만약 대학을 가고 싶다면, 그 이유가 '공부' 때문이야, 아니면 '취업'이나 '사회적 인식' 때문이야?
    - 전문대학이나 폴리텍대학처럼 기술을 확실하게 배워서 바로 취업하는 길에 대해선 어떻게 생각해?
    - 요즘엔 '먼저 취업하고 나중에 대학 가는(선취업 후학습)' 방법도 있거든. 혹시 '일단 빨리 돈부터 벌고 싶다'는 생각 해본 적 있어?

    4. 학교 프로그램 경험 및 요구 (실질적 니즈 파악)
    - 지금까지 학교에서 했던 진로 활동 중에, 솔직히 '이건 진짜 시간 아까웠다' 싶은 거 있어?
    - 반대로 '어? 이건 의외로 괜찮았네' 싶은 건 뭐였어?
    - 만약에 학교에서 너를 위한 프로그램을 딱 하나 만들어 줄 수 있다면, 뭐가 제일 필요해?
    - 특히 '졸업생 멘토링'을 한다면 말이야. '공부 잘해서 명문대 간 선배'랑, '성적은 평범했지만 지금 자기가 좋아하는 일 하면서 잘 먹고사는 선배' 중에, 넌 솔직히 누구 얘기가 더 듣고 싶어?

    5. 정보 접근성 및 졸업생 진로
    - 진로 정보는 주로 어디서 찾아봐?
    - 그렇게 찾은 정보가 너한테 진짜 '현실적으로' 도움이 되는 정보였어?
    - 우리 학교 졸업한 선배들, 지금 어디서 뭐 하고 사는지 혹시 알아?
    - 만약 '우리 학교 몇 년 전 졸업생 중에 너랑 성적 비슷했던 A 선배는 지금 OOO이란 회사에서 XX 일 하고 있다' 이런 졸업생 실제 진로 데이터를 학교에서 보여준다면, 너의 진로 선택에 도움이 될까?

    6. 마무리 (정리 및 추가 의견)
    - 오늘 나눈 얘기 중에서 '어? 이런 것도 있었네?' 하고 새롭게 알게 된 게 있어?
    - 마지막으로, 정말 솔직하게. '중·하위권 학생들을 위해서 학교가 이건 정말 안 했으면 좋겠다' 하는 거, 그리고 '이건 꼭 해줬으면 좋겠다' 하는 거 딱 하나씩만 말해줄 수 있어?
    `;

    const result = await model.generateContent(`
      위의 상담 스크립트를 기반으로 온라인 설문 폼을 만들어주세요.
      각 질문을 적절한 입력 타입(text, textarea, radio, checkbox, select)으로 변환하고,
      학생들이 쉽게 답할 수 있도록 옵션을 제공해주세요.
      
      JSON 형태로 반환해주세요:
      {
        "title": "중·하위권 학생 진로 상담 설문",
        "description": "학생들의 진로 탐색과 학교 프로그램 개선을 위한 설문입니다.",
        "fields": [
          {
            "id": "field_id",
            "label": "질문 내용",
            "type": "text|textarea|radio|checkbox|select",
            "required": true/false,
            "options": ["옵션1", "옵션2"] // radio, checkbox, select일 때만
          }
        ]
      }
      
      ${prompt ? `추가 요구사항: ${prompt}` : ''}
    `);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;

    const formData = JSON.parse(jsonString);

    return NextResponse.json(formData);
  } catch (error) {
    console.error('Error generating counseling form:', error);
    return NextResponse.json({ error: 'Failed to generate counseling form' }, { status: 500 });
  }
}



