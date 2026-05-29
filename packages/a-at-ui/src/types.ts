export type AAtUISerializableValue =
  | string
  | number
  | boolean
  | null
  | AAtUISerializableValue[]
  | { [key: string]: AAtUISerializableValue };

export interface AAtUIRenderCommand {
  type: 'render';
  component: string;
  params?: Record<string, unknown>;
}

export interface AAtUIUpdateCommand {
  type: 'update';
  widgetId: string;
  params: Record<string, unknown>;
}

export interface AAtUIDestroyCommand {
  type: 'destroy';
  widgetId: string;
}

export type AAtUICommand =
  | AAtUIRenderCommand
  | AAtUIUpdateCommand
  | AAtUIDestroyCommand;

export interface AAtUIResponsePayload {
  commands: AAtUICommand[];
}

export interface AAtUIEvent<
  TPayload extends Record<string, AAtUISerializableValue> = Record<
    string,
    AAtUISerializableValue
  >,
> {
  type: string;
  widgetId: string;
  payload: TPayload;
  timestamp: number;
}

export interface AAtUIManifestLibrary {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
}

export interface AAtUIManifestEventDefinition {
  type: string;
  description: string;
  payload: boolean | Record<string, unknown>;
}

export interface AAtUIWidgetLifecycle {
  render: boolean;
  update: boolean;
  destroy: boolean;
}

export interface AAtUIManifestComponent {
  name: string;
  description: string;
  params: boolean | Record<string, unknown>;
  events: AAtUIManifestEventDefinition[];
  lifecycle: AAtUIWidgetLifecycle;
}

export interface AAtUIManifest {
  specVersion: string;
  library: AAtUIManifestLibrary;
  components: AAtUIManifestComponent[];
}
