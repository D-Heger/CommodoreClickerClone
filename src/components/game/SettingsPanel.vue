<template>
  <div class="settings-panel">
    <h2 class="retro-title">SETTINGS</h2>

    <div class="settings-list">
      <div class="settings-section">
        <h3 class="section-title">GAME DATA</h3>
        <SaveSlotManager
          :saveSlots="saveSlots"
          @save="$emit('save', $event)"
          @load="$emit('load', $event)"
          @export="$emit('export')"
          @import="$emit('import', $event)"
          @confirm-delete="confirmDelete"
          @confirm-reset="confirmReset"
        />
      </div>
      
      <div class="settings-section">
        <h3 class="section-title">GAME SETTINGS</h3>
        <p class="section-description">
          Adjust the game settings to your preference.
          <br>
          <strong>Note: These settings do nothing yet.</strong>
        </p>
      </div>

      <SettingsOptions
        :currentTheme="settings.theme"
        :soundFx="settings.soundFx"
        :music="settings.music"
        :currentLanguage="settings.language"
        @theme-change="updateSetting('theme', $event)"
        @sound-fx-change="updateSetting('soundFx', $event)"
        @music-change="updateSetting('music', $event)"
        @language-change="updateSetting('language', $event)"
      />

      <AboutSection 
        @open-changelog="$emit('open-changelog')"
      />
    </div>

    <ConfirmationDialog
      :show="showConfirmation"
      :message="confirmationMessage"
      @confirm="handleConfirm"
      @cancel="cancelConfirmation"
    />
  </div>
</template>

<script setup>
import SaveSlotManager from './SaveSlotManager.vue';
import SettingsOptions from './SettingsOptions.vue';
import AboutSection from './AboutSection.vue';
import ConfirmationDialog from './ConfirmationDialog.vue';
import { useConfirmation } from '../../utils/useConfirmation';
import { DEFAULT_SETTINGS } from '../../utils/settingsConfig';
import { ref } from 'vue';

const props = defineProps({
  saveSlots: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['save', 'load', 'delete', 'export', 'import', 'reset', 'open-changelog', 'update-settings']);

// Use the confirmation composable
const { 
  showConfirmation, 
  confirmationMessage, 
  confirm,
  handleConfirm, 
  cancelConfirmation 
} = useConfirmation();

// Default settings
const settings = ref({ ...DEFAULT_SETTINGS });

const updateSetting = (key, value) => {
  settings.value[key] = value;
  emit('update-settings', settings.value);
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
  height: 100%;
  padding: 1.5rem 1rem;
  overflow: scroll;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 200px;
}
</style>