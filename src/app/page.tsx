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
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
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
import { STYLE_PRESETS, getPresetById } from '@/lib/presets';
import { generateProjectName } from '@/lib/utils';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewId>('dashboard');
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [projects, setProjects] = useState<CardNewsProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [preset, setPreset] = useState<Preset>(STYLE_PRESETS[0]);
  const [cardSize, setCardSize] = useState<CardSize>('instagram');
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const skipAutoSaveRef = useRef(false);
  const batchLockRef = useRef(false);

  // ─────────────────────────────────
  // 초기 로드
  // ─────────────────────────────────
  useEffect(() => {
    (async () => {
      setMounted(true);
      const s = loadSettings();
      setSettings(s);
      setCardSize(s.defaultCardSize || 'instagram');

      const cp = loadCustomPresets();
      setCustomPresets(cp);
      setFavorites(loadFavorites());

      const loadedProjects = loadProjects();
      setProjects(loadedProjects);

      const savedId = loadCurrentProjectId();
      if (savedId) {
        const proj = loadedProjects.find((p) => p.id === savedId);
        if (proj) {
          await loadProjectToEditor(proj, cp);
        } else if (loadedProjects.length > 0) {
          await loadProjectToEditor(loadedProjects[0], cp);
        }
      } else if (loadedProjects.length > 0) {
        await loadProjectToEditor(loadedProjects[0], cp);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────
  // 프로젝트 → 편집기
  // ─────────────────────────────────
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
    } finally {
      setTimeout(() => {
        skipAutoSaveRef.current = false;
      }, 800);
    }
  }

  // ─────────────────────────────────
  // 설정 저장
  // ─────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
  }, [settings, mounted]);

  // ─────────────────────────────────
  // 프리셋
  // ─────────────────────────────────
  function handlePresetChange(p: Preset) {
    setPreset(p);
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
      version: 5,
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

  function handleImportCustom(presetArg: Preset) {
    const updated = [...customPresets, presetArg];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    setPreset(presetArg);
  }

  // ─────────────────────────────────
  // 프로젝트 저장
  // ─────────────────────────────────
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
            cardSize,
            brand: settings.brand,
            updatedAt: Date.now(),
          };
        } else {
          project = createProject(
            generateProjectName(slides),
            slides,
            preset.id,
            settings.brand,
            cardSize
          );
        }
      } else {
        project = createProject(
          generateProjectName(slides),
          slides,
          preset.id,
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

  // ─────────────────────────────────
  // 프로젝트 삭제
  // ─────────────────────────────────
  async function handleDeleteProject(id: string) {
    try {
      const next = await deleteProjectWithImages(projects, id);
      setProjects(next);
      if (currentProjectId === id) {
        if (next.length > 0) {
          await loadProjectToEditor(next[0], customPresets);
        } else {
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

  // ─────────────────────────────────
  // 프로젝트 선택
  // ─────────────────────────────────
  async function handleSelectProject(proj: CardNewsProject) {
    if (slides.length > 0 && currentProjectId && currentProjectId !== proj.id) {
      const ok = confirm(
        '현재 편집 중인 카드뉴스를 자동 저장하고 다른 카드뉴스를 열까요?'
      );
      if (ok) {
        await handleSaveProject();
      } else {
        return;
      }
    }
    await loadProjectToEditor(proj, customPresets);
    setView('create');
  }

  // ─────────────────────────────────
  // 새로 제작
  // ─────────────────────────────────
  async function handleCreateNew() {
    if (slides.length > 0) {
      const ok = confirm('현재 카드뉴스를 자동 저장하고 새로 만들까요?');
      if (ok) {
        await handleSaveProject();
      } else {
        return;
      }
    }
    skipAutoSaveRef.current = true;
    setSlides([]);
    setCurrentProjectId(null);
    saveCurrentProjectId(null);
    setPreset(STYLE_PRESETS[0]);
    setView('create');
    setTimeout(() => {
      skipAutoSaveRef.current = false;
    }, 800);
  }

  // ─────────────────────────────────
  // 자동 저장
  // ─────────────────────────────────
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, cardSize, mounted, currentProjectId]);

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
          onPresetChange={handlePresetChange}
          customPresets={customPresets}
          favorites={favorites}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          onImportCustom={handleImportCustom}
          onToggleFavorite={handleToggleFavorite}
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
          customPresets={customPresets}
          favorites={favorites}
          brand={settings.brand}
          onSelect={handlePresetChange}
          onSaveCustom={handleSaveCustom}
          onDeleteCustom={handleDeleteCustom}
          onImportCustom={handleImportCustom}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {view === 'video' && (
        <VideoView
          slides={slides}
          preset={preset}
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
            setView('dashboard');
          }}
        />
      )}
    </AppShell>
  );
}