// Realm of Quests - NPC Definitions
// Used in Phase 3 when we add dialog and quests.

const NPCS = {
    npc_elder: {
        name: 'Village Elder',
        area: 'area1',
        x: 8,   // Tile position
        y: 10,
        isShop: false,
        quests: ['q1_kill_goblins', 'q2_kill_slimes', 'q_visit_brother'],
        color: 0xF39C12,  // Orange
        dialog: {
            greeting: 'Welcome, young hero! Our village needs your help.',
            noQuest: 'You have done well. Rest for now.'
        }
    },
    npc_shopkeeper: {
        name: 'Shopkeeper',
        area: 'area1',
        x: 15,
        y: 8,
        isShop: true,
        quests: [],
        color: 0xE67E22,  // Dark orange
        dialog: {
            greeting: 'Welcome to my shop! Take a look at my wares.',
            noQuest: 'Come back when you have some gold!'
        }
    },
    npc_sea_elder: {
        name: 'Sea Elder',
        area: 'area2',
        x: 35,
        y: 25,
        isShop: false,
        quests: ['q3_kill_wolves', 'q4_kill_bandits', 'q5_serpent_horde', 'q6_pirate_captain'],
        color: 0x2980B9,  // Ocean blue
        dialog: {
            greeting: 'Welcome to the depths, surface dweller! My brother sent you?',
            noQuest: 'The currents are calm for now. Rest, hero.'
        }
    }
};
