import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedCharacter {
  id: string;
  name: string;
  universe: string;
  version: string;
  description: string;
  imageUrl: string;
  stats: {
    strength: number;
    speed: number;
    durability: number;
    stamina: number;
    energyOutput: number;
    techniqueProficiency: number;
    experience: number;
    adaptability: number;
  };
  abilities: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    powerLevel: number;
  }>;
}

const characterCache = new Map<string, ScrapedCharacter>();

// Generate placeholder avatar image URL
function getCharacterImageUrl(name: string, universe: string): string {
  const encodedName = encodeURIComponent(name);
  // Color based on universe for visual variety
  const universeColors: Record<string, string> = {
    'Dragon Ball': '4285F4', // Blue
    'DC Universe': '0052CC', // Dark Blue
    Marvel: 'ED1C24', // Red
    'One Piece': 'FF9800', // Orange
    Naruto: 'FF5722', // Deep Orange
    Bleach: '9C27B0', // Purple
    'Attack on Titan': '795548', // Brown
    'One Punch Man': 'FFEB3B', // Yellow
    'My Hero Academia': '4CAF50', // Green
    'Lord of the Rings': '8B7355', // Tan
    'Fairy Tail': '2196F3', // Light Blue
    'Seven Deadly Sins': '6A1B9A', // Deep Purple
    'Sword Art Online': '1976D2', // Indigo
    'Mob Psycho 100': 'FF6F00', // Dark Orange
    'Re:Zero': 'D32F2F', // Dark Red
    'Chainsaw Man': 'F57C00', // Dark Orange
    'Dragon Quest': '1976D2', // Indigo
    Sonic: '1C5BA8', // Dark Blue
    'Super Mario': 'E31C23', // Mario Red
    'Mega Man': '0066CC', // Bright Blue
    Tekken: '000000', // Black
    'Guilty Gear': 'FF6600', // Orange
    BlazBlue: '3D3D3D', // Dark Gray
    'Devil May Cry': '#670000', // Dark Red
    Bayonetta: '9C27B0', // Purple
    "Asura's Wrath": 'D32F2F', // Red
    'NieR: Automata': '000000', // Black
    'God of War': '8B0000', // Dark Red
    'Warhammer 40k': 'FFD700', // Gold
    'The Witcher': '333333', // Dark Gray
    'The Elder Scrolls': '#996633', // Brown
    'Dark Souls': '333333', // Dark Gray
    Bloodborne: '#8B0000', // Dark Red
    'Elden Ring': '#D4AF37', // Gold
    'Hollow Knight': '#000000', // Black
    Undertale: '#FFFF00', // Yellow
    Deltarune: '#FFFFFF', // White (with dark outline)
    Celeste: 'E31C23', // Red
    Castlevania: '#8B0000', // Dark Red
    'Metal Gear': '#2F4F4F', // Dark Slate Gray
    'Resident Evil': '#8B0000', // Dark Red
    'Mass Effect': '#0066CC', // Blue
    Warframe: '#00FFFF', // Cyan
    Destiny: '#FFA500', // Orange
    'Xenoblade Chronicles': '#FF6600', // Orange
    'Kingdom Hearts': '#0066CC', // Blue
    'Persona 5': '#FFFF00', // Yellow
    'Fire Emblem': '#1976D2', // Indigo
    'Tales of Vesperia': '#FF1493', // Deep Pink
    Touhou: '#FF69B4', // Hot Pink
    'League of Legends': '#0099FF', // Blue
    'Dota 2': '#923100', // Brown
    StarCraft: '#FFD700', // Gold
    Diablo: '#8B0000', // Dark Red
    'World of Warcraft': '#0070DD', // Blue
    'Final Fantasy': '#1976D2', // Indigo
    'Final Fantasy XV': '#1976D2', // Indigo
    DOOM: '#8B0000', // Dark Red
    Overwatch: '#FFB81C', // Yellow
    Minecraft: '#82B436', // Green
    Terraria: '#E31C23', // Red
    'F-Zero': '#FF6600', // Orange
    'Apex Legends': '#FF6600', // Orange
    Valorant: '#FA4454', // Red
    Sekiro: '#FFD700', // Gold
    'Ninja Gaiden': '#FF0000', // Red
  };

  const color = universeColors[universe] || '607D8B'; // Default gray-blue
  return `https://ui-avatars.com/api/?name=${encodedName}&size=256&background=${color}&color=fff&bold=true`;
}

// Build search index for faster lookups
const characterSearchIndex = new Map<string, string>(); // Maps search terms to character keys

// Initialize search index
function buildSearchIndex() {
  for (const [key, character] of Object.entries(characterDatabase)) {
    // Add primary key
    characterSearchIndex.set(key, key);

    // Add full name variations
    const nameLower = character.name.toLowerCase();
    characterSearchIndex.set(nameLower, key);

    // Add individual name parts
    const nameParts = nameLower.split(/[\s\/]+/);
    for (const part of nameParts) {
      if (part.length > 2) {
        // Avoid single letters
        if (!characterSearchIndex.has(part)) {
          characterSearchIndex.set(part, key);
        }
      }
    }

    // Add aliases (e.g., "allmight" for "All Might")
    const nameNoSpaces = nameLower.replace(/[\s\-\/]+/g, '');
    if (nameNoSpaces !== nameLower && nameNoSpaces.length > 2) {
      characterSearchIndex.set(nameNoSpaces, key);
    }
  }
  console.log(
    `[Search Index] Built index with ${characterSearchIndex.size} search terms for ${Object.keys(characterDatabase).length} characters`
  );
}

