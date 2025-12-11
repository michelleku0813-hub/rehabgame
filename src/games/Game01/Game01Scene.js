import Phaser from 'phaser';
import BaseGame from '../../core/BaseGame.js';
import UIManager from '../../core/UIManager.js';
import InputManager from '../../core/InputManager.js';
import AudioManager from '../../core/AudioManager.js';
import DataLogger from '../../core/DataLogger.js';
import SceneFlow from '../../core/SceneFlow.js';
import Game01Logic from './Game01Logic.js';

class Game01Scene extends Phaser.Scene {
  constructor() {
    super('Game01Scene');
    this.baseGame = new BaseGame();
    this.ui = new UIManager(this);
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager(this);
    this.logger = new DataLogger();
    this.sceneFlow = new SceneFlow(this);
    this.logic = new Game01Logic();

    // Game01 specific properties
    this.gridSize = 3;
    this.cellSize = 120;
    this.cellSpacing = 20;
    this.cells = [];
    this.gameTimer = null;
    this.startTime = 0;
  }

  create() {
    // Initialize game logic
    this.logic.init(this.gridSize);

    // Create UI elements
    this.createUI();

    // Create 3x3 grid
    this.createGrid();

    // Start first round
    this.startRound();

    // Enable input
    this.inputManager.enable();
  }

