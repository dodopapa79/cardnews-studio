/**
 * 이미지 저장소 (IndexedDB)
 * - 카드뉴스 슬라이드의 이미지를 별도 저장
 * - localStorage 용량 제한 우회
 * - 프로젝트 삭제 시 함께 삭제
 */

const DB_NAME = 'cardnews-studio';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB는 브라우저에서만 사용 가능합니다.'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

export interface StoredImage {
  id: string;
  projectId: string;
  slideId: string;
  dataUrl: string;
  createdAt: number;
}

/** 이미지 저장 */
export async function saveImage(image: StoredImage): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(image);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** 이미지 여러 개 한 번에 저장 */
export async function saveImages(images: StoredImage[]): Promise<void> {
  if (images.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    images.forEach((img) => store.put(img));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 이미지 조회 */
export async function getImage(id: string): Promise<StoredImage | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

/** 프로젝트의 모든 이미지 조회 */
export async function getImagesByProject(projectId: string): Promise<StoredImage[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('projectId');
    const req = index.getAll(projectId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/** 이미지 삭제 */
export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** 프로젝트의 모든 이미지 삭제 (프로젝트 삭제 시) */
export async function deleteImagesByProject(projectId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('projectId');
    const req = index.openCursor(projectId);
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 특정 슬라이드의 이미지 삭제 */
export async function deleteImagesBySlide(projectId: string, slideId: string): Promise<void> {
  const images = await getImagesByProject(projectId);
  const targets = images.filter((img) => img.slideId === slideId);
  if (targets.length === 0) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    targets.forEach((img) => store.delete(img.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** 모든 이미지 삭제 */
export async function clearAllImages(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** 저장된 이미지 총 용량 (대략) */
export async function getStorageUsage(): Promise<{ count: number; bytes: number }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result as StoredImage[];
      const bytes = items.reduce((sum, item) => sum + (item.dataUrl?.length || 0), 0);
      resolve({ count: items.length, bytes });
    };
    req.onerror = () => reject(req.error);
  });
}