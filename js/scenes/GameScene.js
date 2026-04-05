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
        // Carry over player stats and quest states from previous area
        this.savedPlayerStats = data.playerStats || null;
        this.savedQuestStates = data.questStates || null;
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

        // Underwater tilesets
        const seaFloorTileset = map.addTilesetImage('sea-floor');
        const coralTileset = map.addTilesetImage('coral');
        const seaPathTileset = map.addTilesetImage('sea-path');
        const ruinTileset = map.addTilesetImage('ruin');

        // Pick tilesets based on area
        const isUnderwater = (this.currentAreaId === 'area2');
        const groundTile = isUnderwater ? seaFloorTileset : grassTileset;
        const wallTile = isUnderwater ? coralTileset : wallTileset;
        const pathTile = isUnderwater ? seaPathTileset : pathTileset;
        const buildingTile = isUnderwater ? ruinTileset : houseTileset;

        // --- GROUND LAYER ---
        const groundLayer = map.createBlankLayer('ground', groundTile);
        groundLayer.fill(0);

        // --- PATH LAYER ---
        const pathLayer = map.createBlankLayer('paths', pathTile);

        if (isUnderwater) {
            // Underwater City paths — main boulevard and side streets
            for (let x = 3; x < mapWidth - 3; x++) {
                pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2));
                pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2) + 1);
            }
            for (let y = 5; y < mapHeight - 3; y++) {
                pathLayer.putTileAt(0, Math.floor(mapWidth / 2), y);
                pathLayer.putTileAt(0, Math.floor(mapWidth / 2) + 1, y);
            }
            // Side path to ruins
            for (let x = 10; x < 25; x++) {
                pathLayer.putTileAt(0, x, 20);
            }
        } else {
            // Area 1 paths
            for (let x = 1; x < mapWidth - 1; x++) {
                pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2));
                pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2) + 1);
            }
            for (let y = 3; y < mapHeight - 3; y++) {
                pathLayer.putTileAt(0, Math.floor(mapWidth / 2), y);
                pathLayer.putTileAt(0, Math.floor(mapWidth / 2) + 1, y);
            }
            for (let y = 10; y < mapHeight - 10; y++) {
                pathLayer.putTileAt(0, 15, y);
                pathLayer.putTileAt(0, 16, y);
            }
        }

        // --- WALL LAYER (trees in area1, coral in area2) ---
        const treeLayer = map.createBlankLayer('trees', wallTile);

        // Border walls (around the edge of the map)
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

        if (isUnderwater) {
            // --- CORAL CLUSTERS (underwater obstacles) ---
            this.placeCluster(treeLayer, 5, 5, 3, 3);
            this.placeCluster(treeLayer, 15, 6, 4, 2);
            this.placeCluster(treeLayer, 55, 5, 3, 3);
            this.placeCluster(treeLayer, 62, 8, 3, 2);
            this.placeCluster(treeLayer, 8, 15, 3, 2);
            this.placeCluster(treeLayer, 50, 15, 2, 3);
            this.placeCluster(treeLayer, 60, 20, 3, 3);
            this.placeCluster(treeLayer, 10, 30, 3, 2);
            this.placeCluster(treeLayer, 55, 30, 4, 2);
            this.placeCluster(treeLayer, 20, 38, 3, 3);
            this.placeCluster(treeLayer, 45, 38, 2, 3);
            this.placeCluster(treeLayer, 60, 40, 3, 2);
            this.placeCluster(treeLayer, 8, 42, 3, 3);
            this.placeCluster(treeLayer, 50, 44, 3, 2);
        }

        // --- TREE CLUSTERS (filling the map with forests) ---
        if (!isUnderwater) {
        // Top-left forest area
        this.placeCluster(treeLayer, 5, 4, 4, 3);
        this.placeCluster(treeLayer, 4, 7, 2, 2);
        this.placeCluster(treeLayer, 10, 4, 3, 2);
        // Top-center forest
        this.placeCluster(treeLayer, 20, 4, 5, 3);
        this.placeCluster(treeLayer, 22, 7, 3, 2);
        this.placeCluster(treeLayer, 28, 5, 3, 3);
        // Top-right forest
        this.placeCluster(treeLayer, 50, 5, 4, 3);
        this.placeCluster(treeLayer, 55, 4, 3, 2);
        this.placeCluster(treeLayer, 60, 6, 3, 3);
        this.placeCluster(treeLayer, 70, 4, 4, 3);
        this.placeCluster(treeLayer, 74, 7, 3, 2);
        // Mid-left scattered trees
        this.placeCluster(treeLayer, 4, 20, 3, 3);
        this.placeCluster(treeLayer, 3, 24, 2, 2);
        this.placeCluster(treeLayer, 7, 35, 3, 2);
        this.placeCluster(treeLayer, 4, 38, 2, 3);
        // Mid-center trees
        this.placeCluster(treeLayer, 25, 18, 3, 2);
        this.placeCluster(treeLayer, 35, 15, 3, 3);
        this.placeCluster(treeLayer, 33, 22, 2, 2);
        this.placeCluster(treeLayer, 38, 25, 3, 2);
        this.placeCluster(treeLayer, 30, 35, 2, 3);
        this.placeCluster(treeLayer, 42, 30, 3, 2);
        // Mid-right trees
        this.placeCluster(treeLayer, 62, 18, 3, 2);
        this.placeCluster(treeLayer, 68, 22, 4, 3);
        this.placeCluster(treeLayer, 72, 28, 3, 2);
        this.placeCluster(treeLayer, 65, 32, 2, 3);
        this.placeCluster(treeLayer, 74, 35, 3, 3);
        // Bottom-left forest
        this.placeCluster(treeLayer, 5, 45, 4, 2);
        this.placeCluster(treeLayer, 7, 48, 3, 3);
        this.placeCluster(treeLayer, 3, 51, 3, 2);
        this.placeCluster(treeLayer, 10, 50, 2, 3);
        // Bottom-center trees
        this.placeCluster(treeLayer, 25, 48, 4, 2);
        this.placeCluster(treeLayer, 30, 52, 3, 3);
        this.placeCluster(treeLayer, 35, 48, 3, 2);
        this.placeCluster(treeLayer, 42, 50, 2, 3);
        this.placeCluster(treeLayer, 45, 46, 3, 2);
        // Bottom-right forest
        this.placeCluster(treeLayer, 62, 48, 3, 3);
        this.placeCluster(treeLayer, 68, 50, 4, 2);
        this.placeCluster(treeLayer, 72, 46, 3, 3);
        this.placeCluster(treeLayer, 74, 52, 3, 2);
        // --- POND ENTRANCE TREES (surround the pond, hide the passage) ---
        // Dense forest ring around the pond (player has to find a gap)
        this.placeCluster(treeLayer, 52, 36, 2, 3);  // left of pond
        this.placeCluster(treeLayer, 52, 40, 2, 4);  // left-bottom
        this.placeCluster(treeLayer, 54, 36, 8, 2);  // top of pond
        this.placeCluster(treeLayer, 63, 37, 2, 8);  // right of pond
        this.placeCluster(treeLayer, 54, 47, 9, 2);  // bottom of pond
        this.placeCluster(treeLayer, 52, 45, 2, 2);  // bottom-left corner
        // Gap: one tile opening on the left side at y=39 (the secret entrance!)
        // (tiles 52-53 at y=39 are NOT filled — that's the way in)
        } // end area1 trees

        // Trees/coral are walkable — you can explore through them!
        // (No collision set on tree layer)

        // --- WATER LAYER ---
        const waterLayer = map.createBlankLayer('water', waterTileset);
        if (!isUnderwater) {
            // Big pond hidden behind trees (teleport to Underwater City)
            for (let x = 54; x < 63; x++) {
                for (let y = 38; y < 47; y++) {
                    waterLayer.putTileAt(0, x, y);
                }
            }
            // Small decorative pond near the village
            for (let x = 20; x < 23; x++) {
                for (let y = 22; y < 24; y++) {
                    waterLayer.putTileAt(0, x, y);
                }
            }
        } else {
            // Area 2: decorative deep-water pools
            for (let x = 12; x < 18; x++) {
                for (let y = 10; y < 14; y++) {
                    waterLayer.putTileAt(0, x, y);
                }
            }
            for (let x = 52; x < 56; x++) {
                for (let y = 35; y < 38; y++) {
                    waterLayer.putTileAt(0, x, y);
                }
            }
        }
        // Water is walkable (hidden pond = teleport zone)

        // --- BUILDING LAYER (houses in area1, ruins in area2) ---
        const houseLayer = map.createBlankLayer('houses', buildingTile);
        if (isUnderwater) {
            // Ancient underwater ruins
            this.placeCluster(houseLayer, 33, 23, 4, 3);  // Central temple (near Sea Elder)
            this.placeCluster(houseLayer, 15, 18, 3, 2);  // West ruin
            this.placeCluster(houseLayer, 50, 20, 3, 2);  // East ruin
            this.placeCluster(houseLayer, 25, 35, 3, 2);  // South-west ruin
            this.placeCluster(houseLayer, 45, 35, 3, 2);  // South-east ruin
            this.placeCluster(houseLayer, 35, 10, 2, 2);  // North shrine
            this.placeCluster(houseLayer, 20, 42, 2, 2);  // Deep ruin
            this.placeCluster(houseLayer, 55, 42, 3, 2);  // Far east ruin
        } else {
            // Area 1 houses
            this.placeCluster(houseLayer, 10, 7, 3, 2);
            this.placeCluster(houseLayer, 16, 6, 3, 2);
            this.placeCluster(houseLayer, 6, 12, 2, 2);
            this.placeCluster(houseLayer, 18, 11, 3, 2);
            this.placeCluster(houseLayer, 10, 33, 3, 2);
            this.placeCluster(houseLayer, 14, 35, 2, 2);
            this.placeCluster(houseLayer, 22, 28, 3, 2);
            this.placeCluster(houseLayer, 26, 26, 2, 2);
            this.placeCluster(houseLayer, 45, 12, 2, 2);
            this.placeCluster(houseLayer, 60, 14, 3, 2);
            this.placeCluster(houseLayer, 40, 42, 2, 2);
            this.placeCluster(houseLayer, 15, 50, 3, 2);
        }
        houseLayer.setCollisionByExclusion([-1]);

        // --- WORLD BOUNDS ---
        this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);

        // --- SPAWN PLAYER ---
        const spawnX = this.currentArea.playerSpawn.x * tileSize;
        const spawnY = this.currentArea.playerSpawn.y * tileSize;
        this.player = new Player(this, spawnX, spawnY);

        // Restore player stats from previous area (if teleporting)
        if (this.savedPlayerStats) {
            const s = this.savedPlayerStats;
            this.player.level = s.level;
            this.player.xp = s.xp;
            this.player.gold = s.gold;
            this.player.maxHP = s.maxHP;
            this.player.hp = s.hp;
            this.player.moveSpeed = s.moveSpeed;
            this.player.attackPower = s.attackPower;
            this.player.defense = s.defense;
        }

        // --- CAMERA ---
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
        this.cameras.main.setZoom(2.0);
        // Background color based on area
        this.cameras.main.setBackgroundColor(isUnderwater ? '#0a1628' : '#1a1a2e');

        // --- COLLISIONS ---
        // No water collider — player can walk into the hidden pond (teleport zone)
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

        // --- QUEST SYSTEM ---
        this.questManager = new QuestManager(this);
        this.activeQuestId = null;
        this.spawnTimer = null;

        // Restore quest states from previous area
        if (this.savedQuestStates) {
            this.questManager.questStates = this.savedQuestStates.states;
            this.questManager.questProgress = this.savedQuestStates.progress;
            this.questManager.questKillRewards = this.savedQuestStates.killRewards;
        }

        // E key for talking to NPCs
        this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        this.dialogOpen = false;
        this.dialogCooldown = 0;

        // Guide arrow and "Press E" prompt are rendered in UIScene for crisp text
        this.guideState = { type: 'none' };

        // --- ENEMIES (spawned by quest system, not on load) ---
        this.enemies = this.physics.add.group();

        // Store collision layers so the quest spawn system can use them
        this.collisionLayers = { houseLayer };

        // Enemies collide with houses and each other
        this.physics.add.collider(this.enemies, houseLayer);
        this.physics.add.collider(this.enemies, this.enemies);

        // --- TREASURE CHESTS (area1 only) ---
        if (!isUnderwater) {
        // Hidden around the map. More hidden = more gold!
        const chestData = [
            // Easy to find (near paths)
            { x: 22, y: 30, gold: 5 },    // Near the crossroads
            { x: 42, y: 30, gold: 8 },    // Along the horizontal path
            // Medium hidden (behind/beside houses)
            { x: 5, y: 13, gold: 15 },    // Behind trees west side
            { x: 47, y: 12, gold: 15 },   // Beside the north outpost
            { x: 25, y: 27, gold: 12 },   // Beside the eastern house
            { x: 13, y: 37, gold: 12 },   // Below the southern village hut
            // Well hidden (deep in forests, corners)
            { x: 6, y: 47, gold: 25 },    // Deep in bottom-left forest
            { x: 73, y: 5, gold: 25 },    // Top-right corner (secret tree passage!)
            { x: 75, y: 50, gold: 30 },   // Bottom-right corner
            { x: 63, y: 14, gold: 20 },   // Beside northeast ruins
            // Secret (very hard to find)
            { x: 4, y: 4, gold: 50 },     // Extreme top-left corner, behind trees
            { x: 31, y: 53, gold: 40 },   // Deep bottom-center forest
        ];

        this.chests = [];
        chestData.forEach(data => {
            const chestSprite = this.physics.add.sprite(
                data.x * tileSize, data.y * tileSize,
                'chest'
            ).setDepth(8).setImmovable(true);

            chestSprite.goldReward = data.gold;
            chestSprite.isOpened = false;

            // Player overlaps chest to open it
            this.physics.add.overlap(this.player, chestSprite, () => {
                this.openChest(chestSprite);
            });

            this.chests.push(chestSprite);
        });
        } // end area1 chests

        // --- AREA NAME POPUP ---
        // We show this in the UIScene since it has its own un-zoomed camera
        // (handled by UIScene's create method already showing area name)

        // --- NPCs ---
        // NPCs now use real spritesheets (recolored versions of the player).
        // We pick the right texture based on the NPC's id.
        const NPC_TEXTURES = {
            'npc_elder': 'npc-elder-sheet',
            'npc_shopkeeper': 'npc-shopkeeper-sheet',
            'npc_sea_elder': 'npc'  // Uses generic NPC sprite (blue tint applied below)
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
                // Tint Sea Elder blue
                if (npcId === 'npc_sea_elder') {
                    npc.setTint(0x3498db);
                }

                this.physics.add.collider(this.player, npc);
                npc.npcId = npcId;
                npc.npcData = npcData;
                this.npcs.push(npc);
            }
        }
    }

    update(time, delta) {
        this.player.update();

        // Don't process combat if player is dead
        if (this.player.isDead) return;

        // --- PLAYER ATTACK (keyboard Space OR mobile touch button) ---
        const touchAttack = this.uiScene && this.uiScene.touchAttack;
        if (Phaser.Input.Keyboard.JustDown(this.attackKey) || touchAttack) {
            this.combatSystem.playerAttack(this.player, this.enemies);
            // Reset touch attack so it doesn't fire every frame
            if (this.uiScene) this.uiScene.touchAttack = false;
        }

        // --- NPC INTERACTION (press E or touch Talk button) ---
        if (this.dialogCooldown > 0) this.dialogCooldown -= delta;
        const touchTalk = this.uiScene && this.uiScene.touchTalk;
        if ((Phaser.Input.Keyboard.JustDown(this.interactKey) || touchTalk) && !this.dialogOpen && this.dialogCooldown <= 0) {
            this.tryTalkToNPC();
            if (this.uiScene) this.uiScene.touchTalk = false;
        }

        // --- UPDATE ENEMIES ---
        this.enemies.getChildren().forEach(enemy => {
            enemy.update(time, delta);
        });

        // --- CHECK POND TELEPORT (hidden entrance to Underwater City) ---
        this.checkPondTeleport();

        // --- UPDATE GUIDE ARROW & INTERACT PROMPT ---
        this.updateGuideArrow();

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
            this.cameras.main.scrollX + 640,
            this.cameras.main.scrollY + 360,
            1280, 720, 0x000000, 0.8
        ).setDepth(50).setScrollFactor(0);

        // "YOU DIED!" text
        const diedText = this.add.text(640, 250, 'YOU DIED!', {
            fontSize: '32px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
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
        const statsText = this.add.text(640, 320, `Level: ${this.player.level}  |  Gold: ${this.player.gold}`, {
            fontSize: '14px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#aaaaaa'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(51);

        // "RESPAWN" button
        const respawnBg = this.add.rectangle(640, 390, 240, 50, 0xe94560)
            .setDepth(51).setScrollFactor(0).setInteractive({ useHandCursor: true });
        const respawnText = this.add.text(640, 390, 'RESPAWN', {
            fontSize: '18px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
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

    // --- TREASURE CHEST ---
    openChest(chest) {
        if (chest.isOpened) return;
        chest.isOpened = true;

        // Change to opened texture
        chest.setTexture('chest-open');

        // Give gold to player
        this.player.gold += chest.goldReward;

        // Gold sparkle effect
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const sparkle = this.add.rectangle(
                chest.x, chest.y, 3, 3, 0xffd700
            ).setDepth(20);

            this.tweens.add({
                targets: sparkle,
                x: chest.x + Math.cos(angle) * 25,
                y: chest.y + Math.sin(angle) * 25 - 10,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => sparkle.destroy()
            });
        }

        // Show gold text via UIScene
        if (this.uiScene && this.uiScene.showFloatingText) {
            this.uiScene.showFloatingText(chest.x, chest.y - 15, '+' + chest.goldReward + ' Gold!', '#ffd700', 18, 1500);
        }

        // Camera shake for excitement
        this.cameras.main.shake(100, 0.005);
    }

    // --- GUIDE DATA (computed here, rendered in UIScene) ---
    updateGuideArrow() {
        const tileSize = 16;
        const promptRange = 45;

        // Reset guide state
        this.guideState = { type: 'none' };

        const hasActiveQuest = this.questManager.getActiveQuest() !== null;
        if (hasActiveQuest || this.dialogOpen) return;

        // Find the NPC that has an available quest
        let questNpcId = null;
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;
            const available = this.questManager.getAvailableQuests(npcId);
            if (available.length > 0) {
                questNpcId = npcId;
                break;
            }
        }

        if (!questNpcId) return;

        const npcData = NPCS[questNpcId];
        const npcX = npcData.x * tileSize;
        const npcY = npcData.y * tileSize;
        const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);

        if (dist < promptRange) {
            this.guideState = { type: 'prompt', worldX: npcX, worldY: npcY - 28 };
        } else {
            const angle = Math.atan2(npcY - this.player.y, npcX - this.player.x);
            this.guideState = {
                type: 'arrow',
                worldX: this.player.x + Math.cos(angle) * 35,
                worldY: this.player.y + Math.sin(angle) * 35,
                angle: angle
            };
        }
    }

    // --- NPC INTERACTION ---
    // Check if player is near an NPC and open dialog
    tryTalkToNPC() {
        const tileSize = 16;
        const interactRange = 40;

        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;

            const npcX = npcData.x * tileSize;
            const npcY = npcData.y * tileSize;
            const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);

            if (dist < interactRange) {
                this.openNPCDialog(npcId, npcData);
                return;
            }
        }
    }

    // Open dialog with an NPC
    openNPCDialog(npcId, npcData) {
        this.dialogOpen = true;
        this.player.setVelocity(0, 0);

        // Check if NPC has an available quest
        const availableQuests = this.questManager.getAvailableQuests(npcId);
        const activeQuests = this.questManager.getActiveQuests(npcId);

        if (availableQuests.length > 0) {
            // Offer the first available quest
            const questId = availableQuests[0];
            const quest = QUESTS[questId];

            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: quest.dialog.intro,
                quest: quest,
                questId: questId,
                showAcceptDecline: true
            });
        } else if (activeQuests.length > 0) {
            // Show progress for the first active quest
            const questId = activeQuests[0];
            const progressText = this.questManager.getProgressText(questId);

            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: progressText,
                showAcceptDecline: false
            });
        } else {
            // No quests — just a greeting
            this.scene.launch('Dialog', {
                npcId: npcId,
                npcName: npcData.name,
                dialogText: npcData.dialog.noQuest,
                showAcceptDecline: false
            });
        }
    }

    // --- QUEST-DRIVEN ENEMY SPAWNING ---
    // Called by QuestManager when a quest is accepted
    startQuestSpawning(questId) {
        const quest = QUESTS[questId];
        this.activeQuestId = questId;
        this.questDifficulty = quest.difficulty || 1;

        // If quest has a boss target, spawn the boss first
        const targetData = ENEMIES[quest.target];
        if (targetData && targetData.isBoss) {
            // Spawn the boss
            this.spawnQuestEnemy(quest.target);

            // Spawn minions alongside the boss
            if (quest.minions) {
                for (let i = 0; i < 3; i++) {
                    this.spawnQuestEnemy(quest.minions);
                }
            }

            // Keep spawning minions
            this.spawnTimer = this.time.addEvent({
                delay: 5000,
                callback: () => {
                    const aliveCount = this.enemies.getChildren().length;
                    if (aliveCount < 5 && quest.minions) {
                        this.spawnQuestEnemy(quest.minions);
                    }
                },
                loop: true
            });
        } else {
            // Normal quest — spawn regular enemies
            for (let i = 0; i < 3; i++) {
                this.spawnQuestEnemy(quest.target);
            }

            this.spawnTimer = this.time.addEvent({
                delay: 4000,
                callback: () => {
                    const aliveCount = this.enemies.getChildren().length;
                    if (aliveCount < 6) {
                        this.spawnQuestEnemy(quest.target);
                    }
                },
                loop: true
            });
        }
    }

    // Spawn a single enemy at a random position far from the player
    spawnQuestEnemy(enemyType) {
        const tileSize = 16;
        const mapW = this.currentArea.width;
        const mapH = this.currentArea.height;
        let spawnX, spawnY;
        let attempts = 0;

        // Keep trying until we find a spot far enough from the player
        do {
            const tileX = Phaser.Math.Between(4, mapW - 4);
            const tileY = Phaser.Math.Between(4, mapH - 4);
            spawnX = tileX * tileSize;
            spawnY = tileY * tileSize;
            attempts++;
        } while (
            distanceBetween(spawnX, spawnY, this.player.x, this.player.y) < 200 &&
            attempts < 30
        );

        const diff = this.questDifficulty || 1;
        const enemy = new Enemy(this, spawnX, spawnY, enemyType, diff);
        enemy.target = this.player;
        this.enemies.add(enemy);

        // Set up collisions for this new enemy
        const layers = this.collisionLayers;
        this.physics.add.collider(enemy, layers.houseLayer);
    }

    // Called by QuestManager when quest is complete — stop spawning, kill all enemies
    stopQuestSpawning(questId) {
        this.activeQuestId = null;

        // Stop the spawn timer
        if (this.spawnTimer) {
            this.spawnTimer.remove();
            this.spawnTimer = null;
        }

        // Kill all remaining enemies with a poof effect (no rewards)
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.state !== 'DEAD') {
                enemy.state = 'DEAD';
                enemy.setVelocity(0, 0);
                enemy.body.enable = false;

                enemy.scene.tweens.add({
                    targets: enemy,
                    alpha: 0,
                    scaleX: 0,
                    scaleY: 0,
                    duration: 400,
                    onComplete: () => {
                        enemy.healthBar.destroy();
                        if (enemy.bossNameTag) enemy.bossNameTag.destroy();
                        enemy.destroy();
                    }
                });
            }
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

    // Check if player stepped into teleport zones
    checkPondTeleport() {
        if (this.dialogOpen) return;

        const tileSize = 16;
        const px = Math.floor(this.player.x / tileSize);
        const py = Math.floor(this.player.y / tileSize);

        // Area 1: hidden pond teleports to Underwater City
        if (this.currentAreaId === 'area1') {
            // The hidden pond spans tiles (54-62, 38-46)
            if (px >= 54 && px <= 62 && py >= 38 && py <= 46) {
                if (this.player.level < 3) {
                    if (!this._pondWarningShown) {
                        this._pondWarningShown = true;
                        if (this.uiScene && this.uiScene.showFloatingText) {
                            this.uiScene.showFloatingText(this.player.x, this.player.y - 20, 'Level 3 required!', '#e74c3c', 18, 1500);
                        }
                        this.time.delayedCall(1500, () => { this._pondWarningShown = false; });
                    }
                    return;
                }

                this.teleportToArea('area2');
            }
        }

        // Area 2: walk to top border to return to Area 1
        if (this.currentAreaId === 'area2') {
            if (py <= 3) {
                this.teleportToArea('area1');
            }
        }
    }

    teleportToArea(areaId) {
        if (this._teleporting) return;
        this._teleporting = true;

        const fadeColor = (areaId === 'area2') ? [0, 0, 80] : [0, 50, 0];
        this.cameras.main.fadeOut(800, ...fadeColor);
        this.player.setVelocity(0, 0);
        this.player.body.enable = false;

        this.cameras.main.once('camerafadeoutcomplete', () => {
            if (this.spawnTimer) {
                this.spawnTimer.remove();
                this.spawnTimer = null;
            }

            // Save player stats to carry over
            const playerStats = {
                level: this.player.level,
                xp: this.player.xp,
                gold: this.player.gold,
                maxHP: this.player.maxHP,
                hp: this.player.hp,
                moveSpeed: this.player.moveSpeed,
                attackPower: this.player.attackPower,
                defense: this.player.defense
            };

            // Save quest states to carry over
            const questStates = this.questManager ? {
                states: { ...this.questManager.questStates },
                progress: { ...this.questManager.questProgress },
                killRewards: JSON.parse(JSON.stringify(this.questManager.questKillRewards))
            } : null;

            // Complete the "visit brother" quest if arriving at area2
            if (areaId === 'area2' && questStates) {
                if (questStates.states['q_visit_brother'] === 'active') {
                    questStates.states['q_visit_brother'] = 'rewarded';
                    playerStats.xp += QUESTS['q_visit_brother'].rewardXP;
                    playerStats.gold += QUESTS['q_visit_brother'].rewardGold;
                }
            }

            this.scene.stop('UI');
            this.scene.start('Game', {
                areaId: areaId,
                playerStats: playerStats,
                questStates: questStates
            });
        });
    }
}
