'use client';

export interface TtsConfig {
  enabled: boolean;
  voice: string;
  rate: number;
  volume: number;
  pitch: string;
}

export const DEFAULT_TTS: TtsConfig = {
  enabled: false,
  voice: 'ko-KR-SunHiNeural',
  rate: 1.0,
  volume: 100,
  pitch: '+0Hz',
};

export const KOREAN_VOICES = [
  { id: 'ko-KR-SunHiNeural', name: '선히 (여성, 차분)' },
  { id: 'ko-KR-InJoonNeural', name: '인준 (남성, 신뢰감)' },
  { id: 'ko-KR-HyunsuMultilingualNeural', name: '현수 (남성, 다국어)' },
  { id: 'ko-KR-JiMinNeural', name: '지민 (여성, 밝음)' },
  { id: 'ko-KR-SeoHyeonNeural', name: '서현 (여성, 부드러움)' },
  { id: 'ko-KR-YuJinNeural', name: '유진 (여성, 또렷)' },
];

interface AudioResult {
  buffer: ArrayBuffer;
  durationMs: number;
}

const audioCache = new Map<string, AudioResult>();

function cacheKey(text: string, config: TtsConfig) {
  return `${config.voice}|${config.rate}|${config.volume}|${config.pitch}|${text}`;
}

/**
 * edge-tts-browser를 사용해 텍스트 → 음성 ArrayBuffer 변환.
 * WebSocket 기반이라 라이브러리의 내부 API를 동적으로 import.
 */
export async function generateSlideAudio(
  text: string,
  config: TtsConfig
): Promise<ArrayBuffer> {
  const trimmed = text.trim();
  if (!trimmed) return new ArrayBuffer(0);

  const key = cacheKey(trimmed, config);
  const cached = audioCache.get(key);
  if (cached) return cached.buffer;

  // 동적 import (SSR 회피)
  const mod: any = await import('edge-tts-browser');
  const EdgeTTSBrowser = mod.default || mod.EdgeTTSBrowser || mod;

  const tts = new EdgeTTSBrowser();

  // 라이브러리 버전에 따라 API가 다르므로 유연하게 처리
  const setVoice =
    tts?.tts?.setVoiceParams?.bind(tts.tts) ||
    tts?.setVoiceParams?.bind(tts);

  if (!setVoice) {
    throw new Error('edge-tts-browser API를 인식할 수 없습니다.');
  }

  setVoice({
    text: trimmed,
    voice: config.voice,
    rate: config.rate,
    volume: config.volume,
    pitch: config.pitch,
  });

  // 파일 생성 API도 버전별로 다름
  const toFile =
    tts?.tts?.ttsToFile?.bind(tts.tts) ||
    tts?.ttsToFile?.bind(tts) ||
    tts?.tts?.toFile?.bind(tts.tts);

  if (!toFile) {
    throw new Error('edge-tts-browser 출력 API를 인식할 수 없습니다.');
  }

  const blob: Blob = await toFile(`slide-${Date.now()}.mp3`);
  const buffer = await blob.arrayBuffer();

  const result: AudioResult = { buffer, durationMs: 0 };
  audioCache.set(key, result);
  return buffer;
}

export async function decodeToAudioBuffer(
  ctx: AudioContext,
  data: ArrayBuffer
): Promise<AudioBuffer> {
  // ArrayBuffer는 소비되므로 복사본 전달
  return await ctx.decodeAudioData(data.slice(0));
}