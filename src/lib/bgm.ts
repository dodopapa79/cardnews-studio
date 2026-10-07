import type { BgmTrack } from './types';

/** 무료 BGM 사이트 — 다운로드 후 업로드 방식 */
export const BGM_SOURCES: BgmTrack[] = [
  // 차분한
  {
    id: 'pixabay-calm',
    name: 'Pixabay Music — 차분한',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/mood/calm/',
    category: 'calm',
  },
  {
    id: 'yt-calm',
    name: 'YouTube Audio Library — Calm',
    url: '',
    source: 'YouTube',
    sourceUrl: 'https://www.youtube.com/audiolibrary/music?nv=1',
    category: 'calm',
  },
  // 밝은
  {
    id: 'pixabay-bright',
    name: 'Pixabay Music — 밝은',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/mood/happy/',
    category: 'bright',
  },
  {
    id: 'mixkit-bright',
    name: 'Mixkit — Bright',
    url: '',
    source: 'Mixkit',
    sourceUrl: 'https://mixkit.co/free-stock-music/tag/bright/',
    category: 'bright',
  },
  // 활기찬
  {
    id: 'pixabay-upbeat',
    name: 'Pixabay Music — 활기찬',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/mood/energetic/',
    category: 'upbeat',
  },
  {
    id: 'freepd-upbeat',
    name: 'FreePD — Upbeat',
    url: '',
    source: 'FreePD',
    sourceUrl: 'https://freepd.com/upbeat.php',
    category: 'upbeat',
  },
  // 감성적
  {
    id: 'pixabay-emotional',
    name: 'Pixabay Music — 감성적',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/mood/emotional/',
    category: 'emotional',
  },
  {
    id: 'unminus-emotional',
    name: 'Unminus — Emotional',
    url: '',
    source: 'Unminus',
    sourceUrl: 'https://www.unminus.com/',
    category: 'emotional',
  },
  // 미니멀
  {
    id: 'pixabay-minimal',
    name: 'Pixabay Music — 미니멀',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/minimal/',
    category: 'minimal',
  },
  {
    id: 'mixkit-minimal',
    name: 'Mixkit — Minimal',
    url: '',
    source: 'Mixkit',
    sourceUrl: 'https://mixkit.co/free-stock-music/tag/minimal/',
    category: 'minimal',
  },
  // 신나는
  {
    id: 'pixabay-exciting',
    name: 'Pixabay Music — 신나는',
    url: '',
    source: 'Pixabay',
    sourceUrl: 'https://pixabay.com/music/search/mood/exciting/',
    category: 'exciting',
  },
  {
    id: 'mixkit-exciting',
    name: 'Mixkit — Exciting',
    url: '',
    source: 'Mixkit',
    sourceUrl: 'https://mixkit.co/free-stock-music/tag/upbeat/',
    category: 'exciting',
  },
];

export const BGM_CATEGORY_LABELS: Record<BgmTrack['category'], string> = {
  calm: '차분한',
  bright: '밝은',
  upbeat: '활기찬',
  emotional: '감성적',
  minimal: '미니멀',
  exciting: '신나는',
};

/** 사용자가 업로드한 오디오 파일의 재생 시간 */
export async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(audio.src);
      resolve(audio.duration);
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('오디오 로드 실패'));
    };
    audio.src = URL.createObjectURL(file);
  });
}