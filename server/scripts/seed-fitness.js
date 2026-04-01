// ============================================================
// Seed Script — Fitness Module
// Populates exercise library, habit templates, article categories,
// sample articles, sample coaches, and sample news
// ============================================================

const { pool } = require('../src/database/connection');

const exercises = [
  // CHEST
  { name: 'Push-Ups', slug: 'push-ups', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'chest', primary_muscles: '["chest","triceps"]', benefits: 'Builds upper body pushing strength, engages core', instructions: '1. Start in plank position\n2. Lower chest to ground\n3. Push back up to starting position\n4. Keep body in straight line', mistakes_to_avoid: 'Sagging hips, flaring elbows too wide', precautions: 'Avoid with wrist injuries', calories_per_min: 8 },
  { name: 'Bench Press', slug: 'bench-press', category: 'strength', difficulty: 'intermediate', equipment: 'barbell', body_part: 'chest', primary_muscles: '["chest","triceps","front_deltoid"]', benefits: 'Primary chest mass builder, develops pushing power', instructions: '1. Lie on bench, grip bar slightly wider than shoulders\n2. Lower bar to mid-chest\n3. Press up to lockout\n4. Keep feet flat on floor', mistakes_to_avoid: 'Bouncing bar off chest, uneven grip', precautions: 'Use a spotter for heavy weights', calories_per_min: 7 },
  { name: 'Incline Dumbbell Press', slug: 'incline-dumbbell-press', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'chest', primary_muscles: '["upper_chest","front_deltoid","triceps"]', benefits: 'Targets upper chest for balanced development', instructions: '1. Set bench to 30-45 degrees\n2. Press dumbbells up from shoulder level\n3. Lower with control\n4. Squeeze at top', mistakes_to_avoid: 'Setting bench too steep, using momentum', precautions: 'Shoulder issues - reduce angle', calories_per_min: 6 },
  { name: 'Chest Fly', slug: 'chest-fly', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'chest', primary_muscles: '["chest"]', benefits: 'Isolates chest muscles, great stretch and contraction', instructions: '1. Lie on bench with dumbbells above chest\n2. Lower arms wide with slight elbow bend\n3. Squeeze chest to bring dumbbells back together', mistakes_to_avoid: 'Going too heavy, straightening arms completely', precautions: 'Avoid with shoulder instability', calories_per_min: 5 },
  { name: 'Diamond Push-Ups', slug: 'diamond-push-ups', category: 'strength', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'chest', primary_muscles: '["triceps","inner_chest"]', benefits: 'Emphasizes triceps and inner chest', instructions: '1. Place hands together forming diamond shape\n2. Lower chest toward hands\n3. Push back up\n4. Keep elbows close to body', mistakes_to_avoid: 'Flaring elbows, sagging core', precautions: 'Wrist strain possible', calories_per_min: 9 },
  // BACK
  { name: 'Pull-Ups', slug: 'pull-ups', category: 'strength', difficulty: 'intermediate', equipment: 'pull_up_bar', body_part: 'back', primary_muscles: '["lats","biceps","rhomboids"]', benefits: 'Best bodyweight back exercise, builds width', instructions: '1. Hang from bar with overhand grip\n2. Pull up until chin over bar\n3. Lower with control\n4. Full extension at bottom', mistakes_to_avoid: 'Kipping, partial range of motion', precautions: 'Shoulder issues - modify grip', calories_per_min: 10 },
  { name: 'Bent Over Row', slug: 'bent-over-row', category: 'strength', difficulty: 'intermediate', equipment: 'barbell', body_part: 'back', primary_muscles: '["lats","rhomboids","rear_deltoid"]', benefits: 'Builds back thickness and strength', instructions: '1. Hinge at hips, back flat\n2. Pull bar to lower chest\n3. Squeeze shoulder blades\n4. Lower with control', mistakes_to_avoid: 'Rounding back, using momentum', precautions: 'Lower back issues - use lighter weight', calories_per_min: 7 },
  { name: 'Lat Pulldown', slug: 'lat-pulldown', category: 'strength', difficulty: 'beginner', equipment: 'gym_full', body_part: 'back', primary_muscles: '["lats","biceps"]', benefits: 'Great for building lat width, beginner-friendly', instructions: '1. Sit at lat pulldown machine\n2. Grip bar wide\n3. Pull to chest, squeeze lats\n4. Slowly release up', mistakes_to_avoid: 'Pulling behind neck, leaning too far back', precautions: 'Shoulder impingement - reduce range', calories_per_min: 5 },
  // SHOULDERS
  { name: 'Overhead Press', slug: 'overhead-press', category: 'strength', difficulty: 'intermediate', equipment: 'barbell', body_part: 'shoulders', primary_muscles: '["front_deltoid","lateral_deltoid","triceps"]', benefits: 'Best compound shoulder builder', instructions: '1. Start with bar at shoulder height\n2. Press straight overhead\n3. Lock out arms\n4. Lower with control', mistakes_to_avoid: 'Arching back excessively, uneven press', precautions: 'Avoid with shoulder injuries', calories_per_min: 7 },
  { name: 'Lateral Raises', slug: 'lateral-raises', category: 'strength', difficulty: 'beginner', equipment: 'dumbbells', body_part: 'shoulders', primary_muscles: '["lateral_deltoid"]', benefits: 'Isolates side delts for shoulder width', instructions: '1. Stand with dumbbells at sides\n2. Raise arms to shoulder height\n3. Slight bend in elbows\n4. Lower slowly', mistakes_to_avoid: 'Swinging weights, raising too high', precautions: 'Rotator cuff issues - use very light weight', calories_per_min: 4 },
  // ARMS
  { name: 'Bicep Curls', slug: 'bicep-curls', category: 'strength', difficulty: 'beginner', equipment: 'dumbbells', body_part: 'arms', primary_muscles: '["biceps","forearms"]', benefits: 'Classic arm builder, isolates biceps', instructions: '1. Stand with dumbbells at sides\n2. Curl weights up, squeeze biceps\n3. Lower slowly\n4. Keep elbows stationary', mistakes_to_avoid: 'Swinging body, using momentum', precautions: 'Elbow tendonitis - reduce weight', calories_per_min: 4 },
  { name: 'Tricep Dips', slug: 'tricep-dips', category: 'strength', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'arms', primary_muscles: '["triceps","chest","front_deltoid"]', benefits: 'Compound tricep builder', instructions: '1. Support body on parallel bars\n2. Lower until arms at 90 degrees\n3. Push back up\n4. Lean slightly forward', mistakes_to_avoid: 'Going too deep, flaring elbows', precautions: 'Shoulder issues - use bench dips instead', calories_per_min: 8 },
  // CORE
  { name: 'Plank', slug: 'plank', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'core', primary_muscles: '["abs","obliques","lower_back"]', benefits: 'Total core stability, builds endurance', instructions: '1. Start on forearms and toes\n2. Body in straight line\n3. Engage core tightly\n4. Hold position', duration_seconds: 60, mistakes_to_avoid: 'Sagging hips, raising hips too high', precautions: 'Lower back pain - try knee plank', calories_per_min: 5 },
  { name: 'Russian Twists', slug: 'russian-twists', category: 'strength', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'core', primary_muscles: '["obliques","abs"]', benefits: 'Targets rotational core strength', instructions: '1. Sit with knees bent, lean back slightly\n2. Twist torso side to side\n3. Touch floor beside hip\n4. Keep feet elevated for challenge', mistakes_to_avoid: 'Moving only arms, rounding spine', precautions: 'Spine issues - avoid rotation', calories_per_min: 6 },
  { name: 'Dead Bug', slug: 'dead-bug', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'core', primary_muscles: '["abs","hip_flexors"]', benefits: 'Safe core activation, great for beginners', instructions: '1. Lie on back, arms up, knees at 90\n2. Extend opposite arm and leg\n3. Return and switch sides\n4. Keep lower back pressed to floor', mistakes_to_avoid: 'Arching lower back', precautions: 'Extremely safe exercise', calories_per_min: 4 },
  // LEGS
  { name: 'Squats', slug: 'squats', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: '["quads","glutes","hamstrings"]', benefits: 'King of leg exercises, functional movement', instructions: '1. Stand shoulder-width apart\n2. Bend knees and push hips back\n3. Go to parallel or below\n4. Drive through heels to stand', mistakes_to_avoid: 'Knees caving in, rounding back', precautions: 'Knee issues - limit depth', calories_per_min: 8 },
  { name: 'Lunges', slug: 'lunges', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: '["quads","glutes","hamstrings"]', benefits: 'Unilateral leg strength, improves balance', instructions: '1. Step forward into lunge\n2. Lower back knee toward ground\n3. Push back to start\n4. Alternate legs', mistakes_to_avoid: 'Knee going past toes, leaning forward', precautions: 'Knee pain - shorter stride', calories_per_min: 7 },
  { name: 'Romanian Deadlift', slug: 'romanian-deadlift', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'legs', primary_muscles: '["hamstrings","glutes","lower_back"]', benefits: 'Best exercise for hamstrings and posterior chain', instructions: '1. Hold weights in front of thighs\n2. Hinge at hips, push hips back\n3. Lower weights along legs\n4. Squeeze glutes to stand', mistakes_to_avoid: 'Rounding back, bending knees too much', precautions: 'Lower back issues - reduce range', calories_per_min: 6 },
  { name: 'Glute Bridges', slug: 'glute-bridges', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'glutes', primary_muscles: '["glutes","hamstrings"]', benefits: 'Activates glutes, great for desk workers', instructions: '1. Lie on back, knees bent\n2. Push hips up squeezing glutes\n3. Hold at top\n4. Lower with control', mistakes_to_avoid: 'Hyperextending spine', precautions: 'Very safe exercise', calories_per_min: 4 },
  // CARDIO
  { name: 'Jumping Jacks', slug: 'jumping-jacks', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: '["full_body"]', benefits: 'Simple full body cardio warmup', instructions: '1. Stand with feet together\n2. Jump to wide stance, arms overhead\n3. Jump back to start\n4. Maintain rhythm', mistakes_to_avoid: 'Landing with locked knees', precautions: 'Joint issues - do step jacks', calories_per_min: 10 },
  { name: 'Burpees', slug: 'burpees', category: 'hiit', difficulty: 'advanced', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: '["chest","quads","core","shoulders"]', benefits: 'Ultimate full body conditioning exercise', instructions: '1. Squat down, hands on floor\n2. Jump feet back to plank\n3. Push-up\n4. Jump feet forward and jump up', mistakes_to_avoid: 'Skipping the push-up, sloppy form', precautions: 'High impact - modify for joint issues', calories_per_min: 14 },
  { name: 'Mountain Climbers', slug: 'mountain-climbers', category: 'hiit', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: '["core","hip_flexors","shoulders"]', benefits: 'Cardio + core in one exercise', instructions: '1. Start in plank position\n2. Drive knees to chest alternately\n3. Keep hips level\n4. Maintain fast pace', mistakes_to_avoid: 'Raising hips too high', precautions: 'Wrist issues - use inclined surface', calories_per_min: 12 },
  { name: 'High Knees', slug: 'high-knees', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: '["quads","hip_flexors","core"]', benefits: 'Great cardio warmup, improves coordination', instructions: '1. Stand in place\n2. Drive knees up to hip height alternately\n3. Pump arms\n4. Stay on balls of feet', mistakes_to_avoid: 'Leaning back, low knees', precautions: 'Knee issues - do marching version', calories_per_min: 10 },
  // YOGA
  { name: 'Warrior I (Virabhadrasana I)', slug: 'warrior-i', category: 'yoga', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'full_body', primary_muscles: '["quads","hip_flexors","shoulders"]', benefits: 'Builds strength, improves balance and focus', instructions: '1. Step one foot forward into lunge\n2. Back foot angled 45 degrees\n3. Raise arms overhead\n4. Square hips forward\n5. Hold 30-60 seconds', duration_seconds: 45, mistakes_to_avoid: 'Front knee over toes, hips not square', precautions: 'Knee issues - shorten stance', calories_per_min: 3 },
  { name: 'Warrior II (Virabhadrasana II)', slug: 'warrior-ii', category: 'yoga', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'full_body', primary_muscles: '["quads","hips","shoulders"]', benefits: 'Opens hips, strengthens legs', instructions: '1. Wide stance, front foot forward\n2. Bend front knee to 90 degrees\n3. Arms extended parallel to floor\n4. Gaze over front hand\n5. Hold 30-60 seconds', duration_seconds: 45, mistakes_to_avoid: 'Knee collapsing inward', precautions: 'Hip issues - reduce depth', calories_per_min: 3 },
  { name: 'Downward Dog', slug: 'downward-dog', category: 'yoga', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'full_body', primary_muscles: '["hamstrings","calves","shoulders","back"]', benefits: 'Full body stretch, relieves tension, energizing', instructions: '1. Start on hands and knees\n2. Push hips up and back\n3. Straighten legs (slight bend okay)\n4. Press heels toward floor\n5. Hold 30-60 seconds', duration_seconds: 45, mistakes_to_avoid: 'Rounding back, locked knees', precautions: 'Wrist issues - use fists', calories_per_min: 3 },
  { name: 'Tree Pose', slug: 'tree-pose', category: 'yoga', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'legs', primary_muscles: '["quads","glutes","core"]', benefits: 'Improves balance, concentration, and ankle strength', instructions: '1. Stand on one leg\n2. Place other foot on inner thigh\n3. Hands in prayer or overhead\n4. Focus on a fixed point\n5. Hold 30-60 seconds each side', duration_seconds: 45, mistakes_to_avoid: 'Foot on knee, looking down', precautions: 'Ankle issues - use wall support', calories_per_min: 2 },
  { name: 'Child\'s Pose', slug: 'childs-pose', category: 'yoga', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'back', primary_muscles: '["lower_back","hips","shoulders"]', benefits: 'Deeply relaxing, stretches back and hips', instructions: '1. Kneel on mat\n2. Sit back on heels\n3. Reach arms forward on floor\n4. Rest forehead on mat\n5. Breathe deeply', duration_seconds: 60, mistakes_to_avoid: 'Tensing shoulders', precautions: 'Knee issues - place blanket behind knees', calories_per_min: 1 },
  // STRETCHING / MOBILITY
  { name: 'Hip Flexor Stretch', slug: 'hip-flexor-stretch', category: 'stretching', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: '["hip_flexors","quads"]', benefits: 'Relieves tightness from sitting, improves posture', instructions: '1. Kneel on one knee\n2. Other foot flat in front\n3. Push hips forward gently\n4. Hold 30 seconds each side', duration_seconds: 30, mistakes_to_avoid: 'Arching lower back', precautions: 'Knee issues - use padding', calories_per_min: 1 },
  { name: 'Cat-Cow Stretch', slug: 'cat-cow-stretch', category: 'mobility', difficulty: 'beginner', equipment: 'yoga_mat', body_part: 'back', primary_muscles: '["spine","abs","back"]', benefits: 'Spinal mobility, relieves back tension', instructions: '1. Start on hands and knees\n2. Inhale: arch back, look up (cow)\n3. Exhale: round back, tuck chin (cat)\n4. Flow between positions', duration_seconds: 60, mistakes_to_avoid: 'Rushing the movement', precautions: 'Very safe for all levels', calories_per_min: 2 },
  { name: 'World\'s Greatest Stretch', slug: 'worlds-greatest-stretch', category: 'mobility', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: '["hip_flexors","hamstrings","thoracic_spine","quads"]', benefits: 'Best single stretch for full body mobility', instructions: '1. Step into lunge\n2. Place hand inside front foot\n3. Rotate torso, reach to ceiling\n4. Hold, then switch sides', duration_seconds: 30, mistakes_to_avoid: 'Rushing through it', precautions: 'Go slow if very tight', calories_per_min: 3 },
  // CALVES
  { name: 'Calf Raises', slug: 'calf-raises', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'calves', primary_muscles: '["calves"]', benefits: 'Builds calf strength, improves ankle stability', instructions: '1. Stand on edge of step\n2. Rise up on toes\n3. Hold at top briefly\n4. Lower heels below step level', mistakes_to_avoid: 'Bouncing, cutting range short', precautions: 'Achilles issues - avoid full stretch', calories_per_min: 3 },
];

