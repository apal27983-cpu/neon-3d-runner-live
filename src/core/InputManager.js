export class InputManager {
  constructor() {
    this.actionListeners = new Map();
    this.keyState = new Map();
    
    // Swipe tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.minSwipeDistance = 35; // Pixels
    
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    this.bindEvents();
  }

  on(action, callback) {
    if (!this.actionListeners.has(action)) {
      this.actionListeners.set(action, new Set());
    }
    this.actionListeners.get(action).add(callback);
    return () => this.actionListeners.get(action)?.delete(callback);
  }

  trigger(action, data = null) {
    const listeners = this.actionListeners.get(action);
    if (listeners) {
      for (const cb of listeners) {
        cb(data);
      }
    }
  }

  bindEvents() {
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('touchstart', this._onTouchStart, { passive: true });
    window.addEventListener('touchend', this._onTouchEnd, { passive: false });

    // Touch screen on-screen buttons
    const leftBtn = document.getElementById('btn-touch-left');
    const rightBtn = document.getElementById('btn-touch-right');
    const jumpBtn = document.getElementById('btn-touch-jump');

    if (leftBtn) {
      leftBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.trigger('moveLeft');
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.trigger('moveRight');
      });
    }
    if (jumpBtn) {
      jumpBtn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.trigger('jump');
      });
    }
  }

  unbindEvents() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    window.removeEventListener('touchstart', this._onTouchStart);
    window.removeEventListener('touchend', this._onTouchEnd);
  }

  _onKeyDown(e) {
    // Prevent scrolling when using arrow keys or spacebar
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
      }
    }

    // Filter out auto-repeat for lane switching so one key press = exactly one lane shift
    const isRepeat = e.repeat;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (!isRepeat) this.trigger('moveLeft');
        break;

      case 'ArrowRight':
      case 'd':
      case 'D':
        if (!isRepeat) this.trigger('moveRight');
        break;

      case ' ':
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (!isRepeat) this.trigger('jump');
        break;

      case 'Enter':
        if (!isRepeat) this.trigger('enter');
        break;

      case 'Escape':
      case 'p':
      case 'P':
        if (!isRepeat) this.trigger('pause');
        break;

      case 'm':
      case 'M':
        if (!isRepeat) this.trigger('toggleAudio');
        break;
    }
  }

  _onKeyUp(e) {
    // Key release handlers if needed
  }

  _onTouchStart(e) {
    if (e.touches.length > 0) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    }
  }

  _onTouchEnd(e) {
    if (e.changedTouches.length === 0) return;
    
    // Ignore touch events starting inside buttons
    const target = e.target;
    if (target && (target.tagName === 'BUTTON' || target.closest('button'))) {
      return;
    }

    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - this.touchStartX;
    const diffY = endY - this.touchStartY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (absX > this.minSwipeDistance || absY > this.minSwipeDistance) {
      if (absX > absY) {
        // Horizontal swipe
        if (diffX > 0) {
          this.trigger('moveRight');
        } else {
          this.trigger('moveLeft');
        }
      } else {
        // Vertical swipe
        if (diffY < 0) {
          this.trigger('jump');
        }
      }
    } else {
      // Tap detected - jump
      this.trigger('jump');
    }
  }
}