// Character search database - maps search terms to full character data
export const characterDatabase: Record<string, ScrapedCharacter> = {
  // Dragon Ball
  goku: {
    id: 'goku-dragon-ball',
    name: 'Son Goku',
    universe: 'Dragon Ball Z',
    version: 'Super Saiyan Era',
    description:
      'The main protagonist of Dragon Ball. Saiyan raised on Earth who constantly trains to protect his loved ones and becomes the strongest fighter.',
    imageUrl: getCharacterImageUrl('Son Goku', 'Dragon Ball'),
    stats: {
      strength: 92,
      speed: 88,
      durability: 85,
      stamina: 90,
      energyOutput: 95,
      techniqueProficiency: 85,
      experience: 88,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'goku-kamehameha',
        name: 'Kamehameha',
        type: 'Energy Beam',
        description: "Goku's signature ki attack with massive destructive power.",
        powerLevel: 90,
      },
      {
        id: 'goku-instant-transmission',
        name: 'Instant Transmission',
        type: 'Teleportation',
        description: 'Teleportation technique learned from the Yardrats.',
        powerLevel: 80,
      },
      {
        id: 'goku-ssj',
        name: 'Super Saiyan',
        type: 'Transformation',
        description: 'Legendary transformation that multiplies power 50x.',
        powerLevel: 95,
      },
      {
        id: 'goku-spirit-bomb',
        name: 'Spirit Bomb',
        type: 'Energy Attack',
        description: 'Gathers energy from all living things into a massive sphere.',
        powerLevel: 85,
      },
    ],
  },
  vegeta: {
    id: 'vegeta-dragon-ball',
    name: 'Vegeta',
    universe: 'Dragon Ball Z',
    version: 'Super Saiyan Blue Era',
    description:
      'Prince of all Saiyans. Proud warrior who constantly rivals Goku, driven by pride and the desire to be the strongest.',
    imageUrl: getCharacterImageUrl('Vegeta', 'Dragon Ball'),
    stats: {
      strength: 91,
      speed: 86,
      durability: 84,
      stamina: 88,
      energyOutput: 93,
      techniqueProficiency: 90,
      experience: 92,
      adaptability: 80,
    },
    abilities: [
      {
        id: 'vegeta-final-flash',
        name: 'Final Flash',
        type: 'Energy Beam',
        description: "Vegeta's most powerful energy attack.",
        powerLevel: 92,
      },
      {
        id: 'vegeta-galick-gun',
        name: 'Galick Gun',
        type: 'Energy Beam',
        description: 'Purple energy wave signature technique.',
        powerLevel: 85,
      },
      {
        id: 'vegeta-ssb',
        name: 'Super Saiyan Blue',
        type: 'Transformation',
        description: 'God ki transformation with blue aura.',
        powerLevel: 94,
      },
      {
        id: 'vegeta-pride',
        name: 'Saiyan Pride',
        type: 'Passive',
        description: 'Never gives up, gets stronger when fighting for his pride.',
        powerLevel: 88,
      },
    ],
  },

  // DC
  superman: {
    id: 'superman-dc',
    name: 'Clark Kent / Superman',
    universe: 'DC Comics',
    version: 'Post-Crisis',
    description:
      "The Man of Steel. Last son of Krypton with vast superpowers derived from Earth's yellow sun. Symbol of hope and justice.",
    imageUrl: getCharacterImageUrl('Superman', 'DC Universe'),
    stats: {
      strength: 98,
      speed: 85,
      durability: 97,
      stamina: 95,
      energyOutput: 90,
      techniqueProficiency: 70,
      experience: 85,
      adaptability: 80,
    },
    abilities: [
      {
        id: 'superman-heat-vision',
        name: 'Heat Vision',
        type: 'Energy Attack',
        description: 'Powerful heat beams from his eyes.',
        powerLevel: 88,
      },
      {
        id: 'superman-flight',
        name: 'Flight',
        type: 'Movement',
        description: 'Can fly at supersonic and beyond speeds.',
        powerLevel: 85,
      },
      {
        id: 'superman-invulnerability',
        name: 'Kryptonian Invulnerability',
        type: 'Passive',
        description: 'Nearly invulnerable to all physical harm.',
        powerLevel: 97,
      },
      {
        id: 'superman-strength',
        name: 'Superhuman Strength',
        type: 'Passive',
        description: 'Can lift planets and punch through dimensions.',
        powerLevel: 98,
      },
    ],
  },
  batman: {
    id: 'batman-dc',
    name: 'Bruce Wayne / Batman',
    universe: 'DC Comics',
    version: 'Prime Earth',
    description:
      'The Dark Knight. Master detective and martial artist who uses intellect, technology, and preparation to fight crime in Gotham.',
    imageUrl: getCharacterImageUrl('Batman', 'DC Universe'),
    stats: {
      strength: 42,
      speed: 55,
      durability: 50,
      stamina: 65,
      energyOutput: 30,
      techniqueProficiency: 98,
      experience: 95,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'batman-prep',
        name: 'Prep Time',
        type: 'Strategy',
        description: 'With preparation, can create plans to defeat anyone.',
        powerLevel: 100,
      },
      {
        id: 'batman-martial-arts',
        name: 'Master Martial Artist',
        type: 'Combat Skill',
        description: 'Mastered over 127 martial arts styles.',
        powerLevel: 95,
      },
      {
        id: 'batman-detective',
        name: "World's Greatest Detective",
        type: 'Passive',
        description: 'Unmatched analytical and deductive skills.',
        powerLevel: 100,
      },
      {
        id: 'batman-gadgets',
        name: 'Utility Belt',
        type: 'Equipment',
        description: 'Arsenal of high-tech gadgets for any situation.',
        powerLevel: 85,
      },
    ],
  },
  wonderwoman: {
    id: 'wonderwoman-dc',
    name: 'Diana Prince / Wonder Woman',
    universe: 'DC Comics',
    version: 'Rebirth',
    description:
      'Amazonian warrior princess with god-like powers. Daughter of Zeus wielding the Lasso of Truth and indestructible bracelets.',
    imageUrl: getCharacterImageUrl('Wonder Woman', 'DC Universe'),
    stats: {
      strength: 90,
      speed: 82,
      durability: 88,
      stamina: 85,
      energyOutput: 75,
      techniqueProficiency: 92,
      experience: 90,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'ww-lasso',
        name: 'Lasso of Truth',
        type: 'Weapon',
        description: 'Unbreakable lasso that compels truth from those it binds.',
        powerLevel: 85,
      },
      {
        id: 'ww-bracelets',
        name: 'Bracelets of Submission',
        type: 'Defense',
        description: 'Indestructible bracelets that can deflect any attack.',
        powerLevel: 90,
      },
      {
        id: 'ww-flight',
        name: 'Flight',
        type: 'Movement',
        description: 'Can fly at high speeds.',
        powerLevel: 80,
      },
      {
        id: 'ww-godkiller',
        name: 'God Killer Sword',
        type: 'Weapon',
        description: 'Sword forged to kill gods.',
        powerLevel: 92,
      },
    ],
  },

  // Naruto
  naruto: {
    id: 'naruto-uzumaki',
    name: 'Naruto Uzumaki',
    universe: 'Naruto',
    version: 'Baryon Mode',
    description:
      'Seventh Hokage of Konoha. Jinchuriki of the Nine-Tailed Fox who never gives up and protects his friends with overwhelming power.',
    imageUrl: getCharacterImageUrl('Naruto Uzumaki', 'Naruto'),
    stats: {
      strength: 88,
      speed: 85,
      durability: 87,
      stamina: 98,
      energyOutput: 92,
      techniqueProficiency: 90,
      experience: 92,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'naruto-rasengan',
        name: 'Rasengan',
        type: 'Ninjutsu',
        description: 'Spinning sphere of chakra. His signature move with many variations.',
        powerLevel: 88,
      },
      {
        id: 'naruto-shadow-clone',
        name: 'Shadow Clone Jutsu',
        type: 'Ninjutsu',
        description: 'Creates thousands of solid clones.',
        powerLevel: 85,
      },
      {
        id: 'naruto-kurama-link',
        name: 'Kurama Link Mode',
        type: 'Transformation',
        description: 'Merges with the Nine-Tailed Fox for immense power boost.',
        powerLevel: 96,
      },
      {
        id: 'naruto-baryon',
        name: 'Baryon Mode',
        type: 'Ultimate Form',
        description: 'Nuclear fusion of chakra creating godly power at great cost.',
        powerLevel: 98,
      },
    ],
  },
  sasuke: {
    id: 'sasuke-uchiha',
    name: 'Sasuke Uchiha',
    universe: 'Naruto',
    version: 'Rinnegan Era',
    description:
      "Last Uchiha survivor who wields the Rinnegan and Eternal Mangekyo Sharingan. Naruto's eternal rival seeking atonement.",
    imageUrl: getCharacterImageUrl('Sasuke Uchiha', 'Naruto'),
    stats: {
      strength: 84,
      speed: 90,
      durability: 80,
      stamina: 85,
      energyOutput: 94,
      techniqueProficiency: 96,
      experience: 92,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'sasuke-chidori',
        name: 'Chidori',
        type: 'Ninjutsu',
        description: 'Lightning blade technique with piercing power.',
        powerLevel: 88,
      },
      {
        id: 'sasuke-amaterasu',
        name: 'Amaterasu',
        type: 'Dojutsu',
        description: 'Black flames that burn anything they touch.',
        powerLevel: 93,
      },
      {
        id: 'sasuke-rinnegan',
        name: 'Rinnegan',
        type: 'Dojutsu',
        description: 'Legendary eye with space-time manipulation.',
        powerLevel: 97,
      },
      {
        id: 'sasuke-susanoo',
        name: 'Perfect Susanoo',
        type: 'Summoning',
        description: 'Massive chakra warrior avatar with devastating power.',
        powerLevel: 95,
      },
    ],
  },
  itachi: {
    id: 'itachi-uchiha',
    name: 'Itachi Uchiha',
    universe: 'Naruto',
    version: 'Edo Tensei',
    description:
      'Genius ninja who massacred his own clan to prevent war. Wielder of Mangekyo Sharingan with unmatched genjutsu mastery.',
    imageUrl: getCharacterImageUrl('Itachi Uchiha', 'Naruto'),
    stats: {
      strength: 68,
      speed: 82,
      durability: 65,
      stamina: 70,
      energyOutput: 88,
      techniqueProficiency: 99,
      experience: 95,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'itachi-tsukuyomi',
        name: 'Tsukuyomi',
        type: 'Genjutsu',
        description: 'Ultimate genjutsu that tortures for days in seconds.',
        powerLevel: 98,
      },
      {
        id: 'itachi-amaterasu',
        name: 'Amaterasu',
        type: 'Dojutsu',
        description: 'Black flames that never extinguish.',
        powerLevel: 93,
      },
      {
        id: 'itachi-susanoo',
        name: 'Susanoo',
        type: 'Summoning',
        description: 'Spectral warrior with Totsuka Blade and Yata Mirror.',
        powerLevel: 96,
      },
      {
        id: 'itachi-izanagi',
        name: 'Genjutsu Mastery',
        type: 'Passive',
        description: 'Considered the greatest genjutsu user ever.',
        powerLevel: 100,
      },
    ],
  },

  // One Piece
  luffy: {
    id: 'monkey-d-luffy',
    name: 'Monkey D. Luffy',
    universe: 'One Piece',
    version: 'Gear 5',
    description:
      'Future Pirate King. Ate the Human-Human Fruit Model: Nika, granting him rubber powers and reality-warping cartoon physics.',
    imageUrl: getCharacterImageUrl('Monkey D. Luffy', 'One Piece'),
    stats: {
      strength: 90,
      speed: 90,
      durability: 85,
      stamina: 95,
      energyOutput: 90,
      techniqueProficiency: 85,
      experience: 85,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'luffy-gum-gum-pistol',
        name: 'Gum Gum Pistol',
        type: 'Rubber Technique',
        description: 'Stretches and launches his fist like a cannon.',
        powerLevel: 80,
      },
      {
        id: 'luffy-gear-5',
        name: 'Gear 5 - Nika Form',
        type: 'Transformation',
        description: 'Ultimate form with god-like powers and reality warping.',
        powerLevel: 100,
      },
      {
        id: 'luffy-conquerors-haki',
        name: "Conqueror's Haki",
        type: 'Haki Technique',
        description: 'Advanced willpower technique that dominates opponents.',
        powerLevel: 90,
      },
      {
        id: 'luffy-vitality',
        name: 'Extreme Vitality',
        type: 'Passive',
        description: 'Incredible resilience and willpower to never give up.',
        powerLevel: 85,
      },
    ],
  },
  zoro: {
    id: 'roronoa-zoro',
    name: 'Roronoa Zoro',
    universe: 'One Piece',
    version: "Advanced Conqueror's Haki",
    description:
      "Swordsman of the Straw Hat Pirates with the goal to become the world's greatest swordsman. Three-sword style master.",
    imageUrl: getCharacterImageUrl('Roronoa Zoro', 'One Piece'),
    stats: {
      strength: 88,
      speed: 86,
      durability: 87,
      stamina: 90,
      energyOutput: 82,
      techniqueProficiency: 95,
      experience: 88,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'zoro-three-sword-style',
        name: 'Three Sword Style',
        type: 'Swordsmanship',
        description: 'Unique three-sword combat style with overwhelming power.',
        powerLevel: 90,
      },
      {
        id: 'zoro-ashura',
        name: 'Ashura',
        type: 'Technique',
        description: 'Manifests nine-sword demonic form.',
        powerLevel: 93,
      },
      {
        id: 'zoro-conquerors-haki',
        name: "Conqueror's Haki",
        type: 'Haki',
        description: "Can infuse attacks with supreme king's spirit.",
        powerLevel: 88,
      },
      {
        id: 'zoro-swords',
        name: 'Legendary Swords',
        type: 'Equipment',
        description: 'Wields Enma and other powerful blades.',
        powerLevel: 92,
      },
    ],
  },

  // Bleach
  ichigo: {
    id: 'ichigo-kurosaki',
    name: 'Ichigo Kurosaki',
    universe: 'Bleach',
    version: 'True Bankai',
    description:
      'Substitute Soul Reaper with Hollow, Quincy, and Shinigami powers. Wields Zangetsu and achieved True Bankai form.',
    imageUrl: getCharacterImageUrl('Ichigo Kurosaki', 'Bleach'),
    stats: {
      strength: 90,
      speed: 92,
      durability: 86,
      stamina: 88,
      energyOutput: 94,
      techniqueProficiency: 87,
      experience: 85,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'ichigo-getsuga-tensho',
        name: 'Getsuga Tensho',
        type: 'Energy Attack',
        description: 'Compressed energy wave slash.',
        powerLevel: 90,
      },
      {
        id: 'ichigo-bankai',
        name: 'True Bankai',
        type: 'Transformation',
        description: 'Ultimate form merging all powers into one.',
        powerLevel: 96,
      },
      {
        id: 'ichigo-hollow-mask',
        name: 'Hollow Mask',
        type: 'Power Up',
        description: 'Accesses Hollow powers for massive boost.',
        powerLevel: 88,
      },
      {
        id: 'ichigo-speed',
        name: 'Flash Step Master',
        type: 'Passive',
        description: 'Incredible speed and reflexes.',
        powerLevel: 92,
      },
    ],
  },
  aizen: {
    id: 'sosuke-aizen',
    name: 'Sosuke Aizen',
    universe: 'Bleach',
    version: 'Hogyoku Fusion',
    description:
      'Former Soul Society captain who transcended shinigami limits through the Hogyoku. Master of illusions and manipulation.',
    imageUrl: getCharacterImageUrl('Sosuke Aizen', 'Bleach'),
    stats: {
      strength: 92,
      speed: 88,
      durability: 95,
      stamina: 96,
      energyOutput: 98,
      techniqueProficiency: 99,
      experience: 98,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'aizen-kyoka-suigetsu',
        name: 'Kyoka Suigetsu',
        type: 'Illusion',
        description: 'Perfect hypnosis controlling all five senses.',
        powerLevel: 100,
      },
      {
        id: 'aizen-hogyoku',
        name: 'Hogyoku Fusion',
        type: 'Transformation',
        description: 'Immortality and evolution beyond shinigami/hollow limits.',
        powerLevel: 98,
      },
      {
        id: 'aizen-kido',
        name: 'Master Kido User',
        type: 'Magic',
        description: 'Peerless skill in soul reaper magic.',
        powerLevel: 97,
      },
      {
        id: 'aizen-immortality',
        name: 'Immortality',
        type: 'Passive',
        description: 'Cannot be killed by conventional means.',
        powerLevel: 99,
      },
    ],
  },

  // Attack on Titan
  eren: {
    id: 'eren-yeager',
    name: 'Eren Yeager',
    universe: 'Attack on Titan',
    version: 'Founding Titan',
    description:
      'Holder of the Founding Titan, Attack Titan, and War Hammer Titan. Can control all Titans and access future memories.',
    imageUrl: getCharacterImageUrl('Eren Yeager', 'Attack on Titan'),
    stats: {
      strength: 95,
      speed: 70,
      durability: 92,
      stamina: 85,
      energyOutput: 96,
      techniqueProficiency: 82,
      experience: 75,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'eren-founding-titan',
        name: 'Founding Titan',
        type: 'Transformation',
        description: 'God-like titan form that controls all Eldians and Titans.',
        powerLevel: 98,
      },
      {
        id: 'eren-rumbling',
        name: 'The Rumbling',
        type: 'Ultimate Attack',
        description: 'Unleashes millions of Colossal Titans.',
        powerLevel: 100,
      },
      {
        id: 'eren-hardening',
        name: 'Titan Hardening',
        type: 'Defense',
        description: 'Creates crystalline armor.',
        powerLevel: 88,
      },
      {
        id: 'eren-future-sight',
        name: 'Attack Titan Foresight',
        type: 'Passive',
        description: 'Can see future memories through paths.',
        powerLevel: 92,
      },
    ],
  },
  levi: {
    id: 'levi-ackerman',
    name: 'Levi Ackerman',
    universe: 'Attack on Titan',
    version: 'Survey Corps Captain',
    description:
      "Humanity's strongest soldier. Ackerman bloodline gives superhuman combat abilities with ODM gear mastery.",
    imageUrl: getCharacterImageUrl('Levi Ackermann', 'Attack on Titan'),
    stats: {
      strength: 65,
      speed: 99,
      durability: 70,
      stamina: 85,
      energyOutput: 40,
      techniqueProficiency: 100,
      experience: 95,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'levi-odm-gear',
        name: 'ODM Gear Mastery',
        type: 'Equipment Skill',
        description: 'Perfect three dimensional maneuvering.',
        powerLevel: 100,
      },
      {
        id: 'levi-ackerman-power',
        name: 'Ackerman Awakening',
        type: 'Passive',
        description: 'Superhuman strength, speed, and reflexes.',
        powerLevel: 95,
      },
      {
        id: 'levi-blades',
        name: 'Dual Blade Technique',
        type: 'Combat Skill',
        description: 'Lightning-fast precision strikes.',
        powerLevel: 98,
      },
      {
        id: 'levi-endurance',
        name: 'Unbreakable Will',
        type: 'Passive',
        description: 'Never gives up regardless of injuries.',
        powerLevel: 90,
      },
    ],
  },

  // One Punch Man
  saitama: {
    id: 'saitama',
    name: 'Saitama',
    universe: 'One Punch Man',
    version: 'Bald Cape',
    description:
      'Hero who broke his limiter through training. Can defeat any opponent with a single serious punch. Limitless strength.',
    imageUrl: getCharacterImageUrl('Saitama', 'One Punch Man'),
    stats: {
      strength: 100,
      speed: 100,
      durability: 100,
      stamina: 100,
      energyOutput: 100,
      techniqueProficiency: 50,
      experience: 70,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'saitama-serious-punch',
        name: 'Serious Punch',
        type: 'Physical Attack',
        description: 'One punch that destroys anything.',
        powerLevel: 100,
      },
      {
        id: 'saitama-consecutive-punches',
        name: 'Serious Series: Consecutive Normal Punches',
        type: 'Combo',
        description: 'Barrage of world-ending punches.',
        powerLevel: 100,
      },
      {
        id: 'saitama-table-flip',
        name: 'Serious Table Flip',
        type: 'Environmental',
        description: 'Flips entire landmasses.',
        powerLevel: 100,
      },
      {
        id: 'saitama-limiter',
        name: 'Broken Limiter',
        type: 'Passive',
        description: 'Infinite growth potential, no upper limit.',
        powerLevel: 100,
      },
    ],
  },

  // Marvel
  hulk: {
    id: 'hulk',
    name: 'Bruce Banner / The Hulk',
    universe: 'Marvel',
    version: 'World Breaker',
    description:
      'Gamma-powered behemoth whose strength increases infinitely with anger. The angrier he gets, the stronger he becomes.',
    imageUrl: getCharacterImageUrl('Hulk', 'Marvel'),
    stats: {
      strength: 100,
      speed: 72,
      durability: 98,
      stamina: 95,
      energyOutput: 85,
      techniqueProficiency: 55,
      experience: 80,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'hulk-strength',
        name: 'Infinite Strength',
        type: 'Passive',
        description: 'Strength increases without limit as anger rises.',
        powerLevel: 100,
      },
      {
        id: 'hulk-thunderclap',
        name: 'Thunder Clap',
        type: 'Shockwave',
        description: 'Claps hands creating devastating shockwaves.',
        powerLevel: 92,
      },
      {
        id: 'hulk-healing',
        name: 'Regeneration',
        type: 'Passive',
        description: 'Heals from any wound almost instantly.',
        powerLevel: 95,
      },
      {
        id: 'hulk-worldbreaker',
        name: 'World Breaker Form',
        type: 'Transformation',
        description: 'Angriest and most powerful Hulk form.',
        powerLevel: 100,
      },
    ],
  },
  thor: {
    id: 'thor',
    name: 'Thor Odinson',
    universe: 'Marvel',
    version: 'Rune King',
    description:
      'God of Thunder wielding Mjolnir. Possesses immense divine power, lightning manipulation, and warrior skill.',
    imageUrl: getCharacterImageUrl('Thor', 'Marvel'),
    stats: {
      strength: 96,
      speed: 80,
      durability: 94,
      stamina: 92,
      energyOutput: 95,
      techniqueProficiency: 88,
      experience: 98,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'thor-mjolnir',
        name: 'Mjolnir',
        type: 'Weapon',
        description: 'Enchanted hammer only the worthy can lift.',
        powerLevel: 95,
      },
      {
        id: 'thor-lightning',
        name: 'God Blast',
        type: 'Energy Attack',
        description: 'Channels full power of Thor-Force.',
        powerLevel: 96,
      },
      {
        id: 'thor-godforce',
        name: 'Odin-Force',
        type: 'Power Up',
        description: 'Inherited the Odin-Force for reality manipulation.',
        powerLevel: 98,
      },
      {
        id: 'thor-warrior',
        name: 'Asgardian Combat Master',
        type: 'Passive',
        description: 'Thousands of years of battle experience.',
        powerLevel: 92,
      },
    ],
  },
  spiderman: {
    id: 'spiderman',
    name: 'Peter Parker / Spider-Man',
    universe: 'Marvel',
    version: 'Prime',
    description:
      'Friendly neighborhood Spider-Man with wall-crawling, web-slinging, and spider-sense. Genius intellect with superhuman agility.',
    imageUrl: getCharacterImageUrl('Spider-Man', 'Marvel'),
    stats: {
      strength: 58,
      speed: 78,
      durability: 65,
      stamina: 75,
      energyOutput: 45,
      techniqueProficiency: 85,
      experience: 82,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'spidey-sense',
        name: 'Spider-Sense',
        type: 'Precognition',
        description: 'Warns of danger before it happens.',
        powerLevel: 90,
      },
      {
        id: 'spidey-webs',
        name: 'Web-Shooters',
        type: 'Equipment',
        description: 'Versatile web fluid for swinging and trapping.',
        powerLevel: 80,
      },
      {
        id: 'spidey-strength',
        name: 'Proportional Spider Strength',
        type: 'Passive',
        description: 'Can lift 10+ tons with ease.',
        powerLevel: 75,
      },
      {
        id: 'spidey-agility',
        name: 'Superhuman Agility',
        type: 'Passive',
        description: 'Incredible reflexes and acrobatics.',
        powerLevel: 88,
      },
    ],
  },

  // My Hero Academia
  deku: {
    id: 'izuku-midoriya',
    name: 'Izuku Midoriya / Deku',
    universe: 'My Hero Academia',
    version: 'Multi-Quirk Era',
    description:
      'Inheritor of One For All. Possesses multiple Quirks including super strength, blackwhip, float, and danger sense.',
    imageUrl: getCharacterImageUrl('Izuku Midoriya', 'My Hero Academia'),
    stats: {
      strength: 85,
      speed: 82,
      durability: 78,
      stamina: 88,
      energyOutput: 84,
      techniqueProficiency: 80,
      experience: 68,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'deku-ofa',
        name: 'One For All',
        type: 'Quirk',
        description: 'Stockpiled power passed down through generations.',
        powerLevel: 90,
      },
      {
        id: 'deku-100-percent',
        name: '100% Full Cowl',
        type: 'Power Up',
        description: 'Full power throughout entire body without breaking bones.',
        powerLevel: 92,
      },
      {
        id: 'deku-blackwhip',
        name: 'Blackwhip',
        type: 'Quirk',
        description: 'Dark energy tendrils for grappling and capturing.',
        powerLevel: 80,
      },
      {
        id: 'deku-analysis',
        name: 'Quirk Analysis',
        type: 'Passive',
        description: 'Strategic mind that analyzes opponent abilities instantly.',
        powerLevel: 88,
      },
    ],
  },
  allmight: {
    id: 'all-might',
    name: 'Toshinori Yagi / All Might',
    universe: 'My Hero Academia',
    version: 'Prime Era',
    description:
      'Symbol of Peace. Former #1 Hero and previous wielder of One For All at its peak power.',
    imageUrl: getCharacterImageUrl('All Might', 'My Hero Academia'),
    stats: {
      strength: 100,
      speed: 92,
      durability: 88,
      stamina: 82,
      energyOutput: 95,
      techniqueProficiency: 90,
      experience: 98,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'allmight-united-states-of-smash',
        name: 'United States of Smash',
        type: 'Ultimate Attack',
        description: 'Final 100% punch that changes weather patterns.',
        powerLevel: 100,
      },
      {
        id: 'allmight-detroit-smash',
        name: 'Detroit Smash',
        type: 'Physical Attack',
        description: 'Iconic punch that creates shockwaves.',
        powerLevel: 95,
      },
      {
        id: 'allmight-ofa-prime',
        name: 'One For All Prime',
        type: 'Quirk',
        description: 'Peak power of stockpiled generations.',
        powerLevel: 100,
      },
      {
        id: 'allmight-symbol',
        name: 'Symbol of Peace',
        type: 'Passive',
        description: 'Just his presence lowers crime rate to near zero.',
        powerLevel: 92,
      },
    ],
  },

  // Image Comics
  spawn: {
    id: 'spawn',
    name: 'Al Simmons / Spawn',
    universe: 'Image Comics',
    version: 'Hellspawn',
    description:
      'Former CIA assassin reborn as a Hellspawn with necroplasmic powers, demonic abilities, and command over darkness.',
    imageUrl: getCharacterImageUrl('Spawn', 'Image Comics'),
    stats: {
      strength: 88,
      speed: 85,
      durability: 92,
      stamina: 95,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'spawn-necroplasm',
        name: 'Necroplasmic Energy',
        type: 'Energy Manipulation',
        description: 'Hell-powered energy with limitless potential.',
        powerLevel: 94,
      },
      {
        id: 'spawn-chains',
        name: 'Living Chains',
        type: 'Weapon',
        description: 'Sentient chains that obey his will.',
        powerLevel: 90,
      },
      {
        id: 'spawn-suit',
        name: 'Symbiotic Suit',
        type: 'Passive',
        description: 'Living armor that heals and shape-shifts.',
        powerLevel: 92,
      },
      {
        id: 'spawn-cape',
        name: 'Dimensional Cape',
        type: 'Ability',
        description: 'Cape serves as portal to hell dimension.',
        powerLevel: 88,
      },
    ],
  },

  // Lord of the Rings
  frodo: {
    id: 'frodo-baggins',
    name: 'Frodo Baggins',
    universe: 'Lord of the Rings',
    version: 'Ring-bearer',
    description:
      'Hobbit of the Shire who bore the One Ring to Mount Doom. Extraordinary willpower and resistance to corruption.',
    imageUrl: getCharacterImageUrl('Frodo Baggins', 'Lord of the Rings'),
    stats: {
      strength: 22,
      speed: 35,
      durability: 45,
      stamina: 65,
      energyOutput: 15,
      techniqueProficiency: 30,
      experience: 55,
      adaptability: 78,
    },
    abilities: [
      {
        id: 'frodo-ring',
        name: 'One Ring',
        type: 'Artifact',
        description: 'Most powerful ring that corrupts all who bear it.',
        powerLevel: 100,
      },
      {
        id: 'frodo-sting',
        name: 'Sting',
        type: 'Weapon',
        description: 'Elven blade that glows blue near orcs.',
        powerLevel: 45,
      },
      {
        id: 'frodo-mithril',
        name: 'Mithril Shirt',
        type: 'Defense',
        description: 'Lightweight armor stronger than steel.',
        powerLevel: 70,
      },
      {
        id: 'frodo-willpower',
        name: 'Indomitable Will',
        type: 'Passive',
        description: 'Resists Ring corruption longer than anyone.',
        powerLevel: 95,
      },
    ],
  },
  gandalf: {
    id: 'gandalf',
    name: 'Gandalf the White',
    universe: 'Lord of the Rings',
    version: 'Resurrected Wizard',
    description:
      'Maiar wizard sent to Middle-earth. Died fighting the Balrog and returned with greater power to lead against Sauron.',
    imageUrl: getCharacterImageUrl('Gandalf', 'Lord of the Rings'),
    stats: {
      strength: 68,
      speed: 62,
      durability: 75,
      stamina: 85,
      energyOutput: 92,
      techniqueProficiency: 98,
      experience: 100,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'gandalf-magic',
        name: 'Istari Magic',
        type: 'Sorcery',
        description: 'Ancient magic of the wizards sent from Valinor.',
        powerLevel: 95,
      },
      {
        id: 'gandalf-staff',
        name: 'Staff of Power',
        type: 'Weapon',
        description: 'Focus for magical abilities and combat.',
        powerLevel: 88,
      },
      {
        id: 'gandalf-light',
        name: 'Light of the Valar',
        type: 'Divine Power',
        description: 'Can banish darkness and evil.',
        powerLevel: 94,
      },
      {
        id: 'gandalf-wisdom',
        name: 'Ancient Wisdom',
        type: 'Passive',
        description: 'Thousands of years of knowledge and strategy.',
        powerLevel: 100,
      },
    ],
  },

  // More Dragon Ball
  gohan: {
    id: 'gohan',
    name: 'Son Gohan',
    universe: 'Dragon Ball Z',
    version: 'Ultimate/Mystic Form',
    description:
      "Goku's son with the highest potential of any Saiyan. Mystic form unlocked by Old Kai surpasses Super Saiyan.",
    imageUrl: getCharacterImageUrl('Gohan', 'Dragon Ball'),
    stats: {
      strength: 94,
      speed: 88,
      durability: 86,
      stamina: 84,
      energyOutput: 96,
      techniqueProficiency: 82,
      experience: 78,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'gohan-mystic',
        name: 'Mystic Form',
        type: 'Transformation',
        description: 'Hidden potential unleashed without Super Saiyan.',
        powerLevel: 96,
      },
      {
        id: 'gohan-kamehameha',
        name: 'Father-Son Kamehameha',
        type: 'Energy Attack',
        description: "Kamehameha powered by Goku's spirit.",
        powerLevel: 94,
      },
      {
        id: 'gohan-masenko',
        name: 'Masenko',
        type: 'Energy Attack',
        description: 'Signature yellow energy blast.',
        powerLevel: 85,
      },
      {
        id: 'gohan-potential',
        name: 'Limitless Potential',
        type: 'Passive',
        description: 'Hidden power surpassing all Saiyans when enraged.',
        powerLevel: 95,
      },
    ],
  },
  piccolo: {
    id: 'piccolo',
    name: 'Piccolo',
    universe: 'Dragon Ball Z',
    version: 'Fused Namekian',
    description:
      'Namekian warrior who trained Gohan. Fused with Nail and Kami to achieve ultimate Namekian power.',
    imageUrl: getCharacterImageUrl('Piccolo', 'Dragon Ball'),
    stats: {
      strength: 78,
      speed: 80,
      durability: 82,
      stamina: 88,
      energyOutput: 84,
      techniqueProficiency: 92,
      experience: 90,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'piccolo-special-beam',
        name: 'Special Beam Cannon',
        type: 'Energy Attack',
        description: 'Spiraling drill beam that pierces anything.',
        powerLevel: 88,
      },
      {
        id: 'piccolo-regeneration',
        name: 'Namekian Regeneration',
        type: 'Passive',
        description: 'Can regenerate lost limbs and heal injuries.',
        powerLevel: 90,
      },
      {
        id: 'piccolo-hellzone',
        name: 'Hellzone Grenade',
        type: 'Energy Attack',
        description: 'Surrounds enemy with energy spheres.',
        powerLevel: 82,
      },
      {
        id: 'piccolo-fusion',
        name: 'Namekian Fusion',
        type: 'Power Up',
        description: 'Absorbed Nail and Kami for massive power boost.',
        powerLevel: 92,
      },
    ],
  },

  // More Naruto
  kakashi: {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    universe: 'Naruto',
    version: 'Dual Mangekyou Sharingan',
    description:
      'Copy Ninja who has copied over 1000 jutsu. Former Hokage with Sharingan gifted by Obito.',
    imageUrl: getCharacterImageUrl('Kakashi Hatake', 'Naruto'),
    stats: {
      strength: 72,
      speed: 84,
      durability: 75,
      stamina: 70,
      energyOutput: 86,
      techniqueProficiency: 98,
      experience: 96,
      adaptability: 95,
    },
    abilities: [
      {
        id: 'kakashi-chidori',
        name: 'Lightning Blade "Chidori"',
        type: 'Ninjutsu',
        description: 'Created chidori, high-speed lightning attack.',
        powerLevel: 88,
      },
      {
        id: 'kakashi-kamui',
        name: 'Kamui',
        type: 'Space-Time Ninjutsu',
        description: 'Mangekyou ability warps targets to dimension.',
        powerLevel: 95,
      },
      {
        id: 'kakashi-copy',
        name: 'Copy Ninja',
        type: 'Passive',
        description: 'Can copy any jutsu seen with Sharingan.',
        powerLevel: 92,
      },
      {
        id: 'kakashi-susanoo',
        name: 'Perfect Susanoo',
        type: 'Ultimate Form',
        description: 'Dual Mangekyou grants perfect Susanoo with Kamui shuriken.',
        powerLevel: 96,
      },
    ],
  },
  madara: {
    id: 'madara',
    name: 'Madara Uchiha',
    universe: 'Naruto',
    version: 'Sage of Six Paths',
    description:
      'Legendary Uchiha who fought Hashirama. Reanimated and gained Rinnegan, then absorbed Ten-Tails.',
    imageUrl: getCharacterImageUrl('Madara Uchiha', 'Naruto'),
    stats: {
      strength: 94,
      speed: 90,
      durability: 92,
      stamina: 98,
      energyOutput: 98,
      techniqueProficiency: 99,
      experience: 100,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'madara-perfect-susanoo',
        name: 'Perfect Susanoo',
        type: 'Summoning',
        description: 'Mountain-sized chakra warrior.',
        powerLevel: 97,
      },
      {
        id: 'madara-meteor',
        name: 'Tengai Shinsei',
        type: 'Rinnegan Jutsu',
        description: 'Summons giant meteorites from space.',
        powerLevel: 99,
      },
      {
        id: 'madara-limbo',
        name: 'Limbo Clones',
        type: 'Rinnegan Jutsu',
        description: 'Invisible shadow clones in different dimension.',
        powerLevel: 96,
      },
      {
        id: 'madara-six-paths',
        name: 'Six Paths Sage Mode',
        type: 'Transformation',
        description: 'God-tier power from Ten-Tails.',
        powerLevel: 100,
      },
    ],
  },

  // More One Piece
  sanji: {
    id: 'sanji',
    name: 'Vinsmoke Sanji',
    universe: 'One Piece',
    version: 'Ifrit Jambe',
    description:
      'Cook of Straw Hat Pirates with black leg fighting style. Enhanced Germa genetics awakened.',
    imageUrl: getCharacterImageUrl('Sanji', 'One Piece'),
    stats: {
      strength: 82,
      speed: 92,
      durability: 80,
      stamina: 86,
      energyOutput: 78,
      techniqueProficiency: 92,
      experience: 84,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'sanji-ifrit-jambe',
        name: 'Ifrit Jambe',
        type: 'Fighting Style',
        description: 'Blue flames hotter than regular Diable Jambe.',
        powerLevel: 92,
      },
      {
        id: 'sanji-sky-walk',
        name: 'Sky Walk',
        type: 'Movement',
        description: 'Kicks air to fly at high speeds.',
        powerLevel: 85,
      },
      {
        id: 'sanji-observation-haki',
        name: 'Advanced Observation Haki',
        type: 'Haki',
        description: 'Can sense womens tears from miles away.',
        powerLevel: 88,
      },
      {
        id: 'sanji-exoskeleton',
        name: 'Germa Exoskeleton',
        type: 'Passive',
        description: 'Awakened Germa genes grant superhuman durability.',
        powerLevel: 90,
      },
    ],
  },
  shanks: {
    id: 'shanks',
    name: 'Red-Haired Shanks',
    universe: 'One Piece',
    version: 'Yonko',
    description:
      "One of the Four Emperors. Luffy's role model who sacrificed his arm to save him. Master of all three Haki.",
    imageUrl: getCharacterImageUrl('Shanks', 'One Piece'),
    stats: {
      strength: 92,
      speed: 88,
      durability: 85,
      stamina: 90,
      energyOutput: 96,
      techniqueProficiency: 98,
      experience: 98,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'shanks-conquerors',
        name: "Supreme Conqueror's Haki",
        type: 'Haki',
        description: 'Haki so strong it damages physical objects.',
        powerLevel: 100,
      },
      {
        id: 'shanks-swordsmanship',
        name: 'Legendary Swordsmanship',
        type: 'Combat Skill',
        description: 'Rivaled Mihawk before losing his arm.',
        powerLevel: 96,
      },
      {
        id: 'shanks-future-sight',
        name: 'Advanced Observation Haki',
        type: 'Haki',
        description: 'Can see seconds into the future.',
        powerLevel: 94,
      },
      {
        id: 'shanks-presence',
        name: "Emperor's Presence",
        type: 'Passive',
        description: 'Mere presence ends wars and stops admirals.',
        powerLevel: 98,
      },
    ],
  },

  // More Marvel
  ironman: {
    id: 'ironman',
    name: 'Tony Stark / Iron Man',
    universe: 'Marvel',
    version: 'Model Prime',
    description:
      'Genius billionaire in powered armor. Self-made superhero with tech surpassing most alien civilizations.',
    imageUrl: getCharacterImageUrl('Iron Man', 'Marvel'),
    stats: {
      strength: 88,
      speed: 85,
      durability: 92,
      stamina: 70,
      energyOutput: 96,
      techniqueProficiency: 95,
      experience: 88,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'ironman-unibeam',
        name: 'Unibeam',
        type: 'Energy Weapon',
        description: 'Chest-mounted energy beam.',
        powerLevel: 92,
      },
      {
        id: 'ironman-repulsors',
        name: 'Repulsor Rays',
        type: 'Energy Weapon',
        description: 'Palm-mounted energy blasts.',
        powerLevel: 88,
      },
      {
        id: 'ironman-genius',
        name: 'Super-Genius Intellect',
        type: 'Passive',
        description: 'One of smartest humans on Earth.',
        powerLevel: 98,
      },
      {
        id: 'ironman-armor',
        name: 'Model Prime Armor',
        type: 'Equipment',
        description: 'Nanotech armor with unlimited applications.',
        powerLevel: 96,
      },
    ],
  },
  captainamerica: {
    id: 'captainamerica',
    name: 'Steve Rogers / Captain America',
    universe: 'Marvel',
    version: 'Super Soldier',
    description:
      'Peak human enhanced by super soldier serum. Natural leader and master tactician with unbreakable shield.',
    imageUrl: getCharacterImageUrl('Captain America', 'Marvel'),
    stats: {
      strength: 56,
      speed: 62,
      durability: 68,
      stamina: 78,
      energyOutput: 30,
      techniqueProficiency: 98,
      experience: 100,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'cap-shield',
        name: 'Vibranium Shield',
        type: 'Weapon',
        description: 'Indestructible shield that defies physics.',
        powerLevel: 92,
      },
      {
        id: 'cap-super-soldier',
        name: 'Super Soldier Serum',
        type: 'Passive',
        description: 'Peak human strength, speed, and reflexes.',
        powerLevel: 85,
      },
      {
        id: 'cap-leadership',
        name: 'Master Tactician',
        type: 'Passive',
        description: 'Can lead and inspire any team.',
        powerLevel: 100,
      },
      {
        id: 'cap-combat',
        name: 'Master Martial Artist',
        type: 'Combat Skill',
        description: 'Mastered multiple fighting styles.',
        powerLevel: 95,
      },
    ],
  },
  drstrange: {
    id: 'drstrange',
    name: 'Stephen Strange / Doctor Strange',
    universe: 'Marvel',
    version: 'Sorcerer Supreme',
    description:
      'Master of the Mystic Arts and Sorcerer Supreme. Former neurosurgeon who commands reality-warping magic.',
    imageUrl: getCharacterImageUrl('Doctor Strange', 'Marvel'),
    stats: {
      strength: 38,
      speed: 42,
      durability: 48,
      stamina: 65,
      energyOutput: 98,
      techniqueProficiency: 100,
      experience: 92,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'strange-time-stone',
        name: 'Eye of Agamotto',
        type: 'Artifact',
        description: 'Contains Time Stone for time manipulation.',
        powerLevel: 100,
      },
      {
        id: 'strange-mirror-dimension',
        name: 'Mirror Dimension',
        type: 'Sorcery',
        description: 'Trap foes in alternate reality.',
        powerLevel: 94,
      },
      {
        id: 'strange-bolts',
        name: 'Bolts of Balthakk',
        type: 'Offensive Magic',
        description: 'Mystical energy projectiles.',
        powerLevel: 90,
      },
      {
        id: 'strange-astral-projection',
        name: 'Astral Projection',
        type: 'Ability',
        description: 'Separate soul from body.',
        powerLevel: 88,
      },
    ],
  },

  // More DC
  flash: {
    id: 'flash',
    name: 'Barry Allen / The Flash',
    universe: 'DC Comics',
    version: 'Speed Force',
    description:
      'Fastest man alive connected to the Speed Force. Can move faster than light and travel through time.',
    imageUrl: getCharacterImageUrl('Flash', 'DC Universe'),
    stats: {
      strength: 52,
      speed: 100,
      durability: 65,
      stamina: 88,
      energyOutput: 75,
      techniqueProficiency: 82,
      experience: 86,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'flash-speedforce',
        name: 'Speed Force',
        type: 'Passive',
        description: 'Connection to infinite speed energy.',
        powerLevel: 100,
      },
      {
        id: 'flash-time-travel',
        name: 'Time Travel',
        type: 'Ability',
        description: 'Move fast enough to travel through time.',
        powerLevel: 98,
      },
      {
        id: 'flash-infinite-mass-punch',
        name: 'Infinite Mass Punch',
        type: 'Attack',
        description: 'Punch at near-light speed with infinite force.',
        powerLevel: 100,
      },
      {
        id: 'flash-phasing',
        name: 'Molecular Phasing',
        type: 'Ability',
        description: 'Vibrate through solid matter.',
        powerLevel: 90,
      },
    ],
  },
  greenlantern: {
    id: 'greenlantern',
    name: 'Hal Jordan / Green Lantern',
    universe: 'DC Comics',
    version: 'Green Lantern Corps',
    description:
      'Wielder of the most powerful weapon in universe. Will-powered ring creates anything imaginable.',
    imageUrl: getCharacterImageUrl('Green Lantern', 'DC Universe'),
    stats: {
      strength: 75,
      speed: 78,
      durability: 85,
      stamina: 92,
      energyOutput: 96,
      techniqueProficiency: 88,
      experience: 90,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'gl-ring',
        name: 'Power Ring',
        type: 'Equipment',
        description: 'Most powerful weapon in universe limited only by willpower.',
        powerLevel: 98,
      },
      {
        id: 'gl-constructs',
        name: 'Hard-Light Constructs',
        type: 'Ability',
        description: 'Create anything imagined from green energy.',
        powerLevel: 94,
      },
      {
        id: 'gl-flight',
        name: 'Space Flight',
        type: 'Movement',
        description: 'Fly at faster-than-light speeds.',
        powerLevel: 90,
      },
      {
        id: 'gl-willpower',
        name: 'Indomitable Will',
        type: 'Passive',
        description: 'Willpower overcomes fear and mind control.',
        powerLevel: 96,
      },
    ],
  },

  // Demon Slayer
  tanjiro: {
    id: 'tanjiro',
    name: 'Tanjiro Kamado',
    universe: 'Demon Slayer',
    version: 'Sun Breathing',
    description:
      'Demon Slayer who uses Water Breathing and learned legendary Sun Breathing. Kind heart with unbreakable will.',
    imageUrl: getCharacterImageUrl('Tanjiro Kamado', 'Demon Slayer'),
    stats: {
      strength: 74,
      speed: 80,
      durability: 76,
      stamina: 88,
      energyOutput: 82,
      techniqueProficiency: 86,
      experience: 70,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'tanjiro-sun-breathing',
        name: 'Sun Breathing',
        type: 'Breathing Style',
        description: 'Original and strongest breathing technique.',
        powerLevel: 94,
      },
      {
        id: 'tanjiro-transparent-world',
        name: 'Transparent World',
        type: 'Perception',
        description: 'See through enemies to predict movements.',
        powerLevel: 88,
      },
      {
        id: 'tanjiro-mark',
        name: 'Demon Slayer Mark',
        type: 'Power Up',
        description: 'Enhanced physical abilities at cost of lifespan.',
        powerLevel: 85,
      },
      {
        id: 'tanjiro-sense',
        name: 'Enhanced Sense of Smell',
        type: 'Passive',
        description: 'Can smell emotions and detect enemies.',
        powerLevel: 82,
      },
    ],
  },
  rengoku: {
    id: 'rengoku',
    name: 'Kyojuro Rengoku',
    universe: 'Demon Slayer',
    version: 'Flame Hashira',
    description:
      'Flame Hashira with burning passion. Master of Flame Breathing who protected others until his death.',
    imageUrl: getCharacterImageUrl('Kyojuro Rengoku', 'Demon Slayer'),
    stats: {
      strength: 82,
      speed: 86,
      durability: 84,
      stamina: 90,
      energyOutput: 88,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'rengoku-flame-breathing',
        name: 'Flame Breathing',
        type: 'Breathing Style',
        description: 'Powerful flame techniques passed down his family.',
        powerLevel: 92,
      },
      {
        id: 'rengoku-ninth-form',
        name: 'Ninth Form: Rengoku',
        type: 'Ultimate Attack',
        description: 'Devastating flame strike named after himself.',
        powerLevel: 94,
      },
      {
        id: 'rengoku-mark',
        name: 'Potential Demon Slayer Mark',
        type: 'Power Up',
        description: 'On verge of awakening the mark.',
        powerLevel: 86,
      },
      {
        id: 'rengoku-spirit',
        name: 'Unyielding Spirit',
        type: 'Passive',
        description: 'Will never give up protecting others.',
        powerLevel: 98,
      },
    ],
  },

  // Jujutsu Kaisen
  gojo: {
    id: 'gojo',
    name: 'Satoru Gojo',
    universe: 'Jujutsu Kaisen',
    version: 'Six Eyes + Limitless',
    description:
      'Strongest jujutsu sorcerer alive. Six Eyes and Limitless technique make him virtually invincible.',
    imageUrl: getCharacterImageUrl('Satoru Gojo', 'Jujutsu Kaisen'),
    stats: {
      strength: 78,
      speed: 92,
      durability: 100,
      stamina: 95,
      energyOutput: 100,
      techniqueProficiency: 100,
      experience: 90,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'gojo-infinity',
        name: 'Infinity',
        type: 'Cursed Technique',
        description: 'Infinite space between him and attacks makes him untouchable.',
        powerLevel: 100,
      },
      {
        id: 'gojo-unlimited-void',
        name: 'Unlimited Void',
        type: 'Domain Expansion',
        description: 'Overloads brain with infinite information.',
        powerLevel: 100,
      },
      {
        id: 'gojo-hollow-purple',
        name: 'Hollow Purple',
        type: 'Cursed Technique',
        description: 'Erases matter from existence.',
        powerLevel: 98,
      },
      {
        id: 'gojo-six-eyes',
        name: 'Six Eyes',
        type: 'Passive',
        description: 'Perfect cursed energy efficiency and perception.',
        powerLevel: 100,
      },
    ],
  },
  sukuna: {
    id: 'sukuna',
    name: 'Ryomen Sukuna',
    universe: 'Jujutsu Kaisen',
    version: 'King of Curses',
    description:
      'The undisputed King of Curses from thousand years ago. Unmatched cursed technique mastery.',
    imageUrl: getCharacterImageUrl('Sukuna', 'Jujutsu Kaisen'),
    stats: {
      strength: 96,
      speed: 94,
      durability: 98,
      stamina: 100,
      energyOutput: 100,
      techniqueProficiency: 100,
      experience: 100,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'sukuna-cleave',
        name: 'Cleave',
        type: 'Cursed Technique',
        description: "Slashing attack that adjusts to target's toughness.",
        powerLevel: 96,
      },
      {
        id: 'sukuna-malevolent-shrine',
        name: 'Malevolent Shrine',
        type: 'Domain Expansion',
        description: 'Domain without barrier that shreds everything in 200 meters.',
        powerLevel: 100,
      },
      {
        id: 'sukuna-fire-arrow',
        name: 'Fire Arrow',
        type: 'Cursed Technique',
        description: 'Devastating flame technique.',
        powerLevel: 94,
      },
      {
        id: 'sukuna-knowledge',
        name: 'Ancient Cursed Knowledge',
        type: 'Passive',
        description: 'Thousand years of jujutsu mastery.',
        powerLevel: 100,
      },
    ],
  },

  // Hunter x Hunter
  gon: {
    id: 'gon',
    name: 'Gon Freecss',
    universe: 'Hunter x Hunter',
    version: 'Adult Gon',
    description:
      'Young hunter with limitless potential. Can transform into adult form sacrificing everything for ultimate power.',
    imageUrl: getCharacterImageUrl('Gon Freecss', 'Hunter x Hunter'),
    stats: {
      strength: 72,
      speed: 78,
      durability: 74,
      stamina: 82,
      energyOutput: 76,
      techniqueProficiency: 68,
      experience: 62,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'gon-jajanken',
        name: 'Jajanken',
        type: 'Nen Ability',
        description: 'Rock-paper-scissors attack with punch, emission, and blade.',
        powerLevel: 84,
      },
      {
        id: 'gon-adult-form',
        name: 'Adult Form',
        type: 'Transformation',
        description: 'Sacrifices everything to reach peak potential instantly.',
        powerLevel: 100,
      },
      {
        id: 'gon-enhancement',
        name: 'Enhancement Nen',
        type: 'Passive',
        description: 'Enhancer with massive aura reserves.',
        powerLevel: 86,
      },
      {
        id: 'gon-instinct',
        name: 'Beast Instinct',
        type: 'Passive',
        description: 'Animal-like senses and intuition.',
        powerLevel: 80,
      },
    ],
  },
  killua: {
    id: 'killua',
    name: 'Killua Zoldyck',
    universe: 'Hunter x Hunter',
    version: 'Godspeed',
    description:
      'Heir to Zoldyck assassin family. Transmutation user who transforms aura into electricity.',
    imageUrl: getCharacterImageUrl('Killua Zoldyck', 'Hunter x Hunter'),
    stats: {
      strength: 68,
      speed: 95,
      durability: 72,
      stamina: 78,
      energyOutput: 82,
      techniqueProficiency: 92,
      experience: 75,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'killua-godspeed',
        name: 'Godspeed',
        type: 'Nen Ability',
        description: 'Lightning speed mode with auto-dodge and burst.',
        powerLevel: 96,
      },
      {
        id: 'killua-thunderbolt',
        name: 'Thunderbolt',
        type: 'Nen Ability',
        description: 'Electricity-based attack.',
        powerLevel: 88,
      },
      {
        id: 'killua-assassin',
        name: 'Assassin Training',
        type: 'Passive',
        description: 'Trained since birth in assassination techniques.',
        powerLevel: 90,
      },
      {
        id: 'killua-immunity',
        name: 'Poison & Electricity Immunity',
        type: 'Passive',
        description: 'Immune to poison and electricity from training.',
        powerLevel: 85,
      },
    ],
  },

  // Misc Popular
  kratos: {
    id: 'kratos',
    name: 'Kratos',
    universe: 'God of War',
    version: 'Norse Era',
    description:
      'Former Greek God of War now in Norse realms. Killed entire Greek pantheon, now faces Norse gods.',
    imageUrl: getCharacterImageUrl('Kratos', 'God of War'),
    stats: {
      strength: 98,
      speed: 82,
      durability: 95,
      stamina: 96,
      energyOutput: 90,
      techniqueProficiency: 96,
      experience: 100,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'kratos-blades',
        name: 'Blades of Chaos',
        type: 'Weapon',
        description: 'Chained blades bound to his soul.',
        powerLevel: 94,
      },
      {
        id: 'kratos-rage',
        name: 'Spartan Rage',
        type: 'Power Up',
        description: 'Unleashes godly fury for devastating strength.',
        powerLevel: 96,
      },
      {
        id: 'kratos-godkiller',
        name: 'Godkiller',
        type: 'Passive',
        description: 'Has killed countless gods and titans.',
        powerLevel: 100,
      },
      {
        id: 'kratos-determination',
        name: 'Unstoppable Determination',
        type: 'Passive',
        description: 'Nothing stops him from his goal.',
        powerLevel: 98,
      },
    ],
  },
  doomslayer: {
    id: 'doomslayer',
    name: 'Doom Slayer',
    universe: 'DOOM',
    version: 'Eternal',
    description:
      'Unkillable demon-slaying machine powered by rage. Single-handedly cleansed Hell multiple times.',
    imageUrl: getCharacterImageUrl('Doom Slayer', 'DOOM'),
    stats: {
      strength: 94,
      speed: 88,
      durability: 98,
      stamina: 100,
      energyOutput: 92,
      techniqueProficiency: 96,
      experience: 100,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'doomslayer-praetor-suit',
        name: 'Praetor Suit',
        type: 'Equipment',
        description: 'Near-indestructible armor.',
        powerLevel: 96,
      },
      {
        id: 'doomslayer-glory-kills',
        name: 'Glory Kills',
        type: 'Combat Skill',
        description: 'Brutal finishers that restore health.',
        powerLevel: 90,
      },
      {
        id: 'doomslayer-bfg',
        name: 'BFG-9000',
        type: 'Weapon',
        description: 'Most powerful weapon ever created.',
        powerLevel: 100,
      },
      {
        id: 'doomslayer-rage',
        name: 'Endless Rage',
        type: 'Passive',
        description: 'Anger fuels him, cannot be stopped or reasoned with.',
        powerLevel: 100,
      },
    ],
  },

  // More Dragon Ball
  frieza: {
    id: 'frieza',
    name: 'Frieza',
    universe: 'Dragon Ball Z',
    version: 'Golden Form',
    description:
      'Galactic Emperor who destroyed Planet Vegeta. Achieved Golden form surpassing gods.',
    imageUrl: getCharacterImageUrl('Frieza', 'Dragon Ball'),
    stats: {
      strength: 95,
      speed: 92,
      durability: 88,
      stamina: 86,
      energyOutput: 98,
      techniqueProficiency: 94,
      experience: 96,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'frieza-death-beam',
        name: 'Death Beam',
        type: 'Energy Attack',
        description: 'Precise finger laser that pierces through anything.',
        powerLevel: 92,
      },
      {
        id: 'frieza-golden',
        name: 'Golden Frieza',
        type: 'Transformation',
        description: 'Ultimate form with godly power.',
        powerLevel: 98,
      },
      {
        id: 'frieza-death-ball',
        name: 'Supernova Death Ball',
        type: 'Energy Attack',
        description: 'Planet-destroying energy sphere.',
        powerLevel: 96,
      },
      {
        id: 'frieza-telekinesis',
        name: 'Psychokinesis',
        type: 'Ability',
        description: 'Powerful telekinetic control.',
        powerLevel: 85,
      },
    ],
  },
  cell: {
    id: 'cell',
    name: 'Perfect Cell',
    universe: 'Dragon Ball Z',
    version: 'Perfect Form',
    description:
      'Bio-android with cells from greatest fighters. Can regenerate and copy techniques.',
    imageUrl: getCharacterImageUrl('Cell', 'Dragon Ball'),
    stats: {
      strength: 90,
      speed: 88,
      durability: 92,
      stamina: 94,
      energyOutput: 92,
      techniqueProficiency: 96,
      experience: 75,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'cell-kamehameha',
        name: 'Perfect Kamehameha',
        type: 'Energy Attack',
        description: "Perfected version of Goku's technique.",
        powerLevel: 94,
      },
      {
        id: 'cell-regeneration',
        name: 'Perfect Regeneration',
        type: 'Passive',
        description: 'Can regenerate from a single cell.',
        powerLevel: 98,
      },
      {
        id: 'cell-zenkai',
        name: 'Saiyan Zenkai Boost',
        type: 'Passive',
        description: 'Gets stronger after near-death.',
        powerLevel: 92,
      },
      {
        id: 'cell-absorption',
        name: 'Power Absorption',
        type: 'Ability',
        description: 'Absorbs beings to gain power.',
        powerLevel: 90,
      },
    ],
  },
  buu: {
    id: 'buu',
    name: 'Majin Buu',
    universe: 'Dragon Ball Z',
    version: 'Kid Buu',
    description:
      'Ancient magical being of pure destruction. Most dangerous form with no restraint.',
    imageUrl: getCharacterImageUrl('Majin Buu', 'Dragon Ball'),
    stats: {
      strength: 88,
      speed: 85,
      durability: 100,
      stamina: 100,
      energyOutput: 94,
      techniqueProficiency: 70,
      experience: 100,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'buu-candy-beam',
        name: 'Candy Beam',
        type: 'Magic',
        description: 'Turns enemies into candy.',
        powerLevel: 88,
      },
      {
        id: 'buu-regeneration',
        name: 'Majin Regeneration',
        type: 'Passive',
        description: 'Near-instant regeneration from any damage.',
        powerLevel: 100,
      },
      {
        id: 'buu-absorption',
        name: 'Absorption',
        type: 'Ability',
        description: 'Absorbs victims to gain their power.',
        powerLevel: 92,
      },
      {
        id: 'buu-planet-burst',
        name: 'Planet Burst',
        type: 'Energy Attack',
        description: 'Destroys entire planets instantly.',
        powerLevel: 96,
      },
    ],
  },
  broly: {
    id: 'broly',
    name: 'Broly',
    universe: 'Dragon Ball Super',
    version: 'Legendary Super Saiyan',
    description:
      'Legendary Super Saiyan with limitless power. Strength grows infinitely during battle.',
    imageUrl: getCharacterImageUrl('Broly', 'Dragon Ball'),
    stats: {
      strength: 98,
      speed: 90,
      durability: 95,
      stamina: 98,
      energyOutput: 100,
      techniqueProficiency: 75,
      experience: 65,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'broly-lssj',
        name: 'Legendary Super Saiyan',
        type: 'Transformation',
        description: 'Berserker form with unlimited power growth.',
        powerLevel: 100,
      },
      {
        id: 'broly-eraser-cannon',
        name: 'Eraser Cannon',
        type: 'Energy Attack',
        description: 'Massive green energy blast.',
        powerLevel: 96,
      },
      {
        id: 'broly-rage',
        name: 'Infinite Rage Power',
        type: 'Passive',
        description: 'Power increases infinitely with anger.',
        powerLevel: 98,
      },
      {
        id: 'broly-gigantic-roar',
        name: 'Gigantic Roar',
        type: 'Energy Attack',
        description: 'Explosive energy sphere attack.',
        powerLevel: 94,
      },
    ],
  },
  jiren: {
    id: 'jiren',
    name: 'Jiren',
    universe: 'Dragon Ball Super',
    version: 'Full Power',
    description:
      'Strongest mortal in Universe 11. Surpassed his own God of Destruction through meditation.',
    imageUrl: getCharacterImageUrl('Jiren', 'Dragon Ball'),
    stats: {
      strength: 100,
      speed: 95,
      durability: 98,
      stamina: 96,
      energyOutput: 98,
      techniqueProficiency: 92,
      experience: 94,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'jiren-power-impact',
        name: 'Power Impact',
        type: 'Energy Attack',
        description: 'Overwhelming explosive force.',
        powerLevel: 98,
      },
      {
        id: 'jiren-meditation',
        name: 'Meditation Power',
        type: 'Passive',
        description: 'Transcended limits through intense meditation.',
        powerLevel: 96,
      },
      {
        id: 'jiren-glare',
        name: 'Invisible Eye Blast',
        type: 'Energy Attack',
        description: 'Devastating invisible ki attack.',
        powerLevel: 94,
      },
      {
        id: 'jiren-limit-break',
        name: 'Limit Breaker',
        type: 'Transformation',
        description: 'Surpasses all known limits.',
        powerLevel: 100,
      },
    ],
  },
  trunks: {
    id: 'trunks',
    name: 'Future Trunks',
    universe: 'Dragon Ball Z',
    version: 'Super Saiyan Rage',
    description: 'Time-traveling Saiyan from apocalyptic future. Achieved Super Saiyan Rage form.',
    imageUrl: getCharacterImageUrl('Trunks', 'Dragon Ball'),
    stats: {
      strength: 86,
      speed: 88,
      durability: 82,
      stamina: 90,
      energyOutput: 90,
      techniqueProficiency: 88,
      experience: 85,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'trunks-burning-attack',
        name: 'Burning Attack',
        type: 'Energy Attack',
        description: 'Explosive energy wave.',
        powerLevel: 85,
      },
      {
        id: 'trunks-sword',
        name: 'Brave Sword Strike',
        type: 'Weapon Attack',
        description: 'Powerful sword technique.',
        powerLevel: 88,
      },
      {
        id: 'trunks-ss-rage',
        name: 'Super Saiyan Rage',
        type: 'Transformation',
        description: 'Unique rage-powered Super Saiyan form.',
        powerLevel: 92,
      },
      {
        id: 'trunks-final-hope-slash',
        name: 'Final Hope Slash',
        type: 'Ultimate Attack',
        description: "Spirit Sword slash with everyone's hope.",
        powerLevel: 94,
      },
    ],
  },

  // More Naruto
  minato: {
    id: 'minato',
    name: 'Minato Namikaze',
    universe: 'Naruto',
    version: 'Fourth Hokage',
    description: 'Yellow Flash of Konoha. Fastest shinobi ever with Flying Thunder God technique.',
    imageUrl: getCharacterImageUrl('Minato', 'Naruto'),
    stats: {
      strength: 76,
      speed: 100,
      durability: 75,
      stamina: 82,
      energyOutput: 88,
      techniqueProficiency: 96,
      experience: 92,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'minato-ftg',
        name: 'Flying Thunder God',
        type: 'Space-Time Ninjutsu',
        description: 'Instant teleportation technique.',
        powerLevel: 98,
      },
      {
        id: 'minato-rasengan',
        name: 'Rasengan',
        type: 'Ninjutsu',
        description: 'Created the Rasengan technique.',
        powerLevel: 88,
      },
      {
        id: 'minato-kcm',
        name: 'Kurama Chakra Mode',
        type: 'Transformation',
        description: 'Nine-Tails chakra mode.',
        powerLevel: 94,
      },
      {
        id: 'minato-reaper',
        name: 'Reaper Death Seal',
        type: 'Forbidden Jutsu',
        description: 'Seals target at cost of own life.',
        powerLevel: 96,
      },
    ],
  },
  jiraiya: {
    id: 'jiraiya',
    name: 'Jiraiya',
    universe: 'Naruto',
    version: 'Sage Mode',
    description: "Legendary Sannin and Toad Sage. Naruto's mentor who mastered Sage Mode.",
    imageUrl: getCharacterImageUrl('Jiraiya', 'Naruto'),
    stats: {
      strength: 78,
      speed: 74,
      durability: 76,
      stamina: 82,
      energyOutput: 84,
      techniqueProficiency: 94,
      experience: 96,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'jiraiya-sage-mode',
        name: 'Sage Mode',
        type: 'Transformation',
        description: 'Toad Sage Mode with nature energy.',
        powerLevel: 90,
      },
      {
        id: 'jiraiya-rasengan',
        name: 'Rasengan',
        type: 'Ninjutsu',
        description: 'Taught the Rasengan to Naruto.',
        powerLevel: 85,
      },
      {
        id: 'jiraiya-toad-summon',
        name: 'Toad Summoning',
        type: 'Summoning',
        description: 'Summons giant battle toads.',
        powerLevel: 88,
      },
      {
        id: 'jiraiya-hair',
        name: 'Needle Jizo',
        type: 'Ninjutsu',
        description: 'Hair hardens into spiky shield.',
        powerLevel: 82,
      },
    ],
  },
  pain: {
    id: 'pain',
    name: 'Pain / Nagato',
    universe: 'Naruto',
    version: 'Six Paths of Pain',
    description:
      'Leader of Akatsuki controlling six bodies with Rinnegan. Can destroy entire villages.',
    imageUrl: getCharacterImageUrl('Nagato', 'Naruto'),
    stats: {
      strength: 82,
      speed: 78,
      durability: 80,
      stamina: 96,
      energyOutput: 96,
      techniqueProficiency: 98,
      experience: 88,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'pain-shinra-tensei',
        name: 'Shinra Tensei',
        type: 'Rinnegan Jutsu',
        description: 'Repels all matter and energy.',
        powerLevel: 96,
      },
      {
        id: 'pain-chibaku-tensei',
        name: 'Chibaku Tensei',
        type: 'Rinnegan Jutsu',
        description: 'Creates massive gravitational sphere.',
        powerLevel: 98,
      },
      {
        id: 'pain-six-paths',
        name: 'Six Paths Technique',
        type: 'Rinnegan Jutsu',
        description: 'Controls six bodies simultaneously.',
        powerLevel: 94,
      },
      {
        id: 'pain-soul-rip',
        name: 'Human Path Soul Rip',
        type: 'Rinnegan Jutsu',
        description: 'Extracts souls from bodies.',
        powerLevel: 92,
      },
    ],
  },
  gaara: {
    id: 'gaara',
    name: 'Gaara',
    universe: 'Naruto',
    version: 'Fifth Kazekage',
    description: 'Jinchuriki of One-Tail who became Kazekage. Ultimate sand manipulation.',
    imageUrl: getCharacterImageUrl('Gaara', 'Naruto'),
    stats: {
      strength: 70,
      speed: 68,
      durability: 85,
      stamina: 80,
      energyOutput: 84,
      techniqueProficiency: 90,
      experience: 82,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'gaara-sand-coffin',
        name: 'Sand Coffin',
        type: 'Ninjutsu',
        description: 'Traps enemies in crushing sand.',
        powerLevel: 86,
      },
      {
        id: 'gaara-absolute-defense',
        name: 'Absolute Defense',
        type: 'Passive',
        description: 'Automatic sand shield blocks all attacks.',
        powerLevel: 92,
      },
      {
        id: 'gaara-shukaku',
        name: 'Shukaku Chakra',
        type: 'Power Up',
        description: 'One-Tailed Beast chakra.',
        powerLevel: 88,
      },
      {
        id: 'gaara-sand-tsunami',
        name: 'Sand Tsunami',
        type: 'Ninjutsu',
        description: 'Massive wave of sand.',
        powerLevel: 84,
      },
    ],
  },
  rocklee: {
    id: 'rocklee',
    name: 'Rock Lee',
    universe: 'Naruto',
    version: 'Eight Gates',
    description: "Taijutsu master who can't use ninjutsu. Opens Eight Gates for tremendous power.",
    imageUrl: getCharacterImageUrl('Rock Lee', 'Naruto'),
    stats: {
      strength: 82,
      speed: 96,
      durability: 78,
      stamina: 94,
      energyOutput: 70,
      techniqueProficiency: 92,
      experience: 80,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'lee-eight-gates',
        name: 'Eight Gates',
        type: 'Forbidden Technique',
        description: 'Opens chakra gates for massive power boost.',
        powerLevel: 96,
      },
      {
        id: 'lee-lotus',
        name: 'Primary Lotus',
        type: 'Taijutsu',
        description: 'High-speed attack combination.',
        powerLevel: 88,
      },
      {
        id: 'lee-speed',
        name: 'Extreme Speed',
        type: 'Passive',
        description: 'Moves faster than eye can see.',
        powerLevel: 94,
      },
      {
        id: 'lee-drunken-fist',
        name: 'Drunken Fist',
        type: 'Taijutsu',
        description: 'Unpredictable fighting style.',
        powerLevel: 86,
      },
    ],
  },
  mightguy: {
    id: 'mightguy',
    name: 'Might Guy',
    universe: 'Naruto',
    version: 'Eight Gates Released',
    description: 'Taijutsu master who opened all Eight Gates. Nearly killed Madara with raw power.',
    imageUrl: getCharacterImageUrl('Might Guy', 'Naruto'),
    stats: {
      strength: 98,
      speed: 100,
      durability: 80,
      stamina: 96,
      energyOutput: 92,
      techniqueProficiency: 96,
      experience: 94,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'guy-night-guy',
        name: 'Night Guy',
        type: 'Ultimate Taijutsu',
        description: 'Strongest taijutsu attack from Eight Gates.',
        powerLevel: 100,
      },
      {
        id: 'guy-afternoon-tiger',
        name: 'Afternoon Tiger',
        type: 'Taijutsu',
        description: 'Air pressure shaped like tiger.',
        powerLevel: 94,
      },
      {
        id: 'guy-gate-of-death',
        name: 'Gate of Death',
        type: 'Forbidden Technique',
        description: 'Opens all Eight Gates at cost of life.',
        powerLevel: 98,
      },
      {
        id: 'guy-dynamic-entry',
        name: 'Dynamic Entry',
        type: 'Taijutsu',
        description: 'Devastating surprise kick attack.',
        powerLevel: 85,
      },
    ],
  },
  obito: {
    id: 'obito',
    name: 'Obito Uchiha',
    universe: 'Naruto',
    version: 'Ten-Tails Jinchuriki',
    description: 'Former Uchiha who became Ten-Tails Jinchuriki. Kamui intangibility user.',
    imageUrl: getCharacterImageUrl('Obito', 'Naruto'),
    stats: {
      strength: 88,
      speed: 86,
      durability: 90,
      stamina: 94,
      energyOutput: 96,
      techniqueProficiency: 96,
      experience: 90,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'obito-kamui',
        name: 'Kamui',
        type: 'Space-Time Ninjutsu',
        description: 'Become intangible and warp anything away.',
        powerLevel: 98,
      },
      {
        id: 'obito-ten-tails',
        name: 'Ten-Tails Power',
        type: 'Jinchuriki Form',
        description: 'God-like power from Ten-Tails.',
        powerLevel: 96,
      },
      {
        id: 'obito-rinnegan',
        name: 'Rinnegan Abilities',
        type: 'Dojutsu',
        description: 'Six Paths techniques.',
        powerLevel: 94,
      },
      {
        id: 'obito-izanagi',
        name: 'Izanagi',
        type: 'Forbidden Dojutsu',
        description: 'Rewrite reality to avoid death.',
        powerLevel: 92,
      },
    ],
  },
  hashirama: {
    id: 'hashirama',
    name: 'Hashirama Senju',
    universe: 'Naruto',
    version: 'First Hokage',
    description: 'God of Shinobi who founded Konoha. Wood Style user stronger than tailed beasts.',
    imageUrl: getCharacterImageUrl('Hashirama', 'Naruto'),
    stats: {
      strength: 92,
      speed: 84,
      durability: 88,
      stamina: 98,
      energyOutput: 96,
      techniqueProficiency: 98,
      experience: 100,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'hashirama-wood-style',
        name: 'Wood Style',
        type: 'Kekkei Genkai',
        description: 'Unique wood manipulation jutsu.',
        powerLevel: 96,
      },
      {
        id: 'hashirama-buddha',
        name: 'True Several Thousand Hands',
        type: 'Ninjutsu',
        description: 'Massive wooden Buddha statue.',
        powerLevel: 100,
      },
      {
        id: 'hashirama-sage-mode',
        name: 'Sage Mode',
        type: 'Transformation',
        description: 'Perfect Sage Mode with immense power.',
        powerLevel: 94,
      },
      {
        id: 'hashirama-healing',
        name: 'Creation Rebirth',
        type: 'Passive',
        description: 'Automatic healing from any wound.',
        powerLevel: 92,
      },
    ],
  },

  // More One Piece
  ace: {
    id: 'ace',
    name: 'Portgas D. Ace',
    universe: 'One Piece',
    version: 'Flame Emperor',
    description: "Luffy's brother who ate Flame-Flame Fruit. Commander of Whitebeard Pirates.",
    imageUrl: getCharacterImageUrl('Ace', 'One Piece'),
    stats: {
      strength: 84,
      speed: 86,
      durability: 80,
      stamina: 88,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'ace-fire-fist',
        name: 'Fire Fist',
        type: 'Devil Fruit',
        description: 'Massive fire punch attack.',
        powerLevel: 92,
      },
      {
        id: 'ace-flame-emperor',
        name: 'Flame Emperor',
        type: 'Devil Fruit',
        description: 'Creates giant sun of flames.',
        powerLevel: 94,
      },
      {
        id: 'ace-logia',
        name: 'Flame Logia',
        type: 'Passive',
        description: 'Body made of fire, immune to physical attacks.',
        powerLevel: 90,
      },
      {
        id: 'ace-haki',
        name: 'Armament Haki',
        type: 'Haki',
        description: 'Can harden body with willpower.',
        powerLevel: 85,
      },
    ],
  },
  law: {
    id: 'law',
    name: 'Trafalgar Law',
    universe: 'One Piece',
    version: 'Awakened Op-Op Fruit',
    description: 'Surgeon of Death with Op-Op Fruit. Can manipulate anything in his Room.',
    imageUrl: getCharacterImageUrl('Law', 'One Piece'),
    stats: {
      strength: 76,
      speed: 82,
      durability: 78,
      stamina: 84,
      energyOutput: 90,
      techniqueProficiency: 98,
      experience: 86,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'law-room',
        name: 'Room',
        type: 'Devil Fruit',
        description: 'Creates sphere where Law controls everything.',
        powerLevel: 94,
      },
      {
        id: 'law-shambles',
        name: 'Shambles',
        type: 'Devil Fruit',
        description: 'Teleport and swap anything within Room.',
        powerLevel: 92,
      },
      {
        id: 'law-gamma-knife',
        name: 'Gamma Knife',
        type: 'Devil Fruit',
        description: 'Destroys internal organs without external damage.',
        powerLevel: 96,
      },
      {
        id: 'law-k-room',
        name: 'K-Room',
        type: 'Awakening',
        description: 'Awakened Room ability.',
        powerLevel: 90,
      },
    ],
  },
  kaido: {
    id: 'kaido',
    name: 'Kaido',
    universe: 'One Piece',
    version: 'Strongest Creature',
    description: 'Emperor of the Sea known as strongest creature alive. Dragon Devil Fruit user.',
    imageUrl: getCharacterImageUrl('Kaido', 'One Piece'),
    stats: {
      strength: 100,
      speed: 82,
      durability: 100,
      stamina: 100,
      energyOutput: 96,
      techniqueProficiency: 88,
      experience: 98,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'kaido-dragon',
        name: 'Azure Dragon Form',
        type: 'Mythical Zoan',
        description: 'Transform into massive dragon.',
        powerLevel: 98,
      },
      {
        id: 'kaido-blast-breath',
        name: 'Blast Breath',
        type: 'Devil Fruit',
        description: 'Devastating fire breath attack.',
        powerLevel: 96,
      },
      {
        id: 'kaido-conquerors',
        name: "Advanced Conqueror's Haki",
        type: 'Haki',
        description: "Supreme infusion of Conqueror's Haki.",
        powerLevel: 100,
      },
      {
        id: 'kaido-immortality',
        name: 'Near-Immortality',
        type: 'Passive',
        description: 'Captured and defeated countless times, never died.',
        powerLevel: 100,
      },
    ],
  },
  mihawk: {
    id: 'mihawk',
    name: 'Dracule Mihawk',
    universe: 'One Piece',
    version: "World's Strongest Swordsman",
    description: 'Greatest swordsman in the world. Can cut through anything with his black blade.',
    imageUrl: getCharacterImageUrl('Mihawk', 'One Piece'),
    stats: {
      strength: 88,
      speed: 90,
      durability: 82,
      stamina: 86,
      energyOutput: 80,
      techniqueProficiency: 100,
      experience: 96,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'mihawk-yoru',
        name: 'Yoru - Supreme Blade',
        type: 'Weapon',
        description: 'One of twelve supreme grade swords.',
        powerLevel: 98,
      },
      {
        id: 'mihawk-world-slash',
        name: "World's Strongest Slash",
        type: 'Swordsmanship',
        description: 'Can cut through anything.',
        powerLevel: 100,
      },
      {
        id: 'mihawk-observation',
        name: 'Supreme Observation Haki',
        type: 'Haki',
        description: 'Can see every movement.',
        powerLevel: 94,
      },
      {
        id: 'mihawk-armament',
        name: 'Black Blade Haki',
        type: 'Haki',
        description: 'Permanently infused Yoru with Haki.',
        powerLevel: 96,
      },
    ],
  },

  // More Marvel
  wolverine: {
    id: 'wolverine',
    name: 'Logan / Wolverine',
    universe: 'Marvel',
    version: 'X-Men',
    description: 'Mutant with adamantium skeleton and healing factor. Nearly 200 years old.',
    imageUrl: getCharacterImageUrl('Wolverine', 'Marvel'),
    stats: {
      strength: 65,
      speed: 72,
      durability: 96,
      stamina: 98,
      energyOutput: 40,
      techniqueProficiency: 94,
      experience: 100,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'wolverine-claws',
        name: 'Adamantium Claws',
        type: 'Weapon',
        description: 'Unbreakable claws that cut through anything.',
        powerLevel: 94,
      },
      {
        id: 'wolverine-healing',
        name: 'Healing Factor',
        type: 'Passive',
        description: 'Regenerates from any wound almost instantly.',
        powerLevel: 98,
      },
      {
        id: 'wolverine-skeleton',
        name: 'Adamantium Skeleton',
        type: 'Passive',
        description: 'Unbreakable metal skeleton.',
        powerLevel: 96,
      },
      {
        id: 'wolverine-berserker',
        name: 'Berserker Rage',
        type: 'Power Up',
        description: 'Unstoppable rage mode.',
        powerLevel: 88,
      },
    ],
  },
  deadpool: {
    id: 'deadpool',
    name: 'Wade Wilson / Deadpool',
    universe: 'Marvel',
    version: 'Merc with a Mouth',
    description: 'Immortal mercenary with healing factor surpassing Wolverine. Breaks fourth wall.',
    imageUrl: getCharacterImageUrl('Deadpool', 'Marvel'),
    stats: {
      strength: 54,
      speed: 68,
      durability: 100,
      stamina: 98,
      energyOutput: 45,
      techniqueProficiency: 92,
      experience: 88,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'deadpool-healing',
        name: 'Immortal Healing Factor',
        type: 'Passive',
        description: 'Cannot die, regenerates from anything.',
        powerLevel: 100,
      },
      {
        id: 'deadpool-weapons',
        name: 'Master Weapons Expert',
        type: 'Combat Skill',
        description: 'Expert with all weapons.',
        powerLevel: 90,
      },
      {
        id: 'deadpool-fourth-wall',
        name: 'Fourth Wall Awareness',
        type: 'Unique',
        description: "Knows he's in a comic/story.",
        powerLevel: 85,
      },
      {
        id: 'deadpool-teleporter',
        name: 'Teleportation Device',
        type: 'Equipment',
        description: 'Can teleport anywhere.',
        powerLevel: 82,
      },
    ],
  },
  thanos: {
    id: 'thanos',
    name: 'Thanos',
    universe: 'Marvel',
    version: 'Mad Titan',
    description: 'Mad Titan obsessed with Death. Wielded Infinity Gauntlet to reshape universe.',
    imageUrl: getCharacterImageUrl('Thanos', 'Marvel'),
    stats: {
      strength: 100,
      speed: 75,
      durability: 100,
      stamina: 100,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 100,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'thanos-strength',
        name: 'Titan Strength',
        type: 'Passive',
        description: 'Rivaled Hulk in pure strength.',
        powerLevel: 98,
      },
      {
        id: 'thanos-blast',
        name: 'Energy Blasts',
        type: 'Energy Attack',
        description: 'Powerful cosmic energy projection.',
        powerLevel: 92,
      },
      {
        id: 'thanos-intellect',
        name: 'Super-Genius Intellect',
        type: 'Passive',
        description: 'One of smartest beings in universe.',
        powerLevel: 96,
      },
      {
        id: 'thanos-immortal',
        name: 'Cursed with Immortality',
        type: 'Passive',
        description: 'Death cursed him to never die.',
        powerLevel: 100,
      },
    ],
  },
  scarletwitch: {
    id: 'scarletwitch',
    name: 'Wanda Maximoff / Scarlet Witch',
    universe: 'Marvel',
    version: 'Reality Warper',
    description: 'Most powerful magic user. Can rewrite reality with chaos magic.',
    imageUrl: getCharacterImageUrl('Scarlet Witch', 'Marvel'),
    stats: {
      strength: 42,
      speed: 48,
      durability: 55,
      stamina: 70,
      energyOutput: 100,
      techniqueProficiency: 96,
      experience: 82,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'wanda-chaos-magic',
        name: 'Chaos Magic',
        type: 'Magic',
        description: 'Reality-warping chaos magic.',
        powerLevel: 100,
      },
      {
        id: 'wanda-hex-bolts',
        name: 'Hex Bolts',
        type: 'Magic',
        description: 'Probability-altering energy blasts.',
        powerLevel: 92,
      },
      {
        id: 'wanda-reality-warp',
        name: 'Reality Warping',
        type: 'Magic',
        description: 'Can rewrite reality itself.',
        powerLevel: 100,
      },
      {
        id: 'wanda-telekinesis',
        name: 'Telekinesis',
        type: 'Magic',
        description: 'Powerful mental manipulation of matter.',
        powerLevel: 90,
      },
    ],
  },
  magneto: {
    id: 'magneto',
    name: 'Erik Lehnsherr / Magneto',
    universe: 'Marvel',
    version: 'Master of Magnetism',
    description:
      'Omega-level mutant with complete magnetic field control. Can manipulate all metal.',
    imageUrl: getCharacterImageUrl('Magneto', 'Marvel'),
    stats: {
      strength: 48,
      speed: 55,
      durability: 70,
      stamina: 75,
      energyOutput: 98,
      techniqueProficiency: 96,
      experience: 98,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'magneto-magnetism',
        name: 'Magnetic Field Control',
        type: 'Mutant Power',
        description: 'Complete control over magnetism.',
        powerLevel: 100,
      },
      {
        id: 'magneto-metal',
        name: 'Metal Manipulation',
        type: 'Mutant Power',
        description: 'Control all metal at molecular level.',
        powerLevel: 98,
      },
      {
        id: 'magneto-force-field',
        name: 'Magnetic Force Field',
        type: 'Defense',
        description: 'Nearly impenetrable magnetic shield.',
        powerLevel: 94,
      },
      {
        id: 'magneto-helmet',
        name: 'Telepathy-Proof Helmet',
        type: 'Equipment',
        description: 'Blocks all mental attacks.',
        powerLevel: 90,
      },
    ],
  },
  professorx: {
    id: 'professorx',
    name: 'Charles Xavier / Professor X',
    universe: 'Marvel',
    version: "World's Most Powerful Telepath",
    description: 'Omega-level telepath who can control minds of entire planet. Founder of X-Men.',
    imageUrl: getCharacterImageUrl('Professor X', 'Marvel'),
    stats: {
      strength: 28,
      speed: 32,
      durability: 38,
      stamina: 65,
      energyOutput: 100,
      techniqueProficiency: 100,
      experience: 98,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'xavier-telepathy',
        name: 'Omega Telepathy',
        type: 'Mutant Power',
        description: 'Most powerful telepath on Earth.',
        powerLevel: 100,
      },
      {
        id: 'xavier-mind-control',
        name: 'Mind Control',
        type: 'Mutant Power',
        description: "Can control anyone's mind.",
        powerLevel: 98,
      },
      {
        id: 'xavier-cerebro',
        name: 'Cerebro',
        type: 'Equipment',
        description: 'Amplifies telepathy to global range.',
        powerLevel: 100,
      },
      {
        id: 'xavier-psychic-blast',
        name: 'Psychic Blast',
        type: 'Mutant Power',
        description: 'Devastating mental attack.',
        powerLevel: 94,
      },
    ],
  },

  // More DC
  aquaman: {
    id: 'aquaman',
    name: 'Arthur Curry / Aquaman',
    universe: 'DC Comics',
    version: 'King of Atlantis',
    description:
      'King of Atlantis with superhuman strength and marine telepathy. Wields Trident of Poseidon.',
    imageUrl: getCharacterImageUrl('Aquaman', 'DC Universe'),
    stats: {
      strength: 88,
      speed: 74,
      durability: 86,
      stamina: 90,
      energyOutput: 78,
      techniqueProficiency: 84,
      experience: 88,
      adaptability: 82,
    },
    abilities: [
      {
        id: 'aquaman-trident',
        name: 'Trident of Poseidon',
        type: 'Weapon',
        description: 'Magical trident that commands seas.',
        powerLevel: 92,
      },
      {
        id: 'aquaman-marine-telepathy',
        name: 'Marine Telepathy',
        type: 'Ability',
        description: 'Command all ocean life.',
        powerLevel: 90,
      },
      {
        id: 'aquaman-strength',
        name: 'Atlantean Strength',
        type: 'Passive',
        description: 'Can fight Superman underwater.',
        powerLevel: 88,
      },
      {
        id: 'aquaman-tidal-wave',
        name: 'Tidal Wave Control',
        type: 'Ability',
        description: 'Manipulate ocean water.',
        powerLevel: 86,
      },
    ],
  },
  shazam: {
    id: 'shazam',
    name: 'Billy Batson / Shazam',
    universe: 'DC Comics',
    version: 'Captain Marvel',
    description:
      'Boy who transforms into adult superhero with powers of six gods by saying "Shazam!"',
    imageUrl: getCharacterImageUrl('Shazam', 'DC Universe'),
    stats: {
      strength: 96,
      speed: 88,
      durability: 94,
      stamina: 92,
      energyOutput: 96,
      techniqueProficiency: 75,
      experience: 68,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'shazam-lightning',
        name: 'Lightning of Zeus',
        type: 'Magic',
        description: 'Summons divine lightning bolts.',
        powerLevel: 96,
      },
      {
        id: 'shazam-wisdom',
        name: 'Wisdom of Solomon',
        type: 'Passive',
        description: 'Divine wisdom and knowledge.',
        powerLevel: 88,
      },
      {
        id: 'shazam-strength',
        name: 'Strength of Hercules',
        type: 'Passive',
        description: 'God-level physical strength.',
        powerLevel: 96,
      },
      {
        id: 'shazam-speed',
        name: 'Speed of Mercury',
        type: 'Passive',
        description: 'Super speed and flight.',
        powerLevel: 90,
      },
    ],
  },
  darkseid: {
    id: 'darkseid',
    name: 'Darkseid',
    universe: 'DC Comics',
    version: 'Lord of Apokolips',
    description: "God of Evil seeking Anti-Life Equation. One of DC's most powerful villains.",
    imageUrl: getCharacterImageUrl('Darkseid', 'DC Universe'),
    stats: {
      strength: 100,
      speed: 78,
      durability: 100,
      stamina: 100,
      energyOutput: 100,
      techniqueProficiency: 90,
      experience: 100,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'darkseid-omega-beams',
        name: 'Omega Beams',
        type: 'Energy Attack',
        description: 'Tracking eye beams that erase from existence.',
        powerLevel: 100,
      },
      {
        id: 'darkseid-strength',
        name: 'God Strength',
        type: 'Passive',
        description: 'Fought Superman and entire Justice League.',
        powerLevel: 100,
      },
      {
        id: 'darkseid-omega-effect',
        name: 'Omega Effect',
        type: 'Divine Power',
        description: 'Fundamental force of entropy.',
        powerLevel: 100,
      },
      {
        id: 'darkseid-anti-life',
        name: 'Anti-Life Equation',
        type: 'Ultimate Power',
        description: 'Equation that controls all free will.',
        powerLevel: 100,
      },
    ],
  },

  // JoJo's Bizarre Adventure
  jotaro: {
    id: 'jotaro',
    name: 'Jotaro Kujo',
    universe: "JoJo's Bizarre Adventure",
    version: 'Star Platinum The World',
    description: 'Stand user with Star Platinum. Can stop time for 5 seconds.',
    imageUrl: getCharacterImageUrl('Jotaro Kujo', "JoJo's Bizarre Adventure"),
    stats: {
      strength: 92,
      speed: 98,
      durability: 85,
      stamina: 82,
      energyOutput: 88,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'jotaro-star-platinum',
        name: 'Star Platinum',
        type: 'Stand',
        description: 'Incredibly fast and strong Stand.',
        powerLevel: 96,
      },
      {
        id: 'jotaro-time-stop',
        name: 'Time Stop',
        type: 'Stand Ability',
        description: 'Stop time for 5 seconds.',
        powerLevel: 98,
      },
      {
        id: 'jotaro-ora',
        name: 'ORA ORA Rush',
        type: 'Stand Attack',
        description: 'Extremely fast punching barrage.',
        powerLevel: 94,
      },
      {
        id: 'jotaro-precision',
        name: 'Precision A',
        type: 'Passive',
        description: 'Incredibly precise attacks.',
        powerLevel: 92,
      },
    ],
  },
  dio: {
    id: 'dio',
    name: 'Dio Brando',
    universe: "JoJo's Bizarre Adventure",
    version: 'The World',
    description: 'Vampire with Stand The World. Can stop time for 9 seconds.',
    imageUrl: getCharacterImageUrl('Dio Brando', "JoJo's Bizarre Adventure"),
    stats: {
      strength: 90,
      speed: 96,
      durability: 88,
      stamina: 100,
      energyOutput: 90,
      techniqueProficiency: 92,
      experience: 96,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'dio-the-world',
        name: 'The World',
        type: 'Stand',
        description: 'Stand with time stop ability.',
        powerLevel: 96,
      },
      {
        id: 'dio-time-stop',
        name: 'Time Stop',
        type: 'Stand Ability',
        description: 'Stop time for 9 seconds.',
        powerLevel: 98,
      },
      {
        id: 'dio-vampire',
        name: 'Vampire Powers',
        type: 'Passive',
        description: 'Regeneration, super strength, immortality.',
        powerLevel: 94,
      },
      {
        id: 'dio-wry',
        name: 'WRYYYY Rush',
        type: 'Stand Attack',
        description: 'Devastating punching barrage.',
        powerLevel: 92,
      },
    ],
  },
  giorno: {
    id: 'giorno',
    name: 'Giorno Giovanna',
    universe: "JoJo's Bizarre Adventure",
    version: 'Gold Experience Requiem',
    description: "Dio's son with Gold Experience Requiem. Can reset actions to zero.",
    imageUrl: getCharacterImageUrl('Giorno Giovanna', "JoJo's Bizarre Adventure"),
    stats: {
      strength: 72,
      speed: 82,
      durability: 78,
      stamina: 85,
      energyOutput: 86,
      techniqueProficiency: 88,
      experience: 70,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'giorno-ger',
        name: 'Gold Experience Requiem',
        type: 'Requiem Stand',
        description: 'Evolved Stand with reality manipulation.',
        powerLevel: 100,
      },
      {
        id: 'giorno-rtz',
        name: 'Return to Zero',
        type: 'Stand Ability',
        description: 'Resets any action/attack to zero.',
        powerLevel: 100,
      },
      {
        id: 'giorno-life-giver',
        name: 'Life Giver',
        type: 'Stand Ability',
        description: 'Create and manipulate life.',
        powerLevel: 90,
      },
      {
        id: 'giorno-immunity',
        name: 'Attack Immunity',
        type: 'Passive',
        description: 'GER makes him virtually untouchable.',
        powerLevel: 100,
      },
    ],
  },

  // Fullmetal Alchemist
  edward: {
    id: 'edward',
    name: 'Edward Elric',
    universe: 'Fullmetal Alchemist',
    version: 'Fullmetal Alchemist',
    description: 'Youngest State Alchemist. Can transmute without circles after seeing Truth.',
    imageUrl: getCharacterImageUrl('Edward Elric', 'Fullmetal Alchemist'),
    stats: {
      strength: 58,
      speed: 70,
      durability: 65,
      stamina: 75,
      energyOutput: 82,
      techniqueProficiency: 92,
      experience: 78,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'ed-transmutation',
        name: 'Transmutation without Circle',
        type: 'Alchemy',
        description: 'Can transmute anywhere instantly.',
        powerLevel: 90,
      },
      {
        id: 'ed-automail',
        name: 'Automail Arm',
        type: 'Equipment',
        description: 'Prosthetic arm for combat.',
        powerLevel: 75,
      },
      {
        id: 'ed-combat',
        name: 'Alchemic Combat',
        type: 'Combat Skill',
        description: 'Uses alchemy in hand-to-hand combat.',
        powerLevel: 86,
      },
      {
        id: 'ed-genius',
        name: 'Alchemic Genius',
        type: 'Passive',
        description: 'Prodigy alchemist with vast knowledge.',
        powerLevel: 88,
      },
    ],
  },
  roymustang: {
    id: 'roymustang',
    name: 'Roy Mustang',
    universe: 'Fullmetal Alchemist',
    version: 'Flame Alchemist',
    description: 'Flame Alchemist who controls fire with precision. Future Fuhrer candidate.',
    imageUrl: getCharacterImageUrl('Roy Mustang', 'Fullmetal Alchemist'),
    stats: {
      strength: 54,
      speed: 64,
      durability: 60,
      stamina: 70,
      energyOutput: 90,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'roy-flame-alchemy',
        name: 'Flame Alchemy',
        type: 'Alchemy',
        description: 'Create and control fire with snaps.',
        powerLevel: 92,
      },
      {
        id: 'roy-precision',
        name: 'Pinpoint Flame Control',
        type: 'Alchemy',
        description: 'Surgical precision with flames.',
        powerLevel: 94,
      },
      {
        id: 'roy-gloves',
        name: 'Ignition Gloves',
        type: 'Equipment',
        description: 'Creates sparks for combustion.',
        powerLevel: 88,
      },
      {
        id: 'roy-tactics',
        name: 'Military Tactician',
        type: 'Passive',
        description: 'Brilliant strategic mind.',
        powerLevel: 86,
      },
    ],
  },

  // Bleach
  kenpachi: {
    id: 'kenpachi',
    name: 'Kenpachi Zaraki',
    universe: 'Bleach',
    version: 'Shikai Released',
    description: 'Strongest Shinigami in pure combat. Fights with instinct and overwhelming power.',
    imageUrl: getCharacterImageUrl('Kenpachi Zaraki', 'Bleach'),
    stats: {
      strength: 98,
      speed: 84,
      durability: 94,
      stamina: 98,
      energyOutput: 92,
      techniqueProficiency: 75,
      experience: 90,
      adaptability: 82,
    },
    abilities: [
      {
        id: 'kenpachi-shikai',
        name: 'Nozarashi Shikai',
        type: 'Zanpakuto',
        description: 'Giant cleaver that cuts through anything.',
        powerLevel: 96,
      },
      {
        id: 'kenpachi-strength',
        name: 'Monstrous Strength',
        type: 'Passive',
        description: 'Can cut through buildings with ease.',
        powerLevel: 98,
      },
      {
        id: 'kenpachi-instinct',
        name: 'Battle Instinct',
        type: 'Passive',
        description: 'Pure fighting instinct.',
        powerLevel: 90,
      },
      {
        id: 'kenpachi-reiatsu',
        name: 'Overwhelming Reiatsu',
        type: 'Passive',
        description: 'Spiritual pressure crushes opponents.',
        powerLevel: 94,
      },
    ],
  },
  byakuya: {
    id: 'byakuya',
    name: 'Byakuya Kuchiki',
    universe: 'Bleach',
    version: 'Senkei Bankai',
    description: 'Noble captain with Senbonzakura. Master of Kido and sword techniques.',
    imageUrl: getCharacterImageUrl('Byakuya Kuchiki', 'Bleach'),
    stats: {
      strength: 78,
      speed: 94,
      durability: 80,
      stamina: 85,
      energyOutput: 90,
      techniqueProficiency: 96,
      experience: 92,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'byakuya-senbonzakura',
        name: 'Senbonzakura Kageyoshi',
        type: 'Bankai',
        description: 'Thousand cherry blossom blades.',
        powerLevel: 94,
      },
      {
        id: 'byakuya-flash-step',
        name: 'Flash Step Master',
        type: 'Technique',
        description: 'Incredibly fast movement.',
        powerLevel: 96,
      },
      {
        id: 'byakuya-kido',
        name: 'Kido Master',
        type: 'Magic',
        description: 'Expert in Soul Reaper magic.',
        powerLevel: 90,
      },
      {
        id: 'byakuya-senkei',
        name: 'Senkei Senbonzakura',
        type: 'Final Form',
        description: 'Ultimate blade formation.',
        powerLevel: 92,
      },
    ],
  },

  // Attack on Titan
  mikasa: {
    id: 'mikasa',
    name: 'Mikasa Ackerman',
    universe: 'Attack on Titan',
    version: 'Survey Corps',
    description: 'Ackerman warrior with superhuman abilities. Strongest soldier after Levi.',
    imageUrl: getCharacterImageUrl('Mikasa Ackerman', 'Attack on Titan'),
    stats: {
      strength: 68,
      speed: 94,
      durability: 72,
      stamina: 88,
      energyOutput: 42,
      techniqueProficiency: 96,
      experience: 82,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'mikasa-ackerman',
        name: 'Ackerman Power',
        type: 'Passive',
        description: 'Awakened Ackerman superhuman abilities.',
        powerLevel: 94,
      },
      {
        id: 'mikasa-odm',
        name: 'ODM Gear Mastery',
        type: 'Equipment Skill',
        description: 'Second only to Levi in ODM usage.',
        powerLevel: 96,
      },
      {
        id: 'mikasa-combat',
        name: 'Blade Combat Expert',
        type: 'Combat Skill',
        description: 'Master swordswoman.',
        powerLevel: 92,
      },
      {
        id: 'mikasa-reflexes',
        name: 'Superhuman Reflexes',
        type: 'Passive',
        description: 'Can react to bullets.',
        powerLevel: 90,
      },
    ],
  },
  armin: {
    id: 'armin',
    name: 'Armin Arlert',
    universe: 'Attack on Titan',
    version: 'Colossal Titan',
    description: 'Strategic genius who inherited Colossal Titan. Tactical mind of Survey Corps.',
    imageUrl: getCharacterImageUrl('Armin Arlert', 'Attack on Titan'),
    stats: {
      strength: 98,
      speed: 45,
      durability: 96,
      stamina: 75,
      energyOutput: 100,
      techniqueProficiency: 88,
      experience: 70,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'armin-colossal',
        name: 'Colossal Titan',
        type: 'Transformation',
        description: '60-meter titan with devastating power.',
        powerLevel: 100,
      },
      {
        id: 'armin-explosion',
        name: 'Explosive Transformation',
        type: 'Titan Ability',
        description: 'Nuclear-level explosion when transforming.',
        powerLevel: 98,
      },
      {
        id: 'armin-steam',
        name: 'Scalding Steam',
        type: 'Titan Ability',
        description: 'Release burning steam from body.',
        powerLevel: 92,
      },
      {
        id: 'armin-tactics',
        name: 'Genius Strategist',
        type: 'Passive',
        description: 'Brilliant tactical mind.',
        powerLevel: 100,
      },
    ],
  },

  // My Hero Academia
  bakugo: {
    id: 'bakugo',
    name: 'Katsuki Bakugo',
    universe: 'My Hero Academia',
    version: 'Pro Hero',
    description: 'Explosive hero with nitroglycerin-like sweat. Rivals Deku for #1 spot.',
    imageUrl: getCharacterImageUrl('Katsuki Bakugo', 'My Hero Academia'),
    stats: {
      strength: 78,
      speed: 86,
      durability: 80,
      stamina: 88,
      energyOutput: 92,
      techniqueProficiency: 90,
      experience: 75,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'bakugo-explosion',
        name: 'Explosion',
        type: 'Quirk',
        description: 'Create powerful explosions from palms.',
        powerLevel: 92,
      },
      {
        id: 'bakugo-howitzer',
        name: 'Howitzer Impact',
        type: 'Super Move',
        description: 'Massive spinning explosion.',
        powerLevel: 94,
      },
      {
        id: 'bakugo-combat',
        name: 'Expert Combat Sense',
        type: 'Passive',
        description: 'Natural battle genius.',
        powerLevel: 90,
      },
      {
        id: 'bakugo-cluster',
        name: 'AP Shot Cluster',
        type: 'Super Move',
        description: 'Concentrated explosive barrage.',
        powerLevel: 88,
      },
    ],
  },
  todoroki: {
    id: 'todoroki',
    name: 'Shoto Todoroki',
    universe: 'My Hero Academia',
    version: 'Half-Cold Half-Hot',
    description: 'Dual-quirk user with ice and fire. Son of #1 hero Endeavor.',
    imageUrl: getCharacterImageUrl('Shoto Todoroki', 'My Hero Academia'),
    stats: {
      strength: 76,
      speed: 80,
      durability: 78,
      stamina: 84,
      energyOutput: 96,
      techniqueProficiency: 88,
      experience: 72,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'todoroki-ice',
        name: 'Ice Manipulation',
        type: 'Quirk',
        description: 'Create massive ice structures.',
        powerLevel: 92,
      },
      {
        id: 'todoroki-fire',
        name: 'Fire Manipulation',
        type: 'Quirk',
        description: 'Generate intense flames.',
        powerLevel: 92,
      },
      {
        id: 'todoroki-flashfreeze',
        name: 'Flashfreeze Heatwave',
        type: 'Super Move',
        description: 'Combines fire and ice for devastating attack.',
        powerLevel: 96,
      },
      {
        id: 'todoroki-versatility',
        name: 'Dual Element Mastery',
        type: 'Passive',
        description: 'Can balance temperature perfectly.',
        powerLevel: 90,
      },
    ],
  },

  // Fate Series
  saber: {
    id: 'saber',
    name: 'Artoria Pendragon / Saber',
    universe: 'Fate',
    version: 'King Arthur',
    description: 'King Arthur summoned as Saber-class Servant. Wields Excalibur.',
    imageUrl: getCharacterImageUrl('Saber', 'Fate'),
    stats: {
      strength: 88,
      speed: 90,
      durability: 86,
      stamina: 85,
      energyOutput: 96,
      techniqueProficiency: 94,
      experience: 96,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'saber-excalibur',
        name: 'Excalibur',
        type: 'Noble Phantasm',
        description: 'Sword of Promised Victory - beam of light.',
        powerLevel: 98,
      },
      {
        id: 'saber-avalon',
        name: 'Avalon',
        type: 'Noble Phantasm',
        description: 'Ultimate defense - absolute invincibility.',
        powerLevel: 100,
      },
      {
        id: 'saber-mana-burst',
        name: 'Mana Burst',
        type: 'Skill',
        description: 'Infuse attacks with magical energy.',
        powerLevel: 90,
      },
      {
        id: 'saber-instinct',
        name: 'Instinct A',
        type: 'Passive',
        description: 'Predict opponent movements.',
        powerLevel: 92,
      },
    ],
  },
  gilgamesh: {
    id: 'gilgamesh',
    name: 'Gilgamesh',
    universe: 'Fate',
    version: 'King of Heroes',
    description:
      'First hero-king with Gate of Babylon containing all treasures. Most powerful Servant.',
    imageUrl: getCharacterImageUrl('Gilgamesh', 'Fate'),
    stats: {
      strength: 84,
      speed: 82,
      durability: 88,
      stamina: 90,
      energyOutput: 100,
      techniqueProficiency: 92,
      experience: 100,
      adaptability: 70,
    },
    abilities: [
      {
        id: 'gil-gob',
        name: 'Gate of Babylon',
        type: 'Noble Phantasm',
        description: 'Treasury containing all Noble Phantasms.',
        powerLevel: 100,
      },
      {
        id: 'gil-ea',
        name: 'Ea - Sword of Rupture',
        type: 'Ultimate Weapon',
        description: 'Anti-world Noble Phantasm that tears reality.',
        powerLevel: 100,
      },
      {
        id: 'gil-chains',
        name: 'Chains of Heaven',
        type: 'Noble Phantasm',
        description: 'Binds divine beings.',
        powerLevel: 94,
      },
      {
        id: 'gil-omniscient',
        name: 'Sha Naqba Imuru',
        type: 'Passive',
        description: 'Clairvoyance that sees all possibilities.',
        powerLevel: 96,
      },
    ],
  },

  // Street Fighter
  ryu: {
    id: 'ryu',
    name: 'Ryu',
    universe: 'Street Fighter',
    version: 'Master of Hadoken',
    description: 'Wandering martial artist seeking true strength. Master of Ansatsuken.',
    imageUrl: getCharacterImageUrl('Ryu', 'Street Fighter'),
    stats: {
      strength: 74,
      speed: 78,
      durability: 80,
      stamina: 88,
      energyOutput: 82,
      techniqueProficiency: 92,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'ryu-hadoken',
        name: 'Hadoken',
        type: 'Ki Attack',
        description: 'Focused ki energy projectile.',
        powerLevel: 86,
      },
      {
        id: 'ryu-shoryuken',
        name: 'Shoryuken',
        type: 'Anti-Air Attack',
        description: 'Dragon punch uppercut.',
        powerLevel: 88,
      },
      {
        id: 'ryu-shinku',
        name: 'Shinku Hadoken',
        type: 'Super Move',
        description: 'Massive multi-hit ki blast.',
        powerLevel: 90,
      },
      {
        id: 'ryu-satsui',
        name: 'Satsui no Hado Potential',
        type: 'Hidden Power',
        description: 'Dark power waiting to be unleashed.',
        powerLevel: 94,
      },
    ],
  },
  akuma: {
    id: 'akuma',
    name: 'Akuma / Gouki',
    universe: 'Street Fighter',
    version: 'Master of Satsui no Hado',
    description: 'Demon who embraced dark power. Seeks worthy opponents to fight.',
    imageUrl: getCharacterImageUrl('Akuma', 'Street Fighter'),
    stats: {
      strength: 90,
      speed: 88,
      durability: 86,
      stamina: 92,
      energyOutput: 94,
      techniqueProficiency: 96,
      experience: 98,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'akuma-raging-demon',
        name: 'Raging Demon',
        type: 'Ultimate Attack',
        description: 'Instant Hell Murder - attacks the soul.',
        powerLevel: 98,
      },
      {
        id: 'akuma-messatsu',
        name: 'Messatsu Hadoken',
        type: 'Ki Attack',
        description: 'Devastating dark energy blast.',
        powerLevel: 92,
      },
      {
        id: 'akuma-satsui',
        name: 'Satsui no Hado',
        type: 'Passive',
        description: 'Dark murderous intent amplifies power.',
        powerLevel: 96,
      },
      {
        id: 'akuma-teleport',
        name: 'Ashura Senku',
        type: 'Movement',
        description: 'Teleportation technique.',
        powerLevel: 88,
      },
    ],
  },

  // Mortal Kombat
  scorpion: {
    id: 'scorpion',
    name: 'Scorpion',
    universe: 'Mortal Kombat',
    version: 'Hellspawn Ninja',
    description: 'Resurrected specter seeking vengeance. Commands hellfire.',
    imageUrl: getCharacterImageUrl('Scorpion', 'Mortal Kombat'),
    stats: {
      strength: 76,
      speed: 82,
      durability: 84,
      stamina: 100,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 96,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'scorpion-spear',
        name: 'Get Over Here!',
        type: 'Signature Move',
        description: 'Kunai spear that pulls enemies.',
        powerLevel: 85,
      },
      {
        id: 'scorpion-hellfire',
        name: 'Hellfire',
        type: 'Supernatural Attack',
        description: 'Summons fire from hell.',
        powerLevel: 90,
      },
      {
        id: 'scorpion-teleport',
        name: 'Teleport Punch',
        type: 'Movement Attack',
        description: 'Hellfire teleportation.',
        powerLevel: 86,
      },
      {
        id: 'scorpion-vengeance',
        name: 'Vengeance Empowerment',
        type: 'Passive',
        description: 'Powered by eternal vengeance.',
        powerLevel: 88,
      },
    ],
  },
  subzero: {
    id: 'subzero',
    name: 'Sub-Zero',
    universe: 'Mortal Kombat',
    version: 'Cryomancer Grandmaster',
    description: 'Grandmaster of Lin Kuei with cryomancer powers. Controls ice.',
    imageUrl: getCharacterImageUrl('Sub-Zero', 'Mortal Kombat'),
    stats: {
      strength: 74,
      speed: 78,
      durability: 82,
      stamina: 85,
      energyOutput: 92,
      techniqueProficiency: 94,
      experience: 92,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'subzero-freeze',
        name: 'Ice Freeze',
        type: 'Cryomancy',
        description: 'Freezes opponents solid.',
        powerLevel: 90,
      },
      {
        id: 'subzero-klone',
        name: 'Ice Klone',
        type: 'Cryomancy',
        description: 'Creates ice decoy.',
        powerLevel: 85,
      },
      {
        id: 'subzero-slide',
        name: 'Ice Slide',
        type: 'Movement Attack',
        description: 'Slides across ground on ice.',
        powerLevel: 82,
      },
      {
        id: 'subzero-mastery',
        name: 'Cryomancy Mastery',
        type: 'Passive',
        description: 'Complete control over ice and cold.',
        powerLevel: 92,
      },
    ],
  },

  // Pokemon
  mewtwo: {
    id: 'mewtwo',
    name: 'Mewtwo',
    universe: 'Pokemon',
    version: 'Legendary Psychic',
    description: 'Genetically engineered Pokemon with tremendous psychic power. Strongest Pokemon.',
    imageUrl: getCharacterImageUrl('Mewtwo', 'Pokemon'),
    stats: {
      strength: 82,
      speed: 88,
      durability: 80,
      stamina: 90,
      energyOutput: 100,
      techniqueProficiency: 94,
      experience: 85,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'mewtwo-psychic',
        name: 'Psychic',
        type: 'Psychic Attack',
        description: 'Devastating mental attack.',
        powerLevel: 96,
      },
      {
        id: 'mewtwo-psystrike',
        name: 'Psystrike',
        type: 'Signature Move',
        description: 'Materializes psychic wave.',
        powerLevel: 98,
      },
      {
        id: 'mewtwo-recover',
        name: 'Recover',
        type: 'Healing',
        description: 'Regenerates health with psychic power.',
        powerLevel: 88,
      },
      {
        id: 'mewtwo-pressure',
        name: 'Pressure',
        type: 'Passive',
        description: 'Overwhelming psychic pressure.',
        powerLevel: 92,
      },
    ],
  },

  // Video Game Characters
  link: {
    id: 'link',
    name: 'Link',
    universe: 'Legend of Zelda',
    version: 'Hero of Time',
    description: 'Legendary hero chosen by Triforce of Courage. Master swordsman.',
    imageUrl: getCharacterImageUrl('Link', 'Legend of Zelda'),
    stats: {
      strength: 76,
      speed: 80,
      durability: 82,
      stamina: 88,
      energyOutput: 78,
      techniqueProficiency: 90,
      experience: 85,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'link-master-sword',
        name: 'Master Sword',
        type: 'Weapon',
        description: "Blade of Evil's Bane that repels darkness.",
        powerLevel: 92,
      },
      {
        id: 'link-triforce',
        name: 'Triforce of Courage',
        type: 'Divine Power',
        description: 'Mark of the goddess granting bravery.',
        powerLevel: 90,
      },
      {
        id: 'link-items',
        name: 'Legendary Items',
        type: 'Equipment',
        description: 'Bombs, hookshot, bow, boomerang, etc.',
        powerLevel: 86,
      },
      {
        id: 'link-time',
        name: 'Ocarina of Time',
        type: 'Magic Item',
        description: 'Control flow of time.',
        powerLevel: 94,
      },
    ],
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Strife',
    universe: 'Final Fantasy VII',
    version: 'SOLDIER 1st Class',
    description: 'Ex-SOLDIER wielding massive Buster Sword. Infused with Jenova cells.',
    imageUrl: getCharacterImageUrl('Cloud Strife', 'Final Fantasy VII'),
    stats: {
      strength: 86,
      speed: 84,
      durability: 82,
      stamina: 85,
      energyOutput: 90,
      techniqueProficiency: 92,
      experience: 86,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'cloud-omnislash',
        name: 'Omnislash',
        type: 'Limit Break',
        description: 'Ultimate 15-hit sword combo.',
        powerLevel: 96,
      },
      {
        id: 'cloud-buster-sword',
        name: 'Buster Sword',
        type: 'Weapon',
        description: 'Massive iconic sword.',
        powerLevel: 88,
      },
      {
        id: 'cloud-mako',
        name: 'Mako Enhancement',
        type: 'Passive',
        description: 'Enhanced strength and speed from Mako.',
        powerLevel: 90,
      },
      {
        id: 'cloud-materia',
        name: 'Materia Master',
        type: 'Magic',
        description: 'Can use any materia magic.',
        powerLevel: 92,
      },
    ],
  },
  sephiroth: {
    id: 'sephiroth',
    name: 'Sephiroth',
    universe: 'Final Fantasy VII',
    version: 'One-Winged Angel',
    description: 'Legendary SOLDIER who became god-like. Wields Masamune.',
    imageUrl: getCharacterImageUrl('Sephiroth', 'Final Fantasy VII'),
    stats: {
      strength: 94,
      speed: 92,
      durability: 90,
      stamina: 92,
      energyOutput: 98,
      techniqueProficiency: 96,
      experience: 94,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'sephiroth-supernova',
        name: 'Supernova',
        type: 'Ultimate Attack',
        description: 'Summons supernova to destroy solar system.',
        powerLevel: 100,
      },
      {
        id: 'sephiroth-masamune',
        name: 'Masamune',
        type: 'Weapon',
        description: 'Impossibly long katana.',
        powerLevel: 94,
      },
      {
        id: 'sephiroth-jenova',
        name: 'Jenova Cells',
        type: 'Passive',
        description: 'Alien cells grant god-like power.',
        powerLevel: 96,
      },
      {
        id: 'sephiroth-heartless-angel',
        name: 'Heartless Angel',
        type: 'Magic',
        description: 'Reduces enemy HP to 1.',
        powerLevel: 98,
      },
    ],
  },
  masterchief: {
    id: 'masterchief',
    name: 'Master Chief',
    universe: 'Halo',
    version: 'Spartan-117',
    description: "Legendary Spartan-II super soldier. Humanity's greatest warrior.",
    imageUrl: getCharacterImageUrl('Master Chief', 'Halo'),
    stats: {
      strength: 82,
      speed: 80,
      durability: 90,
      stamina: 92,
      energyOutput: 75,
      techniqueProficiency: 94,
      experience: 96,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'chief-mjolnir',
        name: 'MJOLNIR Armor',
        type: 'Equipment',
        description: 'Powered armor with energy shields.',
        powerLevel: 92,
      },
      {
        id: 'chief-weapons',
        name: 'Weapons Master',
        type: 'Combat Skill',
        description: 'Expert with all weapons.',
        powerLevel: 94,
      },
      {
        id: 'chief-luck',
        name: 'Legendary Luck',
        type: 'Passive',
        description: "Cortana says he's lucky - survives impossible odds.",
        powerLevel: 90,
      },
      {
        id: 'chief-spartan',
        name: 'Spartan Augmentations',
        type: 'Passive',
        description: 'Enhanced strength, speed, reflexes.',
        powerLevel: 88,
      },
    ],
  },
  samus: {
    id: 'samus',
    name: 'Samus Aran',
    universe: 'Metroid',
    version: 'Power Suit',
    description: 'Legendary bounty hunter with Chozo Power Suit. Most feared in galaxy.',
    imageUrl: getCharacterImageUrl('Samus Aran', 'Metroid'),
    stats: {
      strength: 78,
      speed: 82,
      durability: 88,
      stamina: 86,
      energyOutput: 92,
      techniqueProficiency: 94,
      experience: 92,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'samus-power-suit',
        name: 'Chozo Power Suit',
        type: 'Equipment',
        description: 'Advanced alien armor with energy shields.',
        powerLevel: 92,
      },
      {
        id: 'samus-arm-cannon',
        name: 'Arm Cannon',
        type: 'Weapon',
        description: 'Multi-function energy weapon.',
        powerLevel: 90,
      },
      {
        id: 'samus-morph-ball',
        name: 'Morph Ball',
        type: 'Ability',
        description: 'Transform into ball form with bombs.',
        powerLevel: 85,
      },
      {
        id: 'samus-screw-attack',
        name: 'Screw Attack',
        type: 'Ability',
        description: 'Energy-surrounded somersault attack.',
        powerLevel: 88,
      },
    ],
  },

  // More Demon Slayer
  shinobu: {
    id: 'shinobu',
    name: 'Shinobu Kocho',
    universe: 'Demon Slayer',
    version: 'Insect Hashira',
    description:
      'Insect Hashira who uses poison. Fastest Hashira despite not being able to cut demon necks.',
    imageUrl: getCharacterImageUrl('Shinobu Kocho', 'Demon Slayer'),
    stats: {
      strength: 45,
      speed: 92,
      durability: 60,
      stamina: 75,
      energyOutput: 70,
      techniqueProficiency: 96,
      experience: 86,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'shinobu-poison',
        name: 'Wisteria Poison',
        type: 'Alchemy',
        description: 'Deadly demon poison from wisteria.',
        powerLevel: 94,
      },
      {
        id: 'shinobu-insect-breathing',
        name: 'Insect Breathing',
        type: 'Breathing Style',
        description: 'Fast piercing technique.',
        powerLevel: 90,
      },
      {
        id: 'shinobu-speed',
        name: 'Incredible Speed',
        type: 'Passive',
        description: 'Fastest Hashira movement.',
        powerLevel: 92,
      },
      {
        id: 'shinobu-medical',
        name: 'Medical Expert',
        type: 'Skill',
        description: 'Expert in poisons and medicine.',
        powerLevel: 88,
      },
    ],
  },
  giyu: {
    id: 'giyu',
    name: 'Giyu Tomioka',
    universe: 'Demon Slayer',
    version: 'Water Hashira',
    description: 'Water Hashira who trained Tanjiro. Created 11th form Dead Calm.',
    imageUrl: getCharacterImageUrl('Giyu Tomioka', 'Demon Slayer'),
    stats: {
      strength: 80,
      speed: 86,
      durability: 82,
      stamina: 88,
      energyOutput: 84,
      techniqueProficiency: 94,
      experience: 90,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'giyu-water-breathing',
        name: 'Water Breathing',
        type: 'Breathing Style',
        description: 'Fluid and adaptable sword techniques.',
        powerLevel: 92,
      },
      {
        id: 'giyu-dead-calm',
        name: 'Dead Calm - 11th Form',
        type: 'Original Technique',
        description: 'Creates windless water space.',
        powerLevel: 96,
      },
      {
        id: 'giyu-mark',
        name: 'Demon Slayer Mark',
        type: 'Power Up',
        description: 'Enhanced physical abilities.',
        powerLevel: 88,
      },
      {
        id: 'giyu-swordsmanship',
        name: 'Master Swordsman',
        type: 'Passive',
        description: 'Exceptional sword skills.',
        powerLevel: 90,
      },
    ],
  },
  muzan: {
    id: 'muzan',
    name: 'Muzan Kibutsuji',
    universe: 'Demon Slayer',
    version: 'Demon King',
    description: 'First and strongest demon. Progenitor of all demons seeking perfect form.',
    imageUrl: getCharacterImageUrl('Muzan Kibutsuji', 'Demon Slayer'),
    stats: {
      strength: 94,
      speed: 92,
      durability: 98,
      stamina: 100,
      energyOutput: 96,
      techniqueProficiency: 90,
      experience: 100,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'muzan-blood-demon-art',
        name: 'Blood Demon Art',
        type: 'Demon Power',
        description: 'Controls flesh and creates tentacles.',
        powerLevel: 96,
      },
      {
        id: 'muzan-regeneration',
        name: 'Ultimate Regeneration',
        type: 'Passive',
        description: 'Regenerates from any damage instantly.',
        powerLevel: 100,
      },
      {
        id: 'muzan-shapeshifting',
        name: 'Perfect Shapeshifting',
        type: 'Ability',
        description: 'Can change appearance completely.',
        powerLevel: 88,
      },
      {
        id: 'muzan-curse',
        name: 'Demon Curse',
        type: 'Passive',
        description: 'Controls all demons through curse.',
        powerLevel: 94,
      },
    ],
  },

  // Overlord
  ainz: {
    id: 'ainz',
    name: 'Ainz Ooal Gown',
    universe: 'Overlord',
    version: 'Undead Overlord',
    description: 'Undead Overlord from Yggdrasil. Commands death magic and nazarick.',
    imageUrl: getCharacterImageUrl('Ainz Ooal Gown', 'Overlord'),
    stats: {
      strength: 68,
      speed: 62,
      durability: 95,
      stamina: 100,
      energyOutput: 100,
      techniqueProficiency: 98,
      experience: 85,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'ainz-grasp-heart',
        name: 'Grasp Heart',
        type: 'Instant Death Magic',
        description: "Crushes target's heart.",
        powerLevel: 96,
      },
      {
        id: 'ainz-reality-slash',
        name: 'Reality Slash',
        type: 'Super Tier Magic',
        description: 'Cuts through reality itself.',
        powerLevel: 98,
      },
      {
        id: 'ainz-the-goal',
        name: 'The Goal of All Life is Death',
        type: 'Ultimate Spell',
        description: 'Makes instant death spells unavoidable.',
        powerLevel: 100,
      },
      {
        id: 'ainz-perfect-warrior',
        name: 'Perfect Warrior',
        type: 'Transformation',
        description: 'Becomes perfect melee combatant.',
        powerLevel: 90,
      },
    ],
  },

  // Tokyo Ghoul
  kaneki: {
    id: 'kaneki',
    name: 'Ken Kaneki',
    universe: 'Tokyo Ghoul',
    version: 'Dragon / One-Eyed King',
    description: 'One-Eyed Ghoul who became Dragon. Can control kagune at will.',
    imageUrl: getCharacterImageUrl('Ken Kaneki', 'Tokyo Ghoul'),
    stats: {
      strength: 86,
      speed: 88,
      durability: 84,
      stamina: 90,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 78,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'kaneki-kagune',
        name: 'Rinkaku Kagune',
        type: 'Ghoul Ability',
        description: 'Multiple tentacle-like kagune.',
        powerLevel: 90,
      },
      {
        id: 'kaneki-regeneration',
        name: 'Ghoul Regeneration',
        type: 'Passive',
        description: 'Rapid healing from injuries.',
        powerLevel: 92,
      },
      {
        id: 'kaneki-dragon',
        name: 'Dragon Form',
        type: 'Transformation',
        description: 'Massive dragon-like kakuja form.',
        powerLevel: 96,
      },
      {
        id: 'kaneki-centipede',
        name: 'Centipede Kakuja',
        type: 'Kakuja Form',
        description: 'Armored centipede kagune.',
        powerLevel: 88,
      },
    ],
  },

  // Black Clover
  asta: {
    id: 'asta',
    name: 'Asta',
    universe: 'Black Clover',
    version: 'Anti-Magic',
    description: 'Magicless boy with anti-magic swords. Can negate all magic.',
    imageUrl: getCharacterImageUrl('Asta', 'Black Clover'),
    stats: {
      strength: 84,
      speed: 86,
      durability: 80,
      stamina: 92,
      energyOutput: 70,
      techniqueProficiency: 82,
      experience: 72,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'asta-anti-magic',
        name: 'Anti-Magic',
        type: 'Unique Power',
        description: 'Negates all magic.',
        powerLevel: 98,
      },
      {
        id: 'asta-demon-slayer',
        name: 'Demon Slayer Sword',
        type: 'Weapon',
        description: 'Anti-magic sword that cuts magic.',
        powerLevel: 92,
      },
      {
        id: 'asta-black-form',
        name: 'Black Asta',
        type: 'Transformation',
        description: 'Devil power amplification.',
        powerLevel: 94,
      },
      {
        id: 'asta-physical',
        name: 'Superhuman Physical Training',
        type: 'Passive',
        description: 'Extreme physical conditioning.',
        powerLevel: 86,
      },
    ],
  },
  yuno: {
    id: 'yuno',
    name: 'Yuno',
    universe: 'Black Clover',
    version: 'Spirit Dive',
    description: "Wind magic prodigy with spirit Sylph. Asta's rival.",
    imageUrl: getCharacterImageUrl('Yuno', 'Black Clover'),
    stats: {
      strength: 72,
      speed: 90,
      durability: 74,
      stamina: 86,
      energyOutput: 94,
      techniqueProficiency: 92,
      experience: 70,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'yuno-spirit-dive',
        name: 'Spirit Dive',
        type: 'Transformation',
        description: 'Merges with wind spirit Sylph.',
        powerLevel: 94,
      },
      {
        id: 'yuno-wind-magic',
        name: 'Wind Magic',
        type: 'Magic',
        description: 'Exceptional wind magic talent.',
        powerLevel: 90,
      },
      {
        id: 'yuno-star-magic',
        name: 'Star Magic',
        type: 'Magic',
        description: 'Royal star magic.',
        powerLevel: 88,
      },
      {
        id: 'yuno-spirit-storm',
        name: 'Spirit Storm',
        type: 'Ultimate Attack',
        description: 'Massive wind and magic attack.',
        powerLevel: 92,
      },
    ],
  },

  // Fairy Tail
  natsu: {
    id: 'natsu',
    name: 'Natsu Dragneel',
    universe: 'Fairy Tail',
    version: 'Dragon Force',
    description: 'Fire Dragon Slayer raised by dragon Igneel. Eats fire for power.',
    imageUrl: getCharacterImageUrl('Natsu Dragneel', 'Fairy Tail'),
    stats: {
      strength: 86,
      speed: 84,
      durability: 88,
      stamina: 92,
      energyOutput: 90,
      techniqueProficiency: 80,
      experience: 82,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'natsu-fire-dragon-roar',
        name: "Fire Dragon's Roar",
        type: 'Dragon Slayer Magic',
        description: 'Breathes massive fire blast.',
        powerLevel: 90,
      },
      {
        id: 'natsu-dragon-force',
        name: 'Dragon Force',
        type: 'Transformation',
        description: 'Ultimate dragon slayer form.',
        powerLevel: 94,
      },
      {
        id: 'natsu-lightning-flame',
        name: 'Lightning Flame Dragon Mode',
        type: 'Dual Element',
        description: 'Combines fire and lightning.',
        powerLevel: 92,
      },
      {
        id: 'natsu-igneel-power',
        name: "Igneel's Power",
        type: 'Ultimate Form',
        description: "Temporary access to Igneel's full power.",
        powerLevel: 96,
      },
    ],
  },
  erza: {
    id: 'erza',
    name: 'Erza Scarlet',
    universe: 'Fairy Tail',
    version: 'Titania',
    description: 'S-Class wizard who requips hundreds of armors and weapons mid-battle.',
    imageUrl: getCharacterImageUrl('Erza Scarlet', 'Fairy Tail'),
    stats: {
      strength: 84,
      speed: 82,
      durability: 90,
      stamina: 88,
      energyOutput: 86,
      techniqueProficiency: 96,
      experience: 90,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'erza-requip',
        name: 'The Knight - Requip',
        type: 'Magic',
        description: 'Instantly changes armor and weapons.',
        powerLevel: 94,
      },
      {
        id: 'erza-heavens-wheel',
        name: "Heaven's Wheel Armor",
        type: 'Requip',
        description: 'Controls hundreds of swords.',
        powerLevel: 92,
      },
      {
        id: 'erza-nakagami',
        name: 'Nakagami Armor',
        type: 'Ultimate Requip',
        description: 'Armor that cuts magic itself.',
        powerLevel: 96,
      },
      {
        id: 'erza-combat-genius',
        name: 'Combat Genius',
        type: 'Passive',
        description: 'Exceptional battle tactics.',
        powerLevel: 90,
      },
    ],
  },

  // Seven Deadly Sins
  meliodas: {
    id: 'meliodas',
    name: 'Meliodas',
    universe: 'Seven Deadly Sins',
    version: 'Demon King',
    description: 'Captain of Seven Deadly Sins and former Demon King. Can reflect magic.',
    imageUrl: getCharacterImageUrl('Meliodas', 'Seven Deadly Sins'),
    stats: {
      strength: 96,
      speed: 92,
      durability: 94,
      stamina: 98,
      energyOutput: 96,
      techniqueProficiency: 94,
      experience: 100,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'meliodas-full-counter',
        name: 'Full Counter',
        type: 'Magic',
        description: 'Reflects magic attacks with double power.',
        powerLevel: 96,
      },
      {
        id: 'meliodas-demon-king-mode',
        name: 'Demon King Mode',
        type: 'Transformation',
        description: 'God-tier demon power.',
        powerLevel: 100,
      },
      {
        id: 'meliodas-hellblaze',
        name: 'Hellblaze',
        type: 'Demon Power',
        description: 'Black flames that prevent regeneration.',
        powerLevel: 92,
      },
      {
        id: 'meliodas-assault-mode',
        name: 'Assault Mode',
        type: 'Power Up',
        description: 'Original demon power unsealed.',
        powerLevel: 94,
      },
    ],
  },
  escanor: {
    id: 'escanor',
    name: 'Escanor',
    universe: 'Seven Deadly Sins',
    version: 'The One',
    description: 'Sin of Pride with power that peaks at noon. Strongest man alive for one minute.',
    imageUrl: getCharacterImageUrl('Escanor', 'Seven Deadly Sins'),
    stats: {
      strength: 100,
      speed: 85,
      durability: 92,
      stamina: 75,
      energyOutput: 100,
      techniqueProficiency: 88,
      experience: 86,
      adaptability: 70,
    },
    abilities: [
      {
        id: 'escanor-the-one',
        name: 'The One',
        type: 'Ultimate Form',
        description: 'For 1 minute at noon, becomes invincible.',
        powerLevel: 100,
      },
      {
        id: 'escanor-sunshine',
        name: 'Sunshine',
        type: 'Power',
        description: "Power increases with sun's position.",
        powerLevel: 98,
      },
      {
        id: 'escanor-divine-sword',
        name: 'Divine Sword Escanor',
        type: 'Weapon',
        description: 'Axe of immense power.',
        powerLevel: 94,
      },
      {
        id: 'escanor-cruel-sun',
        name: 'Cruel Sun',
        type: 'Magic',
        description: 'Miniature sun under his control.',
        powerLevel: 96,
      },
    ],
  },

  // Sword Art Online
  kirito: {
    id: 'kirito',
    name: 'Kirito',
    universe: 'Sword Art Online',
    version: 'Dual Blades',
    description:
      'Black Swordsman and beater. Fastest reaction time and dual wielding unique skill.',
    imageUrl: getCharacterImageUrl('Kirito', 'Sword Art Online'),
    stats: {
      strength: 76,
      speed: 92,
      durability: 72,
      stamina: 82,
      energyOutput: 78,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'kirito-dual-blades',
        name: 'Dual Blades',
        type: 'Unique Skill',
        description: 'Fastest player gets two swords.',
        powerLevel: 92,
      },
      {
        id: 'kirito-starburst-stream',
        name: 'Starburst Stream',
        type: 'Sword Skill',
        description: '16-hit dual blade combo.',
        powerLevel: 94,
      },
      {
        id: 'kirito-incarnation',
        name: 'Incarnation',
        type: 'Willpower',
        description: 'Imagination becomes reality through will.',
        powerLevel: 90,
      },
      {
        id: 'kirito-release-recollection',
        name: 'Release Recollection',
        type: 'Sacred Art',
        description: "Unlock weapon's full potential.",
        powerLevel: 88,
      },
    ],
  },

  // Mob Psycho 100
  mob: {
    id: 'mob',
    name: 'Shigeo Kageyama / Mob',
    universe: 'Mob Psycho 100',
    version: '???% Mode',
    description: 'Most powerful esper alive. At 100% emotion releases tremendous psychic power.',
    imageUrl: getCharacterImageUrl('Shigeo Kageyama', 'Mob Psycho 100'),
    stats: {
      strength: 50,
      speed: 55,
      durability: 60,
      stamina: 98,
      energyOutput: 100,
      techniqueProficiency: 85,
      experience: 65,
      adaptability: 75,
    },
    abilities: [
      {
        id: 'mob-psychic-power',
        name: 'Overwhelming Psychic Power',
        type: 'ESP',
        description: 'God-tier telekinesis and psychic abilities.',
        powerLevel: 100,
      },
      {
        id: 'mob-100-percent',
        name: '100% Power',
        type: 'Emotional Release',
        description: 'At 100% emotion, full power unleashed.',
        powerLevel: 98,
      },
      {
        id: 'mob-question-marks',
        name: '???% Unknown',
        type: 'Ultimate Form',
        description: 'True unconscious power beyond comprehension.',
        powerLevel: 100,
      },
      {
        id: 'mob-exorcism',
        name: 'Spirit Exorcism',
        type: 'ESP',
        description: 'Can exorcise any evil spirit.',
        powerLevel: 92,
      },
    ],
  },

  // Re:Zero
  reinhard: {
    id: 'reinhard',
    name: 'Reinhard van Astrea',
    universe: 'Re:Zero',
    version: 'Sword Saint',
    description: 'Strongest character in Re:Zero. Has over 40 divine protections.',
    imageUrl: getCharacterImageUrl('Reinhard van Astrea', 'Re:Zero'),
    stats: {
      strength: 100,
      speed: 100,
      durability: 100,
      stamina: 100,
      energyOutput: 98,
      techniqueProficiency: 100,
      experience: 75,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'reinhard-divine-protections',
        name: '40+ Divine Protections',
        type: 'Blessings',
        description: 'Impossible to defeat - blessed by world.',
        powerLevel: 100,
      },
      {
        id: 'reinhard-dragon-sword',
        name: 'Dragon Sword Reid',
        type: 'Weapon',
        description: 'Legendary sword that judges worthiness.',
        powerLevel: 98,
      },
      {
        id: 'reinhard-auto-dodge',
        name: 'Auto-Dodge Blessing',
        type: 'Passive',
        description: 'Cannot be hit by first attack.',
        powerLevel: 100,
      },
      {
        id: 'reinhard-resurrection',
        name: 'Phoenix Blessing',
        type: 'Passive',
        description: 'Resurrects once from death.',
        powerLevel: 100,
      },
    ],
  },

  // Chainsaw Man
  denji: {
    id: 'denji',
    name: 'Denji / Chainsaw Man',
    universe: 'Chainsaw Man',
    version: 'Hybrid',
    description:
      'Human-devil hybrid who can transform into Chainsaw Man. Can erase concepts by eating devils.',
    imageUrl: getCharacterImageUrl('Denji', 'Chainsaw Man'),
    stats: {
      strength: 82,
      speed: 84,
      durability: 92,
      stamina: 96,
      energyOutput: 86,
      techniqueProficiency: 70,
      experience: 68,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'denji-chainsaw',
        name: 'Chainsaw Transformation',
        type: 'Devil Power',
        description: 'Grow chainsaws from head and arms.',
        powerLevel: 90,
      },
      {
        id: 'denji-regeneration',
        name: 'Devil Regeneration',
        type: 'Passive',
        description: 'Regenerate by consuming blood.',
        powerLevel: 94,
      },
      {
        id: 'denji-concept-erase',
        name: 'Concept Erasure',
        type: 'Ultimate Power',
        description: 'Eating devils erases them from existence.',
        powerLevel: 98,
      },
      {
        id: 'denji-hybrid',
        name: 'Hybrid Physiology',
        type: 'Passive',
        description: 'Benefits of both human and devil.',
        powerLevel: 88,
      },
    ],
  },

  // Dragon Quest
  erdrick: {
    id: 'erdrick',
    name: 'Erdrick / Loto',
    universe: 'Dragon Quest',
    version: 'Legendary Hero',
    description: 'Legendary hero who defeated Dragonlord. Wielder of Sword of Kings.',
    imageUrl: getCharacterImageUrl('Erdrick', 'Dragon Quest'),
    stats: {
      strength: 82,
      speed: 76,
      durability: 84,
      stamina: 86,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 92,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'erdrick-sword',
        name: 'Sword of Kings',
        type: 'Legendary Weapon',
        description: 'Blade that defeats evil.',
        powerLevel: 92,
      },
      {
        id: 'erdrick-armor',
        name: "Erdrick's Armor",
        type: 'Legendary Equipment',
        description: 'Protects from instant death.',
        powerLevel: 90,
      },
      {
        id: 'erdrick-magic',
        name: 'Hero Magic',
        type: 'Magic',
        description: 'Powerful offensive and healing magic.',
        powerLevel: 88,
      },
      {
        id: 'erdrick-hero-lineage',
        name: "Hero's Lineage",
        type: 'Passive',
        description: 'Descendant of legendary heroes.',
        powerLevel: 86,
      },
    ],
  },

  // More video game characters
  sonic: {
    id: 'sonic',
    name: 'Sonic the Hedgehog',
    universe: 'Sonic',
    version: 'Super Sonic',
    description: 'Fastest thing alive. Can achieve Super Sonic form with Chaos Emeralds.',
    imageUrl: getCharacterImageUrl('Sonic', 'Sonic'),
    stats: {
      strength: 62,
      speed: 100,
      durability: 70,
      stamina: 92,
      energyOutput: 75,
      techniqueProficiency: 82,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'sonic-super',
        name: 'Super Sonic',
        type: 'Transformation',
        description: 'Invincible golden form.',
        powerLevel: 96,
      },
      {
        id: 'sonic-speed',
        name: 'Speed of Sound',
        type: 'Passive',
        description: 'Runs faster than sound.',
        powerLevel: 98,
      },
      {
        id: 'sonic-spin-dash',
        name: 'Spin Dash',
        type: 'Attack',
        description: 'Curls into ball and attacks.',
        powerLevel: 85,
      },
      {
        id: 'sonic-chaos-control',
        name: 'Chaos Control',
        type: 'Chaos Power',
        description: 'Time manipulation with emeralds.',
        powerLevel: 94,
      },
    ],
  },
  mario: {
    id: 'mario',
    name: 'Mario',
    universe: 'Super Mario',
    version: 'Power Star',
    description: 'Legendary plumber who saves Princess Peach. Can use various power-ups.',
    imageUrl: getCharacterImageUrl('Mario', 'Super Mario'),
    stats: {
      strength: 72,
      speed: 70,
      durability: 76,
      stamina: 85,
      energyOutput: 68,
      techniqueProficiency: 80,
      experience: 95,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'mario-power-star',
        name: 'Power Star',
        type: 'Power-Up',
        description: 'Grants invincibility and flight.',
        powerLevel: 92,
      },
      {
        id: 'mario-fire-flower',
        name: 'Fire Flower',
        type: 'Power-Up',
        description: 'Shoot fireballs.',
        powerLevel: 80,
      },
      {
        id: 'mario-ultra-hammer',
        name: 'Ultra Hammer',
        type: 'Weapon',
        description: 'Powerful hammer attacks.',
        powerLevel: 82,
      },
      {
        id: 'mario-versatility',
        name: 'Power-Up Mastery',
        type: 'Passive',
        description: 'Can use any power-up effectively.',
        powerLevel: 88,
      },
    ],
  },
  megaman: {
    id: 'megaman',
    name: 'Mega Man',
    universe: 'Mega Man',
    version: 'Copy Robot',
    description: 'Robot with ability to copy defeated enemy weapons. Fights for everlasting peace.',
    imageUrl: getCharacterImageUrl('Mega Man', 'Mega Man'),
    stats: {
      strength: 64,
      speed: 72,
      durability: 75,
      stamina: 95,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'megaman-buster',
        name: 'Mega Buster',
        type: 'Weapon',
        description: 'Arm cannon that shoots energy.',
        powerLevel: 84,
      },
      {
        id: 'megaman-copy',
        name: 'Weapon Copy',
        type: 'Unique Ability',
        description: 'Copy defeated robot master weapons.',
        powerLevel: 94,
      },
      {
        id: 'megaman-rush',
        name: 'Rush Adapter',
        type: 'Fusion',
        description: 'Combines with dog Rush for flight.',
        powerLevel: 86,
      },
      {
        id: 'megaman-arsenal',
        name: 'Vast Weapon Arsenal',
        type: 'Passive',
        description: 'Access to 100+ copied weapons.',
        powerLevel: 92,
      },
    ],
  },

  // Tekken
  kazuya: {
    id: 'kazuya',
    name: 'Kazuya Mishima',
    universe: 'Tekken',
    version: 'Devil Kazuya',
    description: 'Mishima heir with Devil Gene. Can transform into powerful devil form.',
    imageUrl: getCharacterImageUrl('Kazuya Mishima', 'Tekken'),
    stats: {
      strength: 88,
      speed: 84,
      durability: 86,
      stamina: 90,
      energyOutput: 92,
      techniqueProficiency: 94,
      experience: 92,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'kazuya-devil',
        name: 'Devil Transformation',
        type: 'Devil Gene',
        description: 'Transform into Devil Kazuya.',
        powerLevel: 96,
      },
      {
        id: 'kazuya-ewgf',
        name: 'Electric Wind God Fist',
        type: 'Martial Arts',
        description: 'Perfect execution uppercut.',
        powerLevel: 92,
      },
      {
        id: 'kazuya-laser',
        name: 'Devil Beam',
        type: 'Devil Power',
        description: 'Eye laser in devil form.',
        powerLevel: 90,
      },
      {
        id: 'kazuya-mishima-style',
        name: 'Mishima Style Karate',
        type: 'Martial Arts',
        description: 'Devastating fighting style.',
        powerLevel: 94,
      },
    ],
  },

  // Guilty Gear
  sol: {
    id: 'sol',
    name: 'Sol Badguy',
    universe: 'Guilty Gear',
    version: 'Gear',
    description: 'Prototype Gear and former scientist. Commands fire magic.',
    imageUrl: getCharacterImageUrl('Sol Badguy', 'Guilty Gear'),
    stats: {
      strength: 90,
      speed: 88,
      durability: 92,
      stamina: 94,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 96,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'sol-dragon-install',
        name: 'Dragon Install',
        type: 'Gear Power',
        description: 'Awakens full Gear power.',
        powerLevel: 96,
      },
      {
        id: 'sol-gunflame',
        name: 'Gunflame',
        type: 'Fire Magic',
        description: 'Ground-running fire projectile.',
        powerLevel: 88,
      },
      {
        id: 'sol-tyrant-rave',
        name: 'Tyrant Rave',
        type: 'Overdrive',
        description: 'Massive explosive attack.',
        powerLevel: 94,
      },
      {
        id: 'sol-gear-cells',
        name: 'Gear Physiology',
        type: 'Passive',
        description: 'Superhuman strength and regeneration.',
        powerLevel: 92,
      },
    ],
  },

  // Blazblue
  ragna: {
    id: 'ragna',
    name: 'Ragna the Bloodedge',
    universe: 'BlazBlue',
    version: 'Grim Reaper',
    description: 'Wielder of Azure Grimoire and Blood-Scythe. Absorbs life force.',
    imageUrl: getCharacterImageUrl('Ragna the Bloodedge', 'BlazBlue'),
    stats: {
      strength: 86,
      speed: 84,
      durability: 88,
      stamina: 92,
      energyOutput: 90,
      techniqueProficiency: 88,
      experience: 82,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'ragna-azure',
        name: 'Azure Grimoire',
        type: 'Grimoire',
        description: 'Dark power absorbing life.',
        powerLevel: 94,
      },
      {
        id: 'ragna-blood-scythe',
        name: 'Blood-Scythe',
        type: 'Weapon',
        description: 'Life-draining giant sword.',
        powerLevel: 90,
      },
      {
        id: 'ragna-carnage-scissors',
        name: 'Carnage Scissors',
        type: 'Distortion Drive',
        description: 'Devastating dark combo.',
        powerLevel: 92,
      },
      {
        id: 'ragna-soul-eater',
        name: 'Soul Eater',
        type: 'Passive',
        description: 'Absorbs enemy life force.',
        powerLevel: 88,
      },
    ],
  },

  // Devil May Cry
  dante: {
    id: 'dante',
    name: 'Dante',
    universe: 'Devil May Cry',
    version: 'Son of Sparda',
    description: 'Half-demon devil hunter. Son of legendary Sparda with tremendous power.',
    imageUrl: getCharacterImageUrl('Dante', 'Devil May Cry'),
    stats: {
      strength: 92,
      speed: 90,
      durability: 94,
      stamina: 96,
      energyOutput: 92,
      techniqueProficiency: 96,
      experience: 94,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'dante-devil-trigger',
        name: 'Devil Trigger',
        type: 'Demon Form',
        description: 'Unleashes demon power.',
        powerLevel: 96,
      },
      {
        id: 'dante-rebellion',
        name: 'Rebellion Sword',
        type: 'Weapon',
        description: 'Demonic sword that awakens power.',
        powerLevel: 92,
      },
      {
        id: 'dante-sin-dt',
        name: 'Sin Devil Trigger',
        type: 'Ultimate Form',
        description: 'True demonic power unleashed.',
        powerLevel: 98,
      },
      {
        id: 'dante-weapons',
        name: 'Weapon Master',
        type: 'Passive',
        description: 'Expert with all weapons types.',
        powerLevel: 94,
      },
    ],
  },
  vergil: {
    id: 'vergil',
    name: 'Vergil',
    universe: 'Devil May Cry',
    version: 'The Alpha and Omega',
    description: "Dante's twin obsessed with power. Wields Yamato katana.",
    imageUrl: getCharacterImageUrl('Vergil', 'Devil May Cry'),
    stats: {
      strength: 94,
      speed: 96,
      durability: 92,
      stamina: 94,
      energyOutput: 96,
      techniqueProficiency: 98,
      experience: 94,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'vergil-yamato',
        name: 'Yamato',
        type: 'Legendary Katana',
        description: 'Sword that cuts through dimensions.',
        powerLevel: 98,
      },
      {
        id: 'vergil-judgement-cut',
        name: 'Judgement Cut End',
        type: 'Ultimate Attack',
        description: 'Infinite dimensional slashes.',
        powerLevel: 100,
      },
      {
        id: 'vergil-sdt',
        name: 'Sin Devil Trigger',
        type: 'Ultimate Form',
        description: 'Perfect demonic form.',
        powerLevel: 98,
      },
      {
        id: 'vergil-motivation',
        name: 'Motivated',
        type: 'Passive',
        description: 'Power increases with motivation.',
        powerLevel: 96,
      },
    ],
  },

  // Bayonetta
  bayonetta: {
    id: 'bayonetta',
    name: 'Bayonetta',
    universe: 'Bayonetta',
    version: 'Umbra Witch',
    description: 'Umbra Witch who can summon demons. Wields Witch Time.',
    imageUrl: getCharacterImageUrl('Bayonetta', 'Bayonetta'),
    stats: {
      strength: 84,
      speed: 94,
      durability: 82,
      stamina: 90,
      energyOutput: 92,
      techniqueProficiency: 96,
      experience: 92,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'bayonetta-witch-time',
        name: 'Witch Time',
        type: 'Time Manipulation',
        description: 'Slows time after dodging.',
        powerLevel: 96,
      },
      {
        id: 'bayonetta-wicked-weave',
        name: 'Wicked Weave',
        type: 'Demon Summon',
        description: 'Summons demon limbs for attacks.',
        powerLevel: 92,
      },
      {
        id: 'bayonetta-climax',
        name: 'Climax Summons',
        type: 'Ultimate Summon',
        description: 'Summons entire demons to fight.',
        powerLevel: 94,
      },
      {
        id: 'bayonetta-umbran',
        name: 'Umbran Arts',
        type: 'Magic',
        description: 'Dark magic mastery.',
        powerLevel: 90,
      },
    ],
  },

  // Asura's Wrath
  asura: {
    id: 'asura',
    name: 'Asura',
    universe: "Asura's Wrath",
    version: 'Destructor Form',
    description: 'Demigod powered by wrath. Defeated creator god through rage.',
    imageUrl: getCharacterImageUrl('Asura', "Asura's Wrath"),
    stats: {
      strength: 100,
      speed: 88,
      durability: 98,
      stamina: 100,
      energyOutput: 98,
      techniqueProficiency: 80,
      experience: 92,
      adaptability: 85,
    },
    abilities: [
      {
        id: 'asura-wrath',
        name: 'Unlimited Wrath',
        type: 'Passive',
        description: 'Anger makes him infinitely stronger.',
        powerLevel: 100,
      },
      {
        id: 'asura-destructor',
        name: 'Destructor Form',
        type: 'Transformation',
        description: 'Size of planet, god-killing power.',
        powerLevel: 100,
      },
      {
        id: 'asura-six-arms',
        name: 'Six-Armed Vajra',
        type: 'Form',
        description: 'Six-armed combat form.',
        powerLevel: 94,
      },
      {
        id: 'asura-punches',
        name: 'Rapid-Fire Punches',
        type: 'Attack',
        description: 'Infinite barrage of punches.',
        powerLevel: 96,
      },
    ],
  },

  // Nier
  '2b': {
    id: '2b',
    name: '2B',
    universe: 'NieR: Automata',
    version: 'YoRHa No.2 Type B',
    description: 'Combat android with extraordinary sword skills. Fights for humanity.',
    imageUrl: getCharacterImageUrl('2B', 'NieR: Automata'),
    stats: {
      strength: 78,
      speed: 88,
      durability: 84,
      stamina: 98,
      energyOutput: 76,
      techniqueProficiency: 94,
      experience: 82,
      adaptability: 90,
    },
    abilities: [
      {
        id: '2b-virtuous-contract',
        name: 'Virtuous Contract',
        type: 'Weapon',
        description: 'High-speed combat sword.',
        powerLevel: 90,
      },
      {
        id: '2b-pod',
        name: 'Pod Program',
        type: 'Support Unit',
        description: 'Flying pod with various programs.',
        powerLevel: 86,
      },
      {
        id: '2b-android',
        name: 'Android Physiology',
        type: 'Passive',
        description: 'Super strength, speed, no fatigue.',
        powerLevel: 92,
      },
      {
        id: '2b-self-destruct',
        name: 'Self-Destruct',
        type: 'Ultimate',
        description: 'Explosive self-destruct (non-lethal to user).',
        powerLevel: 88,
      },
    ],
  },

  // God of War (more)
  baldur: {
    id: 'baldur',
    name: 'Baldur',
    universe: 'God of War',
    version: 'Norse God',
    description: 'Norse god cursed with invulnerability and inability to feel anything.',
    imageUrl: getCharacterImageUrl('Baldur', 'God of War'),
    stats: {
      strength: 90,
      speed: 88,
      durability: 100,
      stamina: 94,
      energyOutput: 84,
      techniqueProficiency: 86,
      experience: 96,
      adaptability: 82,
    },
    abilities: [
      {
        id: 'baldur-invulnerability',
        name: 'Invulnerability',
        type: 'Curse/Blessing',
        description: 'Cannot be harmed by any means.',
        powerLevel: 100,
      },
      {
        id: 'baldur-god-strength',
        name: 'Godly Strength',
        type: 'Passive',
        description: 'Norse god physical power.',
        powerLevel: 90,
      },
      {
        id: 'baldur-elemental',
        name: 'Elemental Transformation',
        type: 'Magic',
        description: 'Transform into fire or ice form.',
        powerLevel: 88,
      },
      {
        id: 'baldur-regeneration',
        name: 'Norse God Healing',
        type: 'Passive',
        description: 'Rapid healing when vulnerable.',
        powerLevel: 86,
      },
    ],
  },

  // Warhammer 40k
  'warhammer-emperor': {
    id: 'emperor',
    name: 'The God Emperor',
    universe: 'Warhammer 40,000',
    version: 'Master of Mankind',
    description:
      'Immortal Emperor of Mankind with godlike psychic powers. Most powerful human ever.',
    imageUrl: getCharacterImageUrl('Emperor', 'Warhammer 40k'),
    stats: {
      strength: 96,
      speed: 85,
      durability: 100,
      stamina: 100,
      energyOutput: 100,
      techniqueProficiency: 100,
      experience: 100,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'emperor-psyker',
        name: 'Supreme Psyker',
        type: 'Psychic Power',
        description: 'Most powerful psychic in galaxy.',
        powerLevel: 100,
      },
      {
        id: 'emperor-flaming-sword',
        name: 'Flaming Sword',
        type: 'Weapon',
        description: 'Sword that burns with holy fire.',
        powerLevel: 96,
      },
      {
        id: 'emperor-immortal',
        name: 'Perpetual Immortality',
        type: 'Passive',
        description: 'Cannot truly die, resurrects.',
        powerLevel: 100,
      },
      {
        id: 'emperor-warp',
        name: 'Warp Mastery',
        type: 'Ultimate Power',
        description: 'Commands reality-warping warp energy.',
        powerLevel: 100,
      },
    ],
  },

  // The Witcher
  geralt: {
    id: 'geralt',
    name: 'Geralt of Rivia',
    universe: 'The Witcher',
    version: 'White Wolf',
    description: 'Legendary Witcher with enhanced abilities. Master swordsman and monster hunter.',
    imageUrl: getCharacterImageUrl('Geralt', 'The Witcher'),
    stats: {
      strength: 74,
      speed: 82,
      durability: 80,
      stamina: 88,
      energyOutput: 68,
      techniqueProficiency: 94,
      experience: 96,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'geralt-signs',
        name: 'Witcher Signs',
        type: 'Magic',
        description: 'Five combat magic signs.',
        powerLevel: 82,
      },
      {
        id: 'geralt-silver-sword',
        name: 'Silver Sword',
        type: 'Weapon',
        description: 'Sword effective against monsters.',
        powerLevel: 88,
      },
      {
        id: 'geralt-mutations',
        name: 'Witcher Mutations',
        type: 'Passive',
        description: 'Enhanced speed, strength, senses.',
        powerLevel: 86,
      },
      {
        id: 'geralt-combat',
        name: 'Master Swordsman',
        type: 'Combat Skill',
        description: 'Decades of monster-hunting experience.',
        powerLevel: 94,
      },
    ],
  },

  // Elder Scrolls
  dragonborn: {
    id: 'dragonborn',
    name: 'The Dragonborn',
    universe: 'The Elder Scrolls',
    version: 'Skyrim',
    description: "Legendary hero who can absorb dragon souls. Master of Thu'um shouts.",
    imageUrl: getCharacterImageUrl('Dragonborn', 'The Elder Scrolls'),
    stats: {
      strength: 82,
      speed: 74,
      durability: 84,
      stamina: 90,
      energyOutput: 90,
      techniqueProficiency: 88,
      experience: 86,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'db-fus-ro-dah',
        name: 'Fus Ro Dah',
        type: "Thu'um",
        description: 'Unrelenting Force shout.',
        powerLevel: 92,
      },
      {
        id: 'db-dragonrend',
        name: 'Dragonrend',
        type: "Thu'um",
        description: 'Forces dragons to land.',
        powerLevel: 94,
      },
      {
        id: 'db-soul-absorb',
        name: 'Dragon Soul Absorption',
        type: 'Passive',
        description: 'Absorbs dragon souls for power.',
        powerLevel: 90,
      },
      {
        id: 'db-bend-will',
        name: 'Bend Will',
        type: "Thu'um",
        description: 'Controls dragons and minds.',
        powerLevel: 88,
      },
    ],
  },

  // Dark Souls
  'chosen-undead': {
    id: 'chosen-undead',
    name: 'The Chosen Undead',
    universe: 'Dark Souls',
    version: 'Lord of Cinder',
    description: 'Undead who linked the First Flame. Cannot truly die.',
    imageUrl: getCharacterImageUrl('Chosen Undead', 'Dark Souls'),
    stats: {
      strength: 80,
      speed: 76,
      durability: 88,
      stamina: 100,
      energyOutput: 74,
      techniqueProficiency: 90,
      experience: 92,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'undead-estus',
        name: 'Estus Flask',
        type: 'Healing',
        description: 'Restores health multiple times.',
        powerLevel: 85,
      },
      {
        id: 'undead-immortality',
        name: 'Undead Curse',
        type: 'Passive',
        description: 'Resurrects infinitely at bonfires.',
        powerLevel: 100,
      },
      {
        id: 'undead-parry',
        name: 'Perfect Parry',
        type: 'Combat Skill',
        description: 'Master parrying and riposte.',
        powerLevel: 92,
      },
      {
        id: 'undead-pyromancy',
        name: 'Pyromancy',
        type: 'Magic',
        description: 'Powerful fire magic.',
        powerLevel: 86,
      },
    ],
  },

  // Bloodborne
  hunter: {
    id: 'hunter',
    name: 'The Hunter',
    universe: 'Bloodborne',
    version: 'Great One Ascended',
    description: 'Hunter who transcended humanity to become infant Great One.',
    imageUrl: getCharacterImageUrl('Hunter', 'Bloodborne'),
    stats: {
      strength: 84,
      speed: 92,
      durability: 82,
      stamina: 94,
      energyOutput: 78,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'hunter-rally',
        name: 'Rally System',
        type: 'Passive',
        description: 'Regain health by attacking after damage.',
        powerLevel: 88,
      },
      {
        id: 'hunter-quickstep',
        name: 'Quickstep',
        type: 'Movement',
        description: 'Lightning-fast dodging.',
        powerLevel: 92,
      },
      {
        id: 'hunter-visceral',
        name: 'Visceral Attack',
        type: 'Combat Skill',
        description: 'Devastating critical strikes.',
        powerLevel: 94,
      },
      {
        id: 'hunter-ascension',
        name: 'Great One Ascension',
        type: 'Transformation',
        description: 'Transcended humanity.',
        powerLevel: 96,
      },
    ],
  },

  // Elden Ring
  tarnished: {
    id: 'tarnished',
    name: 'The Tarnished',
    universe: 'Elden Ring',
    version: 'Elden Lord',
    description: 'Tarnished who became Elden Lord. Wields power of Great Runes.',
    imageUrl: getCharacterImageUrl('Tarnished', 'Elden Ring'),
    stats: {
      strength: 86,
      speed: 80,
      durability: 84,
      stamina: 92,
      energyOutput: 88,
      techniqueProficiency: 92,
      experience: 85,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'tarnished-ashes',
        name: 'Ashes of War',
        type: 'Equipment Skill',
        description: 'Powerful weapon arts.',
        powerLevel: 90,
      },
      {
        id: 'tarnished-summons',
        name: 'Spirit Ashes',
        type: 'Summoning',
        description: 'Summon spirit allies.',
        powerLevel: 86,
      },
      {
        id: 'tarnished-great-runes',
        name: 'Great Runes',
        type: 'Power Up',
        description: 'Power of demigod bosses.',
        powerLevel: 94,
      },
      {
        id: 'tarnished-destined-death',
        name: 'Destined Death',
        type: 'Ultimate Power',
        description: 'Kill immortal beings permanently.',
        powerLevel: 96,
      },
    ],
  },

  // Hollow Knight
  knight: {
    id: 'knight',
    name: 'The Knight',
    universe: 'Hollow Knight',
    version: 'Void Entity',
    description: 'Hollow vessel containing the Void. Pure emptiness given focus.',
    imageUrl: getCharacterImageUrl('Knight', 'Hollow Knight'),
    stats: {
      strength: 68,
      speed: 86,
      durability: 80,
      stamina: 100,
      energyOutput: 84,
      techniqueProficiency: 88,
      experience: 82,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'knight-shade-cloak',
        name: 'Shade Cloak',
        type: 'Ability',
        description: 'Become invincible shadow.',
        powerLevel: 90,
      },
      {
        id: 'knight-void-heart',
        name: 'Void Heart',
        type: 'Passive',
        description: 'Control over pure Void.',
        powerLevel: 92,
      },
      {
        id: 'knight-abyss-shriek',
        name: 'Abyss Shriek',
        type: 'Spell',
        description: 'Devastating void scream.',
        powerLevel: 88,
      },
      {
        id: 'knight-wings',
        name: 'Monarch Wings',
        type: 'Movement',
        description: 'Flight capability.',
        powerLevel: 82,
      },
    ],
  },

  // Undertale
  sans: {
    id: 'sans',
    name: 'Sans',
    universe: 'Undertale',
    version: 'The Judge',
    description: 'Skeleton who judges genocidal player. Can dodge and manipulate souls.',
    imageUrl: getCharacterImageUrl('Sans', 'Undertale'),
    stats: {
      strength: 1,
      speed: 98,
      durability: 1,
      stamina: 65,
      energyOutput: 90,
      techniqueProficiency: 100,
      experience: 95,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'sans-karmic-retribution',
        name: 'Karmic Retribution',
        type: 'Unique Attack',
        description: 'Damage proportional to sins/LOVE.',
        powerLevel: 100,
      },
      {
        id: 'sans-gaster-blaster',
        name: 'Gaster Blaster',
        type: 'Special Attack',
        description: 'Beam-firing skull cannons.',
        powerLevel: 96,
      },
      {
        id: 'sans-dodge',
        name: 'Perfect Dodging',
        type: 'Passive',
        description: 'Only character who can dodge attacks.',
        powerLevel: 100,
      },
      {
        id: 'sans-teleport',
        name: 'Shortcuts',
        type: 'Space Manipulation',
        description: 'Teleportation and timeline awareness.',
        powerLevel: 94,
      },
    ],
  },

  // Deltarune
  kris: {
    id: 'kris',
    name: 'Kris',
    universe: 'Deltarune',
    version: 'Dark World Hero',
    description: 'Human with power to seal Dark Fountains. Can remove their soul.',
    imageUrl: getCharacterImageUrl('Kris', 'Deltarune'),
    stats: {
      strength: 64,
      speed: 68,
      durability: 70,
      stamina: 80,
      energyOutput: 72,
      techniqueProficiency: 76,
      experience: 60,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'kris-soul-removal',
        name: 'Soul Removal',
        type: 'Unique Ability',
        description: 'Can remove and cage their own soul.',
        powerLevel: 92,
      },
      {
        id: 'kris-seal-fountain',
        name: 'Seal Dark Fountains',
        type: 'Special Power',
        description: 'Seal fountains with sword.',
        powerLevel: 88,
      },
      {
        id: 'kris-act',
        name: 'ACT Command',
        type: 'Ability',
        description: 'Resolve conflicts peacefully.',
        powerLevel: 85,
      },
      {
        id: 'kris-determination',
        name: 'Determination',
        type: 'Passive',
        description: 'Power to persist and reload.',
        powerLevel: 90,
      },
    ],
  },

  // Celeste
  madeline: {
    id: 'madeline',
    name: 'Madeline',
    universe: 'Celeste',
    version: 'Mountain Climber',
    description: 'Girl who climbed Celeste Mountain. Overcame anxiety and depression.',
    imageUrl: getCharacterImageUrl('Madeline', 'Celeste'),
    stats: {
      strength: 52,
      speed: 88,
      durability: 74,
      stamina: 96,
      energyOutput: 70,
      techniqueProficiency: 82,
      experience: 68,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'madeline-dash',
        name: 'Air Dash',
        type: 'Movement',
        description: 'Single air dash for mobility.',
        powerLevel: 84,
      },
      {
        id: 'madeline-climb',
        name: 'Expert Climbing',
        type: 'Skill',
        description: 'Can climb any wall with stamina.',
        powerLevel: 88,
      },
      {
        id: 'madeline-badeline',
        name: 'Badeline Fusion',
        type: 'Power Up',
        description: 'Merged with shadow self for double dash.',
        powerLevel: 90,
      },
      {
        id: 'madeline-determination',
        name: 'Unwavering Will',
        type: 'Passive',
        description: 'Never gives up despite failures.',
        powerLevel: 92,
      },
    ],
  },

  // Castlevania
  alucard: {
    id: 'alucard',
    name: 'Alucard',
    universe: 'Castlevania',
    version: 'Dhampir',
    description: 'Son of Dracula who opposes his father. Half-vampire with tremendous power.',
    imageUrl: getCharacterImageUrl('Alucard', 'Castlevania'),
    stats: {
      strength: 88,
      speed: 90,
      durability: 86,
      stamina: 94,
      energyOutput: 90,
      techniqueProficiency: 94,
      experience: 98,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'alucard-mist',
        name: 'Mist Form',
        type: 'Transformation',
        description: 'Become invincible mist.',
        powerLevel: 92,
      },
      {
        id: 'alucard-hellfire',
        name: 'Hellfire',
        type: 'Dark Magic',
        description: 'Summons pillars of flame.',
        powerLevel: 90,
      },
      {
        id: 'alucard-sword',
        name: 'Alucard Sword',
        type: 'Weapon',
        description: 'Legendary vampire blade.',
        powerLevel: 88,
      },
      {
        id: 'alucard-vampire',
        name: 'Dhampir Powers',
        type: 'Passive',
        description: 'Vampire abilities without weaknesses.',
        powerLevel: 94,
      },
    ],
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    universe: 'Castlevania',
    version: 'Dark Lord',
    description: 'Immortal vampire lord who resurrects every century. Ultimate evil.',
    imageUrl: getCharacterImageUrl('Dracula', 'Castlevania'),
    stats: {
      strength: 94,
      speed: 82,
      durability: 96,
      stamina: 100,
      energyOutput: 98,
      techniqueProficiency: 96,
      experience: 100,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'dracula-dark-inferno',
        name: 'Dark Inferno',
        type: 'Dark Magic',
        description: 'Black flame pillars.',
        powerLevel: 96,
      },
      {
        id: 'dracula-resurrection',
        name: 'Infinite Resurrection',
        type: 'Passive',
        description: 'Always returns after death.',
        powerLevel: 100,
      },
      {
        id: 'dracula-chaos',
        name: 'Chaos Form',
        type: 'Ultimate Form',
        description: 'True monstrous demon form.',
        powerLevel: 98,
      },
      {
        id: 'dracula-teleport',
        name: 'Teleportation',
        type: 'Ability',
        description: 'Instant movement.',
        powerLevel: 88,
      },
    ],
  },

  // Metal Gear
  'solid-snake': {
    id: 'solid-snake',
    name: 'Solid Snake',
    universe: 'Metal Gear',
    version: 'Legendary Soldier',
    description: 'Legendary mercenary and clone of Big Boss. Master of stealth and CQC.',
    imageUrl: getCharacterImageUrl('Solid Snake', 'Metal Gear'),
    stats: {
      strength: 72,
      speed: 76,
      durability: 78,
      stamina: 88,
      energyOutput: 45,
      techniqueProficiency: 96,
      experience: 98,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'snake-cqc',
        name: 'CQC Master',
        type: 'Combat Skill',
        description: 'Close Quarters Combat expert.',
        powerLevel: 94,
      },
      {
        id: 'snake-stealth',
        name: 'Legendary Stealth',
        type: 'Skill',
        description: 'Perfect infiltration abilities.',
        powerLevel: 96,
      },
      {
        id: 'snake-weapons',
        name: 'Weapons Expert',
        type: 'Combat Skill',
        description: 'Master of all weapons.',
        powerLevel: 92,
      },
      {
        id: 'snake-cardboard',
        name: 'Tactical Espionage',
        type: 'Stealth',
        description: 'Can hide in cardboard box.',
        powerLevel: 90,
      },
    ],
  },

  // Resident Evil
  leon: {
    id: 'leon',
    name: 'Leon S. Kennedy',
    universe: 'Resident Evil',
    version: 'Special Agent',
    description: 'Government agent who survived Raccoon City. Expert in anti-BOW combat.',
    imageUrl: getCharacterImageUrl('Leon', 'Resident Evil'),
    stats: {
      strength: 68,
      speed: 78,
      durability: 74,
      stamina: 82,
      energyOutput: 42,
      techniqueProficiency: 90,
      experience: 88,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'leon-accuracy',
        name: 'Perfect Marksmanship',
        type: 'Combat Skill',
        description: 'Never misses critical shots.',
        powerLevel: 92,
      },
      {
        id: 'leon-knife',
        name: 'Combat Knife Expert',
        type: 'Combat Skill',
        description: 'Master knife fighter.',
        powerLevel: 86,
      },
      {
        id: 'leon-survival',
        name: 'Survival Instinct',
        type: 'Passive',
        description: 'Survives impossible situations.',
        powerLevel: 90,
      },
      {
        id: 'leon-suplex',
        name: 'Suplex',
        type: 'Combat Move',
        description: 'Can suplex anything.',
        powerLevel: 84,
      },
    ],
  },
  chris: {
    id: 'chris',
    name: 'Chris Redfield',
    universe: 'Resident Evil',
    version: 'BSAA Captain',
    description: 'Founding BSAA member. Superhuman strength from years of combat.',
    imageUrl: getCharacterImageUrl('Chris', 'Resident Evil'),
    stats: {
      strength: 84,
      speed: 76,
      durability: 82,
      stamina: 88,
      energyOutput: 48,
      techniqueProficiency: 88,
      experience: 96,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'chris-boulder-punch',
        name: 'Boulder Punching',
        type: 'Strength Feat',
        description: 'Can punch boulders into lava.',
        powerLevel: 92,
      },
      {
        id: 'chris-firearms',
        name: 'Firearms Master',
        type: 'Combat Skill',
        description: 'Expert with all weapons.',
        powerLevel: 90,
      },
      {
        id: 'chris-combat',
        name: 'Hand-to-Hand Combat',
        type: 'Combat Skill',
        description: 'Decades of fighting experience.',
        powerLevel: 88,
      },
      {
        id: 'chris-durability',
        name: 'Superhuman Endurance',
        type: 'Passive',
        description: 'Survives incredible damage.',
        powerLevel: 86,
      },
    ],
  },

  // Mass Effect
  shepard: {
    id: 'shepard',
    name: 'Commander Shepard',
    universe: 'Mass Effect',
    version: 'Spectre',
    description: 'First human Spectre. Saved galaxy from Reapers multiple times.',
    imageUrl: getCharacterImageUrl('Shepard', 'Mass Effect'),
    stats: {
      strength: 74,
      speed: 72,
      durability: 80,
      stamina: 85,
      energyOutput: 78,
      techniqueProficiency: 92,
      experience: 90,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'shepard-biotics',
        name: 'Biotic Powers',
        type: 'Biotics',
        description: 'Mass effect field manipulation.',
        powerLevel: 88,
      },
      {
        id: 'shepard-leadership',
        name: 'Legendary Leadership',
        type: 'Passive',
        description: 'Inspires loyalty and excellence.',
        powerLevel: 96,
      },
      {
        id: 'shepard-tech',
        name: 'Tech Mastery',
        type: 'Technology',
        description: 'Advanced tech abilities.',
        powerLevel: 86,
      },
      {
        id: 'shepard-determination',
        name: 'Indomitable Will',
        type: 'Passive',
        description: 'Never gives up, dies but returns.',
        powerLevel: 94,
      },
    ],
  },

  // Warframe
  tenno: {
    id: 'tenno',
    name: 'The Tenno',
    universe: 'Warframe',
    version: 'Operator',
    description: 'Ancient warrior controlling biomechanical Warframes. Void-touched.',
    imageUrl: getCharacterImageUrl('Tenno', 'Warframe'),
    stats: {
      strength: 80,
      speed: 92,
      durability: 86,
      stamina: 100,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 96,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'tenno-transference',
        name: 'Transference',
        type: 'Ability',
        description: 'Control Warframes remotely.',
        powerLevel: 94,
      },
      {
        id: 'tenno-void',
        name: 'Void Powers',
        type: 'Void Energy',
        description: 'Command pure Void energy.',
        powerLevel: 96,
      },
      {
        id: 'tenno-warframe',
        name: 'Warframe Arsenal',
        type: 'Equipment',
        description: 'Access to 50+ Warframes.',
        powerLevel: 92,
      },
      {
        id: 'tenno-immortal',
        name: 'Rebirth',
        type: 'Passive',
        description: 'Cannot permanently die.',
        powerLevel: 98,
      },
    ],
  },

  // Destiny
  guardian: {
    id: 'guardian',
    name: 'The Guardian',
    universe: 'Destiny',
    version: 'Godslayer',
    description: 'Risen by the Light. Killed gods and saved humanity countless times.',
    imageUrl: getCharacterImageUrl('Guardian', 'Destiny'),
    stats: {
      strength: 82,
      speed: 84,
      durability: 88,
      stamina: 100,
      energyOutput: 92,
      techniqueProficiency: 90,
      experience: 94,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'guardian-light',
        name: 'Light Powers',
        type: 'Paracausal',
        description: 'Wield Solar, Arc, Void, and Stasis.',
        powerLevel: 94,
      },
      {
        id: 'guardian-super',
        name: 'Super Abilities',
        type: 'Ultimate',
        description: 'Devastating super attacks.',
        powerLevel: 96,
      },
      {
        id: 'guardian-ghost',
        name: 'Ghost Resurrection',
        type: 'Passive',
        description: 'Ghost brings back from death.',
        powerLevel: 100,
      },
      {
        id: 'guardian-weapons',
        name: 'Exotic Weapons',
        type: 'Equipment',
        description: 'Legendary reality-defying guns.',
        powerLevel: 90,
      },
    ],
  },

  // Xenoblade
  shulk: {
    id: 'shulk',
    name: 'Shulk',
    universe: 'Xenoblade Chronicles',
    version: 'Monado Wielder',
    description: 'Wields Monado blade that can see the future. Became a god.',
    imageUrl: getCharacterImageUrl('Shulk', 'Xenoblade Chronicles'),
    stats: {
      strength: 76,
      speed: 80,
      durability: 78,
      stamina: 85,
      energyOutput: 88,
      techniqueProficiency: 86,
      experience: 74,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'shulk-monado',
        name: 'Monado',
        type: 'Weapon',
        description: 'Legendary reality-cutting blade.',
        powerLevel: 94,
      },
      {
        id: 'shulk-vision',
        name: 'Monado Visions',
        type: 'Precognition',
        description: 'See the future to change it.',
        powerLevel: 96,
      },
      {
        id: 'shulk-arts',
        name: 'Monado Arts',
        type: 'Special Abilities',
        description: 'Shield, Speed, Buster, etc.',
        powerLevel: 90,
      },
      {
        id: 'shulk-god-power',
        name: 'Alvis Connection',
        type: 'Ultimate Power',
        description: 'Became a god at story end.',
        powerLevel: 98,
      },
    ],
  },

  // Kingdom Hearts
  sora: {
    id: 'sora',
    name: 'Sora',
    universe: 'Kingdom Hearts',
    version: 'Keyblade Master',
    description: 'Keyblade wielder who saved multiple worlds. Wields Kingdom Key.',
    imageUrl: getCharacterImageUrl('Sora', 'Kingdom Hearts'),
    stats: {
      strength: 80,
      speed: 84,
      durability: 82,
      stamina: 90,
      energyOutput: 86,
      techniqueProficiency: 88,
      experience: 88,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'sora-keyblade',
        name: 'Kingdom Key',
        type: 'Weapon',
        description: 'Can unlock any lock, defeats darkness.',
        powerLevel: 90,
      },
      {
        id: 'sora-drive-forms',
        name: 'Drive Forms',
        type: 'Transformation',
        description: 'Multiple powerful forms.',
        powerLevel: 92,
      },
      {
        id: 'sora-magic',
        name: 'Kingdom Hearts Magic',
        type: 'Magic',
        description: 'Fire, Blizzard, Thunder, Cure, etc.',
        powerLevel: 86,
      },
      {
        id: 'sora-friendship',
        name: 'Power of Friendship',
        type: 'Passive',
        description: 'Gets stronger through bonds.',
        powerLevel: 94,
      },
    ],
  },
  riku: {
    id: 'riku',
    name: 'Riku',
    universe: 'Kingdom Hearts',
    version: 'Dream Eater',
    description: "Keyblade Master who mastered darkness. Sora's best friend and rival.",
    imageUrl: getCharacterImageUrl('Riku', 'Kingdom Hearts'),
    stats: {
      strength: 84,
      speed: 86,
      durability: 82,
      stamina: 88,
      energyOutput: 90,
      techniqueProficiency: 92,
      experience: 90,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'riku-way-to-dawn',
        name: 'Way to Dawn',
        type: 'Keyblade',
        description: 'Keyblade forged from darkness.',
        powerLevel: 92,
      },
      {
        id: 'riku-dark-mode',
        name: 'Dark Mode',
        type: 'Transformation',
        description: 'Controls darkness without corruption.',
        powerLevel: 94,
      },
      {
        id: 'riku-dark-firaga',
        name: 'Dark Firaga',
        type: 'Dark Magic',
        description: 'Powerful dark fire magic.',
        powerLevel: 88,
      },
      {
        id: 'riku-aura',
        name: 'Dark Aura',
        type: 'Limit Break',
        description: 'Devastating darkness slash combo.',
        powerLevel: 90,
      },
    ],
  },

  // Persona
  joker: {
    id: 'joker',
    name: 'Joker',
    universe: 'Persona 5',
    version: 'Phantom Thief',
    description: 'Leader of Phantom Thieves with Wild Card ability. Can use multiple Personas.',
    imageUrl: getCharacterImageUrl('Joker', 'Persona 5'),
    stats: {
      strength: 74,
      speed: 82,
      durability: 76,
      stamina: 85,
      energyOutput: 90,
      techniqueProficiency: 88,
      experience: 76,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'joker-wild-card',
        name: 'Wild Card',
        type: 'Unique Ability',
        description: 'Can wield unlimited Personas.',
        powerLevel: 96,
      },
      {
        id: 'joker-arsene',
        name: 'Arsene',
        type: 'Persona',
        description: 'His original rebellious Persona.',
        powerLevel: 86,
      },
      {
        id: 'joker-satanael',
        name: 'Satanael',
        type: 'Ultimate Persona',
        description: 'God-killing ultimate Persona.',
        powerLevel: 98,
      },
      {
        id: 'joker-all-out',
        name: 'All-Out Attack',
        type: 'Team Attack',
        description: 'Devastating team finisher.',
        powerLevel: 92,
      },
    ],
  },

  // Fire Emblem
  byleth: {
    id: 'byleth',
    name: 'Byleth',
    universe: 'Fire Emblem',
    version: 'Enlightened One',
    description: 'Professor merged with goddess Sothis. Can rewind time.',
    imageUrl: getCharacterImageUrl('Byleth', 'Fire Emblem'),
    stats: {
      strength: 78,
      speed: 80,
      durability: 76,
      stamina: 84,
      energyOutput: 82,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'byleth-divine-pulse',
        name: 'Divine Pulse',
        type: 'Time Manipulation',
        description: 'Rewind time to undo mistakes.',
        powerLevel: 98,
      },
      {
        id: 'byleth-sword-creator',
        name: 'Sword of the Creator',
        type: 'Legendary Weapon',
        description: 'Whip-sword made from bones of goddess.',
        powerLevel: 92,
      },
      {
        id: 'byleth-crest',
        name: 'Crest of Flames',
        type: 'Power',
        description: 'Power of the progenitor god.',
        powerLevel: 90,
      },
      {
        id: 'byleth-enlightened',
        name: 'Enlightened One',
        type: 'Transformation',
        description: 'Merged with goddess Sothis.',
        powerLevel: 94,
      },
    ],
  },

  // Tales
  yuri: {
    id: 'yuri',
    name: 'Yuri Lowell',
    universe: 'Tales of Vesperia',
    version: 'Vigilante',
    description: 'Former knight turned vigilante. Master swordsman seeking true justice.',
    imageUrl: getCharacterImageUrl('Yuri', 'Tales of Vesperia'),
    stats: {
      strength: 80,
      speed: 86,
      durability: 78,
      stamina: 84,
      energyOutput: 76,
      techniqueProficiency: 92,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'yuri-dragon-swarm',
        name: 'Dragon Swarm',
        type: 'Mystic Arte',
        description: 'Ultimate sword technique.',
        powerLevel: 94,
      },
      {
        id: 'yuri-ghost-wolf',
        name: 'Ghost Wolf',
        type: 'Arte',
        description: 'Lightning-fast slashing combo.',
        powerLevel: 88,
      },
      {
        id: 'yuri-brutal-fang',
        name: 'Brutal Fang',
        type: 'Base Arte',
        description: 'Powerful uppercut slash.',
        powerLevel: 86,
      },
      {
        id: 'yuri-swordsmanship',
        name: 'Master Swordsman',
        type: 'Passive',
        description: 'Exceptional blade skills.',
        powerLevel: 92,
      },
    ],
  },

  // Guilty Gear (more)
  ky: {
    id: 'ky',
    name: 'Ky Kiske',
    universe: 'Guilty Gear',
    version: 'King of Illyria',
    description: 'Former Holy Knight now King. Wields sacred lightning.',
    imageUrl: getCharacterImageUrl('Ky', 'Guilty Gear'),
    stats: {
      strength: 82,
      speed: 86,
      durability: 80,
      stamina: 88,
      energyOutput: 90,
      techniqueProficiency: 94,
      experience: 94,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'ky-stun-edge',
        name: 'Stun Edge',
        type: 'Lightning Magic',
        description: 'Lightning projectile.',
        powerLevel: 86,
      },
      {
        id: 'ky-ride-lightning',
        name: 'Ride the Lightning',
        type: 'Overdrive',
        description: 'Devastating lightning slash.',
        powerLevel: 92,
      },
      {
        id: 'ky-sacred-edge',
        name: 'Sacred Edge',
        type: 'Holy Power',
        description: 'Divine lightning power.',
        powerLevel: 90,
      },
      {
        id: 'ky-dragon-install',
        name: 'Dragon Install Ky',
        type: 'Gear Awakening',
        description: 'Gear cells awakened.',
        powerLevel: 94,
      },
    ],
  },

  // Touhou
  reimu: {
    id: 'reimu',
    name: 'Reimu Hakurei',
    universe: 'Touhou Project',
    version: 'Shrine Maiden',
    description:
      'Hakurei shrine maiden who maintains balance in Gensokyo. Can float away from reality.',
    imageUrl: getCharacterImageUrl('Reimu', 'Touhou'),
    stats: {
      strength: 55,
      speed: 78,
      durability: 68,
      stamina: 82,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'reimu-fantasy-seal',
        name: 'Fantasy Seal',
        type: 'Spell Card',
        description: 'Homing amulet barrage.',
        powerLevel: 90,
      },
      {
        id: 'reimu-fantasy-nature',
        name: 'Fantasy Nature',
        type: 'Ultimate Spell',
        description: 'Becomes invincible by floating from reality.',
        powerLevel: 100,
      },
      {
        id: 'reimu-yin-yang-orbs',
        name: 'Yin-Yang Orbs',
        type: 'Weapon',
        description: 'Spiritual orbs that auto-attack.',
        powerLevel: 86,
      },
      {
        id: 'reimu-shrine-maiden',
        name: 'Shrine Maiden Powers',
        type: 'Passive',
        description: 'Spiritual and youkai expertise.',
        powerLevel: 88,
      },
    ],
  },
  marisa: {
    id: 'marisa',
    name: 'Marisa Kirisame',
    universe: 'Touhou Project',
    version: 'Ordinary Magician',
    description: 'Human magician who rivals shrine maiden through effort. Master Spark user.',
    imageUrl: getCharacterImageUrl('Marisa', 'Touhou'),
    stats: {
      strength: 58,
      speed: 82,
      durability: 64,
      stamina: 86,
      energyOutput: 94,
      techniqueProficiency: 88,
      experience: 84,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'marisa-master-spark',
        name: 'Master Spark',
        type: 'Spell Card',
        description: 'Massive laser beam of destruction.',
        powerLevel: 96,
      },
      {
        id: 'marisa-hakkero',
        name: 'Mini-Hakkero',
        type: 'Magic Item',
        description: 'Furnace that amplifies magic.',
        powerLevel: 90,
      },
      {
        id: 'marisa-stardust-reverie',
        name: 'Stardust Reverie',
        type: 'Spell Card',
        description: 'Beautiful star danmaku.',
        powerLevel: 88,
      },
      {
        id: 'marisa-ordinary-magic',
        name: 'Ordinary Magic',
        type: 'Passive',
        description: 'Human who rivals youkai through effort.',
        powerLevel: 92,
      },
    ],
  },

  // Blazblue (more)
  jin: {
    id: 'jin',
    name: 'Jin Kisaragi',
    universe: 'BlazBlue',
    version: 'Hero of Ikaruga',
    description: "Ice wielder with Yukianesa. Ragna's brother.",
    imageUrl: getCharacterImageUrl('Jin', 'BlazBlue'),
    stats: {
      strength: 78,
      speed: 84,
      durability: 76,
      stamina: 80,
      energyOutput: 88,
      techniqueProficiency: 92,
      experience: 84,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'jin-yukianesa',
        name: 'Yukianesa',
        type: 'Nox Nyctores',
        description: 'Ice sword that freezes everything.',
        powerLevel: 92,
      },
      {
        id: 'jin-frost-end',
        name: 'Frost End',
        type: 'Distortion Drive',
        description: 'Freezing slash technique.',
        powerLevel: 90,
      },
      {
        id: 'jin-ice-age',
        name: 'Rengoku Hyouya',
        type: 'Astral Heat',
        description: 'Freezes opponent in ice dimension.',
        powerLevel: 94,
      },
      {
        id: 'jin-hakumen',
        name: 'Hakumen Potential',
        type: 'Future Self',
        description: 'Can become the white void Hakumen.',
        powerLevel: 96,
      },
    ],
  },

  // Overwatch
  tracer: {
    id: 'tracer',
    name: 'Tracer',
    universe: 'Overwatch',
    version: 'Time Jumper',
    description: 'Chronal-displaced agent who can blink through time. Face of Overwatch.',
    imageUrl: getCharacterImageUrl('Tracer', 'Overwatch'),
    stats: {
      strength: 48,
      speed: 100,
      durability: 52,
      stamina: 85,
      energyOutput: 65,
      techniqueProficiency: 86,
      experience: 76,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'tracer-blink',
        name: 'Blink',
        type: 'Time Ability',
        description: 'Teleport short distances rapidly.',
        powerLevel: 94,
      },
      {
        id: 'tracer-recall',
        name: 'Recall',
        type: 'Time Ability',
        description: 'Rewind time to heal and reload.',
        powerLevel: 96,
      },
      {
        id: 'tracer-pulse-bomb',
        name: 'Pulse Bomb',
        type: 'Ultimate',
        description: 'Sticky time-bomb explosive.',
        powerLevel: 88,
      },
      {
        id: 'tracer-speed',
        name: 'Chronal Acceleration',
        type: 'Passive',
        description: 'Moves at superhuman speed.',
        powerLevel: 92,
      },
    ],
  },
  genji: {
    id: 'genji',
    name: 'Genji',
    universe: 'Overwatch',
    version: 'Cyber Ninja',
    description: 'Cybernetic ninja who found peace. Can deflect any projectile.',
    imageUrl: getCharacterImageUrl('Genji', 'Overwatch'),
    stats: {
      strength: 66,
      speed: 94,
      durability: 72,
      stamina: 82,
      energyOutput: 70,
      techniqueProficiency: 96,
      experience: 84,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'genji-deflect',
        name: 'Deflect',
        type: 'Technique',
        description: 'Reflects any projectile with sword.',
        powerLevel: 98,
      },
      {
        id: 'genji-dragonblade',
        name: 'Dragonblade',
        type: 'Ultimate',
        description: 'Empowered dragon sword.',
        powerLevel: 94,
      },
      {
        id: 'genji-swift-strike',
        name: 'Swift Strike',
        type: 'Movement Attack',
        description: 'Lightning dash that resets on kill.',
        powerLevel: 90,
      },
      {
        id: 'genji-cyber',
        name: 'Cybernetic Enhancements',
        type: 'Passive',
        description: 'Superhuman agility and reflexes.',
        powerLevel: 92,
      },
    ],
  },

  // League of Legends
  yasuo: {
    id: 'yasuo',
    name: 'Yasuo',
    universe: 'League of Legends',
    version: 'The Unforgiven',
    description: 'Wind samurai seeking redemption. Can create tornadoes and dash infinitely.',
    imageUrl: getCharacterImageUrl('Yasuo', 'League of Legends'),
    stats: {
      strength: 72,
      speed: 92,
      durability: 70,
      stamina: 84,
      energyOutput: 80,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'yasuo-windwall',
        name: 'Wind Wall',
        type: 'Wind Technique',
        description: 'Wall that blocks all projectiles.',
        powerLevel: 94,
      },
      {
        id: 'yasuo-tornado',
        name: 'Steel Tempest Tornado',
        type: 'Wind Technique',
        description: 'Launches enemies skyward.',
        powerLevel: 88,
      },
      {
        id: 'yasuo-ult',
        name: 'Last Breath',
        type: 'Ultimate',
        description: 'Teleports to airborne enemies for massive damage.',
        powerLevel: 96,
      },
      {
        id: 'yasuo-dash',
        name: 'Sweeping Blade',
        type: 'Movement',
        description: 'Infinite dashes through enemies.',
        powerLevel: 92,
      },
    ],
  },

  // Dota 2
  invoker: {
    id: 'invoker',
    name: 'Invoker',
    universe: 'Dota 2',
    version: 'Arsenal Magus',
    description: 'Ancient mage with 10 spells he can invoke. Master of Quas, Wex, and Exort.',
    imageUrl: getCharacterImageUrl('Invoker', 'Dota 2'),
    stats: {
      strength: 58,
      speed: 64,
      durability: 62,
      stamina: 88,
      energyOutput: 98,
      techniqueProficiency: 100,
      experience: 100,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'invoker-invoke',
        name: 'Invoke',
        type: 'Unique Ability',
        description: 'Access to 10 different powerful spells.',
        powerLevel: 100,
      },
      {
        id: 'invoker-cataclysm',
        name: 'Cataclysm',
        type: 'Ultimate Spell',
        description: 'Global meteor strike with scepter.',
        powerLevel: 96,
      },
      {
        id: 'invoker-sunstrike',
        name: 'Sun Strike',
        type: 'Exort Spell',
        description: 'Global precision sun beam.',
        powerLevel: 94,
      },
      {
        id: 'invoker-tornado-emp',
        name: 'Tornado + EMP Combo',
        type: 'Spell Combo',
        description: 'Devastating mana burn combo.',
        powerLevel: 92,
      },
    ],
  },

  // Starcraft
  kerrigan: {
    id: 'kerrigan',
    name: 'Sarah Kerrigan',
    universe: 'StarCraft',
    version: 'Queen of Blades',
    description:
      'Infested terran who became ruler of Zerg. One of most powerful beings in universe.',
    imageUrl: getCharacterImageUrl('Kerrigan', 'StarCraft'),
    stats: {
      strength: 88,
      speed: 90,
      durability: 92,
      stamina: 96,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 92,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'kerrigan-psi-storm',
        name: 'Psionic Storm',
        type: 'Psionic Power',
        description: 'Devastating mental storm.',
        powerLevel: 94,
      },
      {
        id: 'kerrigan-kinetic-blast',
        name: 'Kinetic Blast',
        type: 'Psionic Power',
        description: 'Massive telekinetic explosion.',
        powerLevel: 92,
      },
      {
        id: 'kerrigan-zerg-control',
        name: 'Zerg Swarm Control',
        type: 'Command',
        description: 'Controls entire Zerg swarm.',
        powerLevel: 96,
      },
      {
        id: 'kerrigan-xelnaga',
        name: "Xel'Naga Ascension",
        type: 'Ultimate Form',
        description: "Became a god-like Xel'Naga.",
        powerLevel: 98,
      },
    ],
  },

  // Diablo
  tyrael: {
    id: 'tyrael',
    name: 'Tyrael',
    universe: 'Diablo',
    version: 'Aspect of Wisdom',
    description: "Former Archangel of Justice who became mortal. Still wields El'druin.",
    imageUrl: getCharacterImageUrl('Tyrael', 'Diablo'),
    stats: {
      strength: 90,
      speed: 84,
      durability: 88,
      stamina: 92,
      energyOutput: 94,
      techniqueProficiency: 92,
      experience: 100,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'tyrael-eldruin',
        name: "El'druin",
        type: 'Legendary Sword',
        description: 'Sword of Justice that can slay demons.',
        powerLevel: 96,
      },
      {
        id: 'tyrael-judgment',
        name: 'Judgment',
        type: 'Holy Power',
        description: 'Divine holy damage from sky.',
        powerLevel: 94,
      },
      {
        id: 'tyrael-holy-power',
        name: 'Angelic Power',
        type: 'Passive',
        description: 'Immense holy energy.',
        powerLevel: 92,
      },
      {
        id: 'tyrael-wisdom',
        name: 'Aspect of Wisdom',
        type: 'Passive',
        description: 'Infinite tactical knowledge.',
        powerLevel: 98,
      },
    ],
  },

  // World of Warcraft
  arthas: {
    id: 'arthas',
    name: 'Arthas Menethil',
    universe: 'Warcraft',
    version: 'The Lich King',
    description: 'Fallen paladin who became Lich King. Commands legions of undead.',
    imageUrl: getCharacterImageUrl('Arthas', 'World of Warcraft'),
    stats: {
      strength: 92,
      speed: 80,
      durability: 96,
      stamina: 100,
      energyOutput: 94,
      techniqueProficiency: 90,
      experience: 88,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'arthas-frostmourne',
        name: 'Frostmourne',
        type: 'Cursed Blade',
        description: 'Soul-stealing runeblade.',
        powerLevel: 98,
      },
      {
        id: 'arthas-sindragosa',
        name: 'Summon Sindragosa',
        type: 'Summoning',
        description: 'Calls frost dragon queen.',
        powerLevel: 94,
      },
      {
        id: 'arthas-plague',
        name: 'Remorseless Winter',
        type: 'Frost Magic',
        description: 'Eternal blizzard of death.',
        powerLevel: 92,
      },
      {
        id: 'arthas-army',
        name: 'Scourge Army',
        type: 'Necromancy',
        description: 'Commands millions of undead.',
        powerLevel: 96,
      },
    ],
  },
  illidan: {
    id: 'illidan',
    name: 'Illidan Stormrage',
    universe: 'Warcraft',
    version: 'The Betrayer',
    description: "Demon Hunter who absorbed Skull of Gul'dan. Ten thousand years of power.",
    imageUrl: getCharacterImageUrl('Illidan', 'World of Warcraft'),
    stats: {
      strength: 90,
      speed: 92,
      durability: 88,
      stamina: 94,
      energyOutput: 96,
      techniqueProficiency: 94,
      experience: 100,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'illidan-warglaives',
        name: 'Warglaives of Azzinoth',
        type: 'Legendary Weapons',
        description: 'Twin demon blades.',
        powerLevel: 94,
      },
      {
        id: 'illidan-metamorphosis',
        name: 'Metamorphosis',
        type: 'Demon Form',
        description: 'Transform into demon.',
        powerLevel: 96,
      },
      {
        id: 'illidan-eye-beam',
        name: 'Eye Beam',
        type: 'Demonic Power',
        description: 'Fel energy beams from eyes.',
        powerLevel: 92,
      },
      {
        id: 'illidan-demon-hunter',
        name: 'Demon Hunter Master',
        type: 'Passive',
        description: '10,000 years of demon slaying.',
        powerLevel: 98,
      },
    ],
  },

  // Final Fantasy (more)
  lightning: {
    id: 'lightning',
    name: 'Lightning',
    universe: 'Final Fantasy XIII',
    version: 'Savior',
    description: "Former l'Cie who became savior of souls. Wields gunblade.",
    imageUrl: getCharacterImageUrl('Lightning', 'Final Fantasy'),
    stats: {
      strength: 82,
      speed: 88,
      durability: 80,
      stamina: 86,
      energyOutput: 84,
      techniqueProficiency: 90,
      experience: 84,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'lightning-army-one',
        name: 'Army of One',
        type: 'Limit Break',
        description: 'Devastating combo finisher.',
        powerLevel: 94,
      },
      {
        id: 'lightning-paradigm',
        name: 'Paradigm Shift',
        type: 'Class Change',
        description: 'Instantly change fighting style.',
        powerLevel: 90,
      },
      {
        id: 'lightning-savior',
        name: 'Savior Powers',
        type: 'Divine Power',
        description: 'God-granted abilities to save souls.',
        powerLevel: 92,
      },
      {
        id: 'lightning-gunblade',
        name: 'Blazefire Saber',
        type: 'Weapon',
        description: "Lightning's signature gunblade.",
        powerLevel: 88,
      },
    ],
  },
  noctis: {
    id: 'noctis',
    name: 'Noctis Lucis Caelum',
    universe: 'Final Fantasy XV',
    version: 'True King',
    description: 'Chosen King who sacrificed himself to save world. Wields Royal Arms.',
    imageUrl: getCharacterImageUrl('Noctis', 'Final Fantasy XV'),
    stats: {
      strength: 84,
      speed: 86,
      durability: 78,
      stamina: 82,
      energyOutput: 90,
      techniqueProficiency: 88,
      experience: 76,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'noctis-warp',
        name: 'Warp Strike',
        type: 'Teleportation Attack',
        description: 'Teleport to targets/weapons.',
        powerLevel: 92,
      },
      {
        id: 'noctis-armiger',
        name: 'Armiger Arsenal',
        type: 'Ultimate Form',
        description: 'Wield all 13 Royal Arms at once.',
        powerLevel: 96,
      },
      {
        id: 'noctis-summons',
        name: 'Astral Summons',
        type: 'Summoning',
        description: 'Call upon Astrals/Six.',
        powerLevel: 94,
      },
      {
        id: 'noctis-ring',
        name: 'Ring of the Lucii',
        type: 'Artifact',
        description: 'Death magic and power draining.',
        powerLevel: 90,
      },
    ],
  },

  // Doom
  'doom-slayer': {
    id: 'doom-slayer',
    name: 'Doom Slayer',
    universe: 'DOOM',
    version: 'The Unchained Predator',
    description: "Immortal demon killer blessed by Seraphim. Hell's worst nightmare.",
    imageUrl: getCharacterImageUrl('Slayer', 'DOOM'),
    stats: {
      strength: 96,
      speed: 88,
      durability: 98,
      stamina: 100,
      energyOutput: 92,
      techniqueProficiency: 94,
      experience: 100,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'slayer-bfg',
        name: 'BFG-9000',
        type: 'Weapon',
        description: 'The Big Fucking Gun. Destroys everything.',
        powerLevel: 98,
      },
      {
        id: 'slayer-crucible',
        name: 'Crucible Blade',
        type: 'Energy Sword',
        description: 'Argent energy blade that one-shots titans.',
        powerLevel: 96,
      },
      {
        id: 'slayer-glory-kill',
        name: 'Glory Kill',
        type: 'Execution Move',
        description: 'Brutal finishers that restore health.',
        powerLevel: 94,
      },
      {
        id: 'slayer-immortal',
        name: 'Unchained Predator',
        type: 'Passive',
        description: 'Cannot die, gets stronger the more he kills.',
        powerLevel: 100,
      },
    ],
  },

  // Bayonetta (more)
  jeanne: {
    id: 'jeanne',
    name: 'Jeanne',
    universe: 'Bayonetta',
    version: 'Umbra Witch',
    description: "Umbra Witch and Bayonetta's rival. Equal in power.",
    imageUrl: getCharacterImageUrl('Jeanne', 'Bayonetta'),
    stats: {
      strength: 86,
      speed: 94,
      durability: 82,
      stamina: 90,
      energyOutput: 88,
      techniqueProficiency: 96,
      experience: 94,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'jeanne-wicked-weaves',
        name: 'Wicked Weaves',
        type: 'Summon Magic',
        description: 'Summons demon limbs for attacks.',
        powerLevel: 92,
      },
      {
        id: 'jeanne-all-4-one',
        name: 'All 4 One',
        type: 'Weapon',
        description: 'Quad-wielded pistols.',
        powerLevel: 88,
      },
      {
        id: 'jeanne-witch-time',
        name: 'Witch Time',
        type: 'Time Slow',
        description: 'Slows time on perfect dodge.',
        powerLevel: 96,
      },
      {
        id: 'jeanne-seal',
        name: 'Witch Sealing',
        type: 'Magic',
        description: "Can seal other witches' powers.",
        powerLevel: 90,
      },
    ],
  },

  // Minecraft
  steve: {
    id: 'steve',
    name: 'Steve',
    universe: 'Minecraft',
    version: 'Creative Mode',
    description: 'Blocky warrior who can carry universe-breaking weight and reshape reality.',
    imageUrl: getCharacterImageUrl('Steve', 'Minecraft'),
    stats: {
      strength: 100,
      speed: 68,
      durability: 90,
      stamina: 100,
      energyOutput: 80,
      techniqueProficiency: 75,
      experience: 88,
      adaptability: 100,
    },
    abilities: [
      {
        id: 'steve-creative',
        name: 'Creative Mode',
        type: 'God Mode',
        description: 'Invincibility and infinite resources.',
        powerLevel: 100,
      },
      {
        id: 'steve-inventory',
        name: 'Infinite Inventory',
        type: 'Equipment',
        description: 'Carries billions of tons of material.',
        powerLevel: 100,
      },
      {
        id: 'steve-enchant',
        name: 'Max Enchantments',
        type: 'Power Up',
        description: 'Sharpness, Protection, etc. all maxed.',
        powerLevel: 92,
      },
      {
        id: 'steve-totem',
        name: 'Totem of Undying',
        type: 'Resurrection',
        description: 'Auto-resurrects on death (can carry stacks).',
        powerLevel: 96,
      },
    ],
  },

  // Terraria
  terrarian: {
    id: 'terrarian',
    name: 'The Terrarian',
    universe: 'Terraria',
    version: 'Post-Moon Lord',
    description: 'Adventurer who defeated Moon Lord and harvests fragments of creation.',
    imageUrl: getCharacterImageUrl('Terrarian', 'Terraria'),
    stats: {
      strength: 88,
      speed: 92,
      durability: 86,
      stamina: 94,
      energyOutput: 96,
      techniqueProficiency: 90,
      experience: 88,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'terrarian-zenith',
        name: 'Zenith',
        type: 'Ultimate Weapon',
        description: 'Sword made from all legendary swords.',
        powerLevel: 98,
      },
      {
        id: 'terrarian-solar',
        name: 'Solar Eruption',
        type: 'Weapon',
        description: 'Spear of solar power.',
        powerLevel: 94,
      },
      {
        id: 'terrarian-last-prism',
        name: 'Last Prism',
        type: 'Magic Weapon',
        description: 'Releases pure fragments of creation.',
        powerLevel: 96,
      },
      {
        id: 'terrarian-wings',
        name: 'Celestial Starboard',
        type: 'Flight',
        description: 'Infinite flight capability.',
        powerLevel: 90,
      },
    ],
  },

  // Hollow Knight (more)
  hornet: {
    id: 'hornet',
    name: 'Hornet',
    universe: 'Hollow Knight',
    version: 'Princess Protector',
    description: 'Daughter of Pale King and Herrah. Protector of Hallownest.',
    imageUrl: getCharacterImageUrl('Hornet', 'Hollow Knight'),
    stats: {
      strength: 72,
      speed: 92,
      durability: 74,
      stamina: 88,
      energyOutput: 76,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'hornet-needle',
        name: 'Needle',
        type: 'Weapon',
        description: 'Razor-sharp threaded needle.',
        powerLevel: 88,
      },
      {
        id: 'hornet-dash',
        name: 'Dash Slash',
        type: 'Attack',
        description: 'Lightning-fast aerial dash strike.',
        powerLevel: 90,
      },
      {
        id: 'hornet-spike-trap',
        name: 'Spike Trap',
        type: 'Trap',
        description: 'Sets thread traps.',
        powerLevel: 84,
      },
      {
        id: 'hornet-shaw',
        name: 'SHAW!',
        type: 'Battle Cry',
        description: 'Iconic battle shout that strikes fear.',
        powerLevel: 92,
      },
    ],
  },

  // God of War (more)
  'thor-gow': {
    id: 'thor-gow',
    name: 'Thor',
    universe: 'God of War',
    version: 'Norse God of Thunder',
    description: 'Aesir god who killed all giants. Wields Mjolnir.',
    imageUrl: getCharacterImageUrl('Thor', 'God of War'),
    stats: {
      strength: 98,
      speed: 74,
      durability: 96,
      stamina: 94,
      energyOutput: 96,
      techniqueProficiency: 88,
      experience: 98,
      adaptability: 80,
    },
    abilities: [
      {
        id: 'thor-mjolnir',
        name: 'Mjolnir',
        type: 'Legendary Weapon',
        description: 'Most powerful weapon in Norse realms.',
        powerLevel: 98,
      },
      {
        id: 'thor-lightning',
        name: 'Thunder God Power',
        type: 'Lightning Magic',
        description: 'Command lightning and thunder.',
        powerLevel: 96,
      },
      {
        id: 'thor-giant-killer',
        name: 'Giant Slayer',
        type: 'Passive',
        description: 'Killed entire giant race.',
        powerLevel: 94,
      },
      {
        id: 'thor-invulnerability',
        name: 'God Strength',
        type: 'Passive',
        description: 'Nearly indestructible.',
        powerLevel: 92,
      },
    ],
  },
  'odin-gow': {
    id: 'odin-gow',
    name: 'Odin',
    universe: 'God of War',
    version: 'Allfather',
    description: 'King of Aesir gods. Obsessed with knowledge and preventing Ragnarok.',
    imageUrl: getCharacterImageUrl('Odin', 'God of War'),
    stats: {
      strength: 90,
      speed: 82,
      durability: 92,
      stamina: 96,
      energyOutput: 98,
      techniqueProficiency: 100,
      experience: 100,
      adaptability: 98,
    },
    abilities: [
      {
        id: 'odin-magic',
        name: 'Seidr Magic',
        type: 'Norse Magic',
        description: 'Mastery of all Norse magic.',
        powerLevel: 98,
      },
      {
        id: 'odin-knowledge',
        name: 'All-Knowing',
        type: 'Passive',
        description: 'Vast knowledge from countless lifetimes.',
        powerLevel: 100,
      },
      {
        id: 'odin-gungnir',
        name: 'Gungnir',
        type: 'Legendary Spear',
        description: 'Spear that never misses.',
        powerLevel: 94,
      },
      {
        id: 'odin-ravens',
        name: 'Huginn and Muninn',
        type: 'Reconnaissance',
        description: 'All-seeing ravens.',
        powerLevel: 90,
      },
    ],
  },

  // Mortal Kombat (more)
  raiden: {
    id: 'raiden',
    name: 'Raiden',
    universe: 'Mortal Kombat',
    version: 'Thunder God',
    description: 'Eternal god of thunder and protector of Earthrealm.',
    imageUrl: getCharacterImageUrl('Raiden', 'Mortal Kombat'),
    stats: {
      strength: 86,
      speed: 84,
      durability: 90,
      stamina: 100,
      energyOutput: 94,
      techniqueProficiency: 92,
      experience: 100,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'raiden-lightning',
        name: 'Lightning Control',
        type: 'Elemental Power',
        description: 'Absolute control over lightning.',
        powerLevel: 94,
      },
      {
        id: 'raiden-teleport',
        name: 'Teleportation',
        type: 'Movement',
        description: 'Instant lightning teleport.',
        powerLevel: 90,
      },
      {
        id: 'raiden-electric-fly',
        name: 'Electric Fly',
        type: 'Attack',
        description: 'Lightning-charged flying tackle.',
        powerLevel: 88,
      },
      {
        id: 'raiden-immortal',
        name: 'Immortal God',
        type: 'Passive',
        description: 'Cannot truly die.',
        powerLevel: 100,
      },
    ],
  },
  'shao-kahn': {
    id: 'shao-kahn',
    name: 'Shao Kahn',
    universe: 'Mortal Kombat',
    version: 'Konqueror',
    description: 'Emperor of Outworld who conquered countless realms.',
    imageUrl: getCharacterImageUrl('Shao Kahn', 'Mortal Kombat'),
    stats: {
      strength: 96,
      speed: 76,
      durability: 98,
      stamina: 96,
      energyOutput: 88,
      techniqueProficiency: 90,
      experience: 100,
      adaptability: 84,
    },
    abilities: [
      {
        id: 'kahn-wrath-hammer',
        name: 'Wrath Hammer',
        type: 'Legendary Weapon',
        description: 'Massive war hammer.',
        powerLevel: 96,
      },
      {
        id: 'kahn-shoulder',
        name: 'Shoulder Charge',
        type: 'Attack',
        description: 'Devastating charging attack.',
        powerLevel: 92,
      },
      {
        id: 'kahn-taunt',
        name: 'Insulting Taunt',
        type: 'Debuff',
        description: 'You suck!',
        powerLevel: 88,
      },
      {
        id: 'kahn-emperor',
        name: 'Emperor Power',
        type: 'Passive',
        description: 'Conquered thousands of realms.',
        powerLevel: 98,
      },
    ],
  },

  // Street Fighter (more)
  ken: {
    id: 'ken',
    name: 'Ken Masters',
    universe: 'Street Fighter',
    version: 'Red Cyclone',
    description: "Ryu's best friend and rival. Master of Shoryuken.",
    imageUrl: getCharacterImageUrl('Ken', 'Street Fighter'),
    stats: {
      strength: 80,
      speed: 88,
      durability: 76,
      stamina: 82,
      energyOutput: 84,
      techniqueProficiency: 92,
      experience: 90,
      adaptability: 88,
    },
    abilities: [
      {
        id: 'ken-shoryuken',
        name: 'Shoryuken',
        type: 'Dragon Punch',
        description: 'Fiery rising uppercut.',
        powerLevel: 92,
      },
      {
        id: 'ken-hadoken',
        name: 'Hadoken',
        type: 'Ki Blast',
        description: 'Fire-enhanced ki blast.',
        powerLevel: 86,
      },
      {
        id: 'ken-shippu-jinrai',
        name: 'Shippu Jinraikyaku',
        type: 'Super Move',
        description: 'Multi-hit flaming kick barrage.',
        powerLevel: 94,
      },
      {
        id: 'ken-ansatsuken',
        name: 'Ansatsuken Master',
        type: 'Passive',
        description: 'Perfect assassination fist technique.',
        powerLevel: 90,
      },
    ],
  },
  'chun-li': {
    id: 'chun-li',
    name: 'Chun-Li',
    universe: 'Street Fighter',
    version: 'Strongest Woman',
    description: 'ICPO agent and martial arts master. Legendary leg strength.',
    imageUrl: getCharacterImageUrl('Chun-Li', 'Street Fighter'),
    stats: {
      strength: 76,
      speed: 94,
      durability: 74,
      stamina: 86,
      energyOutput: 78,
      techniqueProficiency: 94,
      experience: 88,
      adaptability: 90,
    },
    abilities: [
      {
        id: 'chunli-lightning-legs',
        name: 'Lightning Legs',
        type: 'Rapid Kicks',
        description: 'Impossibly fast kicks.',
        powerLevel: 92,
      },
      {
        id: 'chunli-kikoken',
        name: 'Kikoken',
        type: 'Ki Blast',
        description: 'Chi projectile.',
        powerLevel: 82,
      },
      {
        id: 'chunli-spinning-bird',
        name: 'Spinning Bird Kick',
        type: 'Attack',
        description: 'Helicopter kick attack.',
        powerLevel: 88,
      },
      {
        id: 'chunli-legs',
        name: 'Strongest Legs',
        type: 'Passive',
        description: 'Legendary leg strength.',
        powerLevel: 94,
      },
    ],
  },

  // Tekken (more)
  heihachi: {
    id: 'heihachi',
    name: 'Heihachi Mishima',
    universe: 'Tekken',
    version: 'King of Iron Fist',
    description: 'Ruthless Mishima patriarch. Threw son off cliff, fought at 80+.',
    imageUrl: getCharacterImageUrl('Heihachi', 'Tekken'),
    stats: {
      strength: 88,
      speed: 80,
      durability: 90,
      stamina: 92,
      energyOutput: 76,
      techniqueProficiency: 94,
      experience: 100,
      adaptability: 86,
    },
    abilities: [
      {
        id: 'heihachi-ewgf',
        name: 'Electric Wind God Fist',
        type: 'Mishima Style',
        description: 'Perfect frame EWGF.',
        powerLevel: 96,
      },
      {
        id: 'heihachi-demon-breath',
        name: 'Demon Breath',
        type: 'Special Move',
        description: 'Powerful stomp and shout.',
        powerLevel: 90,
      },
      {
        id: 'heihachi-throw',
        name: 'Ultimate Tackle',
        type: 'Throw',
        description: 'Can throw people off cliffs.',
        powerLevel: 92,
      },
      {
        id: 'heihachi-mishima',
        name: 'Mishima Karate Master',
        type: 'Passive',
        description: 'Decades of ruthless combat.',
        powerLevel: 94,
      },
    ],
  },

  // Smash Bros representations
  'captain-falcon': {
    id: 'captain-falcon',
    name: 'Captain Falcon',
    universe: 'F-Zero',
    version: 'The Falcon',
    description: 'Legendary bounty hunter and F-Zero racer. FALCON PUNCH!',
    imageUrl: getCharacterImageUrl('Captain Falcon', 'F-Zero'),
    stats: {
      strength: 82,
      speed: 96,
      durability: 78,
      stamina: 88,
      energyOutput: 86,
      techniqueProficiency: 90,
      experience: 86,
      adaptability: 92,
    },
    abilities: [
      {
        id: 'falcon-punch',
        name: 'Falcon Punch',
        type: 'Signature Move',
        description: 'The most powerful punch in gaming.',
        powerLevel: 100,
      },
      {
        id: 'falcon-kick',
        name: 'Falcon Kick',
        type: 'Attack',
        description: 'Flying flaming kick.',
        powerLevel: 90,
      },
      {
        id: 'falcon-knee',
        name: 'Knee of Justice',
        type: 'Attack',
        description: 'Devastating knee strike.',
        powerLevel: 94,
      },
      {
        id: 'falcon-speed',
        name: 'F-Zero Speed',
        type: 'Passive',
        description: 'Pilots machines at Mach 2+.',
        powerLevel: 96,
      },
    ],
  },

  // Apex Legends
  wraith: {
    id: 'wraith',
    name: 'Wraith',
    universe: 'Apex Legends',
    version: 'Interdimensional Skirmisher',
    description: 'Warrior from another dimension who can phase and create portals.',
    imageUrl: getCharacterImageUrl('Wraith', 'Apex Legends'),
    stats: {
      strength: 62,
      speed: 90,
      durability: 68,
      stamina: 82,
      energyOutput: 88,
      techniqueProficiency: 86,
      experience: 80,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'wraith-phase',
        name: 'Into the Void',
        type: 'Phase Shift',
        description: 'Become invincible in void dimension.',
        powerLevel: 96,
      },
      {
        id: 'wraith-portal',
        name: 'Dimensional Rift',
        type: 'Portal Creation',
        description: 'Create portals between dimensions.',
        powerLevel: 94,
      },
      {
        id: 'wraith-voices',
        name: 'Voices from the Void',
        type: 'Precognition',
        description: 'Warned of danger before it happens.',
        powerLevel: 90,
      },
      {
        id: 'wraith-combat',
        name: 'Elite Combat Training',
        type: 'Passive',
        description: 'Experimental soldier training.',
        powerLevel: 84,
      },
    ],
  },

  // Valorant
  jett: {
    id: 'jett',
    name: 'Jett',
    universe: 'Valorant',
    version: 'Wind Duelist',
    description: 'Korean wind controller who can dash and glide through air.',
    imageUrl: getCharacterImageUrl('Jett', 'Valorant'),
    stats: {
      strength: 58,
      speed: 98,
      durability: 60,
      stamina: 84,
      energyOutput: 76,
      techniqueProficiency: 90,
      experience: 74,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'jett-dash',
        name: 'Tailwind',
        type: 'Movement',
        description: 'Instant burst dash in any direction.',
        powerLevel: 94,
      },
      {
        id: 'jett-updraft',
        name: 'Updraft',
        type: 'Movement',
        description: 'Wind propels her upward.',
        powerLevel: 88,
      },
      {
        id: 'jett-blades',
        name: 'Blade Storm',
        type: 'Ultimate',
        description: 'Deadly throwing knives that reset on kill.',
        powerLevel: 92,
      },
      {
        id: 'jett-glide',
        name: 'Drift',
        type: 'Passive',
        description: 'Glide while airborne.',
        powerLevel: 86,
      },
    ],
  },

  // Sekiro
  sekiro: {
    id: 'sekiro',
    name: 'Sekiro',
    universe: 'Sekiro: Shadows Die Twice',
    version: 'Wolf',
    description: 'Shinobi who can resurrect. Mastered the Mortal Blade.',
    imageUrl: getCharacterImageUrl('Sekiro', 'Sekiro'),
    stats: {
      strength: 76,
      speed: 94,
      durability: 80,
      stamina: 92,
      energyOutput: 74,
      techniqueProficiency: 98,
      experience: 88,
      adaptability: 96,
    },
    abilities: [
      {
        id: 'sekiro-resurrection',
        name: 'Resurrection',
        type: 'Passive',
        description: 'Can revive after death multiple times.',
        powerLevel: 100,
      },
      {
        id: 'sekiro-mortal-blade',
        name: 'Mortal Blade',
        type: 'Weapon',
        description: 'Blade that can kill immortals.',
        powerLevel: 98,
      },
      {
        id: 'sekiro-mikiri',
        name: 'Mikiri Counter',
        type: 'Counter',
        description: 'Perfect thrust counter.',
        powerLevel: 94,
      },
      {
        id: 'sekiro-prosthetic',
        name: 'Shinobi Prosthetic',
        type: 'Equipment',
        description: 'Versatile prosthetic arm with many tools.',
        powerLevel: 90,
      },
    ],
  },

  // Ninja Gaiden
  'ryu-hayabusa': {
    id: 'ryu-hayabusa',
    name: 'Ryu Hayabusa',
    universe: 'Ninja Gaiden',
    version: 'Dragon Ninja',
    description: 'Master ninja who wields Dragon Sword. Defeated archfiends.',
    imageUrl: getCharacterImageUrl('Ryu Hayabusa', 'Ninja Gaiden'),
    stats: {
      strength: 82,
      speed: 96,
      durability: 84,
      stamina: 92,
      energyOutput: 86,
      techniqueProficiency: 98,
      experience: 92,
      adaptability: 94,
    },
    abilities: [
      {
        id: 'hayabusa-dragon-sword',
        name: 'True Dragon Sword',
        type: 'Legendary Weapon',
        description: 'Can cut through anything.',
        powerLevel: 96,
      },
      {
        id: 'hayabusa-ninpo',
        name: 'Art of the Inferno',
        type: 'Ninpo Magic',
        description: 'Devastating fire magic.',
        powerLevel: 92,
      },
      {
        id: 'hayabusa-izuna',
        name: 'Izuna Drop',
        type: 'Aerial Technique',
        description: 'Signature aerial grab and slam.',
        powerLevel: 94,
      },
      {
        id: 'hayabusa-master',
        name: 'Ninja Master',
        type: 'Passive',
        description: 'Perfect ninja technique.',
        powerLevel: 98,
      },
    ],
  },
};

