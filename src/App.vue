<template>
  <div class="game-container">
    <header>
      <h1 class="retro-title">
        Commodore Pixel Renderer
      </h1>
      <StatsDisplay 
        :pixels="formattedPixels" 
        :computer-speed="formattedSpeed" 
        :click-power="formattedClickPower"
        :total-pixels="formattedTotalPixels" 
        :spent-pixels="formattedSpentPixels"
        :click-multiplier="formattedClickMultiplier"
        :click-critical-chance="formattedClickCriticalChance"
        :click-crit-multiplier="formattedClickCritMultiplier"
        :auto-rate="formattedAutoRate" 
        :rate-multiplier="formattedRateMultiplier"
        :auto-clicks="formattedAutoClicks"
        :completed-frames="formattedCompletedFrames"
      />
    </header>

    <main>
      <div class="settings-container crt-panel" :class="{ 'show': showSettingsPanel }">
        <SettingsPanel 
          :save-slots="saveSlots" 
          :settings="settings"
          @open-changelog="openChangelog" 
          @save="handleSave" 
          @load="handleLoad"
          @delete="handleDelete" 
          @export="handleExport" 
          @import="handleImport" 
          @reset="handleReset"
          @update-settings="updateSettings" />
      </div>

      <div class="content-area" :class="{ 'left-panel-open': showSettingsPanel, 'right-panel-open': showUpgradesPanel }">
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
    <ConfirmationDialog :show="showConfirmation" :message="confirmationMessage" @confirm="handleConfirm"
      @cancel="cancelConfirmation" />
    <CriticalHitPopup 
      :show="showCriticalHit" 
      :multiplier="criticalMultiplier" 
      :hits="criticalHits"
      @hide="hideCriticalPopup" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StatsDisplay from './components/game/StatsDisplay.vue'
import PixelCanvas from './components/game/PixelCanvas.vue'
import UpgradesPanel from './components/game/UpgradesPanel.vue'
import SettingsPanel from './components/game/SettingsPanel.vue'
import ChangelogPopup from './components/game/ChangelogPopup.vue'
import ConfirmationDialog from './components/game/ConfirmationDialog.vue'
import CriticalHitPopup from './components/game/CriticalHitPopup.vue'
import { toDecimal, formatNumber, add, multiply } from './utils/numbers'
import {
  loadUpgrades,
  purchaseUpgrade as buyUpgrade,
  calculateTotalPixelGeneration,
  calculateTotalClickPower,
  applyClickWithCritical,
  calculateAutoClickRate,
  calculateClickPower,
  calculateClickMultiplier,
  calculateClickCriticalChance,
  calculateClickCriticalMultiplier,
  calculatePixelRate,
  calculatePixelMultiplier
} from './utils/upgradeManager'
import {
  saveToSlot,
  loadFromSlot,
  deleteSaveSlot,
  exportSave,
  importSave,
  resetAllData,
  findLatestSave
} from './utils/saveManager'
// Import the upgrades from the new modular structure
import upgradesData from './assets/upgrades'
import { validateSettings, DEFAULT_SETTINGS } from './utils/settingsConfig'
import { useConfirmation } from './utils/useConfirmation'

// Game state
const pixels = ref('0')
const totalPixels = ref('0')
const spentPixels = ref('0')
const lastUpdate = ref(Date.now())
const upgrades = ref([])
const settings = ref({ ...DEFAULT_SETTINGS })
const showUpgradesPanel = ref(false)
const showSettingsPanel = ref(false)
const showChangelog = ref(false)
const changelogContent = ref('')

// Time accumulator for auto-clicking
const autoClickAccumulator = ref(0)

// Critical hit state
const showCriticalHit = ref(false)
const criticalMultiplier = ref('1')
const criticalHits = ref(0)

