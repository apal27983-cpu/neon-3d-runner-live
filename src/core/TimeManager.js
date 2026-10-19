export class TimeManager {
  constructor() {
    this.lastTime = performance.now();
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.maxDeltaTime = 0.1; // Clamp to 100ms max
    this.timeScale = 1.0;
  }

  update() {
    const now = performance.now();
    const rawDelta = (now - this.lastTime) / 1000.0;
    this.lastTime = now;

    // Clamp delta time to avoid large physics steps after tab switches
    this.deltaTime = Math.min(rawDelta, this.maxDeltaTime) * this.timeScale;
    this.elapsedTime += this.deltaTime;

    return this.deltaTime;
  }

  reset() {
    this.lastTime = performance.now();
    this.deltaTime = 0;
    this.elapsedTime = 0;
    this.timeScale = 1.0;
  }
}
