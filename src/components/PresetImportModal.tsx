'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { CardSlide } from '@/templates';
import { parsePresetJSON } from '@/lib/preset-import';
import type { Preset, BrandInfo } from '@/lib/types';
import { Check, AlertCircle, Sparkles, ClipboardPaste } from 'lucide-react';

const SAMPLE_SLIDE = {
  id: 'preview',
  type: 'cover' as const,
  headline: '미리보기 제목입니다',
  body: '이것은 예시 본문입니다. 프리셋의 스타일을 확인해보세요.',
  highlight: '100%',
  label: 'FEATURED',
  imageUrl: '',
  imagePrompt: '',
  imagePromptKo: '',
  imageLayout: 'none' as const,
};

export function PresetImportModal({
  open,
  onClose,
  onSave,
  brand,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (preset: Preset) => void;
  brand?: BrandInfo;
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
            <div>1. 참고할 카드뉴스 이미지를 복사</div>
            <div>2. ChatGPT/Gemini/Claude에게 이미지 + 프롬프트 전달</div>
            <div>3. AI가 반환한 JSON을 아래에 붙여넣기</div>
            <div>4. 미리보기 확인 후 저장</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Textarea
              label="JSON 붙여넣기"
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{ "name": "...", "layout": "centered", ... }'
              rows={16}
              className="font-mono text-xs"
            />

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleParse} icon={<Sparkles size={15} />} className="flex-1">
                파싱 & 미리보기
              </Button>
              <Button
                variant="ghost"
                icon={<ClipboardPaste size={15} />}
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setJsonText(text);
                  } catch {
                    alert('클립보드 접근 실패. 직접 붙여넣어주세요.');
                  }
                }}
              >
                붙여넣기
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-ink-secondary">미리보기</div>
            <div className="flex justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4">
              <div
                className="rounded-xl overflow-hidden border-2 border-white shadow-xl bg-white"
                style={{ width: '100%', maxWidth: 320, aspectRatio: '4 / 5' }}
              >
                {parsed ? (
                  <div
                    style={{
                      width: 1080,
                      height: 1350,
                      transform: `scale(${320 / 1080})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <CardSlide
                      slide={SAMPLE_SLIDE}
                      preset={parsed}
                      brand={brand}
                      isLast={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-ink-muted p-4 text-center">
                    JSON을 파싱하면 여기 미리보기가 표시됩니다
                  </div>
                )}
              </div>
            </div>

            {parsed && (
              <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary-800">
                  <Check size={14} />
                  파싱 성공
                </div>
                <div className="text-xs text-primary-700 space-y-0.5">
                  <div>
                    이름: <strong>{parsed.name}</strong>
                  </div>
                  <div>레이아웃: {parsed.layout}</div>
                  <div>배경: {parsed.colorVariants[0].background}</div>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={!parsed}
              className="w-full"
              size="lg"
              icon={<Check size={16} />}
            >
              프리셋으로 저장
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}