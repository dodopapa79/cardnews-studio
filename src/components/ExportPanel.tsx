'use client';
import { useState } from 'react';
import { exportCardsAsZip, renderNodeToDataUrl } from '@/lib/card-renderer';
import { generateShorts, downloadBlob } from '@/lib/video-generator';
import { TtsPicker } from './TtsPicker';
import { VideoLayoutPicker } from './VideoLayoutPicker';
import {
  DEFAULT_TTS,
  generateSlideAudio,
  decodeToAudioBuffer,
  type TtsConfig,
} from '@/lib/tts';
import type { Slide, VideoLayout } from '@/lib/types';

export function ExportPanel({
  slides,
  cardRefs,
}: {
  slides: Slide[];
  cardRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}) {
  const [zipProgress, setZipProgress] = useState('');
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [tts, setTts] = useState<TtsConfig>(DEFAULT_TTS);
  const [layout, setLayout] = useState<VideoLayout>('split-news');
  const [previewing, setPreviewing] = useState(false);

  async function previewTts() {
    if (!slides.length) return alert('카드뉴스가 없습니다.');
    setPreviewing(true);
    try {
      const s = slides[0];
      const text = [s.headline, s.body].filter(Boolean).join('. ');
      const buf = await generateSlideAudio(text, tts);
      const audioCtx = new AudioContext();
      const decoded = await decodeToAudioBuffer(audioCtx, buf);
      const src = audioCtx.createBufferSource();
      src.buffer = decoded;
      src.connect(audioCtx.destination);
      src.start();
      src.onended = () => audioCtx.close();
    } catch (e: any) {
      alert(`TTS 오류: ${e.message}`);
    } finally {
      setPreviewing(false);
    }
  }

  async function exportZip() {
    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return alert('카드가 없습니다.');
    setZipProgress('준비 중...');
    try {
      await exportCardsAsZip(nodes, 'cardnews.zip', (i, total) =>
        setZipProgress(`${i}/${total}`)
      );
    } finally {
      setZipProgress('');
    }
  }

  async function exportVideo() {
    const nodes = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return alert('카드가 없습니다.');

    setVideoLoading(true);
    setVideoProgress(0);
    setVideoStatus('카드 이미지 준비 중...');

    try {
      const cardPngs: string[] = [];
      for (let i = 0; i < nodes.length; i++) {
        setVideoStatus(`카드 렌더링 (${i + 1}/${nodes.length})`);
        const url = await renderNodeToDataUrl(nodes[i]);
        cardPngs.push(url);
      }

      const audioBuffers: ArrayBuffer[] = [];
      if (tts.enabled) {
        for (let i = 0; i < slides.length; i++) {
          setVideoStatus(`음성 생성 (${i + 1}/${slides.length})`);
          const s = slides[i];
          const text = [s.headline, s.body].filter(Boolean).join('. ');
          const buf = await generateSlideAudio(text, tts);
          audioBuffers.push(buf);
        }
      }

      setVideoStatus('영상 녹화 중...');
      const blob = await generateShorts(cardPngs, {
        layout,
        showSubtitle: tts.enabled,
        subtitleTexts: slides.map((s) => s.headline),
        audioBuffers,
        onProgress: setVideoProgress,
        onStatus: setVideoStatus,
      });
      downloadBlob(blob, `shorts-${Date.now()}.webm`);
    } catch (e: any) {
      alert(`영상 생성 오류: ${e.message}`);
    } finally {
      setVideoLoading(false);
      setVideoProgress(0);
      setVideoStatus('');
    }
  }

  return (
    <div className="space-y-4">
      <VideoLayoutPicker layout={layout} onChange={setLayout} />
      <TtsPicker
        config={tts}
        onChange={setTts}
        onPreview={previewTts}
        previewing={previewing}
      />

      <div className="border rounded-xl p-4 bg-white space-y-3">
        <h3 className="font-semibold">📤 내보내기</h3>

        <button
          onClick={exportZip}
          disabled={!!zipProgress}
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {zipProgress ? `PNG 생성 중 ${zipProgress}` : '📦 PNG 카드뉴스 ZIP 다운로드'}
        </button>

        <button
          onClick={exportVideo}
          disabled={videoLoading}
          className="w-full border-2 border-brand-600 text-brand-600 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {videoLoading
            ? `${videoStatus} ${videoProgress}%`
            : '🎬 숏츠 영상 생성 (WebM)'}
        </button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• PNG: 인스타 카드뉴스 업로드용 (1080×1350, 6장 ZIP)</p>
          <p>• 영상: 유튜브/릴스/틱톡용 (1080×1920 WebM)</p>
          <p>• MP4가 필요하면 WebM을 변환 사이트에서 변환하세요</p>
        </div>
      </div>
    </div>
  );
}