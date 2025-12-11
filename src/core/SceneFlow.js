class SceneFlow {
  constructor(scene) {
    this.scene = scene;
    this.history = [];
  }

  goto(sceneKey) {
    // Store current scene in history for back navigation
    this.history.push(this.scene.scene.key);

    // Switch to the target scene
    this.scene.scene.start(sceneKey);
  }

  next() {
    // This would be used for sequential scene progression
    // For now, just a placeholder
  }

  back() {
    // Go back to previous scene if available
    if (this.history.length > 0) {
      const previousScene = this.history.pop();
      this.scene.scene.start(previousScene);
    } else {
      // Default fallback to GameSelectScene
      this.scene.scene.start('GameSelectScene');
    }
  }
}

export default SceneFlow;


