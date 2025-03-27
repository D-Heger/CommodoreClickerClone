<template>
  <div class="upgrades-panel">
    <h2 class="retro-title">
      UPGRADES
    </h2>

    <!-- Filter controls -->
    <div class="filter-controls">
      <div class="filter-section">
        <div class="filter-toggle" @click="toggleFiltersVisible">
          <span class="filter-icon">{{ filtersVisible ? '▼' : '▶' }}</span>
          <span class="filter-label">FILTERS</span>
          <span class="filter-count" v-if="hasActiveFilters">({{ activeFilterCount }})</span>
        </div>
        
        <div class="filter-options" v-if="filtersVisible">
          <!-- Filter by affordability -->
          <button 
            class="filter-button" 
            :class="{ active: filters.onlyAffordable }" 
            @click="toggleFilter('onlyAffordable')">
            AFFORDABLE
          </button>
          
          <!-- Filter by max level -->
          <button 
            class="filter-button" 
            :class="{ active: filters.onlyMaxLevel }" 
            @click="toggleFilter('onlyMaxLevel')">
            MAX LEVEL
          </button>
          
          <!-- Type filters -->
          <div class="filter-group">
            <span class="filter-group-label">TYPES:</span>
            <div class="filter-buttons">
              <button 
                class="filter-button type-click" 
                :class="{ active: filters.types.click }" 
                @click="toggleTypeFilter('click')">
                CLICK+
              </button>
              <button 
                class="filter-button type-multiplier" 
                :class="{ active: filters.types.clickMulti }" 
                @click="toggleTypeFilter('clickMulti')">
                MULTI×
              </button>
              <button 
                class="filter-button type-automation" 
                :class="{ active: filters.types.clickAuto }" 
                @click="toggleTypeFilter('clickAuto')">
                AUTO
              </button>
              <button 
                class="filter-button type-critical" 
                :class="{ active: filters.types.clickCrit }" 
                @click="toggleTypeFilter('clickCrit')">
                CRIT%
              </button>
              <button 
                class="filter-button type-multiplier" 
                :class="{ active: filters.types.clickCritMult }" 
                @click="toggleTypeFilter('clickCritMult')">
                CRIT×
              </button>
              <button 
                class="filter-button type-rate" 
                :class="{ active: filters.types.rate }" 
                @click="toggleTypeFilter('rate')">
                RATE+
              </button>
              <button 
                class="filter-button type-multiplier" 
                :class="{ active: filters.types.rateMulti }" 
                @click="toggleTypeFilter('rateMulti')">
                RATE×
              </button>
            </div>
          </div>
          
          <!-- Reset filters -->
          <button 
            class="filter-button reset-button" 
            @click="resetFilters"
            :disabled="!hasActiveFilters">
            RESET ALL
          </button>
        </div>
      </div>
    </div>

    <div class="upgrades-list">
      <div v-for="upgrade in filteredUpgrades" :key="upgrade.id" class="upgrade-item"
        :class="{ 
          'affordable': canAffordUpgrade(upgrade) && !isMaxLevel(upgrade),
          'max-level': isMaxLevel(upgrade)
        }">
        <div class="upgrade-info">
          <h3>{{ upgrade.name }} <span class="level-badge">LVL {{ upgrade.level }}</span></h3>
          <p>{{ upgrade.description }}</p>
          <span class="upgrade-type" :class="getTypeClass(upgrade.type)">
            {{ getTypeLabel(upgrade.type) }}
          </span>
        </div>
        <button :disabled="!canAffordUpgrade(upgrade) || isMaxLevel(upgrade)" class="retro-button" @click="$emit('purchase', upgrade.id)">
          <template v-if="isMaxLevel(upgrade)">
            <span class="max-text">MAX</span>
          </template>
          <template v-else>
            <span class="price">{{ formatNumber(calculateUpgradeCost(upgrade)) }}</span>
            <span class="buy-text">BUY</span>
          </template>
        </button>
      </div>
      
      <!-- No results message -->
      <div v-if="filteredUpgrades.length === 0" class="no-results">
        <p>NO MATCHING UPGRADES FOUND</p>
        <button class="filter-button reset-button" @click="resetFilters">RESET FILTERS</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatNumber, gte } from '../../utils/numbers'
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

