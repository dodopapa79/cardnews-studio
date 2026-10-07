'use client';
import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { BrandInfo } from '@/lib/types';
import { Upload, X, Check } from 'lucide-react';

export function BrandInfoForm({
  brand,
  onChange,
}: {
  brand: BrandInfo;
  onChange: (b: BrandInfo) => void;
}) {
  const [saved, setSaved] = useState(false);

  const update = (patch: Partial<BrandInfo>) => {
    onChange({ ...brand, ...patch });
    setSaved(false);
  };

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      update({ logoUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <Card>
      <CardHeader
        title="🏢 브랜드 정보"
        subtitle="카드뉴스 하단에 자동으로 표시됩니다"
        action={
          saved ? (
            <span className="text-xs text-primary-600 flex items-center gap-1">
              <Check size={12} /> 저장됨
            </span>
          ) : null
        }
      />

      <div className="space-y-3">
        {/* 로고 업로드 */}
        <div>
          <div className="text-xs font-medium text-ink-secondary mb-1.5">로고</div>
          {brand.logoUrl ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary-200 bg-primary-50">
              <img
                src={brand.logoUrl}
                alt="logo"
                className="w-14 h-14 object-contain bg-white rounded-lg border"
              />
              <div className="flex-1 text-sm text-primary-700 font-medium">로고 준비됨</div>
              <button
                onClick={() => update({ logoUrl: '' })}
                className="p-1.5 rounded text-primary-600 hover:bg-primary-100"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <div className="border-2 border-dashed border-surface-border rounded-lg p-4 text-center hover:border-primary-400 hover:bg-primary-50/30 transition">
                <Upload size={18} className="mx-auto text-ink-muted mb-1.5" />
                <div className="text-xs font-medium">로고 이미지 업로드</div>
                <div className="text-[10px] text-ink-muted mt-0.5">PNG 권장 (투명 배경)</div>
              </div>
            </label>
          )}
        </div>

        <Input
          label="브랜드명"
          value={brand.brandName}
          onChange={(e) => update({ brandName: e.target.value })}
          placeholder="예: 카드뉴스 스튜디오"
        />
        <Input
          label="웹사이트 주소"
          value={brand.website}
          onChange={(e) => update({ website: e.target.value })}
          placeholder="예: yoursite.com"
        />
        <Input
          label="인스타 핸들 (선택)"
          value={brand.handle}
          onChange={(e) => update({ handle: e.target.value })}
          placeholder="예: @your_handle"
        />

        <div className="text-xs text-ink-muted bg-surface-bg rounded-lg p-3">
          💡 이 정보는 <strong>모든 카드뉴스 하단</strong>에 표시됩니다.
          <br />
          마지막 카드는 브랜드명+웹사이트+핸들이, 나머지는 웹사이트+스와이프 표시가 나옵니다.
        </div>
      </div>
    </Card>
  );
}