<script setup lang="ts">
type Scene = 1 | 2
type Phase =
  | 'idle'
  | 'loading'
  | 'shown'
  | 'clicking'
  | 'scrolling'
  | 'card-shown'
  | 'updated'
  | 'fading'

const scene = ref<Scene>(1)
const phase = ref<Phase>('idle')
const demoInputContent = ref('')
const isSending = ref(false)
const barKey = ref(0)

let cycleIdx = 0
let aborted = false

const CMDS: Record<Scene, string> = {
  1: '⟩ render ◈ DataOverview',
  2: '⟩ render ◈ ArticleList',
}

function wait(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

async function typeIn(text: string) {
  demoInputContent.value = ''
  for (const ch of text) {
    if (aborted) return
    demoInputContent.value += ch
    await wait(52 + Math.random() * 28)
  }
}

const wrapClass = computed(() => ({
  'is-loading': phase.value === 'loading',
  'is-rendered': ['shown', 'clicking', 'scrolling', 'card-shown', 'updated'].includes(phase.value),
  'is-fading': phase.value === 'fading',
  [`is-scene-${scene.value}`]: true,
  'is-clicking': phase.value === 'clicking',
  'is-scrolling': phase.value === 'scrolling' || phase.value === 'card-shown' || phase.value === 'updated',
  'is-updated': phase.value === 'updated',
  'is-typing': demoInputContent.value.length > 0,
}))

async function runCycle(): Promise<void> {
  if (aborted) return
  const s = ((cycleIdx % 2) + 1) as Scene
  cycleIdx++

  scene.value = s
  phase.value = 'idle'
  barKey.value++

  await typeIn(CMDS[s])
  await wait(360)
  if (aborted) return

  isSending.value = true
  await wait(280)
  if (aborted) return
  isSending.value = false
  demoInputContent.value = ''

  phase.value = 'loading'
  await wait(1300)
  if (aborted) return

  phase.value = 'shown'

  if (s === 1) {
    await wait(2800)
  } else {
    // ArticleList shown → click → scroll → ArticleCard
    await wait(1000)
    if (aborted) return
    phase.value = 'clicking'
    await wait(750)
    if (aborted) return
    phase.value = 'scrolling'
    await wait(700)
    if (aborted) return
    phase.value = 'card-shown'
    // 1s pause, then type update command on top of visible card
    await wait(1000)
    if (aborted) return
    await typeIn('⟩ update ◈ ArticleCard')
    await wait(360)
    if (aborted) return
    isSending.value = true
    await wait(280)
    if (aborted) return
    isSending.value = false
    demoInputContent.value = ''
    phase.value = 'updated'
    await wait(2100)
  }

  if (aborted) return
  phase.value = 'fading'
  await wait(420)
  phase.value = 'idle'
  await wait(200)

  runCycle()
}

onMounted(() => {
  requestAnimationFrame(() => setTimeout(runCycle, 600))
})

onUnmounted(() => {
  aborted = true
})
</script>

<template>
  <div class="demo-window" :class="wrapClass">
    <!-- Chrome bar -->
    <div class="demo-chrome">
      <div class="demo-dots"><span /><span /><span /></div>
      <span class="demo-chrome-label">agent · ui</span>
      <span class="demo-live-dot" />
    </div>

    <!-- Stage -->
    <div class="demo-stage">
      <!-- Loading skeleton (all scenes) -->
      <div class="demo-skeleton">
        <div class="sk-line" style="width:42%" />
        <div class="sk-row">
          <div class="sk-block" />
          <div class="sk-block" />
          <div class="sk-block" />
        </div>
        <div class="sk-line" style="width:88%" />
        <div class="sk-line" style="width:66%" />
      </div>

      <!-- Scene 1: DataOverview -->
      <div v-if="scene === 1" class="demo-widget demo-widget-data">
        <div class="dw-topbar">
          <span class="dw-cmd-tag">render</span>
          <span class="dw-component-name">DataOverview</span>
        </div>
        <div class="dw-metrics">
          <div class="dw-metric">
            <div class="dw-val dw-val-cyan" />
            <div class="dw-lbl-bar" style="width:50px" />
          </div>
          <div class="dw-metric">
            <div class="dw-val dw-val-green" />
            <div class="dw-lbl-bar" style="width:38px" />
          </div>
          <div class="dw-metric">
            <div class="dw-val dw-val-amber" />
            <div class="dw-lbl-bar" style="width:44px" />
          </div>
        </div>
        <!-- :key forces DOM remount → bar animation resets each cycle -->
        <div :key="barKey" class="dw-chart">
          <div class="dw-bar" style="--h:52%" />
          <div class="dw-bar" style="--h:76%" />
          <div class="dw-bar" style="--h:38%" />
          <div class="dw-bar dw-bar-hi" style="--h:90%" />
          <div class="dw-bar" style="--h:61%" />
          <div class="dw-bar" style="--h:72%" />
          <div class="dw-bar" style="--h:47%" />
        </div>
        <div class="dw-footer">
          <div class="dw-text-bar" style="width:100%" />
          <div class="dw-text-bar" style="width:60%" />
        </div>
      </div>

      <!-- Scene 2: ArticleList → scroll → ArticleCard -->
      <div v-else-if="scene === 2" class="demo-widget demo-widget-list">
        <div class="s2-scroll-area">
          <!-- ArticleList section (fills the stage exactly) -->
          <div class="al-section">
            <div class="dw-topbar al-topbar">
              <span class="dw-cmd-tag">render</span>
              <span class="dw-component-name">ArticleList</span>
            </div>
            <div class="al-item">
              <div class="al-thumb" />
              <div class="al-content">
                <div class="al-title" style="width:75%" />
                <div class="al-sub" style="width:52%" />
              </div>
            </div>
            <!-- Item 2: gets highlighted on click -->
            <div class="al-item al-item-click"
              :class="{ 'is-active': phase === 'clicking' || phase === 'scrolling' || phase === 'card-shown' || phase === 'updated' }">
              <div class="al-thumb" />
              <div class="al-content">
                <div class="al-title" style="width:83%" />
                <div class="al-sub" style="width:60%" />
              </div>
            </div>
            <div class="al-item">
              <div class="al-thumb" />
              <div class="al-content">
                <div class="al-title" style="width:68%" />
                <div class="al-sub" style="width:46%" />
              </div>
            </div>
            <div class="al-item">
              <div class="al-thumb" />
              <div class="al-content">
                <div class="al-title" style="width:71%" />
                <div class="al-sub" style="width:55%" />
              </div>
            </div>
          </div>

          <!-- ArticleCard section: below the fold, revealed by scroll -->
          <div class="ac-section-wrap">
            <div class="dw-topbar">
              <span class="dw-cmd-tag" :class="{ 'is-update': phase === 'updated' }">
                {{ phase === 'updated' ? 'update' : 'render' }}
              </span>
              <span class="dw-component-name">ArticleCard</span>
            </div>
            <div class="ac-cover" />
            <div class="ac-body">
              <div class="ac-title-bar" style="width:85%" />
              <div class="ac-title-bar" style="width:62%" />
            </div>
            <div class="ac-tags">
              <span class="ac-tag" />
              <span class="ac-tag ac-tag-accent" />
            </div>
          </div>
        </div>

        <!-- Mouse cursor dot, absolutely positioned over item 2 -->
        <div class="demo-mouse" />
      </div>


    </div>

    <!-- Input row -->
    <div class="demo-input-row">
      <div class="demo-input-field">
        <span>{{ demoInputContent }}</span><span class="demo-cursor" />
      </div>
      <button class="demo-send-btn" :class="{ 'is-sending': isSending }" aria-label="send">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* ── Window ──────────────────────────────────────────────── */
.demo-window {
  width: 100%;
  max-width: 400px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

/* ── Chrome bar ──────────────────────────────────────────── */
.demo-chrome {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.025);
}

.demo-dots {
  display: flex;
  gap: 5px;
}

.demo-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.demo-dots span:nth-child(1) {
  background: #ff5f56;
}

.demo-dots span:nth-child(2) {
  background: #ffbd2e;
}

.demo-dots span:nth-child(3) {
  background: #27c93f;
}

.demo-chrome-label {
  font-size: 11px;
  color: var(--text-faint);
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  letter-spacing: 0.04em;
}

.demo-live-dot {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 6px var(--green);
  animation: pulse-dot 2.4s ease-in-out infinite;
}

@keyframes pulse-dot {

  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.4;
    transform: scale(0.75);
  }
}

