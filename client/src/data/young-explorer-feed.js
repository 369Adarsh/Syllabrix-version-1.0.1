// ─── Age Tier Detection ──────────────────────────────────────────────────────
// tiny  = LKG / UKG / Class 1  (age ~4–7)
// little = Class 2–3            (age ~7–9)
// junior = Class 4–5            (age ~9–11)

export function getAgeTier(profile) {
  const cn = (profile?.class_name || '').toString().toLowerCase().trim();
  if (!cn || cn === 'lkg' || cn === 'ukg' || cn === '1') return 'tiny';
  if (cn === '2' || cn === '3') return 'little';
  if (cn === '4' || cn === '5') return 'junior';
  // fallback: use age_group from users table
  const ag = profile?.age_group || '5-7';
  return ag === '5-7' ? 'tiny' : 'little';
}

export const GRADE_LABEL = {
  lkg: 'LKG', ukg: 'UKG',
  '1': 'Class 1', '2': 'Class 2', '3': 'Class 3',
  '4': 'Class 4', '5': 'Class 5',
};

export const YOUNG_CLASSES = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];

// ─── Activity Types ──────────────────────────────────────────────────────────
export const ACTIVITY_TYPES = [
  { id: 'drawing',     label: 'Drawing',     emoji: '🎨', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'dance',       label: 'Dancing',     emoji: '💃', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'singing',     label: 'Singing',     emoji: '🎵', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'game',        label: 'Game',        emoji: '⚽', color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'reading',     label: 'Reading',     emoji: '📚', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'achievement', label: 'Achievement', emoji: '🏆', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'craft',       label: 'Craft',       emoji: '✂️', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'other',       label: 'Other',       emoji: '⭐', color: 'bg-orange-100 text-orange-700 border-orange-200' },
];

// ─── Badges ──────────────────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first_post',   emoji: '🌟', label: 'First Share',    desc: 'Posted for the first time!',   threshold: 1  },
  { id: 'five_posts',   emoji: '🎨', label: 'Creative Kid',   desc: 'Shared 5 activities!',          threshold: 5  },
  { id: 'ten_posts',    emoji: '🏆', label: 'Star Sharer',    desc: 'Shared 10 activities!',         threshold: 10 },
  { id: 'twenty_posts', emoji: '🚀', label: 'Super Star',     desc: 'Shared 20 activities!',         threshold: 20 },
  { id: 'drawing_fan',  emoji: '🖌️', label: 'Little Artist',  desc: 'Posted 3 drawings!',            activityId: 'drawing', threshold: 3 },
  { id: 'music_lover',  emoji: '🎶', label: 'Music Lover',    desc: 'Sang or danced 3 times!',       activityIds: ['dance','singing'], threshold: 3 },
  { id: 'reader',       emoji: '📖', label: 'Bookworm',       desc: 'Shared 3 reading activities!',  activityId: 'reading', threshold: 3 },
  { id: 'champ',        emoji: '🥇', label: 'Champion',       desc: 'Shared 3 achievements!',        activityId: 'achievement', threshold: 3 },
];

export function computeBadges(posts = []) {
  const total = posts.length;
  const earned = [];
  // Post count badges
  if (total >= 1)  earned.push(BADGES[0]);
  if (total >= 5)  earned.push(BADGES[1]);
  if (total >= 10) earned.push(BADGES[2]);
  if (total >= 20) earned.push(BADGES[3]);
  // Activity-specific badges
  const countByType = (id) => posts.filter(p => p.hashtags?.includes(id)).length;
  const musicCount = countByType('dance') + countByType('singing');
  if (countByType('drawing') >= 3)    earned.push(BADGES[4]);
  if (musicCount >= 3)                earned.push(BADGES[5]);
  if (countByType('reading') >= 3)    earned.push(BADGES[6]);
  if (countByType('achievement') >= 3) earned.push(BADGES[7]);
  return earned;
}

// ─── Daily selection helpers ─────────────────────────────────────────────────
const dayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
};
const pick = (arr) => arr[dayOfYear() % arr.length];

