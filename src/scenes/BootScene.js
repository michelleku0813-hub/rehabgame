import Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }
  preload() {}
  create() {
    // Go directly to game selection for easier access to games
    this.scene.start('GameSelectScene');
  }
}

export default BootScene;