/* ── Stage ───────────────────────────────────────────────── */
.demo-stage {
  position: relative;
  height: 220px;
  overflow: hidden;
}

/* ── Skeleton ────────────────────────────────────────────── */
.demo-skeleton {
  position: absolute;
  inset: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.demo-window.is-loading .demo-skeleton {
  opacity: 1;
}

.sk-line {
  height: 9px;
  border-radius: 5px;
  background: var(--surface-hover);
  animation: sk-shimmer 1.5s ease-in-out infinite;
}

.sk-row {
  display: flex;
  gap: 8px;
}

.sk-block {
  flex: 1;
  height: 46px;
  border-radius: var(--radius-sm);
  background: var(--surface-hover);
  animation: sk-shimmer 1.5s ease-in-out infinite;
}

.sk-block:nth-child(2) {
  animation-delay: 0.15s;
}

.sk-block:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes sk-shimmer {

  0%,
  100% {
    opacity: 0.35;
  }

  50% {
    opacity: 0.75;
  }
}

/* ── Widget base ─────────────────────────────────────────── */
.demo-widget {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.demo-window.is-rendered .demo-widget {
  opacity: 1;
  transform: translateY(0);
}

.demo-window.is-fading .demo-widget {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}

/* ── Shared topbar ───────────────────────────────────────── */
.dw-topbar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dw-cmd-tag {
  font-size: 10px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  color: var(--green);
  background: var(--green-dim);
  border: 1px solid rgba(52, 211, 153, 0.22);
  padding: 2px 9px;
  border-radius: 999px;
  font-weight: 500;
}

.dw-cmd-tag.is-update {
  color: var(--cyan);
  background: var(--cyan-dim);
  border-color: var(--border-accent);
}

.dw-component-name {
  font-size: 11px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  color: var(--text-faint);
  letter-spacing: 0.02em;
}

/* ══════════════════════════════════════════════════════════
   Scene 1 — DataOverview
   ══════════════════════════════════════════════════════════ */
.demo-widget-data {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Metrics row */
.dw-metrics {
  display: flex;
  gap: 8px;
}

.dw-metric {
  flex: 1;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 9px 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.dw-val {
  height: 16px;
  border-radius: 3px;
  width: 100%;
}

.dw-val-cyan {
  background: rgba(34, 211, 238, 0.22);
  border: 1px solid rgba(34, 211, 238, 0.28);
}

.dw-val-green {
  background: rgba(52, 211, 153, 0.22);
  border: 1px solid rgba(52, 211, 153, 0.28);
}

.dw-val-amber {
  background: rgba(251, 191, 36, 0.22);
  border: 1px solid rgba(251, 191, 36, 0.28);
}

.dw-lbl-bar {
  height: 5px;
  border-radius: 3px;
  background: var(--border-strong);
}

/* Bar chart */
.dw-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 54px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px 0;
}

.dw-bar {
  flex: 1;
  height: var(--h);
  border-radius: 2px 2px 0 0;
  background: rgba(255, 255, 255, 0.1);
  transform-origin: bottom center;
  transform: scaleY(0);
}

.dw-bar-hi {
  background: rgba(34, 211, 238, 0.5);
}

.demo-window.is-rendered .dw-bar {
  animation: bar-grow 0.4s ease-out forwards;
}

.demo-window.is-rendered .dw-bar:nth-child(1) {
  animation-delay: 0.05s;
}

.demo-window.is-rendered .dw-bar:nth-child(2) {
  animation-delay: 0.10s;
}

.demo-window.is-rendered .dw-bar:nth-child(3) {
  animation-delay: 0.15s;
}

.demo-window.is-rendered .dw-bar:nth-child(4) {
  animation-delay: 0.20s;
}

.demo-window.is-rendered .dw-bar:nth-child(5) {
  animation-delay: 0.25s;
}

.demo-window.is-rendered .dw-bar:nth-child(6) {
  animation-delay: 0.30s;
}

.demo-window.is-rendered .dw-bar:nth-child(7) {
  animation-delay: 0.35s;
}

@keyframes bar-grow {
  from {
    transform: scaleY(0);
  }

  to {
    transform: scaleY(1);
  }
}

/* Footer lines */
.dw-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dw-text-bar {
  height: 7px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
}

/* ══════════════════════════════════════════════════════════
   Scene 2 — ArticleList → scroll → ArticleCard
   ══════════════════════════════════════════════════════════ */

/* Widget wrapper: no padding, clips the scroll area */
.demo-widget-list {
  overflow: hidden;
}

/* Scrollable inner container */
.s2-scroll-area {
  display: flex;
  flex-direction: column;
  transform: translateY(0);
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.demo-window.is-scrolling .s2-scroll-area {
  transform: translateY(-140px);
}

/* ArticleList section — exactly fills the 220px stage */
.al-section {
  flex-shrink: 0;
  padding-top: 8px;
}

.al-topbar {
  padding: 0 16px 8px;
}

/* Each article row: thumb + text, total height 48px */
.al-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  transition: background 0.2s ease;
}

.al-item.is-active {
  background: rgba(34, 211, 238, 0.06);
}

.al-thumb {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  flex-shrink: 0;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.al-item.is-active .al-thumb {
  background: rgba(34, 211, 238, 0.18);
  border-color: rgba(34, 211, 238, 0.35);
}

.al-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.al-title {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
}

.al-sub {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
}

/* ArticleCard section: rendered below the al-section fold */
.ac-section-wrap {
  flex-shrink: 0;
  padding: 10px 16px 12px;
  border-top: 1px solid var(--border-strong);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(34, 211, 238, 0.025);
  /* Fade in after scroll starts */
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.4s 0.32s ease-out, transform 0.4s 0.32s ease-out;
}

.demo-window.is-scrolling .ac-section-wrap {
  opacity: 1;
  transform: translateY(0);
}

/* ArticleCard cover placeholder */
.ac-cover {
  position: relative;
  overflow: hidden;
  height: 60px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.07) 0%, rgba(255, 255, 255, 0.03) 100%);
  transition: border-color 0.55s ease, box-shadow 0.55s ease, background 0.55s ease;
}

/* Scan-line sweep element — offscreen until update fires */
.ac-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg,
      transparent 0%,
      rgba(251, 191, 36, 0.24) 50%,
      transparent 100%);
  transform: translateX(-110%);
}

