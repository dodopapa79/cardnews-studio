'use client';
import { useEffect, useRef, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import type { ViewId } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/views/DashboardView';
import { CreateView } from '@/components/views/CreateView';
import { PresetsView } from '@/components/views/PresetsView';
import { VideoView } from '@/components/views/VideoView';
import { SettingsView } from '@/components/views/SettingsView';
import {
  loadCustomPresets,
  loadSettings,
  loadProjects,
  saveSettings,
  saveCustomPresets,
  saveProjectWithImages,
  loadProjectWithImages,
  deleteProjectWithImages,
  loadCurrentProjectId,
  saveCurrentProjectId,
  createProject,
  incrementPresetStat,
  loadPresetStats,
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
  migrateLegacySlides,
  upsertProject,
} from '@/lib/storage';
import {
  EMPTY_SETTINGS,
  type Preset,
  type Settings,
  type Slide,
  type CardNewsProject,
  type CardSize,
} from '@/lib/types';
import { STYLE_PRESETS, getPresetById } from '@/presets';
import { generateProjectName } from '@/lib/utils';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewId>('dashboard');
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [projects, setProjects] = useState<CardNewsProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [preset, setPreset] = useState<Preset>(STYLE_PRESETS[0]);
  const [presetColorId, setPresetColorId] = useState<string>(
    STYLE_PRESETS[0].colorVariants[0].id
  );
  const [cardSize, setCardSize] = useState<CardSize>('instagram');
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const skipAutoSaveRef = useRef(false);
  const batchLockRef = useRef(false);

  useEffect(() => {
    (async () => {
      setMounted(true);
      const s = loadSettings();
      setSettings(s);
      setCardSize(s.defaultCardSize || 'instagram');

      const cp = loadCustomPresets();
      setCustomPresets(cp);
      setFavorites(loadFavorites());
      setStats(loadPresetStats());

      let loadedProjects = loadProjects();
      const migrated = migrateLegacySlides(s);
      if (migrated) {
        loadedProjects = upsertProject(loadedProjects, migrated);
      }
      setProjects(loadedProjects);

      const savedId = loadCurrentProjectId();
      if (savedId) {
        const proj = loadedProjects.find((p) => p.id === savedId);
        if (proj) await loadProjectToEditor(proj, cp);
        else if (loadedProjects.length > 0)
          await loadProjectToEditor(loadedProjects[0], cp);
      } else if (loadedProjects.length > 0) {
        await loadProjectToEditor(loadedProjects[0], cp);
      }
    })();
  }, []);

  async function loadProjectToEditor(
    project: CardNewsProject,
    customPresetsArg: Preset[]
  ) {
    skipAutoSaveRef.current = true;
    try {
      const restored = await loadProjectWithImages(project);
      setSlides(restored.slides);
      setCurrentProjectId(restored.id);
      saveCurrentProjectId(restored.id);
      setCardSize(restored.cardSize || 'instagram');

      const p = getPresetById(restored.presetId, customPresetsArg);
      setPreset(p);
      setPresetColorId(restored.presetColorId || p.colorVariants[0]?.id || '');
    } finally {
      setTimeout(() => {
        skipAutoSaveRef.current = false;
      }, 800);
    }
  }

  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
  }, [settings, mounted]);

  function handlePresetChange(p: Preset, colorId?: string) {
    setPreset(p);
    const cid = colorId || p.colorVariants[0]?.id || '';
    setPresetColorId(cid);
    const newStats = incrementPresetStat(p.id);
    setStats(newStats);
  }

  function handleToggleFavorite(id: string) {
    const next = toggleFavoriteStorage(id);
    setFavorites(next);
  }

  function handleSaveCustom(name: string) {
    const next: Preset = {
      ...preset,
      id: `custom-${Date.now()}`,
      name,
      category: 'custom',
      builtin: false,
      version: 1,
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
    if (preset.id === id) handlePresetChange(STYLE_PRESETS[0]);
  }

  function handleImportPresets(presets: Preset[]) {
    const imported = presets.map((p) => ({
      ...p,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: 'custom' as const,
      builtin: false,
      version: 1,
    }));
    const updated = [...customPresets, ...imported];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    alert(`${imported.length}개 프리셋을 가져왔습니다.`);
  }

  /** AI가 생성한 프리셋 하나 추가 */
  function handleImportCustom(preset: Preset) {
    const updated = [...customPresets, preset];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    // 즉시 적용
    handlePresetChange(preset);
  }

  async function handleSaveProject() {
    if (slides.length === 0) {
      alert('저장할 카드뉴스가 없습니다.');
      return;
    }
    try {
      let project: CardNewsProject;
      if (currentProjectId) {
        const existing = projects.find((p) => p.id === currentProjectId);
        if (existing) {
          project = {
            ...existing,
            slides,
            presetId: preset.id,
            presetColorId,
            cardSize,
            brand: settings.brand,
            updatedAt: Date.now(),
          };
        } else {
          project = createProject(
            generateProjectName(slides),
            slides,
            preset.id,
            presetColorId,
            settings.brand,
            cardSize
          );
        }
      } else {
        project = createProject(
          generateProjectName(slides),
          slides,
          preset.id,
          presetColorId,
          settings.brand,
          cardSize
        );
      }
      const next = await saveProjectWithImages(projects, project);
      setProjects(next);
      setCurrentProjectId(project.id);
      saveCurrentProjectId(project.id);
    } catch (e: any) {
      alert(`저장 실패: ${e.message}`);
    }
  }

  async function handleDeleteProject(id: string) {
    try {
      const next = await deleteProjectWithImages(projects, id);
      setProjects(next);
      if (currentProjectId === id) {
        if (next.length > 0) await loadProjectToEditor(next[0], customPresets);
        else {
          setSlides([]);
          setCurrentProjectId(null);
          saveCurrentProjectId(null);
        }
      }
    } catch (e: any) {
      alert(`삭제 실패: ${e.message}`);
    }
  }

  function handleRenameProject(id: string, name: string) {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const updated = { ...proj, name, updatedAt: Date.now() };
    const next = upsertProject(projects, updated);
    setProjects(next);
  }

  async function handleSelectProject(proj: CardNewsProject) {
    if (slides.length > 0 && currentProjectId && currentProjectId !== proj.id) {
      const ok = confirm('현재 카드뉴스를 자동 저장하고 다른 카드뉴스를 열까요?');
      if (ok) await handleSaveProject();
      else return;
    }
    await loadProjectToEditor(proj, customPresets);
    setView('create');
  }

  async function handleCreateNew() {
    if (slides.length > 0) {
      const ok = confirm('현재 카드뉴스를 자동 저장하고 새로 만들까요?');
      if (ok) await handleSaveProject();
      else return;
    }
    skipAutoSaveRef.current = true;
    setSlides([]);
    setCurrentProjectId(null);
    saveCurrentProjectId(null);
    setView('create');
    setTimeout(() => {
      skipAutoSaveRef.current = false;
    }, 800);
  }

  useEffect(() => {
    if (!mounted) return;
    if (skipAutoSaveRef.current) return;
    if (batchLockRef.current) return;
    if (!currentProjectId) return;
    if (slides.length === 0) return;

    const timer = setTimeout(async () => {
      if (skipAutoSaveRef.current || batchLockRef.current) return;
      try {
        await handleSaveProject();
      } catch (e) {
        console.error('자동 저장 실패:', e);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [slides, presetColorId, cardSize, mounted, currentProjectId]);

  if (!mounted) return null;

  const currentProjectName = currentProjectId
    ? projects.find((p) => p.id === currentProjectId)?.name
    : undefined;

  return (
    <AppShell
      active={view}
      onChange={setView}
      hasSlides={slides.length > 0}
      projectName={currentProjectName}
      onCreateNew={handleCreateNew}
    >
      {view === 'dashboard' && (
        <DashboardView
          settings={settings}
          slides={slides}
          projects={projects}
          onNavigate={setView}
          onSelectProject={handleSelectProject}
          onNewProject={handleCreateNew}
        />
      )}
      {view === 'create' && (
        <CreateView
          settings={settings}
          slides={slides}
          onSlidesChange={setSlides}
          preset={preset}
          presetColorId={presetColorId}
          onPresetChange={handlePresetChange}
          customPresets={customPresets}
          favorites={favorites}
          stats={stats}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          onImportPresets={handleImportPresets}
          onImportCustom={handleImportCustom}
          onToggleFavorite={handleToggleFavorite}
          cardRefs={cardRefs}
          projects={projects}
          currentProjectId={currentProjectId}
          cardSize={cardSize}
          onCardSizeChange={setCardSize}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onCreateNew={handleCreateNew}
          onSaveProject={handleSaveProject}
          onBatchLockChange={(locked) => {
            batchLockRef.current = locked;
          }}
        />
      )}
      {view === 'presets' && (
        <PresetsView
          current={preset}
          currentColorId={presetColorId}
          onSelect={handlePresetChange}
          onColorChange={setPresetColorId}
          customPresets={customPresets}
          favorites={favorites}
          stats={stats}
          brand={settings.brand}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          onImport={handleImportPresets}
          onImportCustom={handleImportCustom}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {view === 'video' && (
        <VideoView
          slides={slides}
          preset={preset}
          presetColorId={presetColorId}
          brand={settings.brand}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
        />
      )}
      {view === 'settings' && (
        <SettingsView
          settings={settings}
          onChange={setSettings}
          onReset={() => {
            setSlides([]);
            setProjects([]);
            setCurrentProjectId(null);
            setCustomPresets([]);
            setFavorites([]);
            setStats({});
            setView('dashboard');
          }}
        />
      )}
    </AppShell>
  );
}