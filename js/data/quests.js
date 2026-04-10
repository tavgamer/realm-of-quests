// Realm of Quests - Quest Definitions
// Flow: Area quests → boss → return to elder → elder sends to next area
// Each area has: 2-3 kill quests + 1 boss + 1 side quest

const QUESTS = {
    // =============================================
    // AREA 1: Greenwood Village (Elder's quests)
    // =============================================
    q1_kill_goblins: {
        id: 'q1_kill_goblins', name: 'Goblin Trouble',
        giver: 'npc_elder', area: 'area1', type: 'kill',
        target: 'goblin', targetCount: 5,
        requiredLevel: 1, requiredQuests: [],
        rewardXP: 50, rewardGold: 20,
        dialog: {
            intro: 'Goblins are raiding our farms! Please slay 5 of them.',
            progress: 'You have slain {current}/{total} goblins. Keep going!',
            complete: 'Thank you, hero! The farms are safe again.'
        }
    },
    q2_kill_slimes: {
        id: 'q2_kill_slimes', name: 'Bone Rattlers',
        giver: 'npc_elder', area: 'area1', type: 'kill',
        target: 'slime', targetCount: 5,
        requiredLevel: 2, requiredQuests: ['q1_kill_goblins'],
        rewardXP: 80, rewardGold: 35,
        dialog: {
            intro: 'Skeletons have risen from the old graveyard! Destroy 5 of them.',
            progress: 'You have destroyed {current}/{total} skeletons. Keep going!',
            complete: 'The skeletons have been laid to rest. You are brave indeed!'
        }
    },
    q_visit_brother: {
        id: 'q_visit_brother', name: 'The Deep Below',
        giver: 'npc_elder', area: 'area1', type: 'talk',
        target: 'npc_sea_elder', targetCount: 1,
        requiredLevel: 3, requiredQuests: ['q2_kill_slimes'],
        rewardXP: 100, rewardGold: 50,
        dialog: {
            intro: 'My brother lives beneath the waters... Find the hidden pond in the jungle and step into the water. He needs your help!',
            progress: 'Have you found the pond yet? Look carefully in the jungle...',
            complete: 'You found him! Thank you, brave hero.'
        }
    },

    // =============================================
    // AREA 2: Underwater City (Sea Elder's quests)
    // =============================================
    q3_kill_wolves: {
        id: 'q3_kill_wolves', name: 'Serpent Swarm',
        giver: 'npc_sea_elder', area: 'area2', type: 'kill',
        target: 'wolf', targetCount: 6,
        requiredLevel: 3, requiredQuests: [],
        rewardXP: 150, rewardGold: 60,
        dialog: {
            intro: 'Sea Serpents are invading our city! Slay 6 of them.',
            progress: 'Serpents slain: {current}/{total}. The waters grow calmer.',
            complete: 'The serpents retreat! You fight well for a surface dweller.'
        }
    },
    q4_kill_bandits: {
        id: 'q4_kill_bandits', name: 'Pirate Menace',
        giver: 'npc_sea_elder', area: 'area2', type: 'kill',
        target: 'bandit', targetCount: 5,
        requiredLevel: 4, requiredQuests: ['q3_kill_wolves'],
        rewardXP: 200, rewardGold: 80,
        dialog: {
            intro: 'Drowned Pirates haunt our ruins! Destroy 5 of them!',
            progress: 'Pirates defeated: {current}/{total}.',
            complete: 'The pirates are vanquished!'
        }
    },
    q5_serpent_horde: {
        id: 'q5_serpent_horde', name: 'Serpent Horde',
        giver: 'npc_sea_elder', area: 'area2', type: 'kill',
        target: 'wolf', targetCount: 10,
        requiredLevel: 5, requiredQuests: ['q4_kill_bandits'],
        rewardXP: 300, rewardGold: 120, difficulty: 1.5,
        dialog: {
            intro: 'A massive horde of bigger, meaner serpents approaches! Slay 10!',
            progress: 'Serpents destroyed: {current}/{total}. The horde thins!',
            complete: 'The horde has been shattered!'
        }
    },
    q6_pirate_captain: {
        id: 'q6_pirate_captain', name: 'The Pirate King',
        giver: 'npc_sea_elder', area: 'area2', type: 'kill',
        target: 'pirate_king', targetCount: 1,
        requiredLevel: 6, requiredQuests: ['q5_serpent_horde'],
        rewardXP: 500, rewardGold: 200, minions: 'bandit',
        dialog: {
            intro: 'The Pirate King himself has risen! DEFEAT HIM!',
            progress: 'The Pirate King still lives! Keep fighting!',
            complete: 'THE PIRATE KING IS DEFEATED! Now, hero — return to my brother, the Village Elder. Tell him of your victory!'
        }
    },
    // After area2 boss, Sea Elder tells you to return to Village Elder
    q_sea_return: {
        id: 'q_sea_return', name: 'Return to the Elder',
        giver: 'npc_sea_elder', area: 'area2', type: 'talk',
        target: 'npc_elder', targetCount: 1,
        requiredLevel: 6, requiredQuests: ['q6_pirate_captain'],
        rewardXP: 200, rewardGold: 100,
        dialog: {
            intro: 'Go back to the surface. Visit my brother, the Village Elder. He will be proud of you!',
            progress: 'Return to the Village Elder in Greenwood Village.',
            complete: 'You made it back!'
        }
    },

    // Elder sends you exploring after area2
    q_elder_return: {
        id: 'q_elder_return', name: 'A Hero Returns',
        giver: 'npc_elder', area: 'elder_house', type: 'talk',
        target: 'npc_elder', targetCount: 1,
        requiredLevel: 7, requiredQuests: ['q_sea_return'],
        rewardXP: 500, rewardGold: 300,
        autoComplete: true,  // Completes instantly when you talk to him
        dialog: {
            intro: 'You defeated the Pirate King?! Incredible! I always knew you had greatness in you. Take this reward — you have earned it!',
            progress: '',
            complete: 'I am so proud of you, child!'
        }
    },
    q_elder_explore: {
        id: 'q_elder_explore', name: 'Explore the Lands',
        giver: 'npc_elder', area: 'elder_house', type: 'talk',
        target: 'npc_elder', targetCount: 1,
        requiredLevel: 7, requiredQuests: ['q_elder_return'],
        rewardXP: 100, rewardGold: 50,
        autoComplete: true,
        dialog: {
            intro: 'There are portals scattered around our lands that lead to distant realms. Explore them all and make the name of Greenwood proud! Start with the swamp portal to the west...',
            progress: '',
            complete: 'Go forth, hero! The world awaits!'
        }
    },

    // =============================================
    // AREA 3: Murkveil Swamp
    // =============================================
    q_swamp_lurkers: {
        id: 'q_swamp_lurkers', name: 'Lurkers in the Mist',
        giver: 'npc_swamp_witch', area: 'area3', type: 'kill',
        target: 'swamp_lurker', targetCount: 6,
        requiredLevel: 7, requiredQuests: [],
        rewardXP: 400, rewardGold: 150,
        dialog: {
            intro: 'Swamp Lurkers are poisoning my herbs! Kill 6 of the slimy things!',
            progress: 'Lurkers slain: {current}/{total}. The swamp clears...',
            complete: 'My herbs are safe! You are not as useless as you look, hehehe.'
        }
    },
    q_swamp_toads: {
        id: 'q_swamp_toads', name: 'Toxic Terror',
        giver: 'npc_swamp_witch', area: 'area3', type: 'kill',
        target: 'poison_toad', targetCount: 8,
        requiredLevel: 8, requiredQuests: ['q_swamp_lurkers'],
        rewardXP: 500, rewardGold: 180,
        dialog: {
            intro: 'Giant Poison Toads are breeding like mad! Squash 8 of them!',
            progress: 'Toads squashed: {current}/{total}.',
            complete: 'The swamp breathes easier. Good work!'
        }
    },
    q_swamp_boss: {
        id: 'q_swamp_boss', name: 'The Swamp Beast',
        giver: 'npc_swamp_witch', area: 'area3', type: 'kill',
        target: 'swamp_beast', targetCount: 1,
        requiredLevel: 8, requiredQuests: ['q_swamp_toads'],
        rewardXP: 800, rewardGold: 300, minions: 'swamp_lurker',
        dialog: {
            intro: 'The Swamp Beast — ancient, massive, and angry! It controls all the creatures here. DESTROY IT!',
            progress: 'The Swamp Beast still lurks!',
            complete: 'THE SWAMP BEAST IS SLAIN! The swamp is free!'
        }
    },
    q_swamp_side: {
        id: 'q_swamp_side', name: 'Swamp Witch\'s Brew',
        giver: 'npc_swamp_hermit', area: 'area3', type: 'collect_drops',
        dropFrom: 'poison_toad', dropItem: 'toad_slime', targetCount: 3,
        requiredLevel: 7, requiredQuests: [],
        rewardXP: 300, rewardGold: 120,
        itemLabel: 'Toad Slime',
        dialog: {
            intro: 'I need 3 globs of Toad Slime for my potion. Kill the Poison Toads — slime drops when they die. Bring me 3!',
            progress: 'Slime collected: {current}/{total}. Pick up the glowing drops!',
            complete: 'Perfect consistency! My brew will be legendary. Take this reward!'
        }
    },

    // =============================================
    // AREA 4: Sunscorch Desert
    // =============================================
    q_desert_scorpions: {
        id: 'q_desert_scorpions', name: 'Scorpion Plague',
        giver: 'npc_desert_chief', area: 'area4', type: 'kill',
        target: 'scorpion', targetCount: 7,
        requiredLevel: 9, requiredQuests: [],
        rewardXP: 600, rewardGold: 220,
        dialog: {
            intro: 'Giant Scorpions are attacking our caravans! Kill 7 of them!',
            progress: 'Scorpions crushed: {current}/{total}.',
            complete: 'The trade routes are safe again!'
        }
    },
    q_desert_raiders: {
        id: 'q_desert_raiders', name: 'Desert Bandits',
        giver: 'npc_desert_chief', area: 'area4', type: 'kill',
        target: 'sand_raider', targetCount: 6,
        requiredLevel: 10, requiredQuests: ['q_desert_scorpions'],
        rewardXP: 700, rewardGold: 260,
        dialog: {
            intro: 'Sand Raiders pillage our villages at night! Defeat 6 of them!',
            progress: 'Raiders defeated: {current}/{total}.',
            complete: 'The raiders flee! Our people are safe!'
        }
    },
    q_desert_boss: {
        id: 'q_desert_boss', name: 'The Sand Worm',
        giver: 'npc_desert_chief', area: 'area4', type: 'kill',
        target: 'sand_worm', targetCount: 1,
        requiredLevel: 10, requiredQuests: ['q_desert_raiders'],
        rewardXP: 1000, rewardGold: 400, minions: 'scorpion',
        dialog: {
            intro: 'The Great Sand Worm burrows beneath our land! It is enormous and deadly. SLAY IT!',
            progress: 'The Sand Worm still burrows!',
            complete: 'THE SAND WORM IS DEAD! The desert belongs to us again!'
        }
    },
    q_desert_side: {
        id: 'q_desert_side', name: 'Lost Caravan Coins',
        giver: 'npc_desert_trader', area: 'area4', type: 'find_hidden',
        hiddenItems: [
            { tx: 12, ty: 18 }, { tx: 55, ty: 8 }, { tx: 38, ty: 52 }
        ],
        dropItem: 'ancient_coin', targetCount: 3,
        requiredLevel: 9, requiredQuests: [],
        rewardXP: 400, rewardGold: 180,
        itemLabel: 'Ancient Coin',
        dialog: {
            intro: 'A caravan was buried by a sandstorm years ago. Three ancient gold coins are scattered across this desert. Find them — they glow in the sand!',
            progress: 'Coins found: {current}/{total}. Keep exploring!',
            complete: 'These are worth a fortune! Half for you, half for me!'
        }
    },

    // =============================================
    // AREA 5: Emberpeak Volcano
    // =============================================
    q_volcano_imps: {
        id: 'q_volcano_imps', name: 'Infernal Imps',
        giver: 'npc_fire_sage', area: 'area5', type: 'kill',
        target: 'fire_imp', targetCount: 8,
        requiredLevel: 11, requiredQuests: [],
        rewardXP: 800, rewardGold: 300,
        dialog: {
            intro: 'Fire Imps are swarming from the crater! Burn 8 of them! ...Wait, they are fire. Just kill them!',
            progress: 'Imps slain: {current}/{total}.',
            complete: 'The imp swarm retreats!'
        }
    },
    q_volcano_golems: {
        id: 'q_volcano_golems', name: 'Lava Walkers',
        giver: 'npc_fire_sage', area: 'area5', type: 'kill',
        target: 'lava_golem', targetCount: 5,
        requiredLevel: 12, requiredQuests: ['q_volcano_imps'],
        rewardXP: 900, rewardGold: 350, difficulty: 1.3,
        dialog: {
            intro: 'Lava Golems guard the path to the dragon. Smash 5 of them!',
            progress: 'Golems shattered: {current}/{total}.',
            complete: 'The path to the peak is open!'
        }
    },
    q_volcano_boss: {
        id: 'q_volcano_boss', name: 'The Fire Dragon',
        giver: 'npc_fire_sage', area: 'area5', type: 'kill',
        target: 'fire_dragon', targetCount: 1,
        requiredLevel: 12, requiredQuests: ['q_volcano_golems'],
        rewardXP: 1400, rewardGold: 550, minions: 'fire_imp',
        dialog: {
            intro: 'THE FIRE DRAGON awaits at the peak! It has terrorized these lands for centuries. END ITS REIGN!',
            progress: 'The dragon still breathes fire!',
            complete: 'THE FIRE DRAGON IS SLAIN! The volcano grows calm!'
        }
    },
    q_volcano_side: {
        id: 'q_volcano_side', name: 'The Offering Shrine',
        giver: 'npc_fire_smith', area: 'area5', type: 'deliver',
        destination: { tx: 55, ty: 10 },
        destinationLabel: 'the Ancient Shrine',
        dropItem: 'forged_blade', targetCount: 1,
        requiredLevel: 11, requiredQuests: [],
        rewardXP: 500, rewardGold: 250,
        dialog: {
            intro: 'I forged this blade as an offering to the volcano spirits. But I cannot leave my forge unguarded! Take it to the Ancient Shrine in the north of this land.',
            progress: 'Carry the blade to the Ancient Shrine in the north!',
            complete: 'The spirits accepted the offering! I can feel the volcano\'s anger cooling. Thank you!'
        }
    },

    // =============================================
    // AREA 6: Frosthollow Tundra
    // =============================================
    q_tundra_wolves: {
        id: 'q_tundra_wolves', name: 'Frozen Fangs',
        giver: 'npc_frost_chief', area: 'area6', type: 'kill',
        target: 'frost_wolf', targetCount: 7,
        requiredLevel: 13, requiredQuests: [],
        rewardXP: 1000, rewardGold: 380,
        dialog: {
            intro: 'Frost Wolves are hunting our people! Kill 7 of the beasts!',
            progress: 'Wolves hunted: {current}/{total}.',
            complete: 'The pack scatters! Our people can leave camp again.'
        }
    },
    q_tundra_wraiths: {
        id: 'q_tundra_wraiths', name: 'Frozen Spirits',
        giver: 'npc_frost_chief', area: 'area6', type: 'kill',
        target: 'ice_wraith', targetCount: 6,
        requiredLevel: 14, requiredQuests: ['q_tundra_wolves'],
        rewardXP: 1100, rewardGold: 420, difficulty: 1.3,
        dialog: {
            intro: 'Ice Wraiths haunt the frozen lake! Destroy 6 of them!',
            progress: 'Wraiths banished: {current}/{total}.',
            complete: 'The spirits rest. The ice is safe to cross again.'
        }
    },
    q_tundra_boss: {
        id: 'q_tundra_boss', name: 'The Ice Giant',
        giver: 'npc_frost_chief', area: 'area6', type: 'kill',
        target: 'ice_giant', targetCount: 1,
        requiredLevel: 14, requiredQuests: ['q_tundra_wraiths'],
        rewardXP: 1800, rewardGold: 700, minions: 'frost_wolf',
        dialog: {
            intro: 'The ICE GIANT has awoken from its thousand-year slumber! It will freeze the entire world if not stopped!',
            progress: 'The Ice Giant still stands!',
            complete: 'THE ICE GIANT FALLS! Spring may come at last!'
        }
    },
    q_tundra_side: {
        id: 'q_tundra_side', name: 'The Hunter\'s Trophy',
        giver: 'npc_frost_hunter', area: 'area6', type: 'collect_drops',
        dropFrom: 'frost_wolf', dropItem: 'wolf_pelt', targetCount: 4,
        requiredLevel: 13, requiredQuests: [],
        rewardXP: 800, rewardGold: 350,
        itemLabel: 'Wolf Pelt',
        dialog: {
            intro: 'The finest wolf pelts in the tundra are my trophies. Bring me 4 Frost Wolf pelts — they drop from the wolves when slain. I will make you a cloak worthy of a legend!',
            progress: 'Pelts collected: {current}/{total}. Pick up the glowing drops!',
            complete: 'Magnificent pelts! I will craft you something special. Here is your payment!'
        }
    },

    // =============================================
    // AREA 7: Dreadmoor Castle
    // =============================================
    q_castle_knights: {
        id: 'q_castle_knights', name: 'Dark Garrison',
        giver: 'npc_castle_captain', area: 'area7', type: 'kill',
        target: 'dark_knight', targetCount: 6,
        requiredLevel: 15, requiredQuests: [],
        rewardXP: 1200, rewardGold: 460,
        dialog: {
            intro: 'My former brothers-in-arms have been corrupted! Defeat 6 Dark Knights!',
            progress: 'Knights defeated: {current}/{total}.',
            complete: 'Their souls are free from the curse.'
        }
    },
    q_castle_ghosts: {
        id: 'q_castle_ghosts', name: 'Haunted Halls',
        giver: 'npc_castle_captain', area: 'area7', type: 'kill',
        target: 'ghost', targetCount: 8,
        requiredLevel: 15, requiredQuests: ['q_castle_knights'],
        rewardXP: 1300, rewardGold: 500, difficulty: 1.3,
        dialog: {
            intro: 'Wailing Ghosts fill the castle halls! Banish 8 of them!',
            progress: 'Ghosts banished: {current}/{total}.',
            complete: 'The halls are quiet at last.'
        }
    },
    q_castle_boss: {
        id: 'q_castle_boss', name: 'The Vampire King',
        giver: 'npc_castle_captain', area: 'area7', type: 'kill',
        target: 'vampire_king', targetCount: 1,
        requiredLevel: 16, requiredQuests: ['q_castle_ghosts'],
        rewardXP: 2200, rewardGold: 850, minions: 'ghost',
        dialog: {
            intro: 'The VAMPIRE KING rules from the throne room! He turned the entire garrison undead. SLAY HIM!',
            progress: 'The Vampire King feeds on darkness!',
            complete: 'THE VAMPIRE KING IS DUST! Dreadmoor Castle is liberated!'
        }
    },
    q_castle_side: {
        id: 'q_castle_side', name: 'Father\'s Ring',
        giver: 'npc_castle_prisoner', area: 'area7', type: 'find_hidden',
        hiddenItems: [
            { tx: 20, ty: 15 }
        ],
        dropItem: 'signet_ring', targetCount: 1,
        requiredLevel: 15, requiredQuests: [],
        rewardXP: 900, rewardGold: 400,
        itemLabel: 'Signet Ring',
        dialog: {
            intro: 'My father\'s signet ring was taken when I was captured. It must still be somewhere in this castle — I feel it glowing with magic. Please find it and bring it back to me!',
            progress: 'Search the castle for a glowing ring...',
            complete: 'My father\'s ring! I never thought I\'d see it again. You have my eternal gratitude!'
        }
    },

    // =============================================
    // AREA 8: Crystalvein Caverns
    // =============================================
    q_crystal_golems: {
        id: 'q_crystal_golems', name: 'Shattered Guardians',
        giver: 'npc_crystal_sage', area: 'area8', type: 'kill',
        target: 'crystal_golem', targetCount: 5,
        requiredLevel: 16, requiredQuests: [],
        rewardXP: 1500, rewardGold: 560,
        dialog: {
            intro: 'Crystal Golems once protected these caves. Now they attack everything! Shatter 5 of them!',
            progress: 'Golems shattered: {current}/{total}.',
            complete: 'The guardians are broken. The corruption weakens.'
        }
    },
    q_crystal_spiders: {
        id: 'q_crystal_spiders', name: 'Web of Gems',
        giver: 'npc_crystal_sage', area: 'area8', type: 'kill',
        target: 'gem_spider', targetCount: 7,
        requiredLevel: 17, requiredQuests: ['q_crystal_golems'],
        rewardXP: 1600, rewardGold: 600, difficulty: 1.3,
        dialog: {
            intro: 'Gem Spiders are spinning webs of crystal that trap travelers! Kill 7!',
            progress: 'Spiders crushed: {current}/{total}.',
            complete: 'The webs dissolve! The path is clear!'
        }
    },
    q_crystal_boss: {
        id: 'q_crystal_boss', name: 'The Crystal Dragon',
        giver: 'npc_crystal_sage', area: 'area8', type: 'kill',
        target: 'crystal_dragon', targetCount: 1,
        requiredLevel: 17, requiredQuests: ['q_crystal_spiders'],
        rewardXP: 2800, rewardGold: 1000, minions: 'crystal_golem',
        dialog: {
            intro: 'The CRYSTAL DRAGON has corrupted the heart of the caverns! Its body is made of living crystal. DESTROY IT!',
            progress: 'The Crystal Dragon still shimmers!',
            complete: 'THE CRYSTAL DRAGON SHATTERS! The caverns glow pure once more!'
        }
    },
    q_crystal_side: {
        id: 'q_crystal_side', name: 'Pure Crystal Shards',
        giver: 'npc_crystal_miner', area: 'area8', type: 'collect_drops',
        dropFrom: 'crystal_golem', dropItem: 'crystal_shard', targetCount: 3,
        requiredLevel: 16, requiredQuests: [],
        rewardXP: 1000, rewardGold: 450,
        itemLabel: 'Crystal Shard',
        dialog: {
            intro: 'Crystal Golems carry pure crystal shards in their cores. Shatter 3 of them and bring me their shards — they glow when they fall. I\'ll refine them into gems worth a fortune!',
            progress: 'Shards collected: {current}/{total}. Pick up the glowing crystals!',
            complete: 'Pure, uncracked shards! These are worth a fortune. Here is your cut!'
        }
    },

    // =============================================
    // AREA 9: Skyreach Temple
    // =============================================
    q_sky_guardians: {
        id: 'q_sky_guardians', name: 'Fallen Sentinels',
        giver: 'npc_sky_priest', area: 'area9', type: 'kill',
        target: 'sky_guardian', targetCount: 6,
        requiredLevel: 18, requiredQuests: [],
        rewardXP: 1900, rewardGold: 700,
        dialog: {
            intro: 'The Sky Guardians were once protectors of the temple. Now they serve the mad Sky Lord! Defeat 6!',
            progress: 'Guardians defeated: {current}/{total}.',
            complete: 'The sentinels fall. The Sky Lord loses his army!'
        }
    },
    q_sky_hawks: {
        id: 'q_sky_hawks', name: 'Storm Riders',
        giver: 'npc_sky_priest', area: 'area9', type: 'kill',
        target: 'storm_hawk', targetCount: 8,
        requiredLevel: 18, requiredQuests: ['q_sky_guardians'],
        rewardXP: 2000, rewardGold: 750, difficulty: 1.3,
        dialog: {
            intro: 'Storm Hawks circle the temple raining lightning! Bring down 8!',
            progress: 'Hawks grounded: {current}/{total}.',
            complete: 'The skies clear! We can see the sun again!'
        }
    },
    q_sky_boss: {
        id: 'q_sky_boss', name: 'The Sky Lord',
        giver: 'npc_sky_priest', area: 'area9', type: 'kill',
        target: 'sky_lord', targetCount: 1,
        requiredLevel: 19, requiredQuests: ['q_sky_hawks'],
        rewardXP: 3500, rewardGold: 1200, minions: 'storm_hawk',
        dialog: {
            intro: 'THE SKY LORD awaits at the highest spire! He controls the storms themselves. BRING HIM DOWN!',
            progress: 'The Sky Lord commands the thunder!',
            complete: 'THE SKY LORD IS DEFEATED! The heavens are at peace! But hero... darkness gathers in the east. The Shadow Realm opens...'
        }
    },
    q_sky_side: {
        id: 'q_sky_side', name: 'The Three Rune Stones',
        giver: 'npc_sky_scholar', area: 'area9', type: 'find_hidden',
        hiddenItems: [
            { tx: 15, ty: 20 }, { tx: 55, ty: 45 }, { tx: 35, ty: 8 }
        ],
        dropItem: 'rune_stone', targetCount: 3,
        requiredLevel: 18, requiredQuests: [],
        rewardXP: 1200, rewardGold: 550,
        itemLabel: 'Rune Stone',
        dialog: {
            intro: 'Three ancient rune stones are scattered across this temple — they pulse with golden light. I cannot reach them past the monsters, but YOU can! Bring all three to me!',
            progress: 'Rune stones found: {current}/{total}. Look for golden glows!',
            complete: 'Incredible! These runes describe the creation of the Sky Realm itself. You have made history!'
        }
    },

    // =============================================
    // AREA 10: The Shadow Realm (FINAL)
    // =============================================
    q_shadow_demons: {
        id: 'q_shadow_demons', name: 'Shadow Invasion',
        giver: 'npc_shadow_guide', area: 'area10', type: 'kill',
        target: 'shadow_demon', targetCount: 8,
        requiredLevel: 19, requiredQuests: [],
        rewardXP: 2500, rewardGold: 900,
        dialog: {
            intro: 'Shadow Demons pour from the rifts! Destroy 8 before they overwhelm us!',
            progress: 'Demons banished: {current}/{total}.',
            complete: 'The demon swarm recedes. But the Dark Lord grows stronger...'
        }
    },
    q_shadow_stalkers: {
        id: 'q_shadow_stalkers', name: 'Void Hunters',
        giver: 'npc_shadow_guide', area: 'area10', type: 'kill',
        target: 'void_stalker', targetCount: 7,
        requiredLevel: 20, requiredQuests: ['q_shadow_demons'],
        rewardXP: 2800, rewardGold: 1000, difficulty: 1.5,
        dialog: {
            intro: 'Void Stalkers are the Dark Lord\'s elite assassins! Slay 7 of these deadly hunters!',
            progress: 'Stalkers destroyed: {current}/{total}.',
            complete: 'The elite guard falls. The Dark Lord stands alone!'
        }
    },
    q_shadow_boss: {
        id: 'q_shadow_boss', name: 'THE DARK LORD',
        giver: 'npc_shadow_guide', area: 'area10', type: 'kill',
        target: 'dark_lord', targetCount: 1,
        requiredLevel: 20, requiredQuests: ['q_shadow_stalkers'],
        rewardXP: 5000, rewardGold: 2000, minions: 'shadow_demon', difficulty: 2.0,
        dialog: {
            intro: 'This is it, hero. THE DARK LORD — the source of all evil in the realm. He is unimaginably powerful. This is your destiny. FIGHT!',
            progress: 'THE DARK LORD LAUGHS AT YOUR EFFORTS! KEEP FIGHTING!',
            complete: 'THE DARK LORD IS VANQUISHED! LIGHT RETURNS TO THE REALM! You are the greatest hero this world has ever known! Return to the Village Elder — he will want to hear of your triumph!'
        }
    },
    q_shadow_side: {
        id: 'q_shadow_side', name: 'Essence of Darkness',
        giver: 'npc_shadow_merchant', area: 'area10', type: 'collect_drops',
        dropFrom: 'shadow_demon', dropItem: 'shadow_essence', targetCount: 3,
        requiredLevel: 19, requiredQuests: [],
        rewardXP: 1600, rewardGold: 700,
        itemLabel: 'Shadow Essence',
        dialog: {
            intro: 'Shadow Demons leave behind pure void essence when destroyed — incredibly rare. Collect 3 glowing essences for me. I need them to craft something that may help you against the Dark Lord...',
            progress: 'Essences collected: {current}/{total}. Pick up the dark glows!',
            complete: 'Extraordinary! I have crafted this from the essence. Take it — it will serve you well against the Dark Lord.'
        }
    }
};
