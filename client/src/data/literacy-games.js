/**
 * Literacy Games Data — Phase 2 (Young Explorer)
 * English phonics, rhymes, and Hindi matras.
 */

// ─── English Phonics (Sound Tap) ──────────────────────────────────────────────
// Each question: show the letter, one word+emoji. Kid taps YES (starts with letter) or NO.

export const PHONICS_QUESTIONS = [
  // B
  { letter: 'B', word: 'Ball',      emoji: '🏀', correct: true  },
  { letter: 'B', word: 'Cat',       emoji: '🐱', correct: false },
  { letter: 'B', word: 'Boat',      emoji: '⛵', correct: true  },
  { letter: 'B', word: 'Dog',       emoji: '🐶', correct: false },
  // C
  { letter: 'C', word: 'Cake',      emoji: '🎂', correct: true  },
  { letter: 'C', word: 'Frog',      emoji: '🐸', correct: false },
  { letter: 'C', word: 'Cow',       emoji: '🐮', correct: true  },
  { letter: 'C', word: 'Tree',      emoji: '🌳', correct: false },
  // D
  { letter: 'D', word: 'Drum',      emoji: '🥁', correct: true  },
  { letter: 'D', word: 'Moon',      emoji: '🌙', correct: false },
  { letter: 'D', word: 'Duck',      emoji: '🦆', correct: true  },
  { letter: 'D', word: 'Hen',       emoji: '🐔', correct: false },
  // E
  { letter: 'E', word: 'Egg',       emoji: '🥚', correct: true  },
  { letter: 'E', word: 'Fish',      emoji: '🐟', correct: false },
  { letter: 'E', word: 'Elephant',  emoji: '🐘', correct: true  },
  { letter: 'E', word: 'Kite',      emoji: '🪁', correct: false },
  // F
  { letter: 'F', word: 'Fox',       emoji: '🦊', correct: true  },
  { letter: 'F', word: 'Bear',      emoji: '🐻', correct: false },
  { letter: 'F', word: 'Flower',    emoji: '🌸', correct: true  },
  { letter: 'F', word: 'Sun',       emoji: '☀️', correct: false },
  // G
  { letter: 'G', word: 'Goat',      emoji: '🐐', correct: true  },
  { letter: 'G', word: 'Lion',      emoji: '🦁', correct: false },
  { letter: 'G', word: 'Guitar',    emoji: '🎸', correct: true  },
  { letter: 'G', word: 'Parrot',    emoji: '🦜', correct: false },
  // H
  { letter: 'H', word: 'Horse',     emoji: '🐴', correct: true  },
  { letter: 'H', word: 'Apple',     emoji: '🍎', correct: false },
  { letter: 'H', word: 'Hat',       emoji: '🎩', correct: true  },
  { letter: 'H', word: 'Rabbit',    emoji: '🐰', correct: false },
  // M
  { letter: 'M', word: 'Monkey',    emoji: '🐒', correct: true  },
  { letter: 'M', word: 'Tiger',     emoji: '🐯', correct: false },
  { letter: 'M', word: 'Mango',     emoji: '🥭', correct: true  },
  { letter: 'M', word: 'Ship',      emoji: '🚢', correct: false },
  // S
  { letter: 'S', word: 'Snake',     emoji: '🐍', correct: true  },
  { letter: 'S', word: 'Duck',      emoji: '🦆', correct: false },
  { letter: 'S', word: 'Star',      emoji: '⭐', correct: true  },
  { letter: 'S', word: 'Banana',    emoji: '🍌', correct: false },
  // T
  { letter: 'T', word: 'Tiger',     emoji: '🐯', correct: true  },
  { letter: 'T', word: 'Mango',     emoji: '🥭', correct: false },
  { letter: 'T', word: 'Train',     emoji: '🚂', correct: true  },
  { letter: 'T', word: 'Pencil',    emoji: '✏️', correct: false },
];

