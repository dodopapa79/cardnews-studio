'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PresetImportModal } from '@/components/PresetImportModal';
import { STYLE_PRESETS } from '@/presets';
import { presetToJSON } from '@/lib/preset-import';
import { sortPresets } from '@/lib/utils';
import type { Preset } from '@/lib/types';
import { Plus, Upload, Sparkles, Star, Check, Trash2, Download } from 'lucide-react';

export function PresetsView({
  current,
  customPresets,
  favorites,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
  onImportCustom,
  onToggleFavorite,
}: {
  current: Preset;
  customPresets: Preset[];
  favorites: string[];
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
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result as string);
        const presets = Array.isArray(data) ? data : [data];
        for (const p of presets) {
          // 서버 유틸로 파싱
          const { parsePresetJSON } = await import('@/lib/preset-import');
          const parsed = parsePresetJSON(JSON.stringify(p));
          onImportCustom(parsed);
        }
      } catch {
        alert('올바른 프리셋 파일이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-semibold text-primary-900 mb-1">AI 프리셋</div>
              <div className="text-xs text-primary-800 leading-relaxed">
                참고 이미지를 AI에게 보여주고 JSON을 받아 붙여넣기
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Star size={18} fill="white" />
            </div>
            <div>
              <div className="font-semibold text-amber-900 mb-1">즐겨찾기</div>
              <div className="text-xs text-amber-800 leading-relaxed">
                별 아이콘 클릭 → 상단 고정
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-700 text-white flex items-center justify-center shrink-0">
              <Upload size={18} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">JSON 파일</div>
              <div className="text-xs text-gray-800 leading-relaxed">
                저장된 프리셋을 파일로 주고받기
              </div>
            </div>
          </div>
        </div>
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

      {/* 프리셋 목록 */}
      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-16 border-2 border-dashed border-surface-border rounded-lg">
          <div className="text-sm text-ink-muted mb-3">커스텀 프리셋이 없습니다</div>
          <Button size="sm" onClick={() => setImportModal(true)} icon={<Sparkles size={12} />}>
            첫 프리셋 가져오기
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {list.map((p) => {
            const isSelected = current.id === p.id;
            const isFav = favorites.includes(p.id);
            return (
              <div
                key={p.id}
                className={`rounded-xl border-2 overflow-hidden transition ${
                  isSelected
                    ? 'border-primary-500 shadow-md'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                <button
                  onClick={() => onSelect(p)}
                  className="w-full text-left"
                >
                  {/* 프리셋 미리보기 */}
                  <div
                    className="relative w-full flex items-center justify-center"
                    style={{
                      aspectRatio: '4 / 5',
                      backgroundColor: p.defaultBackground?.color || '#ffffff',
                    }}
                  >
                    <div
                      className="text-2xl font-black px-4 text-center"
                      style={{
                        color: p.defaultHeadlineStyle?.color || '#0a0a0a',
                      }}
                    >
                      {p.name}
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(p.id);
                      }}
                      className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition ${
                        isFav
                          ? 'bg-amber-500 text-white'
                          : 'bg-white/80 text-ink-secondary opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star size={11} fill={isFav ? 'currentColor' : 'none'} />
                    </div>
                  </div>

                  <div className="p-3 bg-white border-t border-surface-border">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold truncate">
                        {p.name}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(p);
                          }}
                          className="p-1 rounded hover:bg-surface-hover text-ink-secondary"
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
                            className="p-1 rounded hover:bg-red-50 text-red-500"
                            title="삭제"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    {p.description && (
                      <div className="text-[10px] text-ink-muted truncate mt-0.5">
                        {p.description}
                      </div>
                    )}
                  </div>
                </button>
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
      <PresetImportModal
        open={importModal}
        onClose={() => setImportModal(false)}
        onSave={onImportCustom}
      />
    </div>
  );
}