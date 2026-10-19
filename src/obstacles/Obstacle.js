import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export const ObstacleType = {
  BARRIER: 'BARRIER',       // Low hurdle: jumpable or switch lane
  ENERGY_BLOCK: 'BLOCK',     // Tall cube: switch lane required
  CYBER_PILLAR: 'PILLAR',    // Vertical pillar: switch lane required
  LASER_GATE: 'LASER_GATE'   // Laser gate: jumpable beam
};

export class Obstacle {
  constructor(type, scene) {
    this.type = type;
    this.scene = scene;
    this.meshGroup = new THREE.Group();
    this.active = false;
    this.laneIndex = 1;
    this.laneX = 0;
    
    // Dedicated AABB Collision Box
    this.hitbox = new THREE.Box3();
    this.hitboxDimensions = new THREE.Vector3();

    // Pulse animation timer
    this.animTimer = Math.random() * Math.PI;

    this._buildMesh();
    this.meshGroup.visible = false;
    this.scene.add(this.meshGroup);
  }

  _buildMesh() {
    switch (this.type) {
      case ObstacleType.BARRIER:
        this._buildBarrier();
        break;
      case ObstacleType.ENERGY_BLOCK:
        this._buildEnergyBlock();
        break;
      case ObstacleType.CYBER_PILLAR:
        this._buildCyberPillar();
        break;
      case ObstacleType.LASER_GATE:
        this._buildLaserGate();
        break;
    }
  }

  _buildBarrier() {
    // Low hurdle barrier - Height: 0.9, Width: 2.4, Depth: 0.5
    const width = 2.4;
    const height = 0.9;
    const depth = 0.5;

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x050118,
      roughness: 0.2,
      metalness: 0.85
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    this.meshGroup.add(mesh);

    // Glowing Neon Yellow/Pink Edges
    const edges = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: WorldConfig.COLORS.pink,
      linewidth: 2
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    edgeLines.position.y = height / 2;
    this.meshGroup.add(edgeLines);

    // Neon hazard center strip
    const stripGeo = new THREE.BoxGeometry(width * 0.9, 0.18, depth + 0.04);
    const stripMat = new THREE.MeshBasicMaterial({ color: WorldConfig.COLORS.magenta });
    const strip = new THREE.Mesh(stripGeo, stripMat);
    strip.position.y = height * 0.55;
    this.meshGroup.add(strip);

    // Collision dimensions (exact physical body)
    this.hitboxDimensions.set(width * 0.88, height * 0.9, depth * 0.85);
  }

