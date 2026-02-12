export interface ComparisonResult {
  character1Name: string;
  character2Name: string;
  verdict: string;
  confidenceLevel: number;
  winPercentage: number;
  keyFactors: {
    advantages: Array<{ factor: string; character: string; score: number }>;
    disadvantages: Array<{ factor: string; character: string; score: number }>;
  };
  statBreakdown: {
    strength: { char1Score: number; char2Score: number; winner: string };
    speed: { char1Score: number; char2Score: number; winner: string };
    durability: { char1Score: number; char2Score: number; winner: string };
    stamina: { char1Score: number; char2Score: number; winner: string };
    energyOutput: { char1Score: number; char2Score: number; winner: string };
    technique: { char1Score: number; char2Score: number; winner: string };
    experience: { char1Score: number; char2Score: number; winner: string };
    adaptability: { char1Score: number; char2Score: number; winner: string };
  };
  scenarios: {
    randomEncounter: { winner: string; confidence: number; reasoning: string };
    bloodlusted: { winner: string; confidence: number; reasoning: string };
    withPrepTime: { winner: string; confidence: number; reasoning: string };
    inCharacter: { winner: string; confidence: number; reasoning: string };
  };
  analysis: string;
}

export function analyzeMatchup(
  char1Name: string,
  char1Stats: any,
  char1Abilities: any[],
  char2Name: string,
  char2Stats: any,
  char2Abilities: any[]
): ComparisonResult {
  // Calculate overall stat scores
  const char1OverallStats = calculateOverallStats(char1Stats);
  const char2OverallStats = calculateOverallStats(char2Stats);

  // Calculate stat-by-stat comparison
  const statBreakdown = analyzeStatComparison(char1Stats, char2Stats);

  // Calculate key factors
  const keyFactors = identifyKeyFactors(char1Stats, char2Stats, char1Abilities, char2Abilities);

  // Analyze different scenarios
  const scenarios = analyzeScenarios(char1Name, char2Name, char1Stats, char2Stats, char1Abilities, char2Abilities);

  // Calculate overall verdict
  const { verdict, winPercentage, confidenceLevel } = calculateVerdict(
    char1Name,
    char1OverallStats,
    char1Abilities,
    char2Name,
    char2OverallStats,
    char2Abilities
  );

  // Generate detailed analysis
  const analysis = generateAnalysis(char1Name, char2Name, statBreakdown, keyFactors, scenarios);

  return {
    character1Name: char1Name,
    character2Name: char2Name,
    verdict,
    confidenceLevel,
    winPercentage,
    keyFactors,
    statBreakdown,
    scenarios,
    analysis
  };
}

function calculateOverallStats(stats: any): number {
  return (
    stats.strength +
    stats.speed +
    stats.durability +
    stats.stamina +
    stats.energyOutput +
    stats.techniqueProficiency +
    stats.experience +
    stats.adaptability
  ) / 8;
}

function analyzeStatComparison(stats1: any, stats2: any) {
  const statKeys = [
    'strength',
    'speed',
    'durability',
    'stamina',
    'energyOutput',
    'technique',
    'experience',
    'adaptability'
  ];

  const breakdown: any = {};

  for (const key of statKeys) {
    const displayKey = key === 'techniqueProficiency' || key === 'technique' ? 'technique' : key;
    const stat1Value = stats1[key === 'technique' ? 'techniqueProficiency' : key];
    const stat2Value = stats2[key === 'technique' ? 'techniqueProficiency' : key];

    breakdown[displayKey] = {
      char1Score: stat1Value,
      char2Score: stat2Value,
      winner: stat1Value > stat2Value ? 'character1' : stat1Value < stat2Value ? 'character2' : 'tie'
    };
  }

  return breakdown;
}

