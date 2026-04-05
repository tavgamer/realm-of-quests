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
        name: 'Skeleton',
        hp: 30,
        attack: 6,
        defense: 2,
        speed: 65,
        detectionRange: 110,
        xpReward: 20,
        goldDrop: 7,
        color: 0x3498db  // Blue
    },
    wolf: {
        name: 'Sea Serpent',
        hp: 40,
        attack: 9,
        defense: 3,
        speed: 90,
        detectionRange: 140,
        xpReward: 30,
        goldDrop: 10,
        color: 0x7f8c8d  // Gray
    },
    bandit: {
        name: 'Drowned Pirate',
        hp: 55,
        attack: 12,
        defense: 5,
        speed: 75,
        detectionRange: 120,
        xpReward: 40,
        goldDrop: 18,
        color: 0x8e44ad  // Purple
    },
    pirate_king: {
        name: 'Pirate King',
        hp: 200,
        attack: 18,
        defense: 8,
        speed: 60,
        detectionRange: 200,
        xpReward: 150,
        goldDrop: 100,
        color: 0xe74c3c,  // Red
        isBoss: true,
        spriteKey: 'bandit',  // Uses bandit sprite but scaled up
        scale: 1.8
    }
};
