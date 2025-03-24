<template>
  <div class="game-container">
    <header>
      <h1 class="retro-title">
        Commodore Pixel Renderer
      </h1>
      <StatsDisplay :pixels="formattedPixels" :computer-speed="formattedSpeed" :click-power="formattedClickPower"
        :total-pixels="formattedTotalPixels" :spent-pixels="formattedSpentPixels" />
    </header>

    <main>
      <div class="settings-container crt-panel" :class="{ 'show': showSettingsPanel }">
        <SettingsPanel :save-slots="saveSlots" @open-changelog="openChangelog" @save="handleSave" @load="handleLoad"
          @delete="handleDelete" @export="handleExport" @import="handleImport" @reset="handleReset" />
      </div>

      <div class="content-area">
        <button class="side-panel-button settings-button" :class="{ 'panel-open': showSettingsPanel }"
          @click="toggleSettingsPanel">
          {{ showSettingsPanel ? '<' : '>' }} </button>

            <div class="render-area">
              <PixelCanvas :available-pixels="pixels" :spent-pixels="spentPixels" />
              <button class="render-button retro-button" @click="renderPixel">
                RENDER PIXEL
              </button>
            </div>

            <button class="side-panel-button upgrades-button" :class="{ 'panel-open': showUpgradesPanel }"
              @click="toggleUpgradesPanel">
              {{ showUpgradesPanel ? '>' : '<' }} </button>
      </div>

      <div class="upgrades-container crt-panel" :class="{ 'show': showUpgradesPanel }">
        <UpgradesPanel :pixels="pixels" :upgrades="upgrades" @purchase="purchaseUpgrade" />
      </div>
    </main>

    <ChangelogPopup :show="showChangelog" :changelog="changelogContent" @close="closeChangelog" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StatsDisplay from './components/game/StatsDisplay.vue'
import PixelCanvas from './components/game/PixelCanvas.vue'
import UpgradesPanel from './components/game/UpgradesPanel.vue'
import SettingsPanel from './components/game/SettingsPanel.vue'
import ChangelogPopup from './components/game/ChangelogPopup.vue'
import { toDecimal, formatNumber, add, multiply } from './utils/numbers'
import {
  loadUpgrades,
  purchaseUpgrade as buyUpgrade,
  calculateTotalPixelGeneration,
  calculateClickPower
} from './utils/upgradeManager'
import {
  saveToSlot,
  loadFromSlot,
  deleteSaveSlot,
  exportSave,
  importSave,
  resetAllData
} from './utils/saveManager'
import upgradesData from './assets/upgrades.json'

// Game state
const pixels = ref('0')
const totalPixels = ref('0')
const spentPixels = ref('0')
const lastUpdate = ref(Date.now())
const upgrades = ref([])
const showUpgradesPanel = ref(false)
const showSettingsPanel = ref(false)
const showChangelog = ref(false)
const changelogContent = ref('')

// Save system state
const saveSlots = ref([])

// Initialize save slots
const initializeSaveSlots = () => {
  // Create array of slots 1-5 with null data for empty slots
  saveSlots.value = Array.from({ length: 5 }, (_, i) => {
    const slot = i + 1;
    try {
      const saveData = loadFromSlot(slot);
      return {
        slot,
        data: saveData ? {
          timestamp: saveData.timestamp,
          pixels: saveData.pixels,
          completedFrames: saveData.completedFrames
        } : null
      };
    } catch {
      return { slot, data: null };
    }
  });
}

// Save handlers
const handleSave = async (slot) => {
  try {
    const gameState = {
      pixels: pixels.value,
      totalPixels: totalPixels.value,
      spentPixels: spentPixels.value,
      upgrades: upgrades.value,
      completedFrames: completedCanvases.value
    }

    await saveToSlot(slot, gameState)
    initializeSaveSlots() // Refresh slots display
  } catch (error) {
    console.error('Failed to save game:', error)
  }
}

