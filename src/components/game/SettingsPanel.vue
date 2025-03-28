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
  padding: var(--space-md);
  margin: 0;
  background-color: var(--background-dark);
  border-bottom: var(--thin-border);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  transition: background-color var(--transition-speed-fast) ease;
}

.settings-list {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
}

.settings-section {
  padding: var(--space-md);
  border: var(--thin-border);
  background-color: var(--panel-bg);
  border-radius: 4px;
  position: relative;
  margin-bottom: var(--space-md);
  transition: transform var(--transition-speed) var(--transition-timing-smooth), 
              box-shadow var(--transition-speed) ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
}

.section-title {
  font-size: clamp(0.8rem, 2.5vw, 1rem);
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-xs);
  position: relative;
  z-index: var(--z-content);
}

.section-description {
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  line-height: 1.4;
  color: var(--text-secondary);
  margin: 0.5rem 0;
  position: relative;
  z-index: var(--z-content);
}

/* Mobile optimizations */
@media (max-width: var(--breakpoint-small)) {
  .settings-panel {
    padding: var(--space-xs) var(--space-xs);
  }

  .settings-section {
    padding: var(--space-xs);
  }

  .section-title {
    padding-bottom: var(--space-xs);
    margin-bottom: var(--space-sm);
  }

  .section-description {
    font-size: 0.75rem;
    margin-bottom: var(--space-xs);
  }
}
</style>