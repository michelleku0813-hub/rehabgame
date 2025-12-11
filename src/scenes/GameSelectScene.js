import Phaser from 'phaser';
import SceneFlow from '../core/SceneFlow.js';

class GameSelectScene extends Phaser.Scene {
  constructor() {
    super('GameSelectScene');
    this.sceneFlow = null;
  }
  create() {
    this.sceneFlow = new SceneFlow(this);
    for(let i = 1; i <= 5; i++) {
      const btn = this.add.text(100, 60 + i*60, `Game0${i}`, {
        fontSize: '32px', backgroundColor: '#fff', color: '#000', padding: 8
      }).setInteractive();
      btn.on('pointerdown', () => {
        this.sceneFlow.goto(`Game0${i}Scene`);
      });
    }
  }
}

export default GameSelectScene;


