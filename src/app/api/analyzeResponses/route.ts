import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { formId, password } = await request.json();

    if (!formId) {
      return NextResponse.json({ error: 'Form ID is required' }, { status: 400 });
    }

    // 폼 정보 가져오기
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single();

    if (formError || !formData) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // 보호된 경우 비밀번호 확인
    const schema: any = formData.schema ?? {};
    if (schema?.protected) {
      const hash = (val: string) => crypto.createHash('sha256').update(val).digest('hex');
      if (!password || hash(password) !== schema.passwordHash) {
        return NextResponse.json({ error: 'PASSWORD_REQUIRED_OR_INVALID' }, { status: 401 });
      }
    }

    // 응답 데이터 가져오기
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*')
      .eq('form_id', formId);

    if (responsesError) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ 
        analysis: {
          summary: "아직 응답이 없습니다.",
          insights: [],
          statistics: {},
          recommendations: []
        },
        totalResponses: 0
      });
    }

    // AI 분석
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const analysisPrompt = `
      다음 설문 응답들을 분석하여 한국어로 상세한 분석 결과를 제공해주세요.
      
      설문 제목: ${formData.title}
      설문 설명: ${formData.description || '설명 없음'}
      
      응답 데이터:
      ${JSON.stringify(responses, null, 2)}
      
      다음 형식의 JSON으로 응답해주세요:
      {
        "summary": "전체적인 응답 요약 (2-3문장)",
        "insights": [
          "주요 인사이트 1",
          "주요 인사이트 2",
          "주요 인사이트 3"
        ],
        "statistics": {
          "총 응답 수": ${responses.length},
          "주요 통계": "구체적인 수치나 비율"
        },
        "recommendations": [
          "개선 제안 1",
          "개선 제안 2",
          "개선 제안 3"
        ],
        "detailedAnalysis": {
          "긍정적 피드백": "긍정적인 응답들에 대한 분석",
          "개선 필요 영역": "개선이 필요한 부분들",
          "특이사항": "특별히 주목할 만한 응답들"
        }
      }
    `;

    const result = await model.generateContent(analysisPrompt);
    const responseText = result.response.text();
    
    // JSON 파싱
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    const jsonString = jsonMatch ? jsonMatch[1] : responseText;
    
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 분석 제공
      analysis = {
        summary: `총 ${responses.length}개의 응답을 받았습니다.`,
        insights: [
          "응답 데이터가 수집되었습니다.",
          "상세한 분석을 위해 더 많은 응답이 필요할 수 있습니다."
        ],
        statistics: {
          "총 응답 수": responses.length
        },
        recommendations: [
          "더 많은 응답을 수집해보세요.",
          "구체적인 피드백을 요청해보세요."
        ]
      };
    }

    return NextResponse.json({
      analysis,
      totalResponses: responses.length,
      formTitle: formData.title
    });

  } catch (error) {
    console.error('Error analyzing responses:', error);
    return NextResponse.json({ error: 'Failed to analyze responses' }, { status: 500 });
  }
}