  _buildEnergyBlock() {
    // Large solid block - Height: 2.4, Width: 2.2, Depth: 1.8
    const width = 2.2;
    const height = 2.4;
    const depth = 1.8;

    const geo = new THREE.BoxGeometry(width, height, depth);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x0c0022,
      roughness: 0.1,
      metalness: 0.9
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    this.meshGroup.add(mesh);

    // Bright Purple/Cyan glowing wireframe
    const edges = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: WorldConfig.COLORS.purple,
      linewidth: 2
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    edgeLines.position.y = height / 2;
    this.meshGroup.add(edgeLines);

    // Glowing interior pulse core
    const coreGeo = new THREE.BoxGeometry(width * 0.6, height * 0.6, depth * 0.6);
    const coreMat = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.cyan,
      wireframe: true
    });
    this.blockCore = new THREE.Mesh(coreGeo, coreMat);
    this.blockCore.position.y = height / 2;
    this.meshGroup.add(this.blockCore);

    this.hitboxDimensions.set(width * 0.88, height * 0.92, depth * 0.85);
  }

  _buildCyberPillar() {
    // Tall obelisk - Height: 4.8, Width: 1.4, Depth: 1.4
    const radius = 0.85;
    const height = 4.8;
    const geo = new THREE.CylinderGeometry(radius * 0.7, radius, height, 6);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x070114,
      metalness: 0.9,
      roughness: 0.2
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = height / 2;
    this.meshGroup.add(mesh);

    const edges = new THREE.EdgesGeometry(geo);
    const edgeMat = new THREE.LineBasicMaterial({
      color: WorldConfig.COLORS.cyan,
      linewidth: 2
    });
    const edgeLines = new THREE.LineSegments(edges, edgeMat);
    edgeLines.position.y = height / 2;
    this.meshGroup.add(edgeLines);

    // Rotating energy ring around the pillar
    const ringGeo = new THREE.TorusGeometry(radius * 1.25, 0.08, 8, 16);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: WorldConfig.COLORS.magenta });
    this.pillarRing = new THREE.Mesh(ringGeo, ringMat);
    this.pillarRing.position.y = height * 0.45;
    this.meshGroup.add(this.pillarRing);

    this.hitboxDimensions.set(radius * 1.6, height, radius * 1.6);
  }

  _buildLaserGate() {
    // Laser gate with 2 side pylons and a horizontal glowing beam
    const pylonHeight = 3.0;
    const pylonRadius = 0.2;
    const spanWidth = 2.6;

    const pylonGeo = new THREE.CylinderGeometry(pylonRadius, pylonRadius, pylonHeight, 8);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x111122, metalness: 0.9 });

    // Left pylon
    const pylonLeft = new THREE.Mesh(pylonGeo, pylonMat);
    pylonLeft.position.set(-spanWidth / 2, pylonHeight / 2, 0);
    this.meshGroup.add(pylonLeft);

    // Right pylon
    const pylonRight = new THREE.Mesh(pylonGeo, pylonMat);
    pylonRight.position.set(spanWidth / 2, pylonHeight / 2, 0);
    this.meshGroup.add(pylonRight);

    // Horizontal Laser Beam
    const beamRadius = 0.12;
    const beamGeo = new THREE.CylinderGeometry(beamRadius, beamRadius, spanWidth, 8);
    beamGeo.rotateZ(Math.PI / 2);
    this.beamMat = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.cyan
    });
    this.laserBeam = new THREE.Mesh(beamGeo, this.beamMat);
    // Beam sits at height 0.85 (jumpable)
    this.laserBeam.position.set(0, 0.85, 0);
    this.meshGroup.add(this.laserBeam);

    this.hitboxDimensions.set(spanWidth * 0.92, 0.5, 0.5);
  }

  spawn(laneIndex, zPos) {
    this.laneIndex = laneIndex;
    this.laneX = WorldConfig.LANES[laneIndex];
    this.meshGroup.position.set(this.laneX, 0, zPos);
    this.meshGroup.visible = true;
    this.active = true;
    this.updateHitbox();
  }

  update(dt, speed) {
    if (!this.active) return;

    this.meshGroup.position.z += speed * dt;
    this.animTimer += dt * 4.0;

    // Type-specific animations
    if (this.blockCore) {
      this.blockCore.rotation.y += dt * 1.5;
    }
    if (this.pillarRing) {
      this.pillarRing.rotation.y += dt * 3.0;
      this.pillarRing.position.y = 2.2 + Math.sin(this.animTimer) * 0.4;
    }
    if (this.laserBeam) {
      const pulse = 0.85 + Math.sin(this.animTimer * 2.0) * 0.15;
      this.laserBeam.scale.set(1, pulse, pulse);
    }

    this.updateHitbox();
  }

  updateHitbox() {
    const pos = this.meshGroup.position;
    const hx = this.hitboxDimensions.x / 2;
    const hz = this.hitboxDimensions.z / 2;
    
    // Y bounds depend on obstacle type
    let minY = 0;
    let maxY = this.hitboxDimensions.y;
    if (this.type === ObstacleType.LASER_GATE) {
      minY = 0.6;
      maxY = 1.1;
    }

    this.hitbox.min.set(pos.x - hx, minY, pos.z - hz);
    this.hitbox.max.set(pos.x + hx, maxY, pos.z + hz);
  }

  recycle() {
    this.active = false;
    this.meshGroup.visible = false;
  }
}
