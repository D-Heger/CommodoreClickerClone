<template>
  <div class="settings-panel crt-panel">
    <h2 class="retro-title">SETTINGS</h2>

    <div class="settings-list">
      <div class="settings-section">
        <h3 class="section-title">GAME DATA</h3>
        <div class="settings-buttons">
          <button class="retro-button">
            <span class="action-text">SAVE GAME</span>
          </button>
          <button class="retro-button">
            <span class="action-text">LOAD GAME</span>
          </button>
          <button class="retro-button warning">
            <span class="action-text">DELETE SAVE</span>
          </button>
          <button class="retro-button danger">
            <span class="action-text">HARD RESET</span>
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">DISPLAY</h3>
        <div class="setting-item">
          <span class="setting-label">THEME</span>
          <div class="setting-control">
            <button class="option-button selected">C64</button>
            <button class="option-button">AMIGA</button>
            <button class="option-button">ZX</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">AUDIO</h3>
        <div class="setting-item">
          <span class="setting-label">SOUND FX</span>
          <div class="setting-control">
            <button class="option-button selected">ON</button>
            <button class="option-button">OFF</button>
          </div>
        </div>
        <div class="setting-item">
          <span class="setting-label">MUSIC</span>
          <div class="setting-control">
            <button class="option-button selected">ON</button>
            <button class="option-button">OFF</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">LANGUAGE</h3>
        <div class="setting-item">
          <span class="setting-label">LANGUAGE</span>
          <div class="setting-control">
            <button class="option-button selected">ENGLISH</button>
            <button class="option-button">DEUTSCH</button>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">ABOUT</h3>
        <p class="about-text">
          Commodore Pixel Renderer v0.0.1<br>
          A retro-style incremental game
          <br>
          By <a href="https://github.com/D-Heger" target="_blank">D-Heger 🔗</a>
          <br>
          <a href="https://github.com/D-Heger/Commodore-Pixel-Renderer" target="_blank">View on GitHub 🔗</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Settings functionality will be implemented later
</script>

<style scoped>
.settings-panel {
  height: 100%;
  padding: 1.5rem 1rem;
  border-right: var(--panel-border);
  overflow: scroll;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 200px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 2px solid var(--button-border);
  background-color: rgba(20, 20, 20, 0.8);
  position: relative;
  overflow: hidden;
}

.settings-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent 0%, rgba(51, 255, 51, 0.05) 50%, transparent 100%);
  z-index: 0;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1rem;
  margin: 0;
  color: var(--text-primary);
  border-bottom: 1px solid var(--text-primary);
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 1;
}

.settings-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1;
}

.settings-button {
  /* composes: retro-button; */
  text-align: center;
}

.warning {
  color: var(--warning);
}

.danger {
  color: var(--danger);
}

.action-text {
  font-family: var(--font-mono);
  font-size: 1.1rem;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1;
  margin-bottom: 0.8rem;
}

.setting-label {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.setting-control {
  display: flex;
  gap: 0.5rem;
}

.option-button {
  padding: 0.4rem 0.6rem;
  background-color: var(--button-bg);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  border: 1px solid var(--button-border);
  cursor: pointer;
  flex: 1;
  text-align: center;
}

.option-button.selected {
  background-color: var(--primary);
  color: #000;
  border-color: var(--primary);
}

.about-text {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--text-secondary);
  text-align: center;
  z-index: 1;
}

.about-text a {
  color: var(--primary);
}
</style>