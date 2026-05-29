import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import type { AAtUIEvent, AAtUIManifest, AAtUISerializableValue } from '../../src/types.js';
import { consumeAAtUIStream, createAAtUIAdapter } from '../../src/runtime/vue/index.js';
import type { AAtUIAdapterErrorContext } from '../../src/runtime/vue/index.js';

const SearchBoxComponent = defineComponent({
  props: {
    value: {
      type: String,
      default: '',
    },
    onEvent: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(
        'button',
        {
          id: 'search-button',
          onClick: () => props.onEvent({ type: 'SearchBox:submit', payload: { query: 'Mercury' } }),
        },
        props.value || 'Search'
      );
  },
});

const DataTableComponent = defineComponent({
  props: {
    title: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    return () => h('div', { id: 'data-table' }, props.title || 'Data');
  },
});

function createManifest(): AAtUIManifest {
  return {
    specVersion: '0.1.0',
    library: {
      name: 'test-components',
      version: '0.1.0',
    },
    components: [
      {
        name: 'SearchBox',
        description: 'Search component',
        params: true,
        events: [
          {
            type: 'SearchBox:submit',
            description: 'Submit search query',
            payload: true,
          },
        ],
        lifecycle: {
          render: true,
          update: true,
          destroy: true,
        },
      },
      {
        name: 'DataTable',
        description: 'Data table component',
        params: true,
        events: [],
        lifecycle: {
          render: true,
          update: true,
          destroy: true,
        },
      },
    ],
  };
}

describe('A@UI Vue runtime', () => {
  let mountTarget: HTMLDivElement;

  beforeEach(() => {
    mountTarget = document.createElement('div');
    mountTarget.id = 'test-root';
    document.body.appendChild(mountTarget);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders, updates, and destroys widgets', async () => {
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#test-root',
      createWidgetId: () => 'widget-1',
    });

    adapter.dispatch({
      type: 'render',
      component: 'DataTable',
      params: { title: 'Initial title' },
    });
    await nextTick();
    expect(document.querySelector('#data-table')?.textContent).toBe('Initial title');

    adapter.dispatch({
      type: 'update',
      widgetId: 'widget-1',
      params: { title: 'Updated title' },
    });
    await nextTick();
    expect(document.querySelector('#data-table')?.textContent).toBe('Updated title');

    adapter.dispatch({
      type: 'destroy',
      widgetId: 'widget-1',
    });
    await nextTick();
    expect(document.querySelector('#data-table')).toBeNull();
  });

  it('throws for unknown render components', () => {
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#test-root',
      createWidgetId: () => 'widget-1',
    });

    expect(() => {
      adapter.dispatch({
        type: 'render',
        component: 'UnknownWidget',
      });
    }).toThrowError(/Unknown component/);
  });

  it('warns for unknown widget updates and destroys', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#test-root',
      createWidgetId: () => 'widget-1',
    });

    adapter.dispatch({
      type: 'update',
      widgetId: 'missing-widget',
      params: { title: 'Ignored' },
    });
    adapter.dispatch({
      type: 'destroy',
      widgetId: 'missing-widget',
    });

    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it('wraps emitted component events with widget metadata', async () => {
    const receivedEvents: AAtUIEvent<Record<string, AAtUISerializableValue>>[] = [];
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#test-root',
      createWidgetId: () => 'widget-7',
      onEvent(event) {
        receivedEvents.push(event);
      },
    });

    adapter.dispatch({
      type: 'render',
      component: 'SearchBox',
      params: { value: 'Search' },
    });
    await nextTick();

    document.querySelector('#search-button')?.dispatchEvent(new MouseEvent('click'));
    await nextTick();

    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0]).toMatchObject({
      type: 'SearchBox:submit',
      widgetId: 'widget-7',
      payload: { query: 'Mercury' },
    });
    expect(receivedEvents[0].timestamp).toEqual(expect.any(Number));
  });

  it('surfaces invalid stream payloads through onError', async () => {
    const errors: Array<{ error: Error; context: AAtUIAdapterErrorContext }> = [];
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#test-root',
      createWidgetId: () => 'widget-1',
      onError(error, context) {
        errors.push({ error, context });
      },
    });

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('data: {not json}\n\n');
        controller.enqueue('data: [DONE]\n\n');
        controller.close();
      },
    });

    await consumeAAtUIStream(stream, adapter);

    expect(errors).toHaveLength(1);
    expect(errors[0].context.source).toBe('stream');
  });

  it('dispatches valid SSE commands to the adapter', async () => {
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget,
      createWidgetId: () => 'widget-stream-1',
    });

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          'data: {"type":"render","component":"DataTable","params":{"title":"From Stream"}}\n\n'
        );
        controller.enqueue('data: [DONE]\n\n');
        controller.close();
      },
    });

    await consumeAAtUIStream(stream, adapter);
    await nextTick();

    expect(document.querySelector('#data-table')?.textContent).toBe('From Stream');
  });

  it('routes structurally invalid command payloads to onError', async () => {
    const errors: Array<{ error: Error; context: AAtUIAdapterErrorContext }> = [];
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget,
      createWidgetId: () => 'widget-1',
      onError(error, context) {
        errors.push({ error, context });
      },
    });

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('data: {"foo":"bar"}\n\n');
        controller.enqueue('data: [DONE]\n\n');
        controller.close();
      },
    });

    await consumeAAtUIStream(stream, adapter);

    expect(errors).toHaveLength(1);
    expect(errors[0].context).toMatchObject({ source: 'stream', command: { foo: 'bar' } });
  });
});

