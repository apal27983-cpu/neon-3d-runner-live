import { Obstacle, ObstacleType } from './Obstacle.js';

export class ObstaclePool {
  constructor(scene) {
    this.scene = scene;
    this.pools = new Map();

    // Pre-populate pools
    for (const type of Object.values(ObstacleType)) {
      this.pools.set(type, []);
      for (let i = 0; i < 6; i++) {
        const obs = new Obstacle(type, this.scene);
        this.pools.get(type).push(obs);
      }
    }
  }

  get(type) {
    const pool = this.pools.get(type);
    if (!pool) return null;

    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].active) {
        return pool[i];
      }
    }

    // Expand pool if necessary
    const newObs = new Obstacle(type, this.scene);
    pool.push(newObs);
    return newObs;
  }

  reset() {
    for (const pool of this.pools.values()) {
      for (const obs of pool) {
        obs.recycle();
      }
    }
  }
}
