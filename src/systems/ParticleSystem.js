import * as THREE from 'three';
import { WorldConfig } from '../world/WorldConfig.js';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    
    // Trail particles
    this.maxTrail = 60;
    this.trailParticles = [];
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailPositions = new Float32Array(this.maxTrail * 3);
    this.trailColors = new Float32Array(this.maxTrail * 3);
    this.trailSizes = new Float32Array(this.maxTrail);
    
    this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));
    this.trailGeometry.setAttribute('color', new THREE.BufferAttribute(this.trailColors, 3));
    this.trailGeometry.setAttribute('size', new THREE.BufferAttribute(this.trailSizes, 1));

    const trailMaterial = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.trailPoints = new THREE.Points(this.trailGeometry, trailMaterial);
    this.scene.add(this.trailPoints);

    // Explosions / Disintegration fragments
    this.maxExplosion = 80;
    this.explosionActive = false;
    this.explosionParticles = [];
    
    const explosionGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const explosionMat = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.cyan,
      wireframe: false
    });

    this.explosionGroup = new THREE.Group();
    for (let i = 0; i < this.maxExplosion; i++) {
      const mesh = new THREE.Mesh(explosionGeo, explosionMat.clone());
      mesh.visible = false;
      this.explosionGroup.add(mesh);
      this.explosionParticles.push({
        mesh,
        velocity: new THREE.Vector3(),
        rotVelocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1.0
      });
    }
    this.scene.add(this.explosionGroup);

    // Landing shockwaves
    this.landingRing = this._createLandingRing();
    this.scene.add(this.landingRing);
  }

  _createLandingRing() {
    const geo = new THREE.RingGeometry(0.3, 0.6, 24);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: WorldConfig.COLORS.cyan,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.y = 0.05;
    ring.visible = false;
    return ring;
  }

  emitTrail(playerPos, isJumping) {
    if (this.trailParticles.length >= this.maxTrail) {
      this.trailParticles.shift();
    }

    const color = isJumping ? new THREE.Color(WorldConfig.COLORS.magenta) : new THREE.Color(WorldConfig.COLORS.cyan);
    this.trailParticles.push({
      pos: new THREE.Vector3(
        playerPos.x + (Math.random() - 0.5) * 0.4,
        playerPos.y + 0.3 + (Math.random() - 0.5) * 0.3,
        playerPos.z + 0.6
      ),
      color: color,
      life: 1.0,
      decay: 2.5
    });
  }

  triggerLanding(pos) {
    this.landingRing.position.set(pos.x, 0.04, pos.z);
    this.landingRing.scale.set(0.5, 0.5, 0.5);
    this.landingRing.material.opacity = 0.85;
    this.landingRing.visible = true;
    this.landingRingLife = 1.0;
  }

  triggerExplosion(pos) {
    this.explosionActive = true;
    for (let i = 0; i < this.maxExplosion; i++) {
      const p = this.explosionParticles[i];
      p.mesh.position.copy(pos);
      p.mesh.position.x += (Math.random() - 0.5) * 0.8;
      p.mesh.position.y += (Math.random() - 0.5) * 0.8;
      p.mesh.position.z += (Math.random() - 0.5) * 0.8;
      
      const speed = 6 + Math.random() * 14;
      p.velocity.set(
        (Math.random() - 0.5) * 2,
        Math.random() * 1.5 + 0.5,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(speed);

      p.rotVelocity.set(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      );

      p.life = 1.0;
      p.maxLife = 0.8 + Math.random() * 0.6;
      p.mesh.material.color.setHex(Math.random() > 0.4 ? WorldConfig.COLORS.cyan : WorldConfig.COLORS.magenta);
      p.mesh.visible = true;
    }
  }

  update(dt, speed) {
    // 1. Update trail
    const posArr = this.trailPositions;
    const colArr = this.trailColors;
    let count = 0;

    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.life -= dt * p.decay;
      // World moves toward +Z
      p.pos.z += speed * dt;

      if (p.life <= 0) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      const idx = count * 3;
      posArr[idx] = p.pos.x;
      posArr[idx + 1] = p.pos.y;
      posArr[idx + 2] = p.pos.z;

      colArr[idx] = p.color.r * p.life;
      colArr[idx + 1] = p.color.g * p.life;
      colArr[idx + 2] = p.color.b * p.life;

      count++;
    }

    // Zero out the remaining slots
    for (let i = count * 3; i < this.maxTrail * 3; i++) {
      posArr[i] = 0;
      colArr[i] = 0;
    }

    this.trailGeometry.attributes.position.needsUpdate = true;
    this.trailGeometry.attributes.color.needsUpdate = true;
    this.trailGeometry.setDrawRange(0, count);

    // 2. Update landing ring
    if (this.landingRing.visible) {
      this.landingRingLife -= dt * 3.5;
      this.landingRing.position.z += speed * dt;
      const s = 1.0 + (1.0 - this.landingRingLife) * 3.5;
      this.landingRing.scale.set(s, s, s);
      this.landingRing.material.opacity = Math.max(0, this.landingRingLife);
      if (this.landingRingLife <= 0) {
        this.landingRing.visible = false;
      }
    }

    // 3. Update explosion particles
    if (this.explosionActive) {
      let activeCount = 0;
      for (let i = 0; i < this.maxExplosion; i++) {
        const p = this.explosionParticles[i];
        if (!p.mesh.visible) continue;

        p.life -= dt / p.maxLife;
        if (p.life <= 0) {
          p.mesh.visible = false;
          continue;
        }

        activeCount++;
        p.velocity.y -= WorldConfig.GRAVITY * 0.7 * dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.mesh.position.z += speed * 0.3 * dt;

        p.mesh.rotation.x += p.rotVelocity.x * dt;
        p.mesh.rotation.y += p.rotVelocity.y * dt;
        p.mesh.rotation.z += p.rotVelocity.z * dt;

        const scale = Math.max(0.01, p.life * 0.2);
        p.mesh.scale.set(scale, scale, scale);
      }

      if (activeCount === 0) {
        this.explosionActive = false;
      }
    }
  }

  reset() {
    this.trailParticles = [];
    this.trailGeometry.setDrawRange(0, 0);
    this.landingRing.visible = false;
    this.explosionActive = false;
    for (let i = 0; i < this.maxExplosion; i++) {
      this.explosionParticles[i].mesh.visible = false;
    }
  }
}
