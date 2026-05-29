import { inject, type App, type Component } from 'vue';
import type {
  AAtUICommand,
  AAtUIEvent,
  AAtUIManifest,
  AAtUISerializableValue,
} from '../../types.js';
import { WidgetManager } from './widget-manager.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AAtUIVueComponentEvent = Omit<AAtUIEvent, 'widgetId' | 'timestamp'>;

export interface AAtUIAdapterErrorContext {
  source: 'stream' | 'dispatch' | 'config';
  raw?: string;
  command?: unknown;
}

export interface AAtUIAdapterOptions {
  components: Record<string, Component>;
  manifest: AAtUIManifest;
  mountTarget: string | HTMLElement;
  onWidgetReady?: (widgetId: string, component: string, rootEl: HTMLElement) => void;
  onEvent?: (event: AAtUIEvent<Record<string, AAtUISerializableValue>>) => void;
  onError?: (error: Error, context: AAtUIAdapterErrorContext) => void;
  createWidgetId?: () => string;
}

export interface AAtUIVuePluginOptions {
  manifest: AAtUIManifest;
  /** 可选：显式指定组件映射，优先级高于全局注册的组件。 */
  components?: Record<string, Component>;
}

/** createAdapter 的运行时参数（mountTarget + 回调等动态部分）。 */
export interface AAtUIAdapterRuntimeOptions {
  mountTarget: string | HTMLElement;
  onWidgetReady?: (widgetId: string, component: string, rootEl: HTMLElement) => void;
  onEvent?: (event: AAtUIEvent<Record<string, AAtUISerializableValue>>) => void;
  onError?: (error: Error, context: AAtUIAdapterErrorContext) => void;
}

// ─── Plugin symbol ───────────────────────────────────────────────────────────

const AAtUIAdapterKey = Symbol('AAtUIAdapter');

// ─── Plugin ──────────────────────────────────────────────────────────────────

/**
 * 创建 A@UI Vue 插件。
 *
 * 安装后通过 `useAAtUIAdapter()` 获取 `createAdapter` 工厂函数。
 * 组件解析优先级：`components` 显式映射 > `app.component()` 全局注册。
 */
export function createAAtUIPlugin(options: AAtUIVuePluginOptions)
  : { install(app: App, ...options: any[]): any } {
  const { manifest, components: explicitComponents } = options;

  return {
    install(app: App) {
      // 解析所有 manifest 声明的组件：显式映射优先，否则从全局注册表取
      const components: Record<string, Component> = {};

      for (const def of manifest.components) {
        const name = def.name;
        if (explicitComponents?.[name]) {
          components[name] = explicitComponents[name];
        } else {
          const globalComp = app.component(name);
          if (!globalComp) {
            throw new Error(
              `[A@UI] Component "${name}" not found. ` +
              `Register it globally with app.component() or provide it explicitly via the "components" option.`
            );
          }
          components[name] = globalComp;
        }
      }

      const adapterFactory = {
        createAdapter(runtimeOptions: AAtUIAdapterRuntimeOptions): AAtUIAdapter {
          return createAAtUIAdapter({
            components,
            manifest,
            ...runtimeOptions,
          });
        },
      };

      app.provide(AAtUIAdapterKey, adapterFactory);
    },
  };
}

/**
 * 在 Vue setup 中获取 `createAdapter` 工厂。
 * 必须先通过 `app.use(createAAtUIPlugin(...))` 安装插件。
 */
export function useAAtUIAdapter(): { createAdapter: (options: AAtUIAdapterRuntimeOptions) => AAtUIAdapter } {
  const factory = inject<{ createAdapter: (options: AAtUIAdapterRuntimeOptions) => AAtUIAdapter }>(AAtUIAdapterKey);
  if (!factory) {
    throw new Error(
      '[A@UI] useAAtUIAdapter() must be called after installing the A@UI plugin via app.use(createAAtUIPlugin(...)).'
    );
  }
  return factory;
}

// ─── Low-level adapter ───────────────────────────────────────────────────────

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown A@UI runtime error');
}

export class AAtUIAdapter {
  private manager: WidgetManager;
  private onError?: AAtUIAdapterOptions['onError'];

  constructor(options: AAtUIAdapterOptions) {
    this.onError = options.onError;

    try {
      this.manager = new WidgetManager(options);
    } catch (error) {
      const normalizedError = normalizeError(error);
      this.onError?.(normalizedError, { source: 'config' });
      throw normalizedError;
    }
  }

  dispatch(command: AAtUICommand): void {
    try {
      this.manager.dispatch(command);
    } catch (error) {
      const normalizedError = normalizeError(error);
      if (this.onError) {
        this.onError(normalizedError, { source: 'dispatch', command });
        return;
      }
      throw normalizedError;
    }
  }

  handleError(error: unknown, context: AAtUIAdapterErrorContext): void {
    const normalizedError = normalizeError(error);
    if (this.onError) {
      this.onError(normalizedError, context);
      return;
    }
    throw normalizedError;
  }
}

export function createAAtUIAdapter(options: AAtUIAdapterOptions): AAtUIAdapter {
  return new AAtUIAdapter(options);
}
