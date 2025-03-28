<template>
  <div class="save-slots">
    <div class="slot-list">
      <p>
        <span class="setting-label">SAVES</span>
        <br />
        Select a save slot to save or load your game data.
        <br />
        Slot 1 is reserved for auto-saves, it WILL be overwritten.
      </p>
      <div v-for="slot in saveSlots" :key="slot.slot" class="save-slot"
        :class="{ 'selected': selectedSlot === slot.slot }" @click="selectSlot(slot.slot)">
        <div class="slot-info">
          <span class="slot-number">SLOT {{ slot.slot }}</span>
          <template v-if="slot.data">
            <span class="slot-details">
              {{ formatDate(slot.data.timestamp) }}<br />
              Pixels: {{ formatNumber(slot.data.pixels) }}<br />
              Frames: {{ slot.data.completedFrames }}<br />
              Language: {{ slot.data.settings?.language || 'ENGLISH' }}
            </span>
          </template>
          <span v-else class="slot-empty">EMPTY</span>
        </div>
      </div>
    </div>

    <div class="slot-actions">
      <button class="retro-button" :disabled="!selectedSlot" @click="$emit('save', selectedSlot)">
        <span class="action-text">SAVE TO SLOT</span>
      </button>
      <button class="retro-button" :disabled="!selectedSlot || !hasDataInSelectedSlot"
        @click="$emit('load', selectedSlot)">
        <span class="action-text">LOAD FROM SLOT</span>
      </button>
      <button class="retro-button warning" :disabled="!selectedSlot || !hasDataInSelectedSlot" @click="onDelete">
        <span class="action-text">DELETE SLOT</span>
      </button>
    </div>

    <div class="file-actions">
      <button class="retro-button" @click="$emit('export')">
        <span class="action-text">EXPORT SAVE</span>
      </button>
      <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
      <button class="retro-button" @click="triggerFileInput">
        <span class="action-text">IMPORT SAVE</span>
      </button>
      <button class="retro-button danger" @click="onReset">
        <span class="action-text">HARD RESET</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatNumber } from '../../utils/numbers';

const props = defineProps({
  saveSlots: {
    type: Array,
    required: true,
    validator: (value) => Array.isArray(value),
    default: () => []
  }
});

const emit = defineEmits(['save', 'load', 'export', 'import', 'confirm-delete', 'confirm-reset']);

const selectedSlot = ref(null);
const fileInput = ref(null);

const hasDataInSelectedSlot = computed(() => {
  if (!selectedSlot.value) return false;
  const slot = props.saveSlots.find(s => s.slot === selectedSlot.value);
  return slot && slot.data !== null;
});

const selectSlot = (slot) => {
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
  event.target.value = '';
};

const onDelete = () => {
  emit('confirm-delete', selectedSlot.value);
};

const onReset = () => {
  emit('confirm-reset');
};
</script>

<style scoped>
.save-slots {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  position: relative;
  z-index: 1;
}

.slot-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(140px, 100%), 1fr));
  gap: var(--space-xs);
}

.save-slot {
  border: 2px solid var(--button-border);
  padding: var(--space-xs);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
  background-color: var(--panel-bg);
  min-height: clamp(90px, 20vh, 120px);
  display: flex;
  flex-direction: column;
}

.save-slot.selected {
  border-color: var(--primary);
  box-shadow: var(--shadow-light);
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
  pointer-events: none;
  flex: 1;
}

.slot-number {
  font-family: var(--font-display);
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  color: var(--text-primary);
}

.slot-details,
.slot-empty {
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: var(--text-secondary);
  line-height: 1.4;
}

.slot-empty {
  font-style: italic;
  align-self: center;
  margin: auto 0;
}

.slot-actions,
.file-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.slot-actions button,
.file-actions button {
  width: 100%;
}

/* Responsive styles using CSS variables */
@media (max-width: var(--breakpoint-medium)) {
  .save-slots {
    gap: var(--space-sm);
  }
}

@media (max-width: var(--breakpoint-small)) {
  .save-slots {
    gap: var(--space-xs);
  }

  .slot-list {
    grid-template-columns: 1fr;
  }

  .save-slot {
    min-height: 80px;
    padding: var(--space-xs);
  }

  .slot-info {
    gap: 0.2rem;
  }

  .slot-number {
    font-size: 0.65rem;
  }

  .slot-details,
  .slot-empty {
    font-size: 0.75rem;
  }
}
</style>