const habitTemplates = [
  { name: 'Drink Water', slug: 'drink-water', description: 'Stay hydrated — drink at least 8 glasses daily', category: 'hydration', icon: '💧', color: '#3B82F6', default_target: '8 glasses', unit: 'glasses', sort_order: 1 },
  { name: '7+ Hours Sleep', slug: 'seven-hours-sleep', description: 'Get quality rest for recovery and performance', category: 'sleep', icon: '🌙', color: '#6366F1', default_target: '7 hours', unit: 'hours', sort_order: 2 },
  { name: '10K Steps', slug: 'ten-thousand-steps', description: 'Walk at least 10,000 steps every day', category: 'movement', icon: '👟', color: '#10B981', default_target: '10000 steps', unit: 'steps', sort_order: 3 },
  { name: 'Morning Stretch', slug: 'morning-stretch', description: '10 minutes of stretching after waking up', category: 'movement', icon: '🧘', color: '#F59E0B', default_target: '10 minutes', unit: 'minutes', sort_order: 4 },
  { name: 'Meditate', slug: 'meditate', description: 'Practice 10 minutes of mindfulness or meditation', category: 'mindfulness', icon: '🧠', color: '#8B5CF6', default_target: '10 minutes', unit: 'minutes', sort_order: 5 },
  { name: 'No Junk Food', slug: 'no-junk-food', description: 'Avoid processed and junk food for the day', category: 'nutrition', icon: '🥗', color: '#EF4444', default_target: 'all day', unit: 'boolean', sort_order: 6 },
  { name: 'Eat Fruits', slug: 'eat-fruits', description: 'Eat at least 2 servings of fruits daily', category: 'nutrition', icon: '🍎', color: '#EC4899', default_target: '2 servings', unit: 'servings', sort_order: 7 },
  { name: 'No Sugar', slug: 'no-sugar', description: 'Avoid added sugar for the day', category: 'nutrition', icon: '🚫', color: '#F97316', default_target: 'all day', unit: 'boolean', sort_order: 8 },
  { name: 'Evening Walk', slug: 'evening-walk', description: '30 minute walk after dinner', category: 'movement', icon: '🚶', color: '#14B8A6', default_target: '30 minutes', unit: 'minutes', sort_order: 9 },
  { name: '30-Day Fitness Challenge', slug: 'thirty-day-challenge', description: 'Complete daily workout for 30 consecutive days', category: 'challenge', icon: '🔥', color: '#EF4444', default_target: '30 days', unit: 'days', sort_order: 10 },
];

