'use client';
import { Card } from '@/components/ui/Card';
import { PresetStrip } from '@/components/PresetStrip';
import type { Preset, BrandInfo } from '@/lib/types';

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
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <PresetStrip
          current={current}
          customPresets={customPresets}
          favorites={favorites}
          brand={brand}
          onSelect={onSelect}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onImportCustom={onImportCustom}
          onToggleFavorite={onToggleFavorite}
        />
      </Card>
    </div>
  );
}