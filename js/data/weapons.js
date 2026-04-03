// Realm of Quests - Weapon Definitions
// Used in Phase 5 when we add the shop and inventory.

const WEAPONS = {
    wooden_sword: {
        name: 'Wooden Sword',
        damage: 5,
        range: 'melee',
        attackSpeed: 500,  // milliseconds between attacks
        cost: 0,           // Free! Player starts with this
        requiredLevel: 1,
        color: 0x8B4513    // Brown
    },
    iron_sword: {
        name: 'Iron Sword',
        damage: 10,
        range: 'melee',
        attackSpeed: 450,
        cost: 50,
        requiredLevel: 3,
        color: 0xBDC3C7    // Silver
    },
    steel_sword: {
        name: 'Steel Sword',
        damage: 16,
        range: 'melee',
        attackSpeed: 400,
        cost: 120,
        requiredLevel: 6,
        color: 0xECF0F1    // Light silver
    },
    magic_staff: {
        name: 'Magic Staff',
        damage: 14,
        range: 'ranged',
        attackSpeed: 600,
        cost: 150,
        requiredLevel: 5,
        color: 0x9B59B6    // Purple
    },
    fire_blade: {
        name: 'Fire Blade',
        damage: 22,
        range: 'melee',
        attackSpeed: 380,
        cost: 250,
        requiredLevel: 10,
        color: 0xE74C3C    // Red
    },
    shadow_dagger: {
        name: 'Shadow Dagger',
        damage: 18,
        range: 'melee',
        attackSpeed: 300,
        cost: 200,
        requiredLevel: 8,
        color: 0x2C3E50    // Dark blue
    },
    holy_sword: {
        name: 'Holy Sword',
        damage: 30,
        range: 'melee',
        attackSpeed: 350,
        cost: 500,
        requiredLevel: 15,
        color: 0xF1C40F    // Gold
    }
};
