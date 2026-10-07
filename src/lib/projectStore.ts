import type { CardNewsProject, Slide } from './types';
import { saveImages, getImagesByProject, deleteImagesByProject, type StoredImage } from './imageStore';

/**
 * 프로젝트를 저장할 때 이미지를 분리.
 * - 슬라이드의 imageUrl이 있으면 IndexedDB에 저장하고 imageId로 대체
 * - localStorage에는 imageId만 저장
 */
export async function extractAndSaveImages(
  project: CardNewsProject
): Promise<CardNewsProject> {
  const storedImages: StoredImage[] = [];
  const newSlides: Slide[] = [];

  for (const slide of project.slides) {
    // 이미 imageId가 있고 data URL이 없으면 그대로 유지
    if (!slide.imageUrl && slide.imageId) {
      newSlides.push(slide);
      continue;
    }
    // data URL이 없으면 그대로
    if (!slide.imageUrl) {
      newSlides.push({ ...slide, imageId: undefined });
      continue;
    }
    // data URL이 이미 IndexedDB에 저장된 것과 같으면(imageId 있고 URL 유지중) 재사용
    if (slide.imageId && slide.imageUrl.startsWith('data:')) {
      // imageId가 있으면 그대로 두고, IndexedDB에도 최신 저장
      storedImages.push({
        id: slide.imageId,
        projectId: project.id,
        slideId: slide.id,
        dataUrl: slide.imageUrl,
        createdAt: Date.now(),
      });
      newSlides.push(slide);
      continue;
    }
    // 새 이미지 → IndexedDB 저장
    const imageId = `img-${project.id}-${slide.id}`;
    storedImages.push({
      id: imageId,
      projectId: project.id,
      slideId: slide.id,
      dataUrl: slide.imageUrl,
      createdAt: Date.now(),
    });
    newSlides.push({ ...slide, imageId });
  }

  if (storedImages.length > 0) {
    await saveImages(storedImages);
  }

  return { ...project, slides: newSlides };
}

/**
 * 프로젝트를 로드할 때 이미지 복원.
 * - imageId가 있으면 IndexedDB에서 data URL을 가져와 imageUrl에 채움
 */
export async function restoreImages(project: CardNewsProject): Promise<CardNewsProject> {
  const storedImages = await getImagesByProject(project.id);
  const imageMap = new Map(storedImages.map((img) => [img.id, img.dataUrl]));

  const newSlides = project.slides.map((slide) => {
    if (slide.imageId && imageMap.has(slide.imageId)) {
      return { ...slide, imageUrl: imageMap.get(slide.imageId)! };
    }
    return slide;
  });

  return { ...project, slides: newSlides };
}

/**
 * 프로젝트 삭제 시 이미지도 함께 삭제.
 */
export async function deleteProjectImages(projectId: string): Promise<void> {
  await deleteImagesByProject(projectId);
}

/**
 * 슬라이드에서 이미지를 제거할 때 (imageUrl을 ''로 만들 때) IndexedDB에서도 삭제.
 */
export async function deleteSlideImage(projectId: string, slideId: string): Promise<void> {
  const { deleteImagesBySlide } = await import('./imageStore');
  await deleteImagesBySlide(projectId, slideId);
}