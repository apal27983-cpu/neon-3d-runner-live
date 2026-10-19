export const GameStates = {
  READY: 'READY',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER'
};

export class GameStateManager {
  constructor(initialState = GameStates.READY) {
    this.currentState = initialState;
    this.previousState = null;
    this.listeners = new Set();
  }

  getState() {
    return this.currentState;
  }

  is(state) {
    return this.currentState === state;
  }

  isPlaying() {
    return this.currentState === GameStates.PLAYING;
  }

  setState(newState) {
    if (!Object.values(GameStates).includes(newState)) {
      console.warn(`[GameStateManager] Invalid state transition attempted: ${newState}`);
      return;
    }

    if (this.currentState === newState) return;

    this.previousState = this.currentState;
    this.currentState = newState;

    for (const listener of this.listeners) {
      try {
        listener(this.currentState, this.previousState);
      } catch (err) {
        console.error('[GameStateManager] Listener error:', err);
      }
    }
  }

  onChange(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
