# NEON RUSH: CYBER RUNNER

A high-speed, visually stunning 3D synthwave endless runner game built with **Three.js**, **WebGL**, and modern JavaScript ES Modules, bundled with **Vite**.

![NEON RUSH Preview](https://raw.githubusercontent.com/mrdoob/three.js/dev/files/icon.svg)

---

## 🕹️ Game Overview

In **NEON RUSH: CYBER RUNNER**, you pilot a glowing neon cyber cube racing along an infinite digital highway suspended in a retro-futuristic synthwave metropolis. Switch between 3 lanes, perform gravity-defying jumps over obstacles, trigger near-miss dodge bonuses, and survive as long as possible as velocity accelerates to warp speed.

---

## 🎮 Controls

### Desktop Keyboard
- **Move Left:** `ArrowLeft` or `A`
- **Move Right:** `ArrowRight` or `D`
- **Jump:** `Spacebar` or `W` or `ArrowUp`
- **Start / Reboot:** `Enter`
- **Pause / Resume:** `Escape` or `P`
- **Toggle Audio:** `M` or audio button on HUD

### Mobile / Touch Devices
- **Swipe Left / Right:** Switch lanes
- **Swipe Up / Tap Screen:** Jump
- **On-Screen Buttons:** Dedicated `◀`, `▶`, and `▲ JUMP` touch buttons displayed automatically on mobile/touch screens

---

## ✨ Features & Visual Highlights

- **3D Glowing Neon Character:**
  - Dark metallic cyber cube with bright cyan edge lighting (`EdgesGeometry` + `LineSegments`).
  - Inner hypnotic rotating energy core with magenta emissive auras.
  - Dynamic lighting cast beneath the cube onto the road surface.
  - Squash-and-stretch animation upon jump launch and ground impact.
  - Dynamic lateral banking/tilt when shifting lanes.
  - Continuous glowing particle trail emitted behind the player.

- **Endless Retro-Synthwave World:**
  - Multi-segment infinite road scrolling with seamless recycling and zero gaps.
  - Cyan and electric purple perspective grid lines.
  - Sliced retro synthwave sun on the horizon with horizontal scanline apertures and vibrant orange-to-magenta gradient.
  - Procedural cyberpunk skyscrapers flanking both sides of the highway with illuminated neon window matrices and rooftop spires.
  - Atmospheric digital dust motes and speed lines at high velocities.

- **Diverse Procedural Obstacles:**
  - **Type A (Neon Barrier):** Low glowing hurdle that can be jumped over or dodged sideways.
  - **Type B (Energy Block):** Large solid cube with glowing interior lattice. Requires lane change.
  - **Type C (Cyber Pillar):** Tall hexagonal cyber obelisk with rotating magenta energy ring.
  - **Type D (Laser Gate):** Futuristic twin pylons with pulsating horizontal laser beam.
  - **Fair Wave Generator:** Never spawns unjumpable hazards across all 3 lanes at once; always preserves a viable path.

- **Robust 3D AABB Collision Detection:**
  - High-precision `THREE.Box3` bounding box collision detection.
  - Hitboxes strictly bound to solid obstacles (separate from decorative glow).
  - Swept Z checks to eliminate tunneling at warp speeds.
  - Thrilling near-miss detection awarding score bonuses and camera reactions.

- **Audio System:**
  - Synthesized sound effects generated live using the **Web Audio API** (zero external sound files needed).
  - Procedural driving 16th-note synthwave bassline and arpeggio music engine that dynamically speeds up as velocity increases.
  - Full mute / unmute toggle.

- **Post-Processing & Graphics:**
  - Authentic retro synthwave bloom using Three.js `UnrealBloomPass` and `EffectComposer`.
  - CRT scanlines and subtle dark vignette overlays.
  - Configurable bloom toggle (`ULTRA` vs `STANDARD`) for adaptable performance.

---

## 🏗️ Modular Architecture

```
3D-Runner-Game/
├── index.html                  # Semantic UI overlay & WebGL canvas container
├── package.json                # Dependencies and scripts
├── vite.config.js              # Vite server & bundler configuration
├── src/
│   ├── main.js                 # Entry point & bootstrap error handling
│   ├── styles/
│   │   ├── main.css            # Base typography, layout, cyber cards, buttons
│   │   ├── hud.css             # In-game HUD, speedometer, stat grids, touch buttons
│   │   └── effects.css         # CRT scanlines, vignette, screen shake, impact flash
│   ├── core/
│   │   ├── Game.js             # Main game coordinator & requestAnimationFrame loop
│   │   ├── GameState.js        # State machine (READY, PLAYING, PAUSED, GAME_OVER)
│   │   ├── SceneManager.js     # WebGL renderer, camera, lights, UnrealBloomPass
│   │   ├── InputManager.js     # Keyboard and touch/swipe event mapping
│   │   └── TimeManager.js      # Delta-time tracking with large-step clamping
│   ├── player/
│   │   ├── Player.js           # 3D player cube composition & animations
│   │   ├── MovementController.js # 3-lane interpolation with banking roll
│   │   └── PlayerPhysics.js    # Gravity, jump impulses, squash-and-stretch
│   ├── world/
│   │   ├── WorldConfig.js      # Centralized gameplay constants & color palette
│   │   ├── RoadManager.js      # Infinite recycling segmented highway
│   │   └── EnvironmentManager.js # Sun, scrolling skyline, digital dust
│   ├── obstacles/
│   │   ├── Obstacle.js         # Procedural 3D obstacle models & hitboxes
│   │   ├── ObstaclePool.js     # Zero-GC instance pool
│   │   ├── ObstacleSpawner.js  # Fair pattern wave generator
│   │   └── ObstacleManager.js  # Active obstacle updates & lifecycle
│   ├── systems/
│   │   ├── CollisionSystem.js  # 3D AABB intersection & swept detection
│   │   ├── ScoreSystem.js      # Distance, near-miss bonuses, localStorage record
│   │   ├── DifficultySystem.js # Speed acceleration & level tiers
│   │   ├── ParticleSystem.js   # Trails, landing rings, voxel explosions
│   │   └── AudioManager.js     # Web Audio API synth sound effects & music
│   ├── camera/
│   │   └── FollowCamera.js     # Smooth 3rd-person camera with trauma shake & dynamic FOV
│   └── ui/
│       └── UIManager.js        # DOM HUD and overlay screens controller
└── test/
    └── gameplay.test.js        # Automated unit tests for core game mechanics
```

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000/`.

### 3. Run Automated Tests
```bash
npm test
```
Executes unit tests covering lane changes, boundary clamping, jump gravity, state machine transitions, scoring bonuses, difficulty scaling, and AABB collision logic.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🛠️ Troubleshooting

- **Canvas is black or blank:**
  - Verify that WebGL is enabled in your browser: visit `chrome://gpu` or `about:support` to ensure hardware acceleration is active.
- **Low Framerate on Older Devices:**
  - Click the `BLOOM: ULTRA` button in the start screen (or press audio/graphics options) to switch to `STANDARD` mode. This disables the heavy post-processing bloom pass while preserving crisp emissive materials.
- **Audio Not Playing:**
  - Browsers enforce autoplay policies that block Web Audio before user interaction. Clicking `INITIALIZE RUN` or pressing any key automatically resumes the audio context. Ensure the in-game audio toggle is set to `SYNTH ON` (`🔊`).
- **Input Lag / Unintended Key Repeats:**
  - The `InputManager` automatically filters out OS key repeats for lane switching, ensuring one press corresponds precisely to one lane change.

---

## 📄 License
MIT License. Built for retro-futuristic arcade enthusiasts.
