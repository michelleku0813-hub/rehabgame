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
  }
  create() {}
  update() {}
}

export default Game01Scene;


