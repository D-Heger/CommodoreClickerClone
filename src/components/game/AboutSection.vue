<template>
  <div class="settings-section">
    <h3 class="section-title">
      ABOUT
    </h3>
    <div class="about-content">
      <p class="about-text">
        Commodore Pixel Renderer <strong>{{ version }}</strong><br />
        A retro-style incremental game
        <br />
        By <a href="https://github.com/D-Heger" target="_blank">D-Heger 🔗</a>
        <br />
        <a href="https://github.com/D-Heger/CommodoreClickerClone" target="_blank">View on GitHub 🔗</a>
        <br />
        <button class="retro-button changelog-button" @click="$emit('open-changelog')">
          <span class="action-text">VIEW CHANGELOG</span>
        </button>
        <br />
        This project is a work in progress and is not affiliated with any official Commodore products.
        It is intended for educational and entertainment purposes only.
        Running this game may cause you to lose track of time and forget about your real life.
        Licensed under the MIT License.
      </p>
    </div>
  </div>
</template>

<script setup>
import { VERSION } from '../../utils/settingsConfig';

defineProps({
  version: {
    type: String,
    default: VERSION
  }
});

defineEmits(['open-changelog']);
</script>

<style scoped>
.about-content {
  position: relative;
  z-index: var(--z-content);
}

.about-text {
  font-family: var(--font-mono);
  font-size: clamp(0.9rem, 2.2vw, 1.1rem);
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.4;
  margin: var(--space-xs) 0;
}

.about-text a {
  color: var(--primary);
  position: relative;
  z-index: var(--z-content);
  pointer-events: auto;
  cursor: pointer;
  text-decoration: none;
}

.about-text a:hover {
  text-decoration: underline;
  color: var(--secondary);
}

.changelog-button {
  margin: var(--space-sm) auto;
  width: 100%;
  position: relative;
  z-index: var(--z-content);
  pointer-events: auto;
  cursor: pointer;
}

@media (max-width: var(--breakpoint-small)) {
  .about-text {
    font-size: 0.85rem;
  }
}
</style>