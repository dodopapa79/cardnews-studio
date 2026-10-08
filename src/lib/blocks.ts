import type { Block, BlockType, BlockItem } from './types';

let blockCounter = 0;

export function makeBlockId(): string {
  blockCounter++;
  return `block-${Date.now()}-${blockCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─────────────────────────────────────────────
// 블록 생성 헬퍼
// ─────────────────────────────────────────────
export function createHeadline(text: string, y = 0.3): Block {
  return {
    id: makeBlockId(),
    type: 'headline',
    y,
    content: { text },
    animation: 'slide-up',
    visible: true,
  };
}

export function createBody(text: string, y = 0.5): Block {
  return {
    id: makeBlockId(),
    type: 'body',
    y,
    content: { text },
    animation: 'fade-in',
    visible: true,
  };
}

export function createLabel(text: string, y = 0.1): Block {
  return {
    id: makeBlockId(),
    type: 'label',
    y,
    content: { text },
    animation: 'fade-in',
    visible: true,
  };
}

export function createHighlight(text: string, y = 0.35): Block {
  return {
    id: makeBlockId(),
    type: 'highlight',
    y,
    content: { text },
    animation: 'zoom-in',
    visible: true,
  };
}

export function createList(items: BlockItem[], y = 0.5): Block {
  return {
    id: makeBlockId(),
    type: 'list',
    y,
    content: { items },
    animation: 'slide-up',
    visible: true,
  };
}

export function createNumberedCard(items: BlockItem[], y = 0.5): Block {
  return {
    id: makeBlockId(),
    type: 'numbered-card',
    y,
    content: { items },
    animation: 'slide-up',
    visible: true,
  };
}

export function createPointBox(boxLabel: string, text: string, y = 0.8): Block {
  return {
    id: makeBlockId(),
    type: 'point-box',
    y,
    content: { boxLabel, text },
    animation: 'fade-in',
    visible: true,
  };
}

export function createDivider(y = 0.5): Block {
  return {
    id: makeBlockId(),
    type: 'divider',
    y,
    content: {},
    animation: 'none',
    visible: true,
  };
}

// ─────────────────────────────────────────────
// 블록 라벨 (UI용)
// ─────────────────────────────────────────────
export const BLOCK_LABELS: Record<BlockType, string> = {
  headline: '제목',
  body: '본문',
  label: '라벨',
  highlight: '강조 숫자',
  list: '리스트',
  'numbered-card': '번호 카드',
  'point-box': '포인트 박스',
  divider: '구분선',
};

export const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  headline: '큰 제목',
  body: '본문 설명',
  label: '카테고리/태그',
  highlight: '큰 숫자/통계',
  list: '체크 리스트',
  'numbered-card': '01/02/03 카드',
  'point-box': '강조 요약 박스',
  divider: '얇은 구분선',
};

// ─────────────────────────────────────────────
// 블록 내용 미리보기 (UI용)
// ─────────────────────────────────────────────
export function getBlockPreview(block: Block): string {
  if (block.content.text) {
    return block.content.text.length > 30
      ? block.content.text.slice(0, 30) + '...'
      : block.content.text;
  }
  if (block.content.items && block.content.items.length > 0) {
    return `${block.content.items.length}개 항목: ${block.content.items[0].title.slice(0, 20)}...`;
  }
  return BLOCK_LABELS[block.type];
}

// ─────────────────────────────────────────────
// 빈 블록 생성 (블록 교체 시 사용)
// ─────────────────────────────────────────────
export function createEmptyBlock(type: BlockType, y: number): Block {
  switch (type) {
    case 'headline':
      return createHeadline('제목을 입력하세요', y);
    case 'body':
      return createBody('본문을 입력하세요', y);
    case 'label':
      return createLabel('LABEL', y);
    case 'highlight':
      return createHighlight('100%', y);
    case 'list':
      return createList(
        [
          { title: '항목 1', desc: '설명 1' },
          { title: '항목 2', desc: '설명 2' },
          { title: '항목 3', desc: '설명 3' },
        ],
        y
      );
    case 'numbered-card':
      return createNumberedCard(
        [
          { number: '01', title: '첫 번째', desc: '설명' },
          { number: '02', title: '두 번째', desc: '설명' },
          { number: '03', title: '세 번째', desc: '설명' },
        ],
        y
      );
    case 'point-box':
      return createPointBox('POINT', '핵심 내용을 입력하세요', y);
    case 'divider':
      return createDivider(y);
  }
}

// ─────────────────────────────────────────────
// 콘텐츠 유무 확인
// ─────────────────────────────────────────────
export function hasContent(block: Block): boolean {
  if (block.visible === false) return false;
  if (block.type === 'divider') return true;
  if (block.content.text && block.content.text.trim()) return true;
  if (block.content.items && block.content.items.length > 0) return true;
  return false;
}