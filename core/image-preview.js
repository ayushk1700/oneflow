/** Create a small local preview without changing the backed-up original image. */
export async function imagePreview(blob) {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, 384 / bitmap.width, 216 / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .65));
    if (!result) throw new Error('Photo preview is unavailable.');
    return result;
  } finally { bitmap.close(); }
}
