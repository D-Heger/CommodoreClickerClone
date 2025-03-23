<template>
  <div class="pixel-canvas">
    <canvas ref="canvas" :width="400" :height="300"></canvas>
    <div class="progress">{{ renderedPixels }}/{{ totalPixels }} pixels rendered</div>
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
      const lightness = isEvenTile ? 90 : 80
      const [r, g, b] = hslToRgb(hue % 360, 10, lightness)
      
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
  
  const total = canvas.value.width * canvas.value.height
  const pixelsToRender = Math.min(parseInt(totalAvailable), total)
  
  const wasComplete = isComplete.value
  isComplete.value = pixelsToRender >= total
  
  if (!wasComplete && isComplete.value) {
    startColorCycle()
  }
  
  // Reset canvas to black
  for (let i = 0; i < imageData.value.data.length; i += 4) {
    imageData.value.data[i] = 0
    imageData.value.data[i + 1] = 0
    imageData.value.data[i + 2] = 0
    imageData.value.data[i + 3] = 255
  }
  
  // Apply current pattern
  const currentPattern = createCheckerPattern(
    canvas.value.width, 
    canvas.value.height, 
    hueShift.value
  )
  
  for (let i = 0; i < pixelsToRender * 4; i += 4) {
    imageData.value.data[i] = currentPattern[i]
    imageData.value.data[i + 1] = currentPattern[i + 1]
    imageData.value.data[i + 2] = currentPattern[i + 2]
  }
  
  renderedPixels.value = pixelsToRender
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
    
    hueShift.value = (hueShift.value + 0.2) % 360
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
</style>