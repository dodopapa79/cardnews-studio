export type CFModel =
  | '@cf/black-forest-labs/flux-1-schnell'
  | '@cf/black-forest-labs/flux-2-dev';

interface GenOptions {
  model?: CFModel;
  width?: number;
  height?: number;
  steps?: number;
  seed?: number;
}

export async function generateImage(
  accountId: string,
  apiToken: string,
  prompt: string,
  options: GenOptions = {}
): Promise<string> {
  const {
    model = '@cf/black-forest-labs/flux-1-schnell',
    width = 1080,
    height = 1350,
    steps = 8,
    seed,
  } = options;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;

  const body: Record<string, unknown> = {
    prompt,
    width,
    height,
    num_steps: steps,
  };
  if (seed !== undefined) body.seed = seed;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudflare 이미지 생성 실패 (${res.status}): ${err.slice(0, 200)}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('image')) {
    const blob = await res.blob();
    return await blobToDataUrl(blob);
  }
  const data = await res.json();
  const b64 = data.result?.image;
  if (!b64) throw new Error('이미지 데이터가 응답에 없습니다.');
  return `data:image/jpeg;base64,${b64}`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}