const articleCategories = [
  { name: 'Workout Tips', slug: 'workout-tips', icon: '💪', color: '#F97316', sort_order: 1 },
  { name: 'Nutrition', slug: 'nutrition', icon: '🥗', color: '#10B981', sort_order: 2 },
  { name: 'Yoga & Meditation', slug: 'yoga-meditation', icon: '🧘', color: '#8B5CF6', sort_order: 3 },
  { name: 'Mental Health', slug: 'mental-health', icon: '🧠', color: '#3B82F6', sort_order: 4 },
  { name: 'Weight Management', slug: 'weight-management', icon: '⚖️', color: '#EF4444', sort_order: 5 },
];

const articles = [
  { category_slug: 'workout-tips', title: '10 Best Bodyweight Exercises for Beginners', slug: '10-bodyweight-exercises-beginners', excerpt: 'Start your fitness journey with these effective exercises that require no equipment.', content: 'Starting your fitness journey doesn\'t require an expensive gym membership or fancy equipment. With just your body weight, you can build strength, improve endurance, and transform your health.\n\n1. Push-Ups - The ultimate upper body builder\n2. Squats - Foundation of leg strength\n3. Plank - Core stability essential\n4. Lunges - Balance and leg power\n5. Burpees - Full body conditioning\n6. Mountain Climbers - Cardio meets core\n7. Glute Bridges - Posterior chain activation\n8. Dead Bugs - Safe core strengthening\n9. Jumping Jacks - Simple cardio warmup\n10. High Knees - Coordination and conditioning\n\nStart with 3 sets of 10-15 reps for each exercise. Rest 60 seconds between sets. As you get stronger, increase reps and add more challenging variations.', read_time_min: 5, is_featured: 1 },
  { category_slug: 'nutrition', title: 'Indian Vegetarian Protein Sources for Muscle Building', slug: 'indian-veg-protein-sources', excerpt: 'Discover how to meet your protein needs with affordable Indian vegetarian foods.', content: 'Many believe that building muscle on a vegetarian diet is difficult, especially in India. But our traditional foods are packed with protein!\n\nTop Indian Vegetarian Protein Sources:\n\n1. Paneer (18g per 100g)\n2. Chickpeas/Chana (19g per 100g)\n3. Moong Dal (24g per 100g)\n4. Rajma (24g per 100g)\n5. Soy Chunks (52g per 100g!)\n6. Greek Yogurt/Hung Curd (10g per 100g)\n7. Peanuts (26g per 100g)\n8. Sprouts (8g per 100g)\n9. Tofu (17g per 100g)\n10. Quinoa (14g per 100g)\n\nAim for 1.6-2.2g of protein per kg of body weight for muscle building. Combine different protein sources throughout the day for a complete amino acid profile.', read_time_min: 6, is_featured: 1 },
  { category_slug: 'yoga-meditation', title: 'Surya Namaskar: The Complete Morning Yoga Routine', slug: 'surya-namaskar-guide', excerpt: 'Master the Sun Salutation sequence for a perfect start to your day.', content: 'Surya Namaskar (Sun Salutation) is one of the most complete yoga practices. Just 12 rounds each morning can transform your fitness.\n\nThe 12 Steps:\n1. Pranamasana (Prayer Pose)\n2. Hastauttanasana (Raised Arms)\n3. Hastapadasana (Hand to Foot)\n4. Ashwa Sanchalanasana (Equestrian Pose)\n5. Dandasana (Stick Pose)\n6. Ashtanga Namaskara (Eight-Limbed)\n7. Bhujangasana (Cobra Pose)\n8. Adho Mukha Svanasana (Downward Dog)\n9. Ashwa Sanchalanasana (Equestrian Pose)\n10. Hastapadasana (Hand to Foot)\n11. Hastauttanasana (Raised Arms)\n12. Pranamasana (Prayer Pose)\n\nBenefits: Burns ~400 calories in 30 minutes, improves flexibility, strengthens muscles, boosts mental clarity.', read_time_min: 7 },
  { category_slug: 'mental-health', title: 'How Exercise Improves Mental Health: Science-Backed Benefits', slug: 'exercise-mental-health-science', excerpt: 'Understanding the powerful connection between physical activity and mental well-being.', content: 'The mind-body connection is real and scientifically proven. Regular exercise is one of the most effective interventions for mental health.\n\nScientific Benefits:\n\n1. Reduces Anxiety - Exercise reduces levels of cortisol and adrenaline\n2. Fights Depression - As effective as antidepressants for mild-moderate cases\n3. Improves Sleep - 150 minutes of moderate exercise improves sleep quality by 65%\n4. Boosts Self-Esteem - Achievement and body changes improve confidence\n5. Sharpens Focus - Increases BDNF which helps brain function\n6. Social Connection - Group fitness builds community\n\nRecommendation: Aim for at least 150 minutes of moderate exercise per week. Even a 10-minute walk makes a difference.', read_time_min: 5 },
  { category_slug: 'weight-management', title: 'Understanding Calories: A Simple Guide to Weight Management', slug: 'understanding-calories-guide', excerpt: 'Learn the basics of calorie balance for sustainable weight management.', content: 'Weight management comes down to energy balance. Understanding calories empowers you to make informed decisions.\n\nKey Concepts:\n\n1. BMR (Basal Metabolic Rate) - Calories burned at rest\n2. TDEE (Total Daily Energy Expenditure) - Total calories burned in a day\n3. Caloric Deficit - Eating less than TDEE = weight loss\n4. Caloric Surplus - Eating more than TDEE = weight gain\n\nSafe Rates:\n- Weight Loss: 500 cal deficit = ~0.5kg/week\n- Muscle Gain: 300 cal surplus = lean gains\n\nTips:\n- Never go below 1200 cal (women) or 1500 cal (men)\n- Protein should be 25-30% of calories\n- Drink water before meals\n- Track food for awareness, not obsession', read_time_min: 6 },
];