// Filter state
const filtersVisible = ref(false)
const filters = ref({
  onlyAffordable: false,
  onlyMaxLevel: false,
  types: {
    click: false,
    clickMulti: false,
    clickAuto: false,
    clickCrit: false, 
    clickCritMult: false,
    rate: false,
    rateMulti: false
  }
})

// Toggle filter visibility
const toggleFiltersVisible = () => {
  filtersVisible.value = !filtersVisible.value
}

// Toggle individual filters
const toggleFilter = (filterName) => {
  filters.value[filterName] = !filters.value[filterName]
}

// Toggle type filters
const toggleTypeFilter = (typeFilter) => {
  filters.value.types[typeFilter] = !filters.value.types[typeFilter]
}

// Reset all filters
const resetFilters = () => {
  filters.value.onlyAffordable = false
  filters.value.onlyMaxLevel = false
  Object.keys(filters.value.types).forEach(key => {
    filters.value.types[key] = false
  })
}

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return filters.value.onlyAffordable || 
    filters.value.onlyMaxLevel || 
    Object.values(filters.value.types).some(value => value)
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.onlyAffordable) count++
  if (filters.value.onlyMaxLevel) count++
  Object.values(filters.value.types).forEach(value => {
    if (value) count++
  })
  return count
})

// Map type filters to actual upgrade types
const typeFilterMap = {
  click: ['click'],
  clickMulti: ['click_multiplier'],
  clickAuto: ['click_automation'],
  clickCrit: ['click_critical'],
  clickCritMult: ['click_critical_multiplier'],
  rate: ['rate'],
  rateMulti: ['rate_multiplier']
}

// Get filtered upgrades
const filteredUpgrades = computed(() => {
  // Start with all upgrades
  let result = [...props.upgrades]
  
  // Apply "affordable" filter if enabled
  if (filters.value.onlyAffordable) {
    result = result.filter(upgrade => canAffordUpgrade(upgrade))
  }
  
  // Apply "max level" filter if enabled
  if (filters.value.onlyMaxLevel) {
    result = result.filter(upgrade => isMaxLevel(upgrade))
  }
  
  // Apply type filters if any are selected
  const activeTypeFilters = Object.entries(filters.value.types)
    .filter(([_, isActive]) => isActive)
    .map(([filterName]) => filterName)
  
  if (activeTypeFilters.length > 0) {
    // Get all upgrade types to include
    const includedTypes = activeTypeFilters.flatMap(filter => typeFilterMap[filter])
    result = result.filter(upgrade => includedTypes.includes(upgrade.type))
  }
  
  return result
})

// Check if the player can afford an upgrade
const canAffordUpgrade = (upgrade) => {
  const cost = calculateUpgradeCost(upgrade)
  return gte(props.pixels, cost)
}

// Check if an upgrade is at maximum level
const isMaxLevel = (upgrade) => {
  return upgrade.maxLevel !== undefined && upgrade.level >= upgrade.maxLevel
}

// Get the CSS class for an upgrade type
const getTypeClass = (type) => {
  const typeClasses = {
    'rate': 'type-rate',
    'rate_multiplier': 'type-multiplier',
    'rate_autobuy': 'type-autobuy',
    'click': 'type-click',
    'click_multiplier': 'type-multiplier',
    'click_automation': 'type-automation',
    'click_autobuy': 'type-autobuy',
    'click_critical': 'type-critical',
    'click_critical_multiplier': 'type-multiplier'
  }
  
  return typeClasses[type] || 'type-default'
}

