// Realm of Quests - UI Scene (HUD Overlay)
//
// This scene runs ON TOP of the GameScene simultaneously.
// It has its own camera with NO zoom, so text appears at normal size.
//
// WHY A SEPARATE SCENE?
// The GameScene camera is zoomed in 2x to make the pixel art bigger.
// But that zoom also affects HUD text, making it blurry or weirdly sized.
// By putting the HUD in its own scene with its own camera, we get
// crisp, normally-sized text that stays in place on screen.

class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    create() {
        const font = 'Nunito';

        // === MAIN HUD PANEL ===
        this.hudBg = this.add.graphics();
        // Dark panel with subtle border
        this.hudBg.fillStyle(0x0d1117, 0.85);
        this.hudBg.fillRoundedRect(12, 10, 340, 82, 10);
        this.hudBg.lineStyle(1, 0x3a4a5a, 0.6);
        this.hudBg.strokeRoundedRect(12, 10, 340, 82, 10);

        // Equipped items sub-panel (below main HUD)
        this.hudBg.fillStyle(0x0d1117, 0.75);
        this.hudBg.fillRoundedRect(12, 96, 340, 22, 6);
        this.hudBg.lineStyle(1, 0x3a4a5a, 0.4);
        this.hudBg.strokeRoundedRect(12, 96, 340, 22, 6);

        // --- HP BAR ---
        this.healthBarBg = this.add.graphics();
        this.healthBarFill = this.add.graphics();

        // Heart icon + HP label
        this.add.text(22, 16, '\u2764', { fontSize: '14px', color: '#e74c3c' });
        this.add.text(42, 16, 'HP', {
            fontSize: '16px', fontFamily: font, fontStyle: 'bold', color: '#e74c3c'
        });
        this.healthText = this.add.text(280, 17, '', {
            fontSize: '14px', fontFamily: font, fontStyle: 'bold', color: '#cccccc'
        });

        // --- LEVEL + GOLD ROW ---
        // Shield icon + Level
        this.add.text(22, 40, '\u2694', { fontSize: '13px', color: '#f1c40f' });
        this.levelText = this.add.text(42, 40, '', {
            fontSize: '15px', fontFamily: font, fontStyle: 'bold', color: '#f1c40f'
        });
        // Coin icon + Gold
        this.add.text(150, 40, '\u25C9', { fontSize: '13px', color: '#f39c12' });
        this.goldText = this.add.text(170, 40, '', {
            fontSize: '15px', fontFamily: font, fontStyle: 'bold', color: '#f39c12'
        });

        // --- EQUIPPED ITEMS (sub-panel below HUD) ---
        this.equippedText = this.add.text(22, 99, '', {
            fontSize: '12px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: '#aaaaaa'
        });

        // --- XP BAR ---
        this.xpBarBg = this.add.graphics();
        this.xpBarFill = this.add.graphics();

        this.add.text(22, 63, '\u2605', { fontSize: '12px', color: '#3498db' });
        this.add.text(40, 63, 'XP', {
            fontSize: '13px', fontFamily: font, fontStyle: 'bold', color: '#3498db'
        });
        this.xpText = this.add.text(280, 64, '', {
            fontSize: '12px', fontFamily: font, fontStyle: 'bold', color: '#7eb8da'
        });

