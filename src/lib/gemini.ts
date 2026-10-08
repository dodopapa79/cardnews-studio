import type { Slide, BackgroundConfig, TextElementConfig, TextAnimation } from './types';
import { DEFAULT_BACKGROUND, createDefaultText } from './types';

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
  backgroundDefaults?: Partial<BackgroundConfig>;
  headlineDefaults?: Partial<TextElementConfig>;
  bodyDefaults?: Partial<TextElementConfig>;
  labelDefaults?: Partial<TextElementConfig>;
  highlightDefaults?: Partial<TextElementConfig>;
  footerDefaults?: Partial<TextElementConfig>;
}

/**
 * 정보형 카드뉴스 스토리텔링 구조 (6장)
 * 1. HOOK — 관심 끌기
 * 2. WHY — 왜 봐야 하는지
 * 3. KEY INFORMATION — 가장 중요한 정보
 * 4. DETAIL — 헷갈리는 부분 정리
 * 5. ACTION — 독자가 실제로 할 일
 * 6. CTA — 마지막 행동 유도
 */
export async function generateCardNews(
  apiKey: string,
  source: string,
  options: GenerateOptions = {}
): Promise<Slide[]> {
  const {
    slideCount = 6,
    tone = '친근하고 정보성 있게',
    topic = '',
    backgroundDefaults,
    headlineDefaults,
    bodyDefaults,
    labelDefaults,
    highlightDefaults,
    footerDefaults,
  } = options;

  const prompt = `
당신은 인스타그램 카드뉴스 콘텐츠 전문가입니다.
아래 소스를 분석하여 ${slideCount}장짜리 정보형 카드뉴스를 만드세요.

${topic ? `주제: ${topic}` : ''}

소스:
"""
${source.slice(0, 8000)}
"""

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 카드뉴스 스토리텔링 구조 (반드시 지킬 것)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

정보형 카드뉴스는 다음 6단계 구조가 가장 안정적입니다.
${slideCount === 6 ? '' : `(${slideCount}장으로 조정하여 아래 구조의 핵심을 유지하세요)`}

**1장 — HOOK (관심 끌기)**
- 강력한 후킹 문구로 시선을 사로잡기
- 예: "65세 이상이라면 독감 접종 날짜를 확인하세요"

**2장 — WHY (왜 봐야 하는지)**
- 독자가 이 정보를 왜 알아야 하는지
- 예: "올해 독감 무료접종은 모든 어르신이 같은 날 시작하지 않습니다"

**3장 — KEY INFORMATION (가장 중요한 정보)**
- 구체적인 숫자/일정/조건을 표 형태로
- type은 반드시 "data"
- 예: "75세 이상 10월 O일부터 / 70~74세 10월 O일부터 / 65~69세 10월 O일부터"

**4장 — DETAIL (헷갈리는 부분)**
- 독자가 자주 헷갈리는 부분 정리
- 예: "코로나19 예방접종과 같은 날 맞아도 될까요?"

**5장 — ACTION (독자가 실제로 할 일)**
- 구체적인 행동 안내
- 예: "가까운 지정 의료기관을 확인하고 방문 전 접종 가능 여부를 확인하세요"

**6장 — CTA (마지막 행동 유도)**
- type은 반드시 "cta"
- 예: "우리 부모님 접종일도 확인해보세요. 자세한 일정과 접종기관은 프로필 링크에서 확인하세요"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 슬라이드별 텍스트 규칙
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 슬라이드는 아래 5가지 텍스트를 가집니다:

1. **label** (선택, 5~15자, 영문 또는 짧은 한글)
   - 예: "FLU SHOT", "TIP", "INFO", "NOTICE", "CHECK"
   
2. **headline** (필수, 12자 이내)
   - 핵심 메시지
   
3. **body** (선택, 40자 이내)
   - 부연 설명
   
4. **highlight** (data 타입만, 큰 숫자/키워드)
   - 예: "75세 이상", "10월 15일", "300만원"
   
5. **footer** (선택)
   - 스와이프 안내용. 대부분 비워두고 6장 CTA에만 넣기

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 이미지 프롬프트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 슬라이드마다 두 가지:
1. **imagePrompt** (영어): 이미지 생성 AI용. "no text, no watermark, minimal, clean, high quality" 포함
2. **imagePromptKo** (한글): 위 프롬프트가 어떤 이미지인지 20~35자 설명

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 톤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tone}

반드시 아래 JSON 스키마로만 응답:
{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "label": "string (선택)",
      "headline": "string (12자 이내)",
      "body": "string (40자 이내)",
      "highlight": "string (data 타입만)",
      "imagePrompt": "string (영어)",
      "imagePromptKo": "string (한글 20~35자)"
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

  return parsed.slides.map((s, i) => {
    const isLast = i === parsed.slides.length - 1;
    const type = s.type || 'point';

    const background: BackgroundConfig = {
      ...DEFAULT_BACKGROUND,
      ...(backgroundDefaults || {}),
    };

    const texts: Slide['texts'] = {
      label: s.label
        ? createDefaultText(s.label, {
            ...(labelDefaults || {}),
            fontSize: 22,
            fontWeight: 700,
            x: 0.08,
            y: 0.1,
            maxWidth: 0.5,
          })
        : undefined,
      headline: s.headline
        ? createDefaultText(s.headline, {
            ...(headlineDefaults || {}),
            x: 0.08,
            y: type === 'cover' ? 0.4 : 0.35,
            maxWidth: 0.84,
            animation: 'slide-up' as TextAnimation,
          })
        : undefined,
      body: s.body
        ? createDefaultText(s.body, {
            ...(bodyDefaults || {}),
            x: 0.08,
            y: type === 'cover' ? 0.62 : 0.6,
            maxWidth: 0.84,
            animation: 'fade-in' as TextAnimation,
          })
        : undefined,
      highlight:
        type === 'data' && s.highlight
          ? createDefaultText(s.highlight, {
              ...(highlightDefaults || {}),
              fontSize: 160,
              fontWeight: 900,
              x: 0.08,
              y: 0.35,
              animation: 'zoom-in' as TextAnimation,
            })
          : undefined,
      footer: undefined,
    };

    return {
      id: `slide-${Date.now()}-${i}`,
      type,
      background,
      texts,
      imagePrompt: s.imagePrompt || '',
      imagePromptKo: s.imagePromptKo || '',
      isLast,
    };
  });
}

export async function expandKeyword(apiKey: string, keyword: string): Promise<string> {
  const prompt = `"${keyword}" 주제로 인스타 카드뉴스에 쓸 600~800자 분량의 정보성 글을 작성해줘.

다음 내용 포함:
- 이 정보가 왜 중요한지
- 구체적인 숫자·통계·혜택
- 대상자·자격 조건
- 신청 방법·절차
- 주의사항

과장 없이 사실 위주로.`;

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

export async function translatePromptToKo(
  apiKey: string,
  enPrompt: string
): Promise<string> {
  const prompt = `다음 영어 이미지 프롬프트를 한글로 짧게 설명해줘. 30자 이내로.
설명문만 출력하고 다른 말은 하지 마.

영어: "${enPrompt}"`;

  const res = await fetchWithRetry(`${BASE}?key=${apiKey}`, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  if (!res.ok) return '';
  const data = await res.json();
  return (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim();
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