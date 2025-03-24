<template>
  <div class="settings-options">
    <div class="settings-section">
      <h3 class="section-title">DISPLAY</h3>
      <div class="setting-item">
        <span class="setting-label">THEME</span>
        <div class="setting-control">
          <button 
            v-for="theme in themes" 
            :key="theme"
            class="option-button" 
            :class="{ 'selected': currentTheme === theme }"
            @click="$emit('theme-change', theme)">
            {{ theme }}
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">AUDIO</h3>
      <div class="setting-item">
        <span class="setting-label">SOUND FX</span>
        <div class="setting-control">
          <button 
            v-for="option in toggleOptions" 
            :key="option.value"
            class="option-button" 
            :class="{ 'selected': soundFx === option.value }"
            @click="$emit('sound-fx-change', option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>
      <div class="setting-item">
        <span class="setting-label">MUSIC</span>
        <div class="setting-control">
          <button 
            v-for="option in toggleOptions" 
            :key="option.value"
            class="option-button" 
            :class="{ 'selected': music === option.value }"
            @click="$emit('music-change', option.value)">
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">LANGUAGE</h3>
      <div class="setting-item">
        <span class="setting-label">LANGUAGE</span>
        <div class="setting-control">
          <button 
            v-for="lang in languages" 
            :key="lang.code"
            class="option-button" 
            :class="{ 'selected': currentLanguage === lang.code }"
            @click="$emit('language-change', lang.code)">
            {{ lang.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { THEMES, LANGUAGES, TOGGLE_OPTIONS } from '../../utils/settingsConfig';

const props = defineProps({
  currentTheme: {
    type: String,
    default: 'C64'
  },
  soundFx: {
    type: Boolean,
    default: true
  },
  music: {
    type: Boolean,
    default: true
  },
  currentLanguage: {
    type: String,
    default: 'ENGLISH'
  }
});

defineEmits(['theme-change', 'sound-fx-change', 'music-change', 'language-change']);

const themes = THEMES;
const toggleOptions = TOGGLE_OPTIONS;
const languages = LANGUAGES;
</script>

<style scoped>
.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>