// Scraper configurations for different wikis
const scraperConfigs: Record<string, any> = {
  'dragon-ball': {
    baseUrl: 'https://dragonball.fandom.com/wiki/',
    parseCharacter: parseDBZCharacter,
  },
  marvel: {
    baseUrl: 'https://marvel.fandom.com/wiki/',
    parseCharacter: parseMarvelCharacter,
  },
  dc: {
    baseUrl: 'https://dc.fandom.com/wiki/',
    parseCharacter: parseDCCharacter,
  },
  naruto: {
    baseUrl: 'https://naruto.fandom.com/wiki/',
    parseCharacter: parseNarutoCharacter,
  },
  'one-piece': {
    baseUrl: 'https://onepiece.fandom.com/wiki/',
    parseCharacter: parseOnePieceCharacter,
  },
  'my-hero-academia': {
    baseUrl: 'https://myheroacademia.fandom.com/wiki/',
    parseCharacter: parseMyHeroCharacter,
  },
  bleach: {
    baseUrl: 'https://bleach.fandom.com/wiki/',
    parseCharacter: parseBleachCharacter,
  },
  'attack-on-titan': {
    baseUrl: 'https://attackontitan.fandom.com/wiki/',
    parseCharacter: parseAOTCharacter,
  },
};

// Generic stat normalizer (converts various formats to 0-100)
function normalizeStat(value: any, max: number = 100): number {
  if (!value) return 50;

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 50;

  // Clamp between 0 and 100
  return Math.min(100, Math.max(0, Math.round((num / max) * 100)));
}

