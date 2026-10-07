'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { InputPanel } from '@/components/InputPanel';
import { PresetPicker } from '@/components/PresetPicker';
import { CardSlide } from '@/templates';
import { generateImage } from '@/lib/imagegen';
import type { Preset, Settings, Slide } from '@/lib/types';
import {
  Sparkles,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Palette,
  PencilRuler,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';

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
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);

  useEffect(() => {
    if (selectedIdx >= slides.length && slides.length > 0) {
      setSelectedIdx(slides.length - 1);
    }
  }, [slides.length, selectedIdx]);

  const selected = slides[selectedIdx];

  const update = (i: number, patch: Partial<Slide>) => {
    onSlidesChange(slides.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const removeSlide = (i: number) => {
    if (!confirm(`슬라이드 #${i + 1}을(를) 삭제할까요?`)) return;
    const next = slides.filter((_, idx) => idx !== i);
    onSlidesChange(next);
    if (selectedIdx >= next.length) setSelectedIdx(Math.max(0, next.length - 1));
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const next = [...slides];
    [next[i], next[j]] = [next[j], next[i]];
    onSlidesChange(next);
    setSelectedIdx(j);
  };

  async function genImg(i: number) {
    const s = slides[i];
    if (!s.imagePrompt.trim()) {
      alert('이미지 프롬프트가 비어 있습니다.');
      return;
    }
    if (!settings.cfAccountId || !settings.cfApiToken) {
      alert('설정에서 Cloudflare 정보를 입력하세요.');
      return;
    }
    setGeneratingIdx(i);
    try {
      const url = await generateImage(settings.cfAccountId, settings.cfApiToken, s.imagePrompt, {
        workerUrl: settings.workerUrl,
      });
      update(i, { imageUrl: url });
    } catch (e: any) {
      alert(`이미지 생성 실패: ${e.message}`);
    } finally {
      setGeneratingIdx(null);
    }
  }

  async function genAllImages() {
    if (!settings.cfAccountId || !settings.cfApiToken) {
      alert('설정에서 Cloudflare 정보를 입력하세요.');
      return;
    }
    const targets = slides.map((s, i) => ({ s, i })).filter(({ s }) => !s.imageUrl);
    if (targets.length === 0) {
      alert('모든 슬라이드에 이미지가 이미 있습니다.');
      return;
    }
    if (!confirm(`이미지가 없는 ${targets.length}개 슬라이드의 이미지를 순차 생성할까요?`)) return;

    setBatchLoading(true);
    setBatchProgress({ current: 0, total: targets.length });

    for (let k = 0; k < targets.length; k++) {
      const { s, i } = targets[k];
      setBatchProgress({ current: k + 1, total: targets.length });
      if (!s.imagePrompt.trim()) continue;
      try {
        const url = await generateImage(settings.cfAccountId, settings.cfApiToken, s.imagePrompt, {
          workerUrl: settings.workerUrl,
        });
        update(i, { imageUrl: url });
        await new Promise((r) => setTimeout(r, 1200));
      } catch (e) {
        console.error(`슬라이드 ${i + 1} 실패:`, e);
      }
    }
    setBatchLoading(false);
    setBatchProgress({ current: 0, total: 0 });
  }

  if (slides.length === 0) {
    return (
      <>
        <div className="max-w-2xl mx-auto mt-12">
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <Sparkles size={28} />
              </div>
              <div className="text-lg font-semibold mb-1">카드뉴스를 시작해보세요</div>
              <div className="text-sm text-ink-secondary mb-6">
                키워드, 블로그 URL, 또는 직접 텍스트로 생성할 수 있습니다
              </div>
              <Button
                size="lg"
                icon={<Sparkles size={18} />}
                onClick={() => setSourceModalOpen(true)}
              >
                카드뉴스 소스 입력
              </Button>
            </div>
          </Card>
        </div>

        <Modal
          open={sourceModalOpen}
          onClose={() => setSourceModalOpen(false)}
          title="카드뉴스 소스"
          maxWidth="lg"
        >
          <InputPanel
            settings={settings}
            onSlides={(s) => {
              onSlidesChange(s);
              setSelectedIdx(0);
              setSourceModalOpen(false);
            }}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 상단 툴바 */}
      <Card padding={false} className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <Badge variant="primary">{slides.length}장</Badge>
        <div className="text-sm text-ink-secondary">
          이미지 {slides.filter((s) => s.imageUrl).length}장 생성됨
        </div>

        <div className="ml-auto flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="ghost"
            icon={<Palette size={14} />}
            onClick={() => setPresetModalOpen(true)}
          >
            {preset.name}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<PencilRuler size={14} />}
            onClick={() => setSourceModalOpen(true)}
          >
            소스 재입력
          </Button>
          <Button
            size="sm"
            icon={batchLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            onClick={genAllImages}
            disabled={batchLoading}
          >
            {batchLoading
              ? `생성 중 ${batchProgress.current}/${batchProgress.total}`
              : '모든 이미지 생성'}
          </Button>
        </div>
      </Card>

      {/* 3컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* 좌측: 슬라이드 목록 (2열 그리드) */}
        <div className="lg:col-span-3">
          <Card padding={false} className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-ink-secondary flex items-center justify-between">
              <span>슬라이드</span>
              <span className="text-primary-600">{slides.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[calc(100vh-240px)] overflow-y-auto pr-0.5">
              {slides.map((s, i) => (
                <SlideThumb
                  key={s.id}
                  slide={s}
                  preset={preset}
                  index={i}
                  selected={selectedIdx === i}
                  hasImage={!!s.imageUrl}
                  onClick={() => setSelectedIdx(i)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* 중앙: 실시간 미리보기 */}
        <div className="lg:col-span-5">
          <Card padding={false} className="p-3 sticky top-20">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-sm font-semibold">미리보기 #{selectedIdx + 1}</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}
                  disabled={selectedIdx === 0}
                  className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setSelectedIdx(Math.min(slides.length - 1, selectedIdx + 1))}
                  disabled={selectedIdx === slides.length - 1}
                  className="p-1.5 rounded-lg hover:bg-surface-hover disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* 카드 미리보기 (세로 중앙 정렬) */}
            <div className="flex items-center justify-center bg-gray-100 rounded-xl p-4">
              <div
                className="rounded-xl overflow-hidden border shadow-card bg-white"
                style={{ width: '100%', maxWidth: 380, aspectRatio: '1080 / 1350' }}
              >
                <div
                  style={{
                    width: 1080,
                    height: 1350,
                    transform: 'scale(0.352)',
                    transformOrigin: 'top left',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    {slides.map((s, i) => (
                      <div
                        key={s.id}
                        ref={(el) => (cardRefs.current[i] = el)}
                        style={{
                          position: i === selectedIdx ? 'relative' : 'absolute',
                          top: 0,
                          left: 0,
                          visibility: i === selectedIdx ? 'visible' : 'hidden',
                        }}
                      >
                        <CardSlide slide={s} preset={preset} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 슬라이드 인디케이터 */}
            <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === selectedIdx
                      ? 'w-6 bg-primary-600'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* 우측: 편집 폼 */}
        <div className="lg:col-span-4">
          <Card className="sticky top-20">
            <CardHeader
              title={`슬라이드 #${selectedIdx + 1}`}
              subtitle={selected?.type.toUpperCase()}
              action={
                <div className="flex gap-1">
                  <button
                    onClick={() => move(selectedIdx, -1)}
                    disabled={selectedIdx === 0}
                    className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => move(selectedIdx, 1)}
                    disabled={selectedIdx === slides.length - 1}
                    className="p-1.5 rounded-lg bg-surface-hover hover:bg-gray-200 disabled:opacity-30"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => removeSlide(selectedIdx)}
                    className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />

            {selected && (
              <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
                <Input
                  label="헤드라인"
                  value={selected.headline}
                  onChange={(e) => update(selectedIdx, { headline: e.target.value })}
                  placeholder="15자 이내"
                />
                <Textarea
                  label="본문"
                  value={selected.body}
                  onChange={(e) => update(selectedIdx, { body: e.target.value })}
                  placeholder="40자 이내"
                  rows={3}
                />
                {selected.type === 'data' && (
                  <Input
                    label="강조 숫자"
                    value={selected.highlight}
                    onChange={(e) => update(selectedIdx, { highlight: e.target.value })}
                    placeholder="예: 300만원"
                  />
                )}

                <div className="border-t pt-3">
                  <div className="text-xs font-semibold text-ink-secondary mb-2">
                    🖼 이미지
                  </div>
                  <Textarea
                    label="프롬프트 (영어)"
                    value={selected.imagePrompt}
                    onChange={(e) => update(selectedIdx, { imagePrompt: e.target.value })}
                    placeholder="A clean modern office..."
                    rows={3}
                    className="font-mono text-xs"
                  />

                  <div className="flex items-center gap-2 mt-3">
                    <Select
                      value={selected.imageLayout}
                      onChange={(e) => update(selectedIdx, { imageLayout: e.target.value as any })}
                      className="!w-auto"
                    >
                      <option value="none">이미지 없음</option>
                      <option value="full-bleed">전체 배경</option>
                      <option value="top-image">상단</option>
                      <option value="split">좌우 분할</option>
                    </Select>

                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<ImageIcon size={14} />}
                      loading={generatingIdx === selectedIdx}
                      onClick={() => genImg(selectedIdx)}
                      disabled={generatingIdx !== null || batchLoading}
                      className="ml-auto"
                    >
                      {generatingIdx === selectedIdx ? '생성 중...' : '이미지 생성'}
                    </Button>
                  </div>

                  {selected.imageUrl && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-green-50 border border-green-200">
                      <img
                        src={selected.imageUrl}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="text-xs text-green-700 flex-1">이미지 준비됨</div>
                      <button
                        onClick={() => update(selectedIdx, { imageUrl: '' })}
                        className="p-1 rounded text-green-700 hover:bg-green-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 프리셋 모달 */}
      <Modal
        open={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        title="프리셋 선택"
        maxWidth="xl"
      >
        <PresetPicker
          current={preset}
          customPresets={customPresets}
          onSelect={(p) => {
            onPresetChange(p);
            setPresetModalOpen(false);
          }}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
        />
      </Modal>

      {/* 소스 재입력 모달 */}
      <Modal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        title="카드뉴스 소스"
        maxWidth="lg"
      >
        <InputPanel
          settings={settings}
          onSlides={(s) => {
            onSlidesChange(s);
            setSelectedIdx(0);
            setSourceModalOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

function SlideThumb({
  slide,
  preset,
  index,
  selected,
  hasImage,
  onClick,
}: {
  slide: Slide;
  preset: Preset;
  index: number;
  selected: boolean;
  hasImage: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'ring-2 ring-primary-500'
          : 'border border-surface-border hover:border-primary-300'
      }`}
      onClick={onClick}
    >
      <div className="relative w-full" style={{ aspectRatio: '4 / 5' }}>
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: 'scale(0.09)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <CardSlide slide={slide} preset={preset} />
        </div>

        <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1 py-0.5 rounded">
          #{index + 1}
        </div>

        {hasImage && (
          <div className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded">
            IMG
          </div>
        )}
      </div>
    </div>
  );
}