.demo-window.is-updated .ac-cover {
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 18px rgba(251, 191, 36, 0.15);
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(34, 211, 238, 0.06) 100%);
}

.demo-window.is-updated .ac-cover::after {
  animation: cover-scan 0.65s 0.1s ease-out forwards;
}

@keyframes cover-scan {
  from {
    transform: translateX(-110%);
  }

  to {
    transform: translateX(110%);
  }
}

.ac-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ac-title-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.ac-tags {
  display: flex;
  gap: 6px;
}

.ac-tag {
  height: 16px;
  width: 42px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}

/* Mouse cursor dot — positioned at item 2 center (y≈100, x≈35) */
.demo-mouse {
  position: absolute;
  top: 93px;
  left: 35px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px rgba(34, 211, 238, 0.75), 0 0 0 2px rgba(34, 211, 238, 0.2);
  pointer-events: none;
  opacity: 0;
  z-index: 10;
}

.demo-window.is-clicking .demo-mouse {
  animation: mouse-click 0.7s ease-in-out forwards;
}

@keyframes mouse-click {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  15% {
    transform: scale(1.25);
  }

  45% {
    transform: scale(0.6);
  }

  70% {
    transform: scale(1.1);
  }

  100% {
    opacity: 0;
    transform: scale(1);
  }
}