const handleLoad = async (slot) => {
  try {
    const saveData = await loadFromSlot(slot)
    if (!saveData) return

    // Restore game state
    pixels.value = saveData.pixels
    totalPixels.value = saveData.totalPixels
    spentPixels.value = saveData.spentPixels

    // Restore upgrades
    upgrades.value = loadUpgrades(upgradesData)
    saveData.upgrades.forEach(savedUpgrade => {
      const upgrade = upgrades.value.find(u => u.id === savedUpgrade.id)
      if (upgrade) {
        upgrade.level = savedUpgrade.level
        upgrade.purchased = savedUpgrade.purchased
      }
    })

    // Update canvas state
    if (saveData.completedFrames) {
      completedCanvases.value = saveData.completedFrames
    }
  } catch (error) {
    console.error('Failed to load game:', error)
  }
}

const handleDelete = async (slot) => {
  try {
    await deleteSaveSlot(slot)
    initializeSaveSlots() // Refresh slots display
  } catch (error) {
    console.error('Failed to delete save:', error)
  }
}

const handleExport = () => {
  try {
    const gameState = {
      pixels: pixels.value,
      totalPixels: totalPixels.value,
      spentPixels: spentPixels.value,
      upgrades: upgrades.value,
      completedFrames: completedCanvases.value
    }
    exportSave(gameState)
  } catch (error) {
    console.error('Failed to export save:', error)
  }
}

const handleImport = async (file) => {
  try {
    const saveData = await importSave(file)
    // Use same logic as load, but with imported data
    pixels.value = saveData.pixels
    totalPixels.value = saveData.totalPixels
    spentPixels.value = saveData.spentPixels

    upgrades.value = loadUpgrades(upgradesData)
    saveData.upgrades.forEach(savedUpgrade => {
      const upgrade = upgrades.value.find(u => u.id === savedUpgrade.id)
      if (upgrade) {
        upgrade.level = savedUpgrade.level
        upgrade.purchased = savedUpgrade.purchased
      }
    })

    if (saveData.completedFrames) {
      completedCanvases.value = saveData.completedFrames
    }
  } catch (error) {
    console.error('Failed to import save:', error)
  }
}

const handleReset = () => {
  try {
    // Reset all game state
    pixels.value = '0'
    totalPixels.value = '0'
    spentPixels.value = '0'
    upgrades.value = loadUpgrades(upgradesData)
    completedCanvases.value = 0

    // Clear all saves
    resetAllData()
    initializeSaveSlots()
  } catch (error) {
    console.error('Failed to reset game:', error)
  }
}

// Add completedCanvases ref for tracking completed frames
const completedCanvases = ref(0)

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

const closeChangelog = () => {
  showChangelog.value = false
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

// Load changelog
const loadChangelog = async () => {
  try {
    // Try to fetch the changelog
    const response = await fetch('/CHANGELOG.md')
    if (!response.ok) {
      throw new Error('Failed to load changelog')
    }
    changelogContent.value = await response.text()
    // Only show if we successfully loaded content
    if (changelogContent.value) {
      showChangelog.value = true
    }
  } catch (error) {
    console.error('Failed to load changelog:', error)
  }
}

// Changelog handling
const openChangelog = async () => {
  if (!changelogContent.value) {
    await loadChangelog()
  } else {
    showChangelog.value = true
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

// Autosave
const AUTOSAVE_INTERVAL = 60000 // 1 minute
let autosaveInterval = null

const autoSave = () => {
  // Use slot 1 for autosaves
  handleSave(1)
}

onMounted(() => {
  upgrades.value = loadUpgrades(upgradesData)
  lastUpdate.value = Date.now()
  animationFrameId = requestAnimationFrame(tick)
  loadChangelog() // Show changelog on initial load
  initializeSaveSlots() // Initialize save slots

  // Start autosave
  autosaveInterval = setInterval(autoSave, AUTOSAVE_INTERVAL)
})

onUnmounted(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  if (autosaveInterval !== null) {
    clearInterval(autosaveInterval)
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
  border-right: var(--panel-border);
}

.upgrades-container {
  right: -320px;
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.5);
  border-left: var(--panel-border);
}

.settings-container.show {
  left: 0;
}

.upgrades-container.show {
  right: 0;
}
</style>
