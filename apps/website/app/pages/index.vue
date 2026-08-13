<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()

/* ── SEO meta using useSeoMeta for locale-aware OG tags ────── */
const siteUrl = 'https://braid.mengqinghe.com'
const pageUrl = computed(() => `${siteUrl}${route.path}`)

useSeoMeta({
  title: () => locale.value === 'en'
    ? 'Braid — Protocol for AI Agent-driven Interfaces'
    : 'Braid — 让 AI Agent 驱动真实界面',
  description: () => locale.value === 'en'
    ? 'A protocol specification and lightweight frontend runtime for AI Agent-driven interfaces. Any backend emits JSON commands; the frontend renders real components.'
    : 'Braid：让每个 AI Agent 都能操控真实界面。无需 SDK 绑定，后端发 JSON，前端响应，支持任意语言，5 分钟接入。',
  ogTitle: () => locale.value === 'en'
    ? 'Braid — Protocol for AI Agent-driven Interfaces'
    : 'Braid — 让 AI Agent 驱动真实界面',
  ogDescription: () => locale.value === 'en'
    ? 'A protocol specification and lightweight frontend runtime for AI Agent-driven interfaces. Three commands, one JSON stream, any language.'
    : '三条指令、一个 JSON 流、任意后端语言。Braid 让 AI Agent 直接驱动真实前端组件。',
  ogUrl: pageUrl,
  ogType: 'website',
  ogImage: `${siteUrl}/og-image.svg`,
  ogSiteName: 'Braid',
  twitterCard: 'summary_large_image',
  twitterTitle: () => locale.value === 'en'
    ? 'Braid — Protocol for AI Agent-driven Interfaces'
    : 'Braid — 让 AI Agent 驱动真实界面',
  twitterDescription: () => locale.value === 'en'
    ? 'Three commands, one JSON stream. Any backend drives real UI from an AI Agent.'
    : '三条指令、一个 JSON 流。任意后端，AI Agent 驱动真实界面。',
  twitterImage: `${siteUrl}/og-image.svg`,
})

/* ── Code snippets (locale-aware) ──────────────────────────── */
const renderCode = computed(() => locale.value === 'en'
  ? `{
  "type": "render",
  "component": "PersonalProfileCard",
  "params": {
    "name": "Alex",
    "title": "Content Strategist"
  }
}`
  : `{
  "type": "render",
  "component": "PersonalProfileCard",
  "params": {
    "name": "陈叙",
    "title": "内容策略师"
  }
}`)

const updateCode = computed(() => locale.value === 'en'
  ? `{
  "type": "update",
  "widgetId": "widget-1",
  "params": {
    "title": "Senior Content Strategist"
  }
}`
  : `{
  "type": "update",
  "widgetId": "widget-1",
  "params": {
    "title": "资深内容策略师"
  }
}`)

const destroyCode = `{
  "type": "destroy",
  "widgetId": "widget-1"
}`
const skillInstallCode = `npx skills add mqhe2007/braid --skill braid-manifest
npx skills add mqhe2007/braid --skill braid-setup
npx skills add mqhe2007/braid --skill braid-protocol`


onMounted(() => {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const siblings = Array.from(
          (entry.target.parentNode as Element)?.querySelectorAll('.reveal-item') ?? [],
        )
        const idx = siblings.indexOf(entry.target as Element)
          ; (entry.target as HTMLElement).style.transitionDelay = `${idx * 0.09}s`
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      })
    },
    { threshold: 0.08 },
  )
  document.querySelectorAll('.reveal-item').forEach((el) => revealObserver.observe(el))
})

onUnmounted(() => { })
</script>

