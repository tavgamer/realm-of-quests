// Realm of Quests - Shop Scene
//
// Opens when the player talks to the Shopkeeper NPC.
// Shows all weapons and armor that the player doesn't own yet.
// Items can be bought if the player has enough gold AND meets the level requirement.
//
// HOW SHOPS WORK IN RPGs:
// The shop is a menu where you spend gold (earned from combat and chests)
// to buy better equipment. Each item has a cost and a level requirement.
// You can't buy something you already own — no duplicates.

class ShopScene extends Phaser.Scene {
    constructor() {
        super('Shop');
    }

    init(data) {
        this.playerRef = data.player;
        this.shopType = data.shopType || 'weapons';
        this.npcName = data.npcName || 'Shopkeeper';
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Hide the game and HUD behind us
        this.scene.setVisible(false, 'Game');
        this.scene.setVisible(false, 'UI');

        // --- SOLID BLACK BACKGROUND ---
        this.cameras.main.setBackgroundColor('#0a0a12');

        // --- TITLE ---
        this.add.text(w / 2, 35, 'SHOP', {
            fontSize: '28px',
            fontFamily: 'Press Start 2P',
            color: '#f39c12',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(1);

        // --- GOLD DISPLAY ---
        this.goldText = this.add.text(w / 2, 70, `Gold: ${this.playerRef.gold}`, {
            fontSize: '18px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#f39c12'
        }).setOrigin(0.5).setDepth(1);

        // --- CLOSE HINT ---
        this.add.text(w / 2, h - 25, 'E to close', {
            fontSize: '16px',
            fontFamily: 'Press Start 2P',
            color: '#888888',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(1);

        // --- SHOPKEEPER GREETING ---
        const greeting = this.npcName === 'Deep Trader'
            ? '"Treasures from the deep!"'
            : '"Take a look at my wares!"';
        this.add.text(w / 2, 95, greeting, {
            fontSize: '15px',
            fontFamily: 'Nunito',
            fontStyle: 'italic',
            color: '#aaaaaa'
        }).setOrigin(0.5).setDepth(1);

        // Different shops sell different things!
        if (this.shopType === 'weapons') {
            // Area 1 Shopkeeper: weapons + armor
            this.drawSection('WEAPONS', 80, 125, w - 160, 250, WEAPONS, 'weapon');
            this.drawSection('ARMOR', 80, 400, w - 160, 250, ARMOR, 'armor');
        } else if (this.shopType === 'potions') {
            // Area 2 Deep Trader: potions + high-tier armor
            this.drawSection('POTIONS', 80, 125, w - 160, 250, POTIONS, 'potion');
            // Only show the better armor pieces
            const deepArmor = {};
            for (const id in ARMOR) {
                if (ARMOR[id].cost >= 200) deepArmor[id] = ARMOR[id];
            }
            this.drawSection('DEEP SEA ARMOR', 80, 400, w - 160, 250, deepArmor, 'armor');
        }

        // --- CLOSE KEYS ---
        const closeE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        closeE.on('down', () => this.closeShop());
        const closeEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        closeEsc.on('down', () => this.closeShop());
    }

    drawSection(title, x, y, w, h, items, type) {
        const gfx = this.add.graphics().setDepth(1);
        gfx.fillStyle(0x0d1117, 0.9);
        gfx.fillRoundedRect(x, y, w, h, 10);
        gfx.lineStyle(1, 0x3a4a5a, 0.6);
        gfx.strokeRoundedRect(x, y, w, h, 10);

        const titleColor = type === 'weapon' ? '#e74c3c' : '#3498db';
        this.add.text(x + 15, y + 10, title, {
            fontSize: '14px', fontFamily: 'Press Start 2P',
            color: titleColor, stroke: '#000000', strokeThickness: 2
        }).setDepth(2);

        let col = 0;
        const itemW = 145;
        const itemH = 195;
        const startX = x + 15;
        const gap = 8;

        for (const itemId in items) {
            const item = items[itemId];
            const owned = this.playerRef.inventory.includes(itemId);
            const ix = startX + col * (itemW + gap);
            const iy = y + 35;

            this.drawShopItem(ix, iy, itemW, itemH, item, itemId, type, owned);
            col++;
        }
    }

    drawShopItem(x, y, w, h, itemData, itemId, type, owned) {
        const gfx = this.add.graphics().setDepth(2);
        const canAfford = this.playerRef.gold >= itemData.cost;
        const canBuy = !owned && canAfford;

        // Background
        gfx.fillStyle(owned ? 0x1a3a1a : 0x1a2a3a, 1);
        gfx.fillRoundedRect(x, y, w, h, 8);

        // Border
        if (owned) {
            gfx.lineStyle(1, 0x2ecc71, 0.6);
        } else if (canBuy) {
            gfx.lineStyle(1, 0xf39c12, 0.8);
        } else {
            gfx.lineStyle(1, 0x2a2a3a, 0.4);
        }
        gfx.strokeRoundedRect(x, y, w, h, 8);

        // Color swatch
        gfx.fillStyle(itemData.color, owned || canBuy ? 1 : 0.3);
        gfx.fillRoundedRect(x + w / 2 - 18, y + 10, 36, 36, 4);

        // Icon — potions get a flask icon
        let icon = type === 'weapon' ? '⚔' : '🛡';
        if (type === 'potion') icon = '🧪';
        this.add.text(x + w / 2, y + 28, icon, {
            fontSize: '18px'
        }).setOrigin(0.5).setDepth(3).setAlpha(owned || canBuy ? 1 : 0.3);

        // Name
        this.add.text(x + w / 2, y + 55, itemData.name, {
            fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: owned ? '#2ecc71' : (canBuy ? '#ffffff' : '#666666')
        }).setOrigin(0.5).setDepth(3);

        // Stat
        let statText = '';
        let statColor = '#cccccc';
        if (type === 'weapon') {
            statText = `+${itemData.damage} DMG`;
            statColor = '#e74c3c';
        } else if (type === 'armor') {
            statText = `+${itemData.defense} DEF`;
            statColor = '#3498db';
        } else if (type === 'potion') {
            statText = itemData.description || '';
            statColor = '#2ecc71';
        }
        this.add.text(x + w / 2, y + 73, statText, {
            fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold',
            color: canBuy || owned ? statColor : '#444444',
            wordWrap: { width: w - 10 },
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(3);

        // Cost / Owned status
        const costY = y + 105;
        if (owned && type !== 'potion') {
            this.add.text(x + w / 2, costY, 'OWNED ✓', {
                fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#2ecc71'
            }).setOrigin(0.5).setDepth(3);
        } else if (itemData.cost === 0 && type !== 'potion') {
            this.add.text(x + w / 2, costY, 'Starter Item', {
                fontSize: '11px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#888888'
            }).setOrigin(0.5).setDepth(3);
        } else {
            const goldColor = canAfford ? '#f39c12' : '#e74c3c';
            this.add.text(x + w / 2, costY, `${itemData.cost} Gold`, {
                fontSize: '13px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: goldColor
            }).setOrigin(0.5).setDepth(3);
        }

        // BUY button
        const btnY = y + h - 22;
        if (owned && type !== 'potion') {
            // Already owned — no button needed (potions can always be re-bought)
        } else if (canBuy || (type === 'potion' && canAfford)) {
            const btn = this.add.rectangle(x + w / 2, btnY, w - 16, 28, 0xf39c12, 0.9)
                .setDepth(3).setInteractive({ useHandCursor: true });
            this.add.text(x + w / 2, btnY, 'BUY', {
                fontSize: '14px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            btn.on('pointerover', () => btn.setFillStyle(0xe67e22, 1));
            btn.on('pointerout', () => btn.setFillStyle(0xf39c12, 0.9));
            btn.on('pointerdown', () => this.buyItem(itemId, itemData, type));
        } else {
            this.add.text(x + w / 2, btnY, 'NOT ENOUGH GOLD', {
                fontSize: '10px', fontFamily: 'Nunito', fontStyle: 'bold',
                color: '#e74c3c'
            }).setOrigin(0.5).setDepth(3);
        }
    }

    buyItem(itemId, itemData, type) {
        // Deduct gold
        this.playerRef.gold -= itemData.cost;

        let floatText = `Bought ${itemData.name}!`;
        let floatColor = '#f39c12';

        if (type === 'potion') {
            // Add to potion inventory — player uses them when they want
            if (this.playerRef.potions) {
                this.playerRef.potions[itemId] = (this.playerRef.potions[itemId] || 0) + 1;
            }
            floatText = `+1 ${itemData.name}`;
            floatColor = '#2ecc71';
        } else {
            // Weapon or armor — add to inventory
            this.playerRef.inventory.push(itemId);

            // Auto-equip if it's better than current
            if (type === 'weapon') {
                const currentWeapon = WEAPONS[this.playerRef.equippedWeapon];
                if (itemData.damage > currentWeapon.damage) {
                    this.playerRef.equippedWeapon = itemId;
                }
            } else {
                const currentArmor = ARMOR[this.playerRef.equippedArmor];
                if (itemData.defense > currentArmor.defense) {
                    this.playerRef.equippedArmor = itemId;
                }
            }
        }

        // Show purchase effect (will show when shop closes)
        this._lastBuyText = floatText;
        this._lastBuyColor = floatColor;

        // Refresh the shop screen
        this.scene.restart({
            player: this.playerRef,
            shopType: this.shopType,
            npcName: this.npcName
        });
    }

    closeShop() {
        // Show the game and HUD again
        this.scene.setVisible(true, 'Game');
        this.scene.setVisible(true, 'UI');
        const gameScene = this.scene.get('Game');
        if (gameScene) {
            gameScene.dialogOpen = false;
            gameScene.dialogCooldown = 300;
        }
        this.scene.stop('Shop');
    }
}
