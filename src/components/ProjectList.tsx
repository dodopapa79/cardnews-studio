'use client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/utils';
import { CardSlide } from '@/templates';
import { getPresetById } from '@/presets';
import type { CardNewsProject, Preset } from '@/lib/types';
import { FolderOpen, Trash2, FileText, Plus, Pencil } from 'lucide-react';

export function ProjectList({
  open,
  onClose,
  projects,
  customPresets,
  currentProjectId,
  onSelect,
  onDelete,
  onRename,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  projects: CardNewsProject[];
  customPresets: Preset[];
  currentProjectId?: string;
  onSelect: (p: CardNewsProject) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onCreate: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`내 카드뉴스 (${projects.length})`} maxWidth="xl">
      <div className="space-y-4">
        {/* 새 카드뉴스 */}
        <Button onClick={onCreate} icon={<Plus size={16} />} className="w-full">
          새 카드뉴스 만들기
        </Button>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-4">
              <FileText size={28} />
            </div>
            <div className="text-sm text-ink-secondary">아직 저장된 카드뉴스가 없습니다</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                customPresets={customPresets}
                isCurrent={currentProjectId === project.id}
                onSelect={() => {
                  onSelect(project);
                  onClose();
                }}
                onDelete={() => {
                  if (confirm(`"${project.name}" 카드뉴스를 삭제할까요?\n\n삭제하면 복구할 수 없습니다.`)) {
                    onDelete(project.id);
                  }
                }}
                onRename={() => {
                  const newName = prompt('새 이름을 입력하세요', project.name);
                  if (newName?.trim()) onRename(project.id, newName.trim());
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

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

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
        isCurrent
          ? 'border-primary-500 bg-primary-50'
          : 'border-surface-border hover:border-primary-300 hover:bg-surface-hover'
      }`}
      onClick={onSelect}
    >
      {/* 썸네일 */}
      <div
        className="shrink-0 rounded-lg overflow-hidden border bg-white"
        style={{ width: 60, aspectRatio: '4 / 5' }}
      >
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: 'scale(0.0555)',
            transformOrigin: 'top left',
          }}
        >
          {coverSlide && (
            <CardSlide
              slide={coverSlide}
              preset={preset}
              colorId={project.presetColorId}
              brand={project.brand}
              isLast={false}
            />
          )}
        </div>
      </div>

      {/* 정보 */}
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

      {/* 액션 */}
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