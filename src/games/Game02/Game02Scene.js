import Phaser from 'phaser';
import BaseGame from '../../core/BaseGame.js';
import UIManager from '../../core/UIManager.js';
import InputManager from '../../core/InputManager.js';
import AudioManager from '../../core/AudioManager.js';
import DataLogger from '../../core/DataLogger.js';
import SceneFlow from '../../core/SceneFlow.js';

class Game02Scene extends Phaser.Scene {
  constructor() {
    super('Game02Scene');
    this.baseGame = new BaseGame();
    this.ui = new UIManager(this);
    this.inputManager = new InputManager(this);
    this.audioManager = new AudioManager(this);
    this.logger = new DataLogger();
    this.sceneFlow = new SceneFlow(this);
  }
  create() {}
  update() {}
}

export default Game02Scene;