// ─── HABITS ─────────────────────────────────────────────────────────────────
const HABITS = {
  tiny: [
    { emoji: '🖐️', title: 'Wash Your Hands', body: 'Always wash your hands before eating and after coming home. It keeps germs away!', color: 'from-blue-400 to-cyan-400' },
    { emoji: '🦷', title: 'Brush Your Teeth', body: 'Brush your teeth every morning and night for 2 minutes. Your smile will shine bright!', color: 'from-emerald-400 to-teal-400' },
    { emoji: '💧', title: 'Drink Water', body: 'Drink water throughout the day. Your body needs water to stay strong and healthy!', color: 'from-sky-400 to-blue-400' },
    { emoji: '🧹', title: 'Clean Up Your Toys', body: 'Always put your toys back after playing. A tidy room makes you feel happy!', color: 'from-purple-400 to-violet-400' },
    { emoji: '🙏', title: 'Say Please & Thank You', body: 'Using kind words like please and thank you makes everyone feel good!', color: 'from-pink-400 to-rose-400' },
    { emoji: '😴', title: 'Sleep on Time', body: 'Going to bed on time helps your brain grow and gives you energy for the next day!', color: 'from-indigo-400 to-blue-500' },
    { emoji: '🥦', title: 'Eat Your Vegetables', body: 'Vegetables give you superpowers! Try to eat at least one vegetable every day.', color: 'from-green-400 to-emerald-400' },
    { emoji: '😊', title: 'Share With Friends', body: 'Sharing your things and feelings makes you and your friends feel wonderful!', color: 'from-amber-400 to-orange-400' },
  ],
  little: [
    { emoji: '📖', title: 'Read Every Day', body: 'Read for 15 minutes every day. Books take you on amazing adventures!', color: 'from-amber-400 to-orange-400' },
    { emoji: '🏃', title: 'Play Outside', body: 'Play outside for at least 30 minutes daily. Fresh air makes your body and brain stronger!', color: 'from-green-400 to-teal-400' },
    { emoji: '📝', title: 'Do Homework First', body: 'Finish your homework before watching TV or playing games. Then enjoy with no worries!', color: 'from-blue-400 to-indigo-400' },
    { emoji: '🛏️', title: 'Make Your Bed', body: 'Make your bed every morning. Starting the day organized sets you up for success!', color: 'from-violet-400 to-purple-400' },
    { emoji: '🥗', title: 'Eat Breakfast', body: 'Never skip breakfast! It fuels your brain for learning and helps you concentrate.', color: 'from-emerald-400 to-cyan-400' },
    { emoji: '🤝', title: 'Help a Friend', body: 'Look for one way to help a classmate or friend today. Kindness is the best superpower!', color: 'from-pink-400 to-rose-400' },
    { emoji: '🧘', title: 'Take Deep Breaths', body: 'When you feel upset, take 5 deep breaths. It calms your mind and helps you think clearly.', color: 'from-sky-400 to-blue-400' },
    { emoji: '⏰', title: 'Be Punctual', body: 'Try to be on time for school and activities. It shows respect for everyone around you!', color: 'from-amber-500 to-orange-500' },
  ],
  junior: [
    { emoji: '📅', title: 'Plan Your Day', body: 'Every morning, write down 3 things you want to do. Planning helps you achieve more!', color: 'from-indigo-400 to-blue-500' },
    { emoji: '🏡', title: 'Help at Home', body: 'Help with one household task daily — washing dishes, sweeping, or setting the table. Family teamwork!', color: 'from-emerald-400 to-green-500' },
    { emoji: '🔤', title: 'Learn a New Word', body: 'Learn one new English or Hindi word every day. In a year you\'ll know 365 new words!', color: 'from-amber-400 to-yellow-500' },
    { emoji: '💪', title: 'Exercise 30 Minutes', body: 'Exercise every day — run, skip, do push-ups. A healthy body powers a brilliant mind!', color: 'from-orange-400 to-red-400' },
    { emoji: '🙈', title: 'Limit Screen Time', body: 'Set a timer for screen time. Too much screen time can tire your eyes and brain.', color: 'from-purple-400 to-violet-500' },
    { emoji: '🌱', title: 'Be Curious', body: 'Ask "Why?" and "How?" about everything you see. Curious minds become great scientists and inventors!', color: 'from-teal-400 to-cyan-500' },
    { emoji: '✍️', title: 'Write in a Journal', body: 'Write 3 sentences about your day before sleeping. It improves memory and writing skills!', color: 'from-pink-400 to-rose-500' },
    { emoji: '🤔', title: 'Think Before You Act', body: 'Before doing something, ask: Is this kind? Is this safe? Is this right? Good decisions start here!', color: 'from-blue-400 to-sky-500' },
  ],
};

