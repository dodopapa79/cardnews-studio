'use client';
import { Card } from '@/components/ui/Card';
import { PresetPicker } from '@/components/PresetPicker';
import type { Preset, BrandInfo } from '@/lib/types';

export function PresetsView({
  current,
  currentColorId,
  onSelect,
  onColorChange,
  customPresets,
  favorites,
  stats,
  brand,
  onSaveCustom,
  onDeleteCustom,
  onImport,
  onToggleFavorite,
}: {
  current: Preset;
  currentColorId?: string;
  onSelect: (p: Preset, colorId?: string) => void;
  onColorChange: (colorId: string) => void;
  customPresets: Preset[];
  favorites: string[];
  stats: Record<string, number>;
  brand?: BrandInfo;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImport: (presets: Preset[]) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* 안내 카드 */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0 text-lg font-bold">
            ★
          </div>
          <div className="flex-1">
            <div className="font-semibold text-primary-900 mb-1">프리셋 사용 팁</div>
            <div className="text-xs text-primary-800 leading-relaxed space-y-1">
              <div>• 별 아이콘을 눌러 <strong>즐겨찾기</strong>하면 상단에 고정됩니다</div>
              <div>• 많이 사용한 프리셋이 자동으로 앞에 표시됩니다</div>
              <div>• 프리셋을 클릭하면 카드가 즉시 적용되고 팝업이 자동으로 닫힙니다</div>
            </div>
          </div>
        </div>
      </Card>

      <PresetPicker
        current={current}
        currentColorId={currentColorId}
        customPresets={customPresets}
        favorites={favorites}
        stats={stats}
        brand={brand}
        onSelect={onSelect}
        onColorChange={onColorChange}
        onSaveCustom={onSaveCustom}
        onDeleteCustom={onDeleteCustom}
        onImport={onImport}
        onToggleFavorite={onToggleFavorite}
      />
    </div>
  );
}