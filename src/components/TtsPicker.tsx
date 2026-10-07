'use client';
import { useState } from 'react';
import { KOREAN_VOICES, type TtsConfig } from '@/lib/tts';

export function TtsPicker({
  config,
  onChange,
  onPreview,
  previewing,
}: {
  config: TtsConfig;
  onChange: (c: TtsConfig) => void;
  onPreview: () => void;
  previewing: boolean;
}) {
  const [open, setOpen] = useState(true);
  const update = (patch: Partial<TtsConfig>) => onChange({ ...config, ...patch });

  return (
    <div className="border rounded-xl p-4 bg-white space-y-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center font-semibold"
      >
        <span>🔊 나레이션 (TTS)</span>
        <span className={`text-xs ${config.enabled ? 'text-green-600' : 'text-gray-400'}`}>
          {config.enabled ? 'ON' : 'OFF'}
        </span>
      </button>

      {open && (
        <>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
            />
            영상에 한국어 음성 넣기 (무료)
          </label>

          {config.enabled && (
            <>
              <label className="block text-xs">
                <div className="mb-1 font-medium">음성</div>
                <select
                  value={config.voice}
                  onChange={(e) => update({ voice: e.target.value })}
                  className="w-full border rounded px-2 py-1.5"
                >
                  {KOREAN_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <label>
                  <div className="mb-1 font-medium">속도: {config.rate.toFixed(1)}x</div>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={config.rate}
                    onChange={(e) => update({ rate: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
                <label>
                  <div className="mb-1 font-medium">볼륨: {config.volume}</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={config.volume}
                    onChange={(e) => update({ volume: Number(e.target.value) })}
                    className="w-full"
                  />
                </label>
              </div>

              <label className="block text-xs">
                <div className="mb-1 font-medium">피치: {config.pitch}</div>
                <select
                  value={config.pitch}
                  onChange={(e) => update({ pitch: e.target.value })}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="-50Hz">낮음</option>
                  <option value="-20Hz">살짝 낮음</option>
                  <option value="+0Hz">기본</option>
                  <option value="+20Hz">살짝 높음</option>
                  <option value="+50Hz">높음</option>
                </select>
              </label>

              <button
                onClick={onPreview}
                disabled={previewing}
                className="w-full bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {previewing ? '미리듣기 준비 중...' : '🎧 미리듣기'}
              </button>

              <p className="text-xs text-gray-500">
                각 슬라이드의 헤드라인 + 본문을 순서대로 읽습니다.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}