// Realm of Quests - NPC Definitions
// Used in Phase 3 when we add dialog and quests.

const NPCS = {
    npc_elder: {
        name: 'Village Elder',
        area: 'area1',
        x: 8,   // Tile position
        y: 10,
        isShop: false,
        quests: ['q1_kill_goblins', 'q2_find_amulet'],
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
    npc_ranger: {
        name: 'Forest Ranger',
        area: 'area2',
        x: 10,
        y: 12,
        isShop: false,
        quests: ['q3_kill_wolves'],
        color: 0x27AE60,  // Green
        dialog: {
            greeting: 'The forest grows darker each day...',
            noQuest: 'Stay alert in these woods, traveler.'
        }
    }
};
