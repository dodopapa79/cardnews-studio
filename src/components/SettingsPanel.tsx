'use client';
import { useState } from 'react';
import type { Settings } from '@/lib/types';
import { saveSettings } from '@/lib/storage';

export function SettingsPanel({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(settings);

  const update = (patch: Partial<Settings>) => {
    const next = { ...local, ...patch };
    setLocal(next);
    onChange(next);
    saveSettings(next);
  };

  const isReady = !!settings.geminiApiKey;

  return (
    <div className="border rounded-xl p-4 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left font-semibold"
      >
        <span>⚙️ API 키 설정 (최초 1회)</span>
        <span className={`text-sm ${isReady ? 'text-green-600' : 'text-orange-500'}`}>
          {isReady ? '✓ Gemini 설정됨' : '미설정'}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          <Field
            label="Gemini API Key"
            hint="https://aistudio.google.com/apikey 에서 무료 발급"
            value={local.geminiApiKey}
            onChange={(v) => update({ geminiApiKey: v })}
            type="password"
          />
          <Field
            label="Cloudflare Account ID (선택)"
            hint="이미지 자동 생성을 사용하려면 입력"
            value={local.cfAccountId}
            onChange={(v) => update({ cfAccountId: v })}
          />
          <Field
            label="Cloudflare API Token (선택)"
            hint="Workers AI 권한 필요"
            value={local.cfApiToken}
            onChange={(v) => update({ cfApiToken: v })}
            type="password"
          />
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            🔒 키는 브라우저 localStorage에만 저장됩니다. 서버로 전송되지 않습니다.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        placeholder="..."
      />
      {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
    </label>
  );
}