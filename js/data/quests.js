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
    q2_kill_slimes: {
        id: 'q2_kill_slimes',
        name: 'Bone Rattlers',
        giver: 'npc_elder',
        area: 'area1',
        type: 'kill',
        target: 'slime',
        targetCount: 5,
        requiredLevel: 2,
        requiredQuests: ['q1_kill_goblins'],
        rewardXP: 80,
        rewardGold: 35,
        dialog: {
            intro: 'Skeletons have risen from the old graveyard! They are stronger than goblins. Destroy 5 of them.',
            progress: 'You have destroyed {current}/{total} skeletons. Keep going!',
            complete: 'The skeletons have been laid to rest. You are brave indeed!'
        }
    },
    q_visit_brother: {
        id: 'q_visit_brother',
        name: 'The Deep Below',
        giver: 'npc_elder',
        area: 'area1',
        type: 'talk',
        target: 'npc_sea_elder',
        targetCount: 1,
        requiredLevel: 3,
        requiredQuests: ['q2_kill_slimes'],
        rewardXP: 100,
        rewardGold: 50,
        dialog: {
            intro: 'My brother lives beneath the waters... An ancient city hidden below a pond in our lands. Find the hidden pond and step into the water. He needs your help too!',
            progress: 'Have you found the pond yet? Look carefully among the trees...',
            complete: 'You found him! Thank you, brave hero.'
        }
    },
    q3_kill_wolves: {
        id: 'q3_kill_wolves',
        name: 'Serpent Swarm',
        giver: 'npc_sea_elder',
        area: 'area2',
        type: 'kill',
        target: 'wolf',
        targetCount: 6,
        requiredLevel: 3,
        requiredQuests: [],
        rewardXP: 150,
        rewardGold: 60,
        dialog: {
            intro: 'Sea Serpents are invading our city from the deep trenches! Slay 6 of them.',
            progress: 'Serpents slain: {current}/{total}. The waters grow calmer.',
            complete: 'The serpents retreat! You fight well for a surface dweller.'
        }
    },
    q4_kill_bandits: {
        id: 'q4_kill_bandits',
        name: 'Pirate Menace',
        giver: 'npc_sea_elder',
        area: 'area2',
        type: 'kill',
        target: 'bandit',
        targetCount: 5,
        requiredLevel: 4,
        requiredQuests: ['q3_kill_wolves'],
        rewardXP: 200,
        rewardGold: 80,
        dialog: {
            intro: 'Drowned Pirates haunt our ruins, stealing ancient treasures. Destroy 5 of them!',
            progress: 'Pirates defeated: {current}/{total}. Their captain grows weaker.',
            complete: 'The pirates are vanquished! You are a true hero of the deep!'
        }
    },
    q5_serpent_horde: {
        id: 'q5_serpent_horde',
        name: 'Serpent Horde',
        giver: 'npc_sea_elder',
        area: 'area2',
        type: 'kill',
        target: 'wolf',
        targetCount: 10,
        requiredLevel: 5,
        requiredQuests: ['q4_kill_bandits'],
        rewardXP: 300,
        rewardGold: 120,
        difficulty: 1.5,  // Enemies are 1.5x stronger
        dialog: {
            intro: 'The serpents have regrouped! A massive horde approaches from the abyss. These ones are bigger and meaner. Slay 10!',
            progress: 'Serpents destroyed: {current}/{total}. The horde thins!',
            complete: 'Incredible! The horde has been shattered. You are a legend of the deep!'
        }
    },
    q6_pirate_captain: {
        id: 'q6_pirate_captain',
        name: 'The Pirate King',
        giver: 'npc_sea_elder',
        area: 'area2',
        type: 'kill',
        target: 'pirate_king',
        targetCount: 1,
        requiredLevel: 6,
        requiredQuests: ['q5_serpent_horde'],
        rewardXP: 500,
        rewardGold: 200,
        minions: 'bandit',  // Also spawns these as minions
        dialog: {
            intro: 'The Pirate King himself has risen from the depths! He is massive and deadly. His crew fights beside him. DEFEAT THE PIRATE KING!',
            progress: 'The Pirate King still lives! Keep fighting!',
            complete: 'THE PIRATE KING IS DEFEATED! The Underwater City is forever in your debt, hero!'
        }
    }
};
