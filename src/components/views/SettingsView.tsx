'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Settings } from '@/lib/types';
import { saveSettings } from '@/lib/storage';
import { ExternalLink, Check, AlertCircle, RotateCcw } from 'lucide-react';

export function SettingsView({
  settings,
  onChange,
  onReset,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onReset: () => void;
}) {
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<Settings>) => setLocal({ ...local, ...patch });

  const handleSave = () => {
    onChange(local);
    saveSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const geminiOk = !!local.geminiApiKey;
  const cfOk = !!local.cfAccountId && !!local.cfApiToken;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader
          title="Gemini API"
          subtitle="카드뉴스 텍스트 생성을 담당합니다"
          action={
            geminiOk ? (
              <Badge variant="success">
                <Check size={12} className="mr-1" /> 연결됨
              </Badge>
            ) : (
              <Badge variant="warning">
                <AlertCircle size={12} className="mr-1" /> 미설정
              </Badge>
            )
          }
        />
        <div className="space-y-3">
          <Input
            label="Gemini API Key"
            type="password"
            value={local.geminiApiKey}
            onChange={(e) => update({ geminiApiKey: e.target.value })}
            placeholder="AIza..."
          />
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            무료 API 키 발급받기 <ExternalLink size={12} />
          </a>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Cloudflare Workers AI"
          subtitle="이미지 자동 생성을 담당합니다 (선택)"
          action={
            cfOk ? (
              <Badge variant="success">
                <Check size={12} className="mr-1" /> 연결됨
              </Badge>
            ) : (
              <Badge variant="default">미설정</Badge>
            )
          }
        />
        <div className="space-y-3">
          <Input
            label="Cloudflare Account ID"
            value={local.cfAccountId}
            onChange={(e) => update({ cfAccountId: e.target.value })}
            placeholder="32자리 문자열"
          />
          <Input
            label="Cloudflare API Token"
            type="password"
            value={local.cfApiToken}
            onChange={(e) => update({ cfApiToken: e.target.value })}
            placeholder="토큰"
          />
          <div className="p-3 rounded-lg bg-primary-50 text-xs text-primary-700">
            <div className="font-semibold mb-1">ℹ️ Worker 프록시 사용 중</div>
            <div className="break-all text-[10px] font-mono">{local.workerUrl}</div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between items-center">
        <Button variant="danger" icon={<RotateCcw size={16} />} onClick={onReset}>
          데이터 초기화
        </Button>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check size={14} /> 저장됨
            </span>
          )}
          <Button onClick={handleSave} size="lg">
            설정 저장
          </Button>
        </div>
      </div>
    </div>
  );
}