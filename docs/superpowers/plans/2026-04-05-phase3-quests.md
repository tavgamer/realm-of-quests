# Phase 3: Quest System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quest system where NPCs offer quests via dialog, enemies only spawn when a quest is active, and quests give bonus rewards on completion.

**Architecture:** QuestManager tracks quest states and kill counts. DialogScene shows NPC dialog with Accept/Decline buttons. GameScene's enemy spawning is controlled by active quests — enemies spawn continuously while a quest is active and all die when the quest completes. The map is enlarged (80x60 tiles) so enemies spawn far from the player. Quest completion rewards are 2x the total XP/Gold the player earned from kills during the quest.

**Tech Stack:** Phaser 3.90.0, vanilla JS, no build tools.

**Important conventions:**
- All sprites use 96x128 spritesheets (3 cols x 4 rows of 32x32 frames)
- UIScene is an overlay with its own unzoomed camera for crisp HUD text
- Bump `?v=N` query strings in index.html when changing files
- Tell user to Ctrl+Shift+R after deploying changes
- No automated testing — describe what to test manually

---

### Task 1: Expand the Map (80x60 tiles)

**Why:** The current 40x30 map is too small — enemies spawn right next to the player. Doubling it gives room for enemies to spawn far away.

**Files:**
- Modify: `js/data/areas.js` — change area1 dimensions
- Modify: `js/scenes/GameScene.js` — update tree clusters, house positions, paths, and pond to fit the larger map. Move enemy spawns far from player spawn (5,15).

- [ ] **Step 1: Update area1 dimensions**

In `js/data/areas.js`, change area1's width and height:

```js
area1: {
    id: 'area1',
    name: 'Greenwood Village',
    requiredLevel: 1,
    width: 80,   // Was 40
    height: 60,  // Was 30
    enemies: ['goblin', 'slime'],
    npcs: ['npc_elder', 'npc_shopkeeper'],
    exits: [
        { to: 'area2', x: 79, y: 30, direction: 'right' }
    ],
    playerSpawn: { x: 10, y: 30 }
},
```

- [ ] **Step 2: Update GameScene map generation for larger map**

In `js/scenes/GameScene.js`, update the `create()` method. The paths, tree clusters, water pond, and houses all need to scale to the new 80x60 map:

Replace the entire path section (horizontal + vertical paths) with:

```js
// --- PATH LAYER (dirt roads) ---
const pathLayer = map.createBlankLayer('paths', pathTileset);

// Horizontal path through middle
for (let x = 1; x < mapWidth - 1; x++) {
    pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2));
    pathLayer.putTileAt(0, x, Math.floor(mapHeight / 2) + 1);
}
// Vertical path crossing
for (let y = 3; y < mapHeight - 3; y++) {
    pathLayer.putTileAt(0, Math.floor(mapWidth / 2), y);
    pathLayer.putTileAt(0, Math.floor(mapWidth / 2) + 1, y);
}
// Second vertical path (left side, near village)
for (let y = 10; y < mapHeight - 10; y++) {
    pathLayer.putTileAt(0, 15, y);
    pathLayer.putTileAt(0, 16, y);
}
```

Replace tree clusters with ones spread across the bigger map:

```js
// Tree clusters spread across the larger map
this.placeCluster(treeLayer, 5, 4, 3, 2);
this.placeCluster(treeLayer, 20, 5, 4, 3);
this.placeCluster(treeLayer, 50, 6, 3, 3);
this.placeCluster(treeLayer, 70, 8, 3, 2);
this.placeCluster(treeLayer, 7, 45, 3, 2);
this.placeCluster(treeLayer, 25, 48, 4, 2);
this.placeCluster(treeLayer, 55, 44, 3, 3);
this.placeCluster(treeLayer, 65, 50, 4, 2);
this.placeCluster(treeLayer, 35, 15, 2, 3);
this.placeCluster(treeLayer, 60, 25, 3, 2);
this.placeCluster(treeLayer, 45, 38, 2, 3);
```

Update the water pond to be in the larger map:

```js
// Small pond in the southeast area
for (let x = 55; x < 60; x++) {
    for (let y = 40; y < 44; y++) {
        waterLayer.putTileAt(0, x, y);
    }
}
```

Update house positions (keep near NPCs which are at tile 8,10 and 15,8):