// Dragon Ball Z Scraper
async function parseDBZCharacter(name: string, html: string): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  // Extract basic info
  const description = $('p').first().text().slice(0, 200) || `${name} from Dragon Ball Z`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  // Extract stats from infobox if available
  const infoboxRows = $('table.infobox tr');
  const stats = {
    strength: 75,
    speed: 75,
    durability: 75,
    stamina: 75,
    energyOutput: 75,
    techniqueProficiency: 75,
    experience: 75,
    adaptability: 75,
  };

  // Parse infobox for any stat values (basic extraction)
  infoboxRows.each((i, row) => {
    const text = $(row).text().toLowerCase();
    if (text.includes('power') || text.includes('strength')) stats.strength = 80;
    if (text.includes('speed') || text.includes('velocity')) stats.speed = 80;
    if (text.includes('durability') || text.includes('defense')) stats.durability = 75;
  });

  return {
    name,
    universe: 'Dragon Ball Z',
    version: 'Canon',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// Marvel Scraper
async function parseMarvelCharacter(
  name: string,
  html: string
): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from Marvel Universe`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 70,
    speed: 70,
    durability: 70,
    stamina: 70,
    energyOutput: 70,
    techniqueProficiency: 70,
    experience: 70,
    adaptability: 70,
  };

  return {
    name,
    universe: 'Marvel Universe',
    version: 'Comics',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// DC Scraper
async function parseDCCharacter(name: string, html: string): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from DC Universe`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 75,
    speed: 75,
    durability: 75,
    stamina: 75,
    energyOutput: 75,
    techniqueProficiency: 75,
    experience: 75,
    adaptability: 75,
  };

  return {
    name,
    universe: 'DC Universe',
    version: 'Comics',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// Naruto Scraper
async function parseNarutoCharacter(
  name: string,
  html: string
): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from Naruto`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 75,
    speed: 75,
    durability: 75,
    stamina: 75,
    energyOutput: 75,
    techniqueProficiency: 75,
    experience: 75,
    adaptability: 75,
  };

  return {
    name,
    universe: 'Naruto',
    version: 'Shippuden Era',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// One Piece Scraper
async function parseOnePieceCharacter(
  name: string,
  html: string
): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from One Piece`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 75,
    speed: 75,
    durability: 75,
    stamina: 75,
    energyOutput: 75,
    techniqueProficiency: 75,
    experience: 75,
    adaptability: 75,
  };

  return {
    name,
    universe: 'One Piece',
    version: 'Yonko Era',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// My Hero Academia Scraper
async function parseMyHeroCharacter(
  name: string,
  html: string
): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from My Hero Academia`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 70,
    speed: 70,
    durability: 70,
    stamina: 70,
    energyOutput: 75,
    techniqueProficiency: 75,
    experience: 65,
    adaptability: 75,
  };

  return {
    name,
    universe: 'My Hero Academia',
    version: 'Pro Hero Era',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// Bleach Scraper
async function parseBleachCharacter(
  name: string,
  html: string
): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from Bleach`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 75,
    speed: 80,
    durability: 75,
    stamina: 75,
    energyOutput: 85,
    techniqueProficiency: 80,
    experience: 75,
    adaptability: 75,
  };

  return {
    name,
    universe: 'Bleach',
    version: 'Soul Society Arc',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// Attack on Titan Scraper
async function parseAOTCharacter(name: string, html: string): Promise<Partial<ScrapedCharacter>> {
  const $ = cheerio.load(html);

  const description = $('p').first().text().slice(0, 200) || `${name} from Attack on Titan`;
  const imageUrl = $('img.pi-image-thumbnail').first().attr('src') || '/images/placeholder.jpg';

  const stats = {
    strength: 70,
    speed: 75,
    durability: 70,
    stamina: 75,
    energyOutput: 65,
    techniqueProficiency: 80,
    experience: 70,
    adaptability: 75,
  };

  return {
    name,
    universe: 'Attack on Titan',
    version: 'Survey Corps Era',
    description,
    imageUrl,
    stats,
    abilities: extractAbilities($, name),
  };
}

// Extract abilities from page
function extractAbilities(
  $: any,
  characterName: string
): Array<{
  id: string;
  name: string;
  type: string;
  description: string;
  powerLevel: number;
}> {
  const abilities: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    powerLevel: number;
  }> = [];
  const sections = $('h3, h2').toArray();
  let abilitiesSection = false;

  for (let i = 0; i < Math.min(sections.length, 10); i++) {
    const heading = $(sections[i]).text().toLowerCase();

    if (heading.includes('ability') || heading.includes('power') || heading.includes('technique')) {
      abilitiesSection = true;
      const nextContent = $(sections[i]).nextUntil('h2, h3');

      nextContent.find('li, dd').each((idx: number, el: any) => {
        const abilityText = $(el).text();
        if (abilityText.length > 3 && abilities.length < 4) {
          abilities.push({
            id: `${characterName}-ability-${idx}`.toLowerCase().replace(/\s+/g, '-'),
            name: abilityText.split('-')[0]?.trim() || `Ability ${idx + 1}`,
            type: 'Special Move',
            description: abilityText.slice(0, 100),
            powerLevel: 75,
          });
        }
      });
      break;
    }
  }

  return abilities.length > 0 ? abilities : getDefaultAbilities(characterName);
}

