<template>
  <div class="game-container">
    <header>
      <h1 class="retro-title">Commodore Pixel Renderer</h1>
      <StatsDisplay :pixels="formattedPixels" :computerSpeed="formattedSpeed" :clickPower="formattedClickPower"
        :totalPixels="formattedTotalPixels" :spentPixels="formattedSpentPixels" />
    </header>

    <main>
      <div class="settings-container" :class="{ 'show': showSettingsPanel }">
        <SettingsPanel />
      </div>

      <div class="content-area">
        <button class="side-panel-button settings-button" @click="toggleSettingsPanel"
          :class="{ 'panel-open': showSettingsPanel }">
          {{ showSettingsPanel ? '<' : '>' }} </button>

            <div class="render-area">
              <PixelCanvas :availablePixels="pixels" :spentPixels="spentPixels" />
              <button class="render-button retro-button" @click="renderPixel">RENDER PIXEL</button>
            </div>

            <button class="side-panel-button upgrades-button" @click="toggleUpgradesPanel"
              :class="{ 'panel-open': showUpgradesPanel }">
              {{ showUpgradesPanel ? '>' : '<' }} </button>
      </div>

      <div class="upgrades-container" :class="{ 'show': showUpgradesPanel }">
        <UpgradesPanel :pixels="pixels" :upgrades="upgrades" @purchase="purchaseUpgrade" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StatsDisplay from './components/game/StatsDisplay.vue'
import PixelCanvas from './components/game/PixelCanvas.vue'
import UpgradesPanel from './components/game/UpgradesPanel.vue'
import SettingsPanel from './components/game/SettingsPanel.vue'
import { toDecimal, formatNumber, add, multiply } from './utils/numbers'
import { 
  loadUpgrades, 
  purchaseUpgrade as buyUpgrade, 
  calculateTotalPixelGeneration,
  calculateClickPower 
} from './utils/upgradeManager'
import upgradesData from './assets/upgrades.json'

// Game state
const pixels = ref('0')
const totalPixels = ref('0')
const spentPixels = ref('0')
const lastUpdate = ref(Date.now())
const upgrades = ref([])
const showUpgradesPanel = ref(false)
const showSettingsPanel = ref(false)

// Panel visibility toggles
const toggleUpgradesPanel = () => {
  showUpgradesPanel.value = !showUpgradesPanel.value
  if (showUpgradesPanel.value && showSettingsPanel.value) {
    showSettingsPanel.value = false
  }
}

const toggleSettingsPanel = () => {
  showSettingsPanel.value = !showSettingsPanel.value
  if (showSettingsPanel.value && showUpgradesPanel.value) {
    showUpgradesPanel.value = false
  }
}

// Computed properties
const computerSpeed = computed(() => calculateTotalPixelGeneration(upgrades.value))
const clickPower = computed(() => calculateClickPower(upgrades.value))
const formattedPixels = computed(() => formatNumber(pixels.value))
const formattedSpeed = computed(() => formatNumber(computerSpeed.value))
const formattedClickPower = computed(() => formatNumber(clickPower.value))
const formattedTotalPixels = computed(() => formatNumber(totalPixels.value))
const formattedSpentPixels = computed(() => formatNumber(spentPixels.value))

// Game mechanics
const renderPixel = () => {
  const pixelsToAdd = clickPower.value
  pixels.value = add(pixels.value, pixelsToAdd).toString()
  totalPixels.value = add(totalPixels.value, pixelsToAdd).toString()
}

const purchaseUpgrade = (upgradeId) => {
  const upgradeIndex = upgrades.value.findIndex(u => u.id === upgradeId)
  if (upgradeIndex === -1) return
  
  const upgrade = upgrades.value[upgradeIndex]
  const result = buyUpgrade(upgrade, pixels.value)
  
  if (result.success) {
    pixels.value = result.newPixelsTotal
    spentPixels.value = add(spentPixels.value, result.spentPixels).toString()
    upgrades.value = [...upgrades.value]
  }
}

// Automatic pixel generation
const updatePixels = () => {
  const now = Date.now()
  const deltaTime = (now - lastUpdate.value) / 1000
  lastUpdate.value = now

  if (toDecimal(computerSpeed.value).greaterThan(0)) {
    const pixelsToAdd = multiply(computerSpeed.value, deltaTime.toString())
    pixels.value = add(pixels.value, pixelsToAdd).toString()
    totalPixels.value = add(totalPixels.value, pixelsToAdd).toString()
  }
}

// Animation frame handling
let animationFrameId = null

const tick = () => {
  updatePixels()
  animationFrameId = requestAnimationFrame(tick)
}

onMounted(() => {
  upgrades.value = loadUpgrades(upgradesData)
  lastUpdate.value = Date.now()
  animationFrameId = requestAnimationFrame(tick)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.game-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: var(--font-mono);
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

main {
  display: flex;
  position: relative;
}

.content-area {
  flex: 1;
  position: relative;
}

.render-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.render-button {
  margin-top: 1rem;
  background-color: var(--secondary);
  color: white;
  border: 3px solid #333;
  box-shadow: 3px 3px 0px #222;
  font-size: 1.2em;
}

.render-button:hover {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0px #222;
}

.render-button:active {
  transform: translate(3px, 3px);
  box-shadow: none;
}

/* Side panel button base styles */
.side-panel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 80px;
  background-color: var(--button-bg);
  color: var(--secondary);
  border: 3px solid var(--secondary);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.side-panel-button:hover {
  background-color: #333;
}

/* Settings button specifics */
.settings-button {
  left: 0;
  transition-property: left, background-color;
}

.settings-button.panel-open {
  left: 300px;
}

/* Upgrades button specifics */
.upgrades-button {
  right: 0;
  transition-property: right, background-color;
}

.upgrades-button.panel-open {
  right: 300px;
}

/* Side panel containers */
.settings-container,
.upgrades-container {
  position: fixed;
  top: 0;
  width: 300px;
  height: 100vh;
  background-color: var(--background-dark);
  transition: 0.3s ease;
  padding: 60px 0;
  z-index: 5;
  overflow: hidden;
}

.settings-container {
  left: -320px;
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.5);
}

.upgrades-container {
  right: -320px;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.5);
}

.settings-container.show {
  left: 0;
}

.upgrades-container.show {
  right: 0;
}
</style>
