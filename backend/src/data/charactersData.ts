export interface Character {
  id: string;
  name: string;
  universe: string;
  version: string;
  description: string;
  imageUrl: string;
}

export interface CombatStats {
  strength: number;        // 0-100 normalized scale
  speed: number;           // 0-100 normalized scale
  durability: number;      // 0-100 normalized scale
  stamina: number;         // 0-100 normalized scale
  energyOutput: number;    // 0-100 normalized scale
  techniqueProficiency: number; // 0-100
  experience: number;      // 0-100
  adaptability: number;    // 0-100
}

export interface Ability {
  id: string;
  name: string;
  type: string;
  description: string;
  powerLevel: number;      // 0-100
}

export interface CharacterData {
  character: Character;
  stats: CombatStats;
  abilities: Ability[];
  feats: string[];
  antiFeats: string[];
  weaknesses: string[];
}

export const GOKU_DATA: CharacterData = {
  character: {
    id: 'goku-namek-saga',
    name: 'Goku',
    universe: 'Dragon Ball Z',
    version: 'Namek Saga Era',
    description: 'The main protagonist of Dragon Ball. At this point, he has trained hard and mastered Super Saiyan form.',
    imageUrl: '/images/goku.jpg'
  },
  stats: {
    strength: 85,
    speed: 85,
    durability: 80,
    stamina: 75,
    energyOutput: 85,
    techniqueProficiency: 85,
    experience: 75,
    adaptability: 90
  },
  abilities: [
    {
      id: 'goku-kamehameha',
      name: 'Kamehameha',
      type: 'Energy Beam',
      description: 'Goku\'s signature ki attack. Massive destructive power.',
      powerLevel: 85
    },
    {
      id: 'goku-instant-transmission',
      name: 'Instant Transmission',
      type: 'Movement',
      description: 'Teleportation technique learned from the Yardrats.',
      powerLevel: 80
    },
    {
      id: 'goku-ssj',
      name: 'Super Saiyan',
      type: 'Transformation',
      description: 'Legendary transformation that multiplies power.',
      powerLevel: 90
    },
    {
      id: 'goku-spirit-bomb',
      name: 'Spirit Bomb',
      type: 'Energy Attack',
      description: 'Gathers energy from all living things.',
      powerLevel: 75
    }
  ],
  feats: [
    'Defeated Frieza',
    'Mastered Super Saiyan form',
    'Trained on Yadrat',
    'Survived Namek\'s explosion',
    'Learned Instant Transmission'
  ],
  antiFeats: [
    'Vulnerable to poison',
    'Heart condition',
    'Combat starts slow, powers up mid-fight',
    'Sometimes too honorable in fight'
  ],
  weaknesses: [
    'Heart disease (late Namek saga)',
    'Toxins/poison',
    'Overconfidence',
    'Psychological pressure'
  ]
};

