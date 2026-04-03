// Realm of Quests - Menu Scene
// The title screen! Shows the game name and a "Play" button.
//
// NEW CONCEPT: Interactive text
// In Phaser, you can make any game object clickable by calling:
//   object.setInteractive()
// Then listen for clicks with:
//   object.on('pointerdown', function() { ... })

class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        // Background color
        this.cameras.main.setBackgroundColor('#0f0e17');

        // --- DECORATIVE BACKGROUND ---
        // Draw some subtle stars/dots to make the menu feel alive
        const bg = this.add.graphics();
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Math.random() * 0.4 + 0.1;
            bg.fillStyle(0xffffff, alpha);
            bg.fillRect(x, y, size, size);
        }

        // --- DECORATIVE SWORD ICON (pixel art drawn with graphics) ---
        const sword = this.add.graphics();
        // Blade
        sword.fillStyle(0xc0c0c0, 1);
        sword.fillRect(394, 70, 12, 60);
        // Blade highlight
        sword.fillStyle(0xe8e8e8, 1);
        sword.fillRect(397, 72, 6, 56);
        // Blade tip
        sword.fillStyle(0xc0c0c0, 1);
        sword.fillRect(397, 60, 6, 12);
        // Guard (crosspiece)
        sword.fillStyle(0xf1c40f, 1);
        sword.fillRect(382, 130, 36, 8);
        // Handle
        sword.fillStyle(0x8B4513, 1);
        sword.fillRect(396, 138, 8, 24);
        // Pommel
        sword.fillStyle(0xf1c40f, 1);
        sword.fillRect(394, 162, 12, 8);

        // Glow effect behind the sword
        const glow = this.add.graphics();
        glow.fillStyle(0xe94560, 0.08);
        glow.fillCircle(400, 120, 60);
        glow.fillStyle(0xe94560, 0.05);
        glow.fillCircle(400, 120, 90);

        // --- GAME TITLE ---
        // Main title — big, bright, with a thick stroke for readability
        const title = this.add.text(400, 230, 'REALM OF', {
            fontSize: '40px',
            fontFamily: 'Press Start 2P',
            color: '#ff6b81',
            stroke: '#2d1b3d',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        const title2 = this.add.text(400, 285, 'QUESTS', {
            fontSize: '52px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff',
            stroke: '#e94560',
            strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5);

        // Subtle glow pulse on the title
        this.tweens.add({
            targets: title2,
            alpha: { from: 0.85, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // --- SUBTITLE ---
        this.add.text(400, 340, 'A Fantasy RPG Adventure', {
            fontSize: '14px',
            fontFamily: 'Press Start 2P',
            color: '#a8a8b3',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // --- PLAY BUTTON ---
        // Draw a button background
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xe94560, 1);
        btnBg.fillRoundedRect(300, 390, 200, 55, 8);
        btnBg.lineStyle(3, 0xff6b81, 1);
        btnBg.strokeRoundedRect(300, 390, 200, 55, 8);

        const playButton = this.add.text(400, 418, 'PLAY', {
            fontSize: '28px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Make both the background and text interactive
        // We create an invisible hit zone over the button area
        const hitZone = this.add.zone(400, 418, 200, 55).setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0xff6b81, 1);
            btnBg.fillRoundedRect(300, 390, 200, 55, 8);
            btnBg.lineStyle(3, 0xffffff, 1);
            btnBg.strokeRoundedRect(300, 390, 200, 55, 8);
            playButton.setColor('#ffffff');
        });

        hitZone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0xe94560, 1);
            btnBg.fillRoundedRect(300, 390, 200, 55, 8);
            btnBg.lineStyle(3, 0xff6b81, 1);
            btnBg.strokeRoundedRect(300, 390, 200, 55, 8);
            playButton.setColor('#ffffff');
        });

        hitZone.on('pointerdown', () => {
            this.scene.start('Game', { areaId: 'area1' });
        });

        // Pulse animation on the button background
        this.tweens.add({
            targets: [btnBg],
            alpha: { from: 0.9, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // --- CONTROLS HINT ---
        this.add.text(400, 500, 'WASD / Arrows to move', {
            fontSize: '11px',
            fontFamily: 'Press Start 2P',
            color: '#7a7a8e',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(400, 525, 'SPACE to attack  |  E to talk', {
            fontSize: '11px',
            fontFamily: 'Press Start 2P',
            color: '#7a7a8e',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // --- VERSION ---
        this.add.text(780, 585, 'v0.1', {
            fontSize: '8px',
            fontFamily: 'Press Start 2P',
            color: '#3a3a4a'
        }).setOrigin(1, 1);
    }
}
