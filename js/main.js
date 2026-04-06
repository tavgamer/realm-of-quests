// Realm of Quests - Main Game Configuration
// This is where we set up the Phaser game engine and tell it how to run our game.

// The config object tells Phaser:
// - What size the game canvas should be (800x600 pixels)
// - What physics engine to use (Arcade - simple and fast)
// - Which scenes to load (Boot -> Menu -> Game)
// - Where to put the game canvas in the HTML page
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    // pixelArt is OFF so text renders smoothly.
    // Sprite textures get NEAREST filtering manually in BootScene.
    roundPixels: true,    // Snap sprites to whole pixels — prevents sub-pixel blur
    antialias: true,      // Smooth text rendering
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene, DialogScene, InventoryScene, ShopScene, AdminScene]
};

// Create the game! This one line starts everything.
const game = new Phaser.Game(config);
