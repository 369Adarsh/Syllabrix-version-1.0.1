#!/usr/bin/env node
// ============================================================
// Fitness Module — Seed Script
// Seeds exercise library, habit templates, article categories,
// articles, news, and sample coach profiles.
// Idempotent — safe to re-run without duplicating data.
//
// Usage:  node database/seeds/seed-fitness.js
// ============================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  database: process.env.DB_NAME || 'syllabrix',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4',
};

// ─── Exercises ───────────────────────────────────────────────

const exercises = [
  { name: 'Push-ups', slug: 'push-ups', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'chest', primary_muscles: ['chest','triceps','shoulders'], benefits: 'Builds upper body strength, improves posture, core stability', instructions: '1. Start in plank position with hands shoulder-width apart\n2. Lower your body until chest nearly touches the floor\n3. Push back up to starting position\n4. Keep core engaged throughout', mistakes_to_avoid: 'Flaring elbows too wide, sagging hips, not going deep enough', precautions: 'Avoid if you have wrist injuries. Modify with knees on floor if needed.', calories_per_min: 7.0 },
  { name: 'Bodyweight Squats', slug: 'bodyweight-squats', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['quadriceps','glutes','hamstrings'], benefits: 'Strengthens lower body, improves mobility and balance', instructions: '1. Stand with feet shoulder-width apart\n2. Push hips back and bend knees\n3. Lower until thighs are parallel to floor\n4. Push through heels to stand', mistakes_to_avoid: 'Knees caving inward, heels lifting off floor, rounding back', precautions: 'Go to comfortable depth if you have knee issues.', calories_per_min: 6.0 },
  { name: 'Plank', slug: 'plank', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'core', primary_muscles: ['abs','obliques','lower_back'], benefits: 'Core strength, spinal stability, posture improvement', instructions: '1. Get into forearm plank position\n2. Keep body in a straight line from head to heels\n3. Engage core and hold\n4. Breathe normally throughout', mistakes_to_avoid: 'Sagging hips, lifting hips too high, holding breath', precautions: 'Avoid if you have lower back pain. Start with shorter holds.', duration_seconds: 30, calories_per_min: 4.0 },
  { name: 'Lunges', slug: 'lunges', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['quadriceps','glutes','hamstrings'], benefits: 'Unilateral leg strength, balance improvement, hip flexibility', instructions: '1. Stand tall, step forward with one leg\n2. Lower hips until both knees are bent at 90 degrees\n3. Push back to starting position\n4. Alternate legs', mistakes_to_avoid: 'Front knee going past toes, leaning forward, short steps', precautions: 'Use support if balance is an issue. Avoid with acute knee injuries.', calories_per_min: 6.5 },
  { name: 'Burpees', slug: 'burpees', category: 'hiit', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: ['chest','legs','core','shoulders'], benefits: 'Full body conditioning, cardiovascular fitness, calorie burn', instructions: '1. Start standing, drop into squat position\n2. Kick feet back into plank\n3. Perform a push-up\n4. Jump feet back to squat\n5. Jump up with arms overhead', mistakes_to_avoid: 'Skipping the push-up, not fully extending on jump, poor landing mechanics', precautions: 'High impact — avoid with joint issues. Modify by stepping instead of jumping.', calories_per_min: 10.0 },
  { name: 'Mountain Climbers', slug: 'mountain-climbers', category: 'hiit', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'core', primary_muscles: ['core','hip_flexors','shoulders'], benefits: 'Cardio conditioning, core work, hip flexibility', instructions: '1. Start in plank position\n2. Drive one knee toward chest\n3. Quickly switch legs\n4. Maintain a steady pace', mistakes_to_avoid: 'Bouncing hips, not driving knees far enough, losing plank form', precautions: 'Reduce speed if you feel lower back strain.', duration_seconds: 30, calories_per_min: 8.0 },
  { name: 'Dumbbell Bench Press', slug: 'dumbbell-bench-press', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'chest', primary_muscles: ['chest','triceps','front_delts'], benefits: 'Chest hypertrophy, balanced strength development, shoulder health', instructions: '1. Lie on bench with dumbbells at chest level\n2. Press dumbbells up and slightly inward\n3. Lower with control to chest level\n4. Repeat', mistakes_to_avoid: 'Using momentum, uneven pressing, flaring elbows excessively', precautions: 'Use a spotter for heavy weights. Warm up shoulders first.', calories_per_min: 5.5 },
  { name: 'Dumbbell Rows', slug: 'dumbbell-rows', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'back', primary_muscles: ['lats','rhomboids','biceps'], benefits: 'Back thickness, posture improvement, grip strength', instructions: '1. Hinge at hips with one hand on bench\n2. Pull dumbbell to hip level\n3. Squeeze shoulder blade at top\n4. Lower with control', mistakes_to_avoid: 'Using too much momentum, rounding back, pulling to wrong angle', precautions: 'Keep spine neutral. Avoid if you have lower back issues.', calories_per_min: 5.0 },
  { name: 'Overhead Press', slug: 'overhead-press', category: 'strength', difficulty: 'intermediate', equipment: 'dumbbells', body_part: 'shoulders', primary_muscles: ['shoulders','triceps','upper_chest'], benefits: 'Shoulder strength, overhead stability, core engagement', instructions: '1. Hold dumbbells at shoulder height\n2. Press overhead until arms are fully extended\n3. Lower with control back to shoulders\n4. Keep core braced throughout', mistakes_to_avoid: 'Arching lower back, using momentum, incomplete range of motion', precautions: 'Avoid if you have shoulder impingement. Start light.', calories_per_min: 5.0 },
  { name: 'Bicep Curls', slug: 'bicep-curls', category: 'strength', difficulty: 'beginner', equipment: 'dumbbells', body_part: 'arms', primary_muscles: ['biceps','forearms'], benefits: 'Arm strength, grip strength, aesthetic development', instructions: '1. Stand with dumbbells at sides, palms facing forward\n2. Curl weights toward shoulders\n3. Squeeze biceps at top\n4. Lower slowly', mistakes_to_avoid: 'Swinging body, incomplete range of motion, going too heavy', precautions: 'Avoid momentum. Use lighter weights for proper form.', calories_per_min: 3.5 },
  { name: 'Deadlift', slug: 'deadlift', category: 'strength', difficulty: 'advanced', equipment: 'barbell', body_part: 'back', primary_muscles: ['hamstrings','glutes','lower_back','traps'], benefits: 'Overall strength, posterior chain development, functional fitness', instructions: '1. Stand with feet hip-width apart, barbell over midfoot\n2. Hinge at hips, grip bar\n3. Drive through heels, keeping bar close to body\n4. Stand tall, then lower with control', mistakes_to_avoid: 'Rounding back, jerking the weight, bar drifting from body', precautions: 'Master form with light weight first. Avoid with back injuries.', calories_per_min: 8.0 },
  { name: 'Jump Squats', slug: 'jump-squats', category: 'hiit', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['quadriceps','glutes','calves'], benefits: 'Explosive power, cardiovascular fitness, leg strength', instructions: '1. Stand with feet shoulder-width apart\n2. Lower into squat position\n3. Explode upward jumping as high as possible\n4. Land softly and immediately lower into next rep', mistakes_to_avoid: 'Hard landings, shallow squats, knees collapsing', precautions: 'High impact — avoid with knee or ankle issues.', calories_per_min: 9.0 },
  { name: 'Surya Namaskar (Sun Salutation)', slug: 'surya-namaskar', category: 'yoga', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: ['full_body','core','shoulders','legs'], benefits: 'Full body stretch, cardiovascular warmup, mental clarity, flexibility', instructions: '1. Pranamasana (Prayer Pose)\n2. Hasta Uttanasana (Raised Arms)\n3. Uttanasana (Forward Bend)\n4. Ashwa Sanchalanasana (Equestrian)\n5. Dandasana (Plank)\n6. Ashtanga Namaskar (Eight Limbed)\n7. Bhujangasana (Cobra)\n8. Adho Mukha Svanasana (Downward Dog)\n9. Reverse sequence', mistakes_to_avoid: 'Rushing through poses, not breathing properly, forcing flexibility', precautions: 'Move at your own pace. Skip poses that cause pain.', duration_seconds: 120, calories_per_min: 5.0 },
  { name: 'Warrior Pose (Virabhadrasana)', slug: 'warrior-pose', category: 'yoga', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['quadriceps','glutes','core','shoulders'], benefits: 'Leg strength, balance, hip opening, confidence', instructions: '1. Step one foot forward into a lunge\n2. Back foot at 45 degrees\n3. Raise arms overhead (Warrior I) or extend to sides (Warrior II)\n4. Hold and breathe deeply\n5. Switch sides', mistakes_to_avoid: 'Front knee going past ankle, collapsing trunk, holding breath', precautions: 'Reduce depth if knee pain occurs. Use a wall for balance support.', duration_seconds: 30, calories_per_min: 3.0 },
  { name: 'Tree Pose (Vrikshasana)', slug: 'tree-pose', category: 'yoga', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['calves','core','hip_stabilizers'], benefits: 'Balance, concentration, ankle stability, hip flexibility', instructions: '1. Stand on one leg\n2. Place other foot on inner thigh or calf (not knee)\n3. Bring hands to prayer position or overhead\n4. Focus on a fixed point\n5. Hold 30 seconds, switch sides', mistakes_to_avoid: 'Placing foot on knee joint, looking around, tensing upper body', precautions: 'Use wall support if balance is challenging. Start with foot lower on leg.', duration_seconds: 30, calories_per_min: 2.0 },
  { name: 'Cobra Pose (Bhujangasana)', slug: 'cobra-pose', category: 'yoga', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'back', primary_muscles: ['lower_back','chest','shoulders'], benefits: 'Spinal flexibility, chest opening, stress relief', instructions: '1. Lie face down with palms near shoulders\n2. Slowly lift chest off floor using back muscles\n3. Keep elbows slightly bent\n4. Hold for 15-30 seconds\n5. Lower slowly', mistakes_to_avoid: 'Using arms to push up instead of back muscles, lifting too high, crunching neck', precautions: 'Avoid with herniated discs. Keep movement pain-free.', duration_seconds: 30, calories_per_min: 2.5 },
  { name: 'Calf Raises', slug: 'calf-raises', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'calves', primary_muscles: ['calves','ankles'], benefits: 'Calf strength, ankle stability, improved running performance', instructions: '1. Stand with feet hip-width apart\n2. Rise up onto toes\n3. Pause at the top\n4. Lower slowly with control\n5. Use a step for extra range of motion', mistakes_to_avoid: 'Bouncing, not going through full range, leaning forward', precautions: 'Avoid if you have Achilles tendon issues.', calories_per_min: 3.0 },
  { name: 'Russian Twists', slug: 'russian-twists', category: 'strength', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'core', primary_muscles: ['obliques','abs','hip_flexors'], benefits: 'Rotational core strength, oblique development, athletic performance', instructions: '1. Sit with knees bent, feet slightly elevated\n2. Lean back to 45 degrees\n3. Rotate torso side to side\n4. Optional: hold a weight for extra resistance', mistakes_to_avoid: 'Moving only arms instead of torso, rounding back, going too fast', precautions: 'Avoid if you have lower back issues. Keep movements controlled.', calories_per_min: 5.0 },
  { name: 'Glute Bridge', slug: 'glute-bridge', category: 'strength', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'glutes', primary_muscles: ['glutes','hamstrings','lower_back'], benefits: 'Glute activation, hip extension strength, lower back support', instructions: '1. Lie on back with knees bent, feet flat\n2. Push through heels to lift hips\n3. Squeeze glutes at the top\n4. Lower slowly', mistakes_to_avoid: 'Over-arching back, not squeezing glutes, pushing through toes', precautions: 'Safe for most people. Reduce range if lower back discomfort occurs.', calories_per_min: 4.0 },
  { name: 'Downward Dog (Adho Mukha Svanasana)', slug: 'downward-dog', category: 'yoga', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: ['shoulders','hamstrings','calves','core'], benefits: 'Full body stretch, shoulder strength, hamstring flexibility, calming', instructions: '1. Start on hands and knees\n2. Lift hips up and back\n3. Press heels toward floor\n4. Spread fingers wide, press palms down\n5. Hold for 30-60 seconds', mistakes_to_avoid: 'Rounding back, locking elbows, forcing heels down', precautions: 'Bend knees if hamstrings are tight. Avoid in late pregnancy.', duration_seconds: 45, calories_per_min: 3.0 },
  { name: 'Jumping Jacks', slug: 'jumping-jacks', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'full_body', primary_muscles: ['calves','shoulders','core'], benefits: 'Cardiovascular fitness, full body warmup, coordination', instructions: '1. Stand with feet together, arms at sides\n2. Jump feet wide while raising arms overhead\n3. Jump back to starting position\n4. Maintain a steady rhythm', mistakes_to_avoid: 'Not fully extending arms, landing flat-footed, poor posture', precautions: 'Low-impact version: step out instead of jumping.', calories_per_min: 8.0 },
  { name: 'High Knees', slug: 'high-knees', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', body_part: 'legs', primary_muscles: ['hip_flexors','quadriceps','calves','core'], benefits: 'Cardiovascular fitness, hip flexor activation, running performance', instructions: '1. Stand tall with feet hip-width apart\n2. Drive one knee up toward chest\n3. Quickly alternate legs\n4. Pump arms in running motion\n5. Stay on balls of feet', mistakes_to_avoid: 'Leaning back, not lifting knees high enough, flat-footed landing', precautions: 'Reduce speed if knee or hip discomfort occurs.', duration_seconds: 30, calories_per_min: 9.0 },
  { name: 'Lat Pulldown', slug: 'lat-pulldown', category: 'strength', difficulty: 'intermediate', equipment: 'gym_full', body_part: 'back', primary_muscles: ['lats','biceps','rear_delts'], benefits: 'Back width, pulling strength, posture improvement', instructions: '1. Sit at lat pulldown machine\n2. Grip bar wider than shoulder width\n3. Pull bar to upper chest\n4. Squeeze shoulder blades together\n5. Control the return', mistakes_to_avoid: 'Pulling behind neck, using momentum, leaning too far back', precautions: 'Avoid behind-neck pulldowns. Use lighter weight for proper form.', calories_per_min: 5.0 },
  { name: 'Tricep Dips', slug: 'tricep-dips', category: 'strength', difficulty: 'intermediate', equipment: 'bodyweight', body_part: 'arms', primary_muscles: ['triceps','chest','shoulders'], benefits: 'Tricep strength, pressing power, upper body definition', instructions: '1. Place hands on bench or chair behind you\n2. Extend legs forward\n3. Lower body by bending elbows to 90 degrees\n4. Push back up', mistakes_to_avoid: 'Flaring elbows, going too deep, shrugging shoulders', precautions: 'Avoid if you have shoulder issues. Bend knees to reduce difficulty.', calories_per_min: 5.0 },
];

// ─── Habit Templates ─────────────────────────────────────────

const habitTemplates = [
  { name: 'Drink Water', slug: 'water', description: 'Stay hydrated with 8+ glasses daily', category: 'hydration', icon: '💧', color: '#3B82F6', default_target: '8 glasses', unit: 'glasses', sort_order: 1 },
  { name: 'Sleep 7+ Hours', slug: 'sleep', description: 'Get quality sleep for recovery', category: 'sleep', icon: '😴', color: '#6366F1', default_target: '7 hours', unit: 'hours', sort_order: 2 },
  { name: 'Walk 10K Steps', slug: 'walking', description: 'Stay active throughout the day', category: 'movement', icon: '🚶', color: '#10B981', default_target: '10000 steps', unit: 'steps', sort_order: 3 },
  { name: 'Morning Stretch', slug: 'stretching', description: '10 minutes of morning flexibility work', category: 'movement', icon: '🤸', color: '#F59E0B', default_target: '10 min', unit: 'minutes', sort_order: 4 },
  { name: 'Meditation', slug: 'meditation', description: 'Daily mindfulness practice for clarity', category: 'mindfulness', icon: '🧘', color: '#8B5CF6', default_target: '10 min', unit: 'minutes', sort_order: 5 },
  { name: 'No Junk Food', slug: 'no_junk', description: 'Avoid processed and junk food today', category: 'nutrition', icon: '🥦', color: '#22C55E', default_target: 'All day', unit: 'boolean', sort_order: 6 },
  { name: 'Eat Fruits', slug: 'eat_fruits', description: 'Eat at least 2 servings of fruits', category: 'nutrition', icon: '🍎', color: '#EF4444', default_target: '2 servings', unit: 'servings', sort_order: 7 },
  { name: 'Yoga Session', slug: 'yoga', description: 'Complete a yoga session', category: 'movement', icon: '🧘‍♀️', color: '#EC4899', default_target: '20 min', unit: 'minutes', sort_order: 8 },
  { name: 'Read Health Article', slug: 'read_article', description: 'Learn something new about health', category: 'mindfulness', icon: '📖', color: '#0EA5E9', default_target: '1 article', unit: 'articles', sort_order: 9 },
  { name: 'Sugar Control', slug: 'sugar_control', description: 'Keep sugar intake under 25g', category: 'nutrition', icon: '🍬', color: '#F97316', default_target: '<25g', unit: 'grams', sort_order: 10 },
  { name: '30-Day Push-Up Challenge', slug: 'pushup_challenge', description: 'Increase push-ups daily for 30 days', category: 'challenge', icon: '💪', color: '#DC2626', default_target: 'Progressive', unit: 'reps', sort_order: 11 },
  { name: 'No Screen Before Bed', slug: 'no_screen', description: 'No phone/laptop 30 min before sleep', category: 'sleep', icon: '📵', color: '#7C3AED', default_target: '30 min', unit: 'minutes', sort_order: 12 },
];

// ─── Article Categories ──────────────────────────────────────

const articleCategories = [
  { name: 'Nutrition', slug: 'nutrition', icon: '🥗', color: '#22C55E', sort_order: 1 },
  { name: 'Workouts', slug: 'workouts', icon: '🏋️', color: '#F59E0B', sort_order: 2 },
  { name: 'Yoga & Mindfulness', slug: 'yoga-mindfulness', icon: '🧘', color: '#8B5CF6', sort_order: 3 },
  { name: 'Weight Loss', slug: 'weight-loss', icon: '🔥', color: '#EF4444', sort_order: 4 },
  { name: 'Recovery & Sleep', slug: 'recovery-sleep', icon: '😴', color: '#6366F1', sort_order: 5 },
  { name: 'Sports Science', slug: 'sports-science', icon: '🧬', color: '#0EA5E9', sort_order: 6 },
  { name: 'Mental Health', slug: 'mental-health', icon: '🧠', color: '#EC4899', sort_order: 7 },
];

// ─── Articles ────────────────────────────────────────────────

const articles = [
  { cat_slug: 'nutrition', title: '10 High-Protein Indian Breakfast Ideas for Muscle Gain', slug: '10-high-protein-indian-breakfast-ideas', excerpt: 'Fuel your morning with these protein-packed desi breakfast recipes that support your muscle-building goals.', content: 'Building muscle requires adequate protein intake, especially at breakfast. Here are 10 delicious Indian options:\n\n1. **Paneer Bhurji with Multigrain Roti** — 25g protein per serving\n2. **Moong Dal Chilla** — Packed with plant protein and easy to digest\n3. **Egg Bhurji with Whole Wheat Toast** — Classic high-protein combo\n4. **Besan Cheela with Curd** — Great vegetarian option\n5. **Sprouts Salad with Lime** — Light yet protein-rich\n6. **Masala Oats with Nuts** — Fiber + protein powerhouse\n7. **Sattu Paratha** — Bihar\'s secret superfood\n8. **Soy Keema with Chapati** — Vegan muscle fuel\n9. **Greek Yogurt with Muesli and Seeds** — Quick and nutritious\n10. **Egg White Dosa** — South Indian twist on protein loading\n\nAim for 20-30g protein at breakfast to kickstart muscle protein synthesis.', author_name: 'Syllabrix Fitness', read_time_min: 5, tags: ['protein', 'breakfast', 'indian food', 'muscle gain'], is_featured: 1 },
  { cat_slug: 'workouts', title: 'Complete Home Workout Guide: No Equipment Needed', slug: 'complete-home-workout-guide-no-equipment', excerpt: 'Transform your body from home with these effective bodyweight workouts for all fitness levels.', content: 'You don\'t need a gym to get fit. Here\'s your complete home workout guide:\n\n**Beginner (20 min)**\n- 10 Push-ups (knees if needed)\n- 15 Bodyweight Squats\n- 20 sec Plank\n- 10 Lunges per leg\n- 30 sec Jumping Jacks\n\n**Intermediate (30 min)**\n- 20 Push-ups\n- 20 Jump Squats\n- 45 sec Plank\n- 15 Burpees\n- 20 Mountain Climbers per side\n\n**Advanced (45 min)**\n- 30 Diamond Push-ups\n- 25 Jump Squats\n- 60 sec Plank\n- 20 Burpees\n- Tabata: 20s work / 10s rest × 8 rounds\n\nRest 60-90 seconds between sets. Do 3 rounds total.', author_name: 'Syllabrix Fitness', read_time_min: 7, tags: ['home workout', 'bodyweight', 'no equipment', 'fitness guide'], is_featured: 1 },
  { cat_slug: 'yoga-mindfulness', title: 'Surya Namaskar: The Complete Guide to Sun Salutation', slug: 'surya-namaskar-complete-guide', excerpt: 'Master the ancient practice of Surya Namaskar with step-by-step instructions, benefits, and common mistakes.', content: 'Surya Namaskar (Sun Salutation) is one of the most complete yoga sequences. Practicing 12 rounds daily can transform your body and mind.\n\n**12 Steps of Surya Namaskar:**\n1. Pranamasana (Prayer Pose)\n2. Hasta Uttanasana (Raised Arms)\n3. Uttanasana (Standing Forward Bend)\n4. Ashwa Sanchalanasana (Equestrian Pose)\n5. Dandasana (Stick Pose)\n6. Ashtanga Namaskar (Salute with Eight Parts)\n7. Bhujangasana (Cobra Pose)\n8. Adho Mukha Svanasana (Downward Facing Dog)\n9-12. Reverse the sequence\n\n**Benefits:**\n- Burns ~13.9 calories per round\n- Improves flexibility, strength, and cardiovascular health\n- Reduces stress and anxiety\n- 12 rounds = complete body workout\n\n**Best Time:** Early morning on an empty stomach, facing the sun.', author_name: 'Syllabrix Fitness', read_time_min: 8, tags: ['yoga', 'surya namaskar', 'sun salutation', 'flexibility'], is_featured: 1 },
  { cat_slug: 'weight-loss', title: 'The Science of Fat Loss: What Actually Works', slug: 'science-of-fat-loss', excerpt: 'Cut through the noise and learn evidence-based strategies for sustainable fat loss.', content: 'Fat loss isn\'t about crash diets or magic pills. Here\'s what science says:\n\n**Calorie Deficit** — You must consume fewer calories than you burn. A 300-500 calorie deficit is sustainable.\n\n**Protein Priority** — Eat 1.6-2.2g protein per kg bodyweight to preserve muscle while losing fat.\n\n**Strength Training** — Resistance training preserves muscle mass during a deficit. Aim for 3-4 sessions per week.\n\n**Sleep** — Poor sleep increases ghrelin (hunger hormone) and decreases leptin (satiety hormone). Get 7-9 hours.\n\n**NEAT** — Non-Exercise Activity Thermogenesis (walking, fidgeting, standing) accounts for 15-30% of daily calories burned.\n\n**Patience** — Sustainable fat loss is 0.5-1 kg per week. Faster rates risk muscle loss.\n\n**Indian-Specific Tips:**\n- Replace white rice with brown rice or millets\n- Use mustard oil instead of refined oil\n- Include dal and curd in every meal for protein', author_name: 'Syllabrix Fitness', read_time_min: 6, tags: ['fat loss', 'weight loss', 'science', 'nutrition'] },
  { cat_slug: 'recovery-sleep', title: 'Recovery 101: How to Bounce Back After Intense Workouts', slug: 'recovery-101-bounce-back', excerpt: 'Learn the best recovery strategies to reduce soreness, prevent injury, and maximize gains.', content: 'Recovery is where the gains happen. Your muscles grow during rest, not during the workout.\n\n**Essential Recovery Strategies:**\n\n1. **Sleep 7-9 hours** — Growth hormone peaks during deep sleep\n2. **Post-workout nutrition** — Protein + carbs within 2 hours\n3. **Active recovery** — Light walking, stretching on rest days\n4. **Hydration** — Drink 3+ liters daily\n5. **Foam rolling** — Reduces DOMS (Delayed Onset Muscle Soreness)\n6. **Cold/contrast showers** — Reduces inflammation\n7. **Rest days** — At least 1-2 per week\n\n**Signs of Overtraining:**\n- Persistent fatigue\n- Decreased performance\n- Mood changes\n- Increased injuries\n\nListen to your body and adjust intensity accordingly.', author_name: 'Syllabrix Fitness', read_time_min: 5, tags: ['recovery', 'rest', 'sleep', 'muscle growth'] },
  { cat_slug: 'mental-health', title: 'Exercise and Mental Health: The Powerful Connection', slug: 'exercise-mental-health-connection', excerpt: 'Discover how regular exercise can improve anxiety, depression, stress, and cognitive function.', content: 'Exercise is one of the most powerful natural antidepressants available.\n\n**How Exercise Helps Mental Health:**\n- Releases endorphins (\"feel-good\" hormones)\n- Reduces cortisol (stress hormone)\n- Improves sleep quality\n- Boosts self-confidence\n- Provides healthy coping mechanism\n\n**Research shows:**\n- 30 minutes of moderate exercise, 3x/week reduces depression symptoms by 47%\n- Yoga reduces anxiety by 33%\n- Regular exercisers have 25% lower risk of developing depression\n\n**Best exercises for mental health:**\n1. Walking in nature\n2. Yoga and pranayama\n3. Swimming\n4. Dancing\n5. Group fitness classes\n\nStart small — even 10 minutes of movement can improve your mood.', author_name: 'Syllabrix Fitness', read_time_min: 5, tags: ['mental health', 'anxiety', 'depression', 'exercise'] },
  { cat_slug: 'sports-science', title: 'Understanding Macros: Protein, Carbs, and Fats Explained', slug: 'understanding-macros-explained', excerpt: 'A beginner-friendly guide to macronutrients and how to balance them for your fitness goals.', content: 'Macronutrients are the building blocks of your diet. Understanding them is key to reaching your goals.\n\n**Protein (4 cal/g)**\n- Builds and repairs muscle\n- Keeps you full longer\n- Sources: Chicken, dal, paneer, eggs, fish, soy\n- Need: 1.6-2.2g per kg bodyweight\n\n**Carbohydrates (4 cal/g)**\n- Primary energy source\n- Fuels workouts and brain\n- Sources: Rice, roti, oats, fruits, vegetables\n- Need: 3-5g per kg bodyweight\n\n**Fats (9 cal/g)**\n- Hormone production\n- Brain health\n- Vitamin absorption\n- Sources: Nuts, ghee, coconut, olive oil, avocado\n- Need: 0.8-1.2g per kg bodyweight\n\n**Macro Splits by Goal:**\n- Fat Loss: 40% P / 30% C / 30% F\n- Muscle Gain: 30% P / 45% C / 25% F\n- Maintenance: 30% P / 40% C / 30% F', author_name: 'Syllabrix Fitness', read_time_min: 7, tags: ['macros', 'nutrition', 'protein', 'diet'] },
];

// ─── News Items ──────────────────────────────────────────────

const newsItems = [
  { title: 'ICMR Releases New Dietary Guidelines for Indians in 2026', source: 'The Hindu', excerpt: 'Updated guidelines emphasize millets, plant-based proteins, and reduced ultra-processed food consumption.', category: 'nutrition', provider: 'internal' },
  { title: 'Study: 10,000 Steps May Not Be the Magic Number After All', source: 'Science Daily', excerpt: 'New research suggests 7,000-8,000 steps daily may provide similar health benefits for most adults.', category: 'fitness', provider: 'internal' },
  { title: 'Yoga Day 2026: India Sets Guinness Record with Mass Session', source: 'Times of India', excerpt: 'Over 2 million people participated in synchronized Surya Namaskar across 500 cities.', category: 'yoga', provider: 'internal' },
  { title: 'Protein Supplements Market in India Grows 25% Year-Over-Year', source: 'Economic Times', excerpt: 'Growing health awareness and fitness culture driving supplement industry to ₹10,000 crore valuation.', category: 'nutrition', provider: 'internal' },
  { title: 'AI-Powered Fitness Apps See 300% Adoption Surge in India', source: 'TechCrunch India', excerpt: 'Personalized AI workout and diet recommendations becoming mainstream among urban millennials.', category: 'technology', provider: 'internal' },
  { title: 'WHO Recommends At Least 150 Minutes of Exercise Per Week', source: 'WHO', excerpt: 'Updated guidelines emphasize both aerobic and strength training for adults aged 18-64.', category: 'fitness', provider: 'internal' },
  { title: 'Sleep Deprivation Linked to 40% Higher Injury Risk in Athletes', source: 'Sports Medicine Journal', excerpt: 'Athletes sleeping less than 7 hours face significantly higher risk of sports injuries.', category: 'recovery', provider: 'internal' },
  { title: 'Millet-Based Diet Shows Promising Results for Diabetes Management', source: 'Indian Express', excerpt: 'Clinical trials show millets can reduce HbA1c levels by 0.4% over 3 months.', category: 'nutrition', provider: 'internal' },
];

// ─── Coaches ─────────────────────────────────────────────────
// Note: coach user_id references must exist. We use high IDs
// unlikely to conflict. In production, these would be real users.

const coaches = [
  { user_id: 999001, full_name: 'Arjun Kapoor', bio: 'Certified personal trainer with 8 years of experience in strength training and sports nutrition. Former national-level athlete turned coach. I believe in sustainable fitness — no crash diets, no shortcuts.', specialization: ['weight_loss', 'muscle_building', 'nutrition', 'sports_training'], certifications: ['ACE Certified Personal Trainer', 'Precision Nutrition Level 1', 'NSCA-CPT'], years_experience: 8, pricing_monthly: 3999, pricing_session: 599, languages: ['English','Hindi','Marathi'], mode: 'both', location: 'Mumbai, Maharashtra', rating: 4.8, total_clients: 120, status: 'approved', is_featured: 1 },
  { user_id: 999002, full_name: 'Priya Sharma', bio: 'Yoga instructor and holistic wellness coach. Trained at Rishikesh Yoga Alliance (500 RYT). Specializing in Hatha Yoga, Pranayama, and stress management. I help busy professionals find balance through movement and breathwork.', specialization: ['yoga', 'flexibility', 'rehabilitation', 'prenatal'], certifications: ['500 RYT Yoga Alliance', 'Prenatal Yoga Certified', 'Ayurvedic Nutrition Certificate'], years_experience: 6, pricing_monthly: 2499, pricing_session: 399, languages: ['English','Hindi','Sanskrit'], mode: 'online', location: 'Rishikesh, Uttarakhand', rating: 4.9, total_clients: 85, status: 'approved', is_featured: 1 },
  { user_id: 999003, full_name: 'Rahul Dev', bio: 'CrossFit Level 2 trainer and HIIT specialist. I train everyone from beginners to competitive athletes. My approach combines functional fitness, mobility work, and progressive overload for real results.', specialization: ['hiit', 'crossfit', 'muscle_building', 'senior_fitness'], certifications: ['CrossFit Level 2 Trainer', 'ISSA Certified', 'First Aid & CPR'], years_experience: 5, pricing_monthly: 4499, pricing_session: 699, languages: ['English','Hindi','Punjabi'], mode: 'both', location: 'Delhi NCR', rating: 4.7, total_clients: 95, status: 'approved', is_featured: 0 },
];

// ─── Main Seed Function ─────────────────────────────────────

async function seed() {
  console.log('\n🏋️  Fitness Seed Script — Starting...\n');
  let conn;

  try {
    conn = await mysql.createConnection(DB_CONFIG);

    // 1. Seed Exercises (idempotent via INSERT IGNORE on unique slug)
    console.log('📦 Seeding Exercise Library...');
    let insertedExercises = 0;
    for (const ex of exercises) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO fitness_exercise_library
         (name, slug, category, difficulty, equipment, primary_muscles, secondary_muscles, body_part, benefits, instructions, mistakes_to_avoid, precautions, duration_seconds, calories_per_min, tags, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [ex.name, ex.slug, ex.category, ex.difficulty, ex.equipment,
         JSON.stringify(ex.primary_muscles || []), JSON.stringify(ex.secondary_muscles || []),
         ex.body_part, ex.benefits || null, ex.instructions || null,
         ex.mistakes_to_avoid || null, ex.precautions || null,
         ex.duration_seconds || null, ex.calories_per_min || null,
         JSON.stringify(ex.tags || [])]
      );
      if (result.affectedRows > 0) insertedExercises++;
    }
    console.log(`   ✓ ${insertedExercises} new exercises inserted (${exercises.length - insertedExercises} already existed)`);

    // 2. Seed Habit Templates (idempotent via INSERT IGNORE on unique slug)
    console.log('📦 Seeding Habit Templates...');
    let insertedHabits = 0;
    for (const h of habitTemplates) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO fitness_habit_templates
         (name, slug, description, category, icon, color, default_target, unit, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [h.name, h.slug, h.description, h.category, h.icon, h.color, h.default_target, h.unit, h.sort_order]
      );
      if (result.affectedRows > 0) insertedHabits++;
    }
    console.log(`   ✓ ${insertedHabits} new habit templates inserted (${habitTemplates.length - insertedHabits} already existed)`);

    // 3. Seed Article Categories (idempotent via INSERT IGNORE on unique slug)
    console.log('📦 Seeding Article Categories...');
    let insertedCats = 0;
    for (const c of articleCategories) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO fitness_article_categories
         (name, slug, icon, color, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [c.name, c.slug, c.icon, c.color, c.sort_order]
      );
      if (result.affectedRows > 0) insertedCats++;
    }
    console.log(`   ✓ ${insertedCats} new article categories inserted`);

    // 4. Seed Articles (idempotent via INSERT IGNORE on unique slug)
    // Look up category IDs by slug
    const [catRows] = await conn.query('SELECT id, slug FROM fitness_article_categories');
    const catMap = {};
    catRows.forEach(r => catMap[r.slug] = r.id);

    console.log('📦 Seeding Articles...');
    let insertedArticles = 0;
    for (const a of articles) {
      const categoryId = catMap[a.cat_slug] || null;
      const [result] = await conn.execute(
        `INSERT IGNORE INTO fitness_articles
         (category_id, title, slug, excerpt, content, author_name, read_time_min, tags, is_featured, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [categoryId, a.title, a.slug, a.excerpt, a.content, a.author_name, a.read_time_min,
         JSON.stringify(a.tags || []), a.is_featured ? 1 : 0]
      );
      if (result.affectedRows > 0) insertedArticles++;
    }
    console.log(`   ✓ ${insertedArticles} new articles inserted`);

    // 5. Seed News (idempotent via title check)
    console.log('📦 Seeding News Items...');
    let insertedNews = 0;
    for (const n of newsItems) {
      const [existing] = await conn.execute('SELECT id FROM fitness_news WHERE title = ? LIMIT 1', [n.title]);
      if (existing.length === 0) {
        await conn.execute(
          `INSERT INTO fitness_news (title, source, excerpt, category, provider) VALUES (?, ?, ?, ?, ?)`,
          [n.title, n.source, n.excerpt, n.category, n.provider]
        );
        insertedNews++;
      }
    }
    console.log(`   ✓ ${insertedNews} new news items inserted`);

    // 6. Seed Sample Coaches (idempotent via UNIQUE user_id)
    console.log('📦 Seeding Sample Coaches...');
    let insertedCoaches = 0;
    for (const c of coaches) {
      const [result] = await conn.execute(
        `INSERT IGNORE INTO fitness_coach_profiles
         (user_id, full_name, bio, specialization, certifications, years_experience, pricing_monthly, pricing_session, languages, mode, location, rating, total_clients, status, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.user_id, c.full_name, c.bio,
         JSON.stringify(c.specialization), JSON.stringify(c.certifications),
         c.years_experience, c.pricing_monthly, c.pricing_session,
         JSON.stringify(c.languages), c.mode, c.location,
         c.rating, c.total_clients, c.status, c.is_featured ? 1 : 0]
      );
      if (result.affectedRows > 0) insertedCoaches++;
    }
    console.log(`   ✓ ${insertedCoaches} new coaches inserted`);

    console.log('\n🎉 Fitness seed complete!\n');

  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

seed();
