// Realm of Quests - Area Definitions
// Each area is a region of the game world with its own enemies, NPCs, and level requirement.

const AREAS = {
    area1: {
        id: 'area1',
        name: 'Greenwood Village',
        requiredLevel: 1,
        width: 80,   // Map width in tiles (was 40)
        height: 60,  // Map height in tiles (was 30)
        enemies: ['goblin', 'slime'],
        npcs: ['npc_elder', 'npc_shopkeeper'],
        exits: [
            { to: 'area2', x: 79, y: 30, direction: 'right' }
        ],
        playerSpawn: { x: 10, y: 30 }
    },
    area2: {
        id: 'area2',
        name: 'Underwater City',
        requiredLevel: 3,
        width: 70,
        height: 50,
        enemies: ['wolf', 'bandit'],
        npcs: ['npc_sea_elder'],
        exits: [
            { to: 'area1', x: 35, y: 2, direction: 'up' }
        ],
        playerSpawn: { x: 35, y: 5 }
    }
};