export const CHARACTERS_DATABASE: CharacterData[] = [
  GOKU_DATA,
  {
    character: {
      id: 'superman-dcu',
      name: 'Superman',
      universe: 'DC Universe',
      version: 'Post-Crisis Era',
      description: 'The Man of Steel. Kryptonian with vast superpowers derived from Earth\'s yellow sun.',
      imageUrl: '/images/superman.jpg'
    },
    stats: {
      strength: 95,
      speed: 80,
      durability: 95,
      stamina: 85,
      energyOutput: 85,
      techniqueProficiency: 65,
      experience: 70,
      adaptability: 75
    },
    abilities: [
      {
        id: 'superman-heat-vision',
        name: 'Heat Vision',
        type: 'Energy Beam',
        description: 'Concentrated heat projected from eyes.',
        powerLevel: 80
      },
      {
        id: 'superman-flight',
        name: 'Flight',
        type: 'Movement',
        description: 'Can fly at incredible speeds.',
        powerLevel: 85
      },
      {
        id: 'superman-invulnerability',
        name: 'Invulnerability',
        type: 'Defense',
        description: 'Nearly impervious to harm.',
        powerLevel: 95
      }
    ],
    feats: [
      'Moved planets',
      'Survived nuclear explosions',
      'Faster than light travel',
      'Infinite durability feats'
    ],
    antiFeats: [
      'Depowered by magic indirectly',
      'Vulnerable to Kryptonite',
      'Can be overwhelmed by magic'
    ],
    weaknesses: [
      'Kryptonite',
      'Magic',
      'Red sun radiation',
      'Psychological trauma'
    ]
  },
  {
    character: {
      id: 'saitama-opm',
      name: 'Saitama',
      universe: 'One Punch Man',
      version: 'Post-Tournament Arc',
      description: 'The One Punch Man. Bald hero who achieved ultimate strength through training.',
      imageUrl: '/images/saitama.jpg'
    },
    stats: {
      strength: 100,
      speed: 90,
      durability: 95,
      stamina: 85,
      energyOutput: 80,
      techniqueProficiency: 50,
      experience: 40,
      adaptability: 85
    },
    abilities: [
      {
        id: 'saitama-serious-punch',
        name: 'Serious Punch',
        type: 'Physical Attack',
        description: 'Uses minimal effort to match opponent.',
        powerLevel: 100
      },
      {
        id: 'saitama-speed',
        name: 'Monstrous Speed',
        type: 'Movement',
        description: 'Can move at incomprehensible speeds.',
        powerLevel: 90
      }
    ],
    feats: [
      'One-shot numerous monsters',
      'Casual relativistic speeds',
      'Survived planetary attacks',
      'Unlimited growth potential'
    ],
    antiFeats: [
      'Limited combat experience',
      'Weak technique',
      'Bored in fights',
      'Holds back power'
    ],
    weaknesses: [
      'Boredom/loss of motivation',
      'No special abilities/hax',
      'Overconfidence',
      'Will intentionally lose'
    ]
  },
  {
    character: {
      id: 'naruto-final',
      name: 'Naruto Uzumaki',
      universe: 'Naruto Shippuden',
      version: 'Final Arc - Kurama Form',
      description: 'The Seventh Hokage. Ninja with Nine-Tailed Fox chakra.',
      imageUrl: '/images/naruto.jpg'
    },
    stats: {
      strength: 75,
      speed: 80,
      durability: 85,
      stamina: 95,
      energyOutput: 90,
      techniqueProficiency: 80,
      experience: 85,
      adaptability: 88
    },
    abilities: [
      {
        id: 'naruto-kurama-mode',
        name: 'Kurama Mode',
        type: 'Transformation',
        description: 'Perfect control of Nine-Tailed Fox chakra.',
        powerLevel: 85
      },
      {
        id: 'naruto-rasenshuriken',
        name: 'Rasenshuriken',
        type: 'Energy Attack',
        description: 'Spinning vortex of chakra with cutting wind.',
        powerLevel: 80
      },
      {
        id: 'naruto-shadow-clones',
        name: 'Shadow Clone Jutsu',
        type: 'Technique',
        description: 'Creates tangible clones.',
        powerLevel: 60
      }
    ],
    feats: [
      'Defeated Sasuke',
      'Allied with Kurama',
      'Stopped Moon falling',
      'Fought Kaguya'
    ],
    antiFeats: [
      'Relies on chakra reserves',
      'Limited in vacuum',
      'Technical abilities create openings'
    ],
    weaknesses: [
      'Chakra exhaustion',
      'Lacks reality warping',
      'Time manipulation',
      'Info limitations'
    ]
  },
  {
    character: {
      id: 'luffy-yonko',
      name: 'Monkey D. Luffy',
      universe: 'One Piece',
      version: 'Emperor Level - Gear 5',
      description: 'Captain of the Straw Hat Pirates. Ate Human-Human Fruit.',
      imageUrl: '/images/luffy.jpg'
    },
    stats: {
      strength: 85,
      speed: 85,
      durability: 80,
      stamina: 90,
      energyOutput: 85,
      techniqueProficiency: 75,
      experience: 80,
      adaptability: 92
    },
    abilities: [
      {
        id: 'luffy-gear-5',
        name: 'Gear 5 - Nika Form',
        type: 'Transformation',
        description: 'God-like transformation with reality-warping properties.',
        powerLevel: 90
      },
      {
        id: 'luffy-kong-gun',
        name: 'Kong Gun',
        type: 'Attack',
        description: 'Combines Haki and Gear 4 power.',
        powerLevel: 85
      },
      {
        id: 'luffy-conquerors-haki',
        name: 'Conqueror\'s Haki',
        type: 'Energy',
        description: 'Overpowers willpower of others.',
        powerLevel: 85
      }
    ],
    feats: [
      'Defeated Kaido',
      'Reached Emperor status',
      'Unlocked Gear 5 transformation',
      'Countless major victories'
    ],
    antiFeats: [
      'Water weakness (Devil Fruit user)',
      'Gear transformations have time limits',
      'Limited range attacks'
    ],
    weaknesses: [
      'Water',
      'Sea Stone',
      'Chakram/precise piercing weapons',
      'Distance fighters'
    ]
  }
];
