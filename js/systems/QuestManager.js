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
//
// BONUS REWARDS:
// The quest tracks all XP and Gold earned from kills during the quest.
// When the quest completes, the player gets that same amount AGAIN as a bonus.
// So if you earned 75 XP from killing 5 goblins, you get +75 XP bonus = 2x total!

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
        const quest = QUESTS[questId];

        // Auto-complete quests (like elder's return/explore) complete instantly
        if (quest.autoComplete) {
            this.questStates[questId] = 'rewarded';
            this.questProgress[questId] = quest.targetCount;
            this.questKillRewards[questId] = { xp: 0, gold: 0 };
            // Give rewards immediately
            this.scene.player.xp += quest.rewardXP;
            this.scene.player.gold += quest.rewardGold;
            if (this.scene.uiScene && this.scene.uiScene.showFloatingText) {
                this.scene.uiScene.showFloatingText(
                    this.scene.player.x, this.scene.player.y - 20,
                    '+' + quest.rewardXP + ' XP  +' + quest.rewardGold + ' Gold',
                    '#ffd700', 16, 2000
                );
            }
            return;
        }

        this.questStates[questId] = 'active';
        this.questProgress[questId] = 0;
        this.questKillRewards[questId] = { xp: 0, gold: 0 };

        if (quest.type === 'kill') {
            this.scene.startQuestSpawning(questId);
        } else if (quest.type === 'collect_drops') {
            // Spawn enemies so they can be killed for drops
            this.scene.startQuestSpawning(questId);
        } else if (quest.type === 'find_hidden') {
            // Place hidden items on the map
            this.scene.spawnHiddenItems(questId);
        } else if (quest.type === 'deliver') {
            // Show destination marker on the map
            this.scene.spawnDeliverDestination(questId);
        }
    }

    // Called when an enemy dies — checks kill quests and triggers item drops for collect_drops quests
    onEnemyKilled(enemyType, xpReward, goldDrop, enemyX, enemyY) {
        for (const questId in this.questStates) {
            if (this.questStates[questId] !== 'active') continue;

            const quest = QUESTS[questId];

            if (quest.type === 'kill' && quest.target === enemyType) {
                this.questProgress[questId]++;
                this.questKillRewards[questId].xp += xpReward;
                this.questKillRewards[questId].gold += goldDrop;
                if (this.scene.soundManager) this.scene.soundManager.play('goldPickup');
                if (this.questProgress[questId] >= quest.targetCount) {
                    this.completeQuest(questId);
                }
            } else if (quest.type === 'collect_drops' && quest.dropFrom === enemyType) {
                // Spawn a collectible item at the enemy's death position
                this.scene.spawnDropItem(questId, enemyX, enemyY);
            }
        }
    }

    // Called when player walks over a quest item (drop or hidden)
    onItemCollected(questId) {
        if (this.questStates[questId] !== 'active') return;

        this.questProgress[questId]++;

        const quest = QUESTS[questId];
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(
                this.scene.player.x, this.scene.player.y - 20,
                quest.itemLabel + ' collected! (' + this.questProgress[questId] + '/' + quest.targetCount + ')',
                '#ffd700', 14, 1500
            );
        }

        if (uiScene && uiScene.updateQuestTracker) {
            uiScene.updateQuestTracker(questId);
        }

        if (this.questProgress[questId] >= quest.targetCount) {
            this.completeQuest(questId);
        }
    }

    // Called by GameScene when player reaches a deliver destination
    onDeliverReached(questId) {
        if (this.questStates[questId] !== 'active') return;
        this.questProgress[questId] = 1;
        this.completeQuest(questId);
    }

    // Quest target reached — mark complete, stop spawns, kill all enemies
    completeQuest(questId) {
        this.questStates[questId] = 'complete';
        if (this.scene.soundManager) this.scene.soundManager.play('questComplete');

        const quest = QUESTS[questId];
        if (quest.type === 'kill' || quest.type === 'collect_drops') {
            this.scene.stopQuestSpawning(questId);
        }

        // Kill quests: give bonus equal to what was earned from kills (2x total)
        // All other quests: give the flat rewardXP/rewardGold from the quest definition
        let rewardXP, rewardGold;
        if (quest.type === 'kill') {
            const bonus = this.questKillRewards[questId];
            rewardXP = bonus.xp;
            rewardGold = bonus.gold;
        } else {
            rewardXP = quest.rewardXP || 0;
            rewardGold = quest.rewardGold || 0;
        }

        this.scene.player.xp += rewardXP;
        this.scene.player.gold += rewardGold;

        // Show big reward text via UIScene
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(
                this.scene.player.x, this.scene.player.y - 40,
                'QUEST COMPLETE!', '#ffd700', 22, 2000
            );
            uiScene.showFloatingText(
                this.scene.player.x, this.scene.player.y - 20,
                '+' + rewardXP + ' XP  +' + rewardGold + ' Gold', '#2ecc71', 16, 2000
            );
        }

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

    // Check if a quest is a collect-type (items picked up, not turns killed)
    isCollectQuest(questId) {
        const t = QUESTS[questId] && QUESTS[questId].type;
        return t === 'collect_drops' || t === 'find_hidden';
    }
}
