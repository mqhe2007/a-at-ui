export type BraidSerializableValue =
  | string
  | number
  | boolean
  | null
  | BraidSerializableValue[]
  | { [key: string]: BraidSerializableValue };

export interface BraidRenderCommand {
  type: 'render';
  component: string;
  params?: Record<string, unknown>;
}

export interface BraidUpdateCommand {
  type: 'update';
  widgetId: string;
  params: Record<string, unknown>;
}

export interface BraidDestroyCommand {
  type: 'destroy';
  widgetId: string;
}

export type BraidCommand =
  | BraidRenderCommand
  | BraidUpdateCommand
  | BraidDestroyCommand;

export interface BraidResponsePayload {
  commands: BraidCommand[];
}

export interface BraidEvent<
  TPayload extends Record<string, BraidSerializableValue> = Record<
    string,
    BraidSerializableValue
  >,
> {
  type: string;
  widgetId: string;
  payload: TPayload;
  timestamp: number;
}

export interface BraidManifestLibrary {
  name: string;
  version: string;
  description?: string;
  homepage?: string;
}

export interface BraidManifestEventDefinition {
  type: string;
  description: string;
  payload: boolean | Record<string, unknown>;
}

export interface BraidWidgetLifecycle {
  render: boolean;
  update: boolean;
  destroy: boolean;
}

export interface BraidManifestComponent {
  name: string;
  description: string;
  params: boolean | Record<string, unknown>;
  events: BraidManifestEventDefinition[];
  lifecycle: BraidWidgetLifecycle;
}

export interface BraidManifest {
  specVersion: string;
  library: BraidManifestLibrary;
  components: BraidManifestComponent[];
}