// Function to handle critical hit popup
const hideCriticalPopup = () => {
  showCriticalHit.value = false
}

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
          completedFrames: saveData.completedFrames,
          settings: saveData.settings
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
      completedFrames: completedCanvases.value,
      settings: settings.value
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
    
    // Check save version compatibility based on semantic versioning
    if (saveData.compatibility === 'warning') {
      confirm(
        `WARNING: This save file (version ${saveData.version}) may not be fully compatible with the current game version. ` +
        `Minor version differences were detected, which might affect some game features. ` +
        `Loading it might cause unexpected behavior. Do you want to continue?`,
        () => applyLoadedSaveData(saveData)
      )
    } else if (saveData.compatibility === 'incompatible') {
      confirm(
        `CRITICAL WARNING: This save file (version ${saveData.version}) is NOT compatible with the current game version. ` +
        `Major version differences were detected, which indicates breaking changes. ` +
        `Loading it will likely cause data corruption or game errors. ` +
        `Do you still want to attempt loading this save?`,
        () => applyLoadedSaveData(saveData)
      )
    } else {
      // Compatible - load without warning
      applyLoadedSaveData(saveData)
    }
  } catch (error) {
    console.error('Failed to load game:', error)
  }
}

// Helper function to apply loaded save data
const applyLoadedSaveData = (saveData) => {
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

  // Restore settings
  if (saveData.settings) {
    settings.value = validateSettings(saveData.settings)
  }

  // Update canvas state
  if (saveData.completedFrames) {
    completedCanvases.value = saveData.completedFrames
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
      completedFrames: completedCanvases.value,
      settings: settings.value
    }
    exportSave(gameState)
  } catch (error) {
    console.error('Failed to export save:', error)
  }
}

const handleImport = async (file) => {
  try {
    const saveData = await importSave(file)
    
    // Check save version compatibility based on semantic versioning
    if (saveData.compatibility === 'warning') {
      confirm(
        `WARNING: This imported save file (version ${saveData.version}) may not be fully compatible with the current game version. ` +
        `Minor version differences were detected, which might affect some game features. ` +
        `Importing it might cause unexpected behavior. Do you want to continue?`,
        () => applyImportedSaveData(saveData)
      )
    } else if (saveData.compatibility === 'incompatible') {
      confirm(
        `CRITICAL WARNING: This imported save file (version ${saveData.version}) is NOT compatible with the current game version. ` +
        `Major version differences were detected, which indicates breaking changes. ` +
        `Importing it will likely cause data corruption or game errors. ` +
        `Do you still want to attempt importing this save?`,
        () => applyImportedSaveData(saveData)
      )
    } else {
      // Compatible - import without warning
      applyImportedSaveData(saveData)
    }
  } catch (error) {
    console.error('Failed to import save:', error)
  }
}

// Helper function to apply imported save data
const applyImportedSaveData = (saveData) => {
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

  // Restore settings from import
  if (saveData.settings) {
    settings.value = validateSettings(saveData.settings)
  }

  if (saveData.completedFrames) {
    completedCanvases.value = saveData.completedFrames
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
    settings.value = { ...DEFAULT_SETTINGS }

    // Clear all saves
    resetAllData()
    initializeSaveSlots()
  } catch (error) {
    console.error('Failed to reset game:', error)
  }
}

// Add completedCanvases ref for tracking completed frames
const completedCanvases = ref(0)

// Settings update handler
const updateSettings = (newSettings) => {
  settings.value = validateSettings(newSettings)
}

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
const clickPower = computed(() => calculateTotalClickPower(upgrades.value))
const autoClickAmount = computed(() => calculateAutoClickRate(upgrades.value))
const formattedPixels = computed(() => formatNumber(pixels.value))
const formattedSpeed = computed(() => formatNumber(computerSpeed.value))
const formattedClickPower = computed(() => formatNumber(clickPower.value))
const formattedTotalPixels = computed(() => formatNumber(totalPixels.value))
const formattedSpentPixels = computed(() => formatNumber(spentPixels.value))

