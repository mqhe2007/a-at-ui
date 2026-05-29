<script setup lang="ts">
const { locale, setLocale } = useI18n()
const route = useRoute()
const scrolled = ref(false)

onMounted(() => {
  window.addEventListener(
    'scroll',
    () => { scrolled.value = window.scrollY > 24 },
    { passive: true },
  )
})

const isDocsActive = computed(() => route.path.startsWith('/docs'))
</script>

<template>
  <header class="topbar" :class="{ scrolled }">
    <div class="container topbar-inner">
      <NuxtLink class="brand" to="/">
        <AppLogo class="brand-mark" />
      </NuxtLink>
      <nav class="topnav" aria-label="site navigation">
        <NuxtLink to="/" exact-active-class="is-active">
          {{ $t('navHome') }}
        </NuxtLink>
        <NuxtLink to="/docs/guides/agent-skill" class="topnav-link" :class="{ 'is-active': isDocsActive }">
          {{ $t('navDocs') }}
        </NuxtLink>
      </nav>
      <div class="topbar-right">
        <div class="lang-switch" aria-label="language switcher">
          <button type="button" :class="{ 'is-active': locale === 'zh' }" @click="setLocale('zh')">
            中文
          </button>
          <button type="button" :class="{ 'is-active': locale === 'en' }" @click="setLocale('en')">
            EN
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
