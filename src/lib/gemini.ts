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
  /** 배경 설정 (프리셋에서) */
  backgroundDefaults?: Partial<BackgroundConfig>;
  /** 텍스트 스타일 (프리셋에서) */
  headlineDefaults?: Partial<TextElementConfig>;
  bodyDefaults?: Partial<TextElementConfig>;
}

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
  } = options;

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
📌 스토리텔링 구조
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${structure}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 작성 규칙
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **첫 슬라이드(cover)**: 강력한 훅. "이거 모르면 손해" 같은 호기심 유발
2. **중간 슬라이드**: 구체적 정보. 숫자·통계·혜택·대상·신청방법
3. **마지막 슬라이드(cta)**: 명확한 행동 유도
4. **말투**: ${tone}
5. **label**: 각 슬라이드에 어울리는 짧은 영문 라벨 (예: FEATURED, TIP, INFO, NEWS, HOWTO)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 이미지 프롬프트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 슬라이드마다 두 가지:
1. **imagePrompt** (영어): 이미지 생성 AI용. "no text, no watermark, minimal, clean, high quality" 포함
2. **imagePromptKo** (한글): 위 프롬프트가 어떤 이미지인지 20~35자 설명

반드시 아래 JSON 스키마로만 응답:
{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "headline": "string (12자 이내)",
      "body": "string (60자 이내)",
      "highlight": "string (data 타입만)",
      "label": "string (영문 라벨)",
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

  // 새 Slide 구조로 변환
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
            ...(headlineDefaults || {}),
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
              fontSize: 160,
              fontWeight: 900,
              color: backgroundDefaults?.color === '#ffffff' ? '#8b5cf6' : '#ffffff',
              x: 0.08,
              y: 0.35,
              animation: 'zoom-in' as TextAnimation,
            })
          : undefined,
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

function buildStructure(slideCount: number): string {
  if (slideCount <= 4) {
    return `1장 (cover): 훅 / 2-${slideCount - 1}장: 핵심 정보 / ${slideCount}장 (cta): 행동 유도`;
  }
  if (slideCount <= 6) {
    return `
1장 (cover): 강력한 훅
2장 (point): 문제 제기
3장 (data): 구체적 숫자·혜택
4장 (point): 대상·자격
5장 (point): 신청 방법
6장 (cta): 행동 유도`.trim();
  }
  return `
1장 (cover): 훅
2장 (point): 문제 제기
3장 (data): 핵심 통계
4장 (point): 대상자
5장 (point): 혜택 상세
6장 (point): 신청 1단계
7장 (point): 신청 2단계
8장 (quote): 주의사항
${slideCount}장 (cta): 행동 유도`.trim();
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