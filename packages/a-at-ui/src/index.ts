export type {
  AAtUICommand,
  AAtUIDestroyCommand,
  AAtUIEvent,
  AAtUIManifest,
  AAtUIManifestComponent,
  AAtUIManifestEventDefinition,
  AAtUIManifestLibrary,
  AAtUIRenderCommand,
  AAtUIResponsePayload,
  AAtUISerializableValue,
  AAtUIUpdateCommand,
  AAtUIWidgetLifecycle,
} from './types.js';

export { isRecord, validateAAtUICommand, validateAAtUIResponsePayload } from './utils.js';
