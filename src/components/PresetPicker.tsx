'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { STYLE_PRESETS, INDUSTRY_PRESETS } from '@/presets';
import { CardSlide } from '@/templates';
import type { Preset } from '@/lib/types';
import { Check, Plus } from 'lucide-react';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기',
  body: '본문 텍스트',
  highlight: '',
  imageUrl: '',
  imagePrompt: '',
  imageLayout: 'none' as const,
};

export function PresetPicker({
  current,
  customPresets,
  onSelect,
  onSaveCustom,
  onDeleteCustom,
}: {
  current: Preset;
  customPresets: Preset[];
  onSelect: (p: Preset) => void;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
}) {
  const [tab, setTab] = useState<'style' | 'industry' | 'custom'>('style');
  const [saveModal, setSaveModal] = useState(false);
  const [newName, setNewName] = useState('');

  const list =
    tab === 'style' ? STYLE_PRESETS : tab === 'industry' ? INDUSTRY_PRESETS : customPresets;

  return (
    <Card>
      <CardHeader
        title="프리셋"
        subtitle="스타일을 선택하세요"
        action={
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={13} />}
            onClick={() => {
              setNewName('');
              setSaveModal(true);
            }}
          >
            저장
          </Button>
        }
      />

      <div className="mb-3">
        <Tabs
          tabs={[
            { id: 'style', label: '스타일' },
            { id: 'industry', label: '업종' },
            { id: 'custom', label: `커스텀` },
          ]}
          active={tab}
          onChange={(v) => setTab(v as any)}
        />
      </div>

      {list.length === 0 && tab === 'custom' ? (
        <div className="text-center py-8 text-sm text-ink-muted">
          저장된 커스텀 프리셋이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-[520px] overflow-y-auto pr-1">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className={`rounded-lg overflow-hidden text-left transition-all ${
                current.id === p.id
                  ? 'ring-2 ring-primary-500 ring-offset-1'
                  : 'border border-surface-border hover:border-primary-300'
              }`}
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4 / 5' }}>
                <div
                  style={{
                    width: 1080,
                    height: 1350,
                    transform: 'scale(0.16)',
                    transformOrigin: 'top left',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                >
                  <CardSlide slide={SAMPLE_SLIDE} preset={p} />
                </div>
                {current.id === p.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white">
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}
              </div>
              <div className="p-1.5 bg-white">
                <div className="text-[10px] font-semibold truncate">{p.name}</div>
              </div>
            </button>
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
    </Card>
  );
}