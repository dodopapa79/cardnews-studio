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
  /** 블로그 URL (있으면 CTA에 반영) */
  blogUrl?: string;
  /** 블로그 이름 또는 채널명 */
  blogName?: string;
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

7. **point-box** — 강조 요약 박스
   - boxLabel: "POINT" | "TIP" | "NOTE" | "CHECK" | "블로그에서"
   - text: 핵심 요약 (60자 이내)
   - 슬라이드당 0~1개

8. **divider** — 얇은 구분선
`;

// ─────────────────────────────────────────────
// 🆕 카드뉴스 → 블로그 유입 전략
// ─────────────────────────────────────────────
const CTA_STRATEGY = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 카드뉴스의 목적 = "블로그로 유입"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**매우 중요**: 이 카드뉴스는 정보를 다 주는 게 아니라,
**"궁금증을 남겨서 블로그로 클릭하게 만드는 것"**이 목적입니다.

📌 원칙:
1. **카드뉴스 = 맛보기 / 블로그 = 풀코스**
   - 카드뉴스에 모든 정보를 담지 마세요
   - "이건 블로그에서 자세히" 라는 여지를 남기세요

2. **각 카드에 "미끼"를 심으세요**
   - 예: "자세한 조건은 블로그에서"
   - 예: "실제 신청 링크는 블로그에 정리해뒀어요"
   - 예: "헷갈리는 케이스 3가지는 블로그에서 다뤘어요"
   - 예: "체크리스트는 블로그에서 다운로드"

3. **블로그에만 있는 "특별한 것"을 암시하세요**
   - 계산 예시, 체크리스트, 신청 링크, 표, 실제 후기, 비교표 등
   - 이건 카드뉴스에 넣지 말고, **"블로그에 있어요"** 로 언급만

4. **CTA 슬라이드(마지막)는 강하게**
   - "지금 블로그에서 확인하세요"
   - "프로필 링크 클릭" (인스타라면)
   - "전체 내용은 블로그에 정리했습니다"

5. **금지 사항**
   - ❌ 모든 정보를 카드뉴스에 다 담기
   - ❌ "저장하세요" 같은 약한 CTA만 쓰기
   - ❌ 블로그 언급 없이 끝내기
`;

const SLIDE_STRUCTURE = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 6장 스토리텔링 구조 (블로그 유입형)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1장 — HOOK (강한 문제 제기)
   → "이거 모르면 손해" 같은 호기심 자극
   → 블로그 예고: "핵심만 정리했어요"

2장 — WHY (왜 중요한가)
   → 숫자/혜택으로 임팩트
   → 블로그 예고: "자세한 조건은 블로그에"

3장 — KEY INFO (핵심만 딱)
   → 카드뉴스에는 "핵심 1~3개"만
   → 블로그 예고: "전체 리스트는 블로그에 정리"
   → point-box에 "블로그에서 더 보기" 명시

4장 — 헷갈리는 부분 (미끼)
   → "많이 헷갈려 하는 3가지"
   → 블로그 예고: "케이스별 정리는 블로그에서"

5장 — 주의사항 / 실제 적용
   → 짧게 요약
   → 블로그 예고: "체크리스트는 블로그에"

6장 — CTA (강한 클릭 유도)
   → headline: "지금 블로그에서 확인하세요"
   → body: 블로그에만 있는 것 나열
   → point-box: "프로필 링크 or 블로그 주소"
`;

const BLOCK_DECISION = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 블록 선택 기준
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- **숫자/통계가 핵심** → highlight + body
- **3~5개 항목 나열** → list
- **단계별 진행** → numbered-card
- **블로그 유도 문구** → point-box (boxLabel: "블로그에서")
- **단순 메시지** → headline + body

**슬라이드당 블록 개수**: 2~5개

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 위치(y) 자동 배치
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 블록의 y 좌표(0~1):
- 0.1 ~ 0.2 → 상단 (label)
- 0.25 ~ 0.4 → 중상단 (headline, highlight)
- 0.45 ~ 0.65 → 중앙 (body, list)
- 0.7 ~ 0.9 → 하단 (point-box)

**겹치지 않도록 위에서 아래로 순차 배치.**
`;

export async function generateCardNews(
  apiKey: string,
  source: string,
  options: GenerateOptions = {}
): Promise<Slide[]> {
  const {
    slideCount = 6,
    tone = '친근하고 정보성 있게, 하지만 블로그로 유입되도록 궁금증을 남기며',
    topic = '',
    preset = FALLBACK_PRESET,
    blogUrl = '',
    blogName = '',
  } = options;

  const blogContext = blogUrl || blogName
    ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 블로그 정보 (CTA에 반영)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${blogName ? `블로그 이름: ${blogName}` : ''}
${blogUrl ? `블로그 주소: ${blogUrl}` : ''}

**마지막 카드(6장)의 point-box에 위 블로그 정보를 활용해 "여기서 확인하세요" 유도 문구를 넣으세요.**
`
    : '';

  const prompt = `
당신은 인스타그램 카드뉴스 + 블로그 유입 전문가입니다.
아래 소스를 분석하여 ${slideCount}장짜리 카드뉴스를 만드세요.

**핵심 목표**: 카드뉴스로 정보를 "다 주는 것"이 아니라,
**"블로그에 가서 더 보고 싶게 만드는 것"** 입니다.

${topic ? `주제: ${topic}` : ''}

소스:
"""
${source.slice(0, 8000)}
"""

${SLIDE_STRUCTURE}

${BLOCK_GUIDE}

${BLOCK_DECISION}

${CTA_STRATEGY}

${blogContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 이미지 프롬프트
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

각 슬라이드마다:
1. **imagePrompt** (영어): "no text, no watermark, minimal, clean, high quality" 포함
2. **imagePromptKo** (한글): 20~35자 설명

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 톤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${tone}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 응답 형식 (JSON만)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "slides": [
    {
      "type": "cover" | "point" | "data" | "quote" | "cta",
      "blocks": [
        {
          "type": "label" | "headline" | "body" | "highlight" | "list" | "numbered-card" | "point-box" | "divider",
          "y": 0.1,
          "content": {
            "text": "string",
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
  const prompt = `"${keyword}" 주제로 인스타 카드뉴스 + 블로그 유입용 정보성 글을 작성해줘.

**중요**: 이 글은 카드뉴스의 "소스"가 됩니다.
카드뉴스는 정보를 다 주지 않고 블로그로 유입시키는 게 목적이므로,
아래 내용을 포함하되 **"블로그에서 더 자세히 다룰 여지"**를 남겨주세요.

다음 내용 포함:
- 이 정보가 왜 중요한지
- 구체적인 숫자·통계·혜택 (핵심만)
- 대상자·자격 조건 (카드뉴스엔 일부만)
- 신청 방법·절차 (카드뉴스엔 요약만)
- 주의사항
- **"더 자세한 내용", "체크리스트", "실제 예시"** 등 블로그에 있을 법한 것들

600~800자 분량. 과장 없이 사실 위주로.`;

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