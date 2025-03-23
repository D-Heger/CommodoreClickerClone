<template>
  <div class="pixel-canvas">
    <canvas ref="canvas" :width="400" :height="300"></canvas>
    <div class="progress">
      {{ renderedPixels }}/{{ totalPixels }} pixels rendered
      <span v-if="completedCanvases > 0" class="canvas-count">
        (Frame #{{ completedCanvases + 1 }}, Total: {{ totalRenderedPixels }})
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { toDecimal } from '../../utils/numbers'

// Canvas state
const canvas = ref(null)
const ctx = ref(null)
const imageData = ref(null)
const renderedPixels = ref(0)
const totalPixels = ref(0)
const hueShift = ref(0)
const isComplete = ref(false)
const completedCanvases = ref(0)
const totalRenderedPixels = ref(0)

// Animation IDs for cleanup
const cursorAnimationId = ref(null)
const cycleAnimationId = ref(null)

const props = defineProps({
  availablePixels: {
    type: String,
    required: true
  },
  spentPixels: {
    type: String,
    default: '0'
  }
})

// Pattern generation utilities
const hslToRgb = (h, s, l) => {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round)
}

const createCheckerPattern = (width, height, hueOffset = 0) => {
  const pattern = new Uint8ClampedArray(width * height * 4)
  const tileSize = 8
  let pixelIndex = 0
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const isEvenTile = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0
      const hue = (isEvenTile ? 0 : 15) + hueOffset
      const saturation = 30
      const lightness = isEvenTile ? 90 : 80
      const [r, g, b] = hslToRgb(hue % 360, saturation, lightness)
      
      pattern[pixelIndex] = r
      pattern[pixelIndex + 1] = g
      pattern[pixelIndex + 2] = b
      pattern[pixelIndex + 3] = 255
      
      pixelIndex += 4
    }
  }
  return pattern
}

// Canvas rendering functions
const initializeCanvas = () => {
  if (!canvas.value) return
  
  ctx.value = canvas.value.getContext('2d')
  const { width, height } = canvas.value
  
  imageData.value = ctx.value.createImageData(width, height)
  const pattern = createCheckerPattern(width, height)
  totalPixels.value = (width * height)
  
  // Initialize with black pixels
  for (let i = 0; i < pattern.length; i += 4) {
    imageData.value.data[i] = 0
    imageData.value.data[i + 1] = 0
    imageData.value.data[i + 2] = 0
    imageData.value.data[i + 3] = 255
  }
  
  imageData.value.pattern = pattern
  updateCanvas()
}

const drawCursor = () => {
  if (!ctx.value || !canvas.value) return
  
  const { width } = canvas.value
  const currentY = Math.floor(renderedPixels.value / width)
  const currentX = renderedPixels.value % width
  
  ctx.value.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--secondary').trim()
  ctx.value.lineWidth = 2
  
  if (Math.floor(Date.now() / 500) % 2 === 0) {
    ctx.value.strokeRect(currentX, currentY, 1, 1)
  }
}

const renderPixels = (totalAvailable) => {
  if (!imageData.value || !canvas.value) return
  
  const canvasTotal = canvas.value.width * canvas.value.height
  
  // Calculate how many complete canvases we have rendered
  const newCompletedCanvases = Math.floor(totalAvailable / canvasTotal)
  
  // Calculate pixels to render in the current canvas
  const pixelsInCurrentCanvas = totalAvailable % canvasTotal
  
  // If we've completed a new canvas, update the hue shift more dramatically
  if (newCompletedCanvases > completedCanvases.value) {
    // For each new completed canvas, use a more noticeable hue shift
    hueShift.value = (newCompletedCanvases * 60) % 360
    completedCanvases.value = newCompletedCanvases
    isComplete.value = false
  }
  
  // Update the total rendered pixels
  totalRenderedPixels.value = totalAvailable
  
  // Apply current pattern
  const currentPattern = createCheckerPattern(
    canvas.value.width, 
    canvas.value.height, 
    hueShift.value
  )
  
  // Fill the entire canvas with the new colored pattern
  for (let i = 0; i < imageData.value.data.length; i += 4) {
    imageData.value.data[i] = currentPattern[i]
    imageData.value.data[i + 1] = currentPattern[i + 1]
    imageData.value.data[i + 2] = currentPattern[i + 2]
    // Alpha channel stays at 255
  }
  
  // Then blank out the unrendered pixels by setting RGB values to 0 (keeping alpha at 255)
  for (let i = pixelsInCurrentCanvas * 4; i < imageData.value.data.length; i += 4) {
    imageData.value.data[i] = 0
    imageData.value.data[i + 1] = 0
    imageData.value.data[i + 2] = 0
    // Alpha channel stays at 255
  }
  
  // Update rendered pixels for the current canvas
  renderedPixels.value = pixelsInCurrentCanvas
  
  // Check if the current canvas is complete
  const wasComplete = isComplete.value
  isComplete.value = pixelsInCurrentCanvas >= canvasTotal
  
  if (!wasComplete && isComplete.value) {
    startColorCycle()
  } else if (wasComplete && !isComplete.value) {
    // If we were previously complete but now starting a new canvas
    // Cancel the color cycle animation
    if (cycleAnimationId.value) {
      cancelAnimationFrame(cycleAnimationId.value)
      cycleAnimationId.value = null
    }
  }
  
  updateCanvas()
}

const updateCanvas = () => {
  if (!ctx.value || !imageData.value) return
  ctx.value.putImageData(imageData.value, 0, 0)
  drawCursor()
}

// Animation handlers
const animate = () => {
  updateCanvas()
  cursorAnimationId.value = requestAnimationFrame(animate)
}

const startColorCycle = () => {
  const cyclePalette = () => {
    if (!isComplete.value) return
    
    hueShift.value = (hueShift.value + 0.5) % 360
    const newPattern = createCheckerPattern(
      canvas.value.width,
      canvas.value.height,
      hueShift.value
    )
    
    for (let i = 0; i < imageData.value.data.length; i += 4) {
      imageData.value.data[i] = newPattern[i]
      imageData.value.data[i + 1] = newPattern[i + 1]
      imageData.value.data[i + 2] = newPattern[i + 2]
    }
    
    updateCanvas()
    cycleAnimationId.value = requestAnimationFrame(cyclePalette)
  }
  
  cyclePalette()
}

// Watchers and lifecycle hooks
watch(() => props.availablePixels, (newValue) => {
  if (!newValue) return
  const availablePixels = parseInt(toDecimal(newValue).toString())
  renderPixels(availablePixels)
})

onMounted(() => {
  initializeCanvas()
  cursorAnimationId.value = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (cursorAnimationId.value) {
    cancelAnimationFrame(cursorAnimationId.value)
  }
  if (cycleAnimationId.value) {
    cancelAnimationFrame(cycleAnimationId.value)
  }
})
</script>

<style scoped>
.pixel-canvas {
  width: 400px;
  height: 300px;
  border: 2px solid var(--button-border);
  display: flex;
  flex-direction: column;
  align-items: center;
}

canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.progress {
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  color: var(--secondary);
}

.canvas-count {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-left: 0.5rem;
}
</style>