const sampleNews = [
  { title: 'WHO Recommends 150-300 Minutes of Exercise Per Week', source: 'World Health Organization', excerpt: 'New global guidelines emphasize the importance of regular physical activity for all age groups.', category: 'guidelines' },
  { title: 'Study: Morning Workouts May Boost Fat Burning by 20%', source: 'Journal of Clinical Medicine', excerpt: 'Research shows exercising before breakfast can increase fat oxidation significantly.', category: 'research' },
  { title: 'India\'s Fitness Market to Reach $30 Billion by 2027', source: 'Economic Times', excerpt: 'The Indian fitness industry is experiencing unprecedented growth driven by health awareness.', category: 'industry' },
  { title: 'New Study Links Yoga to Reduced Inflammation', source: 'Harvard Medical School', excerpt: 'Regular yoga practice has been shown to lower inflammatory markers in the body.', category: 'research' },
  { title: 'Plant-Based Protein Shown Equally Effective for Muscle Growth', source: 'Sports Medicine Journal', excerpt: 'Comprehensive meta-analysis finds no significant difference between plant and animal protein for muscle building.', category: 'nutrition' },
];

async function seed() {
  console.log('🏋️ Seeding Fitness Module...\n');

  // 1. Exercises
  console.log('📦 Seeding exercises...');
  for (const ex of exercises) {
    try {
      await pool.query(
        `INSERT IGNORE INTO fitness_exercise_library (name, slug, category, difficulty, equipment, body_part, primary_muscles, benefits, instructions, mistakes_to_avoid, precautions, duration_seconds, calories_per_min)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ex.name, ex.slug, ex.category, ex.difficulty, ex.equipment, ex.body_part,
         ex.primary_muscles, ex.benefits, ex.instructions, ex.mistakes_to_avoid,
         ex.precautions, ex.duration_seconds || null, ex.calories_per_min || null]
      );
    } catch (e) { if (e.code !== 'ER_DUP_ENTRY') console.error(`  ❌ ${ex.name}: ${e.message}`); }
  }
  console.log(`  ✅ ${exercises.length} exercises seeded`);

  // 2. Habit Templates
  console.log('📦 Seeding habit templates...');
  for (const ht of habitTemplates) {
    try {
      await pool.query(
        `INSERT IGNORE INTO fitness_habit_templates (name, slug, description, category, icon, color, default_target, unit, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [ht.name, ht.slug, ht.description, ht.category, ht.icon, ht.color, ht.default_target, ht.unit, ht.sort_order]
      );
    } catch (e) { if (e.code !== 'ER_DUP_ENTRY') console.error(`  ❌ ${ht.name}: ${e.message}`); }
  }
  console.log(`  ✅ ${habitTemplates.length} habit templates seeded`);

  // 3. Article Categories
  console.log('📦 Seeding article categories...');
  for (const cat of articleCategories) {
    try {
      await pool.query(
        `INSERT IGNORE INTO fitness_article_categories (name, slug, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)`,
        [cat.name, cat.slug, cat.icon, cat.color, cat.sort_order]
      );
    } catch (e) { if (e.code !== 'ER_DUP_ENTRY') console.error(`  ❌ ${cat.name}: ${e.message}`); }
  }
  console.log(`  ✅ ${articleCategories.length} article categories seeded`);

  // 4. Articles
  console.log('📦 Seeding articles...');
  for (const art of articles) {
    try {
      const [cats] = await pool.query('SELECT id FROM fitness_article_categories WHERE slug = ?', [art.category_slug]);
      const catId = cats[0]?.id || null;
      await pool.query(
        `INSERT IGNORE INTO fitness_articles (category_id, title, slug, excerpt, content, read_time_min, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [catId, art.title, art.slug, art.excerpt, art.content, art.read_time_min, art.is_featured || 0]
      );
    } catch (e) { if (e.code !== 'ER_DUP_ENTRY') console.error(`  ❌ ${art.title}: ${e.message}`); }
  }
  console.log(`  ✅ ${articles.length} articles seeded`);

  // 5. News
  console.log('📦 Seeding fitness news...');
  for (const n of sampleNews) {
    try {
      await pool.query(
        `INSERT INTO fitness_news (title, source, excerpt, category) VALUES (?, ?, ?, ?)`,
        [n.title, n.source, n.excerpt, n.category]
      );
    } catch (e) { console.error(`  ❌ ${n.title}: ${e.message}`); }
  }
  console.log(`  ✅ ${sampleNews.length} news items seeded`);

  // 6. Users and Coaches
  console.log('📦 Seeding coaches and test data...');
  // Ensure we have at least 4 users (1 test user, 3 coaches)
  for (let i = 1; i <= 4; i++) {
    try {
      await pool.query('INSERT IGNORE INTO users (id, email, username, password_hash) VALUES (?, ?, ?, "dummy")', [
        i, `fitness_test${i}@example.com`, `fitness_user${i}`
      ]);
    } catch(e) {}
  }
  
  // Seed coaches (Users 2, 3, 4)
  const coaches = [
    { user_id: 2, full_name: 'Alex Johnson', bio: 'Certified Personal Trainer specializing in strength and conditioning.', specialization: ['strength', 'hiit'], years_experience: 5, pricing_monthly: 99.99, mode: 'online', status: 'approved', is_featured: 1, rating: 4.8, total_clients: 24 },
    { user_id: 3, full_name: 'Sarah Rahman', bio: 'Yoga instructor and mindfulness coach helping you find balance.', specialization: ['yoga', 'mobility'], years_experience: 8, pricing_monthly: 79.99, mode: 'both', status: 'approved', is_featured: 1, rating: 4.9, total_clients: 42 },
    { user_id: 4, full_name: 'David Chen', bio: 'Nutritionist and weight management expert.', specialization: ['nutrition', 'weight_management'], years_experience: 12, pricing_monthly: 149.99, mode: 'online', status: 'approved', is_featured: 0, rating: 4.7, total_clients: 89 }
  ];
  
  for (const coach of coaches) {
    try {
      await pool.query(
        `INSERT IGNORE INTO fitness_coach_profiles (user_id, full_name, bio, specialization, years_experience, pricing_monthly, mode, status, is_featured, rating, total_clients)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [coach.user_id, coach.full_name, coach.bio, JSON.stringify(coach.specialization), coach.years_experience, coach.pricing_monthly, coach.mode, coach.status, coach.is_featured, coach.rating, coach.total_clients]
      );
    } catch(e) { if (e.code !== 'ER_DUP_ENTRY') console.error('  ❌ Coach:', e.message); }
  }
  
  // 7. Test User Data (User 1)
  try {
    // profile
    await pool.query(
      `INSERT IGNORE INTO fitness_profiles (user_id, age, gender, height_cm, weight_kg, goal, fitness_level, onboarding_complete)
       VALUES (1, 28, 'male', 175, 70, 'muscle_gain', 'intermediate', 1)`
    );
    // workout plan
    await pool.query(
      `INSERT IGNORE INTO fitness_workout_plans (id, user_id, title, plan_type, difficulty, started_at)
       VALUES (1001, 1, '4-Week Strength Builder', 'ai_generated', 'intermediate', CURDATE())`
    );
    await pool.query(
      `INSERT IGNORE INTO fitness_workout_days (id, plan_id, day_number, day_name, focus)
       VALUES (1001, 1001, 1, 'Monday', 'Upper Body'), (1002, 1001, 2, 'Tuesday', 'Lower Body')`
    );
    // diet plan
    await pool.query(
      `INSERT IGNORE INTO fitness_diet_plans (id, user_id, plan_date, total_calories, protein_g, carbs_g, fats_g)
       VALUES (1001, 1, CURDATE(), 2500, 150, 250, 70)`
    );
    await pool.query(
      `INSERT IGNORE INTO fitness_diet_meals (plan_id, meal_type, meal_name, calories, protein_g, is_veg, sort_order)
       VALUES (1001, 'breakfast', 'Oatmeal & Protein Shake', 500, 30, 1, 0), (1001, 'lunch', 'Chicken Rice Bowl', 700, 45, 0, 1)`
    );
    console.log('  ✅ Coaches and test user data seeded');
  } catch(e) { if (e.code !== 'ER_DUP_ENTRY') console.error('  ❌ Test Data:', e.message); }

  console.log('\n✅ Fitness module seeding complete!');
  process.exit(0);
}

seed().catch(e => { console.error('SEED ERROR:', e); process.exit(1); });
