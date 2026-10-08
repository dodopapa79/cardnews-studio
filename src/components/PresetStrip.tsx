'use client';
import { useState } from 'react';
import { ChevronRight, Sparkles, Check, Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CardRenderer } from '@/templates/CardRenderer';
import { STYLE_PRESETS, BG_PRESETS } from '@/lib/presets';
import { sortPresets } from '@/lib/utils';
import { createDefaultText } from '@/lib/types';
import type { Preset, Slide, BrandInfo, Block } from '@/lib/types';
import { makeBlockId } from '@/lib/blocks';

// 프리셋 미리보기용 샘플 슬라이드
function makeSampleSlide(preset: Preset): Slide {
  const blocks: Block[] = [
    {
      id: makeBlockId(),
      type: 'headline',
      y: 0.35,
      content: { text: '미리보기 제목' },
      animation: 'slide-up',
      visible: true,
    },
    {
      id: makeBlockId(),
      type: 'body',
      y: 0.55,
      content: { text: '본문 예시입니다' },
      animation: 'fade-in',
      visible: true,
    },
  ];

  return {
    id: 'sample',
    type: 'cover',
    background: {
      type: 'color',
      color: '#ffffff',
      pattern: 'none',
      ...preset.background,
    } as any,
    blocks,
    imagePrompt: '',
    imagePromptKo: '',
    isLast: false,
  };
}

const MINI_W = 72;
const MINI_H = 90;

export function PresetStrip({
  current,
  customPresets,
  favorites,
  brand,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  brand?: BrandInfo;
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [openAll, setOpenAll] = useState(false);

  // 안전 필터
  const safeCustom = (customPresets || []).filter(
    (p): p is Preset => !!p && typeof p.id === 'string' && !!p.name && !!p.blockStyles
  );
  const safeBuiltin = (STYLE_PRESETS || []).filter(
    (p): p is Preset => !!p && typeof p.id === 'string'
  );

  const all = sortPresets([...safeBuiltin, ...safeCustom], favorites || []);

  const stripItems = (() => {
    const result: Preset[] = [];
    const seen = new Set<string>();

    if (current && typeof current.id === 'string') {
      result.push(current);
      seen.add(current.id);
    }

    for (const p of all) {
      if (result.length >= 6) break;
      if (p && typeof p.id === 'string' && !seen.has(p.id)) {
        result.push(p);
        seen.add(p.id);
      }
    }
    return result;
  })();

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="shrink-0 flex items-center gap-1.5 pr-3 border-r border-surface-border">
          <Sparkles size={16} className="text-primary-600" />
          <span className="text-sm font-bold text-ink-secondary hidden md:inline">
            프리셋
          </span>
        </div>

        <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {stripItems.map((p) => (
            <MiniPresetCard
              key={p.id}
              preset={p}
              selected={current?.id === p.id}
              favorite={(favorites || []).includes(p.id)}
              brand={brand}
              onClick={() => onSelect(p)}
              onToggleFavorite={() => onToggleFavorite(p.id)}
            />
          ))}
        </div>

        <button
          onClick={() => setOpenAll(true)}
          className="shrink-0 flex items-center gap-1 px-3.5 py-2.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 text-sm font-semibold transition"
        >
          전체보기
          <ChevronRight size={16} />
        </button>
      </div>

      <Modal
        open={openAll}
        onClose={() => setOpenAll(false)}
        title="프리셋 전체보기"
        maxWidth="2xl"
      >
        <PresetGallery
          current={current}
          customPresets={safeCustom}
          favorites={favorites || []}
          brand={brand}
          onSelect={(p) => {
            onSelect(p);
            setOpenAll(false);
          }}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onImportCustom={onImportCustom}
          onToggleFavorite={onToggleFavorite}
        />
      </Modal>
    </>
  );
}

function MiniPresetCard({
  preset,
  selected,
  favorite,
  brand,
  onClick,
  onToggleFavorite,
}: {
  preset: Preset;
  selected: boolean;
  favorite: boolean;
  brand?: BrandInfo;
  onClick: () => void;
  onToggleFavorite: () => void;
}) {
  if (!preset) return null;

  let sample: Slide | null = null;
  try {
    sample = makeSampleSlide(preset);
  } catch {
    return null;
  }

  return (
    <div className="group relative shrink-0">
      <button
        onClick={onClick}
        className={`rounded-lg border-2 overflow-hidden transition-all relative ${
          selected
            ? 'border-primary-500 shadow-md'
            : 'border-surface-border hover:border-primary-300'
        }`}
        style={{ width: MINI_W, height: MINI_H }}
        title={preset.name}
      >
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: `scale(${MINI_W / 1080})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <CardRenderer slide={sample} preset={preset} brand={brand} width={1080} height={1350} />
        </div>
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center transition-all shadow ${
          favorite
            ? 'bg-amber-500 text-white opacity-100'
            : 'bg-white text-ink-secondary opacity-0 group-hover:opacity-100'
        }`}
      >
        <Star size={10} fill={favorite ? 'currentColor' : 'none'} />
      </button>

      {selected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white shadow">
          <Check size={10} strokeWidth={3} />
        </div>
      )}

      <div className="text-[9px] text-center mt-1 text-ink-secondary truncate font-medium">
        {preset.name}
      </div>
    </div>
  );
}

