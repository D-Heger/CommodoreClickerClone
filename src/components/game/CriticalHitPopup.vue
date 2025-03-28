<template>
  <transition name="critical-popup">
    <div v-if="show" class="critical-hit-popup">
      <div class="critical-content">
        <div class="critical-text">CRIT<span v-if="hits > 1">x{{ hits }}</span>!</div>
        <div class="critical-multiplier">x{{ formattedMultiplier }}</div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue';
import { formatNumber } from '../../utils/numbers';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  multiplier: {
    type: String,
    default: '1'
  },
  hits: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 1500 // Duration in milliseconds
  }
});

const emit = defineEmits(['hide']);

const formattedMultiplier = computed(() => {
  return formatNumber(props.multiplier);
});

// Auto-hide the popup after duration
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    setTimeout(() => {
      emit('hide');
    }, props.duration);
  }
});
</script>

<style scoped>
.critical-hit-popup {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--panel-bg);
  border: var(--thin-border);
  border-color: var(--type-critical);
  border-radius: 4px;
  padding: var(--space-xs) var(--space-md);
  z-index: var(--z-tooltip);
  min-width: 120px;
  box-shadow: 0 0 10px var(--type-critical);
  animation: pulse 0.5s ease-in-out infinite alternate;
}

.critical-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.critical-text {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--type-critical);
  text-shadow: 0 0 5px var(--type-critical);
}

.critical-multiplier {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  color: white;
  font-weight: bold;
}

@keyframes pulse {
  0% {
    transform: translateX(-50%) scale(1);
  }
  100% {
    transform: translateX(-50%) scale(1.03);
  }
}

.critical-popup-enter-active,
.critical-popup-leave-active {
  transition: all 0.2s;
}

.critical-popup-enter-from,
.critical-popup-leave-to {
  opacity: 0;
  transform: translateX(-50%) scale(0.8);
}
</style>