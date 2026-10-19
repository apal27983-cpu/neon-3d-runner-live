import { ObstaclePool } from './ObstaclePool.js';
import { ObstacleSpawner } from './ObstacleSpawner.js';
import { WorldConfig } from '../world/WorldConfig.js';

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.pool = new ObstaclePool(this.scene);
    this.spawner = new ObstacleSpawner(this.pool);
    this.activeObstacles = [];
    this.recycleZ = WorldConfig.RECYCLE_Z;
  }

  update(dt, speed, difficultyMultiplier) {
    // 1. Spawn new obstacles if time elapsed
    const newObs = this.spawner.update(dt, speed, difficultyMultiplier);
    if (newObs && newObs.length > 0) {
      this.activeObstacles.push(...newObs);
    }

    // 2. Update and move active obstacles
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      obs.update(dt, speed);

      // Recycle if obstacle has passed behind the camera
      if (obs.meshGroup.position.z > this.recycleZ) {
        obs.recycle();
        this.activeObstacles.splice(i, 1);
      }
    }
  }

  getNearObstacles(playerZ = 0, range = 10.0) {
    // Return only active obstacles in the immediate vicinity of the player
    const near = [];
    for (let i = 0; i < this.activeObstacles.length; i++) {
      const obs = this.activeObstacles[i];
      if (Math.abs(obs.meshGroup.position.z - playerZ) < range) {
        near.push(obs);
      }
    }
    return near;
  }

  reset() {
    this.spawner.reset();
    for (let i = 0; i < this.activeObstacles.length; i++) {
      this.activeObstacles[i].recycle();
    }
    this.activeObstacles = [];
    this.pool.reset();
  }
}
