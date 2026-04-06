// Realm of Quests - Inventory & Equipment Scene
//
// Press I to open/close this screen. Shows:
// - Currently equipped weapon and armor with stats
// - All owned items in a grid — click to equip
// - Player stats summary
//
// HOW IT WORKS:
// Like the Map overlay, this scene launches on top of GameScene.
// While open, the player can't move. Click an item to equip it.
// The equipped item gets a gold border to show it's active.

class InventoryScene extends Phaser.Scene {
    constructor() {
        super('Inventory');
    }

    init(data) {
        this.playerRef = data.player;
    }

    create() {
        const w = this.cameras.main.width;   // 1280
        const h = this.cameras.main.height;  // 720

        // Hide the game and HUD behind us
        this.scene.setVisible(false, 'Game');
        this.scene.setVisible(false, 'UI');

        // --- SOLID BLACK BACKGROUND ---
        this.cameras.main.setBackgroundColor('#0a0a12');

        // --- TITLE ---
        this.add.text(w / 2, 35, 'INVENTORY', {
            fontSize: '28px',
            fontFamily: 'Press Start 2P',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1);

        // --- CLOSE HINT (above title) ---
        this.add.text(w / 2, h - 25, 'I to close', {
            fontSize: '16px',
            fontFamily: 'Press Start 2P',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1);

        // --- PLAYER STATS PANEL (left side) ---
        this.drawStatsPanel(80, 80, 280, 200);

        // --- EQUIPPED ITEMS (center top) ---
        this.drawEquippedPanel(400, 80, 480, 200);

        // --- OWNED ITEMS GRID (bottom half) ---
        this.drawItemsGrid(80, 310, w - 160, 360);

        // --- CLOSE KEY ---
        const closeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        closeKey.on('down', () => this.closeInventory());

        // ESC also closes
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        escKey.on('down', () => this.closeInventory());
    }

    drawStatsPanel(x, y, w, h) {
        const gfx = this.add.graphics().setDepth(1);
        gfx.fillStyle(0x0d1117, 0.9);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(1, 0x3a4a5a, 0.6);
        gfx.strokeRoundedRect(x, y, w, h, 10);

        const p = this.playerRef;
        const weaponData = WEAPONS[p.equippedWeapon];
        const armorData = ARMOR[p.equippedArmor];
        const totalAttack = p.attackPower + weaponData.damage;
        const totalDefense = armorData.defense + p.defense;

        this.add.text(x + 15, y + 10, 'STATS', {
            fontSize: '16px', fontFamily: 'Press Start 2P',
            color: '#3498db', stroke: '#000000', strokeThickness: 2
        }).setDepth(2);

        const stats = [
            `Level: ${p.level}`,
            `HP: ${p.hp} / ${p.maxHP}`,
            `Attack: ${totalAttack}  (${p.attackPower} + ${weaponData.damage})`,
            `Defense: ${totalDefense}  (${p.defense} + ${armorData.defense})`,
            `Speed: ${p.moveSpeed}`,
            `Gold: ${p.gold}`
        ];

        stats.forEach((line, i) => {
            this.add.text(x + 20, y + 45 + i * 24, line, {
                fontSize: '15px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#cccccc'
            }).setDepth(2);
        });
    }

    drawEquippedPanel(x, y, w, h) {
        const gfx = this.add.graphics().setDepth(1);
        gfx.fillStyle(0x0d1117, 0.9);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(1, 0x3a4a5a, 0.6);
        gfx.strokeRoundedRect(x, y, w, h, 10);

        this.add.text(x + 15, y + 10, 'EQUIPPED', {
            fontSize: '16px', fontFamily: 'Press Start 2P',
            color: '#ffd700', stroke: '#000000', strokeThickness: 2
        }).setDepth(2);

        // Weapon slot
        const weaponData = WEAPONS[this.playerRef.equippedWeapon];
        this.drawItemSlot(x + 30, y + 50, weaponData, 'weapon', true);

        // Armor slot
        const armorData = ARMOR[this.playerRef.equippedArmor];
        this.drawItemSlot(x + 260, y + 50, armorData, 'armor', true);

        // Labels
        this.add.text(x + 80, y + 50, 'WEAPON', {
            fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#888888'
        }).setDepth(2);
        this.add.text(x + 310, y + 50, 'ARMOR', {
            fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold', color: '#888888'
        }).setDepth(2);
    }

    drawItemSlot(x, y, itemData, type, isEquipped) {
        const size = 56;
        const gfx = this.add.graphics().setDepth(2);

        // Background
        gfx.fillStyle(0x1a2a3a, 1);
        gfx.fillRoundedRect(x, y + 15, size, size, 6);

        // Border (gold if equipped)
        if (isEquipped) {
            gfx.lineStyle(2, 0xffd700, 1);
        } else {
            gfx.lineStyle(1, 0x3a4a5a, 0.6);
        }
        gfx.strokeRoundedRect(x, y + 15, size, size, 6);

        // Item color swatch
        gfx.fillStyle(itemData.color, 1);
        gfx.fillRoundedRect(x + 10, y + 25, size - 20, size - 20, 4);

        // Icon: sword for weapons, shield for armor
        const icon = type === 'weapon' ? '⚔' : '🛡';
        this.add.text(x + size / 2, y + 43, icon, {
            fontSize: '20px'
        }).setOrigin(0.5).setDepth(3);

        // Item name below
        this.add.text(x + size / 2, y + size + 20, itemData.name, {
            fontSize: '12px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        // Stat below name
        const statText = type === 'weapon'
            ? `+${itemData.damage} DMG`
            : `+${itemData.defense} DEF`;
        this.add.text(x + size / 2, y + size + 36, statText, {
            fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: type === 'weapon' ? '#e74c3c' : '#3498db'
        }).setOrigin(0.5).setDepth(2);
    }

    drawItemsGrid(x, y, w, h) {
        const gfx = this.add.graphics().setDepth(1);
        gfx.fillStyle(0x0d1117, 0.9);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(1, 0x3a4a5a, 0.6);
        gfx.strokeRoundedRect(x, y, w, h, 10);

        // Section headers
        this.add.text(x + 15, y + 10, 'WEAPONS', {
            fontSize: '14px', fontFamily: 'Press Start 2P',
            color: '#e74c3c', stroke: '#000000', strokeThickness: 2
        }).setDepth(2);

        this.add.text(x + 15, y + 175, 'ARMOR', {
            fontSize: '14px', fontFamily: 'Press Start 2P',
            color: '#3498db', stroke: '#000000', strokeThickness: 2
        }).setDepth(2);

        // Draw weapon items
        let col = 0;
        const itemW = 140;
        const itemH = 120;
        const startX = x + 20;
        const gap = 10;

        // Weapons row
        for (const weaponId in WEAPONS) {
            const weapon = WEAPONS[weaponId];
            const owned = this.playerRef.inventory.includes(weaponId);
            const equipped = this.playerRef.equippedWeapon === weaponId;
            const ix = startX + col * (itemW + gap);
            const iy = y + 35;

            this.drawGridItem(ix, iy, itemW, itemH, weapon, weaponId, 'weapon', owned, equipped);
            col++;
        }

        // Armor row
        col = 0;
        for (const armorId in ARMOR) {
            const armor = ARMOR[armorId];
            const owned = this.playerRef.inventory.includes(armorId);
            const equipped = this.playerRef.equippedArmor === armorId;
            const ix = startX + col * (itemW + gap);
            const iy = y + 200;

            this.drawGridItem(ix, iy, itemW, itemH, armor, armorId, 'armor', owned, equipped);
            col++;
        }
    }

    drawGridItem(x, y, w, h, itemData, itemId, type, owned, equipped) {
        const gfx = this.add.graphics().setDepth(2);

        // Background
        gfx.fillStyle(owned ? 0x1a2a3a : 0x0a0f15, 1);
        gfx.fillRoundedRect(x, y, w, h, 8);

        // Border
        if (equipped) {
            gfx.lineStyle(2, 0xffd700, 1);
        } else if (owned) {
            gfx.lineStyle(1, 0x4a6a8a, 0.8);
        } else {
            gfx.lineStyle(1, 0x2a2a3a, 0.4);
        }
        gfx.strokeRoundedRect(x, y, w, h, 8);

        // Color swatch
        const swatchAlpha = owned ? 1 : 0.3;
        gfx.fillStyle(itemData.color, swatchAlpha);
        gfx.fillRoundedRect(x + w / 2 - 16, y + 8, 32, 32, 4);

        // Icon
        const icon = type === 'weapon' ? '⚔' : '🛡';
        this.add.text(x + w / 2, y + 24, icon, {
            fontSize: '16px'
        }).setOrigin(0.5).setDepth(3).setAlpha(owned ? 1 : 0.3);

        // Name
        const nameColor = owned ? '#ffffff' : '#555555';
        this.add.text(x + w / 2, y + 48, itemData.name, {
            fontSize: '12px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: nameColor
        }).setOrigin(0.5).setDepth(3);

        // Stat
        const statText = type === 'weapon'
            ? `+${itemData.damage} DMG`
            : `+${itemData.defense} DEF`;
        const statColor = owned
            ? (type === 'weapon' ? '#e74c3c' : '#3498db')
            : '#444444';
        this.add.text(x + w / 2, y + 64, statText, {
            fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: statColor
        }).setOrigin(0.5).setDepth(3);

        // Equip button (only if owned and not already equipped)
        if (owned && !equipped) {
            const btn = this.add.rectangle(x + w / 2, y + h - 14, w - 16, 20, 0x2ecc71, 0.8)
                .setDepth(3).setInteractive({ useHandCursor: true });
            this.add.text(x + w / 2, y + h - 14, 'EQUIP', {
                fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            btn.on('pointerover', () => btn.setFillStyle(0x27ae60, 1));
            btn.on('pointerout', () => btn.setFillStyle(0x2ecc71, 0.8));
            btn.on('pointerdown', () => {
                if (type === 'weapon') {
                    this.playerRef.equippedWeapon = itemId;
                } else {
                    this.playerRef.equippedArmor = itemId;
                }
                // Refresh the whole inventory screen
                this.scene.restart({ player: this.playerRef });
            });
        } else if (equipped) {
            this.add.text(x + w / 2, y + h - 14, 'EQUIPPED', {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffd700'
            }).setOrigin(0.5).setDepth(3);
        } else {
            // Not owned — show "locked" or cost
            const costText = itemData.cost > 0 ? `${itemData.cost}g` : 'Starter';
            this.add.text(x + w / 2, y + h - 14, costText, {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#555555'
            }).setOrigin(0.5).setDepth(3);
        }
    }

    closeInventory() {
        // Show the game and HUD again
        this.scene.setVisible(true, 'Game');
        this.scene.setVisible(true, 'UI');
        const gameScene = this.scene.get('Game');
        if (gameScene) {
            gameScene.inventoryOpen = false;
        }
        this.scene.stop('Inventory');
    }
}
