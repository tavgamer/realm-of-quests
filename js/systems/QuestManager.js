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
        this.questStates[questId] = 'active';
        this.questProgress[questId] = 0;
        this.questKillRewards[questId] = { xp: 0, gold: 0 };

        // Only spawn enemies for kill-type quests
        const quest = QUESTS[questId];
        if (quest.type === 'kill') {
            this.scene.startQuestSpawning(questId);
        }
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

    // Quest target reached — mark complete, stop spawns, kill all enemies
    completeQuest(questId) {
        this.questStates[questId] = 'complete';

        // Stop spawning and kill all remaining enemies (only for kill quests)
        const quest = QUESTS[questId];
        if (quest.type === 'kill') {
            this.scene.stopQuestSpawning(questId);
        }

        // Give bonus rewards (same as what the player already earned = 2x total)
        const bonus = this.questKillRewards[questId];
        const bonusXP = bonus.xp;
        const bonusGold = bonus.gold;

        this.scene.player.xp += bonusXP;
        this.scene.player.gold += bonusGold;

        // Show big reward text via UIScene
        const uiScene = this.scene.scene.get('UI');
        if (uiScene && uiScene.showFloatingText) {
            uiScene.showFloatingText(
                this.scene.player.x, this.scene.player.y - 40,
                'QUEST COMPLETE!', '#ffd700', 22, 2000
            );
            uiScene.showFloatingText(
                this.scene.player.x, this.scene.player.y - 20,
                '+' + bonusXP + ' XP  +' + bonusGold + ' Gold', '#2ecc71', 16, 2000
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
}
