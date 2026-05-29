<template>
  <div class="page-wrapper">
    <AppHeader />
    <div class="docs-layout container">
      <aside class="docs-sidebar">
        <div class="docs-sidebar-inner">
          <DocsSidebar />
        </div>
      </aside>
      <main class="docs-main">
        <article class="prose">
          <slot />
        </article>
      </main>
    </div>
  </div>
</template>
