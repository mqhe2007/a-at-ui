import { inject, type App, type Component } from 'vue';
import type {
  BraidCommand,
  BraidEvent,
  BraidManifest,
  BraidSerializableValue,
} from '../../types.js';
import { WidgetManager } from './widget-manager.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BraidVueComponentEvent = Omit<BraidEvent, 'widgetId' | 'timestamp'>;

export interface BraidAdapterErrorContext {
  source: 'stream' | 'dispatch' | 'config';
  raw?: string;
  command?: unknown;
}

export interface BraidAdapterOptions {
  components: Record<string, Component>;
  manifest: BraidManifest;
  mountTarget: string | HTMLElement;
  onWidgetReady?: (widgetId: string, component: string, rootEl: HTMLElement) => void;
  onEvent?: (event: BraidEvent<Record<string, BraidSerializableValue>>) => void;
  onError?: (error: Error, context: BraidAdapterErrorContext) => void;
  createWidgetId?: () => string;
}

export interface BraidVuePluginOptions {
  manifest: BraidManifest;
  /** 可选：显式指定组件映射，优先级高于全局注册的组件。 */
  components?: Record<string, Component>;
}

/** createAdapter 的运行时参数（mountTarget + 回调等动态部分）。 */
export interface BraidAdapterRuntimeOptions {
  mountTarget: string | HTMLElement;
  onWidgetReady?: (widgetId: string, component: string, rootEl: HTMLElement) => void;
  onEvent?: (event: BraidEvent<Record<string, BraidSerializableValue>>) => void;
  onError?: (error: Error, context: BraidAdapterErrorContext) => void;
}

// ─── Plugin symbol ───────────────────────────────────────────────────────────

const BraidAdapterKey = Symbol('BraidAdapter');

// ─── Plugin ──────────────────────────────────────────────────────────────────

/**
 * 创建 Braid Vue 插件。
 *
 * 安装后通过 `useBraidAdapter()` 获取 `createAdapter` 工厂函数。
 * 组件解析优先级：`components` 显式映射 > `app.component()` 全局注册。
 */
export function createBraidPlugin(options: BraidVuePluginOptions)
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
              `[Braid] Component "${name}" not found. ` +
              `Register it globally with app.component() or provide it explicitly via the "components" option.`
            );
          }
          components[name] = globalComp;
        }
      }

      const adapterFactory = {
        createAdapter(runtimeOptions: BraidAdapterRuntimeOptions): BraidAdapter {
          return createBraidAdapter({
            components,
            manifest,
            ...runtimeOptions,
          });
        },
      };

      app.provide(BraidAdapterKey, adapterFactory);
    },
  };
}

/**
 * 在 Vue setup 中获取 `createAdapter` 工厂。
 * 必须先通过 `app.use(createBraidPlugin(...))` 安装插件。
 */
export function useBraidAdapter(): { createAdapter: (options: BraidAdapterRuntimeOptions) => BraidAdapter } {
  const factory = inject<{ createAdapter: (options: BraidAdapterRuntimeOptions) => BraidAdapter }>(BraidAdapterKey);
  if (!factory) {
    throw new Error(
      '[Braid] useBraidAdapter() must be called after installing the Braid plugin via app.use(createBraidPlugin(...)).'
    );
  }
  return factory;
}

// ─── Low-level adapter ───────────────────────────────────────────────────────

function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(typeof error === 'string' ? error : 'Unknown Braid runtime error');
}

export class BraidAdapter {
  private manager: WidgetManager;
  private onError?: BraidAdapterOptions['onError'];

  constructor(options: BraidAdapterOptions) {
    this.onError = options.onError;

    try {
      this.manager = new WidgetManager(options);
    } catch (error) {
      const normalizedError = normalizeError(error);
      this.onError?.(normalizedError, { source: 'config' });
      throw normalizedError;
    }
  }

  dispatch(command: BraidCommand): void {
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

  handleError(error: unknown, context: BraidAdapterErrorContext): void {
    const normalizedError = normalizeError(error);
    if (this.onError) {
      this.onError(normalizedError, context);
      return;
    }
    throw normalizedError;
  }
}

export function createBraidAdapter(options: BraidAdapterOptions): BraidAdapter {
  return new BraidAdapter(options);
}
