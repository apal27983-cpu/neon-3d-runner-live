import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';

import { MovementController } from '../src/player/MovementController.js';
import { PlayerPhysics } from '../src/player/PlayerPhysics.js';
import { GameStates, GameStateManager } from '../src/core/GameState.js';
import { ScoreSystem } from '../src/systems/ScoreSystem.js';
import { DifficultySystem } from '../src/systems/DifficultySystem.js';
import { WorldConfig } from '../src/world/WorldConfig.js';
import { ObstacleSpawner } from '../src/obstacles/ObstacleSpawner.js';

test('MovementController: handles lane changes and boundaries', () => {
  const controller = new MovementController();
  
  // Starts in center lane (lane index 1, x = 0)
  assert.equal(controller.currentLaneIndex, 1);
  assert.equal(controller.targetX, 0);

  // Move left to lane 0 (x = -3)
  const movedLeft = controller.moveLeft();
  assert.equal(movedLeft, true);
  assert.equal(controller.currentLaneIndex, 0);
  assert.equal(controller.targetX, -3.0);

  // Moving left again should fail (bounded)
  const movedLeftAgain = controller.moveLeft();
  assert.equal(movedLeftAgain, false);
  assert.equal(controller.currentLaneIndex, 0);

  // Move right back to center, then right lane (lane 2, x = 3)
  assert.equal(controller.moveRight(), true);
  assert.equal(controller.currentLaneIndex, 1);
  assert.equal(controller.moveRight(), true);
  assert.equal(controller.currentLaneIndex, 2);
  assert.equal(controller.targetX, 3.0);

  // Moving right again should fail (bounded)
  assert.equal(controller.moveRight(), false);
  assert.equal(controller.currentLaneIndex, 2);

  // Smooth interpolation updates currentX toward targetX
  controller.update(0.1);
  assert.ok(controller.currentX > 0, 'currentX should interpolate towards targetX');
});

test('PlayerPhysics: gravity, jumping, airborne check, and landing', () => {
  let landedImpact = null;
  const physics = new PlayerPhysics({
    onLand: (impact) => {
      landedImpact = impact;
    }
  });

  // 2x Jump gravity multiplier verified
  assert.equal(physics.gravityMultiplier, 2.0, 'Jump gravity multiplier should be 2x');

  // Initially grounded
  assert.equal(physics.isGrounded, true);
  assert.equal(physics.y, 0);
  assert.equal(physics.vy, 0);

  // Trigger jump
  const jumped = physics.jump();
  assert.equal(jumped, true);
  assert.equal(physics.isGrounded, false);
  assert.equal(physics.vy, WorldConfig.JUMP_IMPULSE);

  // Subsequent jump while airborne should be rejected
  assert.equal(physics.jump(), false);

  // Update physics under gravity
  physics.update(0.1);
  assert.ok(physics.y > 0, 'Player should be above ground');
  assert.ok(physics.vy < WorldConfig.JUMP_IMPULSE, 'Velocity should decrease under gravity');

  // Fast forward until player lands
  for (let i = 0; i < 40; i++) {
    physics.update(0.05);
  }

  assert.equal(physics.isGrounded, true);
  assert.equal(physics.y, 0);
  assert.equal(physics.vy, 0);
  assert.ok(landedImpact !== null, 'onLand callback should have been triggered');
});

test('GameStateManager: state transitions and validation', () => {
  const manager = new GameStateManager(GameStates.READY);
  assert.equal(manager.getState(), GameStates.READY);

  let stateChangeLog = [];
  manager.onChange((current, prev) => {
    stateChangeLog.push(`${prev}->${current}`);
  });

  manager.setState(GameStates.PLAYING);
  assert.equal(manager.isPlaying(), true);

  manager.setState(GameStates.PAUSED);
  assert.equal(manager.is(GameStates.PAUSED), true);

  manager.setState(GameStates.GAME_OVER);
  assert.equal(manager.is(GameStates.GAME_OVER), true);

  // Invalid state transition should be ignored
  manager.setState('UNKNOWN_STATE');
  assert.equal(manager.is(GameStates.GAME_OVER), true);

  assert.deepEqual(stateChangeLog, [
    'READY->PLAYING',
    'PLAYING->PAUSED',
    'PAUSED->GAME_OVER'
  ]);
});

test('ScoreSystem: distance accumulation and bonus tracking', () => {
  const scoreSystem = new ScoreSystem();
  assert.equal(scoreSystem.score, 0);
  assert.equal(scoreSystem.distance, 0);

  // Update with 1 second at speed 30
  scoreSystem.update(1.0, 30.0);
  assert.equal(scoreSystem.distance, 15.0);
  assert.equal(scoreSystem.score, 150);

  // Add near miss bonus
  scoreSystem.addBonus(50);
  assert.equal(scoreSystem.score, 200);

  // Reset zeroes current run but retains best score
  scoreSystem.reset();
  assert.equal(scoreSystem.score, 0);
  assert.equal(scoreSystem.distance, 0);
  assert.equal(scoreSystem.bestScore, 200);
});

test('DifficultySystem: progressive acceleration and level scaling', () => {
  const difficulty = new DifficultySystem();
  assert.equal(difficulty.currentSpeed, WorldConfig.INITIAL_SPEED);
  assert.equal(difficulty.level, 1);

  // Advance time by 30 seconds with score < 500
  difficulty.update(30.0, 200);
  assert.ok(difficulty.currentSpeed > WorldConfig.INITIAL_SPEED, 'Speed should accelerate');
  assert.equal(difficulty.isBoosted, false);

  // When score crosses 500, speed automatically increases by 20%
  const speedBeforeBoost = difficulty.baseSpeed;
  difficulty.update(1.0, 520);
  assert.equal(difficulty.isBoosted, true);
  assert.ok(Math.abs(difficulty.currentSpeed - speedBeforeBoost * 1.2) < 0.8, 'Speed should increase by 20% when score >= 500');
});

test('Collision Detection: AABB intersection logic', () => {
  const boxA = new THREE.Box3(
    new THREE.Vector3(-0.5, 0, -0.5),
    new THREE.Vector3(0.5, 1, 0.5)
  );

  const boxIntersecting = new THREE.Box3(
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(1, 1.5, 1)
  );

  const boxFar = new THREE.Box3(
    new THREE.Vector3(5, 0, 5),
    new THREE.Vector3(6, 1, 6)
  );

  assert.equal(boxA.intersectsBox(boxIntersecting), true, 'Overlapping boxes must intersect');
  assert.equal(boxA.intersectsBox(boxFar), false, 'Separated boxes must not intersect');
});

test('ObstacleSpawner: fast spawn rate and difficulty scaling', () => {
  const dummyPool = { get: () => null };
  const spawner = new ObstacleSpawner(dummyPool);
  assert.equal(WorldConfig.MAX_OBSTACLE_INTERVAL <= 0.85, true, 'Max obstacle interval should be fast (<= 0.85s)');
  assert.equal(WorldConfig.MIN_OBSTACLE_INTERVAL <= 0.40, true, 'Min obstacle interval should be fast (<= 0.40s)');

  // Update spawner with initial speed and base difficulty
  spawner.update(0.1, WorldConfig.INITIAL_SPEED, 1.0);
  assert.ok(spawner.spawnInterval <= 0.85, 'Initial spawn interval should be fast');

  // Higher difficulty / speed produces even faster spawn interval
  spawner.update(0.1, 45.0, 1.5);
  assert.ok(spawner.spawnInterval < 0.85, 'Higher speed and difficulty should spawn obstacles faster');
});
