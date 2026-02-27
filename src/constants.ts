import { WordData } from './types';

export const WORD_LIST: Record<number, WordData[]> = {
  1: [
    { word: 'BAT', hint: 'A flying mammal', blanks: [0] },
    { word: 'CAT', hint: 'A small pet that meows', blanks: [1] },
    { word: 'DOG', hint: "Man's best friend", blanks: [1, 2] },
    { word: 'SUN', hint: 'The star in the sky', blanks: [1] },
    { word: 'BOX', hint: 'A square container', blanks: [1] },
    { word: 'ICE', hint: 'Frozen water', blanks: [1] },
    { word: 'CAR', hint: 'A four-wheeled vehicle', blanks: [1] },
    { word: 'FLY', hint: 'To move through the air', blanks: [2] },
    { word: 'PEN', hint: 'Used for writing with ink', blanks: [1] },
    { word: 'BED', hint: 'What you sleep on', blanks: [0] },
  ],
  2: [
    { word: 'FIRE', hint: 'Hot and produces smoke', blanks: [1, 2] },
    { word: 'BIRD', hint: 'An animal that sings', blanks: [1, 2] },
    { word: 'FISH', hint: 'Breathes underwater', blanks: [1, 2] },
    { word: 'MOON', hint: 'Bright object at night', blanks: [1, 2] },
    { word: 'TREE', hint: 'Has a trunk and leaves', blanks: [1, 2] },
    { word: 'SHIP', hint: 'A large boat on the sea', blanks: [1, 2] },
    { word: 'FROG', hint: 'Green jumping animal', blanks: [1, 2] },
    { word: 'WIND', hint: 'Moving air you can feel', blanks: [1, 2] },
    { word: 'LION', hint: 'Large cat with a mane', blanks: [1, 2] },
    { word: 'SNOW', hint: 'Cold white flakes', blanks: [1, 2] },
  ],
  3: [
    { word: 'GHOST', hint: 'A spooky spirit', blanks: [1, 2, 3] },
    { word: 'BRAIN', hint: 'Organ used for thinking', blanks: [1, 2, 3] },
    { word: 'STORM', hint: 'Heavy rain and thunder', blanks: [1, 2, 3] },
    { word: 'SPACE', hint: 'Area beyond the stars', blanks: [1, 2, 3] },
    { word: 'BATTLE', hint: 'A fight between armies', blanks: [1, 2, 3, 4] },
    { word: 'ATTACK', hint: 'To move with force', blanks: [1, 2, 3, 4, 5] },
    { word: 'SHIELD', hint: 'Used to block a strike', blanks: [1, 2, 3, 4, 5] },
    { word: 'KNIGHT', hint: 'Soldier in metal armor', blanks: [1, 2, 3, 4, 5] },
    { word: 'ROCKET', hint: 'Flies to the moon', blanks: [1, 2, 3, 4, 5] },
    { word: 'VICTORY', hint: 'Winning a competition', blanks: [1, 2, 3, 4, 5, 6] },
  ]
};
