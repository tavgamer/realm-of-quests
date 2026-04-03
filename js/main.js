// Realm of Quests - Main Game Configuration
// This is where we set up the Phaser game engine and tell it how to run our game.

// The config object tells Phaser:
// - What size the game canvas should be (800x600 pixels)
// - What physics engine to use (Arcade - simple and fast)
// - Which scenes to load (Boot -> Menu -> Game)
// - Where to put the game canvas in the HTML page
const config = {
    type: Phaser.AUTO,  // AUTO means Phaser picks WebGL (fast) or Canvas (fallback)
    width: 800,
    height: 600,
    parent: 'game-container',  // The HTML div that holds the game
    pixelArt: true,  // This keeps pixel art crisp instead of blurry when scaled up
    physics: {
        default: 'arcade',  // Arcade physics: simple rectangle collisions, gravity, velocity
        arcade: {
            gravity: { y: 0 },  // No gravity (top-down game, not a platformer)
            debug: false  // Set to true to see hitboxes (useful for debugging!)
        }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene]  // Scenes load in this order
};

// Create the game! This one line starts everything.
const game = new Phaser.Game(config);