// New computed properties for detailed stats
const rawClickPower = computed(() => calculateClickPower(upgrades.value))
const rawClickMultiplier = computed(() => calculateClickMultiplier(upgrades.value))
const clickCriticalChance = computed(() => calculateClickCriticalChance(upgrades.value))
const clickCritMultiplier = computed(() => calculateClickCriticalMultiplier(upgrades.value))
const rawAutoRate = computed(() => calculatePixelRate(upgrades.value))
const rawRateMultiplier = computed(() => calculatePixelMultiplier(upgrades.value))
const formattedClickMultiplier = computed(() => formatNumber(rawClickMultiplier.value))
const formattedClickCriticalChance = computed(() => {
  // Format as percentage with 2 decimal places
  const percentage = (parseFloat(clickCriticalChance.value) * 100).toFixed(2);
  return percentage;
})
const formattedClickCritMultiplier = computed(() => formatNumber(clickCritMultiplier.value))
const formattedAutoRate = computed(() => formatNumber(rawAutoRate.value))
const formattedRateMultiplier = computed(() => formatNumber(rawRateMultiplier.value))
const formattedAutoClicks = computed(() => formatNumber(autoClickAmount.value))
const formattedCompletedFrames = computed(() => formatNumber(completedCanvases.value.toString()))

// Game mechanics
const updatePixels = (pixelsToAdd) => {
  pixels.value = add(pixels.value, pixelsToAdd).toString()
  totalPixels.value = add(totalPixels.value, pixelsToAdd).toString()
}

