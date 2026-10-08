'use client';
import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PhoneMockup } from '@/components/ui/PhoneMockup';
import { CardRenderer } from '@/templates/CardRenderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import { BGM_SOURCES, BGM_CATEGORY_LABELS, getAudioDuration } from '@/lib/bgm';
import { getPresetById } from '@/lib/presets';
import { formatRelativeTime } from '@/lib/utils';
import type { Slide, Preset, CardNewsProject, BrandInfo, UploadedBgm, VideoStyle, VideoTransition } from '@/lib/types';
import { DEFAULT_VIDEO_STYLE } from '@/lib/types';
import { Film, AlertCircle, Music, X, Play, Pause, RotateCcw, FolderOpen, Smartphone, Check, Loader2 } from 'lucide-react';

const TRANSITIONS: { id: VideoTransition; name: string }[] = [
  { id: 'fade', name: '페이드' },
  { id: 'slide', name: '슬라이드' },
  { id: 'slide-up', name: '슬라이드업' },
  { id: 'zoom', name: '줌' },
  { id: 'blur', name: '블러' },
];

const CARD_THUMB_WIDTH = 88;

export function VideoView({
  slides: currentSlides,
  preset: currentPreset,
  brand: currentBrand,
  projects,
  currentProjectId,
  onSelectProject,
}: {
  slides: Slide[];
  preset: Preset;
  brand?: BrandInfo;
  projects: CardNewsProject[];
  currentProjectId: string | null;
  onSelectProject: (p: CardNewsProject) => void;
}) {
  const [selectedSlides, setSelectedSlides] = useState<Slide[]>(currentSlides);
  const [selectedPreset, setSelectedPreset] = useState<Preset>(currentPreset);
  const [selectedBrand, setSelectedBrand] = useState<BrandInfo | undefined>(currentBrand);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(currentProjectId);
  const [videoStyle, setVideoStyle] = useState<VideoStyle>(DEFAULT_VIDEO_STYLE);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [bgm, setBgm] = useState<UploadedBgm | null>(null);
  const [bgmCategory, setBgmCategory] = useState<string>('all');
  const [phoneMockupOpen, setPhoneMockupOpen] = useState(false);

  function loadFromProject(project: CardNewsProject) {
    setSelectedSlides(project.slides);
    setSelectedPreset(getPresetById(project.presetId));
    setSelectedBrand(project.brand);
    setSelectedProjectId(project.id);
  }

  useEffect(() => {
    if (currentProjectId) {
      const proj = projects.find((p) => p.id === currentProjectId);
      if (proj && proj.id !== selectedProjectId) loadFromProject(proj);
    } else if (currentSlides.length > 0 && selectedSlides.length === 0) {
      setSelectedSlides(currentSlides);
      setSelectedPreset(currentPreset);
      setSelectedBrand(currentBrand);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId, projects]);

  const updateVideo = (patch: Partial<VideoStyle>) => setVideoStyle((prev) => ({ ...prev, ...patch }));

  async function handleBgmUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) { alert('오디오 파일만 업로드할 수 있습니다.'); return; }
    try {
      await getAudioDuration(file);
      setBgm({ fileName: file.name, fileType: file.type, file, volume: 0.3, fadeIn: 1, fadeOut: 1.5 });
    } catch { alert('오디오 파일을 읽을 수 없습니다.'); }
    e.target.value = '';
  }

  async function handleGenerate() {
    if (selectedSlides.length === 0) { setError('카드뉴스가 없습니다.'); return; }
    setLoading(true); setProgress(0); setError(''); setStatus('준비 중...');
    try {
      const slidesWithBrand = selectedSlides.map((s) => ({ ...s, __brand: selectedBrand }));
      const blob = await generateShorts({
        slides: slidesWithBrand as any,
        preset: selectedPreset,
        ...videoStyle,
        bgm: bgm ? { file: bgm.file, volume: bgm.volume, fadeIn: bgm.fadeIn, fadeOut: bgm.fadeOut } : undefined,
        onProgress: setProgress,
        onStatus: setStatus,
      });
      downloadBlob(blob, `shorts-${Date.now()}.webm`);
      setStatus('완료!');
    } catch (e: any) {
      setError(e.message || '영상 생성 중 오류');
    } finally {
      setLoading(false);
      setTimeout(() => { setProgress(0); setStatus(''); }, 2000);
    }
  }

  if (selectedSlides.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Card>
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4"><Film size={28} /></div>
            <div className="text-base font-semibold mb-1">저장된 카드뉴스가 없습니다</div>
            <div className="text-sm text-ink-secondary">먼저 카드뉴스를 만들어주세요</div>
          </div>
        </Card>
      </div>
    );
  }

  const currentProjectName = selectedProjectId ? projects.find((p) => p.id === selectedProjectId)?.name : undefined;

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-4">
        <Card padding={false} className="p-3 overflow-hidden">
          <div className="flex items-center gap-2 mb-2 px-1">
            <FolderOpen size={14} className="text-primary-600 shrink-0" />
            <span className="text-sm font-semibold shrink-0">카드뉴스 선택</span>
            <span className="text-xs text-ink-muted">({projects.length}개)</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ height: CARD_THUMB_WIDTH * 1.4 }}>
            {projects.map((p) => {
              const preset = getPresetById(p.presetId);
              const cover = p.slides[0];
              const isCurrent = selectedProjectId === p.id;
              const ratio = p.cardSize === 'square' ? 1 : 4 / 5;
              return (
                <button key={p.id} onClick={() => loadFromProject(p)} className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all text-left relative ${isCurrent ? 'border-primary-500 shadow-md' : 'border-surface-border hover:border-primary-300'}`} style={{ width: CARD_THUMB_WIDTH, height: CARD_THUMB_WIDTH / ratio + 32 }}>
                  <div className="relative bg-white overflow-hidden" style={{ width: CARD_THUMB_WIDTH, height: CARD_THUMB_WIDTH / ratio }}>
                    <div style={{ width: 1080, height: p.cardSize === 'square' ? 1080 : 1350, transform: `scale(${CARD_THUMB_WIDTH / 1080})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
                      {cover && <CardRenderer slide={cover} preset={preset} brand={p.brand} width={1080} height={p.cardSize === 'square' ? 1080 : 1350} />}
                    </div>
                    {isCurrent && <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white"><Check size={11} strokeWidth={3} /></div>}
                  </div>
                  <div className="p-1.5 bg-white">
                    <div className="text-[10px] font-semibold truncate">{p.name}</div>
                    <div className="text-[9px] text-ink-muted">{p.slides.length}장</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 space-y-3">
            <Card>
              <CardHeader title="현재 카드뉴스" subtitle={currentProjectName || ''} />
              <div className="text-sm text-ink-secondary">{selectedSlides.length}장</div>
            </Card>

            <Card>
              <CardHeader title="🎬 전환 효과" />
              <div className="grid grid-cols-5 gap-2 mb-3">
                {TRANSITIONS.map((t) => (
                  <button key={t.id} onClick={() => updateVideo({ transition: t.id })} className={`py-2.5 rounded-lg border text-xs font-medium transition ${videoStyle.transition === t.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-border hover:border-primary-300'}`}>{t.name}</button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-ink-secondary">전환 시간</span>
                    <span className="text-ink-muted">{videoStyle.transitionMs}ms</span>
                  </div>
                  <input type="range" min={200} max={1000} step={50} value={videoStyle.transitionMs} onChange={(e) => updateVideo({ transitionMs: Number(e.target.value) })} className="w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-ink-secondary">슬라이드 시간</span>
                    <span className="text-ink-muted">{(videoStyle.slideDurationMs / 1000).toFixed(1)}s</span>
                  </div>
                  <input type="range" min={1000} max={5000} step={100} value={videoStyle.slideDurationMs} onChange={(e) => updateVideo({ slideDurationMs: Number(e.target.value) })} className="w-full" />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader title="✨ 텍스트 순차 등장" subtitle="라벨 → 제목 → 본문 순서" />
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-ink-secondary">등장 간격</span>
                <span className="text-ink-muted">{videoStyle.textStaggerMs}ms</span>
              </div>
              <input type="range" min={0} max={800} step={50} value={videoStyle.textStaggerMs} onChange={(e) => updateVideo({ textStaggerMs: Number(e.target.value) })} className="w-full" />
            </Card>

            <Card>
              <CardHeader title="🎵 배경음악" />
              {bgm ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-200">
                    <Music size={20} className="text-primary-600" />
                    <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{bgm.fileName}</div><div className="text-xs text-ink-muted">업로드됨</div></div>
                    <button onClick={() => setBgm(null)} className="p-1.5 rounded text-primary-600 hover:bg-primary-100"><X size={16} /></button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block cursor-pointer">
                    <input type="file" accept="audio/*" className="hidden" onChange={handleBgmUpload} />
                    <div className="border-2 border-dashed border-surface-border rounded-lg p-5 text-center hover:border-primary-400 hover:bg-primary-50/30 transition">
                      <Music size={22} className="mx-auto text-ink-muted mb-2" />
                      <div className="text-sm font-medium">음원 파일 업로드</div>
                      <div className="text-xs text-ink-muted mt-1">mp3, wav, m4a</div>
                    </div>
                  </label>
                  <div>
                    <div className="text-xs font-semibold text-ink-secondary mb-2">무료 음원 사이트</div>
                    <div className="flex gap-1 mb-2 flex-wrap">
                      <button onClick={() => setBgmCategory('all')} className={`px-2.5 py-1 rounded text-xs font-medium transition ${bgmCategory === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>전체</button>
                      {Object.entries(BGM_CATEGORY_LABELS).map(([k, v]) => (
                        <button key={k} onClick={() => setBgmCategory(k)} className={`px-2.5 py-1 rounded text-xs font-medium transition ${bgmCategory === k ? 'bg-primary-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{v}</button>
                      ))}
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                      {(bgmCategory === 'all' ? BGM_SOURCES : BGM_SOURCES.filter((s) => s.category === bgmCategory)).map((track) => (
                        <a key={track.id} href={track.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg border border-surface-border hover:border-primary-400 hover:bg-primary-50/30 transition">
                          <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center shrink-0"><Music size={12} /></div>
                          <div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{track.name}</div><div className="text-[10px] text-ink-muted">{track.source}</div></div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <Card padding={false} className="sticky top-20 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">📱 미리보기</div>
                <Button size="sm" variant="ghost" icon={<Smartphone size={14} />} onClick={() => setPhoneMockupOpen(true)}>폰</Button>
              </div>
              <div className="flex justify-center bg-black rounded-xl overflow-hidden p-2">
                <div style={{ width: '100%', maxWidth: 240, aspectRatio: '9 / 16', position: 'relative' }}>
                  <div style={{ width: 1080, height: 1350, transform: 'scale(' + 240 / 1080 + ')', transformOrigin: 'top left', position: 'absolute', top: '15%', left: 0 }}>
                    {selectedSlides[0] && <CardRenderer slide={selectedSlides[0]} preset={selectedPreset} brand={selectedBrand} width={1080} height={1350} />}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-muted text-center bg-primary-50 rounded-lg p-2.5">
                💡 실제 효과는 영상 생성 후 확인
              </div>
            </Card>

            <Card>
              <CardHeader title="영상 정보" />
              <div className="space-y-2 text-sm">
                <Row label="해상도" value="1080 × 1920" />
                <Row label="슬라이드" value={`${selectedSlides.length}장`} />
                <Row label="예상 길이" value={`약 ${Math.round((selectedSlides.length * videoStyle.slideDurationMs) / 1000)}초`} />
                <Row label="포맷" value="WebM" />
              </div>
            </Card>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button onClick={handleGenerate} disabled={loading || selectedSlides.length === 0} size="lg" className="w-full" loading={loading} icon={!loading && <Film size={18} />}>
              {loading ? status || '생성 중...' : '🎬 숏츠 영상 생성'}
            </Button>

            {loading && (
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-xs text-center text-ink-secondary">{progress}% — {status}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal open={phoneMockupOpen} onClose={() => setPhoneMockupOpen(false)} title="스마트폰에서 보기" maxWidth="md">
        {selectedSlides[0] && <PhoneMockup slide={selectedSlides[0]} preset={selectedPreset} brand={selectedBrand} isLast={false} />}
      </Modal>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-ink-secondary">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}