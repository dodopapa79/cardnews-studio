'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { InputPanel } from '@/components/InputPanel';
import { SlideEditor } from '@/components/SlideEditor';
import { CardPreview } from '@/components/CardPreview';
import { PresetPicker } from '@/components/PresetPicker';
import { Tabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import type { Preset, Settings, Slide } from '@/lib/types';
import { Eye, PencilRuler, Palette } from 'lucide-react';

export function CreateView({
  settings,
  slides,
  onSlidesChange,
  preset,
  onPresetChange,
  customPresets,
  onSaveCustom,
  onDeleteCustom,
  cardRefs,
}: {
  settings: Settings;
  slides: Slide[];
  onSlidesChange: (s: Slide[]) => void;
  preset: Preset;
  onPresetChange: (p: Preset) => void;
  customPresets: Preset[];
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [leftTab, setLeftTab] = useState('input');
  const [rightTab, setRightTab] = useState('preview');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 입력/프리셋 */}
        <div className="lg:col-span-4 space-y-4">
          <Card padding={false} className="p-1.5">
            <Tabs
              tabs={[
                { id: 'input', label: '입력', icon: <PencilRuler size={14} /> },
                { id: 'preset', label: '프리셋', icon: <Palette size={14} /> },
              ]}
              active={leftTab}
              onChange={setLeftTab}
            />
          </Card>

          {leftTab === 'input' && (
            <InputPanel settings={settings} onSlides={onSlidesChange} />
          )}

          {leftTab === 'preset' && (
            <PresetPicker
              current={preset}
              customPresets={customPresets}
              onSelect={onPresetChange}
              onSaveCustom={onSaveCustom}
              onDeleteCustom={onDeleteCustom}
            />
          )}
        </div>

        {/* 우측: 편집/미리보기 */}
        <div className="lg:col-span-8 space-y-4">
          {slides.length === 0 ? (
            <Card>
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                  <PencilRuler size={28} />
                </div>
                <div className="text-base font-semibold mb-1">
                  카드뉴스를 만들어보세요
                </div>
                <div className="text-sm text-ink-secondary">
                  좌측에서 키워드나 블로그 URL을 입력하면 자동으로 생성됩니다
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card padding={false} className="p-1.5">
                <Tabs
                  tabs={[
                    { id: 'preview', label: `미리보기 (${slides.length})`, icon: <Eye size={14} /> },
                    { id: 'edit', label: '편집', icon: <PencilRuler size={14} /> },
                  ]}
                  active={rightTab}
                  onChange={setRightTab}
                />
              </Card>

              {rightTab === 'preview' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {slides.map((s, i) => (
                    <div key={s.id} className="relative">
                      <div
                        className="border rounded-xl overflow-hidden shadow-card bg-white"
                        style={{ aspectRatio: '1080 / 1350' }}
                      >
                        <div
                          style={{
                            width: 1080,
                            height: 1350,
                            transform: 'scale(0.18)',
                            transformOrigin: 'top left',
                          }}
                        >
                          <div ref={(el) => (cardRefs.current[i] = el)}>
                            <CardPreview.Single slide={s} preset={preset} />
                          </div>
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <Badge variant="primary">#{i + 1}</Badge>
                      </div>
                      {s.imageUrl && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="success">이미지</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {rightTab === 'edit' && (
                <SlideEditor
                  slides={slides}
                  onChange={onSlidesChange}
                  settings={settings}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}