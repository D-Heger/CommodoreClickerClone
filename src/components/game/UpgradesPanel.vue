<template>
  <div class="upgrades-panel crt-panel">
    <h2 class="retro-title">UPGRADES</h2>

    <div class="upgrades-list">
      <div v-for="upgrade in upgrades" :key="upgrade.id" class="upgrade-item"
        :class="{ 'affordable': canAffordUpgrade(upgrade) }">
        <div class="upgrade-info">
          <h3>{{ upgrade.name }} <span class="level-badge">LVL {{ upgrade.level }}</span></h3>
          <p>{{ upgrade.description }}</p>
          <span class="upgrade-type" :class="{
            'type-rate': upgrade.type === 'rate',
            'type-multiplier': upgrade.type === 'multiplier',
            'type-click': upgrade.type === 'click'
          }">
            {{ upgrade.type === 'rate' ? 'SPEED+' : (upgrade.type === 'multiplier' ? 'MULTIx' : 'CLICK+') }}
          </span>
        </div>
        <button @click="$emit('purchase', upgrade.id)" :disabled="!canAffordUpgrade(upgrade)" class="retro-button">
          <span class="price">{{ formatNumber(calculateUpgradeCost(upgrade)) }}</span>
          <span class="buy-text">BUY</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { toDecimal, formatNumber, gte } from '../../utils/numbers'
import { calculateUpgradeCost } from '../../utils/upgradeManager'

const props = defineProps({
  pixels: {
    type: String,
    required: true
  },
  upgrades: {
    type: Array,
    required: true
  }
})

// Check if the player can afford an upgrade
const canAffordUpgrade = (upgrade) => {
  const cost = calculateUpgradeCost(upgrade)
  return gte(props.pixels, cost)
}

defineEmits(['purchase'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.upgrades-panel {
  height: 100%;
  padding: 1.5rem 1rem;
  border-left: var(--panel-border);
  overflow: scroll;
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 200px;
}

.upgrade-item {
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  border: 2px solid var(--button-border);
  background-color: rgba(20, 20, 20, 0.8);
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.upgrade-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 0%, rgba(51, 255, 51, 0.05) 50%, transparent 100%);
  z-index: 0;
}

.upgrade-item.affordable {
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(51, 255, 51, 0.3);
  transform: scale(1.02);
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    background-color: rgba(51, 255, 51, 0.1);
    box-shadow: 0 0 20px rgba(51, 255, 51, 0.5);
    transform: scale(1.05);
  }
}

.upgrade-info {
  flex: 1;
  z-index: 1;
}

.upgrade-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-badge {
  background-color: #333;
  color: var(--primary);
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  border: 1px solid var(--primary);
}

.upgrade-info p {
  margin: 0 0 0.7rem 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.upgrade-type {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  color: black;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
}

.type-rate {
  background-color: var(--secondary);
}

.type-multiplier {
  background-color: var(--multiplier);
}

.type-click {
  background-color: var(--click);
}

.price {
  color: var(--warning);
  font-family: var(--font-mono);
  font-size: 1.1rem;
}

.buy-text {
  color: var(--warning);
  font-family: var(--font-mono);
  font-size: 1.1rem;
}
</style>