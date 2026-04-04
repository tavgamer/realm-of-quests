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
        // --- HEALTH BAR ---
        // A colored bar that shrinks as you lose health

        // Background panel for the HUD
        this.hudBg = this.add.graphics();
        this.hudBg.fillStyle(0x000000, 0.75);
        this.hudBg.fillRoundedRect(10, 10, 380, 60, 8);

        // Health bar background (dark red = "empty" health)
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(0x8b0000, 1);
        this.healthBarBg.fillRect(80, 18, 150, 16);

        // Health bar fill (bright red = current health)
        this.healthBarFill = this.add.graphics();

        // Health label
        this.add.text(20, 20, 'HP', {
            fontSize: '14px',
            fontFamily: 'Press Start 2P',
            color: '#e74c3c'
        });

        // Health text (shows numbers like "50/50")
        this.healthText = this.add.text(240, 20, '', {
            fontSize: '10px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff'
        });

        // --- LEVEL AND GOLD ---
        this.levelText = this.add.text(20, 44, '', {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#f1c40f'  // Gold color for level
        });

        this.goldText = this.add.text(170, 44, '', {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#f39c12'  // Orange for gold
        });

        // --- XP (shows how much XP needed for next level) ---
        this.xpText = this.add.text(270, 44, '', {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#3498db'
        });

        // --- AREA NAME (bottom center) ---
        this.areaText = this.add.text(400, 580, '', {
            fontSize: '10px',
            fontFamily: 'Press Start 2P',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // --- CONTROLS HINT (bottom left, fades after a few seconds) ---
        this.controlsHint = this.add.text(400, 560, 'WASD to move | SPACE to attack', {
            fontSize: '8px',
            fontFamily: 'Press Start 2P',
            color: '#666666'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: this.controlsHint,
            alpha: 0,
            duration: 1000,
            delay: 5000
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
    }

    // --- CREATE MOBILE D-PAD AND ATTACK BUTTON ---
    createMobileControls() {
        const alpha = 0.4;  // Semi-transparent so they don't block the view

        // --- D-PAD (bottom-left) ---
        const padX = 100;
        const padY = 500;
        const btnSize = 50;
        const gap = 4;

        // D-pad background circle
        const padBg = this.add.circle(padX, padY, 80, 0x000000, 0.25).setDepth(30);

        // UP button
        const upBtn = this.add.rectangle(padX, padY - btnSize - gap, btnSize, btnSize, 0xffffff, alpha)
            .setDepth(31).setInteractive();
        this.add.text(padX, padY - btnSize - gap, '▲', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setAlpha(0.7);

        // DOWN button
        const downBtn = this.add.rectangle(padX, padY + btnSize + gap, btnSize, btnSize, 0xffffff, alpha)
            .setDepth(31).setInteractive();
        this.add.text(padX, padY + btnSize + gap, '▼', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setAlpha(0.7);

        // LEFT button
        const leftBtn = this.add.rectangle(padX - btnSize - gap, padY, btnSize, btnSize, 0xffffff, alpha)
            .setDepth(31).setInteractive();
        this.add.text(padX - btnSize - gap, padY, '◄', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setAlpha(0.7);

        // RIGHT button
        const rightBtn = this.add.rectangle(padX + btnSize + gap, padY, btnSize, btnSize, 0xffffff, alpha)
            .setDepth(31).setInteractive();
        this.add.text(padX + btnSize + gap, padY, '►', {
            fontSize: '20px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setAlpha(0.7);

        // D-pad input handlers
        // pointerdown = finger touched, pointerup/pointerout = finger lifted
        upBtn.on('pointerdown', () => { this.touchDirection.y = -1; });
        upBtn.on('pointerup', () => { this.touchDirection.y = 0; });
        upBtn.on('pointerout', () => { this.touchDirection.y = 0; });

        downBtn.on('pointerdown', () => { this.touchDirection.y = 1; });
        downBtn.on('pointerup', () => { this.touchDirection.y = 0; });
        downBtn.on('pointerout', () => { this.touchDirection.y = 0; });

        leftBtn.on('pointerdown', () => { this.touchDirection.x = -1; });
        leftBtn.on('pointerup', () => { this.touchDirection.x = 0; });
        leftBtn.on('pointerout', () => { this.touchDirection.x = 0; });

        rightBtn.on('pointerdown', () => { this.touchDirection.x = 1; });
        rightBtn.on('pointerup', () => { this.touchDirection.x = 0; });
        rightBtn.on('pointerout', () => { this.touchDirection.x = 0; });

        // --- ATTACK BUTTON (bottom-right) ---
        const atkX = 700;
        const atkY = 500;

        const atkBg = this.add.circle(atkX, atkY, 45, 0xe94560, alpha)
            .setDepth(31).setInteractive({ useHandCursor: true });
        this.add.text(atkX, atkY, '⚔', {
            fontSize: '30px', color: '#ffffff'
        }).setOrigin(0.5).setDepth(32).setAlpha(0.8);

        atkBg.on('pointerdown', () => { this.touchAttack = true; });
        atkBg.on('pointerup', () => { this.touchAttack = false; });
        atkBg.on('pointerout', () => { this.touchAttack = false; });
    }

    // Called by GameScene every frame to update the HUD values
    updateHUD(playerData) {
        // Update health bar
        const healthPercent = playerData.hp / playerData.maxHP;
        this.healthBarFill.clear();

        // Change color based on health: green > 50%, yellow > 25%, red < 25%
        if (healthPercent > 0.5) {
            this.healthBarFill.fillStyle(0x2ecc71, 1);  // Green
        } else if (healthPercent > 0.25) {
            this.healthBarFill.fillStyle(0xf1c40f, 1);  // Yellow
        } else {
            this.healthBarFill.fillStyle(0xe74c3c, 1);  // Red
        }
        this.healthBarFill.fillRect(80, 18, 150 * healthPercent, 16);

        // Update text displays
        this.healthText.setText(`${playerData.hp}/${playerData.maxHP}`);
        this.levelText.setText(`LVL ${playerData.level}`);
        this.goldText.setText(`Gold: ${playerData.gold}`);
        this.areaText.setText(playerData.areaName || '');

        // Update XP display — shows "currentXP / xpNeededForNextLevel"
        const currentLevelXP = LEVEL_CURVE[playerData.level].xpNeeded;
        const nextLevel = Math.min(playerData.level + 1, MAX_LEVEL);
        const nextLevelXP = LEVEL_CURVE[nextLevel].xpNeeded;
        const xpProgress = playerData.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        this.xpText.setText(`${xpProgress}/${xpNeeded}`);
    }
}