function identifyKeyFactors(stats1: any, stats2: any, abilities1: any[], abilities2: any[]) {
  const differences: Array<{ stat: string; value: number }> = [];

  const statNames = ['strength', 'speed', 'durability', 'stamina', 'energyOutput', 'techniqueProficiency', 'experience', 'adaptability'];

  for (const stat of statNames) {
    const diff = Math.abs(stats1[stat] - stats2[stat]);
    if (diff > 5) {
      differences.push({ stat, value: diff });
    }
  }

  // Sort by largest differences
  differences.sort((a, b) => b.value - a.value);

  const advantages: any[] = [];
  const disadvantages: any[] = [];

  for (const diff of differences.slice(0, 3)) {
    const char1Val = stats1[diff.stat];
    const char2Val = stats2[diff.stat];

    if (char1Val > char2Val) {
      advantages.push({ factor: diff.stat, character: 'character1', score: char1Val });
      disadvantages.push({ factor: diff.stat, character: 'character2', score: char2Val });
    } else {
      advantages.push({ factor: diff.stat, character: 'character2', score: char2Val });
      disadvantages.push({ factor: diff.stat, character: 'character1', score: char1Val });
    }
  }

  return { advantages, disadvantages };
}

function analyzeScenarios(
  char1Name: string,
  char2Name: string,
  stats1: any,
  stats2: any,
  abilities1: any[],
  abilities2: any[]
) {
  const speedDiff = stats1.speed - stats2.speed;
  const strengthDiff = stats1.strength - stats2.strength;
  const adaptDiff = stats1.adaptability - stats2.adaptability;

  // Random Encounter
  const randomWinner = getWinnerByOverall(stats1, stats2) === 1 ? 'character1' : 'character2';
  const randomConfidence = calculateConfidence(stats1, stats2);

  // Bloodlusted (no morals, full power)
  const bloodlustedWinner = getWinnerByPower(stats1, stats2) === 1 ? 'character1' : 'character2';
  const bloodlustedConfidence = Math.min(1, randomConfidence + 0.15);

  // With Prep Time (character can prepare strategies)
  const prepWinner = stats2.adaptability > stats1.adaptability ? 'character2' : 'character1';
  const prepConfidence = 0.65 + Math.abs(adaptDiff) / 100;

  // In-Character (follows their personality)
  const inCharWinner = getWinnerByOverall(stats1, stats2) === 1 ? 'character1' : 'character2';
  const inCharConfidence = randomConfidence - 0.1;

  return {
    randomEncounter: {
      winner: randomWinner,
      confidence: randomConfidence,
      reasoning: `Based on overall combat capabilities and stat distribution. ${randomWinner === 'character1' ? char1Name : char2Name} has the edge in power and versatility.`
    },
    bloodlusted: {
      winner: bloodlustedWinner,
      confidence: bloodlustedConfidence,
      reasoning: `Fighting without restraint maximizes offensive power. ${bloodlustedWinner === 'character1' ? char1Name : char2Name}'s power output and combat stats give the advantage.`
    },
    withPrepTime: {
      winner: prepWinner,
      confidence: prepConfidence,
      reasoning: `Preparation allows for strategy development. ${prepWinner === 'character1' ? char1Name : char2Name}'s adaptability and intelligence enable better preparation.`
    },
    inCharacter: {
      winner: inCharWinner,
      confidence: inCharConfidence,
      reasoning: `Fighting in-character may introduce hesitation or tactical caution. Winners are determined by typical behavioral patterns.`
    }
  };
}

function getWinnerByOverall(stats1: any, stats2: any): number {
  const score1 = calculateOverallStats(stats1);
  const score2 = calculateOverallStats(stats2);
  return score1 > score2 ? 1 : score1 < score2 ? 2 : 0;
}

function getWinnerByPower(stats1: any, stats2: any): number {
  const power1 = (stats1.strength + stats1.energyOutput + stats1.speed) / 3;
  const power2 = (stats2.strength + stats2.energyOutput + stats2.speed) / 3;
  return power1 > power2 ? 1 : power1 < power2 ? 2 : 0;
}

