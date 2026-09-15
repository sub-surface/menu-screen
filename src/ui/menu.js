// Retro PS2 & Y2K HUD Menu Overlay
// Handles DOM UI rendering, track selection, telemetry readouts, and visualizer VU meters

import { TRACKS, SCENES } from '../tracks.js';
import { player } from '../audio/player.js';
import { sfx } from '../audio/sfx.js';
import { gfx } from '../gfx/renderer.js';

export class RetroMenuUI {
  constructor(container) {
    this.container = container;
    this.selectedTrackIndex = 0;
    this.activeSceneIndex = 0;
    this.crtModes = ['OFF', 'AUTHENTIC 480i', 'CLEAN'];
    this.currentCrtModeIndex = 1; // Authentic 480i

    this.vuCanvas = null;
    this.vuCtx = null;

    this.init();
  }

  init() {
    this.renderDOM();
    this.bindEvents();
    this.initVUCanvas();

    // Listen to player updates
    player.onChange((state) => {
      this.updatePlaybackState(state);
    });
  }

  renderDOM() {
    this.container.innerHTML = `
      <div id="ps2-screen-frame" class="screen-frame mode-16-9">
        <!-- 3D Canvas Mount -->
        <div id="webgl-viewport"></div>

        <!-- Authenticity Scanline / Bezel Filter Overlay -->
        <div class="crt-overlay-bezel"></div>

        <!-- UI HUD Layer -->
        <div class="hud-layer">
          <!-- Top Telemetry Header -->
          <header class="hud-header">
            <div class="brand-badge">
              <span class="ps2-logo">PS<span class="two">2</span></span>
              <span class="subsurfaces-badge">SUBSURFACES // M0RVIDD</span>
            </div>

            <div class="era-selector" id="era-nav">
              ${SCENES.map((sc, i) => `
                <button class="era-btn ${i === 0 ? 'active' : ''}" data-scene="${sc.id}" data-index="${i}">
                  <span class="era-idx">[0${i + 1}]</span> ${sc.name}
                </button>
              `).join('')}
            </div>

            <div class="system-status">
              <span class="status-indicator live-pulse"></span>
              <span class="status-text" id="fps-counter">GS: 60 FPS</span>
              <span class="status-mem">[CARD 1: 7,420 KB]</span>
            </div>
          </header>

          <!-- Main Workspace -->
          <main class="hud-main">
            <!-- Left: Memory Card Tracklist -->
            <section class="tracklist-panel">
              <div class="panel-header">
                <span class="panel-tag">// CATALOG DIRECTORY</span>
                <span class="panel-info">SELECT AUDIO STEM</span>
              </div>
              <div class="tracklist-container" id="track-items">
                ${TRACKS.map((t, idx) => `
                  <div class="track-card ${idx === 0 ? 'selected' : ''}" data-index="${idx}">
                    <div class="track-cursor">▶</div>
                    <div class="track-meta">
                      <div class="track-title-row">
                        <span class="track-num">0${idx + 1}.</span>
                        <span class="track-title">${t.title}</span>
                      </div>
                      <div class="track-sub-row">
                        <span class="track-bpm">${t.bpm} BPM</span>
                        <span class="track-key">${t.key}</span>
                        <span class="track-blocks">${t.sizeKb} KB</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </section>

            <!-- Right: Dynamic Telemetry & Diagnostic Card -->
            <section class="telemetry-panel">
              <div class="panel-header">
                <span class="panel-tag" id="scene-era-tag">// SYSTEM BIOS ARCHIVE</span>
                <span class="panel-info" id="scene-subtitle">MEMORY VOID</span>
              </div>

              <div class="telemetry-card">
                <div class="card-header-row">
                  <div class="track-large-title" id="tel-title">${TRACKS[0].title}</div>
                  <div class="track-artist-tag" id="tel-artist">${TRACKS[0].artist}</div>
                </div>

                <div class="specs-grid">
                  <div class="spec-box">
                    <span class="spec-label">TEMPO</span>
                    <span class="spec-val" id="tel-bpm">${TRACKS[0].bpm} BPM</span>
                  </div>
                  <div class="spec-box">
                    <span class="spec-label">KEY / TONALITY</span>
                    <span class="spec-val" id="tel-key">${TRACKS[0].key}</span>
                  </div>
                  <div class="spec-box">
                    <span class="spec-label">LENGTH</span>
                    <span class="spec-val" id="tel-duration">${TRACKS[0].duration}</span>
                  </div>
                  <div class="spec-box">
                    <span class="spec-label">SECTOR</span>
                    <span class="spec-val" id="tel-sector">${TRACKS[0].sizeKb} KB</span>
                  </div>
                </div>

                <div class="notes-box">
                  <span class="notes-label">ACOUSTIC PROFILE // NOTES</span>
                  <p class="notes-text" id="tel-notes">${TRACKS[0].notes}</p>
                </div>

                <!-- Live Audio Visualizer VU Canvas -->
                <div class="vu-wrapper">
                  <div class="vu-label">
                    <span>AUDIO TELEMETRY SPECTRUM</span>
                    <span id="playback-indicator">STANDBY</span>
                  </div>
                  <canvas id="vu-meter" width="340" height="48"></canvas>
                </div>

                <!-- Primary Action Buttons -->
                <div class="actions-row">
                  <button class="retro-btn primary-btn" id="btn-play">
                    <span class="btn-icon">▶</span> <span id="play-text">PLAY TRACK</span>
                  </button>
                  <button class="retro-btn" id="btn-next">
                    <span>NEXT >></span>
                  </button>
                  <label class="retro-btn file-btn" title="Load custom audio file">
                    <span>+ LOAD AUDIO</span>
                    <input type="file" id="file-input" accept="audio/*" style="display:none;" />
                  </label>
                </div>
              </div>
            </section>
          </main>

          <!-- Bottom Footer: Controller Bar & Settings -->
          <footer class="hud-footer">
            <div class="controller-hints">
              <span class="hint-item"><kbd class="btn-cross">✕</kbd> <kbd>ENTER</kbd> SELECT</span>
              <span class="hint-item"><kbd class="btn-circle">○</kbd> <kbd>ESC</kbd> BACK</span>
              <span class="hint-item"><kbd class="btn-triangle">△</kbd> <kbd>C</kbd> CRT: <span id="crt-status">480i</span></span>
              <span class="hint-item"><kbd class="btn-square">□</kbd> <kbd>R</kbd> ASPECT: <span id="aspect-status">16:9</span></span>
              <span class="hint-item"><kbd>L1/R1</kbd> <kbd>1-4</kbd> ERA</span>
            </div>

            <div class="controls-right">
              <button class="util-btn" id="btn-crt-toggle">CRT SHADER</button>
              <button class="util-btn" id="btn-aspect-toggle">4:3 / 16:9</button>
              <button class="util-btn" id="btn-boot-sfx" title="Trigger PS2 Boot Sound">PS2 BOOT</button>
            </div>
          </footer>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 1. Era / Scene Navigation
    const eraNav = document.getElementById('era-nav');
    eraNav.addEventListener('click', (e) => {
      const btn = e.target.closest('.era-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.index, 10);
      this.selectScene(idx);
    });

    // 2. Tracklist Click Selection
    const trackContainer = document.getElementById('track-items');
    trackContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.track-card');
      if (!card) return;
      const idx = parseInt(card.dataset.index, 10);
      this.selectTrack(idx, true);
    });

