// Realm of Quests - Quest Definitions
// Used in Phase 3 when we add the quest system.

const QUESTS = {
    q1_kill_goblins: {
        id: 'q1_kill_goblins',
        name: 'Goblin Trouble',
        giver: 'npc_elder',
        area: 'area1',
        type: 'kill',
        target: 'goblin',
        targetCount: 5,
        requiredLevel: 1,
        requiredQuests: [],
        rewardXP: 50,
        rewardGold: 20,
        dialog: {
            intro: 'Goblins are raiding our farms! Please slay 5 of them.',
            progress: 'You have slain {current}/{total} goblins. Keep going!',
            complete: 'Thank you, hero! The farms are safe again.'
        }
    },
    q2_find_amulet: {
        id: 'q2_find_amulet',
        name: 'The Lost Amulet',
        giver: 'npc_elder',
        area: 'area1',
        type: 'collect',
        target: 'ancient_amulet',
        targetCount: 1,
        requiredLevel: 2,
        requiredQuests: ['q1_kill_goblins'],
        rewardXP: 80,
        rewardGold: 35,
        dialog: {
            intro: 'I lost my ancient amulet in the goblin caves. Can you find it?',
            progress: 'Have you found the amulet yet?',
            complete: 'My amulet! You truly are a hero!'
        }
    },
    q3_kill_wolves: {
        id: 'q3_kill_wolves',
        name: 'Wolf Pack',
        giver: 'npc_ranger',
        area: 'area2',
        type: 'kill',
        target: 'wolf',
        targetCount: 8,
        requiredLevel: 3,
        requiredQuests: [],
        rewardXP: 120,
        rewardGold: 50,
        dialog: {
            intro: 'A pack of wolves is terrorizing travelers. Eliminate 8 of them.',
            progress: 'Wolves defeated: {current}/{total}. The forest thanks you.',
            complete: 'The wolf threat is over. You have my gratitude!'
        }
    }
};
