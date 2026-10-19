import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game();
    window.__NEON_RUSH_GAME__ = game;
    console.log('%c NEON RUSH: CYBER RUNNER %c SYSTEM INITIALIZED ', 'background: #00F5FF; color: #070014; font-weight: bold;', 'background: #8A2EFF; color: #fff;');
  } catch (error) {
    console.error('Failed to initialize NEON RUSH:', error);
    const container = document.getElementById('ui-container');
    if (container) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#ff007f;font-family:sans-serif;text-align:center;padding:2rem;">
          <h2 style="font-size:2rem;margin-bottom:1rem;">SYSTEM INITIALIZATION FAILED</h2>
          <p style="color:#fff;max-width:500px;line-height:1.5;">${error.message || 'WebGL hardware acceleration required.'}</p>
        </div>
      `;
    }
  }
});
