// Realm of Quests - Boot Scene
// This is the FIRST scene that runs. Its job is to load real sprite images
// and create placeholder graphics for tiles that still use generated textures.
//
// HOW PHASER SCENES WORK:
// Every scene has these key methods:
//   preload() - Load assets (images, sounds, etc.) BEFORE the scene starts
//   create()  - Runs ONCE when the scene starts. Set up your game objects here.
//   update()  - Runs 60 times per second (every frame). Game logic goes here.

class BootScene extends Phaser.Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Show a loading message
        this.add.text(400, 280, 'Loading...', {
            fontSize: '20px',
            fontFamily: 'Press Start 2P',
            color: '#e94560'
        }).setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 310, 320, 30);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xe94560, 1);
            progressBar.fillRect(245, 315, 310 * value, 20);
        });

        // --- LOAD REAL SPRITE IMAGES ---
        // All character spritesheets use the same format: 96x128 pixels
        // = 3 columns x 4 rows of 32x32 frames.
        // Row 0 = walk down, Row 1 = walk left, Row 2 = walk right, Row 3 = walk up.
        // 3 frames per direction for walk animation.
        this.load.spritesheet('player-sheet', 'assets/sprites/player/player.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // NPC spritesheets (same 3x4 format, different colors)
        this.load.spritesheet('npc-elder-sheet', 'assets/sprites/npcs/npc_elder.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('npc-shopkeeper-sheet', 'assets/sprites/npcs/npc_shopkeeper.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        // Load the terrain tileset image (for reference / future use)
        this.load.image('terrain', 'assets/tilesets/terrain.png');
    }

    create() {
        // Since we don't have real sprite images yet, we'll CREATE them
        // using Phaser's Graphics object. This draws colored shapes and
        // saves them as textures that we can use like regular images.

        // --- PLAYER SPRITE (16x16 blue character) ---
        const pg = this.make.graphics({ x: 0, y: 0, add: false });
        pg.fillStyle(0x2980b9, 1);
        pg.fillRect(3, 1, 10, 14);       // Body
        pg.fillStyle(0x5dade2, 1);
        pg.fillRect(4, 1, 8, 5);         // Head
        pg.fillStyle(0xffffff, 1);
        pg.fillRect(5, 3, 2, 2);         // Left eye
        pg.fillRect(9, 3, 2, 2);         // Right eye
        pg.fillStyle(0x1a5276, 1);
        pg.fillRect(6, 3, 1, 1);         // Left pupil
        pg.fillRect(10, 3, 1, 1);        // Right pupil
        pg.fillStyle(0x8B4513, 1);
        pg.fillRect(3, 10, 4, 5);        // Left leg
        pg.fillRect(9, 10, 4, 5);        // Right leg
        pg.generateTexture('player', 16, 16);
        pg.destroy();

        // --- GRASS TILE ---
        const grass = this.make.graphics({ x: 0, y: 0, add: false });
        grass.fillStyle(0x4a8c3f, 1);
        grass.fillRect(0, 0, 16, 16);
        grass.fillStyle(0x3d7a34, 1);
        grass.fillRect(3, 5, 2, 2);
        grass.fillRect(10, 11, 2, 2);
        grass.fillRect(7, 2, 1, 2);
        grass.fillStyle(0x5a9c4f, 1);
        grass.fillRect(1, 9, 2, 1);
        grass.fillRect(12, 3, 2, 1);
        grass.generateTexture('grass', 16, 16);
        grass.destroy();

        // --- TREE TILE (distinct round-top tree) ---
        const tree = this.make.graphics({ x: 0, y: 0, add: false });
        // Tree shadow on ground
        tree.fillStyle(0x3d6b33, 1);
        tree.fillRect(0, 0, 16, 16);
        // Trunk
        tree.fillStyle(0x6d4c21, 1);
        tree.fillRect(6, 9, 4, 7);
        // Canopy (round-ish)
        tree.fillStyle(0x1b5e20, 1);
        tree.fillRect(2, 2, 12, 9);
        tree.fillStyle(0x2e7d32, 1);
        tree.fillRect(3, 1, 10, 8);
        // Canopy highlight
        tree.fillStyle(0x388e3c, 1);
        tree.fillRect(4, 2, 6, 4);
        tree.generateTexture('wall', 16, 16);
        tree.destroy();

        // --- WATER TILE ---
        const water = this.make.graphics({ x: 0, y: 0, add: false });
        water.fillStyle(0x1565c0, 1);
        water.fillRect(0, 0, 16, 16);
        water.fillStyle(0x1976d2, 1);
        water.fillRect(1, 3, 8, 2);
        water.fillRect(6, 9, 8, 2);
        water.fillStyle(0x42a5f5, 1);
        water.fillRect(3, 4, 4, 1);
        water.fillRect(9, 10, 4, 1);
        water.generateTexture('water', 16, 16);
        water.destroy();

        // --- PATH TILE ---
        const path = this.make.graphics({ x: 0, y: 0, add: false });
        path.fillStyle(0xc4a265, 1);
        path.fillRect(0, 0, 16, 16);
        path.fillStyle(0xb8955a, 1);
        path.fillRect(5, 3, 2, 2);
        path.fillRect(11, 9, 2, 2);
        path.fillRect(2, 12, 2, 2);
        path.fillStyle(0xd4b276, 1);
        path.fillRect(8, 6, 3, 2);
        path.generateTexture('path', 16, 16);
        path.destroy();

        // --- HOUSE TILE (brown with window) ---
        const house = this.make.graphics({ x: 0, y: 0, add: false });
        // Roof (red/brown triangle-ish)
        house.fillStyle(0xb71c1c, 1);
        house.fillRect(0, 0, 16, 6);
        house.fillStyle(0xc62828, 1);
        house.fillRect(2, 0, 12, 5);
        // Walls
        house.fillStyle(0xd4a574, 1);
        house.fillRect(1, 6, 14, 10);
        // Window (yellow glow)
        house.fillStyle(0xfdd835, 1);
        house.fillRect(3, 8, 4, 4);
        // Door
        house.fillStyle(0x5d4037, 1);
        house.fillRect(10, 8, 4, 8);
        // Door handle
        house.fillStyle(0xfdd835, 1);
        house.fillRect(12, 11, 1, 1);
        house.generateTexture('house', 16, 16);
        house.destroy();

        // --- NPC SPRITE ---
        const npc = this.make.graphics({ x: 0, y: 0, add: false });
        npc.fillStyle(0xf39c12, 1);
        npc.fillRect(3, 1, 10, 14);      // Body (orange robe)
        npc.fillStyle(0xfad7a0, 1);
        npc.fillRect(4, 1, 8, 5);        // Face (skin tone)
        npc.fillStyle(0x2c3e50, 1);
        npc.fillRect(5, 3, 2, 2);        // Left eye
        npc.fillRect(9, 3, 2, 2);        // Right eye
        npc.fillStyle(0xffffff, 1);
        npc.fillRect(6, 3, 1, 1);        // Left eye shine
        npc.fillRect(10, 3, 1, 1);       // Right eye shine
        npc.fillStyle(0xe67e22, 1);
        npc.fillRect(3, 6, 10, 9);       // Robe bottom
        npc.generateTexture('npc', 16, 16);
        npc.destroy();

        // --- PLAYER ANIMATIONS FROM SPRITESHEET ---
        // The spritesheet has 3 columns x 4 rows (12 frames total).
        // Row 0 (frames 0-2)  = walking DOWN  (facing camera)
        // Row 1 (frames 3-5)  = walking LEFT
        // Row 2 (frames 6-8)  = walking RIGHT
        // Row 3 (frames 9-11) = walking UP    (back to camera)
        //
        // HOW ANIMATIONS WORK IN PHASER:
        // An animation is a sequence of frames played in order, like a flipbook.
        // 'frameRate' = how many frames per second (higher = faster animation).
        // 'repeat: -1' = loop forever. 'repeat: 0' = play once.

        // Idle animations (single frame - the middle frame looks best for standing still)
        this.anims.create({
            key: 'player-idle-down',
            frames: [{ key: 'player-sheet', frame: 1 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'player-idle-left',
            frames: [{ key: 'player-sheet', frame: 4 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'player-idle-right',
            frames: [{ key: 'player-sheet', frame: 7 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'player-idle-up',
            frames: [{ key: 'player-sheet', frame: 10 }],
            frameRate: 1
        });

        // Walk animations (3 frames each, looping)
        this.anims.create({
            key: 'player-walk-down',
            frames: this.anims.generateFrameNumbers('player-sheet', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-left',
            frames: this.anims.generateFrameNumbers('player-sheet', { start: 3, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-right',
            frames: this.anims.generateFrameNumbers('player-sheet', { start: 6, end: 8 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'player-walk-up',
            frames: this.anims.generateFrameNumbers('player-sheet', { start: 9, end: 11 }),
            frameRate: 8,
            repeat: -1
        });

        // --- NPC ANIMATIONS ---
        // NPCs use the same 3x4 spritesheet layout. Frame 1 = facing down, standing.
        this.anims.create({
            key: 'npc-elder-idle',
            frames: [{ key: 'npc-elder-sheet', frame: 1 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'npc-shopkeeper-idle',
            frames: [{ key: 'npc-shopkeeper-sheet', frame: 1 }],
            frameRate: 1
        });

        // All assets are loaded and animations are set up! Move to the Menu screen.
        this.scene.start('Menu');
    }
}
