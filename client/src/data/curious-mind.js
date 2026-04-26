export const DID_YOU_KNOW = [
  { fact: 'Honey never spoils — archaeologists found 3000-year-old honey in Egyptian tombs that was still edible!', emoji: '🍯', tag: 'Science' },
  { fact: 'The number zero was invented in India by the mathematician Brahmagupta around 628 AD.', emoji: '0️⃣', tag: 'Maths' },
  { fact: 'The Great Wall of China is not visible from space with the naked eye — that\'s a popular myth!', emoji: '🧱', tag: 'History' },
  { fact: 'Octopuses have three hearts and blue blood.', emoji: '🐙', tag: 'Science' },
  { fact: 'If you fold a paper 42 times, it would reach the Moon.', emoji: '📄', tag: 'Maths' },
  { fact: 'The Indus Valley Civilization had running water and toilets 4000 years ago!', emoji: '🚿', tag: 'History' },
  { fact: 'Bananas are slightly radioactive because they contain potassium-40.', emoji: '🍌', tag: 'Science' },
  { fact: 'There are more possible games of chess than atoms in the observable universe.', emoji: '♟️', tag: 'Maths' },
  { fact: 'Ancient Romans used crushed mouse brains as toothpaste.', emoji: '🦷', tag: 'History' },
  { fact: 'A bolt of lightning is five times hotter than the surface of the Sun.', emoji: '⚡', tag: 'Science' },
  { fact: 'The Fibonacci sequence appears in sunflower seeds, pinecones, and snail shells.', emoji: '🌻', tag: 'Maths' },
  { fact: 'Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.', emoji: '🏛️', tag: 'History' },
  { fact: 'Your nose can detect over 1 trillion different smells.', emoji: '👃', tag: 'Science' },
  { fact: 'The probability of you being born is 1 in 400 trillion.', emoji: '🌟', tag: 'Maths' },
  { fact: 'India invented the game of Chess — it was called Chaturanga over 1500 years ago.', emoji: '♟️', tag: 'History' },
  { fact: 'Water can boil and freeze at the same time — it\'s called the Triple Point.', emoji: '💧', tag: 'Science' },
  { fact: 'A googol is 1 followed by 100 zeros — but a googolplex is 1 followed by a googol zeros!', emoji: '🔢', tag: 'Maths' },
  { fact: 'The wheel was invented after writing — Sumerians wrote cuneiform before they built wheels.', emoji: '🛞', tag: 'History' },
  { fact: 'Trees can communicate with each other through underground fungal networks.', emoji: '🌳', tag: 'Science' },
  { fact: 'If you removed all the empty space from atoms, all humans could fit in a sugar cube.', emoji: '⚛️', tag: 'Maths' },
];

export function getTodayFact() {
  const day = Math.floor(Date.now() / 86400000);
  return DID_YOU_KNOW[day % DID_YOU_KNOW.length];
}

