import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export class MovementController {
  constructor() {
    this.lanes = WorldConfig.LANES;
    this.currentLaneIndex = 1; // Start in center lane (x = 0)
    this.targetX = this.lanes[this.currentLaneIndex];
    this.currentX = this.targetX;
    this.lateralVelocity = 0;
    this.bankAngle = 0;
  }

  moveLeft() {
    if (this.currentLaneIndex > 0) {
      this.currentLaneIndex--;
      this.targetX = this.lanes[this.currentLaneIndex];
      return true;
    }
    return false;
  }

  moveRight() {
    if (this.currentLaneIndex < this.lanes.length - 1) {
      this.currentLaneIndex++;
      this.targetX = this.lanes[this.currentLaneIndex];
      return true;
    }
    return false;
  }

  update(dt) {
    const prevX = this.currentX;
    
    // Smooth delta-time damping to target lane
    this.currentX = THREE.MathUtils.damp(
      this.currentX, 
      this.targetX, 
      WorldConfig.LANE_CHANGE_SPEED, 
      dt
    );

    this.lateralVelocity = (this.currentX - prevX) / Math.max(dt, 0.001);

    // Dynamic bank roll angle based on lateral movement
    const targetBank = -this.lateralVelocity * 0.025;
    this.bankAngle = THREE.MathUtils.damp(this.bankAngle, targetBank, 15.0, dt);
  }

  reset() {
    this.currentLaneIndex = 1;
    this.targetX = this.lanes[this.currentLaneIndex];
    this.currentX = this.targetX;
    this.lateralVelocity = 0;
    this.bankAngle = 0;
  }
}
