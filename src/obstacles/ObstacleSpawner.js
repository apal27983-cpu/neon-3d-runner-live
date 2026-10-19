import { ObstacleType } from './Obstacle.js';
import { WorldConfig } from '../world/WorldConfig.js';

export class ObstacleSpawner {
  constructor(pool) {
    this.pool = pool;
    this.spawnTimer = 0;
    this.spawnInterval = WorldConfig.MAX_OBSTACLE_INTERVAL;
    this.gracePeriod = 1.2; // Quick grace period to get straight into the action
    this.elapsedTime = 0;
  }

  update(dt, speed, difficultyMultiplier) {
    this.elapsedTime += dt;
    if (this.elapsedTime < this.gracePeriod) {
      return [];
    }

    // Scale spawn interval with game speed & difficulty
    // High speed = even faster spawns between obstacle waves
    const minInterval = WorldConfig.MIN_OBSTACLE_INTERVAL;
    const maxInterval = WorldConfig.MAX_OBSTACLE_INTERVAL;
    this.spawnInterval = Math.max(
      minInterval,
      maxInterval - (speed - WorldConfig.INITIAL_SPEED) * 0.045
    );

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      return this._generateFairWave(speed, difficultyMultiplier);
    }

    return [];
  }

  _generateFairWave(speed, difficulty) {
    const spawned = [];
    const spawnZ = WorldConfig.SPAWN_START_Z;

    // Pattern archetypes
    const rand = Math.random();
    
    if (difficulty < 1.3 || rand < 0.4) {
      // Archetype 1: Single lane obstacle (Simple dodge or jump)
      const lane = Math.floor(Math.random() * 3);
      const types = [ObstacleType.BARRIER, ObstacleType.ENERGY_BLOCK, ObstacleType.CYBER_PILLAR, ObstacleType.LASER_GATE];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const obs = this.pool.get(type);
      if (obs) {
        obs.spawn(lane, spawnZ);
        spawned.push(obs);
      }
    } else if (difficulty < 2.0 || rand < 0.75) {
      // Archetype 2: Double lane obstacle (Leaves exactly 1 clear lane)
      const freeLane = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++) {
        if (l === freeLane) continue;

        // One can be a block/pillar, the other can be a barrier
        const type = Math.random() > 0.5 ? ObstacleType.BARRIER : ObstacleType.ENERGY_BLOCK;
        const obs = this.pool.get(type);
        if (obs) {
          obs.spawn(l, spawnZ);
          spawned.push(obs);
        }
      }
    } else {
      // Archetype 3: Triple lane challenge with guaranteed jumpable hurdle!
      // Center lane or one of the lanes has a jumpable BARRIER, while others are blocked
      const jumpableLane = Math.floor(Math.random() * 3);
      for (let l = 0; l < 3; l++) {
        let type;
        if (l === jumpableLane) {
          // This lane can be jumped over!
          type = Math.random() > 0.5 ? ObstacleType.BARRIER : ObstacleType.LASER_GATE;
        } else {
          type = Math.random() > 0.5 ? ObstacleType.ENERGY_BLOCK : ObstacleType.CYBER_PILLAR;
        }

        const obs = this.pool.get(type);
        if (obs) {
          obs.spawn(l, spawnZ);
          spawned.push(obs);
        }
      }
    }

    return spawned;
  }

  reset() {
    this.spawnTimer = 0;
    this.elapsedTime = 0;
  }
}
