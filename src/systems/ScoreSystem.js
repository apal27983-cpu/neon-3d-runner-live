export class ScoreSystem {
  constructor() {
    this.storageKey = 'neon_rush_best_score';
    this.score = 0;
    this.distance = 0;
    this.bonusScore = 0;
    this.bestScore = this._loadBestScore();
    this.isNewRecord = false;
  }

  _loadBestScore() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? parseInt(saved, 10) || 0 : 0;
      }
      return 0;
    } catch (e) {
      return 0;
    }
  }

  _saveBestScore() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, this.bestScore.toString());
      }
    } catch (e) {}
  }

  update(dt, speed) {
    this.distance += speed * dt * 0.5; // Meters
    // Base score is distance * 10 plus bonuses
    const calculatedScore = Math.floor(this.distance * 10 + this.bonusScore);
    this.score = calculatedScore;

    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.isNewRecord = true;
      this._saveBestScore();
    }
  }

  addBonus(amount) {
    this.bonusScore += amount;
    this.score += amount;
    if (this.score > this.bestScore) {
      this.bestScore = this.score;
      this.isNewRecord = true;
      this._saveBestScore();
    }
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.bonusScore = 0;
    this.isNewRecord = false;
  }
}
