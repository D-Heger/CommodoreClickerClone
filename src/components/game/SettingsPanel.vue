<template>
  <div class="settings-panel">
    <h2 class="retro-title">SETTINGS</h2>

    <div class="settings-list">
      <div class="settings-section">
        <h3 class="section-title">GAME DATA</h3>
        <div class="save-slots">
          <div class="slot-list">
            <p>
              <span class="setting-label">SAVES</span>
              <br>
              Select a save slot to save or load your game data.
              <br>
              Slot 1 is reserved for auto-saves, it WILL be overwritten.
            </p>
            <div v-for="slot in saveSlots" :key="slot.slot" 
                class="save-slot" 
                :class="{ 'selected': selectedSlot === slot.slot }"
                @click="selectSlot(slot.slot)">
              <div class="slot-info">
                <span class="slot-number">SLOT {{ slot.slot }}</span>
                <template v-if="slot.data">
                  <span class="slot-details">
                    {{ formatDate(slot.data.timestamp) }}<br>
                    Pixels: {{ formatNumber(slot.data.pixels) }}<br>
                    Frames: {{ slot.data.completedFrames }}
                  </span>
                </template>
                <span v-else class="slot-empty">EMPTY</span>
              </div>
            </div>
          </div>
          <div class="slot-actions">
            <button class="retro-button" @click="$emit('save', selectedSlot)" :disabled="!selectedSlot">
              <span class="action-text">SAVE TO SLOT</span>
            </button>
            <button class="retro-button" @click="$emit('load', selectedSlot)" 
              :disabled="!selectedSlot || !hasDataInSelectedSlot">
              <span class="action-text">LOAD FROM SLOT</span>
            </button>
            <button class="retro-button warning" @click="confirmDelete" 
              :disabled="!selectedSlot || !hasDataInSelectedSlot">
              <span class="action-text">DELETE SLOT</span>
            </button>
          </div>
        </div>
        <div class="file-actions">
          <button class="retro-button" @click="$emit('export')">
            <span class="action-text">EXPORT SAVE</span>
          </button>
          <input type="file" ref="fileInput" @change="handleFileImport" accept=".json" style="display: none">
          <button class="retro-button" @click="triggerFileInput">
            <span class="action-text">IMPORT SAVE</span>
          </button>
          <button class="retro-button danger" @click="confirmReset">
            <span class="action-text">HARD RESET</span>
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">DISPLAY</h3>
        <div class="setting-item">
          <span class="setting-label">THEME</span>
          <div class="setting-control">
            <button class="option-button selected">C64</button>
            <button class="option-button">AMIGA</button>
            <button class="option-button">ZX</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">AUDIO</h3>
        <div class="setting-item">
          <span class="setting-label">SOUND FX</span>
          <div class="setting-control">
            <button class="option-button selected">ON</button>
            <button class="option-button">OFF</button>
          </div>
        </div>
        <div class="setting-item">
          <span class="setting-label">MUSIC</span>
          <div class="setting-control">
            <button class="option-button selected">ON</button>
            <button class="option-button">OFF</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">LANGUAGE</h3>
        <div class="setting-item">
          <span class="setting-label">LANGUAGE</span>
          <div class="setting-control">
            <button class="option-button selected">ENGLISH</button>
            <button class="option-button">DEUTSCH</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">ABOUT</h3>
        <p class="about-text">
          Commodore Pixel Renderer <strong>v0.0.3</strong><br> <!-- TODO: dynamically insert latest version number, in the meantime don't forget to update-->
          A retro-style incremental game
          <br>
          By <a href="https://github.com/D-Heger" target="_blank">D-Heger 🔗</a>
          <br>
          <a href="https://github.com/D-Heger/CommodoreClickerClone" target="_blank">View on GitHub 🔗</a>
          <br>
          <button class="retro-button changelog-button" @click="$emit('open-changelog')">
            <span class="action-text">VIEW CHANGELOG</span>
          </button>
          <br>
          This project is a work in progress and is not affiliated with any official Commodore products.
          It is intended for educational and entertainment purposes only.
          Running this game may cause you to lose track of time and forget about your real life.
          Licensed under the MIT License.
        </p>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmation" class="confirmation-overlay">
      <div class="confirmation-dialog crt-panel">
        <h3>{{ confirmationMessage }}</h3>
        <div class="confirmation-actions">
          <button class="retro-button danger" @click="handleConfirm">
            <span class="action-text">CONFIRM</span>
          </button>
          <button class="retro-button" @click="cancelConfirmation">
            <span class="action-text">CANCEL</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatNumber } from '../../utils/numbers';