export const WORLD_OF = {
  science: {
    slug: 'science',
    title: 'World of Science',
    emoji: '🔬',
    tagline: 'Experiments, phenomena & curiosities',
    gradient: 'linear-gradient(135deg, #0891b2, #0284c7)',
    color: 'bg-cyan-600',
    light: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-700',
    hex: '#0891b2',
    sections: [
      {
        title: 'Mind-blowing Phenomena',
        items: [
          { emoji: '🌪️', title: 'Why Tornadoes Spin', body: 'Warm and cold air meet and clash. The spinning starts small — called a mesocyclone — and grows into a tornado. The Earth\'s rotation (Coriolis effect) makes them spin counterclockwise in the Northern Hemisphere.' },
          { emoji: '🌊', title: 'Why the Ocean is Salty', body: 'Rivers carry dissolved minerals from rocks to the ocean. Water evaporates but salt stays behind. Over billions of years, it built up to today\'s 3.5% salt concentration.' },
          { emoji: '🌈', title: 'How Rainbows Form', body: 'Sunlight enters a raindrop, bends (refracts), bounces off the back wall, then bends again coming out. Each colour bends at a slightly different angle, separating white light into its spectrum.' },
          { emoji: '⚡', title: 'How Lightning Works', body: 'Inside storm clouds, ice crystals rub against each other, creating static charge. When the charge builds enough, it releases as a giant spark — lightning — equalizing positive and negative charges.' },
        ],
      },
      {
        title: 'Kitchen Experiments',
        items: [
          { emoji: '🥛', title: 'Milk Plastic', body: 'Heat milk, add vinegar — the acid separates the casein protein, which you can mould when warm. That\'s how early plastic (casein plastic) was actually made in the 1900s!' },
          { emoji: '🥦', title: 'Dancing Raisins', body: 'Drop raisins in soda water. CO₂ bubbles stick to the rough raisin surface, making it float up. At the top the bubbles pop, and the raisin sinks again. Repeat — a tiny elevator!' },
          { emoji: '🕯️', title: 'Invisible Ink', body: 'Write with lemon juice, let it dry. Hold over a candle — the acid weakens the paper fibers, which burn slightly before the plain paper. Your secret message appears in brown.' },
        ],
      },
      {
        title: 'Amazing Animal Facts',
        items: [
          { emoji: '🦦', title: 'Sea Otters Hold Hands', body: 'To keep from drifting apart while they sleep, sea otters hold each other\'s paws. Groups are called rafts. Scientists call it "pup minding" when a mother holds her baby.' },
          { emoji: '🐘', title: 'Elephants Never Forget', body: 'Elephants have the largest brain of any land animal. They can recognize 200 individual elephants by sight and remember them for decades. They also mourn their dead.' },
          { emoji: '🦋', title: 'Butterfly Taste with Feet', body: 'Butterflies have taste sensors on their feet — 200× more sensitive than a human tongue. They land on a leaf and instantly know if it\'s edible or the right plant for laying eggs.' },
        ],
      },
    ],
  },
  maths: {
    slug: 'maths',
    title: 'World of Maths',
    emoji: '📐',
    tagline: 'Puzzles, patterns & real-world magic',
    gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    color: 'bg-violet-600',
    light: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    hex: '#7c3aed',
    sections: [
      {
        title: 'Patterns Everywhere',
        items: [
          { emoji: '🌻', title: 'Fibonacci in Nature', body: 'Count the spirals on a sunflower — you\'ll find 34 going one way and 55 going the other. Both are Fibonacci numbers (where each number = sum of the two before). This pattern also appears in pinecones, hurricanes, and galaxies.' },
          { emoji: '🐚', title: 'The Golden Ratio', body: 'Divide any Fibonacci number by the one before it: 55 ÷ 34 = 1.617... The more you go, the closer to 1.618, called Phi (φ). This ratio appears in the Parthenon, Mona Lisa, and the spiral of a nautilus shell.' },
          { emoji: '❄️', title: 'Symmetry of Snowflakes', body: 'Every snowflake has 6-fold symmetry — always exactly 6 sides. This happens because of how water molecules bond at 60° angles when freezing. No two snowflakes are identical because the path each one takes while falling is unique.' },
        ],
      },
      {
        title: 'Puzzles to Crack',
        items: [
          { emoji: '🧩', title: 'The Monty Hall Problem', body: 'Three doors: one has a car, two have goats. You pick Door 1. The host opens Door 3 (goat). Should you switch to Door 2? YES — switching wins 2/3 of the time! This baffled mathematicians worldwide when published in 1990.' },
          { emoji: '🪄', title: 'The Birthday Paradox', body: 'In a group of just 23 people, there\'s a 50% chance two share a birthday. With 70 people, it\'s 99.9%! The maths: you\'re not comparing to your birthday, but any pair — and there are 253 pairs in 23 people.' },
          { emoji: '♾️', title: 'Hilbert\'s Infinite Hotel', body: 'A hotel with infinite rooms is full. A new guest arrives. Solution: move everyone in room n to room n+1, freeing Room 1. What if infinite new guests arrive? Move everyone from room n to room 2n — all odd rooms free up!' },
        ],
      },
      {
        title: 'Maths in Real Life',
        items: [
          { emoji: '📱', title: 'Your Phone\'s Secret Maths', body: 'Every time you send a WhatsApp message, it\'s encrypted using prime numbers — numbers only divisible by 1 and themselves. Even the most powerful computer would need billions of years to crack a 2048-bit prime key.' },
          { emoji: '🏏', title: 'Cricket & Probability', body: 'The Duckworth-Lewis-Stern (DLS) method uses exponential mathematics to set fair targets in rain-affected matches. The formula was so complex it took years for teams to trust it.' },
          { emoji: '🗺️', title: 'GPS & Triangulation', body: 'Your phone talks to 4 satellites, each knowing the exact time. By calculating how long the signal took (speed × time = distance), it triangulates your position to within 3 metres using 3D geometry.' },
        ],
      },
    ],
  },
  history: {
    slug: 'history',
    title: 'World of History',
    emoji: '🏛️',
    tagline: 'Stories, timelines & untold tales',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
    color: 'bg-amber-600',
    light: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    hex: '#b45309',
    sections: [
      {
        title: 'India\'s Untold Stories',
        items: [
          { emoji: '🚢', title: 'India Had the World\'s First Dock', body: 'Lothal in Gujarat (2400 BCE) had a tidal dock engineered to match the sea\'s tidal patterns — the world\'s first. The Indus Valley civilization built cities with grid plans, drainage systems, and standardised bricks 4000 years ago.' },
          { emoji: '🔭', title: 'Aryabhata & the Zero', body: 'Aryabhata (476 CE) calculated the value of π (pi) to 4 decimal places, explained solar and lunar eclipses correctly, and determined the Earth rotates on its axis — 1000 years before Copernicus. He was 23 when he wrote his masterwork, Aryabhatiya.' },
          { emoji: '🌶️', title: 'Spices Changed the World', body: 'Europe\'s demand for Indian spices was so intense that Portugal, Spain, Britain, and the Netherlands went to war over trade routes. The discovery of America happened because Columbus was trying to find a sea route to India!' },
        ],
      },
      {
        title: 'Weird & True World History',
        items: [
          { emoji: '🐈', title: 'Egypt\'s Cat Army', body: 'In 525 BCE, the Persian King Cambyses II painted cats on shields and drove live cats into battle against the Egyptians. Since cats were sacred to the goddess Bastet, Egyptian soldiers refused to fight — and Egypt fell.' },
          { emoji: '🍕', title: 'A Pizza Saved a Kingdom', body: 'In 1889, Italian baker Raffaele Esposito made a special pizza for Queen Margherita with red (tomato), white (mozzarella), and green (basil) — the Italian flag. The Queen loved it, he named it Margherita, and pizza became Italy\'s national dish.' },
          { emoji: '🗿', title: 'The Easter Island Mystery', body: 'The 900 moai statues on Easter Island (Rapa Nui) were carved between 1400–1650 CE. No wheels, no cranes — researchers proved the islanders "walked" the statues by rocking them side to side using ropes. Many are still half-buried with full bodies underground.' },
        ],
      },
      {
        title: 'Turning Points',
        items: [
          { emoji: '🖨️', title: 'Gutenberg\'s Press Changed Everything', body: 'Before 1440, making one Bible took a monk 20 years. Gutenberg\'s printing press could make 3600 pages/day. Within 50 years, 20 million books existed. Literacy spread, ideas spread, and the Renaissance, Reformation, and Scientific Revolution followed.' },
          { emoji: '🧬', title: 'The Photo That Changed Biology', body: 'In 1952, Rosalind Franklin took "Photo 51" — an X-ray diffraction image of DNA. Watson and Crick used her image (without her knowledge) to deduce DNA\'s double helix structure. Franklin died before she could share the Nobel Prize.' },
        ],
      },
    ],
  },
};

