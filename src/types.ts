export type Difficulty = 'Recruit' | 'Soldier' | 'General';
export type GameMode = 'SOLO' | 'VERSUS' | 'MENU';
export type Rank = 'Recruit' | 'Private' | 'Sergeant' | 'Lieutenant' | 'Major' | 'General' | 'Word Warlord';

export interface WordData {
  word: string;
  hint: string;
  blanks: number[]; // Indices of missing letters
}

export interface PlayerState {
  health: number;
  xp: number;
  rank: Rank;
  currentInput: string;
}

export const RANKS: Rank[] = [
  'Recruit',
  'Private',
  'Sergeant',
  'Lieutenant',
  'Major',
  'General',
  'Word Warlord'
];

export const getRank = (wordsSolved: number): Rank => {
  if (wordsSolved >= 5001) return 'Word Warlord';
  if (wordsSolved >= 2501) return 'General';
  if (wordsSolved >= 1001) return 'Major';
  if (wordsSolved >= 501) return 'Lieutenant';
  if (wordsSolved >= 151) return 'Sergeant';
  if (wordsSolved >= 51) return 'Private';
  return 'Recruit';
};

export const getNextRankInfo = (wordsSolved: number): { nextRank: Rank | null, required: number } => {
  if (wordsSolved < 51) return { nextRank: 'Private', required: 51 };
  if (wordsSolved < 151) return { nextRank: 'Sergeant', required: 151 };
  if (wordsSolved < 501) return { nextRank: 'Lieutenant', required: 501 };
  if (wordsSolved < 1001) return { nextRank: 'Major', required: 1001 };
  if (wordsSolved < 2501) return { nextRank: 'General', required: 2501 };
  if (wordsSolved < 5001) return { nextRank: 'Word Warlord', required: 5001 };
  return { nextRank: null, required: 0 };
};

export type AchievementId = 'FLASH_STRIKE' | 'IRON_DEFENSE' | 'ON_A_ROLL' | 'CLOSE_CALL' | 'THE_SCHOLAR' | 'BOT_BUSTER';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'FLASH_STRIKE', title: 'Flash Strike', description: 'Solve a 5-letter word in under 1 second.', icon: '⚡' },
  { id: 'IRON_DEFENSE', title: 'Iron Defense', description: 'Win a match without missing a single letter.', icon: '🛡️' },
  { id: 'ON_A_ROLL', title: 'On a Roll', description: 'Get 10 words correct in a row against the "Hard" Bot.', icon: '🔥' },
  { id: 'CLOSE_CALL', title: 'Close Call', description: 'Win a match while your Health Bar is at 5% or less.', icon: '🚑' },
  { id: 'THE_SCHOLAR', title: 'The Scholar', description: 'Play all levels in a single session.', icon: '🎓' },
  { id: 'BOT_BUSTER', title: 'Bot Buster', description: 'Defeat the "General" (Hard Bot) for the first time.', icon: '🤖' }
];

export const BOT_SPEEDS: Record<Difficulty, number> = {
  Recruit: 5000, // 5.0 seconds
  Soldier: 3000, // 3.0 seconds
  General: 1500  // 1.5 seconds
};