// Get the display label for an upgrade type
const getTypeLabel = (type) => {
  const typeLabels = {
    'rate': 'SPEED+',
    'rate_multiplier': 'MULTIx',
    'rate_autobuy': 'AUTO BUY',
    'click': 'CLICK+',
    'click_multiplier': 'CLICK MULTIx',
    'click_automation': 'AUTO CLICK',
    'click_autobuy': 'CLICK AUTO BUY',
    'click_critical': 'CLICK CRIT%+',
    'click_critical_multiplier': 'CLICK CRIT MULTIx'
  }
  
  return typeLabels[type] || type.toUpperCase()
}

defineEmits(['purchase'])
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.upgrades-panel {
  height: 100%;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
}

/* Filter controls styling */
.filter-controls {
  margin-bottom: 1rem;
  border: 1px solid var(--button-border);
  background-color: rgba(30, 30, 30, 0.9);
  border-radius: 4px;
}

.filter-section {
  padding: 0.5rem;
}

.filter-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  user-select: none;
}

.filter-icon {
  color: var(--secondary);
  margin-right: 0.5rem;
  font-size: 0.8rem;
  width: 1rem;
  text-align: center;
}

.filter-label {
  font-family: var(--font-display);
  font-size: 0.9rem;
  color: var(--secondary);
}

.filter-count {
  margin-left: 0.5rem;
  font-size: 0.8rem;
  color: var(--warning);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-top: 1px solid var(--button-border);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group-label {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.filter-button {
  background-color: var(--button-bg);
  border: 1px solid var(--button-border);
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 0.7rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 3px;
}

.filter-button:hover {
  border-color: var(--secondary);
  color: var(--secondary);
}

.filter-button.active {
  background-color: var(--secondary);
  color: black;
  border-color: var(--secondary);
}

.filter-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-button.reset-button {
  margin-top: 0.5rem;
  color: var(--warning);
  border-color: var(--warning);
  align-self: flex-end;
}

.filter-button.reset-button:hover:not(:disabled) {
  background-color: var(--warning);
  color: black;
}

/* Apply type-specific colors to filter buttons */
.filter-button.type-click {
  border-color: var(--type-click);
}

.filter-button.type-click.active {
  background-color: var(--type-click);
}

.filter-button.type-multiplier {
  border-color: var(--type-multiplier);
}

.filter-button.type-multiplier.active {
  background-color: var (--type-multiplier);
}

.filter-button.type-automation {
  border-color: var(--type-automation);
}

.filter-button.type-automation.active {
  background-color: var(--type-automation);
}

.filter-button.type-critical {
  border-color: var(--type-critical);
}

.filter-button.type-critical.active {
  background-color: var(--type-critical);
}

.filter-button.type-rate {
  border-color: var(--type-rate);
}

.filter-button.type-rate.active {
  background-color: var(--type-rate);
}

/* No results message */
.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* Existing styles */
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
}

.upgrade-item.affordable:hover {
  background-color: rgba(51, 255, 51, 0.1);
  box-shadow: 0 0 20px rgba(51, 255, 51, 0.5);
  transform: scale(1.05);
}

.upgrade-item.max-level {
  border-color: var(--warning);
  box-shadow: 0 0 10px rgba(255, 204, 51, 0.3);
  cursor: not-allowed;
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
  background-color: var(--type-rate);
}

.type-multiplier {
  background-color: var(--type-multiplier);
}

.type-click {
  background-color: var(--type-click);
}

.type-automation {
  background-color: var(--type-automation);
}

.type-autobuy {
  background-color: var(--type-autobuy);
}

.type-critical {
  background-color: var(--type-critical);
}

.type-default {
  background-color: var(--type-default);
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

.max-text {
  color: var(--warning);
  font-family: var(--font-display);
  font-size: 1rem;
  letter-spacing: 1px;
}

button:disabled {
  cursor: not-allowed;
}
</style>