function PresetGallery({
  current,
  customPresets,
  favorites,
  brand,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
  brand?: BrandInfo;
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportCustom: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  const [tab, setTab] = useState<'builtin' | 'custom'>('builtin');
  const [saveModal, setSaveModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [newName, setNewName] = useState('');

  const list = tab === 'builtin' ? STYLE_PRESETS : sortPresets(customPresets, favorites);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTab('builtin')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              tab === 'builtin'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
          >
            기본 ({STYLE_PRESETS.length})
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${
              tab === 'custom'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
          >
            커스텀 ({customPresets.length})
          </button>
        </div>

        <div className="flex-1" />

        <Button size="sm" icon={<Sparkles size={13} />} onClick={() => setImportModal(true)}>
          AI 프리셋 가져오기
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setNewName('');
            setSaveModal(true);
          }}
        >
          현재 설정 저장
        </Button>
      </div>

      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-3">커스텀 프리셋이 없습니다</div>
          <Button size="sm" onClick={() => setImportModal(true)} icon={<Sparkles size={12} />}>
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {list.map((p) => {
            if (!p) return null;
            const isSelected = current?.id === p.id;
            const isFav = favorites.includes(p.id);

            let sample: Slide | null = null;
            try {
              sample = makeSampleSlide(p);
            } catch {
              return null;
            }

            return (
              <div key={p.id} className="group relative">
                <button
                  onClick={() => onSelect(p)}
                  className={`w-full rounded-lg border-2 overflow-hidden transition relative ${
                    isSelected
                      ? 'border-primary-500 shadow-md'
                      : 'border-surface-border hover:border-primary-300'
                  }`}
                  style={{ aspectRatio: '4 / 5' }}
                >
                  <div
                    style={{
                      width: 1080,
                      height: 1350,
                      transform: 'scale(0.2)',
                      transformOrigin: 'top left',
                    }}
                  >
                    <CardRenderer slide={sample} preset={p} brand={brand} width={1080} height={1350} />
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(p.id);
                  }}
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    isFav
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/90 text-ink-secondary opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Star size={11} fill={isFav ? 'currentColor' : 'none'} />
                </button>

                {isSelected && (
                  <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}

                {!p.builtin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`"${p.name}" 삭제할까요?`)) onDeleteCustom(p.id);
                    }}
                    className="absolute bottom-8 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    ×
                  </button>
                )}

                <div className="text-xs font-semibold truncate mt-1.5 text-center">
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={saveModal}
        onClose={() => setSaveModal(false)}
        title="커스텀 프리셋 저장"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <label className="block">
            <div className="text-sm font-medium text-ink-secondary mb-1.5">
              프리셋 이름
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="예: 우리 회사 브랜드"
              autoFocus
              className="w-full rounded-lg border border-surface-border px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setSaveModal(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                if (newName.trim()) {
                  onSaveCustom(newName.trim());
                  setSaveModal(false);
                }
              }}
            >
              저장
            </Button>
          </div>
        </div>
      </Modal>

      <ImportModalInline
        open={importModal}
        onClose={() => setImportModal(false)}
        onSave={(preset) => {
          onImportCustom(preset);
          setImportModal(false);
        }}
      />
    </div>
  );
}

function ImportModalInline({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (preset: Preset) => void;
}) {
  const [jsonText, setJsonText] = useState('');
  const [name, setName] = useState('');
  const [parsed, setParsed] = useState<Preset | null>(null);
  const [error, setError] = useState('');

  async function handleParse() {
    setError('');
    setParsed(null);
    if (!jsonText.trim()) {
      setError('JSON을 붙여넣어주세요');
      return;
    }
    try {
      const { parsePresetJSON } = await import('@/lib/preset-import');
      const preset = parsePresetJSON(jsonText, name.trim() || undefined);
      setParsed(preset);
      if (!name) setName(preset.name);
    } catch (e: any) {
      setError(e.message || '파싱 오류');
    }
  }

  function handleSave() {
    if (!parsed) return;
    onSave({ ...parsed, name: name.trim() || parsed.name });
    setJsonText('');
    setParsed(null);
    setName('');
    onClose();
  }

  function handleClose() {
    setJsonText('');
    setParsed(null);
    setName('');
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="AI 프리셋 가져오기" maxWidth="2xl">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-primary-50 border border-primary-200 text-sm text-primary-800">
          <div className="font-semibold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={15} />
            사용 방법
          </div>
          <div className="space-y-1 leading-relaxed">
            <div>1. 참고할 카드뉴스 이미지를 AI에게 보여줌</div>
            <div>2. AI가 반환한 JSON을 아래에 붙여넣기</div>
            <div>3. 이름 지정 → 파싱 → 저장</div>
          </div>
        </div>

        <label className="block">
          <div className="text-sm font-medium text-ink-secondary mb-1.5">
            프리셋 이름
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 클로드 디자인 스타일"
            className="w-full rounded-lg border border-surface-border px-3.5 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </label>

        <label className="block">
          <div className="text-sm font-medium text-ink-secondary mb-1.5">
            JSON 붙여넣기
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='{ "name": "...", "background": {...}, "blockStyles": {...} }'
            rows={12}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </label>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {parsed && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
              <Check size={14} />
              파싱 성공
            </div>
            <div className="text-xs text-green-700 mt-1">
              이름: <strong>{parsed.name}</strong>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleParse} icon={<Sparkles size={15} />} className="flex-1">
            파싱
          </Button>
          <Button onClick={handleSave} disabled={!parsed} className="flex-1" icon={<Check size={15} />}>
            프리셋 저장
          </Button>
        </div>
      </div>
    </Modal>
  );
}