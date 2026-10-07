export type CFModel =
  | '@cf/black-forest-labs/flux-1-schnell'
  | '@cf/black-forest-labs/flux-2-dev';

interface GenOptions {
  model?: CFModel;
  workerUrl: string;
}

export async function generateImage(
  accountId: string,
  apiToken: string,
  prompt: string,
  options: GenOptions
): Promise<string> {
  const {
    model = '@cf/black-forest-labs/flux-1-schnell',
    workerUrl,
  } = options;

  // Cloudflare flux-1-schnell은 prompt만 받음
  const body = { prompt };

  const res = await fetch(workerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId,
      apiToken,
      model,
      body,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`이미지 생성 실패 (${res.status}): ${err.slice(0, 300)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('image')) {
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  }

  const data = await res.json();
  if (data?.result?.image) {
    return `data:image/jpeg;base64,${data.result.image}`;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  throw new Error('이미지 데이터가 응답에 없습니다.');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}