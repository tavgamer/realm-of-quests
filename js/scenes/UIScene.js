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

        // Background panel for the HUD (dark semi-transparent bar at the top)
        this.hudBg = this.add.graphics();
        this.hudBg.fillStyle(0x000000, 0.7);
        this.hudBg.fillRoundedRect(10, 10, 300, 60, 8);

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
    }
}
