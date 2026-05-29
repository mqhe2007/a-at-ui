export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  modules: ['@nuxt/content', '@nuxtjs/i18n'],

  content: {
    build: {
      markdown: {
        highlight: {
          theme: 'one-dark-pro',
          langs: ['typescript', 'javascript', 'vue', 'bash', 'json', 'css', 'html', 'rust', 'python'],
        },
      },
    },
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    defaultLocale: 'zh',
    strategy: 'no_prefix',
    locales: [
      { code: 'zh', language: 'zh-CN', name: '中文', file: 'zh.json' },
      { code: 'en', language: 'en-US', name: 'EN', file: 'en.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'a-at-ui-website-lang',
      fallbackLocale: 'zh',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  vite: {
    optimizeDeps: {
      include: [],
    },
  },
})
