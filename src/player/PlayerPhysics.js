import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export class PlayerPhysics {
  constructor(callbacks = {}) {
    this.y = WorldConfig.GROUND_Y;
    this.vy = 0;
    this.isGrounded = true;
    this.gravity = WorldConfig.GRAVITY;
    this.jumpImpulse = WorldConfig.JUMP_IMPULSE;
    
    this.onJump = callbacks.onJump || (() => {});
    this.onLand = callbacks.onLand || (() => {});

    // Squash & Stretch scales
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;
  }

  jump() {
    if (!this.isGrounded) return false;

    this.vy = this.jumpImpulse;
    this.isGrounded = false;

    // Stretch on launch
    this.scaleY = 1.35;
    this.scaleX = 0.85;
    this.scaleZ = 0.85;

    this.onJump();
    return true;
  }

  update(dt) {
    if (!this.isGrounded) {
      this.vy -= this.gravity * dt;
      this.y += this.vy * dt;

      if (this.y <= WorldConfig.GROUND_Y) {
        this.y = WorldConfig.GROUND_Y;
        const impactSpeed = Math.abs(this.vy);
        this.vy = 0;
        this.isGrounded = true;

        // Squash on landing proportional to impact
        const squashAmount = Math.min(0.45, impactSpeed * 0.025);
        this.scaleY = 1.0 - squashAmount;
        this.scaleX = 1.0 + squashAmount * 0.5;
        this.scaleZ = 1.0 + squashAmount * 0.5;

        this.onLand(impactSpeed);
      }
    }

    // Smoothly restore scale back to 1.0
    this.scaleX = THREE.MathUtils.damp(this.scaleX, 1.0, 16.0, dt);
    this.scaleY = THREE.MathUtils.damp(this.scaleY, 1.0, 16.0, dt);
    this.scaleZ = THREE.MathUtils.damp(this.scaleZ, 1.0, 16.0, dt);
  }

  reset() {
    this.y = WorldConfig.GROUND_Y;
    this.vy = 0;
    this.isGrounded = true;
    this.scaleX = 1.0;
    this.scaleY = 1.0;
    this.scaleZ = 1.0;
  }
}
