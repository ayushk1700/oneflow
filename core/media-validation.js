const MAX_PIXELS = 32 * 1024 * 1024;
const rasterTypes = ['image/png', 'image/jpeg', 'image/webp'];
const ascii = (bytes, start, count) => String.fromCharCode(...bytes.subarray(start, start + count));
/** Inspect dimensions before decoding compressed raster content. */
export function rasterDimensions(bytes, type) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (type === 'image/png' && bytes.length >= 24 && ascii(bytes, 1, 3) === 'PNG' && bytes[0] === 137 && ascii(bytes, 12, 4) === 'IHDR') {
    return [view.getUint32(16), view.getUint32(20)];
  }
  if (type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216) {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset++] !== 255) break;
      while (bytes[offset] === 255) offset++;
      const marker = bytes[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || marker >= 208 && marker <= 215) continue;
      if (offset + 2 > bytes.length) break;
      const size = view.getUint16(offset);
      if (size < 2) break;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker)) return [view.getUint16(offset + 5), view.getUint16(offset + 3)];
      offset += size;
    }
  }
  if (type === 'image/webp' && bytes.length >= 30 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') {
    for (let offset = 12; offset + 18 <= bytes.length;) {
      const chunk = ascii(bytes, offset, 4), start = offset + 8;
      if (chunk === 'VP8X') return [1 + bytes[start + 4] + (bytes[start + 5] << 8) + (bytes[start + 6] << 16), 1 + bytes[start + 7] + (bytes[start + 8] << 8) + (bytes[start + 9] << 16)];
      if (chunk === 'VP8 ' && bytes[start + 3] === 157 && bytes[start + 4] === 1 && bytes[start + 5] === 42) return [view.getUint16(start + 6, true) & 16383, view.getUint16(start + 8, true) & 16383];
      if (chunk === 'VP8L' && bytes[start] === 47) { const bits = view.getUint32(start + 1, true); return [(bits & 16383) + 1, (bits >>> 14 & 16383) + 1]; }
      offset = start + view.getUint32(offset + 4, true) + (view.getUint32(offset + 4, true) & 1);
    }
  }
  throw new Error('Unsupported or damaged raster image.');
}
function checkDimensions(width, height, maxWidth = 8192, maxHeight = 8192, maxPixels = MAX_PIXELS) {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > maxWidth || height > maxHeight || width * height > maxPixels) throw new Error('Media dimensions exceed the supported limit.');
}
/** Decode an allowed image only after checking compressed size and header dimensions. */
export async function decodeRaster(blob) {
  if (!rasterTypes.includes(blob.type) || !blob.size || blob.size > 8 * 1024 * 1024) throw new Error('Choose a PNG, JPEG or WebP image up to 8 MB.');
  const [width, height] = rasterDimensions(new Uint8Array(await blob.slice(0, 256 * 1024).arrayBuffer()), blob.type);
  checkDimensions(width, height);
  const bitmap = await createImageBitmap(blob);
  try { checkDimensions(bitmap.width, bitmap.height); }
  catch (error) { bitmap.close(); throw error; }
  return bitmap;
}
/** Validate local video bytes and decoded metadata without playing the file. */
export async function validateVideo(blob) {
  if (!['video/mp4', 'video/webm'].includes(blob.type) || !blob.size || blob.size > 16 * 1024 * 1024) throw new Error('Choose an MP4 or WebM video up to 16 MB.');
  const url = URL.createObjectURL(blob), video = document.createElement('video');
  video.preload = 'metadata';
  let timer;
  try {
    await new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Video validation timed out. Choose another file.')), 8000);
      video.onerror = () => reject(new Error('Unsupported or damaged video.'));
      video.onloadedmetadata = () => {
        try {
          checkDimensions(video.videoWidth, video.videoHeight, 3840, 2160, 3840 * 2160);
          if (Number.isFinite(video.duration) && (video.duration <= 0 || video.duration > 600)) throw new Error('Choose a looping video no longer than 10 minutes.');
          resolve();
        } catch (error) { reject(error); }
      };
      video.src = url;
    });
  } finally { clearTimeout(timer); video.removeAttribute('src'); video.load(); URL.revokeObjectURL(url); }
}
/** Validate voice recording content using the offline decoder; never start playback. */
export async function validateAudio(blob) {
  if (!/^audio\/(webm|ogg|mp4)(;codecs=[\w,-]+)?$/.test(blob.type) || !blob.size || blob.size > 8 * 1024 * 1024) throw new Error('Choose recorded audio up to 8 MB.');
  const context = new OfflineAudioContext(1, 1, 48000);
  let timer;
  const buffer = await Promise.race([
    context.decodeAudioData(await blob.arrayBuffer()),
    new Promise((resolve, reject) => { timer = setTimeout(() => reject(new Error('Audio validation timed out.')), 8000); })
  ]).finally(() => clearTimeout(timer));
  if (!buffer.length || buffer.duration > 122 || buffer.numberOfChannels > 2) throw new Error('Voice attachments must contain at most two minutes of audio.');
}
/** Validate imported attachment content in addition to its declared MIME label. */
export async function validateAttachment(blob) {
  if (blob.type.startsWith('image/')) { const bitmap = await decodeRaster(blob); bitmap.close(); }
  else await validateAudio(blob);
}
