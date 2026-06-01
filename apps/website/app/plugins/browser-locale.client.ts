export default defineNuxtPlugin(async () => {
  const { $i18n } = useNuxtApp()
  const cookieLocale = useCookieLocale()
  const browserLocale = useBrowserLocale()
  type LocaleCode = typeof $i18n.locale.value

  const availableLocales = new Set(
    $i18n.locales.value.map((entry) => (typeof entry === 'string' ? entry : entry.code).toLowerCase()),
  )

  const resolveLocale = (value: string | null | undefined): LocaleCode | null => {
    if (!value) return null

    const normalizedValue = value.toLowerCase()
    if (availableLocales.has(normalizedValue)) {
      return normalizedValue as LocaleCode
    }

    const baseLocale = normalizedValue.split('-')[0]
    if (!baseLocale) {
      return null
    }

    return availableLocales.has(baseLocale) ? (baseLocale as LocaleCode) : null
  }

  const preferredLocale = resolveLocale(cookieLocale.value) ?? resolveLocale(browserLocale)

  if (preferredLocale && $i18n.locale.value !== preferredLocale) {
    await $i18n.setLocale(preferredLocale)
  }
})
