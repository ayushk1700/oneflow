/** Read bounded provider JSON, including chunked responses without Content-Length. */
export async function readJSON(response, maxBytes = 1024 * 1024) {
  if (Number(response.headers.get('content-length')) > maxBytes) {
    await response.body?.cancel();
    throw new Error('The provider response is too large. Try again later.');
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error('The provider returned an empty response.');
  const decoder = new TextDecoder();
  let text = '', size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error('The provider response is too large. Try again later.');
      }
      text += decoder.decode(value, { stream: true });
    }
    return JSON.parse(text + decoder.decode());
  } finally { reader.releaseLock(); }
}
/** Combine user cancellation with a deadline that also covers response-body reads. */
export function deadline(signal, milliseconds = 15000) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  else signal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(() => controller.abort(new DOMException('Provider request timed out.', 'TimeoutError')), milliseconds);
  return { signal: controller.signal, dispose() { clearTimeout(timer); signal?.removeEventListener('abort', abort); } };
}
