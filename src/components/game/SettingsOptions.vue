<template>
  <div class="settings-options">
    <div class="settings-section">
      <h3 class="section-title">
        DISPLAY
      </h3>
      <div class="setting-item">
        <span class="setting-label">THEME</span>
        <div class="setting-control">
          <button v-for="theme in themes" :key="theme" class="option-button"
            :class="{ 'selected': currentTheme === theme }" @click="$emit('theme-change', theme)">
            {{ theme }}
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">
        AUDIO
      </h3>
      <div class="setting-item">
        <span class="setting-label">SOUND FX</span>
        <div class="setting-control">
          <button v-for="option in toggleOptions" :key="option.value" class="option-button"
            :class="{ 'selected': soundFx === option.value }" @click="$emit('sound-fx-change', option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="setting-item">
        <span class="setting-label">MUSIC</span>
        <div class="setting-control">
          <button v-for="option in toggleOptions" :key="option.value" class="option-button"
            :class="{ 'selected': music === option.value }" @click="$emit('music-change', option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">
        LANGUAGE
      </h3>
      <div class="setting-item">
        <span class="setting-label">LANGUAGE</span>
        <div class="setting-control">
          <button v-for="lang in languages" :key="lang.code" class="option-button"
            :class="{ 'selected': currentLanguage === lang.code }" @click="$emit('language-change', lang.code)">
            {{ lang.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { THEMES, LANGUAGES, TOGGLE_OPTIONS } from '../../utils/settingsConfig';

defineEmits(['theme-change', 'sound-fx-change', 'music-change', 'language-change']);

defineProps({
  currentTheme: {
    type: String,
    required: true
  },
  soundFx: {
    type: Boolean,
    required: true
  },
  music: {
    type: Boolean,
    required: true
  },
  currentLanguage: {
    type: String,
    required: true
  }
});

const themes = THEMES;
const toggleOptions = TOGGLE_OPTIONS;
const languages = LANGUAGES;
</script>

<style scoped>
.settings-options {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vh, 1rem);
  position: relative;
  z-index: 1;
}

.setting-label {
  font-family: var(--font-display);
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  color: var(--text-secondary);
}

.setting-control {
  display: flex;
  flex-wrap: wrap;
  gap: clamp(0.3rem, 0.8vh, 0.5rem);
  margin-top: clamp(0.3rem, 0.8vh, 0.5rem);
}

.option-button {
  padding: clamp(0.3rem, 0.8vh, 0.4rem) clamp(0.4rem, 1vw, 0.6rem);
  font-size: clamp(0.75rem, 2vw, 0.9rem);
  flex: 1;
  min-width: calc(50% - 0.25rem);
  text-align: center;
  background-color: var(--button-bg);
  color: var(--text-secondary);
  border: 1px solid var(--button-border);
  cursor: pointer;
  transition: all 0.2s;
}

.option-button.selected {
  background-color: var(--primary);
  color: #000;
  border-color: var(--primary);
}

.option-button:hover:not(.selected) {
  border-color: var(--primary);
  color: var(--primary);
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .settings-options {
    gap: 0.6rem;
  }

  .setting-control {
    gap: 0.2rem;
    margin-top: 0.3rem;
  }

  .option-button {
    padding: 0.25rem 0.4rem;
    font-size: 0.7rem;
  }
}
</style>