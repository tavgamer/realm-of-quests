// Realm of Quests - Area Definitions
// Each area is a region of the game world with its own enemies, NPCs, and level requirement.
// All areas connect back to area1 (Greenwood Village) as the hub.

const AREAS = {
    area1: {
        id: 'area1',
        name: 'Greenwood Village',
        requiredLevel: 1,
        width: 100,
        height: 80,
        enemies: ['goblin', 'slime'],
        npcs: ['npc_shopkeeper'],
        exits: [],
        playerSpawn: { x: 14, y: 22 }
    },
    area2: {
        id: 'area2',
        name: 'Underwater City',
        requiredLevel: 3,
        width: 70,
        height: 50,
        enemies: ['wolf', 'bandit'],
        npcs: ['npc_sea_elder', 'npc_sea_merchant'],
        exits: [],
        playerSpawn: { x: 35, y: 5 }
    },
    elder_house: {
        id: 'elder_house',
        name: "Elder's Home",
        requiredLevel: 1,
        width: 14,
        height: 12,
        enemies: [],
        npcs: ['npc_elder'],
        exits: [],
        playerSpawn: { x: 7, y: 7 }
    },
    area3: {
        id: 'area3',
        name: 'Murkveil Swamp',
        requiredLevel: 7,
        width: 80,
        height: 60,
        enemies: ['swamp_lurker', 'poison_toad'],
        npcs: ['npc_swamp_witch', 'npc_swamp_hermit'],
        exits: [],
        playerSpawn: { x: 40, y: 5 }
    },
    area4: {
        id: 'area4',
        name: 'Sunscorch Desert',
        requiredLevel: 9,
        width: 90,
        height: 60,
        enemies: ['scorpion', 'sand_raider'],
        npcs: ['npc_desert_chief', 'npc_desert_trader'],
        exits: [],
        playerSpawn: { x: 45, y: 5 }
    },
    area5: {
        id: 'area5',
        name: 'Emberpeak Volcano',
        requiredLevel: 11,
        width: 80,
        height: 70,
        enemies: ['fire_imp', 'lava_golem'],
        npcs: ['npc_fire_sage', 'npc_fire_smith'],
        exits: [],
        playerSpawn: { x: 40, y: 5 }
    },
    area6: {
        id: 'area6',
        name: 'Frosthollow Tundra',
        requiredLevel: 13,
        width: 90,
        height: 60,
        enemies: ['frost_wolf', 'ice_wraith'],
        npcs: ['npc_frost_chief', 'npc_frost_hunter'],
        exits: [],
        playerSpawn: { x: 45, y: 5 }
    },
    area7: {
        id: 'area7',
        name: 'Dreadmoor Castle',
        requiredLevel: 15,
        width: 70,
        height: 70,
        enemies: ['dark_knight', 'ghost'],
        npcs: ['npc_castle_captain', 'npc_castle_prisoner'],
        exits: [],
        playerSpawn: { x: 35, y: 5 }
    },
    area8: {
        id: 'area8',
        name: 'Crystalvein Caverns',
        requiredLevel: 16,
        width: 80,
        height: 70,
        enemies: ['crystal_golem', 'gem_spider'],
        npcs: ['npc_crystal_sage', 'npc_crystal_miner'],
        exits: [],
        playerSpawn: { x: 40, y: 5 }
    },
    area9: {
        id: 'area9',
        name: 'Skyreach Temple',
        requiredLevel: 18,
        width: 80,
        height: 60,
        enemies: ['sky_guardian', 'storm_hawk'],
        npcs: ['npc_sky_priest', 'npc_sky_scholar'],
        exits: [],
        playerSpawn: { x: 40, y: 5 }
    },
    area10: {
        id: 'area10',
        name: 'The Shadow Realm',
        requiredLevel: 19,
        width: 90,
        height: 70,
        enemies: ['shadow_demon', 'void_stalker'],
        npcs: ['npc_shadow_guide', 'npc_shadow_merchant'],
        exits: [],
        playerSpawn: { x: 45, y: 5 }
    }
};
