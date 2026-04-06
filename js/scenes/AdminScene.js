// Realm of Quests - Admin Panel (press ` backtick to open)
//
// God mode! Change your level, gold, HP, give yourself any item,
// kill all enemies, and more. Press ` again or ESC to close.

class AdminScene extends Phaser.Scene {
    constructor() {
        super('Admin');
    }

    init(data) {
        this.playerRef = data.player;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Hide game behind
        this.scene.setVisible(false, 'Game');
        this.scene.setVisible(false, 'UI');
        this.cameras.main.setBackgroundColor('#0a0812');

        // Title
        this.add.text(w / 2, 30, 'ADMIN PANEL', {
            fontSize: '24px', fontFamily: 'Press Start 2P',
            color: '#ff4444', stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5).setDepth(1);

        this.add.text(w / 2, 60, '"With great power comes great fun"', {
            fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'italic',
            color: '#666666'
        }).setOrigin(0.5).setDepth(1);

        // Current stats display
        this.statsText = this.add.text(w / 2, 95, this.getStatsString(), {
            fontSize: '14px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: '#aaaaaa', align: 'center'
        }).setOrigin(0.5).setDepth(1);

        // Close hint
        this.add.text(w / 2, h - 20, '` or ESC to close', {
            fontSize: '14px', fontFamily: 'Press Start 2P',
            color: '#555555', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(1);

        // --- BUTTONS LAYOUT ---
        const btnW = 180;
        const btnH = 42;
        const gap = 12;
        const cols = 4;
        const startX = (w - (cols * btnW + (cols - 1) * gap)) / 2;
        let row = 0;
        let col = 0;

        const buttons = [
            // Level controls
            { label: 'Level +1', color: 0xf1c40f, action: () => this.setLevel(this.playerRef.level + 1) },
            { label: 'Level +5', color: 0xf1c40f, action: () => this.setLevel(this.playerRef.level + 5) },
            { label: 'Level 10', color: 0xf1c40f, action: () => this.setLevel(10) },
            { label: 'Level 20 (MAX)', color: 0xf1c40f, action: () => this.setLevel(20) },

            // Gold controls
            { label: '+100 Gold', color: 0xf39c12, action: () => { this.playerRef.gold += 100; this.refresh(); } },
            { label: '+500 Gold', color: 0xf39c12, action: () => { this.playerRef.gold += 500; this.refresh(); } },
            { label: '+2000 Gold', color: 0xf39c12, action: () => { this.playerRef.gold += 2000; this.refresh(); } },
            { label: '9999 Gold', color: 0xf39c12, action: () => { this.playerRef.gold = 9999; this.refresh(); } },

            // HP controls
            { label: 'Full Heal', color: 0x2ecc71, action: () => { this.playerRef.hp = this.playerRef.maxHP; this.refresh(); } },
            { label: 'Set HP to 1', color: 0xe74c3c, action: () => { this.playerRef.hp = 1; this.refresh(); } },
            { label: '+100 Max HP', color: 0x2ecc71, action: () => { this.playerRef.maxHP += 100; this.playerRef.hp = this.playerRef.maxHP; this.refresh(); } },
            { label: 'God Mode HP', color: 0xff69b4, action: () => { this.playerRef.maxHP = 9999; this.playerRef.hp = 9999; this.refresh(); } },

            // Attack / Defense
            { label: '+20 Attack', color: 0xe74c3c, action: () => { this.playerRef.attackPower += 20; this.refresh(); } },
            { label: '+20 Defense', color: 0x3498db, action: () => { this.playerRef.defense += 20; this.refresh(); } },
            { label: 'Max Speed', color: 0x9b59b6, action: () => { this.playerRef.moveSpeed = 250; this.refresh(); } },
            { label: '+500 XP', color: 0x3498db, action: () => { this.playerRef.xp += 500; this.refresh(); } },

            // Items
            { label: 'All Weapons', color: 0x8e44ad, action: () => this.giveAllItems('weapons') },
            { label: 'All Armor', color: 0x8e44ad, action: () => this.giveAllItems('armor') },
            { label: 'Best Weapon', color: 0xF1C40F, action: () => this.equipBest('weapon') },
            { label: '+5 Each Potion', color: 0x2ecc71, action: () => { for (const id in POTIONS) { this.playerRef.potions[id] = (this.playerRef.potions[id] || 0) + 5; } this.refresh(); } },

            // World
            { label: 'Kill All Enemies', color: 0xe74c3c, action: () => this.killAllEnemies() },
            { label: 'Invincible 60s', color: 0xff69b4, action: () => { this.playerRef.invincible = true; this.playerRef.invincibleTimer = 60000; this.refresh(); } },
            { label: 'Reset Stats', color: 0x7f8c8d, action: () => this.resetStats() },
            { label: 'FULL MAX', color: 0xff1493, action: () => this.fullMax() },
        ];

        const startY = 130;

        buttons.forEach((btnData, i) => {
            col = i % cols;
            row = Math.floor(i / cols);
            const bx = startX + col * (btnW + gap) + btnW / 2;
            const by = startY + row * (btnH + gap) + btnH / 2;

            const bg = this.add.rectangle(bx, by, btnW, btnH, btnData.color, 0.25)
                .setDepth(2).setStrokeStyle(1, btnData.color, 0.6)
                .setInteractive({ useHandCursor: true });

            this.add.text(bx, by, btnData.label, {
                fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(3);

            bg.on('pointerover', () => bg.setFillStyle(btnData.color, 0.5));
            bg.on('pointerout', () => bg.setFillStyle(btnData.color, 0.25));
            bg.on('pointerdown', () => {
                bg.setFillStyle(btnData.color, 0.8);
                btnData.action();
            });
            bg.on('pointerup', () => bg.setFillStyle(btnData.color, 0.5));
        });

        // Close keys
        const closeBacktick = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
        closeBacktick.on('down', () => this.closeAdmin());
        const closeEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        closeEsc.on('down', () => this.closeAdmin());
    }

    getStatsString() {
        const p = this.playerRef;
        const wep = WEAPONS[p.equippedWeapon];
        const arm = ARMOR[p.equippedArmor];
        return `Lv.${p.level}  |  HP: ${p.hp}/${p.maxHP}  |  ATK: ${p.attackPower}+${wep.damage}  |  DEF: ${p.defense}+${arm.defense}  |  Gold: ${p.gold}  |  XP: ${p.xp}  |  Speed: ${p.moveSpeed}  |  Items: ${p.inventory.length}`;
    }

    refresh() {
        this.statsText.setText(this.getStatsString());
    }

    setLevel(level) {
        level = Math.min(level, MAX_LEVEL);
        const data = LEVEL_CURVE[level];
        this.playerRef.level = level;
        this.playerRef.xp = data.xpNeeded;
        this.playerRef.maxHP = data.maxHP;
        this.playerRef.hp = data.maxHP;
        this.playerRef.moveSpeed = data.speed;
        this.playerRef.attackPower = data.attack;
        this.refresh();
    }

    giveAllItems(type) {
        if (type === 'weapons') {
            for (const id in WEAPONS) {
                if (!this.playerRef.inventory.includes(id)) {
                    this.playerRef.inventory.push(id);
                }
            }
        } else if (type === 'armor') {
            for (const id in ARMOR) {
                if (!this.playerRef.inventory.includes(id)) {
                    this.playerRef.inventory.push(id);
                }
            }
        }
        this.refresh();
    }

    equipBest(type) {
        if (type === 'weapon') {
            let bestId = null, bestDmg = 0;
            for (const id in WEAPONS) {
                if (WEAPONS[id].damage > bestDmg) {
                    bestDmg = WEAPONS[id].damage;
                    bestId = id;
                }
            }
            if (bestId) {
                if (!this.playerRef.inventory.includes(bestId)) this.playerRef.inventory.push(bestId);
                this.playerRef.equippedWeapon = bestId;
            }
        } else {
            let bestId = null, bestDef = 0;
            for (const id in ARMOR) {
                if (ARMOR[id].defense > bestDef) {
                    bestDef = ARMOR[id].defense;
                    bestId = id;
                }
            }
            if (bestId) {
                if (!this.playerRef.inventory.includes(bestId)) this.playerRef.inventory.push(bestId);
                this.playerRef.equippedArmor = bestId;
            }
        }
        this.refresh();
    }

    killAllEnemies() {
        const gameScene = this.scene.get('Game');
        if (gameScene && gameScene.enemies) {
            gameScene.enemies.getChildren().forEach(enemy => {
                if (enemy.state !== 'DEAD') {
                    // Give rewards
                    const enemyData = ENEMIES[enemy.enemyType];
                    if (enemyData) {
                        this.playerRef.xp += enemyData.xpReward;
                        this.playerRef.gold += enemyData.goldDrop;
                        if (gameScene.questManager) {
                            gameScene.questManager.onEnemyKilled(enemy.enemyType, enemyData.xpReward, enemyData.goldDrop);
                        }
                    }
                    enemy.state = 'DEAD';
                    enemy.setVelocity(0, 0);
                    enemy.body.enable = false;
                    enemy.scene.tweens.add({
                        targets: enemy,
                        alpha: 0, scaleX: 0, scaleY: 0,
                        duration: 300,
                        onComplete: () => {
                            if (enemy.healthBar) enemy.healthBar.destroy();
                            if (enemy.bossNameTag) enemy.bossNameTag.destroy();
                            enemy.destroy();
                        }
                    });
                }
            });
        }
        this.refresh();
    }

    resetStats() {
        const data = LEVEL_CURVE[1];
        this.playerRef.level = 1;
        this.playerRef.xp = 0;
        this.playerRef.gold = 0;
        this.playerRef.maxHP = data.maxHP;
        this.playerRef.hp = data.maxHP;
        this.playerRef.moveSpeed = data.speed;
        this.playerRef.attackPower = data.attack;
        this.playerRef.defense = 0;
        this.playerRef.equippedWeapon = 'wooden_sword';
        this.playerRef.equippedArmor = 'cloth_armor';
        this.playerRef.inventory = ['wooden_sword', 'cloth_armor'];
        this.refresh();
    }

    fullMax() {
        this.setLevel(20);
        this.playerRef.gold = 9999;
        this.playerRef.defense = 50;
        this.giveAllItems('weapons');
        this.giveAllItems('armor');
        this.equipBest('weapon');
        this.equipBest('armor');
        this.refresh();
    }

    closeAdmin() {
        this.scene.setVisible(true, 'Game');
        this.scene.setVisible(true, 'UI');
        const gameScene = this.scene.get('Game');
        if (gameScene) {
            gameScene.dialogOpen = false;
            gameScene.dialogCooldown = 300;
        }
        this.scene.stop('Admin');
    }
}
