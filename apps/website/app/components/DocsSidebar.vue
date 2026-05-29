<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

type NavSection = { section: string; path?: undefined }
type NavPage = { path: string; label: string; indent?: boolean; section?: undefined }
type NavItem = NavSection | NavPage

const nav = computed(() => [
  {
    group: t('docsNavGuides'),
    pages: [
      { section: t('docsNavFrontendIntegration') },
      { path: '/docs/guides/frontend-vue', label: 'Vue', indent: true },
      { section: t('docsNavBackendIntegration') },
      { path: '/docs/guides/backend-nodejs', label: 'Node.js', indent: true },
      { path: '/docs/guides/component-manifest', label: t('docsNavComponentManifest') },
      { path: '/docs/guides/agent-skill', label: t('docsNavAgentSkill') },
    ] as NavItem[],
  },
  {
    group: t('docsNavProtocol'),
    pages: [
      { path: '/docs/protocol/commands', label: t('docsNavCommands') },
      { path: '/docs/protocol/events', label: t('docsNavEvents') },
      { path: '/docs/protocol/lifecycle', label: t('docsNavLifecycle') },
    ] as NavItem[],
  },
])
</script>

<template>
  <div v-for="group in nav" :key="group.group" class="sidebar-group">
    <p class="sidebar-group-label">{{ group.group }}</p>
    <template v-for="item in group.pages" :key="item.section ?? item.path">
      <p v-if="item.section" class="sidebar-section-label">{{ item.section }}</p>
      <NuxtLink v-else :to="item.path!" class="sidebar-link"
        :class="{ active: route.path === item.path, indent: item.indent }">
        {{ item.label }}
      </NuxtLink>
    </template>
  </div>
</template>
