import * as THREE from 'three';

export class CollisionSystem {
  constructor(callbacks = {}) {
    this.onCollision = callbacks.onCollision || (() => {});
    this.onNearMiss = callbacks.onNearMiss || (() => {});
    
    this.hasCollided = false;
    this.nearMissChecked = new Set();
  }

  check(player, obstacleManager, currentSpeed, dt) {
    if (this.hasCollided) return;

    const playerBox = player.hitbox;
    // Get obstacles within +- 8 units of player Z
    const nearObstacles = obstacleManager.getNearObstacles(player.meshGroup.position.z, 8.0);

    for (let i = 0; i < nearObstacles.length; i++) {
      const obs = nearObstacles[i];
      const obsBox = obs.hitbox;

      // 1. Direct 3D AABB Intersection Check
      if (playerBox.intersectsBox(obsBox)) {
        this.hasCollided = true;
        this.onCollision(obs);
        return;
      }

      // 2. High-speed tunneling prevention: check if player passed through obstacle in this frame
      const stepZ = currentSpeed * dt;
      if (stepZ > 1.0) {
        // Create an extended swept box along Z for the obstacle
        const sweptBox = obsBox.clone();
        sweptBox.min.z -= stepZ;
        if (playerBox.intersectsBox(sweptBox)) {
          this.hasCollided = true;
          this.onCollision(obs);
          return;
        }
      }

      // 3. Near Miss Detection (Thrilling cyberpunk dodge bonus)
      if (!this.nearMissChecked.has(obs) && Math.abs(obs.meshGroup.position.z) < 1.5) {
        this.nearMissChecked.add(obs);
        // If close laterally or vertically
        const dist = player.meshGroup.position.distanceTo(obs.meshGroup.position);
        if (dist < 3.2 && dist > 1.2) {
          this.onNearMiss(obs);
        }
      }
    }
  }

  reset() {
    this.hasCollided = false;
    this.nearMissChecked.clear();
  }
}