  createUI() {
    // Game title
    this.add.text(this.cameras.main.width / 2, 50, 'FocusTap Rehab - Game01', {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Score display
    this.scoreText = this.add.text(50, 100, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // Round display
    this.roundText = this.add.text(50, 140, 'Round: 1 / 15', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // Reaction time display
    this.reactionText = this.add.text(50, 180, 'Reaction Time: --', {
      fontSize: '20px',
      color: '#ffffff'
    });

    // Instructions
    const instructions = [
      '🟢 Green: Tap it quickly!',
      '🔴 Red: Don\'t tap anything!',
      '🔵 Blue: Always tap center!'
    ];

    instructions.forEach((text, index) => {
      this.add.text(this.cameras.main.width / 2, 620 + index * 25, text, {
        fontSize: '16px',
        color: '#cccccc',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    });

    // Back button
    const backButton = this.add.text(50, 680, '← Back to Menu', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setInteractive();

    backButton.on('pointerdown', () => {
      this.sceneFlow.back();
    });
  }

  createGrid() {
    const startX = (this.cameras.main.width - (this.gridSize * this.cellSize + (this.gridSize - 1) * this.cellSpacing)) / 2;
    const startY = (this.cameras.main.height - (this.gridSize * this.cellSize + (this.gridSize - 1) * this.cellSpacing)) / 2;

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const index = row * this.gridSize + col;
        const x = startX + col * (this.cellSize + this.cellSpacing);
        const y = startY + row * (this.cellSize + this.cellSpacing);

        // Create cell
        const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0x333333)
          .setStrokeStyle(2, 0x666666)
          .setInteractive();

        // Add cell number text
        const cellText = this.add.text(x, y, (index + 1).toString(), {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Store cell references
        this.cells[index] = {
          rect: cell,
          text: cellText,
          index: index
        };

        // Cell click handler
        cell.on('pointerdown', () => {
          this.handleCellClick(index);
        });
      }
    }
  }

  startRound() {
    // Reset all cells to default state
    this.resetCellAppearances();

    // Get next target from logic
    const targetData = this.logic.getNextTarget();

    // Highlight target cells based on type
    if (targetData.target !== -1) {
      this.highlightCells(targetData);
      this.startTime = this.time.now;

      // Set timeout for round
      this.gameTimer = this.time.delayedCall(this.logic.blinkTime, () => {
        if (!this.logic.isRoundComplete()) {
          // Time's up - result depends on target type
          this.logic.recordMiss();

          // For red rounds, timeout is SUCCESS - go directly to next round
          if (targetData.type === 'red') {
            // No feedback animation for red timeouts - directly proceed
            this.updateUI();
            this.scheduleNextRound();
          } else {
            this.showFeedback(targetData.target, 'timeout', targetData.type);
            this.updateUI();
            this.scheduleNextRound();
          }
        }
      });
    }
  }

  handleCellClick(index) {
    if (this.logic.isRoundComplete()) return;

    const clickResult = this.logic.handleClick(index, this.time.now - this.startTime);

    if (clickResult.result) {
      // Hit - show success feedback based on type
      this.showFeedback(index, 'hit', clickResult.type);
      this.updateUI();

      // Clear timer
      if (this.gameTimer) {
        this.gameTimer.remove();
        this.gameTimer = null;
      }

      this.scheduleNextRound();
    } else {
      // Miss - show error feedback based on type
      this.showFeedback(index, 'miss', clickResult.type);
      this.updateUI();

      // Clear timer
      if (this.gameTimer) {
        this.gameTimer.remove();
        this.gameTimer = null;
      }

      this.scheduleNextRound();
    }
  }

  highlightCells(targetData) {
    const { target, type, redCells } = targetData;

    // Highlight target cell based on type
    if (target !== -1) {
      const cell = this.cells[target];
      let fillColor, strokeColor;

      switch (type) {
        case 'green':
          fillColor = 0x00ff00; // Green
          strokeColor = 0x008000;
          break;
        case 'red':
          fillColor = 0xff0000; // Red
          strokeColor = 0x800000;
          break;
        case 'blue':
          fillColor = 0x0080ff; // Blue
          strokeColor = 0x004080;
          break;
        default:
          fillColor = 0xffd700; // Gold
          strokeColor = 0xffa500;
      }

      cell.rect.setFillStyle(fillColor);
      cell.rect.setStrokeStyle(4, strokeColor);
      cell.text.setColor('#ffffff'); // White text for better contrast
    }

    // Highlight red cells (to avoid)
    redCells.forEach(index => {
      const cell = this.cells[index];
      cell.rect.setFillStyle(0xff4500); // Orange red
      cell.rect.setStrokeStyle(3, 0xff0000);
      cell.text.setColor('#ffffff');
    });
  }

  resetCellAppearances() {
    this.cells.forEach(cell => {
      cell.rect.setFillStyle(0x333333);
      cell.rect.setStrokeStyle(2, 0x666666);
      cell.text.setColor('#ffffff');
    });
  }

  showFeedback(index, feedbackType, targetType = null) {
    const cell = this.cells[index];

    let fillColor, strokeColor;

    if (feedbackType === 'hit') {
      // Success feedback - green with animation
      fillColor = 0x00ff00; // Bright green
      strokeColor = 0x008000;

      // Flash animation for hits
      this.tweens.add({
        targets: cell.rect,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
      });
    } else if (feedbackType === 'miss') {
      // Error feedback based on context
      if (targetType === 'red_any_click') {
        fillColor = 0x8b0000; // Dark red - clicked during red round
        strokeColor = 0xff0000;
      } else {
        fillColor = 0xff4500; // Orange red - general miss
        strokeColor = 0xff0000;
      }
    } else if (feedbackType === 'timeout') {
      // Timeout feedback
      fillColor = 0x666666; // Gray
      strokeColor = 0x333333;
    }

    if (fillColor !== undefined) {
      cell.rect.setFillStyle(fillColor);
      cell.rect.setStrokeStyle(4, strokeColor);
    }

    // Reset after delay
    this.time.delayedCall(600, () => {
      this.resetCellAppearances();
    });
  }

  updateUI() {
    this.scoreText.setText(`Score: ${this.logic.score}`);
    this.roundText.setText(`Round: ${this.logic.currentRound} / ${this.logic.totalRounds}`);

    const avgTime = this.logic.getAverageReactionTime();
    this.reactionText.setText(`Avg Reaction: ${avgTime > 0 ? avgTime.toFixed(0) + 'ms' : '--'}`);
  }

  scheduleNextRound() {
    this.time.delayedCall(800, () => {
      if (this.logic.isGameComplete()) {
        this.showResults();
      } else {
        this.startRound();
      }
    });
  }

  showResults() {
    // Create results overlay (make it taller for more stats)
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width * 0.85,
      this.cameras.main.height * 0.8,
      0x000000,
      0.8
    );

    const roundCounts = this.logic.getRoundCounts();
    const correctCounts = this.logic.getCorrectCounts();

    const resultsText = [
      'Game Complete!',
      '',
      `Final Score: ${this.logic.score} / ${this.logic.totalRounds}`,
      `Overall Hit Rate: ${((this.logic.score / this.logic.totalRounds) * 100).toFixed(1)}%`,
      `Avg Reaction Time: ${this.logic.getAverageReactionTime().toFixed(0)}ms`,
      `Fastest: ${this.logic.getFastestReactionTime().toFixed(0)}ms`,
      `Slowest: ${this.logic.getSlowestReactionTime().toFixed(0)}ms`,
      '',
      'Round Breakdown:',
      `🟢 Green Rounds: ${roundCounts.green} (${this.logic.getHitRateByType('green').toFixed(1)}% correct)`,
      `  Avg Reaction: ${this.logic.getAverageReactionTimeByType('green').toFixed(0)}ms`,
      `🔴 Red Rounds: ${roundCounts.red} (${this.logic.getHitRateByType('red').toFixed(1)}% correct)`,
      `🔵 Blue Rounds: ${roundCounts.blue} (${this.logic.getHitRateByType('blue').toFixed(1)}% correct)`,
      `  Avg Reaction: ${this.logic.getAverageReactionTimeByType('blue').toFixed(0)}ms`,
      '',
      'Click to continue...'
    ];

    let yPos = this.cameras.main.height / 2 - 180;
    resultsText.forEach((line, index) => {
      const color = index === 0 ? '#ffd700' :
                   index >= 9 && index <= 11 ? '#00ff00' :
                   index === 12 ? '#ff0000' :
                   index >= 13 && index <= 14 ? '#0080ff' : '#ffffff';
      this.add.text(this.cameras.main.width / 2, yPos, line, {
        fontSize: index === 0 ? '32px' : '18px',
        color: color,
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      yPos += 26;
    });

    // Make overlay clickable to restart
    overlay.setInteractive();
    overlay.on('pointerdown', () => {
      this.scene.restart();
    });
  }

  update() {
    // Update logic if needed
    this.logic.update();
  }
}

export default Game01Scene;


