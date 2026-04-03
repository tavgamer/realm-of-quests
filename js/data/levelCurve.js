// Realm of Quests - Level Curve
// Defines how much XP is needed per level and what stats the player gets.
// "maxHP" = maximum health, "speed" = movement speed, "attack" = base damage.

const LEVEL_CURVE = {
    1:  { xpNeeded: 0,    maxHP: 50,  speed: 120, attack: 5  },
    2:  { xpNeeded: 100,  maxHP: 60,  speed: 125, attack: 6  },
    3:  { xpNeeded: 250,  maxHP: 72,  speed: 130, attack: 7  },
    4:  { xpNeeded: 450,  maxHP: 85,  speed: 135, attack: 9  },
    5:  { xpNeeded: 700,  maxHP: 100, speed: 140, attack: 11 },
    6:  { xpNeeded: 1000, maxHP: 115, speed: 145, attack: 13 },
    7:  { xpNeeded: 1400, maxHP: 130, speed: 150, attack: 15 },
    8:  { xpNeeded: 1900, maxHP: 145, speed: 155, attack: 17 },
    9:  { xpNeeded: 2500, maxHP: 160, speed: 160, attack: 19 },
    10: { xpNeeded: 3200, maxHP: 175, speed: 165, attack: 21 },
    11: { xpNeeded: 4000, maxHP: 190, speed: 168, attack: 23 },
    12: { xpNeeded: 4900, maxHP: 205, speed: 170, attack: 25 },
    13: { xpNeeded: 5900, maxHP: 220, speed: 172, attack: 27 },
    14: { xpNeeded: 7000, maxHP: 235, speed: 174, attack: 29 },
    15: { xpNeeded: 8200, maxHP: 250, speed: 176, attack: 31 },
    16: { xpNeeded: 9500, maxHP: 265, speed: 178, attack: 33 },
    17: { xpNeeded: 11000, maxHP: 280, speed: 180, attack: 35 },
    18: { xpNeeded: 12700, maxHP: 295, speed: 182, attack: 37 },
    19: { xpNeeded: 14600, maxHP: 310, speed: 184, attack: 39 },
    20: { xpNeeded: 17000, maxHP: 330, speed: 186, attack: 42 }
};

const MAX_LEVEL = 20;
