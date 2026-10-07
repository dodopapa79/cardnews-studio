'use client';
import { useEffect, useRef, useState } from 'react';
import { SettingsPanel } from '@/components/SettingsPanel';
import { InputPanel } from '@/components/InputPanel';
import { SlideEditor } from '@/components/SlideEditor';
import { CardPreview } from '@/components/CardPreview';
import { ExportPanel } from '@/components/ExportPanel';
import { PresetPicker } from '@/components/PresetPicker';
import {
  loadSettings,
  loadSlides,
  saveSettings,
  saveSlides,
  loadCustomPresets,
  saveCustomPresets,
} from '@/lib/storage';
import {
  EMPTY_SETTINGS,
  type Settings,
  type Slide,
  type Preset,
} from '@/lib/types';
import { STYLE_PRESETS } from '@/presets';

export default function Page() {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [preset, setPreset] = useState<Preset>(STYLE_PRESETS[0]);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [mounted, setMounted] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
    setSettings(loadSettings());
    setCustomPresets(loadCustomPresets());
    const saved = loadSlides();
    if (saved?.length) setSlides(saved);
  }, []);

  useEffect(() => {
    if (slides.length) saveSlides(slides);
  }, [slides]);

  function handleSaveCustom(name: string) {
    const next: Preset = {
      ...preset,
      id: `custom-${Date.now()}`,
      name,
      category: 'custom',
      builtin: false,
    };
    const updated = [...customPresets, next];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    setPreset(next);
  }

  function handleDeleteCustom(id: string) {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    saveCustomPresets(updated);
    if (preset.id === id) setPreset(STYLE_PRESETS[0]);
  }

  if (!mounted) return null;

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <header className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">📰 CardNews Studio</h1>
        <span className="text-xs text-gray-500">v1.0 · 모든 처리는 브라우저에서</span>
      </header>

      <SettingsPanel settings={settings} onChange={setSettings} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 좌 */}
        <div className="lg:col-span-1 space-y-4">
          <InputPanel settings={settings} onSlides={setSlides} />
          <PresetPicker
            current={preset}
            customPresets={customPresets}
            onSelect={setPreset}
            onSaveCustom={handleSaveCustom}
            onDeleteCustom={handleDeleteCustom}
          />
          {slides.length > 0 && <ExportPanel slides={slides} cardRefs={cardRefs} />}
        </div>

        {/* 중앙 */}
        <div className="lg:col-span-1 space-y-4">
          {slides.length > 0 ? (
            <SlideEditor slides={slides} onChange={setSlides} settings={settings} />
          ) : (
            <div className="border-2 border-dashed rounded-xl p-12 text-center text-gray-400">
              왼쪽에서 카드뉴스를 생성하면 여기서 편집할 수 있습니다.
            </div>
          )}
        </div>

        {/* 우 */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            <h3 className="font-semibold">👁 미리보기</h3>
            {slides.length > 0 ? (
              <CardPreview
                slides={slides}
                preset={preset}
                registerRef={(i, el) => (cardRefs.current[i] = el)}
              />
            ) : (
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-gray-400 text-sm">
                미리보기가 여기에 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-400 py-4">
        CardNews Studio · API 키는 브라우저에만 저장됩니다
      </footer>
    </main>
  );
}