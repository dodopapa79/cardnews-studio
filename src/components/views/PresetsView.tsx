'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PresetPicker } from '@/components/PresetPicker';
import type { Preset } from '@/lib/types';

export function PresetsView({
  current,
  currentColorId,
  onSelect,
  onColorChange,
  customPresets,
  onSaveCustom,
  onDeleteCustom,
  onImport,
}: {
  current: Preset;
  currentColorId?: string;
  onSelect: (p: Preset, colorId?: string) => void;
  onColorChange: (colorId: string) => void;
  customPresets: Preset[];
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImport: (presets: Preset[]) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto">
      <PresetPicker
        current={current}
        currentColorId={currentColorId}
        customPresets={customPresets}
        onSelect={onSelect}
        onColorChange={onColorChange}
        onSaveCustom={onSaveCustom}
        onDeleteCustom={onDeleteCustom}
        onImport={onImport}
      />
    </div>
  );
}