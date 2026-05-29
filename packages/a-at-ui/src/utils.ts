import type { AAtUICommand, AAtUIResponsePayload } from './types.js';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateAAtUICommand(value: unknown): value is AAtUICommand {
  if (!isRecord(value) || typeof value.type !== 'string') return false;

  if (value.type === 'render') {
    if (typeof value.component !== 'string') return false;
    if ('widgetId' in value) return false;
    if ('params' in value && !isRecord(value.params)) return false;
    return true;
  }

  if (value.type === 'update') {
    return typeof value.widgetId === 'string' && value.widgetId.length > 0 && isRecord(value.params);
  }

  if (value.type === 'destroy') {
    return typeof value.widgetId === 'string' && value.widgetId.length > 0 && !('params' in value) && !('component' in value);
  }

  return false;
}

export function validateAAtUIResponsePayload(value: unknown): value is AAtUIResponsePayload {
  return isRecord(value) && Array.isArray(value.commands) && value.commands.every(validateAAtUICommand);
}
