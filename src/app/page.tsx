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
  upsertProject,
  deleteProject as deleteProjectStorage,
  loadCurrentProjectId,
  saveCurrentProjectId,
  createProject,
  incrementPresetStat,
  loadPresetStats,
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
  migrateLegacySlides,
} from '@/lib/storage';
import {
  EMPTY_SETTINGS,
  EMPTY_BRAND,
  type Preset,
  type Settings,
  type Slide,
  type CardNewsProject,
  type BrandInfo,
} from '@/lib/types';
import { STYLE_PRESETS, getPresetById } from '@/presets';
import { generateProjectName } from '@/lib/utils';

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<ViewId>('dashboard');
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);

  // 프로젝트 관리
  const [projects, setProjects] = useState<CardNewsProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  // 현재 편집 중인 슬라이드 (프로젝트와 별도로 라이브 편집)
  const [slides, setSlides] = useState<Slide[]>([]);
  const [preset, setPreset] = useState<Preset>(STYLE_PRESETS[0]);
  const [presetColorId, setPresetColorId] = useState<string>(
    STYLE_PRESETS[0].colorVariants[0].id
  );

  // 프리셋 관련
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ─────────────────────────────────────────────
  // 초기 로드
  // ─────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const s = loadSettings();
    setSettings(s);

    setCustomPresets(loadCustomPresets());
    setFavorites(loadFavorites());
    setStats(loadPresetStats());

    let loadedProjects = loadProjects();
    // 레거시 마이그레이션
    const migrated = migrateLegacySlides(s);
    if (migrated) {
      loadedProjects = upsertProject(loadedProjects, migrated);
    }
    setProjects(loadedProjects);

    // 현재 프로젝트 복원
    const savedId = loadCurrentProjectId();
    if (savedId) {
      const proj = loadedProjects.find((p) => p.id === savedId);
      if (proj) {
        loadProjectToEditor(proj, loadCustomPresets());
      } else if (loadedProjects.length > 0) {
        loadProjectToEditor(loadedProjects[0], loadCustomPresets());
      }
    } else if (loadedProjects.length > 0) {
      loadProjectToEditor(loadedProjects[0], loadCustomPresets());
    }
  }, []);

  function loadProjectToEditor(project: CardNewsProject, customPresets: Preset[]) {
    setSlides(project.slides);
    setCurrentProjectId(project.id);
    saveCurrentProjectId(project.id);

    const p = getPresetById(project.presetId, customPresets);
    setPreset(p);
    setPresetColorId(
      project.presetColorId || p.colorVariants[0]?.id || 'neon-green'
    );
  }

  // ─────────────────────────────────────────────
  // 설정 저장
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
  }, [settings, mounted]);

  // ─────────────────────────────────────────────
  // 프리셋
  // ─────────────────────────────────────────────
  function handlePresetChange(p: Preset, colorId?: string) {
    setPreset(p);
    const cid = colorId || p.colorVariants[0].id;
    setPresetColorId(cid);

    // 사용 통계 증가
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
    }));
    const updated = [...customPresets, ...imported];
    setCustomPresets(updated);
    saveCustomPresets(updated);
    alert(`${imported.length}개의 프리셋을 가져왔습니다.`);
  }

  // ─────────────────────────────────────────────
  // 프로젝트
  // ─────────────────────────────────────────────
  function handleSaveProject() {
    if (slides.length === 0) {
      alert('저장할 카드뉴스가 없습니다.');
      return;
    }

    try {
      if (currentProjectId) {
        // 기존 프로젝트 업데이트
        const existing = projects.find((p) => p.id === currentProjectId);
        if (existing) {
          const updated: CardNewsProject = {
            ...existing,
            slides,
            presetId: preset.id,
            presetColorId,
            brand: settings.brand,
            updatedAt: Date.now(),
          };
          const next = upsertProject(projects, updated);
          setProjects(next);
          return;
        }
      }
      // 새 프로젝트
      const name = generateProjectName(slides);
      const newProject = createProject(
        name,
        slides,
        preset.id,
        presetColorId,
        settings.brand
      );
      const next = upsertProject(projects, newProject);
      setProjects(next);
      setCurrentProjectId(newProject.id);
      saveCurrentProjectId(newProject.id);
    } catch (e: any) {
      alert(`저장 실패: ${e.message}\n\n(브라우저 저장 공간이 부족할 수 있습니다)`);
    }
  }

  function handleDeleteProject(id: string) {
    const next = deleteProjectStorage(projects, id);
    setProjects(next);
    if (currentProjectId === id) {
      if (next.length > 0) {
        loadProjectToEditor(next[0], customPresets);
      } else {
        setSlides([]);
        setCurrentProjectId(null);
        saveCurrentProjectId(null);
      }
    }
  }

  function handleRenameProject(id: string, name: string) {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    const updated = { ...proj, name, updatedAt: Date.now() };
    const next = upsertProject(projects, updated);
    setProjects(next);
  }

  function handleSelectProject(proj: CardNewsProject) {
    // 현재 편집 중인 내용이 있으면 자동 저장 확인
    if (slides.length > 0 && currentProjectId && currentProjectId !== proj.id) {
      const ok = confirm(
        '현재 편집 중인 카드뉴스를 자동 저장하고 다른 카드뉴스를 열까요?'
      );
      if (ok) {
        handleSaveProject();
      } else {
        return;
      }
    }
    loadProjectToEditor(proj, customPresets);
    setView('create');
  }

  function handleCreateNew() {
    if (slides.length > 0) {
      const ok = confirm(
        '현재 편집 중인 카드뉴스를 자동 저장하고 새로 만들까요?'
      );
      if (ok) {
        handleSaveProject();
      } else {
        return;
      }
    }
    setSlides([]);
    setCurrentProjectId(null);
    saveCurrentProjectId(null);
    setView('create');
  }

  // ─────────────────────────────────────────────
  // 슬라이드 변경 시 자동 저장 (디바운스)
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!mounted || !currentProjectId || slides.length === 0) return;
    const timer = setTimeout(() => {
      handleSaveProject();
    }, 1500);
    return () => clearTimeout(timer);
  }, [slides, presetColorId, mounted]);

  if (!mounted) return null;

  return (
    <AppShell
      active={view}
      onChange={setView}
      hasSlides={slides.length > 0}
      projectName={
        currentProjectId
          ? projects.find((p) => p.id === currentProjectId)?.name
          : undefined
      }
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
          onToggleFavorite={handleToggleFavorite}
          cardRefs={cardRefs}
          projects={projects}
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onRenameProject={handleRenameProject}
          onCreateNew={handleCreateNew}
          onSaveProject={handleSaveProject}
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
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {view === 'video' && (
        <VideoView
          slides={slides}
          preset={preset}
          presetColorId={presetColorId}
          brand={settings.brand}
          cardRefs={cardRefs}
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
          }}
        />
      )}
    </AppShell>
  );
}