/* ── Update animations on scene 2's ArticleCard ─────────── */

/* Title bar tint on update */
.demo-window.is-updated .ac-title-bar:first-child {
  background: rgba(251, 191, 36, 0.18);
  transition: background 0.45s 0.3s ease;
}

/* Accent tag highlights on update */
.ac-tag-accent {
  transition: background 0.4s 0.45s ease, border-color 0.4s 0.45s ease;
}

.demo-window.is-updated .ac-tag-accent {
  background: rgba(251, 191, 36, 0.18);
  border-color: rgba(251, 191, 36, 0.4);
}

/* ── Input row ───────────────────────────────────────────── */
.demo-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  border-top: 1px solid var(--border);
}

.demo-input-field {
  flex: 1;
  height: 33px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  color: var(--text-muted);
  overflow: hidden;
  white-space: nowrap;
  transition: border-color 0.2s;
}

.demo-window.is-loading .demo-input-field,
.demo-window.is-rendered .demo-input-field {
  border-color: rgba(255, 255, 255, 0.04);
}

/* Restore border visibility while actively typing */
.demo-window.is-typing .demo-input-field {
  border-color: var(--border);
}

.demo-cursor {
  display: inline-block;
  width: 1.5px;
  height: 12px;
  background: var(--cyan);
  margin-left: 1px;
  vertical-align: middle;
  flex-shrink: 0;
  animation: blink-cursor 0.85s step-end infinite;
}

@keyframes blink-cursor {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.demo-send-btn {
  width: 33px;
  height: 33px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-faint);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s, box-shadow 0.15s;
}

.demo-send-btn.is-sending {
  background: var(--cyan);
  border-color: var(--cyan);
  color: #060b14;
  box-shadow: 0 0 18px rgba(34, 211, 238, 0.55);
  transform: scale(0.9);
}
</style>
