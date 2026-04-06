// Realm of Quests - Enemy Definitions
// Each enemy type has stats and behavior settings.
// We'll use these in Phase 2 when we add combat.

const ENEMIES = {
    goblin: {
        name: 'Goblin',
        hp: 35,
        attack: 6,
        defense: 2,
        speed: 75,
        detectionRange: 130,
        xpReward: 18,
        goldDrop: 8,
        color: 0x2ecc71
    },
    slime: {
        name: 'Skeleton',
        hp: 50,
        attack: 10,
        defense: 4,
        speed: 70,
        detectionRange: 120,
        xpReward: 25,
        goldDrop: 12,
        color: 0x3498db
    },
    wolf: {
        name: 'Sea Serpent',
        hp: 70,
        attack: 14,
        defense: 6,
        speed: 95,
        detectionRange: 150,
        xpReward: 35,
        goldDrop: 18,
        color: 0x7f8c8d
    },
    bandit: {
        name: 'Drowned Pirate',
        hp: 90,
        attack: 18,
        defense: 8,
        speed: 80,
        detectionRange: 130,
        xpReward: 50,
        goldDrop: 25,
        color: 0x8e44ad
    },
    pirate_king: {
        name: 'Pirate King',
        hp: 350,
        attack: 28,
        defense: 12,
        speed: 65,
        detectionRange: 220,
        xpReward: 200,
        goldDrop: 150,
        color: 0xe74c3c,
        isBoss: true,
        spriteKey: 'bandit',
        scale: 1.8
    }
};
