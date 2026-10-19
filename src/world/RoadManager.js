import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export class RoadManager {
  constructor(scene) {
    this.scene = scene;
    this.segments = [];
    this.segmentLength = WorldConfig.SEGMENT_LENGTH;
    this.numSegments = WorldConfig.NUM_SEGMENTS;
    this.totalRoadLength = this.segmentLength * this.numSegments;

    this.roadGroup = new THREE.Group();
    this.scene.add(this.roadGroup);

    this._initSharedMaterials();
    this._createRoadSegments();
  }

  _initSharedMaterials() {
    // Dark road surface
    this.roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x070114,
      roughness: 0.35,
      metalness: 0.8
    });

    // Glowing Neon Lane Divider Lines
    this.laneLineMaterial = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.cyan
    });

    // Outer Neon Guardrails
    this.railMaterial = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.magenta
    });

    // Grid cross lines
    this.gridMaterial = new THREE.LineBasicMaterial({
      color: WorldConfig.COLORS.purple,
      transparent: true,
      opacity: 0.4
    });
  }

  _createSegment(index) {
    const group = new THREE.Group();
    const length = this.segmentLength;
    const width = WorldConfig.ROAD_WIDTH;

    // 1. Road Bed
    const roadGeo = new THREE.PlaneGeometry(width, length);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.position.y = 0;
    group.add(roadMesh);

    // 2. Neon Grid lines across the road
    const gridLineCount = 12;
    const step = length / gridLineCount;
    for (let i = 0; i < gridLineCount; i++) {
      const zOffset = -length / 2 + i * step;
      const points = [
        new THREE.Vector3(-width / 2, 0.02, zOffset),
        new THREE.Vector3(width / 2, 0.02, zOffset)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, this.gridMaterial);
      group.add(line);
    }

    // 3. Lane Dividers (Dashed stripes at x = -1.5 and x = 1.5)
    const stripeCount = 6;
    const stripeLen = 4.0;
    const stripeWidth = 0.12;
    const stripeGeo = new THREE.PlaneGeometry(stripeWidth, stripeLen);
    stripeGeo.rotateX(-Math.PI / 2);

    const stripeStep = length / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const zPos = -length / 2 + i * stripeStep + stripeLen / 2;

      // Left divider
      const leftStripe = new THREE.Mesh(stripeGeo, this.laneLineMaterial);
      leftStripe.position.set(-1.5, 0.03, zPos);
      group.add(leftStripe);

      // Right divider
      const rightStripe = new THREE.Mesh(stripeGeo, this.laneLineMaterial);
      rightStripe.position.set(1.5, 0.03, zPos);
      group.add(rightStripe);
    }

    // 4. Glowing Guardrails / Curbs on road edges
    const railGeo = new THREE.BoxGeometry(0.25, 0.35, length);
    const leftRail = new THREE.Mesh(railGeo, this.railMaterial);
    leftRail.position.set(-width / 2, 0.18, 0);
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, this.railMaterial);
    rightRail.position.set(width / 2, 0.18, 0);
    group.add(rightRail);

    // Position segment along Z
    const startZ = 20.0;
    const initialZ = startZ - index * length - length / 2;
    group.position.set(0, 0, initialZ);

    return group;
  }

  _createRoadSegments() {
    for (let i = 0; i < this.numSegments; i++) {
      const segment = this._createSegment(i);
      this.segments.push(segment);
      this.roadGroup.add(segment);
    }
  }

  update(dt, speed) {
    const moveZ = speed * dt;
    const recycleThreshold = 30.0; // Segment center passes behind camera

    for (let i = 0; i < this.segments.length; i++) {
      const seg = this.segments[i];
      seg.position.z += moveZ;

      if (seg.position.z > recycleThreshold + this.segmentLength / 2) {
        // Move to the very back of the road chain
        seg.position.z -= this.totalRoadLength;
      }
    }
  }

  reset() {
    const startZ = 20.0;
    for (let i = 0; i < this.segments.length; i++) {
      const initialZ = startZ - i * this.segmentLength - this.segmentLength / 2;
      this.segments[i].position.set(0, 0, initialZ);
    }
  }
}
