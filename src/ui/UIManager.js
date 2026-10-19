import { GameStates } from '../core/GameState.js';

export class UIManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;

    // DOM Elements
    this.hud = document.getElementById('hud');
    this.startScreen = document.getElementById('start-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.mobileControls = document.getElementById('mobile-controls');
    this.impactFlash = document.getElementById('impact-flash');
    this.speedLines = document.getElementById('speed-lines-container');

    // HUD values
    this.hudScore = document.getElementById('hud-score');
    this.hudDistance = document.getElementById('hud-distance');
    this.hudBest = document.getElementById('hud-best');
    this.speedGaugeFill = document.getElementById('speed-gauge-fill');
    this.hudSpeedText = document.getElementById('hud-speed-text');
    this.hudLevelBadge = document.getElementById('hud-level-badge');

    // Start screen values
    this.startBestScore = document.getElementById('start-best-score');
    this.lblSoundStatus = document.getElementById('lbl-sound-status');
    this.lblGraphicsStatus = document.getElementById('lbl-graphics-status');

    // Pause screen values
    this.pauseCurrentScore = document.getElementById('pause-current-score');
    this.pauseCurrentDistance = document.getElementById('pause-current-distance');

    // Game over screen values
    this.gameOverScore = document.getElementById('game-over-score');
    this.gameOverBest = document.getElementById('game-over-best');
    this.gameOverDistance = document.getElementById('game-over-distance');
    this.gameOverSpeed = document.getElementById('game-over-speed');
    this.newRecordBadge = document.getElementById('new-high-score-badge');

    // Buttons
    this.btnStart = document.getElementById('btn-start');
    this.btnResume = document.getElementById('btn-resume');
    this.btnRestartPause = document.getElementById('btn-restart-pause');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnAudioHud = document.getElementById('btn-audio-hud');
    this.btnPauseHud = document.getElementById('btn-pause-hud');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.btnToggleGraphics = document.getElementById('btn-toggle-graphics');

    this._bindButtonEvents();
    this._checkTouchDevice();
  }

  _bindButtonEvents() {
    this.btnStart?.addEventListener('click', () => this.callbacks.onStart?.());
    this.btnResume?.addEventListener('click', () => this.callbacks.onResume?.());
    this.btnRestartPause?.addEventListener('click', () => this.callbacks.onRestart?.());
    this.btnRestart?.addEventListener('click', () => this.callbacks.onRestart?.());

    this.btnAudioHud?.addEventListener('click', () => this.callbacks.onToggleAudio?.());
    this.btnPauseHud?.addEventListener('click', () => this.callbacks.onTogglePause?.());

    this.btnToggleSound?.addEventListener('click', () => this.callbacks.onToggleAudio?.());
    this.btnToggleGraphics?.addEventListener('click', () => this.callbacks.onToggleGraphics?.());
  }

  _checkTouchDevice() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 768;
    if (isTouch && this.mobileControls) {
      this.mobileControls.classList.remove('mobile-controls-hidden');
    }
  }

  updateHUD(score, distance, bestScore, speedPercent, level) {
    if (this.hudScore) this.hudScore.textContent = score.toLocaleString();
    if (this.hudDistance) this.hudDistance.innerHTML = `${Math.floor(distance)}<small>m</small>`;
    if (this.hudBest) this.hudBest.textContent = bestScore.toLocaleString();

    if (this.speedGaugeFill) {
      const fill = Math.min(100, Math.max(10, (speedPercent - 100) * 0.9 + 15));
      this.speedGaugeFill.style.width = `${fill}%`;
    }
    if (this.hudSpeedText) this.hudSpeedText.textContent = `VELOCITY: ${speedPercent}%`;
    if (this.hudLevelBadge) this.hudLevelBadge.textContent = `LVL ${level}`;

    // Speed lines effect when running fast (> 150% velocity)
    if (this.speedLines) {
      if (speedPercent >= 145) {
        this.speedLines.classList.add('speed-lines-active');
      } else {
        this.speedLines.classList.remove('speed-lines-active');
      }
    }
  }

  setAudioState(isMuted) {
    if (this.btnAudioHud) {
      this.btnAudioHud.innerHTML = isMuted ? '<span class="icon-audio">🔇</span>' : '<span class="icon-audio">🔊</span>';
    }
    if (this.lblSoundStatus) {
      this.lblSoundStatus.textContent = isMuted ? 'MUTED' : 'SYNTH ON';
      this.lblSoundStatus.className = isMuted ? 'status-off' : 'status-on';
    }
  }

  setGraphicsState(isHighQuality) {
    if (this.lblGraphicsStatus) {
      this.lblGraphicsStatus.textContent = isHighQuality ? 'ULTRA' : 'STANDARD';
      this.lblGraphicsStatus.className = isHighQuality ? 'status-on' : 'status-off';
    }
  }

  triggerImpactFlash() {
    if (!this.impactFlash) return;
    this.impactFlash.classList.remove('flash-active');
    void this.impactFlash.offsetWidth; // Reflow
    this.impactFlash.classList.add('flash-active');

    // Add screen shake
    document.body.classList.add('screen-shake');
    setTimeout(() => {
      document.body.classList.remove('screen-shake');
    }, 350);
  }

  showState(state, data = {}) {
    // Hide all screens initially
    this.startScreen?.classList.remove('active');
    this.pauseScreen?.classList.remove('active');
    this.gameOverScreen?.classList.remove('active');

    switch (state) {
      case GameStates.READY:
        if (this.startBestScore) {
          this.startBestScore.textContent = (data.bestScore || 0).toLocaleString();
        }
        this.hud?.classList.add('hud-hidden');
        this.startScreen?.classList.add('active');
        break;

      case GameStates.PLAYING:
        this.hud?.classList.remove('hud-hidden');
        break;

      case GameStates.PAUSED:
        if (this.pauseCurrentScore) {
          this.pauseCurrentScore.textContent = (data.score || 0).toLocaleString();
        }
        if (this.pauseCurrentDistance) {
          this.pauseCurrentDistance.textContent = `${Math.floor(data.distance || 0)}m`;
        }
        this.pauseScreen?.classList.add('active');
        break;

      case GameStates.GAME_OVER:
        if (this.gameOverScore) {
          this.gameOverScore.textContent = (data.score || 0).toLocaleString();
        }
        if (this.gameOverBest) {
          this.gameOverBest.textContent = (data.bestScore || 0).toLocaleString();
        }
        if (this.gameOverDistance) {
          this.gameOverDistance.textContent = `${Math.floor(data.distance || 0)}m`;
        }
        if (this.gameOverSpeed) {
          this.gameOverSpeed.textContent = `${data.speedPercent || 100}%`;
        }
        if (this.newRecordBadge) {
          if (data.isNewRecord) {
            this.newRecordBadge.classList.remove('hidden');
          } else {
            this.newRecordBadge.classList.add('hidden');
          }
        }
        this.hud?.classList.add('hud-hidden');
        this.gameOverScreen?.classList.add('active');
        break;
    }
  }
}