        // --- AREA NAME (bottom center) ---
        this.areaText = this.add.text(640, 695, '', {
            fontSize: '16px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // --- CONTROLS HINT (bottom left, fades after a few seconds) ---
        this.controlsHint = this.add.text(640, 675, 'WASD: move | SPACE: attack | E: talk | I: inventory | M: map', {
            fontSize: '14px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#666666'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.controlsHint,
            alpha: 0,
            duration: 1000,
            delay: 5000
        });

        // === QUEST TRACKER (top-right) ===
        this.questTrackerBg = this.add.graphics();

        this.questTrackerIcon = this.add.text(1268, 14, '', {
            fontSize: '14px', color: '#ffd700'
        }).setOrigin(1, 0).setVisible(false);

        this.questTrackerTitle = this.add.text(1252, 15, '', {
            fontSize: '15px', fontFamily: font, fontStyle: 'bold',
            color: '#ffd700'
        }).setOrigin(1, 0);

        this.questTrackerProgress = this.add.text(1268, 38, '', {
            fontSize: '13px', fontFamily: font, fontStyle: 'bold',
            color: '#cccccc'
        }).setOrigin(1, 0);

        this.activeQuestId = null;

        // === POTION BAR (right side) ===
        this.potionSlots = [];
        this.potionBg = this.add.graphics();
        const potionList = ['health_potion', 'damage_potion', 'xp_potion', 'mega_health'];
        const potionIcons = { health_potion: '❤', damage_potion: '⚔', xp_potion: '★', mega_health: '💖' };
        const potionColors = { health_potion: '#e74c3c', damage_potion: '#e67e22', xp_potion: '#3498db', mega_health: '#ff1493' };
        const slotX = 1230;
        const slotStartY = 200;

        potionList.forEach((potionId, i) => {
            const sy = slotStartY + i * 55;
            const potionData = POTIONS[potionId];

            // Icon
            const icon = this.add.text(slotX, sy, potionIcons[potionId], {
                fontSize: '20px'
            }).setOrigin(0.5).setDepth(5);

            // Count text
            const countText = this.add.text(slotX + 22, sy - 2, 'x0', {
                fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: potionColors[potionId]
            }).setOrigin(0, 0.5).setDepth(5);

            // USE button
            const useBtn = this.add.text(slotX, sy + 18, 'USE', {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#333333', backgroundColor: '#555555',
                padding: { x: 8, y: 2 }
            }).setOrigin(0.5).setDepth(5).setInteractive({ useHandCursor: true });

            useBtn.on('pointerover', () => useBtn.setStyle({ backgroundColor: '#777777', color: '#ffffff' }));
            useBtn.on('pointerout', () => {
                const gameScene = this.scene.get('Game');
                const count = gameScene && gameScene.player ? (gameScene.player.potions[potionId] || 0) : 0;
                if (count > 0) {
                    useBtn.setStyle({ backgroundColor: potionColors[potionId], color: '#ffffff' });
                } else {
                    useBtn.setStyle({ backgroundColor: '#555555', color: '#333333' });
                }
            });
            useBtn.on('pointerdown', () => this.usePotion(potionId));

            this.potionSlots.push({ potionId, icon, countText, useBtn });
        });

        // --- NPC OVERLAYS (rendered here so text is crisp, not zoomed) ---
        this.npcLabels = [];    // Name labels
        this.npcMarkers = [];   // "!" quest markers

        // "Press E" prompt
        this.pressEText = this.add.text(0, 0, 'Press E', {
            fontSize: '16px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(15).setVisible(false);

        // Guide arrow
        this.guideArrowGfx = this.add.triangle(0, 0, 0, 12, 6, 0, 12, 12, 0xffd700)
            .setDepth(15).setVisible(false);
        this.tweens.add({
            targets: this.guideArrowGfx,
            alpha: { from: 1, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // --- MOBILE TOUCH CONTROLS ---
        // Only show on touch devices (phones/tablets).
        // A D-pad on the left for movement, and an Attack button on the right.
        //
        // We store the current touch direction so the GameScene can read it.
        this.touchDirection = { x: 0, y: 0 };
        this.touchAttack = false;

        // Check if this is a touch device
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }

        // --- MAP OVERLAY (press M to toggle) ---
        this.mapOpen = false;
        this.mapGraphics = this.add.graphics().setDepth(40);
        this.mapPlayerDot = this.add.graphics().setDepth(42);
        this.mapIcons = this.add.graphics().setDepth(41);
        this.mapTitle = this.add.text(640, 55, '', {
            fontSize: '22px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(42).setVisible(false);
        this.mapHint = this.add.text(640, 665, 'Press M to close', {
            fontSize: '14px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#888888'
        }).setOrigin(0.5).setDepth(42).setVisible(false);
        this.mapOverlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7)
            .setDepth(39).setVisible(false);

        this.mapKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        this.mapKey.on('down', () => {
            this.mapOpen = !this.mapOpen;
            if (this.mapOpen) {
                this.drawMap();
            } else {
                this.hideMap();
            }
        });
    }

    // --- CREATE MOBILE CONTROLS ---
    // Virtual joystick (left) + action buttons (right)
    createMobileControls() {
        // --- VIRTUAL JOYSTICK (bottom-left) ---
        const joyX = 140, joyY = 580, joyRadius = 60;

        // Joystick base (outer circle)
        this.joyBase = this.add.circle(joyX, joyY, joyRadius, 0xffffff, 0.15)
            .setDepth(30).setStrokeStyle(2, 0xffffff, 0.3);

        // Joystick thumb (inner circle — the part you drag)
        this.joyThumb = this.add.circle(joyX, joyY, 22, 0xffffff, 0.4)
            .setDepth(31);

        // Invisible hit zone for joystick (larger than visible area)
        this.joyZone = this.add.circle(joyX, joyY, joyRadius + 30, 0x000000, 0.001)
            .setDepth(32).setInteractive();

        this.joyZone.on('pointerdown', (pointer) => {
            this._joyActive = true;
            this._joyPointerId = pointer.id;
        });

        this.input.on('pointermove', (pointer) => {
            if (!this._joyActive || pointer.id !== this._joyPointerId) return;

            const dx = pointer.x - joyX;
            const dy = pointer.y - joyY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = joyRadius;

            // Clamp thumb position to joystick radius
            const clampDist = Math.min(dist, maxDist);
            const angle = Math.atan2(dy, dx);
            this.joyThumb.x = joyX + Math.cos(angle) * clampDist;
            this.joyThumb.y = joyY + Math.sin(angle) * clampDist;

            // Set direction (normalized)
            if (dist > 15) { // Dead zone
                this.touchDirection.x = dx / dist;
                this.touchDirection.y = dy / dist;
            } else {
                this.touchDirection.x = 0;
                this.touchDirection.y = 0;
            }
        });

        const resetJoystick = (pointer) => {
            if (pointer && pointer.id !== this._joyPointerId) return;
            this._joyActive = false;
            this.joyThumb.x = joyX;
            this.joyThumb.y = joyY;
            this.touchDirection.x = 0;
            this.touchDirection.y = 0;
        };

        this.input.on('pointerup', resetJoystick);

        // --- ACTION BUTTONS (bottom-right) ---
        const btnAlpha = 0.35;

        // Attack button (big, red)
        const atkX = 1160, atkY = 580;
        const atkBg = this.add.circle(atkX, atkY, 50, 0xe94560, btnAlpha)
            .setDepth(30).setStrokeStyle(2, 0xe94560, 0.5).setInteractive();
        this.add.text(atkX, atkY - 4, '\u2694', {
            fontSize: '32px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setAlpha(0.8);
        this.add.text(atkX, atkY + 22, 'ATK', {
            fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setAlpha(0.5);

        atkBg.on('pointerdown', () => {
            this.touchAttack = true;
            atkBg.setFillStyle(0xe94560, 0.6);
        });
        atkBg.on('pointerup', () => {
            this.touchAttack = false;
            atkBg.setFillStyle(0xe94560, btnAlpha);
        });
        atkBg.on('pointerout', () => {
            this.touchAttack = false;
            atkBg.setFillStyle(0xe94560, btnAlpha);
        });

        // Talk button (E) — smaller, above-left of attack
        const talkX = 1080, talkY = 530;
        const talkBg = this.add.circle(talkX, talkY, 30, 0x3498db, btnAlpha)
            .setDepth(30).setStrokeStyle(2, 0x3498db, 0.5).setInteractive();
        this.add.text(talkX, talkY, 'E', {
            fontSize: '18px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setAlpha(0.8);

        this.touchTalk = false;
        talkBg.on('pointerdown', () => {
            this.touchTalk = true;
            talkBg.setFillStyle(0x3498db, 0.6);
        });
        talkBg.on('pointerup', () => {
            this.touchTalk = false;
            talkBg.setFillStyle(0x3498db, btnAlpha);
        });
        talkBg.on('pointerout', () => {
            this.touchTalk = false;
            talkBg.setFillStyle(0x3498db, btnAlpha);
        });

        // Inventory button (I) — above talk
        const invBtnX = 1020, invBtnY = 490;
        const invBtnBg = this.add.circle(invBtnX, invBtnY, 25, 0x9b59b6, btnAlpha)
            .setDepth(30).setStrokeStyle(2, 0x9b59b6, 0.5).setInteractive();
        this.add.text(invBtnX, invBtnY, 'I', {
            fontSize: '14px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setAlpha(0.8);

        invBtnBg.on('pointerdown', () => {
            const gameScene = this.scene.get('Game');
            if (gameScene && !gameScene.dialogOpen && !gameScene.player.isDead) {
                if (gameScene.inventoryOpen) {
                    gameScene.scene.stop('Inventory');
                    gameScene.inventoryOpen = false;
                } else {
                    gameScene.inventoryOpen = true;
                    gameScene.scene.launch('Inventory', { player: gameScene.player });
                }
            }
            invBtnBg.setFillStyle(0x9b59b6, 0.6);
        });
        invBtnBg.on('pointerup', () => {
            invBtnBg.setFillStyle(0x9b59b6, btnAlpha);
        });

        // Map button (M) — smaller, above-right of talk
        const mapBtnX = 1160, mapBtnY = 490;
        const mapBtnBg = this.add.circle(mapBtnX, mapBtnY, 25, 0x2ecc71, btnAlpha)
            .setDepth(30).setStrokeStyle(2, 0x2ecc71, 0.5).setInteractive();
        this.add.text(mapBtnX, mapBtnY, 'M', {
            fontSize: '14px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setAlpha(0.8);

        mapBtnBg.on('pointerdown', () => {
            this.mapOpen = !this.mapOpen;
            if (this.mapOpen) { this.drawMap(); } else { this.hideMap(); }
            mapBtnBg.setFillStyle(0x2ecc71, 0.6);
        });
        mapBtnBg.on('pointerup', () => {
            mapBtnBg.setFillStyle(0x2ecc71, btnAlpha);
        });
    }

    // --- FLOATING TEXT (rendered in UIScene for crisp display) ---
    // Call this from any scene to show floating text at a world position.
    showFloatingText(worldX, worldY, text, color, size, duration) {
        const gameScene = this.scene.get('Game');
        if (!gameScene) return;

        const cam = gameScene.cameras.main;
        const sx = (worldX - cam.worldView.centerX) * cam.zoom + cam.width / 2;
        const sy = (worldY - cam.worldView.centerY) * cam.zoom + cam.height / 2;

        const txt = this.add.text(sx, sy, text, {
            fontSize: (size || 16) + 'px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: color || '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(30);

        this.tweens.add({
            targets: txt,
            y: txt.y - 40,
            alpha: 0,
            duration: duration || 1200,
            ease: 'Power2',
            onComplete: () => txt.destroy()
        });
    }

    // --- MAP OVERLAY ---
    drawMap() {
        const gameScene = this.scene.get('Game');
        if (!gameScene || !gameScene.currentArea) return;

        const area = gameScene.currentArea;
        const areaId = gameScene.currentAreaId;
        const tileSize = 16;
        const isUnderwater = (areaId === 'area2');
        const isElderHouse = (areaId === 'elder_house');

        const mapW = 900, mapH = 540, mapX = 190, mapY = 85;
        const scaleX = mapW / area.width;
        const scaleY = mapH / area.height;

        this.mapOverlay.setVisible(true);
        this.mapTitle.setVisible(true).setText(area.name);
        this.mapHint.setVisible(true);

        const g = this.mapGraphics;
        g.clear();
        this.mapIcons.clear();

        if (isElderHouse) {
            // Simple interior map
            g.fillStyle(0x6d4c2e, 1); g.fillRect(mapX, mapY, mapW, mapH);
            g.fillStyle(0x795548, 1);
            g.fillRect(mapX, mapY, mapW, scaleY * 2); // top wall
            g.fillRect(mapX, mapY, scaleX * 2, mapH);  // left wall
            g.fillRect(mapX + mapW - scaleX * 2, mapY, scaleX * 2, mapH); // right wall
            g.fillRect(mapX, mapY + mapH - scaleY * 2, mapW, scaleY * 2); // bottom wall
            // Door gap
            g.fillStyle(0x6d4c2e, 1);
            g.fillRect(mapX + 6 * scaleX, mapY + mapH - scaleY * 2, 2 * scaleX, scaleY * 2);
            g.lineStyle(2, 0xffd700, 0.8); g.strokeRect(mapX, mapY, mapW, mapH);
        } else if (isUnderwater) {
            // Underwater map
            g.fillStyle(0x1a3a4a, 1); g.fillRect(mapX, mapY, mapW, mapH);
            g.lineStyle(2, 0xffd700, 0.8); g.strokeRect(mapX, mapY, mapW, mapH);
            // Paths
            const midY = Math.floor(area.height / 2), midX = Math.floor(area.width / 2);
            g.fillStyle(0x2a5a6a, 0.7);
            g.fillRect(mapX, mapY + midY * scaleY, mapW, scaleY * 2);
            g.fillRect(mapX + midX * scaleX, mapY, scaleX * 2, mapH);
            // Water pools
            g.fillStyle(0x1565c0, 0.8);
            g.fillRect(mapX + 12 * scaleX, mapY + 10 * scaleY, 6 * scaleX, 4 * scaleY);
            g.fillRect(mapX + 52 * scaleX, mapY + 35 * scaleY, 4 * scaleX, 3 * scaleY);
            // Portal glow on pool 1
            g.lineStyle(2, 0x00ff88, 0.7);
            g.strokeRect(mapX + 12 * scaleX - 2, mapY + 10 * scaleY - 2, 6 * scaleX + 4, 4 * scaleY + 4);
            // Ruins
            g.fillStyle(0x4a6a7a, 0.9);
            [[33,23,4,3],[15,18,3,2],[50,20,3,2],[25,35,3,2],[45,35,3,2],[35,10,2,2],[20,42,2,2],[55,42,3,2]].forEach(r => {
                g.fillRect(mapX + r[0] * scaleX, mapY + r[1] * scaleY, r[2] * scaleX, r[3] * scaleY);
            });
        } else if (/^area([3-9]|10)$/.test(areaId)) {
            // === NEW AREAS (3-10) — themed maps ===
            const AREA_MAP_THEMES = {
                area3:  { bg: 0x2d4a1e, path: 0x5c4033, water: [[10,15,8,6],[55,40,6,5]], portal: [10,15,8,6], label: 'Swamp' },
                area4:  { bg: 0xd4a757, path: 0xb8860b, water: [[20,25,5,4]], portal: [20,25,5,4], label: 'Desert' },
                area5:  { bg: 0x2a1a0a, path: 0x4a3020, water: [], portal: [65,60,5,3], lava: [[20,20,10,4],[50,50,8,5]], label: 'Volcano' },
                area6:  { bg: 0xdce8f0, path: 0xa0b8c8, water: [[30,20,12,8]], portal: [75,50,5,3], label: 'Tundra' },
                area7:  { bg: 0x1a1a2e, path: 0x3d3d5c, water: [], portal: [55,60,5,3], walls: [15,15,40,40], label: 'Castle' },
                area8:  { bg: 0x1a1030, path: 0x2a1a40, water: [], portal: [65,60,5,3], label: 'Caverns' },
                area9:  { bg: 0x87ceeb, path: 0xdaa520, water: [], portal: [65,50,5,3], label: 'Temple' },
                area10: { bg: 0x0a0015, path: 0x2d0050, water: [[25,25,8,6]], portal: [75,60,5,3], label: 'Shadow' },
            };
            const theme = AREA_MAP_THEMES[areaId];
            // Background
            g.fillStyle(theme.bg, 1); g.fillRect(mapX, mapY, mapW, mapH);
            g.lineStyle(2, 0xffd700, 0.8); g.strokeRect(mapX, mapY, mapW, mapH);
            // Paths (cross pattern)
            g.fillStyle(theme.path, 0.6);
            g.fillRect(mapX, mapY + Math.floor(area.height * 0.45) * scaleY, mapW, scaleY * 2);
            g.fillRect(mapX + Math.floor(area.width * 0.5) * scaleX, mapY, scaleX * 2, mapH);
            // Water / lava
            if (theme.water) {
                g.fillStyle(0x1565c0, 0.7);
                theme.water.forEach(([wx,wy,ww,wh]) => {
                    g.fillRect(mapX + wx * scaleX, mapY + wy * scaleY, ww * scaleX, wh * scaleY);
                });
            }
            if (theme.lava) {
                g.fillStyle(0xff4500, 0.6);
                theme.lava.forEach(([lx,ly,lw,lh]) => {
                    g.fillRect(mapX + lx * scaleX, mapY + ly * scaleY, lw * scaleX, lh * scaleY);
                });
            }
            // Castle walls
            if (theme.walls) {
                const [wx,wy,ww,wh] = theme.walls;
                g.lineStyle(2, 0x546e7a, 0.7);
                g.strokeRect(mapX + wx * scaleX, mapY + wy * scaleY, ww * scaleX, wh * scaleY);
            }
            // Portal (green glow)
            if (theme.portal) {
                const [px,py,pw,ph] = theme.portal;
                g.fillStyle(0x00ff88, 0.5);
                g.fillRect(mapX + px * scaleX, mapY + py * scaleY, pw * scaleX, ph * scaleY);
                g.lineStyle(2, 0x00ff88, 0.7);
                g.strokeRect(mapX + px * scaleX - 2, mapY + py * scaleY - 2, pw * scaleX + 4, ph * scaleY + 4);
            }
        } else {
            // === AREA 1: GREENWOOD VILLAGE ===
            // Grass background
            g.fillStyle(0x4a8c3f, 1); g.fillRect(mapX, mapY, mapW, mapH);
            g.lineStyle(2, 0xffd700, 0.8); g.strokeRect(mapX, mapY, mapW, mapH);

            // Jungle zone (dark green)
            g.fillStyle(0x1b5e20, 0.5);
            g.fillRect(mapX + 55 * scaleX, mapY + 34 * scaleY, 42 * scaleX, 44 * scaleY);
            // Darker core jungle
            g.fillStyle(0x0d3b0d, 0.3);
            g.fillRect(mapX + 60 * scaleX, mapY + 40 * scaleY, 30 * scaleX, 35 * scaleY);

            // Paths
            g.fillStyle(0xc4a265, 0.7);
            // Main horizontal road at y=40
            g.fillRect(mapX, mapY + 40 * scaleY, mapW, scaleY * 2);
            // Vertical path at x=50
            g.fillRect(mapX + 50 * scaleX, mapY + 3 * scaleY, scaleX * 2, (area.height - 6) * scaleY);
            // City path from gate (y=22) to main road (y=40)
            g.fillRect(mapX + 14 * scaleX, mapY + 22 * scaleY, scaleX * 2, 18 * scaleY);
            // Connection from city path to main road
            g.fillRect(mapX + 14 * scaleX, mapY + 40 * scaleY, 36 * scaleX, scaleY * 2);

            // City walls (thick outline with fill)
            g.fillStyle(0x546e7a, 0.6);
            g.fillRect(mapX + 4 * scaleX, mapY + 5 * scaleY, 22 * scaleX, scaleY);  // top
            g.fillRect(mapX + 4 * scaleX, mapY + 5 * scaleY, scaleX, 16 * scaleY);  // left
            g.fillRect(mapX + 25 * scaleX, mapY + 5 * scaleY, scaleX, 16 * scaleY); // right
            g.fillRect(mapX + 4 * scaleX, mapY + 20 * scaleY, 9 * scaleX, scaleY);  // bottom-left
            g.fillRect(mapX + 16 * scaleX, mapY + 20 * scaleY, 10 * scaleX, scaleY); // bottom-right
            // City interior (lighter)
            g.fillStyle(0x8d8d6e, 0.3);
            g.fillRect(mapX + 5 * scaleX, mapY + 6 * scaleY, 20 * scaleX, 14 * scaleY);
            // Gate opening
            g.fillStyle(0xc4a265, 0.8);
            g.fillRect(mapX + 13 * scaleX, mapY + 20 * scaleY, 3 * scaleX, scaleY);

            // Corner towers (small squares)
            g.fillStyle(0x455a64, 0.8);
            [[4,5],[25,5],[4,20],[25,20]].forEach(([tx,ty]) => {
                g.fillRect(mapX + tx * scaleX - 2, mapY + ty * scaleY - 2, scaleX + 4, scaleY + 4);
            });

            // Water bodies (visible ones only — NOT the hidden pond)
            g.fillStyle(0x1565c0, 0.8);
            g.fillRect(mapX + 18 * scaleX, mapY + 28 * scaleY, 3 * scaleX, 2 * scaleY); // village pond
            g.fillRect(mapX + 38 * scaleX, mapY + 12 * scaleY, 4 * scaleX, 3 * scaleY); // small lake

            // Bridge over village pond
            g.fillStyle(0x795548, 0.8);
            g.fillRect(mapX + 19 * scaleX, mapY + 28 * scaleY, 2 * scaleX, 3 * scaleY);

            // Houses (brown rectangles)
            g.fillStyle(0xd4a574, 0.9);
            // City houses
            [[7,8,4,3],[8,14,3,2],[20,8,3,2],[20,14,3,2]].forEach(h => {
                g.fillRect(mapX + h[0] * scaleX, mapY + h[1] * scaleY, h[2] * scaleX, h[3] * scaleY);
            });
            // Outside houses
            [[35,38,3,2],[45,20,2,2],[30,55,3,2],[8,50,3,2],[48,62,2,2]].forEach(h => {
                g.fillRect(mapX + h[0] * scaleX, mapY + h[1] * scaleY, h[2] * scaleX, h[3] * scaleY);
            });

            // Market stand
            g.fillStyle(0xc62828, 0.7);
            g.fillRect(mapX + 16 * scaleX, mapY + 13 * scaleY, 4 * scaleX, 2 * scaleY);

            // Campfire
            g.fillStyle(0xff5722, 0.8);
            g.fillCircle(mapX + 48 * scaleX, mapY + 38 * scaleY, 3);

            // Fence line
            g.lineStyle(1, 0x795548, 0.5);
            g.beginPath();
            g.moveTo(mapX + 12 * scaleX, mapY + 24 * scaleY);
            g.lineTo(mapX + 12 * scaleX, mapY + 38 * scaleY);
            g.strokePath();

            // Tree clusters (small green dots to show forests)
            g.fillStyle(0x2e7d32, 0.6);
            // Northern scattered trees
            [[4,3],[29,3],[46,4],[56,3],[86,3]].forEach(([tx,ty]) => {
                g.fillCircle(mapX + tx * scaleX, mapY + ty * scaleY, 4);
            });
            // West forest
            [[3,31],[3,37],[3,46],[3,56],[3,66]].forEach(([tx,ty]) => {
                g.fillCircle(mapX + tx * scaleX, mapY + ty * scaleY, 4);
            });
            // South meadow
            [[9,61],[21,63],[36,66],[16,73],[43,71]].forEach(([tx,ty]) => {
                g.fillCircle(mapX + tx * scaleX, mapY + ty * scaleY, 4);
            });
        }

        // Draw NPCs (yellow dots with name)
        const ic = this.mapIcons;
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== areaId) continue;
            ic.fillStyle(0xffd700, 1);
            ic.fillRect(mapX + npcData.x * scaleX - 3, mapY + npcData.y * scaleY - 3, 6, 6);
        }
        // Show elder on area1 map (inside the house)
        if (areaId === 'area1') {
            ic.fillStyle(0xffd700, 1);
            ic.fillRect(mapX + 9 * scaleX - 3, mapY + 10 * scaleY - 3, 6, 6);
            // Show area portals as colored dots
            if (gameScene.areaPortals) {
                gameScene.areaPortals.forEach(p => {
                    ic.fillStyle(p.color, 0.8);
                    ic.fillRect(mapX + p.tx * scaleX - 2, mapY + p.ty * scaleY - 2, 5, 5);
                });
            }
        }

        this._mapParams = { mapX, mapY, scaleX, scaleY, tileSize };
    }

    hideMap() {
        this.mapOverlay.setVisible(false);
        this.mapGraphics.clear();
        this.mapIcons.clear();
        this.mapPlayerDot.clear();
        this.mapTitle.setVisible(false);
        this.mapHint.setVisible(false);
        this._mapParams = null;
    }

    // Called by DialogScene when quest is accepted, or QuestManager when quest completes
    updateQuestTracker(questId) {
        this.activeQuestId = questId;

        if (!questId) {
            // No active quest — hide tracker
            this.questTrackerBg.clear();
            this.questTrackerTitle.setText('');
            this.questTrackerProgress.setText('');
            this.questTrackerIcon.setVisible(false);
            return;
        }

        const quest = QUESTS[questId];
        this.questTrackerTitle.setText(quest.name);
    }

    // Called by GameScene every frame to update the HUD values
    updateHUD(playerData) {
        // --- HP BAR (rounded, with track) ---
        const barX = 70, barW = 200, barH = 14, barY = 18;
        const healthPercent = playerData.hp / playerData.maxHP;

        this.healthBarBg.clear();
        this.healthBarBg.fillStyle(0x1a1a2a, 1);
        this.healthBarBg.fillRoundedRect(barX, barY, barW, barH, 7);

        this.healthBarFill.clear();
        if (healthPercent > 0) {
            const hpColor = healthPercent > 0.5 ? 0x2ecc71 : healthPercent > 0.25 ? 0xf1c40f : 0xe74c3c;
            this.healthBarFill.fillStyle(hpColor, 1);
            this.healthBarFill.fillRoundedRect(barX, barY, barW * healthPercent, barH, 7);
            // Shine highlight
            this.healthBarFill.fillStyle(0xffffff, 0.15);
            this.healthBarFill.fillRoundedRect(barX + 2, barY + 1, barW * healthPercent - 4, barH / 2 - 1, 4);
        }

        this.healthText.setText(`${playerData.hp}/${playerData.maxHP}`);
        this.levelText.setText(`LVL ${playerData.level}`);
        this.goldText.setText(`${playerData.gold}`);
        this.areaText.setText(playerData.areaName || '');

        // Update equipped items display
        if (playerData.equippedWeapon && playerData.equippedArmor) {
            const wName = WEAPONS[playerData.equippedWeapon] ? WEAPONS[playerData.equippedWeapon].name : '';
            const aName = ARMOR[playerData.equippedArmor] ? ARMOR[playerData.equippedArmor].name : '';
            this.equippedText.setText(`⚔${wName}  🛡${aName}`);
        }

        // --- XP BAR (thinner, blue) ---
        const xpBarX = 70, xpBarW = 200, xpBarH = 10, xpBarY = 65;
        const currentLevelXP = LEVEL_CURVE[playerData.level].xpNeeded;
        const nextLevel = Math.min(playerData.level + 1, MAX_LEVEL);
        const nextLevelXP = LEVEL_CURVE[nextLevel].xpNeeded;
        const xpProgress = playerData.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        const xpPercent = xpNeeded > 0 ? Math.min(xpProgress / xpNeeded, 1) : 1;

        this.xpBarBg.clear();
        this.xpBarBg.fillStyle(0x1a1a2a, 1);
        this.xpBarBg.fillRoundedRect(xpBarX, xpBarY, xpBarW, xpBarH, 5);

        this.xpBarFill.clear();
        if (xpPercent > 0) {
            this.xpBarFill.fillStyle(0x3498db, 1);
            this.xpBarFill.fillRoundedRect(xpBarX, xpBarY, xpBarW * xpPercent, xpBarH, 5);
            this.xpBarFill.fillStyle(0xffffff, 0.12);
            this.xpBarFill.fillRoundedRect(xpBarX + 2, xpBarY + 1, xpBarW * xpPercent - 4, xpBarH / 2 - 1, 3);
        }
        this.xpText.setText(`${xpProgress}/${xpNeeded}`);

        // --- UPDATE NPC OVERLAYS (world-to-screen conversion) ---
        const gameScene = this.scene.get('Game');
        if (gameScene && gameScene.npcs) {
            const cam = gameScene.cameras.main;
            // Helper: convert world coords to screen coords
            const w2s = (wx, wy) => ({
                x: (wx - cam.worldView.centerX) * cam.zoom + cam.width / 2,
                y: (wy - cam.worldView.centerY) * cam.zoom + cam.height / 2
            });

            // Create labels + markers on first frame
            if (this.npcLabels.length === 0 && gameScene.npcs.length > 0) {
                gameScene.npcs.forEach(npc => {
                    // Name label
                    const label = this.add.text(0, 0, npc.npcData.name, {
                        fontSize: '16px',
                        fontFamily: 'Nunito',
                        fontStyle: 'bold',
                        color: '#ffffff',
                        stroke: '#000000',
                        strokeThickness: 3
                    }).setOrigin(0.5).setDepth(5);
                    label.npcRef = npc;
                    this.npcLabels.push(label);

                    // "!" marker for quest-giving NPCs, "$" for shop NPCs
                    if (npc.npcData.quests.length > 0) {
                        const marker = this.add.text(0, 0, '!', {
                            fontSize: '20px',
                            fontFamily: 'Nunito',
                            fontStyle: 'bold',
                            color: '#ffd700',
                            stroke: '#000000',
                            strokeThickness: 4
                        }).setOrigin(0.5).setDepth(5);
                        marker.npcRef = npc;
                        this.npcMarkers.push(marker);
                    } else if (npc.npcData.isShop) {
                        const marker = this.add.text(0, 0, '$', {
                            fontSize: '20px',
                            fontFamily: 'Nunito',
                            fontStyle: 'bold',
                            color: '#f39c12',
                            stroke: '#000000',
                            strokeThickness: 4
                        }).setOrigin(0.5).setDepth(5);
                        marker.npcRef = npc;
                        this.npcMarkers.push(marker);
                    }
                });
            }

            // Update name label positions
            this.npcLabels.forEach(label => {
                if (this.mapOpen) { label.setVisible(false); return; }
                const npc = label.npcRef;
                if (!npc || !npc.active) { label.setVisible(false); return; }
                const s = w2s(npc.x, npc.y + 20);
                label.setPosition(s.x, s.y);
                label.setVisible(true);
            });

            // Update "!" marker positions (with bounce)
            const bounce = Math.sin(Date.now() * 0.005) * 5;
            this.npcMarkers.forEach(marker => {
                if (this.mapOpen) { marker.setVisible(false); return; }
                const npc = marker.npcRef;
                if (!npc || !npc.active) { marker.setVisible(false); return; }
                const s = w2s(npc.x, npc.y - 20 + bounce);
                marker.setPosition(s.x, s.y);
                marker.setVisible(true);
            });

            // Update guide arrow / "Press E" prompt
            const guide = gameScene.guideState;
            if (!guide || guide.type === 'none' || this.mapOpen) {
                this.pressEText.setVisible(false);
                this.guideArrowGfx.setVisible(false);
            } else if (guide.type === 'prompt') {
                this.guideArrowGfx.setVisible(false);
                const s = w2s(guide.worldX, guide.worldY);
                this.pressEText.setPosition(s.x, s.y);
                this.pressEText.setVisible(true);
            } else if (guide.type === 'arrow') {
                this.pressEText.setVisible(false);
                const s = w2s(guide.worldX, guide.worldY);
                this.guideArrowGfx.setPosition(s.x, s.y);
                this.guideArrowGfx.setRotation(guide.angle + Math.PI / 2);
                this.guideArrowGfx.setVisible(true);
            }
        }

        // Update map player dot (blinking)
        if (this.mapOpen && this._mapParams) {
            const { mapX, mapY, scaleX, scaleY, tileSize } = this._mapParams;
            const gameScene = this.scene.get('Game');
            if (gameScene && gameScene.player) {
                const px = gameScene.player.x / tileSize;
                const py = gameScene.player.y / tileSize;
                this.mapPlayerDot.clear();
                // Blink effect
                const blink = Math.sin(Date.now() * 0.005) > 0;
                this.mapPlayerDot.fillStyle(blink ? 0x00ff00 : 0x88ff88, 1);
                this.mapPlayerDot.fillRect(
                    mapX + px * scaleX - 4,
                    mapY + py * scaleY - 4,
                    8, 8
                );
            }
        }

        // Update quest tracker progress
        if (this.activeQuestId) {
            const gameScene = this.scene.get('Game');
            if (gameScene && gameScene.questManager) {
                const quest = QUESTS[this.activeQuestId];
                const progress = gameScene.questManager.questProgress[this.activeQuestId] || 0;

                if (quest.type === 'kill') {
                    const target = ENEMIES[quest.target] ? ENEMIES[quest.target].name : quest.target;
                    this.questTrackerProgress.setText(
                        `Kill ${target}s: ${progress}/${quest.targetCount}`
                    );
                } else if (quest.type === 'talk') {
                    const npc = NPCS[quest.target] ? NPCS[quest.target].name : quest.target;
                    this.questTrackerProgress.setText(`Find ${npc}`);
                } else if (quest.type === 'collect_drops') {
                    this.questTrackerProgress.setText(
                        `Collect ${quest.itemLabel}: ${progress}/${quest.targetCount}`
                    );
                } else if (quest.type === 'find_hidden') {
                    this.questTrackerProgress.setText(
                        `Find ${quest.itemLabel}: ${progress}/${quest.targetCount}`
                    );
                } else if (quest.type === 'deliver') {
                    this.questTrackerProgress.setText(`Deliver to ${quest.destinationLabel}`);
                } else {
                    this.questTrackerProgress.setText('In progress...');
                }

                // Draw quest panel
                this.questTrackerBg.clear();
                this.questTrackerBg.fillStyle(0x0d1117, 0.85);
                this.questTrackerBg.fillRoundedRect(1030, 8, 245, 50, 10);
                this.questTrackerBg.lineStyle(1, 0xffd700, 0.3);
                this.questTrackerBg.strokeRoundedRect(1030, 8, 245, 50, 10);
                this.questTrackerIcon.setText('\u2694').setVisible(true);
            }
        }

        // Update potion counts and button states
        if (this.potionSlots) {
            const gameScene = this.scene.get('Game');
            const player = gameScene ? gameScene.player : null;
            const potionColors = { health_potion: '#e74c3c', damage_potion: '#e67e22', xp_potion: '#3498db', mega_health: '#ff1493' };

            // Draw potion panel background
            this.potionBg.clear();
            this.potionBg.fillStyle(0x0d1117, 0.75);
            this.potionBg.fillRoundedRect(1195, 185, 80, 225, 8);
            this.potionBg.lineStyle(1, 0x3a4a5a, 0.4);
            this.potionBg.strokeRoundedRect(1195, 185, 80, 225, 8);

            this.potionSlots.forEach(slot => {
                const count = player ? (player.potions[slot.potionId] || 0) : 0;
                slot.countText.setText(`x${count}`);
                if (count > 0) {
                    slot.icon.setAlpha(1);
                    slot.useBtn.setStyle({ backgroundColor: potionColors[slot.potionId], color: '#ffffff' });
                } else {
                    slot.icon.setAlpha(0.3);
                    slot.useBtn.setStyle({ backgroundColor: '#333333', color: '#555555' });
                }
            });
        }
    }

    // Use a potion — applies effect + shows visual
    usePotion(potionId) {
        const gameScene = this.scene.get('Game');
        if (!gameScene || !gameScene.player) return;
        const player = gameScene.player;
        if (!player.potions[potionId] || player.potions[potionId] <= 0) return;

        // Don't use potions while dead or in menus
        if (player.isDead || gameScene.dialogOpen || gameScene.inventoryOpen) return;

        const potionData = POTIONS[potionId];
        player.potions[potionId]--;

        // Play potion drink sound
        if (gameScene.soundManager) gameScene.soundManager.play('potionUse');

        let floatText = '';
        let floatColor = '#ffffff';
        let effectColor = potionData.color;

        if (potionData.effect === 'heal') {
            player.hp = Math.min(player.hp + potionData.value, player.maxHP);
            floatText = `+${potionData.value} HP!`;
            floatColor = '#e74c3c';
        } else if (potionData.effect === 'full_heal') {
            player.hp = player.maxHP;
            floatText = 'Full HP!';
            floatColor = '#ff1493';
        } else if (potionData.effect === 'damage_boost') {
            player.attackPower += potionData.value;
            floatText = `+${potionData.value} ATK (30s)!`;
            floatColor = '#e67e22';
            // Remove boost after duration
            gameScene.time.delayedCall(potionData.duration, () => {
                player.attackPower = Math.max(0, player.attackPower - potionData.value);
                this.showFloatingText(player.x, player.y - 20, 'ATK boost ended', '#888888', 14, 1000);
            });
        } else if (potionData.effect === 'xp') {
            player.xp += potionData.value;
            floatText = `+${potionData.value} XP!`;
            floatColor = '#3498db';
        }

        // Show floating text
        this.showFloatingText(player.x, player.y - 20, floatText, floatColor, 20, 1200);

        // Visual effect — colored ring burst around player
        const cam = gameScene.cameras.main;
        const sx = (player.x - cam.worldView.centerX) * cam.zoom + cam.width / 2;
        const sy = (player.y - cam.worldView.centerY) * cam.zoom + cam.height / 2;

        // Ring effect
        const ring = this.add.circle(sx, sy, 5, effectColor, 0.8).setDepth(30);
        this.tweens.add({
            targets: ring,
            scaleX: 6, scaleY: 6, alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => ring.destroy()
        });

        // Sparkle particles in the potion color
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particle = this.add.rectangle(sx, sy, 3, 3, effectColor).setDepth(30);
            this.tweens.add({
                targets: particle,
                x: sx + Math.cos(angle) * 35,
                y: sy + Math.sin(angle) * 35,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }

        // Camera flash in potion color
        const r = (effectColor >> 16) & 0xff;
        const g = (effectColor >> 8) & 0xff;
        const b = effectColor & 0xff;
        gameScene.cameras.main.flash(200, r, g, b, true);
    }
}
