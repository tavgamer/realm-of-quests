// Realm of Quests - Dialog Scene
//
// Shows when the player talks to an NPC (press E).
// Displays dialog text with a typewriter effect and Accept/Decline buttons for quests.
//
// HOW IT WORKS:
// This scene launches ON TOP of the game (like UIScene).
// It pauses player movement while dialog is open.
// The GameScene passes in the NPC data and quest info when launching this scene.
//
// NEW CONCEPT: Typewriter Effect
// Instead of showing all text at once, we add one character at a time.
// This makes NPCs feel like they're "speaking" — a classic RPG technique!

class DialogScene extends Phaser.Scene {
    constructor() {
        super('Dialog');
    }

    init(data) {
        this.npcId = data.npcId;
        this.npcName = data.npcName;
        this.dialogText = data.dialogText;
        this.quest = data.quest || null;
        this.questId = data.questId || null;
        this.showAcceptDecline = data.showAcceptDecline || false;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // --- DARK OVERLAY (semi-transparent) ---
        this.overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.4)
            .setDepth(0);

        // --- DIALOG BOX (bottom of screen) ---
        const boxH = 200;
        const boxW = w - 80;

        // Box background with golden border
        this.dialogBg = this.add.graphics();
        this.dialogBg.fillStyle(0x1a1a2e, 0.95);
        this.dialogBg.fillRoundedRect(40, h - boxH - 25, boxW, boxH, 12);
        this.dialogBg.lineStyle(2, 0xffd700, 0.8);
        this.dialogBg.strokeRoundedRect(40, h - boxH - 25, boxW, boxH, 12);
        this.dialogBg.setDepth(1);

        // NPC name label (pixel font for character names)
        this.nameLabel = this.add.text(60, h - boxH - 14, this.npcName, {
            fontSize: '14px',
            fontFamily: 'Press Start 2P',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(2);

        // --- TYPEWRITER TEXT ---
        this.fullText = this.dialogText;
        this.currentCharIndex = 0;

        this.dialogContent = this.add.text(60, h - boxH + 15, '', {
            fontSize: '18px',
            fontFamily: 'Nunito',
            fontStyle: 'bold',
            color: '#ffffff',
            wordWrap: { width: boxW - 40 },
            lineSpacing: 6
        }).setDepth(2);

        // Type one character at a time (30ms per character)
        this.typeTimer = this.time.addEvent({
            delay: 30,
            callback: this.typeNextChar,
            callbackScope: this,
            loop: true
        });

        // --- QUEST INFO (if offering a quest) ---
        if (this.quest && this.showAcceptDecline) {
            this.questInfoText = this.add.text(60, h - 110, '', {
                fontSize: '14px',
                fontFamily: 'Nunito',
                fontStyle: 'bold',
                color: '#3498db',
                wordWrap: { width: boxW - 40 },
                lineSpacing: 6
            }).setDepth(2);
        }

        // --- BUTTONS (shown after text finishes typing) ---
        this.buttonsCreated = false;

        // E key can also close dialog (after text is done)
        this.closeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    typeNextChar() {
        if (this.currentCharIndex < this.fullText.length) {
            this.currentCharIndex++;
            this.dialogContent.setText(this.fullText.substring(0, this.currentCharIndex));
        } else {
            // Done typing — show buttons
            this.typeTimer.remove();
            if (!this.buttonsCreated) {
                this.buttonsCreated = true;
                this.showButtons();
            }
        }
    }

    showButtons() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        if (this.showAcceptDecline && this.quest) {
            // Show quest objective and rewards
            const quest = this.quest;
            let infoStr = `Quest: ${quest.name}\n`;
            if (quest.type === 'kill') {
                const target = ENEMIES[quest.target] ? ENEMIES[quest.target].name : quest.target;
                infoStr += `Objective: Kill ${quest.targetCount} ${target}s\nBonus Reward: 2x XP & Gold from kills`;
            } else if (quest.type === 'talk') {
                const npc = NPCS[quest.target] ? NPCS[quest.target].name : quest.target;
                infoStr += `Objective: Find and meet ${npc}\nReward: ${quest.rewardXP} XP + ${quest.rewardGold} Gold`;
            } else if (quest.type === 'collect_drops') {
                infoStr += `Objective: Collect ${quest.targetCount} ${quest.itemLabel}\nReward: ${quest.rewardXP} XP + ${quest.rewardGold} Gold`;
            } else if (quest.type === 'find_hidden') {
                infoStr += `Objective: Find ${quest.targetCount} ${quest.itemLabel}\nReward: ${quest.rewardXP} XP + ${quest.rewardGold} Gold`;
            } else if (quest.type === 'deliver') {
                infoStr += `Objective: Deliver to ${quest.destinationLabel}\nReward: ${quest.rewardXP} XP + ${quest.rewardGold} Gold`;
            } else {
                infoStr += `Objective: ${quest.targetCount} required`;
            }
            this.questInfoText.setText(infoStr);

            // ACCEPT button (green)
            const acceptBg = this.add.rectangle(w / 2 - 110, h - 40, 170, 35, 0x2ecc71)
                .setDepth(3).setInteractive({ useHandCursor: true });
            this.add.text(w / 2 - 110, h - 40, 'ACCEPT', {
                fontSize: '18px',
                fontFamily: 'Nunito',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            acceptBg.on('pointerover', () => acceptBg.setFillStyle(0x27ae60));
            acceptBg.on('pointerout', () => acceptBg.setFillStyle(0x2ecc71));
            acceptBg.on('pointerdown', () => {
                const gameScene = this.scene.get('Game');
                gameScene.questManager.acceptQuest(this.questId);

                // Update quest tracker on HUD
                const uiScene = this.scene.get('UI');
                if (uiScene && uiScene.updateQuestTracker) {
                    uiScene.updateQuestTracker(this.questId);
                }

                this.closeDialog();
            });

            // DECLINE button (red)
            const declineBg = this.add.rectangle(w / 2 + 110, h - 40, 170, 35, 0xe74c3c)
                .setDepth(3).setInteractive({ useHandCursor: true });
            this.add.text(w / 2 + 110, h - 40, 'DECLINE', {
                fontSize: '18px',
                fontFamily: 'Nunito',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            declineBg.on('pointerover', () => declineBg.setFillStyle(0xc0392b));
            declineBg.on('pointerout', () => declineBg.setFillStyle(0xe74c3c));
            declineBg.on('pointerdown', () => {
                this.closeDialog();
            });
        } else {
            // Just a CLOSE button (for greetings / quest progress)
            const closeBg = this.add.rectangle(w / 2, h - 40, 170, 35, 0x3498db)
                .setDepth(3).setInteractive({ useHandCursor: true });
            this.add.text(w / 2, h - 40, 'CLOSE [E]', {
                fontSize: '18px',
                fontFamily: 'Nunito',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            closeBg.on('pointerover', () => closeBg.setFillStyle(0x2980b9));
            closeBg.on('pointerout', () => closeBg.setFillStyle(0x3498db));
            closeBg.on('pointerdown', () => this.closeDialog());

            // Also close with E key
            this.closeKey.on('down', () => {
                if (this.buttonsCreated) this.closeDialog();
            });
        }
    }

    closeDialog() {
        const gameScene = this.scene.get('Game');
        // Set a short cooldown so GameScene doesn't immediately reopen dialog
        // (the same E keypress that closes this would trigger tryTalkToNPC)
        gameScene.dialogCooldown = 300;
        gameScene.dialogOpen = false;
        this.scene.stop('Dialog');
    }
}
