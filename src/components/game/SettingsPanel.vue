<template>
  <div class="settings-panel">
    <h2 class="retro-title">
      SETTINGS
    </h2>

    <div class="settings-list">
      <div class="settings-section">
        <h3 class="section-title">
          GAME DATA
        </h3>
        <SaveSlotManager :save-slots="saveSlots" @save="$emit('save', $event)" @load="$emit('load', $event)"
          @export="$emit('export')" @import="$emit('import', $event)" @confirm-delete="confirmDelete"
          @confirm-reset="confirmReset" />
      </div>

      <div class="settings-section">
        <h3 class="section-title">
          GAME SETTINGS
        </h3>
        <p class="section-description">
          Adjust the game settings to your preference.
          <br />
          <strong>Note: These settings do nothing yet.</strong>
        </p>
      </div>

      <SettingsOptions :current-theme="settings.theme" :sound-fx="settings.soundFx" :music="settings.music"
        :current-language="settings.language" @theme-change="updateSetting('theme', $event)"
        @sound-fx-change="updateSetting('soundFx', $event)" @music-change="updateSetting('music', $event)"
        @language-change="updateSetting('language', $event)" />

      <AboutSection @open-changelog="$emit('open-changelog')" />
    </div>

    <ConfirmationDialog :show="showConfirmation" :message="confirmationMessage" @confirm="handleConfirm"
      @cancel="cancelConfirmation" />
  </div>
</template>

<script setup>
import SaveSlotManager from './SaveSlotManager.vue';
import SettingsOptions from './SettingsOptions.vue';
import AboutSection from './AboutSection.vue';
import ConfirmationDialog from './ConfirmationDialog.vue';
import { useConfirmation } from '../../utils/useConfirmation';
import { ref } from 'vue';

const emit = defineEmits(['save', 'load', 'delete', 'export', 'import', 'reset', 'open-changelog', 'update-settings']);

// Add props definition
const props = defineProps({
  saveSlots: {
    type: Array,
    required: true,
    default: () => []
  },
  settings: {
    type: Object,
    required: true
  }
});

// Use the confirmation composable
const {
  showConfirmation,
  confirmationMessage,
  confirm,
  handleConfirm,
  cancelConfirmation
} = useConfirmation();

const updateSetting = (key, value) => {
  emit('update-settings', { ...props.settings, [key]: value });
};

const confirmDelete = (slotId) => {
  confirm(
    'Are you sure you want to delete this save?',
    () => emit('delete', slotId)
  );
};

const confirmReset = () => {
  confirm(
    'WARNING: This will delete ALL saves and reset ALL progress. Are you sure?',
    () => emit('reset')
  );
};
</script>

<style scoped>
.settings-panel {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.retro-title {
  padding: clamp(0.8rem, 2vh, 1rem);
  margin: 0;
  background-color: var(--background-dark);
  border-bottom: 2px solid var(--button-border);
  position: sticky;
  top: 0;
  z-index: 5;
}

.settings-list {
  flex: 1;
  padding: clamp(0.8rem, 2vh, 1rem);
  overflow-y: auto;
}

.settings-section {
  padding: clamp(0.8rem, 2vh, 1rem);
  border: 2px solid var(--button-border);
  background-color: rgba(20, 20, 20, 0.95);
  border-radius: 4px;
  position: relative;
  margin-bottom: clamp(0.8rem, 2vh, 1rem);
}

.settings-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 0%, rgba(51, 255, 51, 0.05) 50%, transparent 100%);
  z-index: 0;
}

.section-title {
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  margin-bottom: clamp(0.8rem, 2vh, 1rem);
  padding-bottom: clamp(0.3rem, 1vh, 0.5rem);
  position: relative;
  z-index: 1;
}

.section-description {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  line-height: 1.4;
  color: var(--text-secondary);
  margin: 0.5rem 0;
  position: relative;
  z-index: 1;
}

/* Mobile optimizations */
@media (max-width: 480px) {
  .settings-panel {
    padding: 0.8rem 0.5rem;
  }

  .settings-section {
    padding: 0.6rem;
  }

  .section-title {
    padding-bottom: 0.3rem;
    margin-bottom: 0.6rem;
  }

  .section-description {
    font-size: 0.75rem;
    margin-bottom: 0.3rem;
  }
}
</style>