const renderPixel = () => {
  const clickResult = applyClickWithCritical(upgrades.value)
  const pixelsToAdd = clickResult.clickPower

  updatePixels(pixelsToAdd)  

  // Show critical hit popup if applicable
  if (clickResult.critical.happened) {
    criticalMultiplier.value = clickResult.critical.multiplier
    criticalHits.value = clickResult.critical.hits
    showCriticalHit.value = true
  }
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
const autoGeneratePixels = (deltaTime) => {
  if (toDecimal(computerSpeed.value).greaterThan(0)) {
    const pixelsToAdd = multiply(computerSpeed.value, deltaTime.toString())
    updatePixels(pixelsToAdd)
  }
}

// Automatic clicking
// Uses an accumulator to perform discrete clicks at the specified rate
const autoClick = (deltaTime) => {
  if (toDecimal(autoClickAmount.value).greaterThan(0)) {
    // Add elapsed time to accumulator
    autoClickAccumulator.value += deltaTime
    
    // Calculate the time interval between clicks (in seconds)
    const clickInterval = 1 / parseFloat(autoClickAmount.value)
    
    // Perform clicks when enough time has accumulated
    while (autoClickAccumulator.value >= clickInterval) {
      // Subtract the click interval from the accumulator
      autoClickAccumulator.value -= clickInterval
      
      // Add a full click's worth of pixels
      updatePixels(clickPower.value)
    }
  }
}

// Animation frame handling
let animationFrameId = null

const tick = () => {
  const now = Date.now()
  const deltaTime = (now - lastUpdate.value) / 1000
  lastUpdate.value = now
  
  autoGeneratePixels(deltaTime)
  autoClick(deltaTime)
  
  animationFrameId = requestAnimationFrame(tick)
}

// Autosave
const AUTOSAVE_INTERVAL = 60000 // 1 minute
let autosaveInterval = null

const autoSave = () => {
  // Use slot 1 for autosaves
  handleSave(1)
}

// Autoload
const attemptAutoload = () => {
  const latestSave = findLatestSave();
  if (latestSave) {
    let message = `Would you like to load your latest save?\n\nSave from: ${new Date(latestSave.data.timestamp).toLocaleString()}\nPixels: ${formatNumber(latestSave.data.pixels)}\nCompleted Frames: ${latestSave.data.completedFrames}`;
    
    // Add version warning if needed based on compatibility level
    if (latestSave.data.compatibility === 'warning') {
      message += `\n\nWARNING: This save file (version ${latestSave.data.version}) may not be fully compatible with the current game version. Minor version differences were detected.`;
    } else if (latestSave.data.compatibility === 'incompatible') {
      message += `\n\nCRITICAL WARNING: This save file (version ${latestSave.data.version}) is NOT compatible with the current game version. Major version differences were detected which indicates breaking changes.`;
    }
    
    confirm(message, () => handleLoad(latestSave.slot));
  }
};

const {
  showConfirmation,
  confirmationMessage,
  confirm,
  handleConfirm,
  cancelConfirmation
} = useConfirmation();

onMounted(() => {
  upgrades.value = loadUpgrades(upgradesData)
  lastUpdate.value = Date.now()
  animationFrameId = requestAnimationFrame(tick)
  loadChangelog() // Show changelog on initial load
  initializeSaveSlots() // Initialize save slots
  attemptAutoload() // Attempt to load latest save

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
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: var(--font-mono);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

header {
  text-align: center;
  padding: clamp(0.3rem, 1.5vh, 0.8rem);
  position: relative;
  z-index: 15;
  max-width: min(800px, 95vw);
  margin: 0 auto;
}

header h1.retro-title {
  font-size: clamp(1.2rem, 3vw, 1.8rem);
  margin: 0 0 clamp(0.3rem, 1.5vh, 0.8rem) 0;
  padding: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

main {
  display: flex;
  position: relative;
  flex: 1;
  min-height: 0; /* Important for flex layout */
}

.content-area {
  flex: 1;
  position: relative;
  margin: 0 clamp(30px, 4vw, 50px);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 0; /* Important for flex layout */
  max-height: 100%;
  overflow: hidden;
}

.render-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.5rem, 2vh, 1rem);
  padding: clamp(1rem, 4vh, 2rem);
  max-width: min(800px, 90vw);
  max-height: 100%;
}

.content-area.left-panel-open {
  margin-left: clamp(320px, 25vw, 400px);
}

.content-area.right-panel-open {
  margin-right: clamp(320px, 25vw, 400px);
}

.side-panel-button {
  position: fixed;
  height: clamp(100px, 15vh, 150px);
  width: clamp(24px, 3vw, 36px);
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--button-bg);
  color: var(--secondary);
  border: 2px solid var(--secondary);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 1.5vw, 1.5rem);
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-button {
  left: 0;
  border-left: none;
  border-radius: 0 8px 8px 0;
}

.upgrades-button {
  right: 0;
  border-right: none;
  border-radius: 8px 0 0 8px;
}

.settings-button.panel-open {
  left: clamp(320px, 25vw, 400px);
}

.upgrades-button.panel-open {
  right: clamp(320px, 25vw, 400px);
}

.settings-container,
.upgrades-container {
  position: fixed;
  top: 0;
  height: 100vh;
  width: clamp(320px, 25vw, 400px);
  background-color: var(--background-dark);
  transition: transform 0.3s ease;
  z-index: 15;
  overflow-y: auto;
}

.settings-container {
  left: 0;
  transform: translateX(-100%);
  box-shadow: 3px 0 10px rgba(0, 0, 0, 0.5);
  border-right: var(--panel-border);
}

.upgrades-container {
  right: 0;
  transform: translateX(100%);
  box-shadow: -3px 0 10px rgba(0, 0, 0, 0.5);
  border-left: var(--panel-border);
}

.settings-container.show {
  transform: translateX(0);
}

.upgrades-container.show {
  transform: translateX(0);
}

/* Media Queries */
@media (max-width: 1024px) {
  .content-area.left-panel-open,
  .content-area.right-panel-open {
    margin: 0 clamp(30px, 4vw, 50px);
  }
  
  .settings-container,
  .upgrades-container {
    width: min(320px, 90vw);
  }
  
  .settings-button.panel-open {
    left: min(320px, 90vw);
  }
  
  .upgrades-button.panel-open {
    right: min(320px, 90vw);
  }

  .side-panel-button {
    height: clamp(80px, 12vh, 120px);
    width: clamp(20px, 2.5vw, 30px);
    font-size: clamp(0.9rem, 1.2vw, 1.2rem);
  }
}

@media (max-width: 480px) {
  .game-container {
    padding: 8px;
  }
  
  .content-area {
    margin: 0 25px;
  }
  
  .side-panel-button {
    height: 80px;
    width: 24px;
    font-size: 1rem;
  }
}
</style>
