<template>
  <div v-if="show" class="overlay">
    <div class="confirmation-dialog crt-panel">
      <h3>{{ message }}</h3>
      <div class="confirmation-actions">
        <button class="retro-button danger" @click="confirm">
          <span class="action-text">CONFIRM</span>
        </button>
        <button class="retro-button" @click="cancel">
          <span class="action-text">CANCEL</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => emit('confirm');
const cancel = () => emit('cancel');
</script>

<style scoped>
.confirmation-dialog {
  padding: var(--space-lg);
  max-width: min(400px, 90vw);
  text-align: center;
  border: var(--panel-border);
  border-radius: 4px;
  background-color: var(--panel-bg);
  position: relative;
}

.confirmation-dialog h3 {
  color: var(--warning);
  margin-bottom: var(--space-lg);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  line-height: 1.4;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

@media (max-width: var(--breakpoint-small)) {
  .confirmation-dialog {
    padding: var(--space-md);
  }
  
  .confirmation-actions {
    gap: var(--space-sm);
    flex-direction: column;
  }
}
</style>