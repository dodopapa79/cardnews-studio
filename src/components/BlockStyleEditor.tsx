'use client';
import { ColorPicker } from '@/components/ColorPicker';
import { Slider } from '@/components/Slider';
import type { Block, Preset, PresetBlockStyles } from '@/lib/types';
import { BLOCK_LABELS } from '@/lib/blocks';
import { RotateCcw } from 'lucide-react';

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#f5f5f5', '#0a0a0a',
  '#ef4444', '#f97316', '#eab308', '#84cc16',
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
  '#d946ef', '#ec4899', '#f43f5e',
];

export function BlockStyleEditor({
  block,
  preset,
  onPresetStyleChange,
}: {
  block: Block;
  preset: Preset;
  onPresetStyleChange?: (patch: Partial<PresetBlockStyles>) => void;
}) {
  const bs = preset.blockStyles;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-surface-border">
        <span className="text-sm font-bold">{BLOCK_LABELS[block.type]} 스타일</span>
      </div>

      {block.type === 'headline' && (
        <HeadlineStyleUI
          style={bs.headline}
          onChange={(patch) =>
            onPresetStyleChange?.({ headline: { ...bs.headline, ...patch } })
          }
        />
      )}
      {block.type === 'body' && (
        <BodyStyleUI
          style={bs.body}
          onChange={(patch) =>
            onPresetStyleChange?.({ body: { ...bs.body, ...patch } })
          }
        />
      )}
      {block.type === 'label' && (
        <LabelStyleUI
          style={bs.label}
          onChange={(patch) =>
            onPresetStyleChange?.({ label: { ...bs.label, ...patch } })
          }
        />
      )}
      {block.type === 'highlight' && (
        <HighlightStyleUI
          style={bs.highlight}
          onChange={(patch) =>
            onPresetStyleChange?.({ highlight: { ...bs.highlight, ...patch } })
          }
        />
      )}
      {block.type === 'list' && (
        <ListStyleUI
          style={bs.list}
          onChange={(patch) =>
            onPresetStyleChange?.({ list: { ...bs.list, ...patch } })
          }
        />
      )}
      {block.type === 'numbered-card' && (
        <NumberedCardStyleUI
          style={bs.numberedCard}
          onChange={(patch) =>
            onPresetStyleChange?.({
              numberedCard: { ...bs.numberedCard, ...patch },
            })
          }
        />
      )}
      {block.type === 'point-box' && (
        <PointBoxStyleUI
          style={bs.pointBox}
          onChange={(patch) =>
            onPresetStyleChange?.({ pointBox: { ...bs.pointBox, ...patch } })
          }
        />
      )}
      {block.type === 'divider' && (
        <DividerStyleUI
          style={bs.divider}
          onChange={(patch) =>
            onPresetStyleChange?.({ divider: { ...bs.divider, ...patch } })
          }
        />
      )}
    </div>
  );
}

function HeadlineStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <Slider label="크기" value={style.fontSize} min={20} max={200} step={2} unit="px" onUpdate={(v) => onChange({ fontSize: v })} />
      <Slider label="두께" value={style.fontWeight} min={400} max={900} step={100} onUpdate={(v) => onChange({ fontWeight: v })} />
      <ColorPicker label="색상" value={style.color} onChange={(v) => onChange({ color: v })} presets={COLOR_PRESETS} />
      <Slider label="줄 간격" value={style.lineHeight} min={0.9} max={2} step={0.05} onUpdate={(v) => onChange({ lineHeight: v })} />
    </>
  );
}

function BodyStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <Slider label="크기" value={style.fontSize} min={16} max={60} step={2} unit="px" onUpdate={(v) => onChange({ fontSize: v })} />
      <ColorPicker label="색상" value={style.color} onChange={(v) => onChange({ color: v })} presets={COLOR_PRESETS} />
      <Slider label="줄 간격" value={style.lineHeight} min={1} max={2} step={0.05} onUpdate={(v) => onChange({ lineHeight: v })} />
    </>
  );
}

function LabelStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <Slider label="크기" value={style.fontSize} min={14} max={50} step={2} unit="px" onUpdate={(v) => onChange({ fontSize: v })} />
      <ColorPicker label="텍스트 색상" value={style.color} onChange={(v) => onChange({ color: v })} presets={COLOR_PRESETS} />
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={!!style.background}
          onChange={(e) => {
            if (e.target.checked) {
              onChange({ background: '#000000', backgroundOpacity: 0.1, padding: 12, borderRadius: 999 });
            } else {
              onChange({ background: undefined, backgroundOpacity: undefined, padding: undefined, borderRadius: undefined });
            }
          }}
        />
        <span className="font-medium">배경 박스</span>
      </label>
      {style.background && (
        <div className="pl-3 space-y-3">
          <ColorPicker label="박스 색" value={style.background} onChange={(v) => onChange({ background: v })} presets={COLOR_PRESETS} />
        </div>
      )}
    </>
  );
}

function HighlightStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <Slider label="크기" value={style.fontSize} min={60} max={300} step={10} unit="px" onUpdate={(v) => onChange({ fontSize: v })} />
      <ColorPicker label="색상" value={style.color} onChange={(v) => onChange({ color: v })} presets={COLOR_PRESETS} />
    </>
  );
}

function ListStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <ColorPicker label="항목 배경" value={style.itemBg} onChange={(v) => onChange({ itemBg: v })} presets={COLOR_PRESETS} />
      <Slider label="항목 둥글기" value={style.itemBorderRadius} min={0} max={32} step={2} unit="px" onUpdate={(v) => onChange({ itemBorderRadius: v })} />
      <Slider label="항목 여백" value={style.itemPadding} min={8} max={48} step={2} unit="px" onUpdate={(v) => onChange({ itemPadding: v })} />
      <ColorPicker label="제목 색" value={style.titleColor} onChange={(v) => onChange({ titleColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="설명 색" value={style.descColor} onChange={(v) => onChange({ descColor: v })} presets={COLOR_PRESETS} />
    </>
  );
}

function NumberedCardStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <ColorPicker label="카드 배경" value={style.cardBg} onChange={(v) => onChange({ cardBg: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="번호 색" value={style.numberColor} onChange={(v) => onChange({ numberColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="제목 색" value={style.titleColor} onChange={(v) => onChange({ titleColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="설명 색" value={style.descColor} onChange={(v) => onChange({ descColor: v })} presets={COLOR_PRESETS} />
    </>
  );
}

function PointBoxStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <ColorPicker label="박스 배경" value={style.bgColor} onChange={(v) => onChange({ bgColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="좌측 라인" value={style.borderLeftColor} onChange={(v) => onChange({ borderLeftColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="라벨 색" value={style.labelColor} onChange={(v) => onChange({ labelColor: v })} presets={COLOR_PRESETS} />
      <ColorPicker label="텍스트 색" value={style.textColor} onChange={(v) => onChange({ textColor: v })} presets={COLOR_PRESETS} />
    </>
  );
}

function DividerStyleUI({ style, onChange }: { style: any; onChange: (p: any) => void }) {
  return (
    <>
      <ColorPicker label="색상" value={style.color} onChange={(v) => onChange({ color: v })} presets={COLOR_PRESETS} />
      <Slider label="두께" value={style.thickness} min={1} max={10} step={1} unit="px" onUpdate={(v) => onChange({ thickness: v })} />
    </>
  );
}