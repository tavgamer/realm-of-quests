// Realm of Quests - NPC Definitions
// Each area has a main quest giver + a side quest NPC (or shop).
// All NPCs have positions in tile coordinates.

const NPCS = {
    // === AREA 1: Greenwood Village ===
    npc_elder: {
        name: 'Village Elder',
        area: 'elder_house',
        x: 7, y: 5,
        isShop: false,
        quests: ['q1_kill_goblins', 'q2_kill_slimes', 'q_visit_brother', 'q_elder_return', 'q_elder_explore'],
        color: 0xF39C12,
        dialog: {
            greeting: 'Welcome to my home, young hero! Our village needs your help.',
            noQuest: 'You have done well. Rest for now, child.'
        }
    },
    npc_shopkeeper: {
        name: 'Shopkeeper',
        area: 'area1',
        x: 17, y: 14,
        isShop: true,
        shopType: 'weapons',
        quests: [],
        color: 0xE67E22,
        dialog: {
            greeting: 'Welcome to my shop! Take a look at my wares.',
            noQuest: 'Come back when you have some gold!'
        }
    },

    // === AREA 2: Underwater City ===
    npc_sea_elder: {
        name: 'Sea Elder',
        area: 'area2',
        x: 35, y: 25,
        isShop: false,
        quests: ['q3_kill_wolves', 'q4_kill_bandits', 'q5_serpent_horde', 'q6_pirate_captain', 'q_sea_return'],
        color: 0x2980B9,
        dialog: {
            greeting: 'Welcome to the depths, surface dweller! My brother sent you?',
            noQuest: 'The currents are calm for now. Rest, hero.'
        }
    },
    npc_sea_merchant: {
        name: 'Deep Trader',
        area: 'area2',
        x: 40, y: 28,
        isShop: true,
        shopType: 'potions',
        quests: [],
        color: 0x1ABC9C,
        dialog: {
            greeting: 'Treasures from the deep! Take a look...',
            noQuest: 'Come back with more gold, surface dweller!'
        }
    },

    // === AREA 3: Murkveil Swamp ===
    npc_swamp_witch: {
        name: 'Swamp Witch',
        area: 'area3',
        x: 40, y: 30,
        isShop: false,
        quests: ['q_swamp_lurkers', 'q_swamp_toads', 'q_swamp_boss'],
        color: 0x556b2f,
        dialog: {
            greeting: 'Hehehe... a visitor in my swamp? You look strong enough...',
            noQuest: 'The swamp whispers your name now, hero.'
        }
    },
    npc_swamp_hermit: {
        name: 'Swamp Hermit',
        area: 'area3',
        x: 15, y: 40,
        isShop: false,
        quests: ['q_swamp_side'],
        color: 0x8fbc8f,
        dialog: {
            greeting: 'You found me! Not many come this deep into the murk...',
            noQuest: 'The fog keeps me company. Thank you for visiting.'
        }
    },

    // === AREA 4: Sunscorch Desert ===
    npc_desert_chief: {
        name: 'Desert Chief',
        area: 'area4',
        x: 45, y: 30,
        isShop: false,
        quests: ['q_desert_scorpions', 'q_desert_raiders', 'q_desert_boss'],
        color: 0xd4a017,
        dialog: {
            greeting: 'Welcome to the sands, traveler. Our people are under siege.',
            noQuest: 'The desert remembers those who fight for it.'
        }
    },
    npc_desert_trader: {
        name: 'Desert Trader',
        area: 'area4',
        x: 50, y: 35,
        isShop: true,
        shopType: 'advanced_shop',
        quests: ['q_desert_side'],
        color: 0xdaa520,
        dialog: {
            greeting: 'Finest desert-forged gear — and potions to survive the wasteland!',
            noQuest: 'May the wind be at your back, traveler.'
        }
    },

    // === AREA 5: Emberpeak Volcano ===
    npc_fire_sage: {
        name: 'Fire Sage',
        area: 'area5',
        x: 40, y: 35,
        isShop: false,
        quests: ['q_volcano_imps', 'q_volcano_golems', 'q_volcano_boss'],
        color: 0xff6347,
        dialog: {
            greeting: 'The mountain burns with rage! Only a true hero can calm its fury.',
            noQuest: 'The flames bow to you now, champion.'
        }
    },
    npc_fire_smith: {
        name: 'Fire Smith',
        area: 'area5',
        x: 20, y: 45,
        isShop: false,
        quests: ['q_volcano_side'],
        color: 0xff4500,
        dialog: {
            greeting: 'I forge weapons in lava itself! But I need a favor first...',
            noQuest: 'My forge burns eternal. Visit anytime!'
        }
    },

    // === AREA 6: Frosthollow Tundra ===
    npc_frost_chief: {
        name: 'Frost Chief',
        area: 'area6',
        x: 45, y: 30,
        isShop: false,
        quests: ['q_tundra_wolves', 'q_tundra_wraiths', 'q_tundra_boss'],
        color: 0x87ceeb,
        dialog: {
            greeting: 'The cold bites deep here, outsider. But we need your warmth of courage.',
            noQuest: 'The ice respects your strength. You are welcome here.'
        }
    },
    npc_frost_hunter: {
        name: 'Frost Hunter',
        area: 'area6',
        x: 15, y: 40,
        isShop: false,
        quests: ['q_tundra_side'],
        color: 0xb0c4de,
        dialog: {
            greeting: 'I track beasts across the frozen wastes. Need a challenge?',
            noQuest: 'Happy hunting, friend.'
        }
    },

    // === AREA 7: Dreadmoor Castle ===
    npc_castle_captain: {
        name: 'Castle Captain',
        area: 'area7',
        x: 35, y: 35,
        isShop: false,
        quests: ['q_castle_knights', 'q_castle_ghosts', 'q_castle_boss'],
        color: 0x708090,
        dialog: {
            greeting: 'This castle has fallen to darkness. I am the last of the guard.',
            noQuest: 'You have restored honor to Dreadmoor. Thank you.'
        }
    },
    npc_castle_prisoner: {
        name: 'Freed Prisoner',
        area: 'area7',
        x: 55, y: 50,
        isShop: false,
        quests: ['q_castle_side'],
        color: 0xd3d3d3,
        dialog: {
            greeting: 'You freed me! The Vampire King locked me here... I know his secrets.',
            noQuest: 'Freedom is sweet. Thank you, hero!'
        }
    },

    // === AREA 8: Crystalvein Caverns ===
    npc_crystal_sage: {
        name: 'Crystal Sage',
        area: 'area8',
        x: 40, y: 35,
        isShop: false,
        quests: ['q_crystal_golems', 'q_crystal_spiders', 'q_crystal_boss'],
        color: 0x9370db,
        dialog: {
            greeting: 'The crystals sing of your arrival! But darkness corrupts them...',
            noQuest: 'The crystals shine pure once more. Well done!'
        }
    },
    npc_crystal_miner: {
        name: 'Crystal Miner',
        area: 'area8',
        x: 15, y: 50,
        isShop: false,
        quests: ['q_crystal_side'],
        color: 0xdda0dd,
        dialog: {
            greeting: 'These caves are full of treasure! But also full of danger...',
            noQuest: 'Thanks to you, I can mine in peace!'
        }
    },

    // === AREA 9: Skyreach Temple ===
    npc_sky_priest: {
        name: 'Sky Priest',
        area: 'area9',
        x: 40, y: 30,
        isShop: false,
        quests: ['q_sky_guardians', 'q_sky_hawks', 'q_sky_boss'],
        color: 0xffd700,
        dialog: {
            greeting: 'The heavens are in turmoil! The Sky Lord has gone mad with power!',
            noQuest: 'The skies are peaceful once more. Blessings upon you.'
        }
    },
    npc_sky_scholar: {
        name: 'Sky Scholar',
        area: 'area9',
        x: 60, y: 40,
        isShop: false,
        quests: ['q_sky_side'],
        color: 0xfffacd,
        dialog: {
            greeting: 'I study the ancient sky runes! There is a mystery I need help solving...',
            noQuest: 'The ancient knowledge is preserved. Thank you!'
        }
    },

    // === AREA 10: The Shadow Realm (FINAL) ===
    npc_shadow_guide: {
        name: 'Shadow Guide',
        area: 'area10',
        x: 45, y: 35,
        isShop: false,
        quests: ['q_shadow_demons', 'q_shadow_stalkers', 'q_shadow_boss'],
        color: 0x9932cc,
        dialog: {
            greeting: 'You dare enter the Shadow Realm? I am the last light in this darkness.',
            noQuest: 'You have conquered the darkness itself. You are a true legend!'
        }
    },
    npc_shadow_merchant: {
        name: 'Shadow Merchant',
        area: 'area10',
        x: 20, y: 45,
        isShop: true,
        shopType: 'elite_shop',
        quests: ['q_shadow_side'],
        color: 0x800080,
        dialog: {
            greeting: 'Only the rarest weapons survive the Shadow Realm. Can you afford them?',
            noQuest: 'Survive the darkness, and come back richer.'
        }
    }
};
