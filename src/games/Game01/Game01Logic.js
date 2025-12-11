class Game01Logic {
  constructor() {
    this.gridSize = 3;
    this.totalRounds = 15;
    this.blinkTime = 1500; // ms - time each cell stays highlighted
    this.reset();
  }

  init(size) {
    this.gridSize = size;
    this.reset();
  }

  reset() {
    this.currentRound = 0;
    this.score = 0;
    this.reactionTimes = [];
    this.currentTarget = -1;
    this.currentTargetType = null; // 'green', 'red', 'blue'
    this.redCells = []; // cells that should not be clicked
    this.roundStartTime = 0;
    this.roundComplete = false;

    // Round statistics tracking
    this.roundHistory = []; // {type, result, reactionTime}
    this.roundCounts = { green: 0, red: 0, blue: 0 };
    this.correctCounts = { green: 0, red: 0, blue: 0 };
    this.reactionTimesByType = { green: [], red: [], blue: [] };
  }

  getNextTarget() {
    if (this.currentRound >= this.totalRounds) {
      return { target: -1, type: null, redCells: [] }; // Game complete
    }

    this.currentRound++;
    this.roundComplete = false;

    // Determine target type for this round
    const rand = Math.random();
    let targetType;
    let targetIndex;

    if (rand < 0.5) {
      // 50% chance: Green - fast click target
      targetType = 'green';
      do {
        targetIndex = Math.floor(Math.random() * (this.gridSize * this.gridSize));
      } while (targetIndex === this.currentTarget && this.gridSize > 1);
    } else if (rand < 0.75) {
      // 25% chance: Red - avoid clicking
      targetType = 'red';
      do {
        targetIndex = Math.floor(Math.random() * (this.gridSize * this.gridSize));
      } while (targetIndex === this.currentTarget && this.gridSize > 1);
    } else {
      // 25% chance: Blue - appears at random position, but player must click center
      targetType = 'blue';
      do {
        targetIndex = Math.floor(Math.random() * (this.gridSize * this.gridSize));
      } while (targetIndex === this.currentTarget && this.gridSize > 1);
    }

    // Generate red cells for red rounds (cells to avoid)
    const redCells = [];
    if (targetType === 'red') {
      // Only the red target should be avoided
      redCells.push(targetIndex);
    }

    this.currentTarget = targetIndex;
    this.currentTargetType = targetType;
    this.redCells = redCells;
    this.roundStartTime = performance.now();

    // Record round type count
    this.roundCounts[targetType]++;

    return {
      target: targetIndex,
      type: targetType,
      redCells: redCells
    };
  }

  handleClick(index, reactionTime) {
    if (this.roundComplete) return { result: false, type: 'already_complete' };

    this.roundComplete = true;

    // Check if clicked on red cell (always wrong)
    if (this.redCells.includes(index)) {
      return { result: false, type: 'red_clicked' };
    }

    // Check target based on type
    if (this.currentTargetType === 'green') {
      // Green: must click the target
      if (index === this.currentTarget) {
        this.score++;
        this.reactionTimes.push(reactionTime);
        this.correctCounts.green++;
        this.reactionTimesByType.green.push(reactionTime);
        this.roundHistory.push({ type: 'green', result: true, reactionTime: reactionTime });
        return { result: true, type: 'green_hit' };
      } else {
        this.reactionTimesByType.green.push(reactionTime);
        this.roundHistory.push({ type: 'green', result: false, reactionTime: reactionTime });
        return { result: false, type: 'green_miss' };
      }
    } else if (this.currentTargetType === 'red') {
      // Red: must NOT tap ANY square during red round
      // ANY click during red round is wrong
      this.roundHistory.push({ type: 'red', result: false, reactionTime: reactionTime });
      return { result: false, type: 'red_any_click' };
    } else if (this.currentTargetType === 'blue') {
      // Blue: blue square appears randomly, but must ALWAYS click center (index 4)
      if (index === 4) { // Always center square
        this.score++;
        this.reactionTimes.push(reactionTime);
        this.correctCounts.blue++;
        this.reactionTimesByType.blue.push(reactionTime);
        this.roundHistory.push({ type: 'blue', result: true, reactionTime: reactionTime });
        return { result: true, type: 'blue_hit' };
      } else {
        this.reactionTimesByType.blue.push(reactionTime);
        this.roundHistory.push({ type: 'blue', result: false, reactionTime: reactionTime });
        return { result: false, type: 'blue_miss' };
      }
    }

    return { result: false, type: 'unknown' };
  }

  recordMiss() {
    if (!this.roundComplete) {
      this.roundComplete = true;

      // For red rounds, timeout (no click) is CORRECT
      if (this.currentTargetType === 'red') {
        this.score++;
        this.correctCounts.red++;
        this.roundHistory.push({ type: 'red', result: true, reactionTime: null });
        // Note: no reaction time recorded for red timeouts since no click occurred
      } else {
        // For green/blue rounds, timeout is a miss
        this.reactionTimesByType[this.currentTargetType].push(null);
        this.roundHistory.push({ type: this.currentTargetType, result: false, reactionTime: null });
      }

      // Always record null reaction time in main array for timeouts
      this.reactionTimes.push(null);
    }
  }

  getCurrentTargetType() {
    return this.currentTargetType;
  }

  getRedCells() {
    return this.redCells;
  }

  isRoundComplete() {
    return this.roundComplete;
  }

  isGameComplete() {
    return this.currentRound >= this.totalRounds;
  }

  getAverageReactionTime() {
    const validTimes = this.reactionTimes.filter(time => time !== null);
    if (validTimes.length === 0) return 0;

    const sum = validTimes.reduce((a, b) => a + b, 0);
    return sum / validTimes.length;
  }

  getFastestReactionTime() {
    const validTimes = this.reactionTimes.filter(time => time !== null);
    if (validTimes.length === 0) return 0;

    return Math.min(...validTimes);
  }

  getSlowestReactionTime() {
    const validTimes = this.reactionTimes.filter(time => time !== null);
    if (validTimes.length === 0) return 0;

    return Math.max(...validTimes);
  }

  getHitRate() {
    if (this.currentRound === 0) return 0;
    return (this.score / Math.min(this.currentRound, this.totalRounds)) * 100;
  }

  getRoundCounts() {
    return { ...this.roundCounts };
  }

  getCorrectCounts() {
    return { ...this.correctCounts };
  }

  getHitRateByType(type) {
    if (this.roundCounts[type] === 0) return 0;
    return (this.correctCounts[type] / this.roundCounts[type]) * 100;
  }

  getAverageReactionTimeByType(type) {
    const validTimes = this.reactionTimesByType[type].filter(time => time !== null);
    if (validTimes.length === 0) return 0;
    const sum = validTimes.reduce((a, b) => a + b, 0);
    return sum / validTimes.length;
  }

  update() {
    // Any continuous updates needed
  }
}

export default Game01Logic;


