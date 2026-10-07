import type { Slide, SlideType, ImageLayout } from './types';

const BASE =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

interface GenerateOptions {
  slideCount?: number;
  tone?: string;
}

export async function generateCardNews(
  apiKey: string,
  source: string,
  options: GenerateOptions = {}
): Promise<Slide[]> {
  const { slideCount = 6, tone = '친근하고 정보성 있게' } = options;

  const prompt = `
당신은 인스타그램 카드뉴스 콘텐츠 전문가입니다.
아래 소스를 분석하여 ${slideCount}장짜리 카드뉴스를 만드세요.

소스:
"""
${source.slice(0, 8000)}
"""

규칙:
1. 첫 슬라이드는 반드시 type="cover" (후킹 문구)
2. 마지막 슬라이드는 반드시 type="cta" (행동 유도)
3. 중간은 "point", "data", "quote" 중 적절히 선택
4. headline은 15자 이내, body는 40자 이내
5. 톤: ${tone}
6. 각 슬라이드에 어울리는 영어 이미지 프롬프트 생성
   - 반드시 "no text, no watermark, minimal, clean, high quality" 포함
7. imageLayout 규칙:
   - cover → "full-bleed"
   - data / quote → "none"
   - point → "top-image" 또는 "split"

반드시 아래 JSON 스키마로만 응답:
{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "headline": "string",
      "body": "string",
      "highlight": "string (data 타입이면 큰 숫자/키워드, 아니면 빈 문자열)",
      "imagePrompt": "string (영어)",
      "imageLayout": "full-bleed" | "top-image" | "split" | "none"
    }
  ]
}
`.trim();

  const res = await fetch(`${BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.9,
      },
    }),
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

export async function expandKeyword(apiKey: string, keyword: string): Promise<string> {
  const prompt = `"${keyword}" 주제로 인스타 카드뉴스에 쓸 400~600자 분량의 정보성 글을 작성해줘.
통계, 대상, 혜택, 신청 방법을 포함하고 과장 없이 사실 위주로. 마크다운 형식으로.`;

  const res = await fetch(`${BASE}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini 오류 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function fetchBlogContent(url: string): Promise<{ text: string; images: string[] }> {
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