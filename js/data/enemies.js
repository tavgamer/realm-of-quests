// Realm of Quests - Enemy Definitions
// Each enemy type has stats and behavior settings.
// Stats scale with area progression. Each area has 2 regular enemies + 1 boss.

const ENEMIES = {
    // === AREA 1: Greenwood Village ===
    goblin: {
        name: 'Goblin',
        hp: 35, attack: 6, defense: 2, speed: 75,
        detectionRange: 130, xpReward: 18, goldDrop: 8,
        spriteKey: 'goblin'
    },
    slime: {
        name: 'Skeleton',
        hp: 50, attack: 10, defense: 4, speed: 70,
        detectionRange: 120, xpReward: 25, goldDrop: 12,
        spriteKey: 'slime'
    },

    // === AREA 2: Underwater City ===
    wolf: {
        name: 'Sea Serpent',
        hp: 70, attack: 14, defense: 6, speed: 95,
        detectionRange: 150, xpReward: 35, goldDrop: 18,
        spriteKey: 'wolf'
    },
    bandit: {
        name: 'Drowned Pirate',
        hp: 90, attack: 18, defense: 8, speed: 80,
        detectionRange: 130, xpReward: 50, goldDrop: 25,
        spriteKey: 'bandit'
    },
    pirate_king: {
        name: 'Pirate King',
        hp: 350, attack: 28, defense: 12, speed: 65,
        detectionRange: 220, xpReward: 200, goldDrop: 150,
        color: 0xe74c3c, isBoss: true, spriteKey: 'e04', scale: 1.8
    },

    // === AREA 3: Murkveil Swamp ===
    swamp_lurker: {
        name: 'Swamp Lurker',
        hp: 110, attack: 22, defense: 10, speed: 65,
        detectionRange: 140, xpReward: 60, goldDrop: 30,
        spriteKey: 'swamp_lurker'
    },
    poison_toad: {
        name: 'Poison Toad',
        hp: 100, attack: 26, defense: 9, speed: 90,
        detectionRange: 120, xpReward: 55, goldDrop: 28,
        spriteKey: 'poison_toad'
    },
    swamp_beast: {
        name: 'Swamp Beast',
        hp: 500, attack: 38, defense: 18, speed: 55,
        detectionRange: 200, xpReward: 350, goldDrop: 200,
        isBoss: true, spriteKey: 'swamp_beast', scale: 2.0
    },

    // === AREA 4: Sunscorch Desert ===
    scorpion: {
        name: 'Giant Scorpion',
        hp: 130, attack: 30, defense: 12, speed: 85,
        detectionRange: 140, xpReward: 75, goldDrop: 38,
        spriteKey: 'scorpion'
    },
    sand_raider: {
        name: 'Sand Raider',
        hp: 150, attack: 30, defense: 14, speed: 80,
        detectionRange: 130, xpReward: 80, goldDrop: 40,
        spriteKey: 'sand_raider'
    },
    sand_worm: {
        name: 'Sand Worm',
        hp: 650, attack: 45, defense: 20, speed: 50,
        detectionRange: 200, xpReward: 500, goldDrop: 280,
        color: 0xb8924a, isBoss: true, spriteKey: 'e10', scale: 2.2  // heavy golem blob + sand tint
    },

    // === AREA 5: Emberpeak Volcano ===
    fire_imp: {
        name: 'Fire Imp',
        hp: 160, attack: 35, defense: 16, speed: 100,
        detectionRange: 150, xpReward: 90, goldDrop: 45,
        spriteKey: 'fire_imp'
    },
    lava_golem: {
        name: 'Lava Golem',
        hp: 210, attack: 33, defense: 23, speed: 55,
        detectionRange: 120, xpReward: 100, goldDrop: 50,
        spriteKey: 'lava_golem'
    },
    fire_dragon: {
        name: 'Fire Dragon',
        hp: 800, attack: 52, defense: 26, speed: 60,
        detectionRange: 250, xpReward: 650, goldDrop: 350,
        isBoss: true, spriteKey: 'fire_dragon', scale: 2.5
    },

    // === AREA 6: Frosthollow Tundra ===
    frost_wolf: {
        name: 'Frost Wolf',
        hp: 225, attack: 42, defense: 25, speed: 110,
        detectionRange: 160, xpReward: 110, goldDrop: 55,
        spriteKey: 'frost_wolf'
    },
    ice_wraith: {
        name: 'Ice Wraith',
        hp: 215, attack: 46, defense: 23, speed: 90,
        detectionRange: 140, xpReward: 115, goldDrop: 58,
        spriteKey: 'e11'            // e11: blue ethereal spirit — perfect Ice Wraith
    },
    ice_giant: {
        name: 'Ice Giant',
        hp: 950, attack: 60, defense: 32, speed: 45,
        detectionRange: 220, xpReward: 800, goldDrop: 420,
        isBoss: true, spriteKey: 'ice_giant', scale: 2.5
    },

    // === AREA 7: Dreadmoor Castle ===
    dark_knight: {
        name: 'Dark Knight',
        hp: 270, attack: 50, defense: 30, speed: 70,
        detectionRange: 140, xpReward: 130, goldDrop: 65,
        spriteKey: 'dark_knight'
    },
    ghost: {
        name: 'Wailing Ghost',
        hp: 250, attack: 46, defense: 28, speed: 95,
        detectionRange: 160, xpReward: 125, goldDrop: 60,
        spriteKey: 'e09'            // e09: classic ghost with hat — perfect Ghost
    },
    vampire_king: {
        name: 'Vampire King',
        hp: 1100, attack: 68, defense: 38, speed: 70,
        detectionRange: 250, xpReward: 950, goldDrop: 500,
        color: 0x8b0000, isBoss: true, spriteKey: 'e05', scale: 2.3  // dark armored + blood red
    },

    // === AREA 8: Crystalvein Caverns ===
    crystal_golem: {
        name: 'Crystal Golem',
        hp: 330, attack: 58, defense: 36, speed: 50,
        detectionRange: 130, xpReward: 150, goldDrop: 75,
        spriteKey: 'crystal_golem'
    },
    gem_spider: {
        name: 'Gem Spider',
        hp: 300, attack: 62, defense: 32, speed: 105,
        detectionRange: 150, xpReward: 145, goldDrop: 70,
        spriteKey: 'gem_spider'
    },
    crystal_dragon: {
        name: 'Crystal Dragon',
        hp: 1300, attack: 78, defense: 48, speed: 55,
        detectionRange: 250, xpReward: 1100, goldDrop: 600,
        color: 0x9370db, isBoss: true, spriteKey: 'e10', scale: 2.5
    },

    // === AREA 9: Skyreach Temple ===
    sky_guardian: {
        name: 'Sky Guardian',
        hp: 380, attack: 68, defense: 42, speed: 85,
        detectionRange: 160, xpReward: 170, goldDrop: 85,
        spriteKey: 'guardian'
    },
    storm_hawk: {
        name: 'Storm Hawk',
        hp: 350, attack: 72, defense: 38, speed: 120,
        detectionRange: 170, xpReward: 165, goldDrop: 80,
        spriteKey: 'storm_hawk'
    },
    sky_lord: {
        name: 'Sky Lord',
        hp: 1500, attack: 88, defense: 55, speed: 65,
        detectionRange: 260, xpReward: 1300, goldDrop: 700,
        isBoss: true, spriteKey: 'sky_lord', scale: 2.5
    },

    // === AREA 10: The Shadow Realm (FINAL) ===
    shadow_demon: {
        name: 'Shadow Demon',
        hp: 430, attack: 78, defense: 46, speed: 90,
        detectionRange: 170, xpReward: 200, goldDrop: 100,
        spriteKey: 'shadow_demon'
    },
    void_stalker: {
        name: 'Void Stalker',
        hp: 400, attack: 82, defense: 42, speed: 110,
        detectionRange: 180, xpReward: 195, goldDrop: 95,
        spriteKey: 'e12'            // e12: purple ghost — Void Stalker
    },
    dark_lord: {
        name: 'The Dark Lord',
        hp: 2000, attack: 100, defense: 65, speed: 60,
        detectionRange: 280, xpReward: 2000, goldDrop: 1000,
        isBoss: true, spriteKey: 'dark_lord', scale: 3.0
    }
};
