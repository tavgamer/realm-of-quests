// Realm of Quests - Area Definitions
// Each area is a region of the game world with its own enemies, NPCs, and level requirement.

const AREAS = {
    area1: {
        id: 'area1',
        name: 'Greenwood Village',
        requiredLevel: 1,
        width: 40,   // Map width in tiles
        height: 30,  // Map height in tiles
        enemies: ['goblin', 'slime'],
        npcs: ['npc_elder', 'npc_shopkeeper'],
        exits: [
            { to: 'area2', x: 39, y: 15, direction: 'right' }
        ],
        playerSpawn: { x: 5, y: 15 }
    },
    area2: {
        id: 'area2',
        name: 'Dark Forest',
        requiredLevel: 3,
        width: 40,
        height: 30,
        enemies: ['wolf', 'bandit'],
        npcs: ['npc_ranger'],
        exits: [
            { to: 'area1', x: 0, y: 15, direction: 'left' },
            { to: 'area3', x: 39, y: 15, direction: 'right' }
        ],
        playerSpawn: { x: 2, y: 15 }
    }
    // More areas will be added in Phase 6!
};
