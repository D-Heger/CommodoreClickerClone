<template>
  <div class="stats-display">
    <!-- Compact stats display always visible -->
    <div class="stats crt-panel">
      <div class="stat-item">
        <span class="stat-label">PIXELS:</span>
        <span class="stat-value">{{ pixels }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">CLOCK:</span>
        <span class="stat-value">{{ computerSpeed }} Hz</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">POWER:</span>
        <span class="stat-value">{{ clickPower }}</span>
      </div>
      
      <!-- Stats panel toggle button -->
      <button class="stats-toggle-btn" @click="toggleStatsPanel">
        {{ isStatsPanelOpen ? '▲' : '▼' }}
      </button>
    </div>

    <!-- Detailed stats panel -->
    <div class="detailed-stats crt-panel" :class="{ 'open': isStatsPanelOpen }">
      <div class="stats-grid">
        <div class="stat-group">
          <h3>CLICK STATS</h3>
          <div class="stat-row">
            <span class="stat-label">POWER:</span>
            <span class="stat-value">{{ clickPower }} px</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">MULTIPLIER:</span>
            <span class="stat-value">{{ clickMultiplier }}x</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">CRIT CHANCE:</span>
            <span class="stat-value">{{ clickCriticalChance }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">CRIT MULTIPLIER:</span>
            <span class="stat-value">{{ clickCritMultiplier }}x</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">AUTO CLICKS:</span>
            <span class="stat-value">{{ autoClicks }}/s</span>
          </div>
        </div>

        <div class="stat-group">
          <h3>PRODUCTION STATS</h3>
          <div class="stat-row">
            <span class="stat-label">CLOCK SPEED:</span>
            <span class="stat-value">{{ computerSpeed }} Hz</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">AUTO RATE:</span>
            <span class="stat-value">{{ autoRate }} px/s</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">RATE MULT:</span>
            <span class="stat-value">{{ rateMultiplier }}x</span>
          </div>
        </div>

        <div class="stat-group">
          <h3>TOTAL STATS</h3>
          <div class="stat-row">
            <span class="stat-label">PIXELS:</span>
            <span class="stat-value">{{ pixels }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">SPENT PIXELS:</span>
            <span class="stat-value">{{ spentPixels }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">TOTAL PIXELS:</span>
            <span class="stat-value">{{ totalPixels }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">FRAMES COMPLETED:</span>
            <span class="stat-value">{{ completedFrames }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Stats panel toggle state
const isStatsPanelOpen = ref(false);
const toggleStatsPanel = () => {
  isStatsPanelOpen.value = !isStatsPanelOpen.value;
};

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
  clickMultiplier: {
    type: String,
    default: '1'
  },
  clickCriticalChance: {
    type: String,
    default: '0'
  },
  clickCritMultiplier: {
    type: String, 
    default: '1'
  },
  autoRate: {
    type: String,
    default: '0'
  },
  rateMultiplier: {
    type: String,
    default: '1'
  },
  autoClicks: {
    type: String,
    default: '0'
  },
  spentPixels: {
    type: String,
    required: true
  },
  totalPixels: {
    type: String,
    required: true
  },
  completedFrames: {
    type: String,
    default: '0'
  }
})
</script>

<style scoped>
.stats-display {
  position: relative;
  width: 100%;
  z-index: 20;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: clamp(0.3rem, 1vw, 0.5rem);
  padding: clamp(0.3rem, 1vh, 0.4rem);
  border-radius: 4px;
  border: 2px solid var(--secondary);
  position: relative;
  background-color: rgba(12, 12, 12, 0.95);
  max-width: min(800px, 95vw);
  margin: 0 auto;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
}

.stats-toggle-btn {
  position: absolute;
  right: clamp(3px, 0.8vw, 5px);
  top: 50%;
  transform: translateY(-50%);
  background: var(--button-bg);
  color: var(--secondary);
  border: 1px solid var(--secondary);
  border-radius: 50%;
  width: clamp(16px, 2.5vw, 20px);
  height: clamp(16px, 2.5vw, 20px);
  font-size: clamp(8px, 1.2vw, 10px);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stats-toggle-btn:hover {
  background: var(--secondary);
  color: var(--button-bg);
}

/* Detailed stats panel */
.detailed-stats {
  position: absolute;
  top: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(12, 12, 12, 0.95);
  border: 2px solid var(--secondary);
  padding: 0;
  border-radius: 4px;
  max-height: 0;
  width: 90vw;
  max-width: 1200px;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 25;
}

.detailed-stats.open {
  max-height: min(80vh, 500px);
  opacity: 1;
  padding: clamp(0.8rem, 2vh, 1rem);
}

.stats-grid {
  display: flex;
  flex-direction: row;
  gap: clamp(1rem, 2vh, 1.5rem);
  overflow-x: auto;
}

.stat-group {
  border: 1px solid var(--secondary);
  padding: clamp(0.8rem, 2vh, 1rem);
  border-radius: 4px;
  background-color: var(--background-dark);
  min-width: 250px;
  flex: 1;
}

.stat-group h3 {
  margin-top: 0;
  margin-bottom: clamp(0.8rem, 2vh, 1rem);
  color: var(--secondary);
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  text-align: center;
  border-bottom: 1px solid var(--secondary);
  padding-bottom: 0.5rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-family: var(--font-display);
  font-size: clamp(0.65rem, 1.8vw, 0.8rem);
  color: var(--text-secondary);
}

.stat-value {
  font-family: var(--font-mono);
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  color: var(--secondary);
  display: inline-block;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .stats {
    gap: 0.75rem;
    padding: 0.5rem 1.5rem 0.5rem 0.5rem;
  }
  
  .stat-item {
    flex: 0 1 auto;
    font-size: 0.9rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .detailed-stats.open {
    max-height: min(90vh, 800px);
  }
}

@media (max-width: 480px) {
  .stats {
    gap: 0.5rem;
    padding: 0.4rem 1.2rem 0.4rem 0.4rem;
  }
  
  .stat-item {
    font-size: 0.8rem;
  }
  
  .stats-toggle-btn {
    width: 20px;
    height: 20px;
    font-size: 10px;
    right: 5px;
  }

  .detailed-stats.open {
    max-height: min(95vh, 1000px);
  }
}
</style>