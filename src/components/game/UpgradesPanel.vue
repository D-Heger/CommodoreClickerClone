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
            :class="{
              'filter-show': filters.onlyAffordable === 'show',
              'filter-hide': filters.onlyAffordable === 'hide'
            }" 
            @click="toggleFilter('onlyAffordable')">
            <span class="filter-mode-indicator">
              {{ filters.onlyAffordable === 'show' ? '+' : filters.onlyAffordable === 'hide' ? '-' : '' }}
            </span>
            AFFORDABLE
          </button>
          
          <!-- Filter by max level -->
          <button 
            class="filter-button" 
            :class="{
              'filter-show': filters.onlyMaxLevel === 'show',
              'filter-hide': filters.onlyMaxLevel === 'hide'
            }" 
            @click="toggleFilter('onlyMaxLevel')">
            <span class="filter-mode-indicator">
              {{ filters.onlyMaxLevel === 'show' ? '+' : filters.onlyMaxLevel === 'hide' ? '-' : '' }}
            </span>
            MAX LEVEL
          </button>
          
          <!-- Type filters -->
          <div class="filter-group">
            <span class="filter-group-label">TYPES:</span>
            <div class="filter-buttons">
              <button 
                class="filter-button type-click" 
                :class="{
                  'filter-show': filters.types.click === 'show',
                  'filter-hide': filters.types.click === 'hide'
                }" 
                @click="toggleTypeFilter('click')">
                <span class="filter-mode-indicator">
                  {{ filters.types.click === 'show' ? '+' : filters.types.click === 'hide' ? '-' : '' }}
                </span>
                CLICK+
              </button>
              <button 
                class="filter-button type-multiplier" 
                :class="{
                  'filter-show': filters.types.clickMulti === 'show',
                  'filter-hide': filters.types.clickMulti === 'hide'
                }" 
                @click="toggleTypeFilter('clickMulti')">
                <span class="filter-mode-indicator">
                  {{ filters.types.clickMulti === 'show' ? '+' : filters.types.clickMulti === 'hide' ? '-' : '' }}
                </span>
                MULTI×
              </button>
              <button 
                class="filter-button type-automation" 
                :class="{
                  'filter-show': filters.types.clickAuto === 'show',
                  'filter-hide': filters.types.clickAuto === 'hide'
                }" 
                @click="toggleTypeFilter('clickAuto')">
                <span class="filter-mode-indicator">
                  {{ filters.types.clickAuto === 'show' ? '+' : filters.types.clickAuto === 'hide' ? '-' : '' }}
                </span>
                AUTO
              </button>
              <button 
                class="filter-button type-critical" 
                :class="{
                  'filter-show': filters.types.clickCrit === 'show',
                  'filter-hide': filters.types.clickCrit === 'hide'
                }" 
                @click="toggleTypeFilter('clickCrit')">
                <span class="filter-mode-indicator">
                  {{ filters.types.clickCrit === 'show' ? '+' : filters.types.clickCrit === 'hide' ? '-' : '' }}
                </span>
                CRIT%
              </button>
              <button 
                class="filter-button type-multiplier"
                :class="{
                  'filter-show': filters.types.clickCritMult === 'show',
                  'filter-hide': filters.types.clickCritMult === 'hide'
                }" 
                @click="toggleTypeFilter('clickCritMult')">
                <span class="filter-mode-indicator">
                  {{ filters.types.clickCritMult === 'show' ? '+' : filters.types.clickCritMult === 'hide' ? '-' : '' }}
                </span>
                CRIT×
              </button>
              <button 
                class="filter-button type-rate" 
                :class="{
                  'filter-show': filters.types.rate === 'show',
                  'filter-hide': filters.types.rate === 'hide'
                }" 
                @click="toggleTypeFilter('rate')">
                <span class="filter-mode-indicator">
                  {{ filters.types.rate === 'show' ? '+' : filters.types.rate === 'hide' ? '-' : '' }}
                </span>
                RATE+
              </button>
              <button 
                class="filter-button type-multiplier" 
                :class="{
                  'filter-show': filters.types.rateMulti === 'show',
                  'filter-hide': filters.types.rateMulti === 'hide'
                }" 
                @click="toggleTypeFilter('rateMulti')">
                <span class="filter-mode-indicator">
                  {{ filters.types.rateMulti === 'show' ? '+' : filters.types.rateMulti === 'hide' ? '-' : '' }}
                </span>
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
  onlyAffordable: 'off',  // 'off', 'show', 'hide'
  onlyMaxLevel: 'off',    // 'off', 'show', 'hide'
  types: {
    click: 'off',
    clickMulti: 'off',
    clickAuto: 'off',
    clickCrit: 'off', 
    clickCritMult: 'off',
    rate: 'off',
    rateMulti: 'off'
  }
})