// Default abilities if scraping fails
function getDefaultAbilities(characterName: string): Array<{
  id: string;
  name: string;
  type: string;
  description: string;
  powerLevel: number;
}> {
  return [
    {
      id: `${characterName}-default-1`.toLowerCase().replace(/\s+/g, '-'),
      name: `${characterName}'s Signature Move`,
      type: 'Special Attack',
      description: `Signature technique of ${characterName}`,
      powerLevel: 75,
    },
  ];
}

// Main scraper function
export async function scrapeCharacter(
  characterName: string,
  universe: string = 'dragon-ball'
): Promise<ScrapedCharacter> {
  const cacheKey = `${characterName}-${universe}`.toLowerCase();

  // Check cache first
  if (characterCache.has(cacheKey)) {
    console.log(`[Cache Hit] ${characterName}`);
    return characterCache.get(cacheKey)!;
  }

  // Search local character database first using optimized index
  const searchTerm = characterName.toLowerCase().trim();
  console.log(`Searching for character: "${searchTerm}"`);

  // Use search index for O(1) lookup instead of O(n) iteration
  const characterKey = characterSearchIndex.get(searchTerm);
  if (characterKey && characterDatabase[characterKey]) {
    console.log(
      `[Database Match] Found indexed match for "${searchTerm}" => ${characterDatabase[characterKey].name}`
    );
    const character = characterDatabase[characterKey];
    characterCache.set(cacheKey, character);
    return character;
  }

  // Fallback: Try partial match for multi-word searches (e.g., "iron man")
  const searchTermNoSpaces = searchTerm.replace(/[\s\-]+/g, '');
  const partialMatch = characterSearchIndex.get(searchTermNoSpaces);
  if (partialMatch && characterDatabase[partialMatch]) {
    console.log(
      `[Database Match] Found partial match for "${searchTerm}" => ${characterDatabase[partialMatch].name}`
    );
    const character = characterDatabase[partialMatch];
    characterCache.set(cacheKey, character);
    return character;
  }

  console.log(`[No Database Match] "${searchTerm}" not in local database, trying web scraping...`);

  // If not found in local database, try scraping from wikis
  try {
    // List of universes/wikis to try in order
    const universesToTry = [
      'marvel', // Try Marvel first (Spider-Man, Iron Man, etc.)
      'dc', // DC Comics (Flash, Green Lantern, etc.)
      'naruto', // Naruto universe (Rock Lee, Kakashi, etc.)
      'one-piece', // One Piece (Zoro, Sanji, etc.)
      'dragon-ball', // Dragon Ball (Piccolo, Gohan, etc.)
      'my-hero-academia', // My Hero Academia (Deku, Bakugo, etc.)
      'bleach', // Bleach (Byakuya, Renji, etc.)
      'attack-on-titan', // Attack on Titan (Mikasa, Armin, etc.)
    ];

    for (const uni of universesToTry) {
      try {
        const config = scraperConfigs[uni];
        if (!config) continue;

        console.log(`[Web Scraping] Trying ${characterName} from ${uni}...`);

        // Format character name for URL (capitalize first letter of each word)
        const formattedName = characterName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('_');

        const url = `${config.baseUrl}${encodeURIComponent(formattedName)}`;
        const response = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            DNT: '1',
            Connection: 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0',
          },
          timeout: 5000,
          validateStatus: status => status === 200,
        });

        // Check if page exists and has content
        if (response.data && response.data.length > 500) {
          const parsedData = await config.parseCharacter(formattedName, response.data);

          const character: ScrapedCharacter = {
            id: `${characterName}-${uni}`.toLowerCase().replace(/\s+/g, '-'),
            name: formattedName.replace(/_/g, ' '),
            universe: parsedData.universe || uni,
            version: parsedData.version || 'Unknown',
            description: parsedData.description || `${formattedName} from ${uni}`,
            imageUrl: parsedData.imageUrl || '/images/placeholder.jpg',
            stats: {
              strength: 70,
              speed: 70,
              durability: 70,
              stamina: 70,
              energyOutput: 70,
              techniqueProficiency: 70,
              experience: 70,
              adaptability: 70,
              ...parsedData.stats,
            },
            abilities: parsedData.abilities || getDefaultAbilities(formattedName),
          };

          console.log(`[Web Scraping Success] Found ${formattedName} in ${uni}!`);

          // Cache the scraped result for 1 hour
          characterCache.set(cacheKey, character);
          setTimeout(() => characterCache.delete(cacheKey), 3600000);

          return character;
        }
      } catch (error: any) {
        // Continue to next universe if this one fails
        if (error.response?.status === 404) {
          console.log(`[404] ${characterName} not found in ${uni}`);
        } else {
          console.log(`[Error] Failed to scrape ${characterName} from ${uni}: ${error.message}`);
        }
        continue;
      }
    }

    // If all scraping attempts failed, return default character
    console.log(`[Fallback] Could not scrape ${characterName} from any wiki, generating default`);
    return createDefaultCharacter(characterName, universe);
  } catch (error) {
    console.error(`[Error] Scraping failed for ${characterName}:`, error);
    return createDefaultCharacter(characterName, universe);
  }
}

