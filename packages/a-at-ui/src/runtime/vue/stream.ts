import type { AAtUICommand } from '../../types.js';
import type { AAtUIAdapter } from './adapter.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAAtUICommand(value: unknown): value is AAtUICommand {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }

  switch (value.type) {
    case 'render':
      return (
        typeof value.component === 'string' &&
        value.component.length > 0 &&
        (value.params === undefined || isRecord(value.params)) &&
        value.widgetId === undefined
      );
    case 'update':
      return (
        typeof value.widgetId === 'string' &&
        value.widgetId.length > 0 &&
        isRecord(value.params) &&
        value.component === undefined
      );
    case 'destroy':
      return (
        typeof value.widgetId === 'string' &&
        value.widgetId.length > 0 &&
        value.component === undefined &&
        value.params === undefined
      );
    default:
      return false;
  }
}

export async function consumeAAtUIStream(
  stream: ReadableStream<string | Uint8Array>,
  adapter: AAtUIAdapter
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += typeof value === 'string' ? value : decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) {
          continue;
        }

        if (!trimmedLine.startsWith('data:')) {
          continue;
        }

        const payload = trimmedLine.slice(5).trim();
        if (!payload) {
          continue;
        }

        if (payload === '[DONE]') {
          return;
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(payload);
        } catch (error) {
          adapter.handleError(error, { source: 'stream', raw: payload });
          continue;
        }

        if (!isAAtUICommand(parsed)) {
          adapter.handleError(new Error('[A@UI] Invalid command payload.'), {
            source: 'stream',
            raw: payload,
            command: parsed,
          });
          continue;
        }

        adapter.dispatch(parsed);
      }
    }

    if (buffer.trim()) {
      adapter.handleError(new Error('[A@UI] Trailing partial SSE frame.'), {
        source: 'stream',
        raw: buffer,
      });
    }
  } finally {
    reader.releaseLock();
  }
}