// ─── STORIES ─────────────────────────────────────────────────────────────────
const STORIES = {
  tiny: [
    { emoji: '🐢', title: 'The Slow Turtle Wins', lines: ['Once there was a rabbit who always ran fast and a turtle who walked slowly.', 'One day they had a race. The rabbit ran ahead and took a nap. The turtle kept walking.', 'When the rabbit woke up, the turtle had already finished! Slow and steady wins the race!'], moral: 'Never give up, even if you are slow!' },
    { emoji: '🦁', title: 'The Kind Lion', lines: ['A big lion had a thorn stuck in his paw and was crying.', 'A tiny mouse saw the lion and pulled the thorn out.', 'The lion said: "You may be small, but your heart is the biggest of all!"'], moral: 'Kindness has no size!' },
    { emoji: '🌻', title: 'The Sunflower\'s Secret', lines: ['A little seed was buried in dark soil and felt very lonely.', 'But it drank water, soaked up sunlight, and kept growing day by day.', 'One morning it burst out of the ground as the tallest, brightest sunflower in the garden!'], moral: 'Keep going — beautiful things take time!' },
    { emoji: '🐦', title: 'The Lost Bird', lines: ['A little bird fell from its nest and cried for its mother.', 'Two children found the bird and carefully put it back in the nest.', 'The mother bird flew back and sang the most beautiful thank-you song ever!'], moral: 'One kind act can change everything!' },
  ],
  little: [
    { emoji: '🌧️', title: 'The Boy Who Wished for Rain', lines: ['During summer, Arjun planted a tiny mango seed. Everyone said it was too hot to grow.', 'Every day he gave it a little water and talked to it like a friend.', 'Three months later, a beautiful mango tree stood in his yard — the tallest on the street!'], moral: 'Small efforts done consistently create big miracles.' },
    { emoji: '🎨', title: 'Priya\'s Painting', lines: ['Priya loved painting but her drawings were never perfect.', 'She threw away 10 paintings because they had mistakes.', 'Her teacher said: "Every master painter started exactly where you are." Priya painted again — and this time loved it.'], moral: 'Mistakes are just steps on the way to mastery!' },
    { emoji: '🔦', title: 'The Dark Cave', lines: ['Two friends found a dark cave. One said "I\'m scared!" and ran away.', 'The other lit one small candle and stepped in.', 'Inside was the most beautiful crystal cave anyone had ever seen. Courage always reveals hidden wonders.'], moral: 'Be brave — great things lie just past your fears!' },
  ],
  junior: [
    { emoji: '🧠', title: 'The Two Students', lines: ['A teacher gave two students the same difficult problem.', 'The first student tried once, got it wrong, and said "I\'m not smart enough."', 'The second student tried 12 times, got it wrong 11 times, then finally solved it. The teacher said: "The only difference between you two is how many times you tried."'], moral: 'Your effort defines you more than your talent.' },
    { emoji: '🌍', title: 'The Pollution Fighters', lines: ['Riya noticed her river was getting dirtier every week.', 'Instead of complaining, she started a school club — 10 students cleaned the riverbank every Saturday.', 'Three months later, fish returned to the river. One person\'s action had started a movement.'], moral: 'You are never too young to make a difference!' },
    { emoji: '🕰️', title: 'Five More Minutes', lines: ['Every time Kabir was about to give up on a hard math problem, he said: "Just 5 more minutes."', 'After many "5 more minutes", Kabir became the best math student in his class.', '"I\'m not smarter," he told his friends. "I just never stopped 5 minutes too early."'], moral: 'Persistence turns average people into champions!' },
  ],
};

