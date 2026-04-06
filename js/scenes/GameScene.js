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
        // Reset teleport flag (scene instance persists between restarts!)
        this._teleporting = false;
    }

    create() {
        const mapWidth = this.currentArea.width;
        const mapHeight = this.currentArea.height;
        const tileSize = 16;
        const isUnderwater = (this.currentAreaId === 'area2');
        const worldW = mapWidth * tileSize;
        const worldH = mapHeight * tileSize;

        // ============================================================
        // DYNAMIC MAP — no tiles, everything drawn with Graphics
        // ============================================================
        const gfx = this.add.graphics().setDepth(0);

        // --- GROUND ---
        if (isUnderwater) {
            // Deep ocean floor gradient
            gfx.fillStyle(0x0d2137, 1); gfx.fillRect(0, 0, worldW, worldH);
            // Lighter patches
            for (let i = 0; i < 80; i++) {
                const px = Phaser.Math.Between(0, worldW);
                const py = Phaser.Math.Between(0, worldH);
                gfx.fillStyle(0x122a42, Phaser.Math.FloatBetween(0.3, 0.6));
                gfx.fillCircle(px, py, Phaser.Math.Between(15, 50));
            }
        } else {
            // Rich green grass base
            gfx.fillStyle(0x3d8b37, 1); gfx.fillRect(0, 0, worldW, worldH);
            // Grass color variation — random lighter/darker patches
            for (let i = 0; i < 200; i++) {
                const px = Phaser.Math.Between(0, worldW);
                const py = Phaser.Math.Between(0, worldH);
                const colors = [0x4a9e44, 0x358030, 0x2d7028, 0x50a84a, 0x3d8b37];
                gfx.fillStyle(colors[Phaser.Math.Between(0, 4)], Phaser.Math.FloatBetween(0.3, 0.7));
                gfx.fillCircle(px, py, Phaser.Math.Between(8, 30));
            }
        }

        // --- PATHS (tan/sandy roads) ---
        const pathGfx = this.add.graphics().setDepth(1);
        const pathColor = isUnderwater ? 0x1a3a50 : 0xc4a265;
        const pathEdge = isUnderwater ? 0x152e40 : 0xb08a4a;
        const midY = Math.floor(mapHeight / 2) * tileSize;
        const midX = Math.floor(mapWidth / 2) * tileSize;
        const pw = tileSize * 2; // path width

        // Horizontal path
        pathGfx.fillStyle(pathEdge, 1);
        pathGfx.fillRect(tileSize, midY - 2, worldW - tileSize * 2, pw + 4);
        pathGfx.fillStyle(pathColor, 1);
        pathGfx.fillRect(tileSize, midY, worldW - tileSize * 2, pw);
        // Path texture dots
        for (let x = tileSize; x < worldW - tileSize; x += 12) {
            pathGfx.fillStyle(pathEdge, 0.3);
            pathGfx.fillCircle(x + Phaser.Math.Between(0, 8), midY + Phaser.Math.Between(2, pw - 2), Phaser.Math.Between(1, 3));
        }

        // Vertical path
        pathGfx.fillStyle(pathEdge, 1);
        pathGfx.fillRect(midX - 2, tileSize * 3, pw + 4, worldH - tileSize * 6);
        pathGfx.fillStyle(pathColor, 1);
        pathGfx.fillRect(midX, tileSize * 3, pw, worldH - tileSize * 6);

        if (!isUnderwater) {
            // Village path (left side)
            pathGfx.fillStyle(pathEdge, 1);
            pathGfx.fillRect(15 * tileSize - 2, 10 * tileSize, pw + 4, (mapHeight - 20) * tileSize);
            pathGfx.fillStyle(pathColor, 1);
            pathGfx.fillRect(15 * tileSize, 10 * tileSize, pw, (mapHeight - 20) * tileSize);
        }

        // --- WATER AREAS (animated below) ---
        this.waterZones = [];
        const waterGfx = this.add.graphics().setDepth(2);
        const drawWater = (tx, ty, tw, th) => {
            const x = tx * tileSize, y = ty * tileSize;
            const w = tw * tileSize, h = th * tileSize;
            // Dark edge
            waterGfx.fillStyle(0x0d47a1, 0.8);
            waterGfx.fillRoundedRect(x - 3, y - 3, w + 6, h + 6, 6);
            // Water body
            waterGfx.fillStyle(0x1976d2, 0.9);
            waterGfx.fillRoundedRect(x, y, w, h, 4);
            // Highlight
            waterGfx.fillStyle(0x42a5f5, 0.4);
            waterGfx.fillRoundedRect(x + 4, y + 4, w * 0.6, h * 0.3, 3);
            this.waterZones.push({ x, y, w, h });
        };

        if (!isUnderwater) {
            drawWater(54, 38, 9, 9);  // Hidden pond
            drawWater(20, 22, 3, 2);  // Village pond
        } else {
            drawWater(12, 10, 6, 4);  // Deep pool 1
            drawWater(52, 35, 4, 3);  // Deep pool 2
        }

        // Area2 portal glow on the top-left pool
        if (isUnderwater && this.waterZones.length > 0) {
            const portal = this.waterZones[0]; // First pool = the portal
            // Green glow ring to signal "this is special"
            const portalGfx = this.add.graphics().setDepth(3);
            portalGfx.lineStyle(3, 0x00ff88, 0.6);
            portalGfx.strokeRoundedRect(portal.x - 4, portal.y - 4, portal.w + 8, portal.h + 8, 8);
            // Inner glow
            portalGfx.fillStyle(0x00ff88, 0.15);
            portalGfx.fillRoundedRect(portal.x, portal.y, portal.w, portal.h, 4);
            // Pulsing animation
            this.tweens.add({
                targets: portalGfx,
                alpha: { from: 1, to: 0.3 },
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            // "Portal" label
            const portalLabel = this.add.text(
                portal.x + portal.w / 2, portal.y - 8,
                'Portal to Surface', {
                    fontSize: '8px', fontFamily: 'Nunito', fontStyle: 'bold',
                    color: '#00ff88', stroke: '#000000', strokeThickness: 2
                }
            ).setOrigin(0.5).setDepth(7);
            this.tweens.add({
                targets: portalLabel,
                y: portalLabel.y - 4,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            // Sparkle particles around portal
            for (let i = 0; i < 8; i++) {
                const sparkle = this.add.circle(
                    portal.x + Phaser.Math.Between(5, portal.w - 5),
                    portal.y + Phaser.Math.Between(5, portal.h - 5),
                    2, 0x00ff88, 0.8
                ).setDepth(3);
                this.tweens.add({
                    targets: sparkle,
                    y: sparkle.y - Phaser.Math.Between(15, 30),
                    alpha: 0,
                    duration: Phaser.Math.Between(1500, 3000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        sparkle.x = portal.x + Phaser.Math.Between(5, portal.w - 5);
                        sparkle.y = portal.y + Phaser.Math.Between(5, portal.h - 5);
                    }
                });
            }
        }

        // Animated water ripples
        this.waterRipples = [];
        this.waterZones.forEach(zone => {
            for (let i = 0; i < 4; i++) {
                const ripple = this.add.circle(
                    zone.x + Phaser.Math.Between(10, zone.w - 10),
                    zone.y + Phaser.Math.Between(10, zone.h - 10),
                    Phaser.Math.Between(3, 8), 0x64b5f6, 0.3
                ).setDepth(3);
                this.tweens.add({
                    targets: ripple,
                    scaleX: 2, scaleY: 2, alpha: 0,
                    duration: Phaser.Math.Between(2000, 4000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    onRepeat: () => {
                        ripple.x = zone.x + Phaser.Math.Between(10, zone.w - 10);
                        ripple.y = zone.y + Phaser.Math.Between(10, zone.h - 10);
                        ripple.setScale(1);
                    }
                });
                this.waterRipples.push(ripple);
            }
        });

        // --- TREES (drawn as actual tree shapes) ---
        const treePositions = isUnderwater ? [] : [
            // Same cluster positions, converted to pixel coords
            [5,4],[6,4],[7,4],[8,4],[5,5],[6,5],[7,5],[4,7],[5,7],
            [20,4],[21,4],[22,4],[23,4],[20,5],[21,5],[22,5],[22,7],[23,7],[24,7],
            [28,5],[29,5],[30,5],[28,6],[29,6],
            [50,5],[51,5],[52,5],[53,5],[55,4],[56,4],[57,4],
            [60,6],[61,6],[62,6],[70,4],[71,4],[72,4],[73,4],[74,7],[75,7],
            [4,20],[5,20],[6,20],[4,21],[5,21],[3,24],[4,24],
            [7,35],[8,35],[9,35],[4,38],[5,38],[4,39],[5,39],
            [25,18],[26,18],[27,18],[35,15],[36,15],[37,15],[35,16],[36,16],
            [33,22],[34,22],[38,25],[39,25],[30,35],[30,36],[42,30],[43,30],
            [62,18],[63,18],[64,18],[68,22],[69,22],[70,22],[72,28],[73,28],
            [65,32],[65,33],[74,35],[75,35],[76,35],
            [5,45],[6,45],[7,45],[8,45],[7,48],[8,48],[9,48],[3,51],[4,51],
            [10,50],[10,51],[25,48],[26,48],[30,52],[31,52],[32,52],
            [35,48],[36,48],[42,50],[42,51],[45,46],[46,46],
            [62,48],[63,48],[64,48],[68,50],[69,50],[72,46],[73,46],[74,52],[75,52],
            // Pond surround trees
            [52,36],[53,36],[52,37],[53,37],[52,40],[53,40],[52,41],[53,41],[52,42],[53,42],
            [54,36],[55,36],[56,36],[57,36],[58,36],[59,36],[60,36],[61,36],
            [63,37],[64,37],[63,38],[64,38],[63,39],[64,39],[63,40],[64,40],
            [63,41],[64,41],[63,42],[64,42],[63,43],[64,43],[63,44],[64,44],
            [54,47],[55,47],[56,47],[57,47],[58,47],[59,47],[60,47],[61,47],[62,47],
            [52,45],[53,45],
        ];

        // Coral positions for underwater
        const coralPositions = !isUnderwater ? [] : [
            [5,5],[6,5],[7,5],[15,6],[16,6],[17,6],[55,5],[56,5],[57,5],
            [62,8],[63,8],[8,15],[9,15],[50,15],[50,16],[60,20],[61,20],[62,20],
            [10,30],[11,30],[55,30],[56,30],[57,30],[20,38],[21,38],[22,38],
            [45,38],[45,39],[60,40],[61,40],[8,42],[9,42],[10,42],[50,44],[51,44],
        ];

        // Draw trees
        treePositions.forEach(([tx, ty]) => {
            const x = tx * tileSize + 8;
            const y = ty * tileSize + 8;
            const treeGfx = this.add.graphics().setDepth(4);
            // Trunk
            treeGfx.fillStyle(0x5d4037, 1);
            treeGfx.fillRect(x - 2, y - 2, 4, 10);
            // Canopy (layered circles for round look)
            const cSize = Phaser.Math.Between(7, 12);
            treeGfx.fillStyle(0x2e7d32, 1);
            treeGfx.fillCircle(x, y - 6, cSize);
            treeGfx.fillStyle(0x388e3c, 0.8);
            treeGfx.fillCircle(x - 2, y - 8, cSize - 2);
            // Highlight
            treeGfx.fillStyle(0x4caf50, 0.5);
            treeGfx.fillCircle(x - 2, y - 9, cSize - 4);
        });

        // Draw coral
        coralPositions.forEach(([tx, ty]) => {
            const x = tx * tileSize + 8;
            const y = ty * tileSize + 8;
            const coralGfx = this.add.graphics().setDepth(4);
            const colors = [0xe74c3c, 0xf39c12, 0x9b59b6, 0x2ecc71, 0xe91e63];
            const color = colors[Phaser.Math.Between(0, 4)];
            // Coral branches
            coralGfx.fillStyle(color, 0.9);
            coralGfx.fillRect(x - 1, y - 8, 3, 12);
            coralGfx.fillRect(x - 5, y - 5, 3, 8);
            coralGfx.fillRect(x + 3, y - 6, 3, 9);
            // Tips
            coralGfx.fillStyle(color, 0.5);
            coralGfx.fillCircle(x, y - 9, 3);
            coralGfx.fillCircle(x - 4, y - 6, 2);
            coralGfx.fillCircle(x + 4, y - 7, 2);
        });

        // --- ANIMATED GRASS BLADES (area1 only) ---
        if (!isUnderwater) {
            this.grassBlades = [];
            for (let i = 0; i < 300; i++) {
                const bx = Phaser.Math.Between(tileSize * 2, worldW - tileSize * 2);
                const by = Phaser.Math.Between(tileSize * 2, worldH - tileSize * 2);
                const shade = Phaser.Math.Between(0, 2);
                const color = [0x4caf50, 0x66bb6a, 0x388e3c][shade];
                const blade = this.add.rectangle(bx, by, 1, Phaser.Math.Between(3, 6), color, 0.7)
                    .setOrigin(0.5, 1).setDepth(1);
                this.tweens.add({
                    targets: blade,
                    angle: { from: -8, to: 8 },
                    duration: Phaser.Math.Between(1500, 3000),
                    yoyo: true,
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 2000),
                    ease: 'Sine.easeInOut'
                });
                this.grassBlades.push(blade);
            }
        }

        // --- FLOATING PARTICLES ---
        if (!isUnderwater) {
            // Floating leaves
            for (let i = 0; i < 15; i++) {
                const leaf = this.add.rectangle(
                    Phaser.Math.Between(0, worldW),
                    Phaser.Math.Between(0, worldH),
                    3, 2, 0x8bc34a, 0.5
                ).setDepth(6);
                this.tweens.add({
                    targets: leaf,
                    x: leaf.x + Phaser.Math.Between(-100, 100),
                    y: leaf.y + Phaser.Math.Between(-60, 60),
                    angle: 360,
                    alpha: { from: 0.5, to: 0 },
                    duration: Phaser.Math.Between(4000, 8000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 4000)
                });
            }
        } else {
            // Floating bubbles
            for (let i = 0; i < 25; i++) {
                const bubble = this.add.circle(
                    Phaser.Math.Between(0, worldW),
                    Phaser.Math.Between(0, worldH),
                    Phaser.Math.Between(1, 3), 0x64b5f6, 0.4
                ).setDepth(6);
                this.tweens.add({
                    targets: bubble,
                    y: bubble.y - Phaser.Math.Between(60, 150),
                    alpha: 0,
                    duration: Phaser.Math.Between(3000, 7000),
                    repeat: -1,
                    delay: Phaser.Math.Between(0, 4000),
                    onRepeat: () => {
                        bubble.x = Phaser.Math.Between(0, worldW);
                        bubble.y = Phaser.Math.Between(worldH * 0.3, worldH);
                    }
                });
            }
        }

        // --- HOUSES / RUINS (drawn as actual buildings) ---
        this.buildingBodies = this.physics.add.staticGroup();
        const housePositions = isUnderwater ? [
            [33,23,4,3],[15,18,3,2],[50,20,3,2],[25,35,3,2],
            [45,35,3,2],[35,10,2,2],[20,42,2,2],[55,42,3,2]
        ] : [
            [10,7,3,2],[16,6,3,2],[6,12,2,2],[18,11,3,2],
            [10,33,3,2],[14,35,2,2],[22,28,3,2],[26,26,2,2],
            [45,12,2,2],[60,14,3,2],[40,42,2,2],[15,50,3,2]
        ];

        housePositions.forEach(([tx, ty, tw, th]) => {
            const x = tx * tileSize;
            const y = ty * tileSize;
            const w = tw * tileSize;
            const h = th * tileSize;
            const bGfx = this.add.graphics().setDepth(5);

            if (isUnderwater) {
                // Ancient ruins — stone pillars and broken walls
                bGfx.fillStyle(0x37474f, 0.9);
                bGfx.fillRect(x, y + 4, w, h - 4);
                // Pillars
                bGfx.fillStyle(0x546e7a, 1);
                bGfx.fillRect(x + 2, y, 4, h);
                bGfx.fillRect(x + w - 6, y, 4, h);
                // Top beam
                bGfx.fillStyle(0x546e7a, 1);
                bGfx.fillRect(x, y, w, 4);
                // Glow inside
                bGfx.fillStyle(0x29b6f6, 0.2);
                bGfx.fillRect(x + 8, y + 6, w - 16, h - 10);
            } else {
                // Cozy village houses
                // Walls
                bGfx.fillStyle(0xd7ccc8, 1);
                bGfx.fillRect(x, y + 6, w, h - 6);
                // Roof (darker, triangle-ish)
                bGfx.fillStyle(0x8d6e63, 1);
                bGfx.fillRect(x - 2, y, w + 4, 8);
                bGfx.fillStyle(0x795548, 1);
                bGfx.fillRect(x, y + 2, w, 4);
                // Door
                bGfx.fillStyle(0x5d4037, 1);
                bGfx.fillRect(x + w / 2 - 3, y + h - 12, 6, 12);
                // Windows (warm glow)
                if (w > 20) {
                    bGfx.fillStyle(0xfff59d, 0.8);
                    bGfx.fillRect(x + 4, y + 10, 5, 5);
                    bGfx.fillRect(x + w - 9, y + 10, 5, 5);
                }
            }

            // Collision body (invisible)
            const body = this.buildingBodies.create(x + w / 2, y + h / 2, null);
            body.setVisible(false);
            body.body.setSize(w, h);
            body.setOrigin(0.5);
            body.refreshBody();
        });

        // --- WORLD BOUNDS ---
        this.physics.world.setBounds(0, 0, worldW, worldH);

        // --- SPAWN PLAYER ---
        const spawnX = this.currentArea.playerSpawn.x * tileSize;
        const spawnY = this.currentArea.playerSpawn.y * tileSize;
        this.player = new Player(this, spawnX, spawnY);

        // Restore player stats
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
            if (s.equippedWeapon) this.player.equippedWeapon = s.equippedWeapon;
            if (s.equippedArmor) this.player.equippedArmor = s.equippedArmor;
            if (s.inventory) this.player.inventory = [...s.inventory];
            if (s.potions) this.player.potions = { ...s.potions };
        }

        // --- CAMERA ---
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldW, worldH);
        this.cameras.main.setZoom(2.0);
        this.cameras.main.setBackgroundColor(isUnderwater ? '#0a1628' : '#1a1a2e');

        // --- COLLISIONS ---
        this.physics.add.collider(this.player, this.buildingBodies);

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

        // I key for inventory
        this.inventoryOpen = false;
        this.inventoryKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.inventoryKey.on('down', () => {
            if (this.dialogOpen || this.player.isDead) return;
            if (this.inventoryOpen) {
                this.scene.stop('Inventory');
                this.inventoryOpen = false;
            } else {
                this.inventoryOpen = true;
                this.scene.launch('Inventory', { player: this.player });
            }
        });

        // Guide arrow and "Press E" prompt are rendered in UIScene for crisp text
        this.guideState = { type: 'none' };

        // --- ENEMIES (spawned by quest system, not on load) ---
        this.enemies = this.physics.add.group();

        // Store collision group for enemy spawning
        this.collisionLayers = { buildings: this.buildingBodies };

        // Enemies collide with buildings and each other
        this.physics.add.collider(this.enemies, this.buildingBodies);
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
            'npc_sea_elder': 'npc',
            'npc_sea_merchant': 'npc'
        };
        const NPC_ANIMS = {
            'npc_elder': 'npc-elder-idle',
            'npc_shopkeeper': 'npc-shopkeeper-idle'
        };
        // Tints for NPCs without unique spritesheets
        const NPC_TINTS = {
            'npc_sea_elder': 0x3498db,
            'npc_sea_merchant': 0x1ABC9C
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
                // Apply tint if defined
                if (NPC_TINTS[npcId]) {
                    npc.setTint(NPC_TINTS[npcId]);
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

        // Safety: if dialogOpen is stuck but no dialog scene is running, reset it
        if (this.dialogOpen && !this.scene.isActive('Dialog') && !this.scene.isActive('Shop')) {
            this.dialogOpen = false;
        }
        // Same for inventoryOpen
        if (this.inventoryOpen && !this.scene.isActive('Inventory')) {
            this.inventoryOpen = false;
        }

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
                areaName: this.currentArea.name,
                equippedWeapon: this.player.equippedWeapon,
                equippedArmor: this.player.equippedArmor
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

        if (this.dialogOpen) return;

        // First: check if the player is near ANY NPC (quest giver, shop, or otherwise)
        // This shows "Press E" for ALL NPCs, not just quest givers
        let nearestNpc = null;
        let nearestDist = Infinity;
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;
            const npcX = npcData.x * tileSize;
            const npcY = npcData.y * tileSize;
            const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);
            if (dist < promptRange && dist < nearestDist) {
                nearestDist = dist;
                nearestNpc = npcData;
            }
        }

        if (nearestNpc) {
            const npcX = nearestNpc.x * tileSize;
            const npcY = nearestNpc.y * tileSize;
            this.guideState = { type: 'prompt', worldX: npcX, worldY: npcY - 28 };
            return;
        }

        // Second: if no NPC is nearby and there's no active quest, show guide arrow
        const hasActiveQuest = this.questManager.getActiveQuest() !== null;
        if (hasActiveQuest) return;

        // Find the NPC that has an available quest to point toward
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== this.currentAreaId) continue;
            if (npcData.isShop) continue; // Don't point arrows at shops
            const available = this.questManager.getAvailableQuests(npcId);
            if (available.length > 0) {
                const npcX = npcData.x * tileSize;
                const npcY = npcData.y * tileSize;
                const angle = Math.atan2(npcY - this.player.y, npcX - this.player.x);
                this.guideState = {
                    type: 'arrow',
                    worldX: this.player.x + Math.cos(angle) * 35,
                    worldY: this.player.y + Math.sin(angle) * 35,
                    angle: angle
                };
                return;
            }
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

        // If this NPC is a shop, open the shop scene instead of dialog
        if (npcData.isShop) {
            this.scene.launch('Shop', {
                player: this.player,
                shopType: npcData.shopType || 'weapons',
                npcName: npcData.name
            });
            return;
        }

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
        this.physics.add.collider(enemy, layers.buildings);
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

    // (placeCluster removed — no longer using tilemaps)

    // Check if player stepped into teleport zones
    checkPondTeleport() {
        // Don't teleport if already teleporting or in a menu
        if (this._teleporting) return;
        if (this.dialogOpen || this.inventoryOpen) return;

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

        // Area 2: step into the portal pool to return to area1
        // Water drawn at drawWater(12, 10, 6, 4) = tiles 12-17 x, 10-13 y
        if (this.currentAreaId === 'area2') {
            if (px >= 12 && px <= 17 && py >= 10 && py <= 13) {
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
                defense: this.player.defense,
                equippedWeapon: this.player.equippedWeapon,
                equippedArmor: this.player.equippedArmor,
                inventory: [...this.player.inventory],
                potions: { ...this.player.potions }
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
