import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';
import { MovementController } from './MovementController.js';
import { PlayerPhysics } from './PlayerPhysics.js';

export class Player {
  constructor(scene, callbacks = {}) {
    this.scene = scene;
    this.callbacks = callbacks;

    // Subsystems
    this.movement = new MovementController();
    this.physics = new PlayerPhysics({
      onJump: () => {
        if (this.callbacks.onJump) this.callbacks.onJump();
      },
      onLand: (impact) => {
        if (this.callbacks.onLand) this.callbacks.onLand(impact, this.meshGroup.position);
      }
    });

    // Root Group
    this.meshGroup = new THREE.Group();
    this.cubeGroup = new THREE.Group(); // Inner group for rotation & squash
    this.meshGroup.add(this.cubeGroup);

    // Collision Box
    this.hitbox = new THREE.Box3();
    this.hitboxSize = new THREE.Vector3(
      WorldConfig.PLAYER_HITBOX.width,
      WorldConfig.PLAYER_HITBOX.height,
      WorldConfig.PLAYER_HITBOX.depth
    );

    this.halfHeight = WorldConfig.PLAYER_SIZE.height / 2;
    this.idleBobTimer = 0;

    this._createPlayerMeshes();
    this.scene.add(this.meshGroup);

    this.reset();
  }

  _createPlayerMeshes() {
    const size = WorldConfig.PLAYER_SIZE.width;
    const geometry = new THREE.BoxGeometry(size, size, size);

    // 1. Semi-translucent dark metallic outer shell
    const outerMaterial = new THREE.MeshStandardMaterial({
      color: 0x050a18,
      roughness: 0.15,
      metalness: 0.85,
      transparent: true,
      opacity: 0.88,
      emissive: 0x002233,
      emissiveIntensity: 0.4
    });

    this.outerMesh = new THREE.Mesh(geometry, outerMaterial);
    this.cubeGroup.add(this.outerMesh);

    // 2. Bright Cyan Emissive Outlines
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: WorldConfig.COLORS.cyan,
      linewidth: 2
    });
    this.edgeLines = new THREE.LineSegments(edgesGeometry, lineMaterial);
    this.cubeGroup.add(this.edgeLines);

    // 3. Inner Glowing Energy Core
    const coreSize = size * 0.58;
    const coreGeo = new THREE.BoxGeometry(coreSize, coreSize, coreSize);
    const coreMat = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.magenta,
      wireframe: false
    });
    this.innerCore = new THREE.Mesh(coreGeo, coreMat);
    this.cubeGroup.add(this.innerCore);

    // 4. Subtle Player Point Light
    this.glowLight = new THREE.PointLight(WorldConfig.COLORS.cyan, 2.5, 8.0);
    this.glowLight.position.set(0, 0, 0);
    this.meshGroup.add(this.glowLight);
  }

  moveLeft() {
    return this.movement.moveLeft();
  }

  moveRight() {
    return this.movement.moveRight();
  }

  jump() {
    return this.physics.jump();
  }

  update(dt) {
    this.movement.update(dt);
    this.physics.update(dt);

    this.idleBobTimer += dt * 8.0;

    // Calculate Y position: physics height + half cube height + subtle idle bob when grounded
    const bob = this.physics.isGrounded ? Math.sin(this.idleBobTimer) * 0.05 : 0;
    const posY = this.physics.y + this.halfHeight + bob;

    this.meshGroup.position.set(this.movement.currentX, posY, 0);

    // Squash, stretch and roll tilt on inner cube group
    this.cubeGroup.scale.set(
      this.physics.scaleX,
      this.physics.scaleY,
      this.physics.scaleZ
    );

    this.cubeGroup.rotation.z = this.movement.bankAngle;
    
    // Slow hypnotic spin of inner core
    this.innerCore.rotation.x += dt * 2.0;
    this.innerCore.rotation.y += dt * 3.0;

    // Update AABB Collision Box tightly around current position
    const pos = this.meshGroup.position;
    this.hitbox.min.set(
      pos.x - this.hitboxSize.x / 2,
      pos.y - this.hitboxSize.y / 2,
      pos.z - this.hitboxSize.z / 2
    );
    this.hitbox.max.set(
      pos.x + this.hitboxSize.x / 2,
      pos.y + this.hitboxSize.y / 2,
      pos.z + this.hitboxSize.z / 2
    );
  }

  reset() {
    this.movement.reset();
    this.physics.reset();
    this.idleBobTimer = 0;
    this.meshGroup.position.set(0, this.halfHeight, 0);
    this.cubeGroup.scale.set(1, 1, 1);
    this.cubeGroup.rotation.set(0, 0, 0);
    this.outerMesh.visible = true;
    this.edgeLines.visible = true;
    this.innerCore.visible = true;
    this.update(0.001);
  }

  hideVisuals() {
    this.outerMesh.visible = false;
    this.edgeLines.visible = false;
    this.innerCore.visible = false;
  }
}
