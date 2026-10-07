'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { CardSlide } from '@/templates';
import type { Preset } from '@/lib/types';
import { Check, Trash2, Plus, Palette } from 'lucide-react';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기',
  body: '본문 텍스트입니다',
  highlight: '',
  imageUrl: '',
  imagePrompt: '',
  imageLayout: 'none' as const,
};

export function PresetsView({
  current,
  onSelect,
  customPresets,
  onSaveCustom,
  onDeleteCustom,
}: {
  current: Preset;
  onSelect: (p: Preset) => void;
  customPresets: Preset[];
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [newName, setNewName] = useState('');

  const list =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card padding={false} className="p-1.5 flex items-center gap-3">
        <Tabs
          tabs={[
            { id: 'style', label: `스타일 (${STYLE_PRESETS.length})` },
            { id: 'industry', label: `업종 (${INDUSTRY_PRESETS.length})` },
            { id: 'custom', label: `커스텀 (${customPresets.length})` },
          ]}
          active={tab}
          onChange={(v) => setTab(v as any)}
        />
        <Button
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => {
            setNewName('');
            setSaveModal(true);
          }}
        >
          현재 설정 저장
        </Button>
      </Card>

      {list.length === 0 && tab === 'custom' ? (
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <Palette size={28} />
            </div>
            <div className="text-base font-semibold mb-1">커스텀 프리셋이 없습니다</div>
            <div className="text-sm text-ink-secondary mb-4">
              카드뉴스 만들기에서 원하는 스타일을 조정한 뒤 저장하세요
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {list.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={current.id === p.id}
              onClick={() => onSelect(p)}
              onDelete={!p.builtin ? () => onDeleteCustom(p.id) : undefined}
            />
          ))}
        </div>
      )}

      <Modal
        open={saveModal}
        onClose={() => setSaveModal(false)}
        title="커스텀 프리셋 저장"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="프리셋 이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="예: 우리 회사 브랜드"
            autoFocus
          />
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
    </div>
  );
}

function PresetCard({
  preset,
  selected,
  onClick,
  onDelete,
}: {
  preset: Preset;
  selected: boolean;
  onClick: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full rounded-xl overflow-hidden text-left transition-all ${
          selected
            ? 'ring-2 ring-primary-500 ring-offset-2 shadow-card-hover'
            : 'border border-surface-border hover:border-primary-300 shadow-card'
        }`}
      >
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
          <div
            style={{
              width: 1080,
              height: 1350,
              transform: 'scale(0.18)',
              transformOrigin: 'top left',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <CardSlide slide={SAMPLE_SLIDE} preset={preset} />
          </div>
          {selected && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <Check size={14} strokeWidth={3} />
            </div>
          )}
        </div>
        <div className="p-3 border-t border-surface-border bg-white">
          <div className="text-sm font-semibold truncate">{preset.name}</div>
          {preset.description && (
            <div className="text-xs text-ink-muted truncate mt-0.5">
              {preset.description}
            </div>
          )}
          <div className="flex gap-1 mt-2">
            <span
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ background: preset.theme.accent }}
            />
            <span
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ background: preset.theme.accentSoft }}
            />
            <span
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ background: preset.theme.background }}
            />
          </div>
        </div>
      </button>

      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${preset.name}" 프리셋을 삭제할까요?`)) onDelete();
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="삭제"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}