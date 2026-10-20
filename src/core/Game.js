import { GameStates, GameStateManager } from './GameState.js';
import { SceneManager } from './SceneManager.js';
import { InputManager } from './InputManager.js';
import { TimeManager } from './TimeManager.js';
import { Player } from '../player/Player.js';
import { RoadManager } from '../world/RoadManager.js';
import { EnvironmentManager } from '../world/EnvironmentManager.js';
import { ObstacleManager } from '../obstacles/ObstacleManager.js';
import { CollisionSystem } from '../systems/CollisionSystem.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { DifficultySystem } from '../systems/DifficultySystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { AudioManager } from '../systems/AudioManager.js';
import { FollowCamera } from '../camera/FollowCamera.js';
import { UIManager } from '../ui/UIManager.js';

export class Game {
  constructor() {
    this.container = document.getElementById('game-canvas-container');
    if (!this.container) {
      throw new Error('Canvas container #game-canvas-container not found in DOM.');
    }

    // Core Systems
    this.gameState = new GameStateManager(GameStates.READY);
    this.time = new TimeManager();
    this.sceneManager = new SceneManager(this.container);
    this.audio = new AudioManager();

    // Visual Subsystems
    this.particles = new ParticleSystem(this.sceneManager.scene);
    this.road = new RoadManager(this.sceneManager.scene);
    this.env = new EnvironmentManager(this.sceneManager.scene);
    this.obstacles = new ObstacleManager(this.sceneManager.scene);

    // Player
    this.player = new Player(this.sceneManager.scene, {
      onJump: () => {
        this.audio.playJump();
      },
      onLand: (impact, pos) => {
        this.audio.playLand();
        this.particles.triggerLanding(pos);
      }
    });

    // Camera
    this.followCamera = new FollowCamera(this.sceneManager.camera);

    // Gameplay Systems
    this.score = new ScoreSystem();
    this.difficulty = new DifficultySystem();

    // Collision System
    this.collision = new CollisionSystem({
      onCollision: (obstacle) => this._onPlayerCollision(obstacle),
      onNearMiss: (obstacle) => this._onPlayerNearMiss(obstacle)
    });

    // UI Manager
    this.ui = new UIManager({
      onStart: () => this.startGame(),
      onResume: () => this.resumeGame(),
      onRestart: () => this.restartGame(),
      onToggleAudio: () => this.toggleAudio(),
      onTogglePause: () => this.togglePause(),
      onToggleGraphics: () => this.toggleGraphics()
    });

    // Input Manager
    this.input = new InputManager();
    this._bindInputs();

    // Initial setup
    this.ui.showState(GameStates.READY, {
      bestScore: this.score.bestScore
    });

    // Start render loop
    this.trailTimer = 0;
    this.isRunning = true;
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  _bindInputs() {
    this.input.on('moveLeft', () => {
      if (this.gameState.isPlaying()) {
        const moved = this.player.moveLeft();
        if (moved) this.audio.playLaneSwitch();
      }
    });

    this.input.on('moveRight', () => {
      if (this.gameState.isPlaying()) {
        const moved = this.player.moveRight();
        if (moved) this.audio.playLaneSwitch();
      }
    });

    this.input.on('jump', () => {
      if (this.gameState.isPlaying()) {
        this.player.jump();
      } else if (this.gameState.is(GameStates.READY)) {
        this.startGame();
      }
    });

    this.input.on('enter', () => {
      if (this.gameState.is(GameStates.READY)) {
        this.startGame();
      } else if (this.gameState.is(GameStates.GAME_OVER)) {
        this.restartGame();
      }
    });

    this.input.on('pause', () => {
      this.togglePause();
    });

    this.input.on('toggleAudio', () => {
      this.toggleAudio();
    });
  }

  startGame() {
    this.audio.init();
    this.audio.startMusic();
    this.audio.playButtonClick();

    this.restartGame();
  }

  restartGame() {
    this.audio.playButtonClick();
    this.time.reset();
    this.score.reset();
    this.difficulty.reset();
    this.collision.reset();
    this.particles.reset();
    this.road.reset();
    this.env.reset();
    this.obstacles.reset();
    this.player.reset();
    this.followCamera.reset();

    this.gameState.setState(GameStates.PLAYING);
    this.ui.showState(GameStates.PLAYING);
  }

  togglePause() {
    if (this.gameState.is(GameStates.PLAYING)) {
      this.gameState.setState(GameStates.PAUSED);
      this.audio.playButtonClick();
      this.ui.showState(GameStates.PAUSED, {
        score: this.score.score,
        distance: this.score.distance
      });
    } else if (this.gameState.is(GameStates.PAUSED)) {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.audio.playButtonClick();
    this.gameState.setState(GameStates.PLAYING);
    this.ui.showState(GameStates.PLAYING);
  }

  toggleAudio() {
    const isMuted = this.audio.toggleMute();
    this.ui.setAudioState(isMuted);
  }

  toggleGraphics() {
    const isBloom = this.sceneManager.toggleBloom();
    this.ui.setGraphicsState(isBloom);
  }

  _onPlayerCollision(obstacle) {
    this.gameState.setState(GameStates.GAME_OVER);
    this.audio.playCrash();
    this.followCamera.addTrauma(1.0);
    this.ui.triggerImpactFlash();

    // Trigger explosive disintegration
    this.particles.triggerExplosion(this.player.meshGroup.position);
    this.player.hideVisuals();

    // Show Game Over Overlay with stats
    setTimeout(() => {
      this.ui.showState(GameStates.GAME_OVER, {
        score: this.score.score,
        bestScore: this.score.bestScore,
        distance: this.score.distance,
        speedPercent: this.difficulty.getSpeedPercentage(),
        isNewRecord: this.score.isNewRecord
      });
    }, 450);
  }

  _onPlayerNearMiss(obstacle) {
    this.score.addBonus(50);
    this.audio.playScoreChime();
    this.followCamera.addTrauma(0.18);
  }

  _loop() {
    if (!this.isRunning) return;
    requestAnimationFrame(this._loop);

    const dt = this.time.update();
    const state = this.gameState.getState();

    if (state === GameStates.PLAYING) {
      // 1. Difficulty & Speed (with score >= 500 boost)
      const wasBoosted = this.difficulty.isBoosted;
      this.difficulty.update(dt, this.score.score);
      const currentSpeed = this.difficulty.currentSpeed;
      if (!wasBoosted && this.difficulty.isBoosted) {
        this.audio.playScoreChime();
        this.followCamera.addTrauma(0.25);
      }
      this.audio.setMusicTempo(currentSpeed / this.difficulty.initialSpeed);

      // 2. Player Update
      this.player.update(dt);

      // 3. World & Obstacles Movement
      this.road.update(dt, currentSpeed);
      this.env.update(dt, currentSpeed);
      this.obstacles.update(dt, currentSpeed, this.difficulty.difficultyMultiplier);

      // 4. Trail Particles
      this.trailTimer += dt;
      if (this.trailTimer >= 0.045) {
        this.trailTimer = 0;
        this.particles.emitTrail(this.player.meshGroup.position, !this.player.physics.isGrounded);
      }
      this.particles.update(dt, currentSpeed);

      // 5. Collision Checks
      this.collision.check(this.player, this.obstacles, currentSpeed, dt);

      // 6. Score & HUD Updates
      if (this.gameState.isPlaying()) {
        this.score.update(dt, currentSpeed);
        this.ui.updateHUD(
          this.score.score,
          this.score.distance,
          this.score.bestScore,
          this.difficulty.getSpeedPercentage(),
          this.difficulty.level
        );
      }

      // 7. Follow Camera
      this.followCamera.update(dt, this.player, currentSpeed);

    } else if (state === GameStates.READY) {
      // Idle preview on start screen: slow ambient road and scenery scroll
      const previewSpeed = 6.0;
      this.road.update(dt, previewSpeed);
      this.env.update(dt, previewSpeed);
      this.player.update(dt);
      this.followCamera.update(dt, this.player, previewSpeed);

    } else if (state === GameStates.GAME_OVER) {
      // Keep updating particles and camera shake settling
      this.particles.update(dt, 0);
      this.followCamera.update(dt, this.player, 0);
    }

    // Always render frame
    this.sceneManager.render();
  }
}
