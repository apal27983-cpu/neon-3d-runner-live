import * as THREE from 'three';
import { WorldConfig } from './WorldConfig.js';

export class EnvironmentManager {
  constructor(scene) {
    this.scene = scene;
    this.envGroup = new THREE.Group();
    this.buildings = [];
    this.totalBuildings = WorldConfig.NUM_BUILDINGS;
    this.zRange = 360.0;

    this.scene.add(this.envGroup);

    this._createSynthwaveSun();
    this._createGroundGrid();
    this._createCityScrapers();
    this._createAtmosphericMotes();
  }

  _createSynthwaveSun() {
    // Sliced Synthwave Sun in the distance
    const sunGroup = new THREE.Group();
    sunGroup.position.set(0, 32, -320);

    const sunRadius = 45;
    const stripeCount = 14;
    const stripeHeight = (sunRadius * 2) / stripeCount;

    for (let i = 0; i < stripeCount; i++) {
      // Lower slices get narrower gaps
      const gap = Math.pow(i / stripeCount, 1.8) * 1.8;
      const height = Math.max(0.4, stripeHeight - gap);
      const yOffset = -sunRadius + i * stripeHeight + height / 2;

      // Calculate width of slice at this Y
      const r = Math.sqrt(Math.max(0, sunRadius * sunRadius - yOffset * yOffset));
      if (r <= 0) continue;

      const geo = new THREE.PlaneGeometry(r * 2, height);
      
      // Color gradient from bright yellow/orange at bottom to hot pink/magenta at top
      const t = i / stripeCount;
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0xff007f),
        new THREE.Color(0xffaa00),
        1.0 - t
      );

      const mat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      });

      const slice = new THREE.Mesh(geo, mat);
      slice.position.set(0, yOffset, 0);
      sunGroup.add(slice);
    }

    this.envGroup.add(sunGroup);
  }

  _createGroundGrid() {
    // Expansive digital void grid flanking the road
    const size = 600;
    const divisions = 60;
    const gridHelper = new THREE.GridHelper(
      size, 
      divisions, 
      WorldConfig.COLORS.magenta, 
      WorldConfig.COLORS.purple
    );
    gridHelper.position.set(0, -0.05, -100);
    gridHelper.material.opacity = 0.25;
    gridHelper.material.transparent = true;
    this.envGroup.add(gridHelper);
  }

  _createCityScrapers() {
    this.buildingsGroup = new THREE.Group();
    this.envGroup.add(this.buildingsGroup);

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x050110,
      roughness: 0.7,
      metalness: 0.6
    });

    const windowColors = [WorldConfig.COLORS.cyan, WorldConfig.COLORS.purple, WorldConfig.COLORS.magenta];

    for (let i = 0; i < this.totalBuildings; i++) {
      const isLeft = i % 2 === 0;
      const side = isLeft ? -1 : 1;
      
      const width = 6 + Math.random() * 8;
      const depth = 6 + Math.random() * 8;
      const height = 18 + Math.random() * 55;

      const group = new THREE.Group();
      const geo = new THREE.BoxGeometry(width, height, depth);
      const mesh = new THREE.Mesh(geo, buildingMat);
      mesh.position.y = height / 2;
      group.add(mesh);

      // Glowing edges
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const edgeColor = windowColors[Math.floor(Math.random() * windowColors.length)];
      const edgeMat = new THREE.LineBasicMaterial({
        color: edgeColor,
        transparent: true,
        opacity: 0.65
      });
      const edges = new THREE.LineSegments(edgeGeo, edgeMat);
      edges.position.y = height / 2;
      group.add(edges);

      // Rooftop glowing beacon
      const beaconGeo = new THREE.BoxGeometry(0.5, 3 + Math.random() * 4, 0.5);
      const beaconMat = new THREE.MeshBasicMaterial({ color: edgeColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = height + 1.5;
      group.add(beacon);

      // Position along road sides
      const posX = side * (WorldConfig.CITY_BOUNDS_X + Math.random() * 25);
      const posZ = 20.0 - (i / this.totalBuildings) * this.zRange;
      group.position.set(posX, 0, posZ);

      this.buildingsGroup.add(group);
      this.buildings.push({
        group,
        baseX: posX
      });
    }
  }

  _createAtmosphericMotes() {
    // Floating digital dust motes
    const count = 150;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 30 + 1;
      pos[i * 3 + 2] = -Math.random() * 300;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: WorldConfig.COLORS.cyan,
      size: 0.45,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.motes = new THREE.Points(geo, mat);
    this.envGroup.add(this.motes);
  }

  update(dt, speed) {
    const moveZ = speed * dt;
    const recycleThreshold = 30.0;

    // Scroll buildings and recycle
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      b.group.position.z += moveZ;

      if (b.group.position.z > recycleThreshold) {
        b.group.position.z -= this.zRange;
      }
    }

    // Scroll atmospheric particles
    if (this.motes) {
      const positions = this.motes.geometry.attributes.position.array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += moveZ * 0.8;
        if (positions[i * 3 + 2] > 20) {
          positions[i * 3 + 2] -= 300;
        }
      }
      this.motes.geometry.attributes.position.needsUpdate = true;
    }
  }

  reset() {
    for (let i = 0; i < this.buildings.length; i++) {
      const b = this.buildings[i];
      const initialZ = 20.0 - (i / this.totalBuildings) * this.zRange;
      b.group.position.z = initialZ;
    }
  }
}
