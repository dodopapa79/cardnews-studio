import type { Slide, SlideType, ImageLayout } from './types';

const BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

async function fetchWithRetry(
  url: string,
  body: any,
  maxRetries = 3
): Promise<Response> {
  let lastErr: any = null;
  for (let i = 0; i < maxRetries; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 429 || res.status === 503 || res.status >= 500) {
      lastErr = res;
      await new Promise((r) => setTimeout(r, (i + 1) * 2000));
      continue;
    }
    return res;
  }
  return lastErr;
}

interface GenerateOptions {
  slideCount?: number;
  tone?: string;
  topic?: string;
}

export async function generateCardNews(
  apiKey: string,
  source: string,
  options: GenerateOptions = {}
): Promise<Slide[]> {
  const { slideCount = 6, tone = '친근하고 정보성 있게', topic = '' } = options;

  const structure = buildStructure(slideCount);

  const prompt = `
당신은 인스타그램 카드뉴스 콘텐츠 전문가입니다.
아래 소스를 분석하여 ${slideCount}장짜리 카드뉴스를 만드세요.

${topic ? `주제: ${topic}` : ''}

소스:
"""
${source.slice(0, 8000)}
"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 카드뉴스 스토리텔링 구조 (반드시 지킬 것)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${structure}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 작성 규칙
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **첫 슬라이드(cover)**: 강력한 훅. "이거 모르면 손해", "충격", "꼭 봐야" 같은 호기심 유발 표현
   - 예시: "월 10만원, 안 받으면 손해", "이거 신청 안 하면 후회합니다"

2. **중간 슬라이드(point/data/quote)**: 구체적인 정보. 
   - 숫자, 통계, 사례, 대상, 혜택, 신청 방법 포함
   - 각 슬라이드는 하나의 명확한 정보 전달
   - headline은 12자 이내, body는 50자 이내

3. **마지막 슬라이드(cta)**: 명확한 행동 유도
   - "지금 바로 확인", "3분이면 신청 완료", "놓치지 마세요"

4. **말투**: ${tone}

5. **이미지 프롬프트**: 각 슬라이드마다 어울리는 영어 이미지 프롬프트
   - 반드시 포함: "no text, no watermark, minimal, clean, high quality"
   - 사람 얼굴 클로즈업 지양, 사물·추상 배경 위주

6. **imageLayout**:
   - cover → "full-bleed"
   - data / quote → "none"
   - point → "top-image" 또는 "split"

반드시 아래 JSON 스키마로만 응답:
{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "headline": "string (12자 이내)",
      "body": "string (50자 이내)",
      "highlight": "string (data 타입이면 큰 숫자/키워드)",
      "imagePrompt": "string (영어)",
      "imageLayout": "full-bleed" | "top-image" | "split" | "none"
    }
  ]
}
`.trim();

  const res = await fetchWithRetry(`${BASE}?key=${apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini 오류 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const text: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini 응답이 비어 있습니다.');

  const parsed = JSON.parse(text) as { slides: any[] };
  return parsed.slides.map((s, i) => ({
    id: `slide-${Date.now()}-${i}`,
    type: (s.type as SlideType) || 'point',
    headline: s.headline || '',
    body: s.body || '',
    highlight: s.highlight || '',
    imageUrl: '',
    imagePrompt: s.imagePrompt || '',
    imageLayout: (s.imageLayout as ImageLayout) || 'none',
  }));
}

function buildStructure(slideCount: number): string {
  if (slideCount <= 4) {
    return `
1장 (cover): 강력한 훅 — 시선 집중
2-${slideCount - 1}장: 핵심 정보 1~2개
${slideCount}장 (cta): 명확한 행동 유도
`.trim();
  }

  if (slideCount <= 6) {
    return `
1장 (cover): 강력한 훅 — "모르면 손해" 스타일
2장 (point): 왜 이 정보가 중요한가 (문제 제기)
3장 (data): 구체적인 숫자·통계·혜택
4장 (point): 대상·자격·조건 안내
5장 (point): 신청 방법·절차
6장 (cta): 지금 바로 행동하도록 유도
`.trim();
  }

  return `
1장 (cover): 강력한 훅 — 시선 집중
2장 (point): 문제 제기·공감
3장 (data): 핵심 통계·혜택
4장 (point): 대상자·자격 조건
5장 (point): 혜택 상세
6장 (point): 신청 방법 1단계
7장 (point): 신청 방법 2단계·서류
8장 (quote): 주의사항·팁
${slideCount}장 (cta): 명확한 행동 유도
`.trim();
}

export async function expandKeyword(apiKey: string, keyword: string): Promise<string> {
  const prompt = `"${keyword}" 주제로 인스타 카드뉴스에 쓸 600~800자 분량의 정보성 글을 작성해줘.

다음 내용을 반드시 포함:
- 이 정보가 왜 중요한지 (독자 관점)
- 구체적인 숫자·통계·혜택
- 대상자·자격 조건
- 신청 방법·절차
- 주의사항

과장 없이 사실 위주로, 마크다운 형식으로.`;

  const res = await fetchWithRetry(`${BASE}?key=${apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini 오류 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function fetchBlogContent(
  url: string
): Promise<{ text: string; images: string[] }> {
  const proxy = `https://r.jina.ai/${url}`;
  const res = await fetch(proxy);
  if (!res.ok) throw new Error(`블로그 로드 실패 (${res.status})`);
  const raw = await res.text();

  const images: string[] = [];
  const imgRegex = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;
  let m;
  while ((m = imgRegex.exec(raw)) !== null) images.push(m[1]);

  return { text: raw, images };
}