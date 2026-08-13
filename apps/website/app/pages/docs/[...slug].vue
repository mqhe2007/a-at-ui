<script setup lang="ts">
definePageMeta({ layout: 'docs' })

const { locale } = useI18n()
const route = useRoute()

const slugPath = computed(() => (route.params.slug as string[]).join('/'))

const { data: page, refresh } = await useAsyncData(
  () => `docs-${slugPath.value}-${locale.value}`,
  async () => {
    const localDoc = await queryCollection('docs')
      .path(`/${locale.value}/${slugPath.value}`)
      .first()
    if (localDoc) return localDoc

    // Fallback to Chinese when the locale-specific version doesn't exist yet
    return queryCollection('docs')
      .path(`/zh/${slugPath.value}`)
      .first()
  },
)

watch(locale, refresh)

useHead({
  title: computed(() =>
    page.value?.title ? `${page.value.title} — Braid` : 'Docs — Braid',
  ),
})
</script>

<template>
  <div>
    <ContentRenderer v-if="page" :value="page" />
    <p v-else style="color: var(--text-muted); padding: 40px 0;">
      Page not found.
    </p>
  </div>
</template>
