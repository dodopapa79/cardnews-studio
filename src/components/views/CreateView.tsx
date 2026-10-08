'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { InputPanel } from '@/components/InputPanel';
import { PresetStrip } from '@/components/PresetStrip';
import { HorizontalSlideStrip } from '@/components/HorizontalSlideStrip';
import { DraggableCardPreview } from '@/components/DraggableCardPreview';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { ProjectList } from '@/components/ProjectList';
import { SlideStyleEditor } from '@/components/SlideStyleEditor';
import { generateImage } from '@/lib/imagegen';
import { exportCardsAsZip } from '@/lib/card-renderer';
import type {
  Preset,
  Settings,
  Slide,
  CardNewsProject,
  CardSize,
} from '@/lib/types';
import { CARD_SIZE_DIMENSIONS } from '@/lib/types';
import {
  Sparkles,
  Image as ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  Save,
  FolderOpen,
  Plus,
  Download,
  FilePlus,
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
  onImportCustom,
  onToggleFavorite,
  cardRefs,
  projects,
  currentProjectId,
  cardSize,
  onCardSizeChange,
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
  onImportCustom?: (p: Preset) => void;
  onToggleFavorite: (id: string) => void;
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  cardSize: CardSize;
  onCardSizeChange: (s: CardSize) => void;
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
  const [colorId, setColorId] = useState(presetColorId || preset.colorVariants[0]?.id);
  const [sourcePanelOpen, setSourcePanelOpen] = useState(false);
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exporting, setExporting] = useState('');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const autoGenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (presetColorId && presetColorId !== colorId) setColorId(presetColorId);
  }, [presetColorId, colorId]);

  useEffect(() => {
    if (selectedIdx >= slides.length && slides.length > 0) {
      setSelectedIdx(slides.length - 1);
    }
  }, [slides.length, selectedIdx]);

  // 슬라이드 이동 시 선택된 요소 초기화
  useEffect(() => {
    setSelectedElement(null);
  }, [selectedIdx]);

  // 첫 카드 자동 이미지
  useEffect(() => {
    if (slides.length === 0) return;
    const first = slides[0];
    if (!first.imageUrl && first.imagePrompt && !autoGenRef.current.has(first.id)) {
      if (settings.cfAccountId && settings.cfApiToken) {
        autoGenRef.current.add(first.id);
        setTimeout(() => genImgInternal(0), 800);
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
      console.error(`슬라이드 ${i + 1} 실패:`, e);
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
    if (!confirm(`${targets.length}개 슬라이드의 이미지를 순차 생성할까요?`)) return;

    onBatchLockChange?.(true);
    setBatchLoading(true);
    setBatchProgress({ current: 0, total: targets.length });
    const working = [...slides];

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
        working[i] = { ...working[i], imageUrl: url };
        onSlidesChange([...working]);
        await new Promise((r) => setTimeout(r, 1200));
      } catch (e) {
        console.error(`슬라이드 ${i + 1} 실패:`, e);
      }
    }
    setBatchLoading(false);
    setBatchProgress({ current: 0, total: 0 });
    onBatchLockChange?.(false);
    setTimeout(() => onSaveProject?.(), 500);
  }

  async function handleExport(size: CardSize) {
    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) {
      alert('카드가 없습니다.');
      return;
    }
    setExporting(size);
    setExportMenuOpen(false);
    try {
      await exportCardsAsZip(nodes, `cardnews-${size}-${Date.now()}.zip`, (i, total) =>
        setExporting(`${i}/${total}`)
      );
    } finally {
      setExporting('');
    }
  }

  // ═══════════════════════════════════════
  // 빈 상태
  // ═══════════════════════════════════════
  if (slides.length === 0) {
    return (
      <>
        <div className="max-w-2xl mx-auto mt-8 space-y-4">
          <Card>
            <CardHeader title="카드 사이즈 선택" subtitle="먼저 사이즈를 고르세요" />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onCardSizeChange('instagram')}
                className={`p-5 rounded-xl border-2 transition text-center ${
                  cardSize === 'instagram'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div
                    className="bg-gradient-to-br from-primary-500 to-primary-700 rounded"
                    style={{ width: 60, height: 75 }}
                  />
                </div>
                <div className="font-semibold text-base">인스타그램</div>
                <div className="text-xs text-ink-muted mt-1">1080 × 1350 (4:5)</div>
              </button>
              <button
                onClick={() => onCardSizeChange('square')}
                className={`p-5 rounded-xl border-2 transition text-center ${
                  cardSize === 'square'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-border hover:border-primary-300'
                }`}
              >
                <div className="flex justify-center mb-3">
                  <div
                    className="bg-gradient-to-br from-primary-500 to-primary-700 rounded"
                    style={{ width: 75, height: 75 }}
                  />
                </div>
                <div className="font-semibold text-base">정사각형</div>
                <div className="text-xs text-ink-muted mt-1">1080 × 1080 (1:1)</div>
              </button>
            </div>
          </Card>

          <Card>
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-3">
                <Sparkles size={24} />
              </div>
              <div className="text-base font-semibold mb-1">
                새 카드뉴스를 시작하세요
              </div>
              <div className="text-sm text-ink-secondary mb-5">
                키워드, 블로그 URL, 또는 직접 텍스트로 생성
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button
                  size="lg"
                  icon={<Plus size={18} />}
                  onClick={() => setSourcePanelOpen(true)}
                >
                  새로 제작
                </Button>
                {projects.length > 0 && (
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={<FolderOpen size={18} />}
                    onClick={() => setProjectListOpen(true)}
                  >
                    목록에서 불러오기 ({projects.length})
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {sourcePanelOpen && (
            <Card>
              <CardHeader
                title="카드뉴스 소스 입력"
                action={
                  <button
                    onClick={() => setSourcePanelOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-secondary"
                  >
                    <X size={16} />
                  </button>
                }
              />
              <InputPanel
                settings={settings}
                onSlides={(s) => {
                  autoGenRef.current.clear();
                  onSlidesChange(s);
                  setSelectedIdx(0);
                  setSourcePanelOpen(false);
                }}
              />
            </Card>
          )}
        </div>

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

  // ═══════════════════════════════════════
  // 편집 화면
  // ═══════════════════════════════════════
  return (
    <>
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* ═══ 상단 툴바 ═══ */}
        <Card padding={false} className="px-4 py-2.5 flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            icon={<FilePlus size={14} />}
            onClick={onCreateNew}
          >
            새로 제작
          </Button>

          <div className="h-6 w-px bg-surface-border" />

          <Badge variant="primary">
            {currentProject ? currentProject.name.slice(0, 12) : '새 카드뉴스'}
          </Badge>
          <span className="text-sm text-ink-muted hidden md:inline">
            {slides.length}장
          </span>

          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => onCardSizeChange('instagram')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition ${
                cardSize === 'instagram'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              인스타 4:5
            </button>
            <button
              onClick={() => onCardSizeChange('square')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium transition ${
                cardSize === 'square'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              정사각형 1:1
            </button>
          </div>

          <div className="ml-auto flex gap-1.5 flex-wrap">
            {/* 색상 도트 */}
            <div className="flex items-center gap-1 pr-2 border-r border-surface-border">
              {preset.colorVariants.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setColorId(c.id);
                    onPresetChange(preset, c.id);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    colorId === c.id
                      ? 'border-primary-500 scale-110'
                      : 'border-white shadow-sm hover:scale-110'
                  }`}
                  style={{ background: c.accent }}
                  title={c.name}
                />
              ))}
            </div>

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
              목록
            </Button>

            {/* 삭제 */}
            {currentProjectId && (
              <Button
                size="sm"
                variant="danger"
                icon={<Trash2 size={14} />}
                onClick={() => {
                  if (
                    confirm(
                      `"${currentProject?.name}" 카드뉴스를 삭제할까요?\n\n삭제하면 복구할 수 없습니다.`
                    )
                  ) {
                    onDeleteProject(currentProjectId);
                  }
                }}
              >
                삭제
              </Button>
            )}

            {/* PNG */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                icon={<Download size={14} />}
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                loading={!!exporting}
              >
                {exporting ? exporting : 'PNG 저장'}
              </Button>
              {exportMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-surface-border p-1 z-30 min-w-[200px]">
                  <button
                    onClick={() => handleExport('instagram')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded flex items-center justify-between"
                  >
                    <span>인스타 4:5</span>
                    <span className="text-ink-muted text-xs">1080 × 1350</span>
                  </button>
                  <button
                    onClick={() => handleExport('square')}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-hover rounded flex items-center justify-between"
                  >
                    <span>정사각형 1:1</span>
                    <span className="text-ink-muted text-xs">1080 × 1080</span>
                  </button>
                </div>
              )}
            </div>

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
                ? `${batchProgress.current}/${batchProgress.total}`
                : '이미지 생성'}
            </Button>
          </div>
        </Card>

        {/* ═══ 프리셋 1줄 스트립 ═══ */}
        <Card padding={false} className="px-3 py-2">
          <PresetStrip
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
            onImportCustom={onImportCustom || (() => {})}
            onToggleFavorite={onToggleFavorite}
          />
        </Card>

        {/* ═══ 슬라이드 스트립 ═══ */}
        <Card padding={false} className="py-3">
          <HorizontalSlideStrip
            slides={slides}
            preset={preset}
            colorId={colorId}
            brand={settings.brand}
            cardSize={cardSize}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        </Card>

        {/* ═══ 2컬럼 ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            {selected && (
              <DraggableCardPreview
                slide={selected}
                preset={preset}
                colorId={colorId}
                brand={settings.brand}
                isLast={isLast}
                cardSize={cardSize}
                onSlideChange={(s) => update(selectedIdx, s)}
                onOpenPhoneMockup={() => setPhoneModalOpen(true)}
                onElementSelect={(el) => {
                  setSelectedElement(el);
                }}
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
                  {/* 콘텐츠 편집 */}
                  <div className="space-y-3">
                    <Input
                      label="라벨"
                      value={selected.label}
                      onChange={(e) =>
                        update(selectedIdx, { label: e.target.value })
                      }
                      placeholder="예: TRAVEL, NEWS"
                    />
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
                      placeholder="60자 이내"
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
                  </div>

                  {/* 이미지 */}
                  <div className="border-t pt-3">
                    <div className="text-sm font-semibold text-ink-secondary mb-2">
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

                    {/* 한글 설명 (읽기 전용 참고) */}
                    {selected.imagePromptKo && (
                      <div className="mt-2 text-xs text-ink-muted bg-surface-bg rounded-lg p-2.5 leading-relaxed">
                        <span className="font-medium text-ink-secondary">
                          참고:{' '}
                        </span>
                        {selected.imagePromptKo}
                      </div>
                    )}

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
                      <div className="mt-3 rounded-xl border-2 border-primary-200 overflow-hidden">
                        <img
                          src={selected.imageUrl}
                          alt=""
                          className="w-full max-h-72 object-contain bg-gray-100"
                        />
                        <div className="flex items-center gap-2 p-2 bg-primary-50">
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
                      </div>
                    )}
                  </div>

                  {/* 스타일 편집기 — 요소 선택 시 표시 */}
                  <div className="border-t pt-3">
                    <SlideStyleEditor
                      slide={selected}
                      preset={preset}
                      colorId={colorId}
                      onChange={(patch) => update(selectedIdx, patch)}
                      selectedElement={selectedElement}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

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