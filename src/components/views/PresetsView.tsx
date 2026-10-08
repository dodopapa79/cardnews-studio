'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PresetPicker } from '@/components/PresetPicker';
import type { Preset, BrandInfo } from '@/lib/types';
import { Sparkles, Star, Palette, Layers } from 'lucide-react';

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
  onImportCustom,
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
  onImportCustom?: (preset: Preset) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* 안내 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="font-semibold text-primary-900 text-sm mb-0.5">
                AI 프리셋 가져오기
              </div>
              <div className="text-[11px] text-primary-800 leading-relaxed">
                참고 이미지를 AI에게 보여주고 받은 JSON을 붙여넣어 프리셋 생성
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Star size={16} fill="white" />
            </div>
            <div>
              <div className="font-semibold text-amber-900 text-sm mb-0.5">
                즐겨찾기
              </div>
              <div className="text-[11px] text-amber-800 leading-relaxed">
                별 아이콘 클릭 → 상단 고정. 자주 쓰는 프리셋을 위로
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gray-700 text-white flex items-center justify-center shrink-0">
              <Palette size={16} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm mb-0.5">
                색상 즉시 변경
              </div>
              <div className="text-[11px] text-gray-800 leading-relaxed">
                프리셋 카드 하단 색상 도트 클릭으로 즉시 색상 전환
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 프리셋 목록 */}
      <Card>
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
          onImportCustom={onImportCustom}
          onToggleFavorite={onToggleFavorite}
          inline
        />
      </Card>
    </div>
  );
}