// Realm of Quests - Enemy Definitions
// Each enemy type has stats and behavior settings.
// We'll use these in Phase 2 when we add combat.

const ENEMIES = {
    goblin: {
        name: 'Goblin',
        hp: 20,
        attack: 4,
        defense: 1,
        speed: 70,
        detectionRange: 120,
        xpReward: 15,
        goldDrop: 5,
        color: 0x2ecc71  // Green (placeholder color until we add sprites)
    },
    slime: {
        name: 'Slime',
        hp: 15,
        attack: 3,
        defense: 0,
        speed: 40,
        detectionRange: 80,
        xpReward: 10,
        goldDrop: 3,
        color: 0x3498db  // Blue
    },
    wolf: {
        name: 'Wolf',
        hp: 35,
        attack: 8,
        defense: 2,
        speed: 100,
        detectionRange: 150,
        xpReward: 25,
        goldDrop: 8,
        color: 0x7f8c8d  // Gray
    },
    bandit: {
        name: 'Bandit',
        hp: 45,
        attack: 10,
        defense: 4,
        speed: 80,
        detectionRange: 130,
        xpReward: 35,
        goldDrop: 15,
        color: 0x8e44ad  // Purple
    }
};