// Toggle filter visibility
const toggleFiltersVisible = () => {
  filtersVisible.value = !filtersVisible.value
}

// Toggle individual filters - cycle through off -> show -> hide -> off
const toggleFilter = (filterName) => {
  const currentMode = filters.value[filterName]
  if (currentMode === 'off') {
    filters.value[filterName] = 'show'
  } else if (currentMode === 'show') {
    filters.value[filterName] = 'hide'
  } else {
    filters.value[filterName] = 'off'
  }
}

// Toggle type filters - cycle through off -> show -> hide -> off
const toggleTypeFilter = (typeFilter) => {
  const currentMode = filters.value.types[typeFilter]
  if (currentMode === 'off') {
    filters.value.types[typeFilter] = 'show'
  } else if (currentMode === 'show') {
    filters.value.types[typeFilter] = 'hide'
  } else {
    filters.value.types[typeFilter] = 'off'
  }
}

// Reset all filters
const resetFilters = () => {
  filters.value.onlyAffordable = 'off'
  filters.value.onlyMaxLevel = 'off'
  Object.keys(filters.value.types).forEach(key => {
    filters.value.types[key] = 'off'
  })
}

// Check if any filter is active
const hasActiveFilters = computed(() => {
  return filters.value.onlyAffordable !== 'off' || 
    filters.value.onlyMaxLevel !== 'off' || 
    Object.values(filters.value.types).some(value => value !== 'off')
})

