import { WorldConfig } from '../world/WorldConfig.js';

export class DifficultySystem {
  constructor() {
    this.initialSpeed = WorldConfig.INITIAL_SPEED;
    this.maxSpeed = WorldConfig.MAX_SPEED;
    this.accelRate = WorldConfig.SPEED_ACCEL_RATE;
    
    this.baseSpeed = this.initialSpeed;
    this.currentSpeed = this.initialSpeed;
    this.elapsedTime = 0;
    this.level = 1;
    this.difficultyMultiplier = 1.0;
    this.isBoosted = false;
  }

  update(dt, currentScore = 0) {
    this.elapsedTime += dt;

    // Smooth asymptotic speed acceleration towards max speed
    this.baseSpeed = Math.min(
      this.maxSpeed,
      this.baseSpeed + this.accelRate * dt
    );

    // When score crosses 500, automatically increase z-axis speed by 20%
    const scoreBoost = currentScore >= 500 ? 1.2 : 1.0;
    this.isBoosted = currentScore >= 500;
    this.currentSpeed = this.baseSpeed * scoreBoost;

    // Calculate level (every ~15 seconds or speed tier)
    const speedRatio = (this.baseSpeed - this.initialSpeed) / (this.maxSpeed - this.initialSpeed);
    this.level = Math.min(5, Math.floor(speedRatio * 4) + (this.isBoosted ? 2 : 1));
    this.difficultyMultiplier = (1.0 + speedRatio * 1.5) * scoreBoost;
  }

  getSpeedPercentage() {
    return Math.floor((this.currentSpeed / this.initialSpeed) * 100);
  }

  reset() {
    this.baseSpeed = this.initialSpeed;
    this.currentSpeed = this.initialSpeed;
    this.elapsedTime = 0;
    this.level = 1;
    this.difficultyMultiplier = 1.0;
    this.isBoosted = false;
  }
}