function createDefaultCharacter(characterName: string, universe: string): ScrapedCharacter {
  // Generate varied stats instead of all 70s
  const hash = characterName
    .toLowerCase()
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (char: number) => ((hash * char * 9301 + 49297) % 233280) / 233280;

  // Create a realistic stat distribution based on character name
  const baseVariance = 15; // Range of ±15 around base
  const stats = {
    strength: Math.max(40, Math.min(100, 70 + (seed(1) * baseVariance * 2 - baseVariance))),
    speed: Math.max(40, Math.min(100, 70 + (seed(2) * baseVariance * 2 - baseVariance))),
    durability: Math.max(40, Math.min(100, 70 + (seed(3) * baseVariance * 2 - baseVariance))),
    stamina: Math.max(40, Math.min(100, 70 + (seed(4) * baseVariance * 2 - baseVariance))),
    energyOutput: Math.max(40, Math.min(100, 70 + (seed(5) * baseVariance * 2 - baseVariance))),
    techniqueProficiency: Math.max(
      40,
      Math.min(100, 70 + (seed(6) * baseVariance * 2 - baseVariance))
    ),
    experience: Math.max(40, Math.min(100, 70 + (seed(7) * baseVariance * 2 - baseVariance))),
    adaptability: Math.max(40, Math.min(100, 70 + (seed(8) * baseVariance * 2 - baseVariance))),
  };

  return {
    id: `${characterName}-${universe}`.toLowerCase().replace(/\s+/g, '-'),
    name: characterName,
    universe,
    version: 'Unknown',
    description: `${characterName}. Character profile generated from available sources.`,
    imageUrl: '/images/placeholder.jpg',
    stats,
    abilities: getDefaultAbilities(characterName),
  };
}

