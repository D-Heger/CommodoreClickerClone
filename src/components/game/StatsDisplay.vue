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
  gap: 2rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 2px solid var(--secondary);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  font-family: var(--font-display);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  color: var(--secondary);
  width: 100px;
  display: inline-block;
}
</style>