'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { parsePresetJSON } from '@/lib/preset-import';
import type { Preset } from '@/lib/types';
import { Check, AlertCircle, Sparkles, ClipboardPaste } from 'lucide-react';

export function PresetImportModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (preset: Preset) => void;
}) {
  const [jsonText, setJsonText] = useState('');
  const [parsed, setParsed] = useState<Preset | null>(null);
  const [error, setError] = useState('');

  function handleParse() {
    setError('');
    setParsed(null);
    if (!jsonText.trim()) {
      setError('JSON을 붙여넣어주세요');
      return;
    }
    try {
      const preset = parsePresetJSON(jsonText);
      setParsed(preset);
    } catch (e: any) {
      setError(e.message || '파싱 오류');
    }
  }

  function handleSave() {
    if (!parsed) return;
    onSave(parsed);
    setJsonText('');
    setParsed(null);
    onClose();
  }

  function handleClose() {
    setJsonText('');
    setParsed(null);
    setError('');
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title="AI 프리셋 가져오기" maxWidth="2xl">
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-primary-50 border border-primary-200 text-sm text-primary-800">
          <div className="font-semibold mb-1.5 flex items-center gap-1.5">
            <Sparkles size={15} />
            사용 방법
          </div>
          <div className="space-y-1 leading-relaxed">
            <div>1. 원하는 카드뉴스 이미지를 AI(ChatGPT/Gemini/Claude)에게 보여줌</div>
            <div>2. AI가 반환한 JSON을 아래에 붙여넣기</div>
            <div>3. 파싱 후 프리셋 저장</div>
          </div>
        </div>

        <Textarea
          label="JSON 붙여넣기"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='{ "name": "프리셋 이름", "defaultBackground": {...}, ... }'
          rows={14}
          className="font-mono text-xs"
        />

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parsed && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 space-y-1">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-green-700">
              <Check size={14} />
              파싱 성공
            </div>
            <div className="text-xs text-green-700">
              이름: <strong>{parsed.name}</strong>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handleParse} icon={<Sparkles size={15} />} className="flex-1">
            파싱
          </Button>
          <Button
            variant="ghost"
            icon={<ClipboardPaste size={15} />}
            onClick={async () => {
              try {
                const text = await navigator.clipboard.readText();
                setJsonText(text);
              } catch {
                alert('클립보드 접근 실패');
              }
            }}
          >
            붙여넣기
          </Button>
          <Button
            onClick={handleSave}
            disabled={!parsed}
            className="flex-1"
            icon={<Check size={15} />}
          >
            저장
          </Button>
        </div>
      </div>
    </Modal>
  );
}