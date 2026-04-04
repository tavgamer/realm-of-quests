// Realm of Quests - Game Scene
// This is the MAIN scene where the actual gameplay happens!
// It creates the map, spawns the player, and handles collisions.
//
// NEW CONCEPTS:
// - Tilemap: The game world is built from a grid of small tiles (16x16 pixels).
//   Think of it like placing LEGO blocks on a grid to build a world.
// - Layers: Tilemaps have layers (ground layer, wall layer, decoration layer).
//   This lets us put grass underneath a wall tile.
// - Collision: We tell Phaser "these tiles are solid" so the player can't walk through them.

class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data) {
        this.currentAreaId = data.areaId || 'area1';
        this.currentArea = AREAS[this.currentAreaId];
    }

    create() {
        const mapWidth = this.currentArea.width;
        const mapHeight = this.currentArea.height;
        const tileSize = 16;

        // --- CREATE THE TILEMAP ---
        const map = this.make.tilemap({
            tileWidth: tileSize,
            tileHeight: tileSize,
            width: mapWidth,
            height: mapHeight
        });

        // Add tilesets (the "palette" of tiles we can paint with)
        const grassTileset = map.addTilesetImage('grass');
        const wallTileset = map.addTilesetImage('wall');
        const pathTileset = map.addTilesetImage('path');
        const waterTileset = map.addTilesetImage('water');
        const houseTileset = map.addTilesetImage('house');

        // --- GROUND LAYER (grass everywhere) ---
        const groundLayer = map.createBlankLayer('ground', grassTileset);
        groundLayer.fill(0);

        // --- PATH LAYER (dirt roads) ---
        const pathLayer = map.createBlankLayer('paths', pathTileset);

        // Horizontal path through middle
        for (let x = 1; x < mapWidth - 1; x++) {
            pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2));
            pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2) + 1);
        }
        // Vertical path crossing
        for (let y = 3; y < mapHeight - 3; y++) {
            pathLayer.putTileAt(0, Math.floor(mapWidth / 2), y);
            pathLayer.putTileAt(0, Math.floor(mapWidth / 2) + 1, y);
        }

        // --- TREE LAYER (blocks movement, looks like trees) ---
        const treeLayer = map.createBlankLayer('trees', wallTileset);

        // Border trees (around the edge of the map)
        for (let x = 0; x < mapWidth; x++) {
            treeLayer.putTileAt(0, x, 0);
            treeLayer.putTileAt(0, x, 1);
            treeLayer.putTileAt(0, x, mapHeight - 1);
            treeLayer.putTileAt(0, x, mapHeight - 2);
        }
        for (let y = 0; y < mapHeight; y++) {
            treeLayer.putTileAt(0, 0, y);
            treeLayer.putTileAt(0, 1, y);
            treeLayer.putTileAt(0, mapWidth - 1, y);
            treeLayer.putTileAt(0, mapWidth - 2, y);
        }

        // Tree clusters inside the map (carefully placed away from paths and spawn)
        this.placeCluster(treeLayer, 5, 4, 3, 2);
        this.placeCluster(treeLayer, 30, 4, 3, 2);
        this.placeCluster(treeLayer, 7, 22, 3, 2);
        this.placeCluster(treeLayer, 28, 22, 4, 2);
        this.placeCluster(treeLayer, 34, 10, 2, 3);

        // Make tree tiles solid
        treeLayer.setCollisionByExclusion([-1]);

        // --- WATER LAYER (pond, blocks movement, looks blue) ---
        const waterLayer = map.createBlankLayer('water', waterTileset);
        // Small pond in the southeast area
        for (let x = 26; x < 30; x++) {
            for (let y = 18; y < 21; y++) {
                waterLayer.putTileAt(0, x, y);
            }
        }
        waterLayer.setCollisionByExclusion([-1]);

        // --- HOUSE LAYER (buildings, block movement, look like houses) ---
        const houseLayer = map.createBlankLayer('houses', houseTileset);
        // Houses near NPCs
        this.placeCluster(houseLayer, 10, 7, 3, 2);   // Near Village Elder
        this.placeCluster(houseLayer, 16, 6, 3, 2);   // Near Shopkeeper
        this.placeCluster(houseLayer, 10, 20, 3, 2);  // Southern house
        houseLayer.setCollisionByExclusion([-1]);

        // --- WORLD BOUNDS ---
        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

        // --- SPAWN PLAYER ---
        const spawnX = this.currentArea.playerSpawn.x * tileSize;
        const spawnY = this.currentArea.playerSpawn.y * tileSize;
        this.player = new Player(this, spawnX, spawnY);

        // --- CAMERA ---
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
        this.cameras.main.setZoom(2.5);
        // Slightly darker background where there's no map
        this.cameras.main.setBackgroundColor('#1a1a2e');

        // --- COLLISIONS ---
        this.physics.add.collider(this.player, treeLayer);
        this.physics.add.collider(this.player, waterLayer);
        this.physics.add.collider(this.player, houseLayer);

        // --- LAUNCH THE HUD ---
        // bringToTop ensures UIScene renders AFTER (on top of) GameScene
        this.scene.launch('UI');
        this.scene.bringToTop('UI');
        this.uiScene = this.scene.get('UI');

        // --- COMBAT SYSTEM ---
        this.combatSystem = new CombatSystem(this);

        // Space key for attacking
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // --- SPAWN ENEMIES ---
        // Create a physics group to hold all enemies in this area
        this.enemies = this.physics.add.group();

        // Enemy spawn positions for Area 1 (away from the player spawn and NPCs)
        const enemySpawns = [
            { type: 'goblin', x: 20, y: 6 },
            { type: 'goblin', x: 25, y: 10 },
            { type: 'goblin', x: 12, y: 25 },
            { type: 'slime', x: 32, y: 8 },
            { type: 'slime', x: 18, y: 24 },
            { type: 'slime', x: 6, y: 15 },
        ];

        enemySpawns.forEach(spawn => {
            const enemy = new Enemy(
                this,
                spawn.x * tileSize,
                spawn.y * tileSize,
                spawn.type
            );
            enemy.target = this.player;  // Tell enemy who to chase
            this.enemies.add(enemy);
        });

        // Enemies collide with walls, water, houses, and each other
        this.physics.add.collider(this.enemies, treeLayer);
        this.physics.add.collider(this.enemies, waterLayer);
        this.physics.add.collider(this.enemies, houseLayer);
        this.physics.add.collider(this.enemies, this.enemies);

        // --- AREA NAME POPUP ---
        // We show this in the UIScene since it has its own un-zoomed camera
        // (handled by UIScene's create method already showing area name)

        // --- NPCs ---
        // NPCs now use real spritesheets (recolored versions of the player).
        // We pick the right texture based on the NPC's id.
        const NPC_TEXTURES = {
            'npc_elder': 'npc-elder-sheet',
            'npc_shopkeeper': 'npc-shopkeeper-sheet'
        };
        const NPC_ANIMS = {
            'npc_elder': 'npc-elder-idle',
            'npc_shopkeeper': 'npc-shopkeeper-idle'
        };
        this.npcs = [];
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area === this.currentAreaId) {
                // Use the real NPC spritesheet, or fall back to generated 'npc' texture
                const texture = NPC_TEXTURES[npcId] || 'npc';
                const npc = this.physics.add.sprite(
                    npcData.x * tileSize,
                    npcData.y * tileSize,
                    texture, 0
                ).setScale(1).setImmovable(true).setDepth(9);
                // Play idle animation if available
                if (NPC_ANIMS[npcId]) {
                    npc.anims.play(NPC_ANIMS[npcId]);
                }

                // "!" quest marker above quest-giving NPCs
                if (npcData.quests.length > 0) {
                    const marker = this.add.text(
                        npcData.x * tileSize,
                        npcData.y * tileSize - 20,
                        '!',
                        {
                            fontSize: '10px',
                            fontFamily: 'Press Start 2P',
                            color: '#ffd700',
                            stroke: '#000000',
                            strokeThickness: 3
                        }
                    ).setOrigin(0.5).setDepth(11);

                    this.tweens.add({
                        targets: marker,
                        y: marker.y - 5,
                        duration: 600,
                        yoyo: true,
                        repeat: -1
                    });
                }

                // NPC name label
                this.add.text(
                    npcData.x * tileSize,
                    npcData.y * tileSize + 20,
                    npcData.name,
                    {
                        fontSize: '5px',
                        fontFamily: 'Press Start 2P',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }
                ).setOrigin(0.5).setDepth(11);

                this.physics.add.collider(this.player, npc);
                this.npcs.push(npc);
            }
        }
    }

    update(time, delta) {
        this.player.update();

        // Don't process combat if player is dead
        if (this.player.isDead) return;

        // --- PLAYER ATTACK ---
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.combatSystem.playerAttack(this.player, this.enemies);
        }

        // --- UPDATE ENEMIES ---
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        // Send player data to the UIScene HUD
        if (this.uiScene && this.uiScene.updateHUD) {
            this.uiScene.updateHUD({
                hp: this.player.hp,
                maxHP: this.player.maxHP,
                level: this.player.level,
                xp: this.player.xp,
                gold: this.player.gold,
                areaName: this.currentArea.name
            });
        }
    }

    // --- "YOU DIED!" SCREEN ---
    // Shows a dark overlay with text and a Respawn button.
    showDeathScreen() {
        // Hide the HUD
        this.scene.setVisible(false, 'UI');

        // Dark overlay covering the whole camera view
        const overlay = this.add.rectangle(
            this.cameras.main.scrollX + 400,
            this.cameras.main.scrollY + 300,
            800, 600, 0x000000, 0.8
        ).setDepth(50).setScrollFactor(0);

        // "YOU DIED!" text
        const diedText = this.add.text(400, 200, 'YOU DIED!', {
            fontSize: '24px',
            fontFamily: 'Press Start 2P',
            color: '#e94560',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        // Pulsing animation on the text
        this.tweens.add({
            targets: diedText,
            alpha: { from: 0.7, to: 1 },
            scaleX: { from: 0.95, to: 1.05 },
            scaleY: { from: 0.95, to: 1.05 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Stats text
        const statsText = this.add.text(400, 270, `Level: ${this.player.level}  |  Gold: ${this.player.gold}`, {
            fontSize: '10px',
            fontFamily: 'Press Start 2P',
            color: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        // "RESPAWN" button
        const respawnBg = this.add.rectangle(400, 340, 200, 45, 0xe94560)
            .setDepth(51).setScrollFactor(0).setInteractive({ useHandCursor: true });
        const respawnText = this.add.text(400, 340, 'RESPAWN', {
            fontSize: '14px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(52);

        // Hover effect
        respawnBg.on('pointerover', () => {
            respawnBg.setFillStyle(0xff6b81);
        });
        respawnBg.on('pointerout', () => {
            respawnBg.setFillStyle(0xe94560);
        });

        // Click to respawn
        respawnBg.on('pointerdown', () => {
            // Remove ALL death screen elements
            overlay.destroy();
            diedText.destroy();
            statsText.destroy();
            respawnText.destroy();
            respawnBg.destroy();
            // Respawn the player
            this.player.respawn();
            // Show the HUD again
            this.scene.setVisible(true, 'UI');
            // Camera fade in
            this.cameras.main.fadeIn(500);
        });
    }

    // Helper to place a rectangle of tiles on a layer
    placeCluster(layer, startX, startY, width, height) {
        for (let x = startX; x < startX + width; x++) {
            for (let y = startY; y < startY + height; y++) {
                layer.putTileAt(0, x, y);
            }
        }
    }
}