    // 3. Play / Pause Button
    const playBtn = document.getElementById('btn-play');
    playBtn.addEventListener('click', () => {
      sfx.playConfirm();
      player.togglePlay();
    });

    // 4. Next Track Button
    const nextBtn = document.getElementById('btn-next');
    nextBtn.addEventListener('click', () => {
      sfx.playCursor();
      player.next();
    });

    // 5. CRT Toggle
    const crtBtn = document.getElementById('btn-crt-toggle');
    crtBtn.addEventListener('click', () => this.cycleCRTMode());

    // 6. Aspect Ratio Toggle
    const aspectBtn = document.getElementById('btn-aspect-toggle');
    aspectBtn.addEventListener('click', () => this.toggleAspectRatio());

    // 7. Boot SFX Button
    const bootBtn = document.getElementById('btn-boot-sfx');
    bootBtn.addEventListener('click', () => {
      sfx.playBootSequence();
    });

    // 8. File Upload
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        sfx.playConfirm();
        player.loadCustomFile(e.target.files[0]);
        this.refreshTracklist();
      }
    });

    // 9. Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.repeat && ['Enter', 'KeyC', 'KeyR'].includes(e.code)) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          this.navigateTrack(-1);
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          this.navigateTrack(1);
          break;
        case 'Enter':
        case 'Space':
          e.preventDefault();
          sfx.playConfirm();
          player.togglePlay();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          sfx.playCancel();
          player.pause();
          break;
        case 'Digit1':
          this.selectScene(0);
          break;
        case 'Digit2':
          this.selectScene(1);
          break;
        case 'Digit3':
          this.selectScene(2);
          break;
        case 'Digit4':
          this.selectScene(3);
          break;
        case 'KeyC':
          this.cycleCRTMode();
          break;
        case 'KeyR':
          this.toggleAspectRatio();
          break;
      }
    });

    // 10. Drag and Drop Audio Files onto Window
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|flac)$/i)) {
          sfx.playConfirm();
          player.loadCustomFile(file);
          this.refreshTracklist();
        }
      }
    });
  }

  selectTrack(index, autoPlay = false) {
    if (index < 0 || index >= player.tracks.length) return;
    this.selectedTrackIndex = index;
    sfx.playCursor();

    const track = player.tracks[index];
    this.updateTelemetryCard(track);
    this.highlightActiveCard(index);

    if (autoPlay) {
      player.playTrack(index);
    }
  }

  navigateTrack(delta) {
    const total = player.tracks.length;
    const newIdx = (this.selectedTrackIndex + delta + total) % total;
    this.selectTrack(newIdx, player.isPlaying);
  }

  selectScene(index) {
    if (index < 0 || index >= SCENES.length) return;
    this.activeSceneIndex = index;
    const scene = SCENES[index];

    sfx.playSceneWarp();
    gfx.switchScene(scene.id);

    // Update active button
    document.querySelectorAll('.era-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // Update scene tags in header/telemetry
    document.getElementById('scene-era-tag').textContent = `// ${scene.era}`;
    document.getElementById('scene-subtitle').textContent = scene.name;

    // Adjust theme color accent in CSS
    document.documentElement.style.setProperty('--accent-color', scene.accent);
  }

  cycleCRTMode() {
    this.currentCrtModeIndex = (this.currentCrtModeIndex + 1) % 3;
    // 0: Off, 1: Authentic 480i, 2: Clean
    const mode = this.currentCrtModeIndex;
    gfx.setCRTMode(mode);
    sfx.playCursor();

    const label = mode === 1 ? '480i' : mode === 2 ? 'CLEAN' : 'OFF';
    document.getElementById('crt-status').textContent = label;
  }

  toggleAspectRatio() {
    sfx.playCursor();
    const newMode = gfx.toggleAspectMode();
    const frame = document.getElementById('ps2-screen-frame');
    if (newMode === '4:3') {
      frame.classList.remove('mode-16-9');
      frame.classList.add('mode-4-3');
    } else {
      frame.classList.remove('mode-4-3');
      frame.classList.add('mode-16-9');
    }
    document.getElementById('aspect-status').textContent = newMode;
  }

  updateTelemetryCard(track) {
    document.getElementById('tel-title').textContent = track.title;
    document.getElementById('tel-artist').textContent = track.artist;
    document.getElementById('tel-bpm').textContent = `${track.bpm} BPM`;
    document.getElementById('tel-key').textContent = track.key;
    document.getElementById('tel-duration').textContent = track.duration;
    document.getElementById('tel-sector').textContent = `${track.sizeKb} KB`;
    document.getElementById('tel-notes').textContent = track.notes;
  }

  highlightActiveCard(index) {
    const cards = document.querySelectorAll('.track-card');
    cards.forEach((c, i) => {
      c.classList.toggle('selected', i === index);
    });
  }

  updatePlaybackState(state) {
    const playText = document.getElementById('play-text');
    const indicator = document.getElementById('playback-indicator');

    if (state.isPlaying) {
      playText.textContent = 'PAUSE';
      indicator.textContent = 'PLAYING // ACTIVE';
      indicator.classList.add('playing');
    } else {
      playText.textContent = 'PLAY TRACK';
      indicator.textContent = 'STANDBY';
      indicator.classList.remove('playing');
    }

    if (state.index !== this.selectedTrackIndex) {
      this.selectedTrackIndex = state.index;
      this.updateTelemetryCard(state.track);
      this.highlightActiveCard(state.index);
    }
  }

  refreshTracklist() {
    const trackContainer = document.getElementById('track-items');
    trackContainer.innerHTML = player.tracks.map((t, idx) => `
      <div class="track-card ${idx === this.selectedTrackIndex ? 'selected' : ''}" data-index="${idx}">
        <div class="track-cursor">▶</div>
        <div class="track-meta">
          <div class="track-title-row">
            <span class="track-num">0${idx + 1}.</span>
            <span class="track-title">${t.title}</span>
          </div>
          <div class="track-sub-row">
            <span class="track-bpm">${t.bpm} BPM</span>
            <span class="track-key">${t.key}</span>
            <span class="track-blocks">${t.sizeKb} KB</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  initVUCanvas() {
    this.vuCanvas = document.getElementById('vu-meter');
    if (!this.vuCanvas) return;
    this.vuCtx = this.vuCanvas.getContext('2d');

    const drawVU = () => {
      requestAnimationFrame(drawVU);
      if (!this.vuCtx || !this.vuCanvas) return;

      const w = this.vuCanvas.width;
      const h = this.vuCanvas.height;
      this.vuCtx.clearRect(0, 0, w, h);

      // Dark retro background
      this.vuCtx.fillStyle = 'rgba(6, 12, 24, 0.7)';
      this.vuCtx.fillRect(0, 0, w, h);

      const analysis = player.getAnalysis();
      const bins = 28;
      const barWidth = Math.floor(w / bins) - 2;

      for (let i = 0; i < bins; i++) {
        // Map frequency or dummy activity
        const val = player.isPlaying
          ? (analysis.waveform[i * 2] ? (analysis.waveform[i * 2] / 255) : Math.random() * 0.4)
          : (Math.sin(Date.now() * 0.003 + i * 0.3) * 0.1 + 0.12);

        const barH = Math.max(3, val * h * 0.85);
        const x = i * (barWidth + 2);
        const y = h - barH;

        // Vintage console green-to-cyan-to-orange gradient
        const grad = this.vuCtx.createLinearGradient(0, h, 0, 0);
        grad.addColorStop(0, '#00d4ff');
        grad.addColorStop(0.7, '#44ff88');
        grad.addColorStop(1.0, '#ff6600');

        this.vuCtx.fillStyle = grad;
        this.vuCtx.fillRect(x, y, barWidth, barH);
      }
    };

    drawVU();
  }
}
