import type { Slide, SlideType, Preset, Block, BlockType, BlockItem, TextAnimation } from './types';
import { STYLE_PRESETS } from './presets';
import { makeBlockId } from './blocks';

const FALLBACK_PRESET = STYLE_PRESETS[0];

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
  preset?: Preset;
}

// ─────────────────────────────────────────────
// AI 프롬프트 (블록 구조까지 생성)
// ─────────────────────────────────────────────
const BLOCK_GUIDE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 블록 종류 (콘텐츠를 표현하는 최소 단위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **label** — 카테고리/태그 (짧은 영문, 5~15자)
   - 예: "FLU SHOT", "TIP", "INFO", "NOTICE"
   - 슬라이드당 0~1개

2. **headline** — 큰 제목 (필수, 12자 이내)
   - 슬라이드당 1개 필수

3. **body** — 본문 설명 (선택, 40자 이내)
   - headline 아래 부연

4. **highlight** — 큰 숫자/키워드 (선택)
   - 슬라이드당 0~1개
   - 예: "75세 이상", "10월 15일", "300만원"

5. **list** — 항목 3~5개 나열 (체크/번호 없음)
   - items: [{ title, desc? }, ...]
   - "여러 정보를 나열"할 때

6. **numbered-card** — 01/02/03 카드 박스 (단계별)
   - items: [{ number, title, desc? }, ...]
   - "3단계", "5가지 방법"처럼 순서/개수가 있을 때

7. **point-box** — 강조 요약 박스 (파란 박스)
   - boxLabel: "POINT" | "TIP" | "NOTE"
   - text: 핵심 요약 (60자 이내)
   - 슬라이드당 0~1개

8. **divider** — 얇은 구분선
   - 섹션 구분용
   - 슬라이드당 0~1개
`;

const SLIDE_STRUCTURE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 6장 스토리텔링 구조
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1장 — HOOK (관심 끌기)
2장 — WHY (왜 봐야 하는지)
3장 — KEY INFO (핵심 정보, 숫자/표)
4장 — DETAIL (헷갈리는 부분)
5장 — ACTION (실제 할 일)
6장 — CTA (마지막 행동 유도)
`;

const BLOCK_DECISION = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 블록 선택 기준 (매우 중요)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**콘텐츠 성격에 맞는 블록을 AI가 판단해서 선택하세요.**

- **숫자/통계가 핵심** → highlight + body
- **3~5개 항목 나열** → list (번호 없이)
- **단계별 진행 (1단계, 2단계, 3단계)** → numbered-card
- **핵심 요약이 필요** → point-box
- **여러 정보 종합** → headline + list + point-box
- **단순 메시지** → headline + body

**슬라이드당 블록 개수**: 2~5개 (너무 많지 않게)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 위치(y) 자동 배치
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 블록의 y 좌표(0~1)를 지정하세요:
- 0.1 ~ 0.2 → 상단 (label, 작은 요소)
- 0.25 ~ 0.4 → 중상단 (headline, highlight)
- 0.45 ~ 0.65 → 중앙 (body, list)
- 0.7 ~ 0.9 → 하단 (point-box)

**겹치지 않도록 위에서 아래로 순차 배치하세요.**
`;

export async function generateCardNews(
  apiKey: string,
  source: string,
  options: GenerateOptions = {}
): Promise<Slide[]> {
  const {
    slideCount = 6,
    tone = '친근하고 정보성 있게',
    topic = '',
    preset = FALLBACK_PRESET,
  } = options;

  const prompt = `
당신은 인스타그램 카드뉴스 콘텐츠 전문가입니다.
아래 소스를 분석하여 ${slideCount}장짜리 정보형 카드뉴스를 만드세요.

${topic ? `주제: ${topic}` : ''}

소스:
"""
${source.slice(0, 8000)}
"""

${SLIDE_STRUCTURE}

${BLOCK_GUIDE}

${BLOCK_DECISION}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 이미지 프롬프트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 슬라이드마다:
1. **imagePrompt** (영어): 이미지 생성 AI용. "no text, no watermark, minimal, clean, high quality" 포함
2. **imagePromptKo** (한글): 20~35자 설명

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 톤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tone}

반드시 아래 JSON 스키마로만 응답:
{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "blocks": [
        {
          "type": "label" | "headline" | "body" | "highlight" | "list" | "numbered-card" | "point-box" | "divider",
          "y": 0.1,
          "content": {
            "text": "string (label, headline, body, highlight, point-box용)",
            "boxLabel": "string (point-box 전용)",
            "items": [
              { "number": "01", "title": "string", "desc": "string" }
            ]
          }
        }
      ],
      "imagePrompt": "string",
      "imagePromptKo": "string"
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
  const VALID_TYPES: SlideType[] = ['cover', 'point', 'data', 'quote', 'cta'];
  const VALID_BLOCK_TYPES: BlockType[] = [
    'headline',
    'body',
    'label',
    'highlight',
    'list',
    'numbered-card',
    'point-box',
    'divider',
  ];

  return parsed.slides.map((s, i) => {
    const isLast = i === parsed.slides.length - 1;
    const rawType: SlideType = VALID_TYPES.includes(s.type) ? s.type : 'point';
    const type: SlideType =
      i === 0 && rawType !== 'data' ? 'cover' : isLast ? 'cta' : rawType;

    // 블록 변환
    const blocks: Block[] = (s.blocks || [])
      .filter((b: any) => b && VALID_BLOCK_TYPES.includes(b.type))
      .map((b: any) => {
        const blockType: BlockType = b.type;
        const animMap: Record<BlockType, TextAnimation> = {
          label: 'fade-in',
          headline: 'slide-up',
          body: 'fade-in',
          highlight: 'zoom-in',
          list: 'slide-up',
          'numbered-card': 'slide-up',
          'point-box': 'fade-in',
          divider: 'none',
        };
        const items: BlockItem[] | undefined =
          b.content?.items && Array.isArray(b.content.items)
            ? b.content.items.map((it: any) => ({
                number: it.number ? String(it.number) : undefined,
                title: String(it.title || ''),
                desc: it.desc ? String(it.desc) : undefined,
              }))
            : undefined;

        return {
          id: makeBlockId(),
          type: blockType,
          y: typeof b.y === 'number' ? Math.max(0, Math.min(1, b.y)) : 0.5,
          content: {
            text: b.content?.text ? String(b.content.text) : undefined,
            boxLabel: b.content?.boxLabel ? String(b.content.boxLabel) : undefined,
            items,
          },
          animation: animMap[blockType],
          visible: true,
        };
      });

    // 최소한 headline은 있어야 함
    if (!blocks.some((b) => b.type === 'headline')) {
      blocks.unshift({
        id: makeBlockId(),
        type: 'headline',
        y: 0.3,
        content: { text: s.headline || '제목' },
        animation: 'slide-up',
        visible: true,
      });
    }

    return {
      id: `slide-${Date.now()}-${i}`,
      type,
      background: { ...preset.background } as any,
      blocks,
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