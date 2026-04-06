// Realm of Quests - Potion Definitions
// Consumable items that give instant effects.
// Unlike weapons/armor, potions can be bought multiple times.

const POTIONS = {
    health_potion: {
        name: 'Health Potion',
        description: 'Restore 50 HP',
        cost: 30,
        color: 0xe74c3c,   // Red
        effect: 'heal',
        value: 50
    },
    damage_potion: {
        name: 'Damage Potion',
        description: '+10 ATK for 30s',
        cost: 60,
        color: 0xe67e22,   // Orange
        effect: 'damage_boost',
        value: 10,
        duration: 30000     // 30 seconds in milliseconds
    },
    xp_potion: {
        name: 'XP Potion',
        description: 'Gain 50 XP instantly',
        cost: 80,
        color: 0x3498db,   // Blue
        effect: 'xp',
        value: 50
    },
    mega_health: {
        name: 'Mega Health',
        description: 'Full HP restore',
        cost: 100,
        color: 0xff1493,   // Hot pink
        effect: 'full_heal',
        value: 0
    }
};
