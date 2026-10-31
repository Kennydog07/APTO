/**
 * Client-side photo preparation for the listing writer: reject files over 5MB, then
 * downscale so the longest edge is at most 1024px and re-encode as JPEG. This keeps
 * uploads small, strips EXIF metadata (e.g. GPS location) and cuts AI cost.
 */
import { LISTING_LIMITS } from '../../shared/schemas/listing-writer';

export interface PreparedImage {
  mediaType: 'image/jpeg';
  data: string; // base64, no data: prefix
  previewUrl: string;
  name: string;
}

export class ImageError extends Error {}

export async function prepareImage(file: File): Promise<PreparedImage> {
  if (file.size > LISTING_LIMITS.maxUploadBytes) {
    throw new ImageError(`“${file.name}” is over 5MB. Please choose a smaller photo.`);
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageError(`Couldn’t read “${file.name}”. Try a JPEG or PNG photo.`);
  }
  const max = LISTING_LIMITS.maxEdgePx;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new ImageError('Your browser could not process this photo.');
  ctx.fillStyle = '#fff'; // flatten transparency for JPEG
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.85),
  );
  if (!blob) throw new ImageError('Your browser could not process this photo.');
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new ImageError('Could not read the photo.'));
    reader.readAsDataURL(blob);
  });
  return {
    mediaType: 'image/jpeg',
    data: dataUrl.slice(dataUrl.indexOf(',') + 1),
    previewUrl: URL.createObjectURL(blob),
    name: file.name,
  };
}
