import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { WorldConfig } from '../world/WorldConfig.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isBloomEnabled = true;

    this._initScene();
    this._initCamera();
    this._initRenderer();
    this._initLighting();
    this._initPostProcessing();
    this._bindResize();
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(WorldConfig.COLORS.bg);
    this.scene.fog = new THREE.FogExp2(WorldConfig.COLORS.bg, 0.008);
  }

  _initCamera() {
    const cfg = WorldConfig.CAMERA;
    this.camera = new THREE.PerspectiveCamera(
      cfg.fov,
      this.width / this.height,
      cfg.near,
      cfg.far
    );
    this.camera.position.set(cfg.offset.x, cfg.offset.y, cfg.offset.z);
    this.camera.lookAt(cfg.lookAtOffset.x, cfg.lookAtOffset.y, cfg.lookAtOffset.z);
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    
    this.container.appendChild(this.renderer.domElement);
  }

  _initLighting() {
    // 1. Ambient digital void illumination
    const ambientLight = new THREE.AmbientLight(0x280f48, 1.2);
    this.scene.add(ambientLight);

    // 2. Cyan key directional light from above
    const dirLight = new THREE.DirectionalLight(WorldConfig.COLORS.cyan, 1.8);
    dirLight.position.set(5, 20, 10);
    this.scene.add(dirLight);

    // 3. Electric purple fill light from front
    const fillLight = new THREE.DirectionalLight(WorldConfig.COLORS.purple, 1.2);
    fillLight.position.set(-8, 15, -15);
    this.scene.add(fillLight);

    // 4. Subtle Magenta rim light from horizon
    const horizonLight = new THREE.DirectionalLight(WorldConfig.COLORS.magenta, 1.0);
    horizonLight.position.set(0, 5, -80);
    this.scene.add(horizonLight);
  }

  _initPostProcessing() {
    try {
      this.composer = new EffectComposer(this.renderer);
      
      const renderPass = new RenderPass(this.scene, this.camera);
      this.composer.addPass(renderPass);

      // Unreal Bloom Pass for authentic neon glow
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(this.width, this.height),
        1.3,   // Bloom strength
        0.55,  // Bloom radius
        0.25   // Bloom threshold
      );
      this.composer.addPass(this.bloomPass);
    } catch (e) {
      console.warn('[SceneManager] Post-processing initialization failed, falling back to standard renderer:', e);
      this.isBloomEnabled = false;
      this.composer = null;
    }
  }

  toggleBloom() {
    this.isBloomEnabled = !this.isBloomEnabled;
    return this.isBloomEnabled;
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));

      if (this.composer) {
        this.composer.setSize(this.width, this.height);
      }
    });
  }

  render() {
    if (this.isBloomEnabled && this.composer) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