<template>
  <main>
    <!-- Hero -->
    <section id="hero" class="hero">
      <div class="hero-bg" aria-hidden="true">
        <div class="orb orb-1" />
        <div class="orb orb-2" />
        <div class="orb orb-3" />
        <div class="hero-grid" />
      </div>
      <div class="container hero-inner">
        <div class="hero-content animate-in">
          <div class="eyebrow-wrap">
            <span class="eyebrow-dot" />
            <p class="eyebrow">{{ t('heroEyebrow') }}</p>
          </div>
          <h1>{{ t('heroTitle') }}</h1>
          <p class="hero-summary">{{ t('heroSummary') }}</p>
          <div class="hero-actions">
            <NuxtLink class="button button-primary" to="/docs/guides/agent-skill">
              {{ t('heroPrimary') }}
            </NuxtLink>
            <NuxtLink class="button button-ghost" to="/docs/protocol/commands">
              {{ t('heroSecondary') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Demo window -->
        <div class="hero-demo animate-in animate-delay-1">
          <HeroDemo />
        </div>
      </div>
      <div class="hero-scroll-hint" aria-hidden="true"><span /></div>
    </section>

    <!-- Protocol -->
    <section id="protocol" class="section section-alt">
      <div class="container">
        <div class="section-header">
          <p class="eyebrow">{{ t('protocolEyebrow') }}</p>
          <h2>{{ t('protocolTitle') }}</h2>
        </div>
        <div class="protocol-grid">
          <article class="cmd-card cmd-render reveal-item">
            <div class="cmd-card-top">
              <span class="cmd-badge cmd-badge-render">render</span>
              <p>{{ t('renderDescription') }}</p>
            </div>
            <div class="code-block">
              <div class="code-header">
                <div class="code-dots"><span /><span /><span /></div>
                <span class="code-filename">command.json</span>
              </div>
              <pre><code>{{ renderCode }}</code></pre>
            </div>
          </article>

          <article class="cmd-card cmd-update reveal-item">
            <div class="cmd-card-top">
              <span class="cmd-badge cmd-badge-update">update</span>
              <p>{{ t('updateDescription') }}</p>
            </div>
            <div class="code-block">
              <div class="code-header">
                <div class="code-dots"><span /><span /><span /></div>
                <span class="code-filename">command.json</span>
              </div>
              <pre><code>{{ updateCode }}</code></pre>
            </div>
          </article>

          <article class="cmd-card cmd-destroy reveal-item">
            <div class="cmd-card-top">
              <span class="cmd-badge cmd-badge-destroy">destroy</span>
              <p>{{ t('destroyDescription') }}</p>
            </div>
            <div class="code-block">
              <div class="code-header">
                <div class="code-dots"><span /><span /><span /></div>
                <span class="code-filename">command.json</span>
              </div>
              <pre><code>{{ destroyCode }}</code></pre>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Architecture -->
    <section id="architecture" class="section">
      <div class="container">
        <div class="section-header">
          <p class="eyebrow">{{ t('archEyebrow') }}</p>
          <h2>{{ t('archTitle') }}</h2>
        </div>

        <div class="arch-flow reveal-item">
          <!-- AI Agent -->
          <div class="arch-node arch-node-agent">
            <div class="arch-node-body">
              <p class="arch-node-label">{{ t('archLayerAgentLabel') }}</p>
              <strong class="arch-node-name">{{ t('archLayerAgent') }}</strong>
              <div class="arch-node-chips">
                <span>Python</span>
                <span>Go</span>
                <span>Node.js</span>
                <span>Rust</span>
              </div>
            </div>
          </div>

          <div class="arch-arrow">
            <div class="arch-arrow-track">
              <div class="arch-arrow-head" />
            </div>
            <span class="arch-arrow-label">JSON</span>
          </div>

          <!-- Protocol -->
          <div class="arch-node arch-node-protocol">
            <div class="arch-node-body">
              <p class="arch-node-label">{{ t('archLayerProtocolLabel') }}</p>
              <strong class="arch-node-name">{{ t('archLayerProtocol') }}</strong>
              <div class="arch-node-chips">
                <span class="chip-schema">commands.schema.json</span>
                <span class="chip-schema">events.schema.json</span>
                <span class="chip-schema">manifest.schema.json</span>
              </div>
            </div>
          </div>

          <div class="arch-arrow">
            <div class="arch-arrow-track">
              <div class="arch-arrow-head" />
            </div>
            <span class="arch-arrow-label">{{ t('archTransport') }}</span>
          </div>

          <!-- Runtime -->
          <div class="arch-node arch-node-runtime">
            <div class="arch-node-body">
              <p class="arch-node-label">{{ t('archLayerRuntimeLabel') }}</p>
              <strong class="arch-node-name">{{ t('archLayerRuntime') }}</strong>
              <div class="arch-node-chips">
                <span>Stream Parser</span>
                <span>Widget Manager</span>
                <span>Adapter</span>
              </div>
            </div>
          </div>

          <div class="arch-arrow">
            <div class="arch-arrow-track">
              <div class="arch-arrow-head" />
            </div>
            <span class="arch-arrow-label">props / events</span>
          </div>

          <!-- UI Components -->
          <div class="arch-node arch-node-ui">
            <div class="arch-node-body">
              <p class="arch-node-label">{{ t('archLayerUILabel') }}</p>
              <strong class="arch-node-name">{{ t('archLayerUI') }}</strong>
              <div class="arch-node-chips">
                <span>Registry</span>
                <span>UI Components</span>
              </div>
            </div>
          </div>
        </div>

        <div class="arch-features">
          <div class="arch-feature reveal-item">
            <div class="arch-feature-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M17 8l4 4-4 4M7 16l-4-4 4-4M3 12h18" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <strong>{{ t('archFeat1Title') }}</strong>
              <p>{{ t('archFeat1Desc') }}</p>
            </div>
          </div>
          <div class="arch-feature reveal-item">
            <div class="arch-feature-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div>
              <strong>{{ t('archFeat2Title') }}</strong>
              <p>{{ t('archFeat2Desc') }}</p>
            </div>
          </div>
          <div class="arch-feature reveal-item">
            <div class="arch-feature-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" stroke="currentColor" stroke-width="1.5"
                  stroke-linejoin="round" />
                <line x1="2" y1="8.5" x2="22" y2="8.5" stroke="currentColor" stroke-width="1.5" />
                <line x1="2" y1="15.5" x2="22" y2="15.5" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </div>
            <div>
              <strong>{{ t('archFeat3Title') }}</strong>
              <p>{{ t('archFeat3Desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Agent Skill -->
    <section id="agent-skill" class="section section-alt">
      <div class="container skill-section">
        <div class="section-header">
          <p class="eyebrow">{{ t('skillEyebrow') }}</p>
          <h2>{{ t('skillTitle') }}</h2>
          <p class="section-lead section-lead-left">{{ t('skillLead') }}</p>
        </div>

        <div class="skill-grid">
          <div class="skill-copy reveal-item">
            <div class="skill-points">
              <div class="skill-point">
                <strong>{{ t('skillPointRuntimeTitle') }}</strong>
                <span>{{ t('skillPointRuntimeDesc') }}</span>
              </div>
              <div class="skill-point">
                <strong>{{ t('skillPointProtocolTitle') }}</strong>
                <span>{{ t('skillPointProtocolDesc') }}</span>
              </div>
              <div class="skill-point">
                <strong>{{ t('skillPointManifestTitle') }}</strong>
                <span>{{ t('skillPointManifestDesc') }}</span>
              </div>
            </div>
            <NuxtLink class="button button-ghost" to="/docs/guides/agent-skill">
              {{ t('skillDocsCta') }}
            </NuxtLink>
          </div>

          <div class="skill-terminal reveal-item">
            <div class="code-block">
              <div class="code-header">
                <div class="code-dots"><span /><span /><span /></div>
                <span class="code-filename">terminal</span>
              </div>
              <pre><code>{{ skillInstallCode }}</code></pre>
            </div>
            <p>{{ t('skillInstallHint') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Showcase -->
    <section id="showcase" class="section section-alt">
      <div class="container">
        <div class="section-header section-header-center">
          <p class="eyebrow">{{ t('showcaseEyebrow') }}</p>
          <h2>{{ t('showcaseTitle') }}</h2>
        </div>

        <div class="showcase-grid">
          <!-- Card 1: Live site -->
          <a class="showcase-card reveal-item" href="https://mengqinghe.com" target="_blank" rel="noopener noreferrer">
            <div class="showcase-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </div>
            <strong>{{ t('showcase1Title') }}</strong>
            <span>{{ t('showcase1Desc') }}</span>
            <span class="showcase-cta">{{ t('showcase1Cta') }}</span>
          </a>

          <!-- Card 2: Community submission (placeholder) -->
          <a class="showcase-card showcase-card-placeholder reveal-item" href="https://github.com/mqhe2007/braid/issues" target="_blank" rel="noopener noreferrer">
            <div class="showcase-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <strong>{{ t('showcase2Title') }}</strong>
            <span>{{ t('showcase2Desc') }}</span>
            <span class="showcase-cta">{{ t('showcase2Cta') }}</span>
          </a>

          <!-- Card 3: Coming soon (placeholder) -->
          <div class="showcase-card showcase-card-placeholder reveal-item">
            <div class="showcase-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3" />
                <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <strong>{{ t('showcase3Title') }}</strong>
            <span>{{ t('showcase3Desc') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contributing -->
    <section id="contributing" class="section">
      <div class="container">
        <div class="section-header section-header-center">
          <p class="eyebrow">{{ t('contribEyebrow') }}</p>
          <h2>{{ t('contribTitle') }}</h2>
          <p class="section-lead">{{ t('contribLead') }}</p>
        </div>

        <div class="contrib-grid">
          <a class="contrib-card reveal-item" href="https://github.com/mqhe2007/braid/issues" target="_blank"
            rel="noopener noreferrer">
            <div class="contrib-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor"
                  stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <strong>{{ t('contribIssueTitle') }}</strong>
            <span>{{ t('contribIssueDesc') }}</span>
          </a>

          <a class="contrib-card reveal-item" href="https://github.com/mqhe2007/braid/pulls" target="_blank"
            rel="noopener noreferrer">
            <div class="contrib-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" />
                <circle cx="18" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5" />
                <circle cx="6" cy="18" r="2.5" stroke="currentColor" stroke-width="1.5" />
                <path d="M6 8.5v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M18 8.5c0 4-3 6-6 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <strong>{{ t('contribPrTitle') }}</strong>
            <span>{{ t('contribPrDesc') }}</span>
          </a>

          <a class="contrib-card reveal-item" href="https://github.com/mqhe2007/braid" target="_blank"
            rel="noopener noreferrer">
            <div class="contrib-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
              </svg>
            </div>
            <strong>{{ t('contribStarTitle') }}</strong>
            <span>{{ t('contribStarDesc') }}</span>
          </a>
        </div>

        <a class="contrib-banner reveal-item" href="https://github.com/mqhe2007/braid/discussions" target="_blank"
          rel="noopener noreferrer">
          <span class="contrib-banner-text">{{ t('contribBanner') }}</span>
          <span class="contrib-banner-arrow">→</span>
        </a>
      </div>
    </section>
  </main>
</template>
