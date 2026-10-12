'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CardRenderer } from '@/templates/CardRenderer';
import { getPresetById } from '@/lib/presets';
import { formatRelativeTime } from '@/lib/utils';
import type { CardNewsProject, Preset } from '@/lib/types';
import {
  Plus,
  FolderOpen,
  Trash2,
  Pencil,
  FileText,
  Search,
  LayoutGrid,
  List as ListIcon,
} from 'lucide-react';

export function ProjectsView({
  projects,
  customPresets,
  currentProjectId,
  onSelect,
  onDelete,
  onRename,
  onCreate,
}: {
  projects: CardNewsProject[];
  customPresets: Preset[];
  currentProjectId: string | null;
  onSelect: (p: CardNewsProject) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCreate: () => void;
}) {
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 상단 툴바 */}
      <Card padding={false} className="px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="프로젝트 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-surface-bg border border-transparent focus:bg-white focus:border-surface-border focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'grid'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
            title="그리드"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${
              viewMode === 'list'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-ink-secondary'
            }`}
            title="리스트"
          >
            <ListIcon size={16} />
          </button>
        </div>

        <Button onClick={onCreate} icon={<Plus size={16} />}>
          새 카드뉴스
        </Button>
      </Card>

      {/* 프로젝트 목록 */}
      {projects.length === 0 ? (
        <Card>
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <FileText size={28} />
            </div>
            <div className="text-base font-semibold mb-1">
              아직 저장된 카드뉴스가 없습니다
            </div>
            <div className="text-sm text-ink-secondary mb-5">
              새 카드뉴스를 만들어보세요
            </div>
            <Button onClick={onCreate} icon={<Plus size={16} />}>
              첫 카드뉴스 만들기
            </Button>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-sm text-ink-muted">
              "{query}"에 해당하는 프로젝트가 없습니다
            </div>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              customPresets={customPresets}
              isCurrent={currentProjectId === project.id}
              onSelect={() => onSelect(project)}
              onDelete={() =>
                confirm(`"${project.name}" 카드뉴스를 삭제할까요?`) && onDelete(project.id)
              }
              onRename={() => {
                const newName = prompt('새 이름을 입력하세요', project.name);
                if (newName?.trim()) onRename(project.id, newName.trim());
              }}
            />
          ))}
        </div>
      ) : (
        <Card padding={false}>
          <div className="divide-y divide-surface-border">
            {filtered.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                customPresets={customPresets}
                isCurrent={currentProjectId === project.id}
                onSelect={() => onSelect(project)}
                onDelete={() =>
                  confirm(`"${project.name}" 카드뉴스를 삭제할까요?`) && onDelete(project.id)
                }
                onRename={() => {
                  const newName = prompt('새 이름을 입력하세요', project.name);
                  if (newName?.trim()) onRename(project.id, newName.trim());
                }}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 그리드 카드
// ─────────────────────────────────────────
function ProjectCard({
  project,
  customPresets,
  isCurrent,
  onSelect,
  onDelete,
  onRename,
}: {
  project: CardNewsProject;
  customPresets: Preset[];
  isCurrent: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const preset = getPresetById(project.presetId, customPresets);
  const coverSlide = project.slides[0];
  const dim =
    project.cardSize === 'square'
      ? { width: 1080, height: 1080 }
      : { width: 1080, height: 1350 };

  return (
    <div
      className={`group rounded-xl border-2 overflow-hidden bg-white shadow-card hover:shadow-card-hover transition-all cursor-pointer ${
        isCurrent ? 'border-primary-500' : 'border-surface-border hover:border-primary-300'
      }`}
      onClick={onSelect}
    >
      {/* 썸네일 */}
      <div
        className="relative w-full bg-gray-100 overflow-hidden"
        style={{ aspectRatio: `${dim.width} / ${dim.height}` }}
      >
        <div
          style={{
            width: dim.width,
            height: dim.height,
            transform: 'scale(0.28)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {coverSlide && (
            <CardRenderer
              slide={coverSlide}
              preset={preset}
              brand={project.brand}
              width={dim.width}
              height={dim.height}
            />
          )}
        </div>

        {isCurrent && (
          <div className="absolute top-2 right-2 text-[10px] font-bold text-white bg-primary-600 px-2 py-0.5 rounded shadow">
            현재
          </div>
        )}

        {/* 액션 (hover) */}
        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename();
            }}
            className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-ink-secondary hover:bg-white"
            title="이름 변경"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
            title="삭제"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* 정보 */}
      <div className="p-3 border-t border-surface-border">
        <div className="font-semibold text-sm truncate">{project.name}</div>
        <div className="text-xs text-ink-muted mt-0.5">
          {project.slides.length}장 · {formatRelativeTime(project.updatedAt)}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 리스트 행
// ─────────────────────────────────────────
function ProjectRow({
  project,
  customPresets,
  isCurrent,
  onSelect,
  onDelete,
  onRename,
}: {
  project: CardNewsProject;
  customPresets: Preset[];
  isCurrent: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const preset = getPresetById(project.presetId, customPresets);
  const coverSlide = project.slides[0];
  const dim =
    project.cardSize === 'square'
      ? { width: 1080, height: 1080 }
      : { width: 1080, height: 1350 };

  return (
    <div
      className={`flex items-center gap-3 p-3 transition-colors cursor-pointer hover:bg-surface-hover ${
        isCurrent ? 'bg-primary-50' : ''
      }`}
      onClick={onSelect}
    >
      <div
        className="shrink-0 rounded-lg overflow-hidden border bg-white"
        style={{ width: 60, aspectRatio: `${dim.width} / ${dim.height}` }}
      >
        <div
          style={{
            width: dim.width,
            height: dim.height,
            transform: `scale(${60 / dim.width})`,
            transformOrigin: 'top left',
          }}
        >
          {coverSlide && (
            <CardRenderer
              slide={coverSlide}
              preset={preset}
              brand={project.brand}
              width={dim.width}
              height={dim.height}
            />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm truncate">{project.name}</div>
          {isCurrent && (
            <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-1.5 py-0.5 rounded shrink-0">
              현재
            </span>
          )}
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          {project.slides.length}장 · {formatRelativeTime(project.updatedAt)}
        </div>
      </div>

      <div className="flex gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRename();
          }}
          className="p-2 rounded-lg hover:bg-white text-ink-secondary"
          title="이름 변경"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 rounded-lg hover:bg-red-50 text-red-500"
          title="삭제"
        >
          <Trash2 size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="p-2 rounded-lg hover:bg-primary-100 text-primary-600"
          title="열기"
        >
          <FolderOpen size={14} />
        </button>
      </div>
    </div>
  );
}