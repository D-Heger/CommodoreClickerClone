<template>
  <div v-if="show" class="confirmation-overlay">
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