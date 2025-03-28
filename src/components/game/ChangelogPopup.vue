<template>
  <div v-if="show" class="overlay">
    <div class="changelog-popup crt-panel">
      <h2 class="retro-title">
        CHANGELOG
      </h2>
      <div class="changelog-content">
        <div v-if="!showFullChangelog">
          <h3>Latest Changes (v{{ latestVersion }})</h3>
          <div v-for="(section, type) in latestChanges" :key="type" class="changelog-section">
            <h4>{{ type }}</h4>
            <ul>
              <li v-for="change in section" :key="change">
                {{ change }}
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="full-changelog" v-html="parsedFullChangelog" /> <!-- eslint-disable-line vue/no-v-html -->
      </div>
      <div class="changelog-actions">
        <button class="retro-button" @click="toggleFullChangelog">
          {{ showFullChangelog ? 'SHOW LATEST' : 'VIEW FULL CHANGELOG' }}
        </button>
        <button class="retro-button" @click="close">
          CLOSE
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

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
  const html = marked(props.changelog)
  return DOMPurify.sanitize(html)
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
.changelog-popup {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  padding: var(--space-lg);
  border: var(--panel-border);
  background-color: var(--panel-bg);
  position: relative;
  z-index: var(--z-popup);
  border-radius: 4px;
}

.changelog-content {
  margin: var(--space-md) 0;
  max-height: calc(80vh - 200px);
  overflow-y: auto;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  padding-right: var(--space-xs);
}

.changelog-section {
  margin-bottom: var(--space-md);
}

.changelog-section h4 {
  color: var(--primary);
  margin-bottom: var(--space-xs);
  font-family: var(--font-display);
  font-size: clamp(0.8rem, 2.2vw, 1rem);
}

.changelog-section ul {
  list-style-type: none;
  padding-left: var(--space-sm);
  margin: 0;
}

.changelog-section li {
  margin-bottom: var(--space-xs);
  position: relative;
}

.changelog-section li::before {
  content: '>';
  color: var(--primary);
  margin-right: var(--space-xs);
  position: absolute;
  left: -var(--space-sm);
}

.changelog-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

/* Styling for the rendered markdown content */
.full-changelog :deep(h1),
.full-changelog :deep(h2),
.full-changelog :deep(h3) {
  color: var(--primary);
  margin: var(--space-sm) 0;
  font-family: var(--font-display);
  font-size: clamp(1rem, 2.5vw, 1.3rem);
}

.full-changelog :deep(ul) {
  list-style-type: none;
  padding-left: var(--space-sm);
  margin: var(--space-xs) 0;
}

.full-changelog :deep(li) {
  margin-bottom: var(--space-xs);
  position: relative;
}

.full-changelog :deep(li::before) {
  content: '>';
  color: var(--primary);
  margin-right: var(--space-xs);
  position: absolute;
  left: -var(--space-sm);
}

.full-changelog :deep(a) {
  color: var(--secondary);
  text-decoration: none;
}

.full-changelog :deep(a:hover) {
  text-decoration: underline;
  color: var(--primary);
}

/* Mobile optimizations */
@media (max-width: var(--breakpoint-medium)) {
  .changelog-popup {
    padding: var(--space-md);
    max-height: 85vh;
  }
  
  .changelog-content {
    max-height: calc(85vh - 180px);
  }
  
  .changelog-actions {
    flex-direction: column;
    gap: var(--space-xs);
  }
}

@media (max-width: var(--breakpoint-small)) {
  .changelog-popup {
    padding: var(--space-sm);
    width: 95%;
    max-height: 90vh;
  }
  
  .changelog-content {
    max-height: calc(90vh - 160px);
    margin: var(--space-sm) 0;
  }
}
</style>