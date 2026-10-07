'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { InputPanel } from '@/components/InputPanel';
import { PresetPicker } from '@/components/PresetPicker';
import { HorizontalSlideStrip } from '@/components/HorizontalSlideStrip';
import { DraggableCardPreview } from '@/components/DraggableCardPreview';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { ProjectList } from '@/components/ProjectList';
import { SlideStyleEditor } from '@/components/SlideStyleEditor';
import { generateImage } from '@/lib/imagegen';
import type { Preset, Settings, Slide, CardNewsProject } from '@/lib/types';
import {
  Sparkles,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Palette,
  PencilRuler,
  Loader2,
  MapPin,
  Save,
  FolderOpen,
  Plus,
  Type,
} from 'lucide-react';

export function CreateView({
  settings,
  slides,
  onSlidesChange,
  preset,
  presetColorId,
  onPresetChange,
  customPresets,
  favorites,
  stats,
  onSaveCustom,
  onDeleteCustom,
  onImportPresets,
  onToggleFavorite,
  cardRefs,
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onRenameProject,
  onCreateNew,
  onSaveProject,
  onBatchLockChange,
}: {
  settings: Settings;
  slides: Slide[];
  onSlidesChange: (s: Slide[]) => void;
  preset: Preset;
  presetColorId?: string;
  onPresetChange: (p: Preset, colorId?: string) => void;
  customPresets: Preset[];
  favorites: string[];
  stats: Record<string, number>;
  onSaveCustom: (name: string) => void;
  onDeleteCustom: (id: string) => void;
  onImportPresets: (p: Preset[]) => void;
  onToggleFavorite: (id: string) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  onSelectProject: (p: CardNewsProject) => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onCreateNew: () => void;
  onSaveProject: () => void;
  onBatchLockChange?: (locked: boolean) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [colorId, setColorId] = useState(presetColorId || preset.colorVariants[0]?.id);
  const [rightTab, setRightTab] = useState<'content' | 'style'>('content');

  const autoGenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (presetColorId && presetColorId !== colorId) setColorId(presetColorId);
  }, [presetColorId, colorId]);

  useEffect(() => {
    if (selectedIdx >= slides.length && slides.length > 0) {
      setSelectedIdx(slides.length - 1);
    }
  }, [slides.length, selectedIdx]);

  // 첫 카드 자동 이미지
  useEffect(() => {
    if (slides.length === 0) return;
    const first = slides[0];
    if (!first.imageUrl && first.imagePrompt && !autoGenRef.current.has(first.id)) {
      if (settings.cfAccountId && settings.cfApiToken) {
        autoGenRef.current.add(first.id);
        setTimeout(() => {
          genImgInternal(0);
        }, 800);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length, settings.cfAccountId, settings.cfApiToken]);

  const selected = slides[selectedIdx];
  const isLast = selectedIdx === slides.length - 1;
  const currentProject = projects.find((p) => p.id === currentProjectId);

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

  async function genImgInternal(i: number) {
    const s = slides[i];
    if (!s.imagePrompt.trim()) return;
    if (!settings.cfAccountId || !settings.cfApiToken) return;

    setGeneratingIdx(i);
    try {
      const url = await generateImage(
        settings.cfAccountId,
        settings.cfApiToken,
        s.imagePrompt,
        { workerUrl: settings.workerUrl }
      );
      update(i, { imageUrl: url });
    } catch (e: any) {
      console.error(`슬라이드 ${i + 1} 이미지 실패:`, e);
    } finally {
      setGeneratingIdx(null);
    }
  }

  async function genImg(i: number) {
    if (!slides[i].imagePrompt.trim()) {
      alert('이미지 프롬프트가 비어 있습니다.');
      return;
    }
    if (!settings.cfAccountId || !settings.cfApiToken) {
      alert('설정에서 Cloudflare 정보를 입력하세요.');
      return;
    }
    await genImgInternal(i);
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
    if (!confirm(`이미지가 없는 ${targets.length}개 슬라이드의 이미지를 순차 생성할까요?`))
      return;

    onBatchLockChange?.(true);
    setBatchLoading(true);
    setBatchProgress({ current: 0, total: targets.length });

    const workingSlides = [...slides];

    for (let k = 0; k < targets.length; k++) {
      const { s, i } = targets[k];
      setBatchProgress({ current: k + 1, total: targets.length });
      if (!s.imagePrompt.trim()) continue;
      try {
        const url = await generateImage(
          settings.cfAccountId,
          settings.cfApiToken,
          s.imagePrompt,
          { workerUrl: settings.workerUrl }
        );
        workingSlides[i] = { ...workingSlides[i], imageUrl: url };
        onSlidesChange([...workingSlides]);
        await new Promise((r) => setTimeout(r, 1200));
      } catch (e) {
        console.error(`슬라이드 ${i + 1} 실패:`, e);
      }
    }

    setBatchLoading(false);
    setBatchProgress({ current: 0, total: 0 });
    onBatchLockChange?.(false);

    setTimeout(() => {
      onSaveProject?.();
    }, 500);
  }

  if (slides.length === 0) {
    return (
      <>
        <div className="max-w-2xl mx-auto mt-12 space-y-4">
          <Card>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
                <Sparkles size={28} />
              </div>
              <div className="text-lg font-semibold mb-1">카드뉴스를 시작해보세요</div>
              <div className="text-sm text-ink-secondary mb-6">
                키워드, 블로그 URL, 또는 직접 텍스트로 생성할 수 있습니다
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  size="lg"
                  icon={<Sparkles size={18} />}
                  onClick={() => setSourceModalOpen(true)}
                >
                  카드뉴스 소스 입력
                </Button>
                {projects.length > 0 && (
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={<FolderOpen size={18} />}
                    onClick={() => setProjectListOpen(true)}
                  >
                    저장된 카드뉴스 ({projects.length})
                  </Button>
                )}
              </div>
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
              autoGenRef.current.clear();
              onSlidesChange(s);
              setSelectedIdx(0);
              setSourceModalOpen(false);
            }}
          />
        </Modal>

        <ProjectList
          open={projectListOpen}
          onClose={() => setProjectListOpen(false)}
          projects={projects}
          customPresets={customPresets}
          currentProjectId={currentProjectId || undefined}
          onSelect={onSelectProject}
          onDelete={onDeleteProject}
          onRename={onRenameProject}
          onCreate={() => {
            setProjectListOpen(false);
            onCreateNew();
          }}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* 상단 툴바 */}
        <Card padding={false} className="px-4 py-2.5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="primary">
              {currentProject ? currentProject.name.slice(0, 15) : '새 카드뉴스'}
            </Badge>
            <span className="text-xs text-ink-muted hidden md:inline">
              {slides.length}장
            </span>
          </div>

          <div className="flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              icon={<Save size={14} />}
              onClick={onSaveProject}
            >
              저장
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<FolderOpen size={14} />}
              onClick={() => setProjectListOpen(true)}
            >
              내 카드뉴스 ({projects.length})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              icon={<Plus size={14} />}
              onClick={onCreateNew}
              title="새 카드뉴스"
            />
          </div>

          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-surface-border">
            <span className="text-xs text-ink-muted mr-1 hidden lg:inline">색상:</span>
            {preset.colorVariants.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setColorId(c.id);
                  onPresetChange(preset, c.id);
                }}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  colorId === c.id
                    ? 'border-primary-500 scale-110'
                    : 'border-white shadow-sm hover:scale-110'
                }`}
                style={{ background: c.accent }}
                title={c.name}
              />
            ))}
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
              icon={
                batchLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )
              }
              onClick={genAllImages}
              disabled={batchLoading}
            >
              {batchLoading
                ? `생성 중 ${batchProgress.current}/${batchProgress.total}`
                : '모든 이미지 생성'}
            </Button>
          </div>
        </Card>

        {/* 상단 가로 슬라이드 스트립 */}
        <Card padding={false} className="py-3">
          <HorizontalSlideStrip
            slides={slides}
            preset={preset}
            colorId={colorId}
            brand={settings.brand}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        </Card>

        {/* 2컬럼 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            {selected && (
              <DraggableCardPreview
                slide={selected}
                preset={preset}
                colorId={colorId}
                brand={settings.brand}
                isLast={isLast}
                onSlideChange={(s) => update(selectedIdx, s)}
                onOpenPhoneMockup={() => setPhoneModalOpen(true)}
              />
            )}
          </div>

          <div className="lg:col-span-5">
            <Card className="sticky top-20">
              <CardHeader
                title={`슬라이드 #${selectedIdx + 1}`}
                subtitle={`${selected?.type.toUpperCase()}${
                  isLast ? ' · 마지막' : ''
                }`}
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
                <div className="space-y-3">
                  <Tabs
                    tabs={[
                      { id: 'content', label: '내용', icon: <PencilRuler size={12} /> },
                      { id: 'style', label: '스타일', icon: <Type size={12} /> },
                    ]}
                    active={rightTab}
                    onChange={(v) => setRightTab(v as any)}
                  />

                  <div className="max-h-[calc(100vh-380px)] overflow-y-auto pr-1">
                    {rightTab === 'content' && (
                      <div className="space-y-3">
                        <Input
                          label="헤드라인"
                          value={selected.headline}
                          onChange={(e) =>
                            update(selectedIdx, { headline: e.target.value })
                          }
                          placeholder="15자 이내"
                        />
                        <Textarea
                          label="본문"
                          value={selected.body}
                          onChange={(e) =>
                            update(selectedIdx, { body: e.target.value })
                          }
                          placeholder="40자 이내"
                          rows={3}
                        />
                        {selected.type === 'data' && (
                          <Input
                            label="강조 숫자"
                            value={selected.highlight}
                            onChange={(e) =>
                              update(selectedIdx, { highlight: e.target.value })
                            }
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
                            onChange={(e) =>
                              update(selectedIdx, { imagePrompt: e.target.value })
                            }
                            placeholder="A clean modern office..."
                            rows={3}
                            className="font-mono text-xs"
                          />

                          <div className="flex items-center gap-2 mt-3">
                            <Select
                              value={selected.imageLayout}
                              onChange={(e) =>
                                update(selectedIdx, {
                                  imageLayout: e.target.value as any,
                                })
                              }
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
                              {generatingIdx === selectedIdx
                                ? '생성 중...'
                                : '이미지 생성'}
                            </Button>
                          </div>

                          {selected.imageUrl && (
                            <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-primary-50 border border-primary-200">
                              <img
                                src={selected.imageUrl}
                                alt=""
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="text-xs text-primary-700 flex-1">
                                이미지 준비됨
                              </div>
                              <button
                                onClick={() =>
                                  update(selectedIdx, { imageUrl: '' })
                                }
                                className="p-1 rounded text-primary-700 hover:bg-primary-100"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-3">
                          <div className="flex items-center gap-2 text-xs text-ink-secondary mb-2">
                            <MapPin size={12} />
                            <span>미리보기에서 드래그로 위치 조정</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {rightTab === 'style' && (
                      <SlideStyleEditor
                        slide={selected}
                        preset={preset}
                        onChange={(patch) => update(selectedIdx, patch)}
                      />
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <Modal
        open={presetModalOpen}
        onClose={() => setPresetModalOpen(false)}
        title="프리셋 선택"
        maxWidth="xl"
      >
        <PresetPicker
          current={preset}
          currentColorId={colorId}
          customPresets={customPresets}
          favorites={favorites}
          stats={stats}
          brand={settings.brand}
          onSelect={(p, cid) => {
            onPresetChange(p, cid);
            if (cid) setColorId(cid);
          }}
          onColorChange={(cid) => {
            setColorId(cid);
            onPresetChange(preset, cid);
          }}
          onSaveCustom={onSaveCustom}
          onDeleteCustom={onDeleteCustom}
          onImport={onImportPresets}
          onToggleFavorite={onToggleFavorite}
        />
      </Modal>

      <Modal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        title="카드뉴스 소스"
        maxWidth="lg"
      >
        <InputPanel
          settings={settings}
          onSlides={(s) => {
            autoGenRef.current.clear();
            onSlidesChange(s);
            setSelectedIdx(0);
            setSourceModalOpen(false);
          }}
        />
      </Modal>

      <Modal
        open={phoneModalOpen}
        onClose={() => setPhoneModalOpen(false)}
        title="스마트폰에서 보기"
        maxWidth="md"
      >
        {selected && (
          <PhoneMockup
            slide={selected}
            preset={preset}
            colorId={colorId}
            brand={settings.brand}
            isLast={isLast}
          />
        )}
      </Modal>

      <ProjectList
        open={projectListOpen}
        onClose={() => setProjectListOpen(false)}
        projects={projects}
        customPresets={customPresets}
        currentProjectId={currentProjectId || undefined}
        onSelect={onSelectProject}
        onDelete={onDeleteProject}
        onRename={onRenameProject}
        onCreate={() => {
          setProjectListOpen(false);
          onCreateNew();
        }}
      />
    </>
  );
}