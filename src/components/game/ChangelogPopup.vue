<template>
  <div v-if="show" class="changelog-overlay">
    <div class="changelog-popup crt-panel">
      <h2 class="retro-title">CHANGELOG</h2>
      <div class="changelog-content">
        <div v-if="!showFullChangelog">
          <h3>Latest Changes (v{{ latestVersion }})</h3>
          <div v-for="(section, type) in latestChanges" :key="type" class="changelog-section">
            <h4>{{ type }}</h4>
            <ul>
              <li v-for="change in section" :key="change">{{ change }}</li>
            </ul>
          </div>
        </div>
        <div v-else v-html="parsedFullChangelog" class="full-changelog"></div>
      </div>
      <div class="changelog-actions">
        <button class="retro-button" @click="toggleFullChangelog">
          {{ showFullChangelog ? 'SHOW LATEST' : 'VIEW FULL CHANGELOG' }}
        </button>
        <button class="retro-button" @click="close">CLOSE</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  changelog: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])
const showFullChangelog = ref(false)

const parsedFullChangelog = computed(() => {
  return marked(props.changelog)
})

const latestVersion = computed(() => {
  // Skip "Unreleased" and find the first version number
  const lines = props.changelog.split('\n')
  for (const line of lines) {
    if (line.startsWith('## ') && !line.includes('Unreleased')) {
      const versionMatch = line.match(/## ([\d.]+)/)
      if (versionMatch) {
        return versionMatch[1]
      }
    }
  }
  return 'Unknown'
})

const latestChanges = computed(() => {
  const sections = {}
  let inCurrentVersion = false
  let currentType = null
  let latestVersionFound = false
  
  const lines = props.changelog.split('\n')
  
  for (const line of lines) {
    // Start capturing at first version after Unreleased
    if (line.startsWith('## ') && !line.includes('Unreleased')) {
      if (!latestVersionFound) {
        latestVersionFound = true
        inCurrentVersion = true
        continue
      } else {
        // Stop when we hit the next version
        break
      }
    }
    
    if (inCurrentVersion) {
      if (line.startsWith('### ')) {
        currentType = line.slice(4).trim()
        sections[currentType] = []
      } else if (line.startsWith('- ') && currentType && sections[currentType]) {
        sections[currentType].push(line.slice(2).trim())
      }
    }
  }
  
  return sections
})

const toggleFullChangelog = () => {
  showFullChangelog.value = !showFullChangelog.value
}

const close = () => {
  emit('close')
  showFullChangelog.value = false
}
</script>

<style scoped>
.changelog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.changelog-popup {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  padding: 2rem;
  border: var(--panel-border);
}

.changelog-content {
  margin: 1.5rem 0;
  max-height: calc(80vh - 200px);
  overflow-y: auto;
  font-family: var(--font-mono);
  color: var(--text-secondary);
}

.changelog-section {
  margin-bottom: 1.5rem;
}

.changelog-section h4 {
  color: var(--primary);
  margin-bottom: 0.5rem;
}

.changelog-section ul {
  list-style-type: none;
  padding-left: 1rem;
}

.changelog-section li {
  margin-bottom: 0.3rem;
}

.changelog-section li::before {
  content: '>';
  color: var(--primary);
  margin-right: 0.5rem;
}

.changelog-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.full-changelog :deep(h1),
.full-changelog :deep(h2),
.full-changelog :deep(h3) {
  color: var(--primary);
  margin: 1rem 0;
}

.full-changelog :deep(ul) {
  list-style-type: none;
  padding-left: 1rem;
}

.full-changelog :deep(li) {
  margin-bottom: 0.3rem;
}

.full-changelog :deep(li::before) {
  content: '>';
  color: var(--primary);
  margin-right: 0.5rem;
}

.full-changelog :deep(a) {
  color: var(--secondary);
}
</style>