// ─── ACTIVITIES ──────────────────────────────────────────────────────────────
const ACTIVITIES = {
  tiny: [
    { emoji: '🎨', title: 'Draw Your Favourite Animal', instruction: 'Pick your favourite animal and draw it using crayons or pencils! Give it a name too.', time: '10 mins', color: 'from-pink-400 to-rose-400', hashtag: 'drawing' },
    { emoji: '🧁', title: 'Count the Bites', instruction: 'At snack time, count how many bites it takes to eat your food. How high can you count?', time: '5 mins', color: 'from-amber-400 to-orange-400', hashtag: 'activity' },
    { emoji: '✈️', title: 'Make a Paper Airplane', instruction: 'Fold a paper into an airplane and fly it across the room. Try to make it fly farther each time!', time: '10 mins', color: 'from-sky-400 to-blue-400', hashtag: 'craft' },
    { emoji: '🌸', title: 'Draw Your Garden', instruction: 'Imagine a magical garden. Draw the flowers, trees, and animals in it with as many colours as you can!', time: '15 mins', color: 'from-teal-400 to-emerald-400', hashtag: 'drawing' },
    { emoji: '🎵', title: 'Sing the ABC Song', instruction: 'Sing the alphabet song — but this time make up funny actions for each letter!', time: '5 mins', color: 'from-violet-400 to-purple-400', hashtag: 'singing' },
  ],
  little: [
    { emoji: '📝', title: 'Write 5 Things You Love', instruction: 'Write down 5 things that make you happy. Draw a small picture next to each one!', time: '10 mins', color: 'from-blue-400 to-indigo-400', hashtag: 'activity' },
    { emoji: '🏃', title: '10 Jumping Jacks', instruction: 'Do 10 jumping jacks, then 5 push-ups, then run on the spot for 1 minute. Go!', time: '5 mins', color: 'from-green-400 to-emerald-400', hashtag: 'game' },
    { emoji: '🌍', title: 'Name 5 Countries', instruction: 'Open an atlas or think hard — can you name 5 countries and their capitals? Bonus: draw their flags!', time: '15 mins', color: 'from-amber-400 to-orange-400', hashtag: 'activity' },
    { emoji: '✏️', title: 'Write a Tiny Poem', instruction: 'Write a 4-line poem about your favourite season — rain, summer, winter, or spring. No rules, just rhyme!', time: '15 mins', color: 'from-pink-400 to-rose-400', hashtag: 'activity' },
    { emoji: '🧩', title: 'Solve a Word Puzzle', instruction: 'Ask an adult to write 5 scrambled words. Unscramble them and write their meanings!', time: '10 mins', color: 'from-purple-400 to-violet-400', hashtag: 'activity' },
  ],
  junior: [
    { emoji: '🧮', title: 'Math in Real Life', instruction: 'Find 3 things at home with prices. Add them up. Now imagine you have ₹500 — what can you buy?', time: '15 mins', color: 'from-indigo-400 to-blue-500', hashtag: 'activity' },
    { emoji: '🌱', title: 'Plant Something', instruction: 'Plant a seed in a small pot with soil. Water it daily and note how it grows each week in a journal!', time: '20 mins', color: 'from-emerald-400 to-green-500', hashtag: 'activity' },
    { emoji: '🗺️', title: 'Draw Your Neighbourhood', instruction: 'Draw a map of your street or neighbourhood from memory. Add your house, school, park, and shops!', time: '20 mins', color: 'from-amber-400 to-yellow-500', hashtag: 'drawing' },
    { emoji: '💡', title: 'Invent Something', instruction: 'Think of a problem in your house or school. Sketch your invention that solves it!', time: '20 mins', color: 'from-orange-400 to-red-400', hashtag: 'activity' },
    { emoji: '🎤', title: 'Give a 1-Minute Speech', instruction: 'Stand up, pick any topic you love, and speak about it for 1 minute. Record yourself on a phone!', time: '10 mins', color: 'from-pink-400 to-rose-500', hashtag: 'activity' },
  ],
};

