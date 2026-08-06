const R2_API_URL =
  import.meta.env.VITE_R2_API_URL ?? 'https://fleetrentals-storage.neuereatec.workers.dev';

export function getR2PublicUrl(path: string): string {
  const base = R2_API_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${base}/${cleanPath}`;
}

export async function uploadToR2(
  path: string,
  data: Blob | File,
  contentType?: string
): Promise<string> {
  const type =
    contentType ?? (data instanceof File ? data.type : data.type || 'application/octet-stream');
  const cleanPath = path.replace(/^\//, '');

  const res = await fetch(`${R2_API_URL}/${cleanPath}`, {
    method: 'PUT',
    body: data,
    headers: { 'Content-Type': type },
  });

  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status}`);
  }

  const json = (await res.json()) as { url?: string; path?: string };
  return json.url ?? getR2PublicUrl(cleanPath);
}

export async function uploadFileToR2(folder: string, file: File, userId?: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'bin';
  const prefix = userId ? `${folder}/${userId}` : folder;
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadToR2(path, file, file.type);
}

export async function uploadBlobToR2(
  folder: string,
  blob: Blob,
  ext: string,
  userId?: string
): Promise<string> {
  const prefix = userId ? `${folder}/${userId}` : folder;
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return uploadToR2(path, blob, blob.type);
}

export async function dataUrlToR2(path: string, dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return uploadToR2(path, blob, blob.type);
}