```js
// Houses near NPCs (elder is at 8,10 — shopkeeper at 15,8)
this.placeCluster(houseLayer, 10, 7, 3, 2);
this.placeCluster(houseLayer, 16, 6, 3, 2);
this.placeCluster(houseLayer, 10, 33, 3, 2);
this.placeCluster(houseLayer, 22, 28, 3, 2);
```

- [ ] **Step 3: Remove hardcoded enemy spawns from GameScene**

In `js/scenes/GameScene.js`, delete the entire enemy spawning block (the `enemySpawns` array and the `forEach` that creates enemies). Keep only the physics group creation and colliders. Replace this section:

```js
// --- SPAWN ENEMIES ---
// Create a physics group to hold all enemies in this area
this.enemies = this.physics.add.group();
```

Delete everything from `const enemySpawns = [` through the `enemySpawns.forEach(...)` block. Keep the colliders below.

Store collision layers for later use by the spawn system:

```js
// --- SPAWN ENEMIES ---
this.enemies = this.physics.add.group();

// Store collision layers so the quest spawn system can use them
this.collisionLayers = { treeLayer, waterLayer, houseLayer };
```

- [ ] **Step 4: Test manually**

Open the game, verify:
- Map is much bigger (player has lots of room to walk around)
- No enemies spawn (they'll come from quests now)
- Trees, water, houses, and paths look reasonable on the larger map
- Player spawns in a safe area

- [ ] **Step 5: Commit**

```bash
cd ~/learning/realm-of-quests
git add js/data/areas.js js/scenes/GameScene.js
git commit -m "feat: expand map to 80x60 tiles, remove hardcoded enemy spawns"
```

---

### Task 2: Create QuestManager System

**Why:** This is the brain of the quest system. It tracks which quests are available, active, or completed, counts kills, and calculates rewards.

**Files:**
- Create: `js/systems/QuestManager.js`

- [ ] **Step 1: Create QuestManager**

```js
// Realm of Quests - Quest Manager
//
// Tracks all quest states and progress.
// Quest states: 'available' → 'active' → 'complete' → 'rewarded'
//
// HOW IT WORKS:
// 1. Player talks to NPC → QuestManager checks what quests are available
// 2. Player accepts quest → state becomes 'active', enemies start spawning
// 3. Player kills enemies → QuestManager counts kills
// 4. Kill count reaches target → state becomes 'complete'
// 5. Quest rewards are given → state becomes 'rewarded'

class QuestManager {
    constructor(scene) {
        this.scene = scene;

        // Track state of each quest: 'available', 'active', 'complete', 'rewarded'
        this.questStates = {};

        // Track kill progress for active quests: { questId: currentKills }
        this.questProgress = {};

        // Track XP and Gold earned from kills during a quest (for bonus reward)
        this.questKillRewards = {};

        // Initialize all quest states
        for (const questId in QUESTS) {
            this.questStates[questId] = 'available';
            this.questProgress[questId] = 0;
            this.questKillRewards[questId] = { xp: 0, gold: 0 };
        }
    }

    // Get quests available from a specific NPC
    getAvailableQuests(npcId) {
        const npcData = NPCS[npcId];
        if (!npcData) return [];

        return npcData.quests.filter(questId => {
            const quest = QUESTS[questId];
            const state = this.questStates[questId];

            // Only show if available and player meets requirements
            if (state !== 'available') return false;
            if (this.scene.player.level < quest.requiredLevel) return false;

            // Check prerequisite quests are completed
            for (const reqId of quest.requiredQuests) {
                if (this.questStates[reqId] !== 'rewarded') return false;
            }

            return true;
        });
    }

    // Get active quests from a specific NPC (to show progress or turn in)
    getActiveQuests(npcId) {
        const npcData = NPCS[npcId];
        if (!npcData) return [];

        return npcData.quests.filter(questId => {
            const state = this.questStates[questId];
            return state === 'active' || state === 'complete';
        });
    }

    // Accept a quest
    acceptQuest(questId) {
        this.questStates[questId] = 'active';
        this.questProgress[questId] = 0;
        this.questKillRewards[questId] = { xp: 0, gold: 0 };

        // Start spawning enemies for this quest
        this.scene.startQuestSpawning(questId);
    }

    // Called when an enemy dies — checks if it counts toward any active quest
    onEnemyKilled(enemyType, xpReward, goldDrop) {
        for (const questId in this.questStates) {
            if (this.questStates[questId] !== 'active') continue;

            const quest = QUESTS[questId];
            if (quest.type === 'kill' && quest.target === enemyType) {
                this.questProgress[questId]++;

                // Track the XP and gold earned from kills
                this.questKillRewards[questId].xp += xpReward;
                this.questKillRewards[questId].gold += goldDrop;

                // Check if quest is complete
                if (this.questProgress[questId] >= quest.targetCount) {
                    this.completeQuest(questId);
                }
            }
        }
    }

    // Quest kill target reached — mark complete, stop spawns, kill all enemies
    completeQuest(questId) {
        this.questStates[questId] = 'complete';

        // Stop spawning and kill all remaining enemies
        this.scene.stopQuestSpawning(questId);

        // Give bonus rewards (double the XP and gold earned from kills)
        const quest = QUESTS[questId];
        const bonus = this.questKillRewards[questId];
        const bonusXP = bonus.xp;
        const bonusGold = bonus.gold;

        this.scene.player.xp += bonusXP;
        this.scene.player.gold += bonusGold;

        // Show big reward text
        const rewardText = this.scene.add.text(
            this.scene.player.x, this.scene.player.y - 30,
            'QUEST COMPLETE!\n+' + bonusXP + ' XP  +' + bonusGold + ' Gold',
            {
                fontSize: '7px',
                fontFamily: 'Press Start 2P',
                color: '#ffd700',
                stroke: '#000000',
                strokeThickness: 3,
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(25);

        this.scene.tweens.add({
            targets: rewardText,
            y: rewardText.y - 40,
            alpha: 0,
            duration: 2500,
            onComplete: () => rewardText.destroy()
        });

        this.questStates[questId] = 'rewarded';

        // Update the HUD quest tracker
        if (this.scene.uiScene && this.scene.uiScene.updateQuestTracker) {
            this.scene.uiScene.updateQuestTracker(null);
        }
    }

    // Check if there's currently an active quest
    getActiveQuest() {
        for (const questId in this.questStates) {
            if (this.questStates[questId] === 'active') {
                return questId;
            }
        }
        return null;
    }

    // Get progress text for a quest
    getProgressText(questId) {
        const quest = QUESTS[questId];
        const current = this.questProgress[questId] || 0;
        return quest.dialog.progress
            .replace('{current}', current)
            .replace('{total}', quest.targetCount);
    }
}
```

- [ ] **Step 2: Add QuestManager script to index.html**

In `index.html`, add after the CombatSystem script:

```html
<script src="js/systems/QuestManager.js?v=1"></script>
```

- [ ] **Step 3: Commit**

```bash
cd ~/learning/realm-of-quests
git add js/systems/QuestManager.js index.html
git commit -m "feat: add QuestManager system for tracking quest states and progress"
```

---

### Task 3: Add Enemy Spawning System (Quest-Driven)

**Why:** Enemies should only spawn when a quest is active, keep spawning continuously, and all die when the quest is completed.

**Files:**
- Modify: `js/scenes/GameScene.js` — add `startQuestSpawning()`, `stopQuestSpawning()`, `spawnEnemy()` methods
- Modify: `js/entities/Enemy.js` — notify QuestManager on death

- [ ] **Step 1: Add quest-driven spawn methods to GameScene**

Add these methods to the `GameScene` class (after the `placeCluster` method):

```js
// --- QUEST-DRIVEN ENEMY SPAWNING ---
// Called by QuestManager when a quest is accepted.
// Spawns enemies continuously until the quest is complete.
startQuestSpawning(questId) {
    const quest = QUESTS[questId];
    this.activeQuestId = questId;

    // Spawn first batch immediately (3 enemies)
    for (let i = 0; i < 3; i++) {
        this.spawnQuestEnemy(quest.target);
    }

    // Keep spawning every 4 seconds while quest is active
    this.spawnTimer = this.time.addEvent({
        delay: 4000,
        callback: () => {
            // Don't spawn more than 6 enemies at once
            const aliveCount = this.enemies.getChildren().length;
            if (aliveCount < 6) {
                this.spawnQuestEnemy(quest.target);
            }
        },
        loop: true
    });
}

// Spawn a single enemy of the given type at a random position far from the player
spawnQuestEnemy(enemyType) {
    const tileSize = 16;
    const mapW = this.currentArea.width;
    const mapH = this.currentArea.height;
    let spawnX, spawnY;
    let attempts = 0;

    // Keep trying until we find a spot far enough from the player
    do {
        // Pick a random tile position (away from borders)
        const tileX = Phaser.Math.Between(4, mapW - 4);
        const tileY = Phaser.Math.Between(4, mapH - 4);
        spawnX = tileX * tileSize;
        spawnY = tileY * tileSize;
        attempts++;
    } while (
        distanceBetween(spawnX, spawnY, this.player.x, this.player.y) < 200 &&
        attempts < 30
    );

    const enemy = new Enemy(this, spawnX, spawnY, enemyType);
    enemy.target = this.player;
    this.enemies.add(enemy);

    // Set up collisions for this new enemy
    const layers = this.collisionLayers;
    this.physics.add.collider(enemy, layers.treeLayer);
    this.physics.add.collider(enemy, layers.waterLayer);
    this.physics.add.collider(enemy, layers.houseLayer);
}

// Called by QuestManager when quest is complete — stop spawning and kill all enemies
stopQuestSpawning(questId) {
    this.activeQuestId = null;

    // Stop the spawn timer
    if (this.spawnTimer) {
        this.spawnTimer.remove();
        this.spawnTimer = null;
    }

    // Kill all remaining enemies with a death effect
    this.enemies.getChildren().forEach(enemy => {
        if (enemy.state !== 'DEAD') {
            // Quick death — no rewards (quest bonus already given)
            enemy.state = 'DEAD';
            enemy.setVelocity(0, 0);
            enemy.body.enable = false;

            // Poof effect
            enemy.scene.tweens.add({
                targets: enemy,
                alpha: 0,
                scaleX: 0,
                scaleY: 0,
                duration: 400,
                onComplete: () => {
                    enemy.healthBar.destroy();
                    enemy.destroy();
                }
            });
        }
    });
}
```

- [ ] **Step 2: Initialize QuestManager in GameScene.create()**

In `GameScene.create()`, after creating the CombatSystem, add:

```js
// --- QUEST SYSTEM ---
this.questManager = new QuestManager(this);
this.activeQuestId = null;
this.spawnTimer = null;
```

- [ ] **Step 3: Notify QuestManager on enemy death**

In `js/entities/Enemy.js`, inside the `die()` method, after the line that gives gold to the player (`this.target.gold += this.enemyData.goldDrop;`), add:

```js
// Notify quest manager about the kill
if (this.scene.questManager) {
    this.scene.questManager.onEnemyKilled(
        this.enemyType,
        this.enemyData.xpReward,
        this.enemyData.goldDrop
    );
}
```

- [ ] **Step 4: Test manually**

Open the game, verify:
- No enemies on the map at start (good!)
- Nothing crashes when walking around
- (Quests aren't triggerable yet — that comes in Task 4)

- [ ] **Step 5: Commit**

```bash
cd ~/learning/realm-of-quests
git add js/scenes/GameScene.js js/entities/Enemy.js
git commit -m "feat: quest-driven enemy spawning — enemies spawn on quest accept, die on complete"
```

---

### Task 4: Create Dialog Scene (NPC Interaction)

**Why:** When the player presses E near an NPC, a dialog box appears with the quest offer. The player can Accept or Decline.

**Files:**
- Create: `js/scenes/DialogScene.js`
- Modify: `js/scenes/GameScene.js` — add E key interaction and NPC proximity check
- Modify: `index.html` — add DialogScene script
- Modify: `js/main.js` — register DialogScene

- [ ] **Step 1: Create DialogScene**

```js
// Realm of Quests - Dialog Scene
//
// Shows when the player talks to an NPC (press E).
// Displays dialog text with a typewriter effect and Accept/Decline buttons for quests.
//
// HOW IT WORKS:
// This scene launches ON TOP of the game (like UIScene).
// It pauses player movement while dialog is open.
// The GameScene passes in the NPC data and quest info when launching this scene.

class DialogScene extends Phaser.Scene {
    constructor() {
        super('Dialog');
    }

    init(data) {
        this.npcId = data.npcId;
        this.npcName = data.npcName;
        this.dialogText = data.dialogText;
        this.quest = data.quest || null;       // Quest data if offering a quest
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
        const boxH = 180;
        const boxY = h - boxH / 2 - 20;
        const boxW = w - 60;

        // Box background
        this.dialogBg = this.add.graphics();
        this.dialogBg.fillStyle(0x1a1a2e, 0.95);
        this.dialogBg.fillRoundedRect(30, h - boxH - 20, boxW, boxH, 10);
        this.dialogBg.lineStyle(2, 0xffd700, 0.8);
        this.dialogBg.strokeRoundedRect(30, h - boxH - 20, boxW, boxH, 10);
        this.dialogBg.setDepth(1);

        // NPC name label
        this.nameLabel = this.add.text(50, h - boxH - 10, this.npcName, {
            fontSize: '12px',
            fontFamily: 'Press Start 2P',
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 3
        }).setDepth(2);

        // --- TYPEWRITER TEXT ---
        this.fullText = this.dialogText;
        this.currentCharIndex = 0;

        this.dialogContent = this.add.text(50, h - boxH + 15, '', {
            fontSize: '10px',
            fontFamily: 'Press Start 2P',
            color: '#ffffff',
            wordWrap: { width: boxW - 40 },
            lineSpacing: 8
        }).setDepth(2);

        // Type one character at a time
        this.typeTimer = this.time.addEvent({
            delay: 30,
            callback: this.typeNextChar,
            callbackScope: this,
            loop: true
        });

        // --- QUEST INFO (if offering a quest) ---
        if (this.quest && this.showAcceptDecline) {
            // Show quest details below dialog after typing finishes
            this.questInfoText = this.add.text(50, h - 95, '', {
                fontSize: '8px',
                fontFamily: 'Press Start 2P',
                color: '#3498db',
                wordWrap: { width: boxW - 40 },
                lineSpacing: 6
            }).setDepth(2);
        }

        // --- BUTTONS (shown after text finishes typing) ---
        this.buttonsCreated = false;

        // Close on E key press (after text is done)
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
            const target = ENEMIES[quest.target] ? ENEMIES[quest.target].name : quest.target;
            const infoStr = `Quest: ${quest.name}\nObjective: Kill ${quest.targetCount} ${target}s\nBonus Reward: 2x XP & Gold from kills`;
            this.questInfoText.setText(infoStr);

            // ACCEPT button
            const acceptBg = this.add.rectangle(w / 2 - 90, h - 35, 140, 30, 0x2ecc71)
                .setDepth(3).setInteractive({ useHandCursor: true });
            const acceptText = this.add.text(w / 2 - 90, h - 35, 'ACCEPT', {
                fontSize: '10px',
                fontFamily: 'Press Start 2P',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            acceptBg.on('pointerover', () => acceptBg.setFillStyle(0x27ae60));
            acceptBg.on('pointerout', () => acceptBg.setFillStyle(0x2ecc71));
            acceptBg.on('pointerdown', () => {
                // Accept the quest
                const gameScene = this.scene.get('Game');
                gameScene.questManager.acceptQuest(this.questId);

                // Update quest tracker on HUD
                const uiScene = this.scene.get('UI');
                if (uiScene && uiScene.updateQuestTracker) {
                    uiScene.updateQuestTracker(this.questId);
                }

                this.closeDialog();
            });

            // DECLINE button
            const declineBg = this.add.rectangle(w / 2 + 90, h - 35, 140, 30, 0xe74c3c)
                .setDepth(3).setInteractive({ useHandCursor: true });
            const declineText = this.add.text(w / 2 + 90, h - 35, 'DECLINE', {
                fontSize: '10px',
                fontFamily: 'Press Start 2P',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(4);

            declineBg.on('pointerover', () => declineBg.setFillStyle(0xc0392b));
            declineBg.on('pointerout', () => declineBg.setFillStyle(0xe74c3c));
            declineBg.on('pointerdown', () => {
                this.closeDialog();
            });
        } else {
            // Just a CLOSE button (for greetings / no quest available)
            const closeBg = this.add.rectangle(w / 2, h - 35, 140, 30, 0x3498db)
                .setDepth(3).setInteractive({ useHandCursor: true });
            const closeText = this.add.text(w / 2, h - 35, 'CLOSE [E]', {
                fontSize: '10px',
                fontFamily: 'Press Start 2P',
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
        // Resume game
        const gameScene = this.scene.get('Game');
        gameScene.dialogOpen = false;
        this.scene.stop('Dialog');
    }
}
```

- [ ] **Step 2: Add E key interaction to GameScene**

In `GameScene.create()`, after the `attackKey` setup, add:

```js
// E key for talking to NPCs
this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
this.dialogOpen = false;
```

In `GameScene.update()`, after the attack handling block and before the enemy update loop, add:

```js
// --- NPC INTERACTION (press E near an NPC) ---
if (Phaser.Input.Keyboard.JustDown(this.interactKey) && !this.dialogOpen) {
    this.tryTalkToNPC();
}
```

Add the `tryTalkToNPC()` method to GameScene:

```js
// Check if player is near an NPC and open dialog
tryTalkToNPC() {
    const tileSize = 16;
    const interactRange = 40; // pixels

    for (const npcId in NPCS) {
        const npcData = NPCS[npcId];
        if (npcData.area !== this.currentAreaId) continue;

        const npcX = npcData.x * tileSize;
        const npcY = npcData.y * tileSize;
        const dist = distanceBetween(this.player.x, this.player.y, npcX, npcY);

        if (dist < interactRange) {
            this.openNPCDialog(npcId, npcData);
            return;
        }
    }
}

// Open dialog with an NPC
openNPCDialog(npcId, npcData) {
    this.dialogOpen = true;
    this.player.setVelocity(0, 0); // Stop player movement

    // Check if NPC has an available quest
    const availableQuests = this.questManager.getAvailableQuests(npcId);
    const activeQuests = this.questManager.getActiveQuests(npcId);

    if (availableQuests.length > 0) {
        // Offer the first available quest
        const questId = availableQuests[0];
        const quest = QUESTS[questId];

        this.scene.launch('Dialog', {
            npcId: npcId,
            npcName: npcData.name,
            dialogText: quest.dialog.intro,
            quest: quest,
            questId: questId,
            showAcceptDecline: true
        });
    } else if (activeQuests.length > 0) {
        // Show progress for the first active quest
        const questId = activeQuests[0];
        const progressText = this.questManager.getProgressText(questId);

        this.scene.launch('Dialog', {
            npcId: npcId,
            npcName: npcData.name,
            dialogText: progressText,
            showAcceptDecline: false
        });
    } else {
        // No quests — just a greeting
        this.scene.launch('Dialog', {
            npcId: npcId,
            npcName: npcData.name,
            dialogText: npcData.dialog.noQuest,
            showAcceptDecline: false
        });
    }
}
```

- [ ] **Step 3: Pause player movement during dialog**

In `Player.update()`, at the very beginning (after the `if (this.isDead) return;` line), add:

```js
// Don't move during dialog
if (this.scene.dialogOpen) {
    this.setVelocity(0, 0);
    return;
}
```

- [ ] **Step 4: Register DialogScene in main.js and index.html**

In `index.html`, add the DialogScene script (after GameScene):

```html
<script src="js/scenes/DialogScene.js?v=1"></script>
```

In `js/main.js`, add 'DialogScene' to the scene array (it should already list BootScene, MenuScene, GameScene, UIScene — add DialogScene):

Find the `scene:` array and add `DialogScene` to it.

- [ ] **Step 5: Test manually**

Open the game, verify:
- Walk up to Village Elder and press E — dialog box appears with quest offer
- Typewriter text effect works
- Accept button starts the quest (enemies spawn!)
- Decline button closes dialog without accepting
- Walk to Shopkeeper, press E — shows greeting (no quest)
- Can't move while dialog is open

- [ ] **Step 6: Commit**

```bash
cd ~/learning/realm-of-quests
git add js/scenes/DialogScene.js js/scenes/GameScene.js js/entities/Player.js js/main.js index.html
git commit -m "feat: add NPC dialog system with quest Accept/Decline buttons"
```

---

### Task 5: Add Quest Tracker to HUD

**Why:** The player needs to see their active quest objective and progress on screen at all times.

**Files:**
- Modify: `js/scenes/UIScene.js` — add quest tracker display

- [ ] **Step 1: Add quest tracker to UIScene.create()**

After the `controlsHint` tween in UIScene's `create()` method, add:

```js
// --- QUEST TRACKER (top-right) ---
this.questTrackerBg = this.add.graphics();
this.questTrackerTitle = this.add.text(790, 15, '', {
    fontSize: '8px',
    fontFamily: 'Press Start 2P',
    color: '#ffd700',
    stroke: '#000000',
    strokeThickness: 2
}).setOrigin(1, 0);

this.questTrackerProgress = this.add.text(790, 32, '', {
    fontSize: '8px',
    fontFamily: 'Press Start 2P',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 2
}).setOrigin(1, 0);

this.activeQuestId = null;
```

- [ ] **Step 2: Add updateQuestTracker method**

Add this method to UIScene:

```js
// Called by DialogScene when quest is accepted, or QuestManager when quest completes
updateQuestTracker(questId) {
    this.activeQuestId = questId;

    if (!questId) {
        // No active quest — hide tracker
        this.questTrackerBg.clear();
        this.questTrackerTitle.setText('');
        this.questTrackerProgress.setText('');
        return;
    }

    const quest = QUESTS[questId];
    this.questTrackerTitle.setText(quest.name);
}
```

- [ ] **Step 3: Update quest progress in updateHUD**

In `UIScene.updateHUD()`, at the end of the method, add:

```js
// Update quest tracker progress
if (this.activeQuestId) {
    const gameScene = this.scene.get('Game');
    if (gameScene && gameScene.questManager) {
        const quest = QUESTS[this.activeQuestId];
        const progress = gameScene.questManager.questProgress[this.activeQuestId] || 0;
        const target = ENEMIES[quest.target] ? ENEMIES[quest.target].name : quest.target;
        this.questTrackerProgress.setText(
            `Kill ${target}s: ${progress}/${quest.targetCount}`
        );

        // Draw background panel
        this.questTrackerBg.clear();
        this.questTrackerBg.fillStyle(0x000000, 0.6);
        this.questTrackerBg.fillRoundedRect(600, 8, 195, 40, 6);
    }
}
```

- [ ] **Step 4: Test manually**

Open the game, verify:
- Accept a quest from the Village Elder
- Quest tracker appears top-right showing quest name and "Kill Goblins: 0/5"
- Kill count updates as you kill goblins
- When quest completes, tracker disappears
- Big reward text shows bonus XP and Gold

- [ ] **Step 5: Commit**

```bash
cd ~/learning/realm-of-quests
git add js/scenes/UIScene.js
git commit -m "feat: add quest tracker HUD showing active quest progress"
```

---

### Task 6: Update index.html Cache Busting & Final Polish

**Why:** Bump all version numbers so browsers load the new files. Add "E to talk" to the controls hint.

**Files:**
- Modify: `index.html` — bump all `?v=N` versions
- Modify: `js/scenes/UIScene.js` — update controls hint
- Modify: `js/scenes/MenuScene.js` — add E key to controls info

- [ ] **Step 1: Bump version numbers in index.html**

Update all script tags to use new version numbers:

```html
<script src="js/systems/CombatSystem.js?v=2"></script>
<script src="js/systems/QuestManager.js?v=1"></script>
<script src="js/entities/Player.js?v=4"></script>
<script src="js/entities/Enemy.js?v=3"></script>
<script src="js/scenes/BootScene.js?v=2"></script>
<script src="js/scenes/MenuScene.js?v=2"></script>
<script src="js/scenes/GameScene.js?v=6"></script>
<script src="js/scenes/DialogScene.js?v=1"></script>
<script src="js/scenes/UIScene.js?v=6"></script>
```

- [ ] **Step 2: Update controls hint**

In `UIScene.create()`, change the controls hint text:

```js
this.controlsHint = this.add.text(400, 560, 'WASD to move | SPACE to attack | E to talk', {
```

In `MenuScene`, find the controls text and add E to talk:

```
WASD/Arrows: Move  |  SPACE: Attack  |  E: Talk
```

- [ ] **Step 3: Commit and push**

```bash
cd ~/learning/realm-of-quests
git add -A
git commit -m "feat: Phase 3 complete — quest system with NPC dialog, quest-driven spawns, bonus rewards"
```

---

## Manual Testing Checklist

After all tasks are done, test these scenarios:

1. **Map is bigger** — lots of space to walk, no enemies at start
2. **Talk to Elder** — press E near Village Elder, dialog appears with typewriter text
3. **Accept quest** — enemies start spawning far from player
4. **Kill tracking** — quest tracker shows kill progress (top-right HUD)
5. **Continuous spawns** — enemies keep spawning (max 6 alive at once)
6. **Quest complete** — all enemies poof away, bonus XP/Gold awarded (2x what you earned from kills)
7. **Decline quest** — dialog closes, no enemies spawn
8. **Shopkeeper** — press E near shopkeeper, shows greeting, no quest
9. **After quest done** — Elder says "no quest" greeting
10. **Mobile** — D-pad and attack button still work, quest tracker visible