describe('AAtUIAdapter error routing', () => {
  let mountTarget: HTMLDivElement;

  beforeEach(() => {
    mountTarget = document.createElement('div');
    mountTarget.id = 'error-test-root';
    document.body.appendChild(mountTarget);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('routes dispatch errors to onError when provided instead of throwing', () => {
    const errors: Array<{ error: Error; context: AAtUIAdapterErrorContext }> = [];
    const manifest = createManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#error-test-root',
      createWidgetId: () => 'widget-1',
      onError(error, context) {
        errors.push({ error, context });
      },
    });

    expect(() => {
      adapter.dispatch({ type: 'render', component: 'UnknownWidget' });
    }).not.toThrow();

    expect(errors).toHaveLength(1);
    expect(errors[0].context).toMatchObject({ source: 'dispatch' });
  });
});

describe('AAtUIAdapter components validation', () => {
  it('throws when a manifest component is missing from the components map', () => {
    const manifest = createManifest();
    const components = {
      // DataTable intentionally omitted
      SearchBox: SearchBoxComponent,
    };

    expect(() => {
      createAAtUIAdapter({
        components,
        manifest,
        mountTarget: document.createElement('div'),
      });
    }).toThrowError(/has no matching Vue component/);
  });

  it('silently ignores extra components not declared in the manifest', () => {
    const manifest = createManifest();
    const ExtraComponent = defineComponent({ setup: () => () => h('div') });
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
      Ghost: ExtraComponent,
    };

    expect(() => {
      createAAtUIAdapter({
        components,
        manifest,
        mountTarget: document.createElement('div'),
      });
    }).not.toThrow();
  });
});

describe('lifecycle flags', () => {
  let mountTarget: HTMLDivElement;

  beforeEach(() => {
    mountTarget = document.createElement('div');
    mountTarget.id = 'lifecycle-test-root';
    document.body.appendChild(mountTarget);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  function createRestrictedManifest() {
    const manifest = createManifest();
    manifest.components[1] = {
      ...manifest.components[1],
      lifecycle: { render: true, update: false, destroy: false },
    };
    return manifest;
  }

  it('throws when updating a component with lifecycle.update: false', async () => {
    const manifest = createRestrictedManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#lifecycle-test-root',
      createWidgetId: () => 'widget-lc-1',
    });

    adapter.dispatch({ type: 'render', component: 'DataTable', params: { title: 'Initial' } });
    await nextTick();

    expect(() => {
      adapter.dispatch({ type: 'update', widgetId: 'widget-lc-1', params: { title: 'Updated' } });
    }).toThrowError(/does not support update/);
  });

  it('throws when destroying a component with lifecycle.destroy: false', async () => {
    const manifest = createRestrictedManifest();
    const components = {
      SearchBox: SearchBoxComponent,
      DataTable: DataTableComponent,
    };

    const adapter = createAAtUIAdapter({
      components,
      manifest,
      mountTarget: '#lifecycle-test-root',
      createWidgetId: () => 'widget-lc-2',
    });

    adapter.dispatch({ type: 'render', component: 'DataTable', params: { title: 'Initial' } });
    await nextTick();

    expect(() => {
      adapter.dispatch({ type: 'destroy', widgetId: 'widget-lc-2' });
    }).toThrowError(/does not support destroy/);
  });
});
