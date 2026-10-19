import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export class FollowCamera {
  constructor(camera) {
    this.camera = camera;
    this.cfg = WorldConfig.CAMERA;
    
    this.currentPos = new THREE.Vector3(
      this.cfg.offset.x,
      this.cfg.offset.y,
      this.cfg.offset.z
    );

    this.currentLookAt = new THREE.Vector3(
      this.cfg.lookAtOffset.x,
      this.cfg.lookAtOffset.y,
      this.cfg.lookAtOffset.z
    );

    this.trauma = 0;
    this.baseFov = this.cfg.fov;
  }

  addTrauma(amount) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  update(dt, player, speed) {
    const playerPos = player.meshGroup.position;
    
    // 1. Calculate Target Camera Position
    const targetX = playerPos.x * 0.45; // Camera slightly trails lateral movement
    const targetY = this.cfg.offset.y + player.physics.y * 0.35; // Gentle vertical tracking
    const targetZ = this.cfg.offset.z;

    // Smooth delta-time damping
    this.currentPos.x = THREE.MathUtils.damp(this.currentPos.x, targetX, this.cfg.smoothing, dt);
    this.currentPos.y = THREE.MathUtils.damp(this.currentPos.y, targetY, this.cfg.smoothing, dt);
    this.currentPos.z = THREE.MathUtils.damp(this.currentPos.z, targetZ, this.cfg.smoothing, dt);

    // 2. Calculate Target LookAt Target
    const lookTargetX = playerPos.x * 0.6;
    const lookTargetY = this.cfg.lookAtOffset.y + player.physics.y * 0.2;
    const lookTargetZ = this.cfg.lookAtOffset.z;

    this.currentLookAt.x = THREE.MathUtils.damp(this.currentLookAt.x, lookTargetX, this.cfg.smoothing, dt);
    this.currentLookAt.y = THREE.MathUtils.damp(this.currentLookAt.y, lookTargetY, this.cfg.smoothing, dt);
    this.currentLookAt.z = THREE.MathUtils.damp(this.currentLookAt.z, lookTargetZ, this.cfg.smoothing, dt);

    // 3. Screen Shake from trauma (trauma squared gives natural falloff)
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    let shakeRotZ = 0;

    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma;
      shakeOffsetX = (Math.random() * 2 - 1) * shake * 0.8;
      shakeOffsetY = (Math.random() * 2 - 1) * shake * 0.8;
      shakeRotZ = (Math.random() * 2 - 1) * shake * 0.05;

      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }

    // 4. Set Camera Position & LookAt
    this.camera.position.set(
      this.currentPos.x + shakeOffsetX,
      this.currentPos.y + shakeOffsetY,
      this.currentPos.z
    );

    this.camera.lookAt(
      this.currentLookAt.x,
      this.currentLookAt.y,
      this.currentLookAt.z
    );

    // 5. Banking Roll Lean
    const bankRoll = player.movement.bankAngle * this.cfg.leanFactor;
    this.camera.rotation.z += bankRoll + shakeRotZ;

    // 6. Dynamic FOV expansion at higher speeds
    const speedRatio = (speed - WorldConfig.INITIAL_SPEED) / (WorldConfig.MAX_SPEED - WorldConfig.INITIAL_SPEED);
    const targetFov = this.baseFov + speedRatio * 8.0;
    if (Math.abs(this.camera.fov - targetFov) > 0.05) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 4.0, dt);
      this.camera.updateProjectionMatrix();
    }
  }

  reset() {
    this.currentPos.set(this.cfg.offset.x, this.cfg.offset.y, this.cfg.offset.z);
    this.currentLookAt.set(this.cfg.lookAtOffset.x, this.cfg.lookAtOffset.y, this.cfg.lookAtOffset.z);
    this.trauma = 0;
    this.camera.fov = this.baseFov;
    this.camera.updateProjectionMatrix();
  }
}