// Batch scrape multiple characters
export async function scrapeMultipleCharacters(
  characters: Array<{ name: string; universe?: string }>
): Promise<ScrapedCharacter[]> {
  const results = await Promise.all(
    characters.map(char => scrapeCharacter(char.name, char.universe || 'dragon-ball'))
  );
  return results;
}

// Get popular characters
export async function getPopularCharacters(): Promise<ScrapedCharacter[]> {
  // Return popular characters from database
  const popularKeys = [
    'goku',
    'superman',
    'saitama',
    'naruto',
    'luffy',
    'ichigo',
    'batman',
    'eren',
  ];
  return popularKeys.map(key => {
    const character = characterDatabase[key];
    if (!character) {
      return {
        id: key,
        name: 'Unknown Character',
        universe: 'Unknown',
        version: 'Unknown',
        description: 'Character details not available',
        imageUrl: '/images/placeholder.jpg',
        stats: {
          strength: 70,
          speed: 70,
          durability: 70,
          stamina: 70,
          energyOutput: 70,
          techniqueProficiency: 70,
          experience: 70,
          adaptability: 70,
        },
        abilities: [],
      };
    }
    // Cache the character
    const cacheKey = character.id.toLowerCase();
    characterCache.set(cacheKey, character);
    return character;
  });
}

// Clear cache
export function clearCache(): void {
  characterCache.clear();
  console.log('[Cache] Cleared all cached characters');
}

// Initialize search index on module load
buildSearchIndex();
