import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import HomeScene from './scenes/HomeScene.js';
import GameSelectScene from './scenes/GameSelectScene.js';
import SettingScene from './scenes/SettingScene.js';
import ResultScene from './scenes/ResultScene.js';
import Game01Scene from './games/Game01/Game01Scene.js';
import Game02Scene from './games/Game02/Game02Scene.js';
import Game03Scene from './games/Game03/Game03Scene.js';
import Game04Scene from './games/Game04/Game04Scene.js';
import Game05Scene from './games/Game05/Game05Scene.js';
import gameConfig from './config/gameConfig.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: gameConfig.width,
  height: gameConfig.height,
  backgroundColor: gameConfig.backgroundColor,
  scene: [
    BootScene,
    PreloadScene,
    HomeScene,
    GameSelectScene,
    SettingScene,
    ResultScene,
    Game01Scene,
    Game02Scene,
    Game03Scene,
    Game04Scene,
    Game05Scene,
  ],
};

const game = new Phaser.Game(config);

export default game;