// ─── DAILY CHALLENGE ─────────────────────────────────────────────────────────
const CHALLENGES = {
  tiny: [
    { emoji: '🌈', title: 'Colour Rainbow', desc: 'Draw a rainbow with 7 colours and share it!', reward: '⭐' },
    { emoji: '🐸', title: 'Frog Jumps', desc: 'Jump like a frog 10 times — can you count in English?', reward: '🎖️' },
    { emoji: '🤗', title: 'Give a Hug', desc: 'Give 3 people at home a big warm hug today!', reward: '💛' },
    { emoji: '🌻', title: 'Water a Plant', desc: 'Water one plant at home and say "Grow big, friend!"', reward: '🌱' },
    { emoji: '📣', title: 'Tell a Story', desc: 'Make up a 5-sentence story about a flying elephant!', reward: '🎭' },
  ],
  little: [
    { emoji: '🧩', title: 'Puzzle Time', desc: 'Solve 10 maths addition problems without a calculator!', reward: '🏅' },
    { emoji: '📖', title: 'Read & Retell', desc: 'Read 5 pages of any book and retell the story in your own words!', reward: '📚' },
    { emoji: '🎭', title: 'Act It Out', desc: 'Act out your favourite movie scene and perform for family!', reward: '🎬' },
    { emoji: '🌍', title: 'Geography Hunt', desc: 'Find India, your state, and 3 neighbouring countries on a map!', reward: '🗺️' },
    { emoji: '🍳', title: 'Help Cook', desc: 'Help prepare one part of today\'s meal — wash vegetables, set the table, or stir the pot!', reward: '👨‍🍳' },
  ],
  junior: [
    { emoji: '🔬', title: 'Science Experiment', desc: 'Mix baking soda and vinegar in a glass. Watch the reaction! Can you explain why it fizzes?', reward: '🧪' },
    { emoji: '📰', title: 'News Reporter', desc: 'Watch or read one piece of news today and explain it to your family at dinner!', reward: '📡' },
    { emoji: '💰', title: 'Budget Game', desc: 'You have ₹200 to plan a family picnic. List what you\'d buy and calculate the cost!', reward: '💸' },
    { emoji: '🏋️', title: 'Fitness Circuit', desc: 'Complete 20 jumping jacks, 10 push-ups, 30-second plank, and 10 squats!', reward: '🏆' },
    { emoji: '🤝', title: 'Good Deed', desc: 'Do one good deed for someone today — help carry something, clean up, or say something kind!', reward: '💚' },
  ],
};

// ─── Public selectors ─────────────────────────────────────────────────────────
export const getDailyHabit    = (tier) => pick(HABITS[tier]    || HABITS.little);
export const getDailyStory    = (tier) => pick(STORIES[tier]   || STORIES.little);
export const getDailyActivity = (tier) => pick(ACTIVITIES[tier] || ACTIVITIES.little);
export const getDailyChallenge = (tier) => pick(CHALLENGES[tier] || CHALLENGES.little);

// Returns 3 rotating cards (habit, activity, story) offset so they're different each day
export function getDailyCards(tier) {
  const d = dayOfYear();
  const habits     = HABITS[tier]     || HABITS.little;
  const activities = ACTIVITIES[tier] || ACTIVITIES.little;
  const stories    = STORIES[tier]    || STORIES.little;
  return [
    { type: 'habit',    ...habits[d % habits.length] },
    { type: 'activity', ...activities[(d + 2) % activities.length] },
    { type: 'story',    ...stories[(d + 1) % stories.length] },
  ];
}
