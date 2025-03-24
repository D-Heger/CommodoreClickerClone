<template>
  <div class="stats crt-panel">
    <div class="stat-item">
      <span class="stat-label">PIXELS:</span>
      <span class="stat-value">{{ pixels }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">CLOCK SPEED:</span>
      <span class="stat-value">{{ computerSpeed }} Hz</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">CLICK POWER:</span>
      <span class="stat-value">{{ clickPower }} px</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">SPENT PIXELS:</span>
      <span class="stat-value">{{ spentPixels }}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">TOTAL PIXELS:</span>
      <span class="stat-value">{{ totalPixels }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  pixels: {
    type: String,
    required: true
  },
  computerSpeed: {
    type: String,
    required: true
  },
  clickPower: {
    type: String,
    default: '1'
  },
  spentPixels: {
    type: String,
    required: true
  },
  totalPixels: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  border: 2px solid var(--secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: max-content;
}

.stat-label {
  font-family: var(--font-display);
  font-size: clamp(0.7rem, 2vw, 0.8rem);
  color: var(--text-secondary);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--secondary);
  display: inline-block;
}

@media (max-width: 768px) {
  .stats {
    gap: 0.75rem;
    padding: 0.5rem;
    justify-content: space-around;
  }
  
  .stat-item {
    flex: 0 1 auto;
  }
}

@media (max-width: 480px) {
  .stats {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .stat-item {
    width: 100%;
    justify-content: space-between;
  }
}
</style>