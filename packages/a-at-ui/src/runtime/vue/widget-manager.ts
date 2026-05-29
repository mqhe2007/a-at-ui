import { createApp, h, reactive, type App, type Component, type Reactive } from 'vue';
import type {
  AAtUICommand,
  AAtUIDestroyCommand,
  AAtUIEvent,
  AAtUIManifest,
  AAtUIManifestComponent,
  AAtUIRenderCommand,
  AAtUISerializableValue,
  AAtUIUpdateCommand,
} from '../../types.js';
import type { AAtUIAdapterOptions, AAtUIVueComponentEvent } from './adapter.js';

interface WidgetInstance {
  widgetId: string;
  component: string;
  props: Reactive<Record<string, unknown>>;
  app: App;
  el: HTMLElement;
}

export interface WidgetManagerOptions
  extends Pick<
    AAtUIAdapterOptions,
    'createWidgetId' | 'manifest' | 'mountTarget' | 'onError' | 'onEvent' | 'onWidgetReady' | 'components'
  > { }

function isSerializableValue(value: unknown): value is AAtUISerializableValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isSerializableValue);
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isSerializableValue);
  }

  return false;
}

function createDefaultWidgetId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `widget_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function resolveMountTarget(mountTarget: string | HTMLElement): HTMLElement {
  if (typeof mountTarget !== 'string') {
    return mountTarget;
  }

  const element = document.querySelector(mountTarget);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`[A@UI] Mount target not found: ${mountTarget}`);
  }

  return element;
}

interface ComponentEntry {
  component: Component;
  definition: AAtUIManifestComponent;
}

function buildComponentMap(
  manifest: AAtUIManifest,
  components: Record<string, Component>,
): Map<string, ComponentEntry> {
  const map = new Map<string, ComponentEntry>();

  for (const def of manifest.components) {
    const comp = components[def.name];
    if (!comp) {
      throw new Error(
        `[A@UI] Manifest component "${def.name}" has no matching Vue component. ` +
        `Provide it via components map or register it globally with app.component().`
      );
    }
    map.set(def.name, { component: comp, definition: def });
  }

  return map;
}

export class WidgetManager {
  private widgets = new Map<string, WidgetInstance>();
  private componentsByName: Map<string, ComponentEntry>;
  private mountTargetEl: HTMLElement;
  private options: WidgetManagerOptions;

  constructor(options: WidgetManagerOptions) {
    this.options = options;
    this.componentsByName = buildComponentMap(options.manifest, options.components);
    this.mountTargetEl = resolveMountTarget(options.mountTarget);
  }

  private getComponentEntry(componentName: string): ComponentEntry {
    const entry = this.componentsByName.get(componentName);
    if (!entry) {
      throw new Error(`[A@UI] Unknown component: ${componentName}`);
    }
    return entry;
  }

  private emitEvent(widgetId: string, event: AAtUIVueComponentEvent): void {
    if (!isSerializableValue(event.payload)) {
      throw new Error(`[A@UI] Event payload must be JSON-serializable for widget ${widgetId}`);
    }

    const fullEvent: AAtUIEvent<Record<string, AAtUISerializableValue>> = {
      ...event,
      widgetId,
      timestamp: Date.now(),
      payload: event.payload as Record<string, AAtUISerializableValue>,
    };

    this.options.onEvent?.(fullEvent);
  }

  create(command: AAtUIRenderCommand): string {
    const entry = this.getComponentEntry(command.component);
    if (!entry.definition.lifecycle.render) {
      throw new Error(`[A@UI] Component does not support render: ${command.component}`);
    }

    const widgetId = this.options.createWidgetId?.() ?? createDefaultWidgetId();
    const container = document.createElement('div');
    container.dataset.widgetId = widgetId;
    this.mountTargetEl.appendChild(container);

    const props = reactive<Record<string, unknown>>({ ...(command.params ?? {}) });
    const onEvent = (event: AAtUIVueComponentEvent) => this.emitEvent(widgetId, event);

    const app = createApp({
      render: () => h(entry.component, { ...props, onEvent }),
    });
    app.mount(container);

    this.widgets.set(widgetId, {
      widgetId,
      component: command.component,
      props,
      app,
      el: container,
    });

    this.options.onWidgetReady?.(widgetId, command.component);
    return widgetId;
  }

  update(command: AAtUIUpdateCommand): void {
    const instance = this.widgets.get(command.widgetId);
    if (!instance) {
      console.warn(`[A@UI] Unknown widget for update: ${command.widgetId}`);
      return;
    }

    const entry = this.getComponentEntry(instance.component);
    if (!entry.definition.lifecycle.update) {
      throw new Error(`[A@UI] Component does not support update: ${instance.component}`);
    }

    Object.assign(instance.props, command.params);
  }

  destroy(command: AAtUIDestroyCommand): void {
    const instance = this.widgets.get(command.widgetId);
    if (!instance) {
      console.warn(`[A@UI] Unknown widget for destroy: ${command.widgetId}`);
      return;
    }

    const entry = this.getComponentEntry(instance.component);
    if (!entry.definition.lifecycle.destroy) {
      throw new Error(`[A@UI] Component does not support destroy: ${instance.component}`);
    }

    instance.app.unmount();
    instance.el.remove();
    this.widgets.delete(command.widgetId);
  }

  get(widgetId: string): WidgetInstance | undefined {
    return this.widgets.get(widgetId);
  }

  dispatch(command: AAtUICommand): void {
    switch (command.type) {
      case 'render':
        this.create(command);
        return;
      case 'update':
        this.update(command);
        return;
      case 'destroy':
        this.destroy(command);
        return;
      default:
        throw new Error(`[A@UI] Unsupported command type: ${(command as { type: string }).type}`);
    }
  }
}