// Count active filters
const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.onlyAffordable !== 'off') count++
  if (filters.value.onlyMaxLevel !== 'off') count++
  Object.values(filters.value.types).forEach(value => {
    if (value !== 'off') count++
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
  if (filters.value.onlyAffordable === 'show') {
    result = result.filter(upgrade => canAffordUpgrade(upgrade))
  } else if (filters.value.onlyAffordable === 'hide') {
    result = result.filter(upgrade => !canAffordUpgrade(upgrade))
  }
  
  // Apply "max level" filter if enabled
  if (filters.value.onlyMaxLevel === 'show') {
    result = result.filter(upgrade => isMaxLevel(upgrade))
  } else if (filters.value.onlyMaxLevel === 'hide') {
    result = result.filter(upgrade => !isMaxLevel(upgrade))
  }
  
  // Get all active type filters grouped by mode
  const showTypeFilters = Object.entries(filters.value.types)
    .filter(([_, mode]) => mode === 'show')
    .map(([filterName]) => filterName)
    
  const hideTypeFilters = Object.entries(filters.value.types)
    .filter(([_, mode]) => mode === 'hide')
    .map(([filterName]) => filterName)
  
  // Apply 'show' type filters if any are selected
  if (showTypeFilters.length > 0) {
    // Get all upgrade types to include
    const includedTypes = showTypeFilters.flatMap(filter => typeFilterMap[filter])
    result = result.filter(upgrade => includedTypes.includes(upgrade.type))
  }
  
  // Apply 'hide' type filters if any are selected
  if (hideTypeFilters.length > 0) {
    // Get all upgrade types to exclude
    const excludedTypes = hideTypeFilters.flatMap(filter => typeFilterMap[filter])
    result = result.filter(upgrade => !excludedTypes.includes(upgrade.type))
  }
  
  // Always sort upgrades by price from low to high regardless of filters
  result.sort((a, b) => {
    const costA = calculateUpgradeCost(a)
    const costB = calculateUpgradeCost(b)
    return parseFloat(costA) - parseFloat(costB)
  })
  
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
.upgrades-panel {
  height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Filter controls styling */
.filter-controls {
  padding: var(--space-md);
  background-color: var(--background-dark);
  border-bottom: 2px solid var(--button-border);
  position: sticky;
  top: 0;
  z-index: 5;
  transition: background-color var(--transition-speed-fast) ease;
}

.filter-section {
  padding: var(--space-xs);
}

.filter-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: var(--space-xs);
  user-select: none;
  transition: transform var(--transition-speed-fast) var(--transition-timing-smooth);
}

.filter-toggle:hover {
  transform: translateX(2px);
  color: var(--primary);
}

.filter-icon {
  color: var(--secondary);
  margin-right: 0.5rem;
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  width: 1rem;
  text-align: center;
  transition: transform var(--transition-speed-fast) var(--transition-timing-spring);
}

.filter-label {
  font-family: var(--font-display);
  font-size: clamp(0.8rem, 2vw, 0.9rem);
  color: var(--secondary);
}

.filter-count {
  margin-left: 0.5rem;
  font-size: clamp(0.7rem, 1.8vw, 0.8rem);
  color: var(--warning);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-top: 0.5rem;
  padding: var(--space-xs);
  border-top: 1px solid var(--button-border);
  animation: slide-down var(--transition-speed-fast) var(--transition-timing) forwards;
  transform-origin: top;
  overflow: hidden;
}

@keyframes slide-down {
  0% {
    opacity: 0;
    transform: scaleY(0);
  }
  100% {
    opacity: 1;
    transform: scaleY(1);
  }
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
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
}

.upgrade-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border: 2px solid var(--button-border);
  background-color: var(--panel-bg);
  transition: all 0.2s;
  position: relative;
  min-height: clamp(90px, 20vh, 120px);
  margin-bottom: var(--space-lg);
}

/* Using the common gradient from theme.css via panel-gradient class */
.upgrade-item {
  position: relative;
}

.upgrade-item.affordable {
  border-color: var(--primary);
  box-shadow: var(--shadow-light);
  transform: scale(1.02);
  transition: all 0.2s;
  cursor: pointer;
}

.upgrade-item.affordable:hover {
  background-color: rgba(51, 255, 51, 0.1);
  box-shadow: var(--shadow-medium);
  transform: scale(1.05);
}

.upgrade-item.max-level {
  border-color: var(--warning);
  box-shadow: 0 0 10px rgba(255, 204, 51, 0.3);
  cursor: not-allowed;
}

.upgrade-info {
  flex: 1;
  min-height: 0;
}

.upgrade-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: clamp(1rem, 3vw, 1.3rem);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.level-badge {
  background-color: var(--button-bg);
  color: var(--primary);
  padding: 0.1rem 0.4rem;
  font-size: 0.8rem;
  border: 1px solid var(--primary);
}

.upgrade-info p {
  margin: 0 0 0.7rem 0;
  color: var(--text-secondary);
  font-size: clamp(0.9rem, 2.5vw, 1rem);
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

.retro-button {
  margin-top: auto;
  width: 100%;
}

/* Mobile optimizations - using CSS variables for breakpoints */
@media (max-width: var(--breakpoint-small)) {
  .upgrades-panel {
    padding: 0.8rem 0.5rem;
  }

  .filter-buttons {
    gap: 0.2rem;
  }

  .filter-button {
    padding: 0.25rem 0.4rem;
    font-size: 0.65rem;
  }

  .upgrade-item {
    min-height: 90px;
  }

  .level-badge {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
  }

  .upgrade-type {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
}
</style>