const props = defineProps({
  saveSlots: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['save', 'load', 'delete', 'export', 'import', 'reset', 'open-changelog']);

// Declare selectedSlot ref properly
const selectedSlot = ref(null);
const showConfirmation = ref(false);
const confirmationMessage = ref('');
const confirmationAction = ref(null);
const fileInput = ref(null);

const hasDataInSelectedSlot = computed(() => {
  if (!selectedSlot.value) return false;
  const slot = props.saveSlots.find(s => s.slot === selectedSlot.value);
  return slot && slot.data !== null;
});

const selectSlot = (slot) => {
  console.log('Selecting slot:', slot); // Debug log
  selectedSlot.value = slot;
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileImport = (event) => {
  const file = event.target.files[0];
  if (file) {
    emit('import', file);
  }
  event.target.value = ''; // Reset the input
};

const confirmDelete = () => {
  confirmationMessage.value = 'Are you sure you want to delete this save?';
  confirmationAction.value = () => emit('delete', selectedSlot.value);
  showConfirmation.value = true;
};

const confirmReset = () => {
  confirmationMessage.value = 'WARNING: This will delete ALL saves and reset ALL progress. Are you sure?';
  confirmationAction.value = () => emit('reset');
  showConfirmation.value = true;
};

const handleConfirm = () => {
  if (confirmationAction.value) {
    confirmationAction.value();
  }
  showConfirmation.value = false;
};

const cancelConfirmation = () => {
  showConfirmation.value = false;
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

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 2px solid var(--button-border);
  background-color: rgba(20, 20, 20, 0.8);
  position: relative;
  overflow: hidden;
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
  font-family: var(--font-display);
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--text-primary);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 1;
}

.settings-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1;
}

.settings-button {
  /* composes: retro-button; */
  text-align: center;
}

.warning {
  color: var(--warning);
}

.danger {
  color: var(--danger);
}

.action-text {
  font-family: var(--font-mono);
  font-size: 1.1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1;
  margin-bottom: 0.8rem;
}

.setting-label {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.setting-control {
  display: flex;
  gap: 0.5rem;
}

.option-button {
  padding: 0.4rem 0.6rem;
  background-color: var(--button-bg);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  border: 1px solid var(--button-border);
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.option-button.selected {
  background-color: var(--primary);
  color: #000;
  border-color: var(--primary);
}

.about-text {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  z-index: 1;
}

.about-text a {
  color: var(--primary);
}

.changelog-button {
  margin-top: 1rem;
  width: 100%;
}

.save-slots {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
}

.save-slot {
  border: 2px solid var(--button-border);
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  background-color: var(--button-bg);
}

.save-slot.selected {
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(51, 255, 51, 0.3);
  background-color: rgba(51, 255, 51, 0.1);
  transform: translateY(-2px);
}

.save-slot:hover {
  border-color: var(--primary);
  background-color: rgba(51, 255, 51, 0.05);
  transform: translateY(-1px);
}

.save-slot:active {
  transform: translateY(0);
}

.slot-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  pointer-events: none; /* Ensure clicks go to the parent */
}

.slot-number {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--text-primary);
}

.slot-details {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.slot-empty {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

.slot-actions, .file-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.confirmation-dialog {
  padding: 2rem;
  max-width: 400px;
  text-align: center;
  border: var(--panel-border);
}

.confirmation-dialog h3 {
  color: var(--warning);
  margin-bottom: 2rem;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>