function calculateConfidence(stats1: any, stats2: any): number {
  const diff = Math.abs(calculateOverallStats(stats1) - calculateOverallStats(stats2));
  return Math.min(0.95, 0.5 + diff / 100);
}

function calculateVerdict(
  char1Name: string,
  char1Overall: number,
  abilities1: any[],
  char2Name: string,
  char2Overall: number,
  abilities2: any[]
): { verdict: string; winPercentage: number; confidenceLevel: number } {
  const diff = Math.abs(char1Overall - char2Overall);
  const confidence = calculateConfidence({ strength: char1Overall, speed: char1Overall, durability: char1Overall, stamina: char1Overall, energyOutput: char1Overall, techniqueProficiency: char1Overall, experience: char1Overall, adaptability: char1Overall }, { strength: char2Overall, speed: char2Overall, durability: char2Overall, stamina: char2Overall, energyOutput: char2Overall, techniqueProficiency: char2Overall, experience: char2Overall, adaptability: char2Overall });

  const winner = char1Overall > char2Overall ? char1Name : char2Name;
  const loser = char1Overall > char2Overall ? char2Name : char1Name;
  let verdict: string;
  let winPercentage: number;

  if (diff > 15) {
    verdict = `${winner} wins decisively`;
    winPercentage = winner === char1Name ? 85 : 15;
  } else if (diff > 10) {
    verdict = `${winner} has a significant advantage`;
    winPercentage = winner === char1Name ? 70 : 30;
  } else if (diff > 5) {
    verdict = `${winner} has the edge`;
    winPercentage = winner === char1Name ? 60 : 40;
  } else if (diff > 2) {
    verdict = `Slight advantage to ${winner}`;
    winPercentage = winner === char1Name ? 55 : 45;
  } else {
    verdict = `${char1Name} vs ${char2Name}: Evenly matched`;
    winPercentage = 50;
  }

  return {
    verdict,
    winPercentage,
    confidenceLevel: Math.round(confidence * 100)
  };
}

function generateAnalysis(
  char1Name: string,
  char2Name: string,
  statBreakdown: any,
  keyFactors: any,
  scenarios: any
): string {
  let analysis = `## Detailed Analysis\n\n`;

  analysis += `### Overview\n`;
  analysis += `This matchup between ${char1Name} and ${char2Name} presents an interesting dynamic combat scenario. `;
  analysis += `Both combatants have unique strengths that would heavily influence the outcome.\n\n`;

  analysis += `### Stat Dominance\n`;
  const winCount1 = Object.values(statBreakdown)
    .filter((stat: any) => stat.winner === 'character1')
    .length;
  const winCount2 = Object.values(statBreakdown)
    .filter((stat: any) => stat.winner === 'character2')
    .length;

  analysis += `${char1Name} dominates in ${winCount1} stat categories, while ${char2Name} leads in ${winCount2}. `;
  if (winCount1 > winCount2) {
    analysis += `This gives ${char1Name} a broader combat advantage.\n\n`;
  } else if (winCount2 > winCount1) {
    analysis += `This gives ${char2Name} a broader combat advantage.\n\n`;
  } else {
    analysis += `This creates a balanced matchup.\n\n`;
  }

  analysis += `### Critical Factors\n`;
  keyFactors.advantages.slice(0, 2).forEach((factor: any) => {
    const charName = factor.character === 'character1' ? char1Name : char2Name;
    analysis += `- **${charName}**: Superior ${factor.factor} (${Math.round(factor.score)}) gives decisive edge in direct combat.\n`;
  });

  analysis += `\n### Scenario Analysis\n`;
  analysis += `Different scenarios significantly alter the outcome. Random encounters favor whichever character has more raw power, `;
  analysis += `while scenarios with prep time allow for strategic adaptation and tactical planning.\n`;

  return analysis;
}