// Pick N random questions
export function getPhonicsQuestions(n = 10) {
  const shuffled = [...PHONICS_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── English Rhymes (Rhyme Time) ─────────────────────────────────────────────
// Each question: show a word, 4 options. Pick all that rhyme.

export const RHYME_QUESTIONS = [
  {
    word: 'CAT', emoji: '🐱',
    options: [
      { word: 'Bat',   emoji: '🦇', rhymes: true  },
      { word: 'Dog',   emoji: '🐶', rhymes: false },
      { word: 'Hat',   emoji: '🎩', rhymes: true  },
      { word: 'Fish',  emoji: '🐟', rhymes: false },
    ],
  },
  {
    word: 'BEE', emoji: '🐝',
    options: [
      { word: 'Tree',  emoji: '🌳', rhymes: true  },
      { word: 'Cat',   emoji: '🐱', rhymes: false },
      { word: 'Sea',   emoji: '🌊', rhymes: true  },
      { word: 'Dog',   emoji: '🐶', rhymes: false },
    ],
  },
  {
    word: 'SUN', emoji: '☀️',
    options: [
      { word: 'Run',   emoji: '🏃', rhymes: true  },
      { word: 'Moon',  emoji: '🌙', rhymes: false },
      { word: 'Fun',   emoji: '🎉', rhymes: true  },
      { word: 'Star',  emoji: '⭐', rhymes: false },
    ],
  },
  {
    word: 'BALL', emoji: '🏀',
    options: [
      { word: 'Wall',  emoji: '🧱', rhymes: true  },
      { word: 'Boat',  emoji: '⛵', rhymes: false },
      { word: 'Fall',  emoji: '🍂', rhymes: true  },
      { word: 'Kite',  emoji: '🪁', rhymes: false },
    ],
  },
  {
    word: 'CAKE', emoji: '🎂',
    options: [
      { word: 'Lake',  emoji: '🏞️', rhymes: true  },
      { word: 'Pie',   emoji: '🥧', rhymes: false },
      { word: 'Snake', emoji: '🐍', rhymes: true  },
      { word: 'Rain',  emoji: '🌧️', rhymes: false },
    ],
  },
  {
    word: 'RING', emoji: '💍',
    options: [
      { word: 'Sing',  emoji: '🎤', rhymes: true  },
      { word: 'Jump',  emoji: '🦘', rhymes: false },
      { word: 'King',  emoji: '👑', rhymes: true  },
      { word: 'Fish',  emoji: '🐟', rhymes: false },
    ],
  },
  {
    word: 'FROG', emoji: '🐸',
    options: [
      { word: 'Dog',   emoji: '🐶', rhymes: true  },
      { word: 'Cat',   emoji: '🐱', rhymes: false },
      { word: 'Log',   emoji: '🪵', rhymes: true  },
      { word: 'Fish',  emoji: '🐟', rhymes: false },
    ],
  },
  {
    word: 'STAR', emoji: '⭐',
    options: [
      { word: 'Car',   emoji: '🚗', rhymes: true  },
      { word: 'Moon',  emoji: '🌙', rhymes: false },
      { word: 'Bar',   emoji: '🍫', rhymes: true  },
      { word: 'Sun',   emoji: '☀️', rhymes: false },
    ],
  },
  {
    word: 'RAIN', emoji: '🌧️',
    options: [
      { word: 'Train', emoji: '🚂', rhymes: true  },
      { word: 'Snow',  emoji: '❄️', rhymes: false },
      { word: 'Grain', emoji: '🌾', rhymes: true  },
      { word: 'Wind',  emoji: '💨', rhymes: false },
    ],
  },
  {
    word: 'NIGHT', emoji: '🌙',
    options: [
      { word: 'Light', emoji: '💡', rhymes: true  },
      { word: 'Day',   emoji: '☀️', rhymes: false },
      { word: 'Kite',  emoji: '🪁', rhymes: true  },
      { word: 'Moon',  emoji: '🌕', rhymes: false },
    ],
  },
];

export function getRhymeQuestions(n = 8) {
  const shuffled = [...RHYME_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Hindi Matras (Matra Match) ───────────────────────────────────────────────
// Show: complete syllable (e.g. "कि"), base consonant (क), 4 matra options.
// Kid taps the correct matra.

export const MATRA_OPTIONS = ['ा', 'ि', 'ी', 'ु', 'ू', 'े', 'ै', 'ो', 'ौ'];

export const MATRA_QUESTIONS = [
  { base: 'क', matra: 'ा', syllable: 'का', meaning: 'of / the', hint: 'kaa' },
  { base: 'क', matra: 'ि', syllable: 'कि', meaning: 'ki',        hint: 'ki'  },
  { base: 'क', matra: 'ी', syllable: 'की', meaning: 'key/of',    hint: 'kee' },
  { base: 'क', matra: 'ु', syllable: 'कु', meaning: 'ku',        hint: 'ku'  },
  { base: 'क', matra: 'ू', syllable: 'कू', meaning: 'koo',       hint: 'koo' },
  { base: 'क', matra: 'े', syllable: 'के', meaning: 'ke',        hint: 'ke'  },
  { base: 'क', matra: 'ो', syllable: 'को', meaning: 'to',        hint: 'ko'  },

  { base: 'म', matra: 'ा', syllable: 'मा', meaning: 'mother',    hint: 'maa' },
  { base: 'म', matra: 'ि', syllable: 'मि', meaning: 'mi',        hint: 'mi'  },
  { base: 'म', matra: 'ी', syllable: 'मी', meaning: 'mi/me',     hint: 'mee' },
  { base: 'म', matra: 'ु', syllable: 'मु', meaning: 'mu',        hint: 'mu'  },
  { base: 'म', matra: 'े', syllable: 'मे', meaning: 'in',        hint: 'me'  },
  { base: 'म', matra: 'ो', syllable: 'मो', meaning: 'mo',        hint: 'mo'  },

  { base: 'ग', matra: 'ा', syllable: 'गा', meaning: 'sing',      hint: 'gaa' },
  { base: 'ग', matra: 'ि', syllable: 'गि', meaning: 'gi',        hint: 'gi'  },
  { base: 'ग', matra: 'ी', syllable: 'गी', meaning: 'gee',       hint: 'gee' },
  { base: 'ग', matra: 'े', syllable: 'गे', meaning: 'went',      hint: 'ge'  },
  { base: 'ग', matra: 'ो', syllable: 'गो', meaning: 'go',        hint: 'go'  },

  { base: 'प', matra: 'ा', syllable: 'पा', meaning: 'father/pa', hint: 'paa' },
  { base: 'प', matra: 'ि', syllable: 'पि', meaning: 'pi',        hint: 'pi'  },
  { base: 'प', matra: 'ी', syllable: 'पी', meaning: 'drank',     hint: 'pee' },
  { base: 'प', matra: 'े', syllable: 'पे', meaning: 'pe',        hint: 'pe'  },
  { base: 'प', matra: 'ो', syllable: 'पो', meaning: 'po',        hint: 'po'  },

  { base: 'न', matra: 'ा', syllable: 'ना', meaning: 'no',        hint: 'naa' },
  { base: 'न', matra: 'ि', syllable: 'नि', meaning: 'ni',        hint: 'ni'  },
  { base: 'न', matra: 'ी', syllable: 'नी', meaning: 'blue',      hint: 'nee' },
  { base: 'न', matra: 'े', syllable: 'ने', meaning: 'ne',        hint: 'ne'  },
  { base: 'न', matra: 'ो', syllable: 'नो', meaning: 'no',        hint: 'no'  },
];

export function getMatraQuestions(n = 10) {
  const shuffled = [...MATRA_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n).map(q => {
    // Build 4 options: correct matra + 3 random wrong ones
    const wrong = MATRA_OPTIONS.filter(m => m !== q.matra)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [q.matra, ...wrong].sort(() => Math.random() - 0.5);
    return { ...q, options };
  });
}

// ─── Word Builder data ────────────────────────────────────────────────────────
export const WORD_BUILDER_WORDS = [
  { word: 'CAT',  emoji: '🐱', hint: 'A furry pet that says meow' },
  { word: 'DOG',  emoji: '🐶', hint: 'Man\'s best friend' },
  { word: 'SUN',  emoji: '☀️', hint: 'It shines in the sky' },
  { word: 'BAT',  emoji: '🏏', hint: 'Used to play cricket' },
  { word: 'HEN',  emoji: '🐔', hint: 'Lays eggs' },
  { word: 'FOX',  emoji: '🦊', hint: 'Clever orange animal' },
  { word: 'BEE',  emoji: '🐝', hint: 'Makes honey and buzzes' },
  { word: 'COW',  emoji: '🐮', hint: 'Gives us milk' },
  { word: 'OWL',  emoji: '🦉', hint: 'Wise bird of the night' },
  { word: 'ANT',  emoji: '🐜', hint: 'Very small and hardworking' },
  { word: 'FLY',  emoji: '🪰', hint: 'Small insect that buzzes' },
  { word: 'JAM',  emoji: '🍓', hint: 'Sweet spread for bread' },
  { word: 'MAP',  emoji: '🗺️', hint: 'Shows you where places are' },
  { word: 'PIG',  emoji: '🐷', hint: 'Pink animal that oinks' },
  { word: 'RED',  emoji: '🔴', hint: 'Color of tomato' },
];

export function getWordBuilderWords(n = 8) {
  return [...WORD_BUILDER_WORDS].sort(() => Math.random() - 0.5).slice(0, n).map(w => ({
    ...w,
    letters: w.word.split('').sort(() => Math.random() - 0.5),
  }));
}

// ─── Mascot messages ──────────────────────────────────────────────────────────
export const MASCOT_MESSAGES = {
  greeting:   ["Hi! I'm Boli! 🦜", "Let's learn together!", "Ready to play? 🌟"],
  correct:    ["Brilliant! 🎉",    "You got it! ⭐",  "Amazing! Keep going! 🚀"],
  wrong:      ["Oops! Try again 💪","Don't give up! 🌈","Almost there! 🦜"],
  complete_3: ["PERFECT! You're a star! ⭐⭐⭐", "Wow! 3 stars! You're incredible! 🏆"],
  complete_2: ["Great job! 2 stars! ⭐⭐", "You did really well! Keep practising! 🌟"],
  complete_1: ["You finished! 1 star! ⭐", "Good try! Play again to get more stars! 🦜"],
};

export function randomMessage(type) {
  const msgs = MASCOT_MESSAGES[type] || MASCOT_MESSAGES.greeting;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
