// Realm of Quests - Menu Scene
// The title screen with game name and Play button.

class MenuScene extends Phaser.Scene {
    constructor() {
        super('Menu');
    }

    create() {
        this.cameras.main.setBackgroundColor('#0f0e17');

        // --- DECORATIVE BACKGROUND (stars) ---
        const bg = this.add.graphics();
        for (let i = 0; i < 120; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const size = Phaser.Math.Between(1, 3);
            const alpha = Math.random() * 0.4 + 0.1;
            bg.fillStyle(0xffffff, alpha);
            bg.fillRect(x, y, size, size);
        }

        // --- DECORATIVE SWORD ICON ---
        const sword = this.add.graphics();
        sword.fillStyle(0xc0c0c0, 1);
        sword.fillRect(634, 60, 12, 70);
        sword.fillStyle(0xe8e8e8, 1);
        sword.fillRect(637, 62, 6, 66);
        sword.fillStyle(0xc0c0c0, 1);
        sword.fillRect(637, 48, 6, 14);
        sword.fillStyle(0xf1c40f, 1);
        sword.fillRect(620, 130, 40, 10);
        sword.fillStyle(0x8B4513, 1);
        sword.fillRect(636, 140, 8, 28);
        sword.fillStyle(0xf1c40f, 1);
        sword.fillRect(634, 168, 12, 8);

        const glow = this.add.graphics();
        glow.fillStyle(0xe94560, 0.08);
        glow.fillCircle(640, 115, 70);
        glow.fillStyle(0xe94560, 0.05);
        glow.fillCircle(640, 115, 100);

        // --- GAME TITLE ---
        const title = this.add.text(640, 240, 'REALM OF', {
            fontSize: '48px',
            fontFamily: 'Press Start 2P',
            color: '#ff6b81',
            stroke: '#2d1b3d',
            strokeThickness: 6
        }).setOrigin(0.5);

        const title2 = this.add.text(640, 305, 'QUESTS', {
            fontSize: '64px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff',
            stroke: '#e94560',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title2,
            alpha: { from: 0.85, to: 1 },
            duration: 1500,
            yoyo: true,
            repeat: -1
        });

        // --- SUBTITLE ---
        this.add.text(640, 365, 'A Fantasy RPG Adventure', {
            fontSize: '16px',
            fontFamily: 'Press Start 2P',
            color: '#a8a8b3',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // --- PLAY BUTTON ---
        const btnBg = this.add.graphics();
        btnBg.fillStyle(0xe94560, 1);
        btnBg.fillRoundedRect(515, 420, 250, 60, 10);
        btnBg.lineStyle(3, 0xff6b81, 1);
        btnBg.strokeRoundedRect(515, 420, 250, 60, 10);

        const playButton = this.add.text(640, 450, 'PLAY', {
            fontSize: '32px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);

        const hitZone = this.add.zone(640, 450, 250, 60).setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
            btnBg.clear();
            btnBg.fillStyle(0xff6b81, 1);
            btnBg.fillRoundedRect(515, 420, 250, 60, 10);
            btnBg.lineStyle(3, 0xffffff, 1);
            btnBg.strokeRoundedRect(515, 420, 250, 60, 10);
        });

        hitZone.on('pointerout', () => {
            btnBg.clear();
            btnBg.fillStyle(0xe94560, 1);
            btnBg.fillRoundedRect(515, 420, 250, 60, 10);
            btnBg.lineStyle(3, 0xff6b81, 1);
            btnBg.strokeRoundedRect(515, 420, 250, 60, 10);
        });

        hitZone.on('pointerdown', () => {
            this.scene.start('Game', { areaId: 'area1' });
        });

        this.tweens.add({
            targets: [btnBg],
            alpha: { from: 0.9, to: 1 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // --- CONTROLS HINT ---
        this.add.text(640, 530, 'WASD / Arrows to move', {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#7a7a8e',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.add.text(640, 555, 'SPACE: attack  |  E: talk  |  M: map', {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#7a7a8e',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // --- VERSION ---
        this.add.text(1260, 700, 'v0.4', {
            fontSize: '10px',
            fontFamily: 'Press Start 2P',
            color: '#3a3a4a'
        }).setOrigin(1, 1);
    }
}
