// Realm of Quests - Weapon Definitions
// Used in Phase 5 when we add the shop and inventory.

const WEAPONS = {
    wooden_sword: {
        name: 'Wooden Sword',
        damage: 5,
        range: 'melee',
        attackSpeed: 500,
        cost: 0,
        requiredLevel: 1,
        color: 0x8B4513,
        sound: 'slashWood'
    },
    iron_sword: {
        name: 'Iron Sword',
        damage: 10,
        range: 'melee',
        attackSpeed: 450,
        cost: 100,
        requiredLevel: 1,
        color: 0xBDC3C7,
        sound: 'slash'
    },
    steel_sword: {
        name: 'Steel Sword',
        damage: 16,
        range: 'melee',
        attackSpeed: 400,
        cost: 250,
        requiredLevel: 1,
        color: 0xECF0F1,
        sound: 'slash'
    },
    magic_staff: {
        name: 'Magic Staff',
        damage: 14,
        range: 'ranged',
        attackSpeed: 600,
        cost: 300,
        requiredLevel: 1,
        color: 0x9B59B6,
        sound: 'slashMagic'
    },
    fire_blade: {
        name: 'Fire Blade',
        damage: 22,
        range: 'melee',
        attackSpeed: 380,
        cost: 500,
        requiredLevel: 1,
        color: 0xE74C3C,
        sound: 'slashFire'
    },
    shadow_dagger: {
        name: 'Shadow Dagger',
        damage: 18,
        range: 'melee',
        attackSpeed: 300,
        cost: 400,
        requiredLevel: 1,
        color: 0x2C3E50,
        sound: 'slashDagger'
    },
    holy_sword: {
        name: 'Holy Sword',
        damage: 30,
        range: 'melee',
        attackSpeed: 350,
        cost: 1000,
        requiredLevel: 1,
        color: 0xF1C40F,
        sound: 'slashHeavy'
    },
    // === AREA 4 TIER — Desert Shop ===
    sand_scimitar: {
        name: 'Sand Scimitar',
        damage: 40,
        range: 'melee',
        attackSpeed: 370,
        cost: 2800,
        requiredLevel: 9,
        color: 0xc8a050,
        sound: 'slash'
    },
    dune_staff: {
        name: 'Dune Staff',
        damage: 36,
        range: 'ranged',
        attackSpeed: 550,
        cost: 2200,
        requiredLevel: 9,
        color: 0xd4a017,
        sound: 'slashMagic'
    },
    // === AREA 10 TIER — Shadow Shop ===
    void_blade: {
        name: 'Void Blade',
        damage: 85,
        range: 'melee',
        attackSpeed: 360,
        cost: 8000,
        requiredLevel: 19,
        color: 0x6600aa,
        sound: 'slashHeavy'
    },
    chaos_staff: {
        name: 'Chaos Staff',
        damage: 76,
        range: 'ranged',
        attackSpeed: 520,
        cost: 7000,
        requiredLevel: 19,
        color: 0xaa00aa,
        sound: 'slashMagic'
    },
    shadow_scythe: {
        name: 'Shadow Scythe',
        damage: 95,
        range: 'melee',
        attackSpeed: 400,
        cost: 12000,
        requiredLevel: 19,
        color: 0x1a0033,
        sound: 'slashHeavy'
    }
};
