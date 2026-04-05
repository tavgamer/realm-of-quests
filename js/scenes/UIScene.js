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
        this.controlsHint = this.add.text(640, 675, 'WASD: move | SPACE: attack | E: talk | M: map', {
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

        // Map dimensions — fit inside the screen with padding
        const mapW = 900;
        const mapH = 540;
        const mapX = 190;  // left edge
        const mapY = 85;   // top edge

        // Scale: how many screen pixels per tile
        const scaleX = mapW / area.width;
        const scaleY = mapH / area.height;

        // Show overlay
        this.mapOverlay.setVisible(true);
        this.mapTitle.setVisible(true).setText(area.name);
        this.mapHint.setVisible(true);

        // Draw the map background
        this.mapGraphics.clear();
        const bgColor = isUnderwater ? 0x1a3a4a : 0x4a8c3f;
        this.mapGraphics.fillStyle(bgColor, 1);
        this.mapGraphics.fillRect(mapX, mapY, mapW, mapH);

        // Border
        this.mapGraphics.lineStyle(2, 0xffd700, 0.8);
        this.mapGraphics.strokeRect(mapX, mapY, mapW, mapH);

        // Draw paths
        const pathColor = isUnderwater ? 0x2a5a6a : 0xc4a265;
        this.mapGraphics.fillStyle(pathColor, 0.7);
        // Horizontal path
        const midY = Math.floor(area.height / 2);
        this.mapGraphics.fillRect(mapX, mapY + midY * scaleY, mapW, scaleY * 2);
        // Vertical path
        const midX = Math.floor(area.width / 2);
        this.mapGraphics.fillRect(mapX + midX * scaleX, mapY, scaleX * 2, mapH);

        if (!isUnderwater) {
            // Left village path
            this.mapGraphics.fillRect(mapX + 15 * scaleX, mapY + 10 * scaleY, scaleX * 2, (area.height - 20) * scaleY);
        }

        // Draw water
        this.mapIcons.clear();
        const waterColor = isUnderwater ? 0x1565c0 : 0x1565c0;
        this.mapGraphics.fillStyle(waterColor, 0.8);

        if (!isUnderwater) {
            // Big hidden pond
            this.mapGraphics.fillRect(mapX + 54 * scaleX, mapY + 38 * scaleY, 9 * scaleX, 9 * scaleY);
            // Small village pond
            this.mapGraphics.fillRect(mapX + 20 * scaleX, mapY + 22 * scaleY, 3 * scaleX, 2 * scaleY);
        } else {
            // Deep-water pools
            this.mapGraphics.fillRect(mapX + 12 * scaleX, mapY + 10 * scaleY, 6 * scaleX, 4 * scaleY);
            this.mapGraphics.fillRect(mapX + 52 * scaleX, mapY + 35 * scaleY, 4 * scaleX, 3 * scaleY);
        }

        // Draw houses/ruins
        const buildColor = isUnderwater ? 0x4a6a7a : 0xd4a574;
        this.mapGraphics.fillStyle(buildColor, 0.9);
        // Get house positions from area data
        if (!isUnderwater) {
            const houses = [[10,7,3,2],[16,6,3,2],[6,12,2,2],[18,11,3,2],[10,33,3,2],[14,35,2,2],[22,28,3,2],[26,26,2,2],[45,12,2,2],[60,14,3,2],[40,42,2,2],[15,50,3,2]];
            houses.forEach(h => {
                this.mapGraphics.fillRect(mapX + h[0] * scaleX, mapY + h[1] * scaleY, h[2] * scaleX, h[3] * scaleY);
            });
        } else {
            const ruins = [[33,23,4,3],[15,18,3,2],[50,20,3,2],[25,35,3,2],[45,35,3,2],[35,10,2,2],[20,42,2,2],[55,42,3,2]];
            ruins.forEach(r => {
                this.mapGraphics.fillRect(mapX + r[0] * scaleX, mapY + r[1] * scaleY, r[2] * scaleX, r[3] * scaleY);
            });
        }

        // Draw NPCs (yellow dots)
        for (const npcId in NPCS) {
            const npcData = NPCS[npcId];
            if (npcData.area !== areaId) continue;
            this.mapIcons.fillStyle(0xffd700, 1);
            this.mapIcons.fillRect(
                mapX + npcData.x * scaleX - 3,
                mapY + npcData.y * scaleY - 3,
                6, 6
            );
            // NPC label
            this.mapIcons.fillStyle(0xffd700, 0.8);
        }

        // Draw treasure chests (orange dots, only unopened, area1 only)
        if (!isUnderwater && gameScene.chests) {
            gameScene.chests.forEach(chest => {
                if (!chest.isOpened) {
                    this.mapIcons.fillStyle(0xf39c12, 0.8);
                    const cx = chest.x / tileSize;
                    const cy = chest.y / tileSize;
                    this.mapIcons.fillRect(
                        mapX + cx * scaleX - 2,
                        mapY + cy * scaleY - 2,
                        4, 4
                    );
                }
            });
        }

        // Draw legend
        const legX = mapX + mapW + 10;
        // We'll use simple colored squares as legend — but we're out of space
        // So put legend at bottom inside the map
        const legY = mapY + mapH + 8;

        // Store map params for player dot update
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

                    // "!" marker for quest-giving NPCs
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
    }
}