export const INSPIRING_INDIANS = [
  { name: 'A.P.J. Abdul Kalam', field: 'Scientist & President', emoji: '🚀', story: 'Son of a boat owner from Rameswaram. Sold newspapers as a child. Became India\'s Missile Man and the 11th President.', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { name: 'Mary Kom', field: 'Boxer', emoji: '🥊', story: 'From a tiny village in Manipur. Parents were poor labourers. Won 8 World Boxing Championships and an Olympic medal.', color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { name: 'Sundar Pichai', field: 'CEO of Google', emoji: '💻', story: 'Grew up in Chennai with no TV or phone at home. Slept with his family in the living room. Now leads one of the world\'s most powerful companies.', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { name: 'Shakuntala Devi', field: 'Human Computer', emoji: '🔢', story: 'Never went to school. By age 6 she could multiply large numbers in her head. She multiplied two 13-digit numbers in 28 seconds — faster than a computer.', color: 'bg-violet-50 border-violet-200 text-violet-700' },
  { name: 'Milkha Singh', field: 'Runner "The Flying Sikh"', emoji: '🏃', story: 'Lost his parents in Partition, lived in refugee camps. Became India\'s greatest sprinter, narrowly missing Olympic gold — holding India\'s 400m record for 40 years.', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { name: 'Kalpana Chawla', field: 'Astronaut', emoji: '🌌', story: 'From Karnal, Haryana. First Indian-origin woman in space. Flew on Columbia in 1997 and 2003. Her second mission tragically ended in the Columbia disaster.', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
];

export const SKILL_QUIZ = [
  { q: 'Your friend is upset. You...', options: [{ text: 'Listen and comfort them', trait: 'creative' }, { text: 'Help them think of solutions', trait: 'analytical' }] },
  { q: 'Your favourite school activity is...', options: [{ text: 'Drawing, writing or drama', trait: 'creative' }, { text: 'Solving puzzles or experiments', trait: 'analytical' }] },
  { q: 'Given free time, you\'d rather...', options: [{ text: 'Invent a new game or story', trait: 'creative' }, { text: 'Figure out how something works', trait: 'analytical' }] },
  { q: 'When choosing a movie...', options: [{ text: 'A moving story with great characters', trait: 'creative' }, { text: 'Something with a clever twist or mystery', trait: 'analytical' }] },
  { q: 'In a group project you prefer to...', options: [{ text: 'Come up with the ideas and design', trait: 'creative' }, { text: 'Plan, organise and check everything', trait: 'analytical' }] },
  { q: 'You remember things better by...', options: [{ text: 'Drawing diagrams or telling stories', trait: 'creative' }, { text: 'Making lists or finding patterns', trait: 'analytical' }] },
  { q: 'When something goes wrong you...', options: [{ text: 'Find a workaround or new approach', trait: 'creative' }, { text: 'Go back and find the root cause', trait: 'analytical' }] },
  { q: 'Your dream superpower would be...', options: [{ text: 'Shape-shifting or time travel', trait: 'creative' }, { text: 'Mind reading or seeing the future', trait: 'analytical' }] },
];

export const SKILL_RESULTS = {
  creative: {
    label: 'Creative Thinker',
    emoji: '🎨',
    desc: 'You see the world differently — and that\'s your superpower. You\'d thrive in design, writing, music, filmmaking, architecture, game development, or any field where imagination drives innovation.',
    careers: ['UX Designer', 'Author', 'Filmmaker', 'Game Developer', 'Architect', 'Advertising'],
    color: 'bg-rose-50 border-rose-200',
    textColor: 'text-rose-700',
  },
  analytical: {
    label: 'Analytical Thinker',
    emoji: '🔍',
    desc: 'You love finding patterns, solving puzzles, and understanding how things work. You\'d thrive in science, engineering, medicine, finance, data, or law.',
    careers: ['Engineer', 'Data Scientist', 'Doctor', 'Lawyer', 'Researcher', 'Economist'],
    color: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-700',
  },
  balanced: {
    label: 'Renaissance Thinker',
    emoji: '⚡',
    desc: 'You\'re both creative AND analytical — the rarest combination. You can imagine bold ideas AND make them happen. Entrepreneurs, product managers, and inventors tend to be exactly like you.',
    careers: ['Entrepreneur', 'Product Manager', 'Inventor', 'Scientist-Artist', 'Educator', 'Strategist'],
    color: 'bg-violet-50 border-violet-200',
    textColor: 'text-violet-700',
  },
};
