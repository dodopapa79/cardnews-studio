'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { STYLE_PRESETS, BG_PRESETS, getPresetById } from '@/lib/presets';
import { parsePresetJSON, presetToJSON } from '@/lib/preset-import';
import { sortPresets } from '@/lib/utils';
import type { Preset, BrandInfo, Slide, TextElementConfig } from '@/lib/types';
import { createDefaultText, DEFAULT_BACKGROUND } from '@/lib/types';
import { CardRenderer } from '@/templates/CardRenderer';
import {
  Plus,
  Upload,
  Sparkles,
  Star,
  Check,
  Trash2,
  Download,
  AlertCircle,
} from 'lucide-react';

// 프리셋 미리보기용 샘플 슬라이드
function makeSampleSlide(preset: Preset): Slide {
  return {
    id: 'sample',
    type: 'cover',
    background: {
      ...DEFAULT_BACKGROUND,
      ...(preset.defaultBackground || {}),
    } as any,
    texts: {
      label: preset.defaultLabelStyle
        ? createDefaultText('FEATURED', preset.defaultLabelStyle)
        : undefined,
      headline: createDefaultText('미리보기', preset.defaultHeadlineStyle || {}),
      body: preset.defaultBodyStyle
        ? createDefaultText('본문 예시입니다', preset.defaultBodyStyle)
        : undefined,
      highlight: undefined,
      footer: undefined,
    },
    imagePrompt: '',
    imagePromptKo: '',
    isLast: false,
  };
}

export function PresetsView({
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

  const list =
    tab === 'builtin' ? STYLE_PRESETS : sortPresets(customPresets, favorites);

  function handleExport(preset: Preset) {
    const data = presetToJSON(preset);
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preset-${preset.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const presets = Array.isArray(data) ? data : [data];
        for (const p of presets) {
          const parsed = parsePresetJSON(JSON.stringify(p));
          onImportCustom(parsed);
        }
        alert(`${presets.length}개 프리셋을 가져왔습니다.`);
      } catch (err: any) {
        alert(`가져오기 실패: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-semibold text-primary-900 mb-1 text-sm">
                AI 프리셋 가져오기
              </div>
              <div className="text-xs text-primary-800 leading-relaxed">
                참고 이미지를 AI에게 보여주고 받은 JSON을 붙여넣어 프리셋 생성
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Star size={18} fill="white" />
            </div>
            <div>
              <div className="font-semibold text-amber-900 mb-1 text-sm">
                즐겨찾기
              </div>
              <div className="text-xs text-amber-800 leading-relaxed">
                별 아이콘 클릭 → 상단 고정
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 text-white flex items-center justify-center shrink-0">
              <Upload size={18} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1 text-sm">
                JSON 파일
              </div>
              <div className="text-xs text-gray-800 leading-relaxed">
                저장된 프리셋을 파일로 주고받기
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 탭 + 액션 */}
      <div className="flex items-center gap-3 flex-wrap">
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

        <Button
          size="sm"
          icon={<Sparkles size={13} />}
          onClick={() => setImportModal(true)}
        >
          AI 프리셋 가져오기
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
          <span className="inline-flex items-center justify-center gap-1.5 text-sm px-3.5 py-2 font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
            <Upload size={13} />
            JSON 파일
          </span>
        </label>
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus size={13} />}
          onClick={() => {
            setNewName('');
            setSaveModal(true);
          }}
        >
          현재 설정 저장
        </Button>
      </div>

      {/* 목록 */}
      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-3">
            커스텀 프리셋이 없습니다
          </div>
          <Button
            size="sm"
            onClick={() => setImportModal(true)}
            icon={<Sparkles size={12} />}
          >
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => {
            const isSelected = current.id === p.id;
            const isFav = favorites.includes(p.id);
            const sample = makeSampleSlide(p);

            return (
              <div key={p.id} className="group relative">
                <button
                  onClick={() => onSelect(p)}
                  className={`w-full rounded-xl border-2 overflow-hidden transition ${
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
                      transform: 'scale(0.25)',
                      transformOrigin: 'top left',
                    }}
                  >
                    <CardRenderer
                      slide={sample}
                      preset={p}
                      brand={brand}
                      width={1080}
                      height={1350}
                    />
                  </div>
                </button>

                {/* 즐겨찾기 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(p.id);
                  }}
                  className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center transition ${
                    isFav
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/90 text-ink-secondary opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
                </button>

                {/* 선택 표시 */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}

                {/* 액션 */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(p);
                    }}
                    className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white"
                    title="내보내기"
                  >
                    <Download size={12} />
                  </button>
                  {!p.builtin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`"${p.name}" 삭제할까요?`)) {
                          onDeleteCustom(p.id);
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                      title="삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <div className="mt-2 px-1">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  {p.description && (
                    <div className="text-xs text-ink-muted truncate">
                      {p.description}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 저장 모달 */}
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

      {/* AI 프리셋 가져오기 */}
      <PresetImportModalInline
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

// ─────────────────────────────────────────────
// AI 프리셋 가져오기 모달 (인라인)
// ─────────────────────────────────────────────
function PresetImportModalInline({
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

  function handleParse() {
    setError('');
    setParsed(null);
    if (!jsonText.trim()) {
      setError('JSON을 붙여넣어주세요');
      return;
    }
    try {
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
            <div>1. 참고할 카드뉴스 이미지를 AI(ChatGPT/Gemini/Claude)에게 보여줌</div>
            <div>2. AI가 반환한 JSON을 아래에 붙여넣기</div>
            <div>3. 프리셋 이름을 지정하고 파싱 → 저장</div>
          </div>
        </div>

        <label className="block">
          <div className="text-sm font-medium text-ink-secondary mb-1.5">
            프리셋 이름 <span className="text-red-500">*</span>
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
            placeholder='{ "name": "프리셋 이름", "defaultBackground": {...}, ... }'
            rows={12}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </label>

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
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
          <Button
            onClick={handleParse}
            icon={<Sparkles size={15} />}
            className="flex-1"
          >
            파싱
          </Button>
          <Button
            onClick={handleSave}
            disabled={!parsed}
            className="flex-1"
            icon={<Check size={15} />}
          >
            프리셋 저장
          </Button>
        </div>
      </div>
    </Modal>
  );
}