// ============================================================
// AI Fitness Service — Workout & Diet recommendation engine
// Uses the existing multi-provider AI fallback chain
// ============================================================

const { generateJSON, chat } = require('./ai.service');

// ─── System Prompts ──────────────────────────────────────────

const FITNESS_COACH_SYSTEM = `You are an elite AI Fitness Coach on Syllabrix — India's education and wellness platform.
You are warm, motivating, and knowledgeable. You adapt your advice based on the user's profile, goals, fitness level, injuries, and dietary preferences.
- Always be encouraging but honest
- Give evidence-based advice
- Consider Indian dietary habits and food options
- Account for injuries and medical conditions
- Adjust for available equipment and time
- Use simple language, avoid jargon unless explaining
- If asked about medical conditions, recommend consulting a doctor
- Support veg, non-veg, vegan, and Jain dietary preferences`;

const buildUserContext = (profile) => {
  if (!profile) return '';
  const parts = [];
  if (profile.age) parts.push(`Age: ${profile.age}`);
  if (profile.gender) parts.push(`Gender: ${profile.gender}`);
  if (profile.height_cm) parts.push(`Height: ${profile.height_cm}cm`);
  if (profile.weight_kg) parts.push(`Weight: ${profile.weight_kg}kg`);
  if (profile.goal) parts.push(`Goal: ${profile.goal.replace(/_/g, ' ')}`);
  if (profile.fitness_level) parts.push(`Fitness level: ${profile.fitness_level}`);
  if (profile.activity_level) parts.push(`Activity level: ${profile.activity_level.replace(/_/g, ' ')}`);
  if (profile.dietary_preference) parts.push(`Diet: ${profile.dietary_preference.replace(/_/g, ' ')}`);
  if (profile.allergies) parts.push(`Allergies: ${profile.allergies}`);
  if (profile.injuries) parts.push(`Injuries/conditions: ${profile.injuries}`);
  if (profile.available_time_min) parts.push(`Available workout time: ${profile.available_time_min} min/day`);
  if (profile.available_equipment) {
    const eq = typeof profile.available_equipment === 'string' ? JSON.parse(profile.available_equipment) : profile.available_equipment;
    if (Array.isArray(eq) && eq.length) parts.push(`Equipment: ${eq.join(', ')}`);
  }
  if (profile.preferred_styles) {
    const styles = typeof profile.preferred_styles === 'string' ? JSON.parse(profile.preferred_styles) : profile.preferred_styles;
    if (Array.isArray(styles) && styles.length) parts.push(`Preferred styles: ${styles.join(', ')}`);
  }
  if (profile.sleep_hours) parts.push(`Sleep: ${profile.sleep_hours} hrs/night`);
  if (profile.target_weight_kg) parts.push(`Target weight: ${profile.target_weight_kg}kg`);
  if (profile.bmi) parts.push(`BMI: ${profile.bmi}`);
  if (profile.tdee) parts.push(`TDEE: ${profile.tdee} cal`);
  return parts.length ? `\n\nUSER PROFILE:\n${parts.join('\n')}` : '';
};

// ─── AI Chat ────────────────────────────────────────────────

const chatWithCoach = async (history, message, profile, checkinData) => {
  let systemPrompt = FITNESS_COACH_SYSTEM + buildUserContext(profile);
  if (checkinData) {
    systemPrompt += `\n\nTODAY'S CHECK-IN: Water: ${checkinData.water_ml || 0}ml, Sleep: ${checkinData.sleep_hours || '?'}hrs, Steps: ${checkinData.steps || 0}, Mood: ${checkinData.mood || '?'}, Energy: ${checkinData.energy_level || '?'}/10`;
  }
  return await chat(history, message, systemPrompt, { task: 'chat' });
};

// ─── Generate Workout Plan ──────────────────────────────────

const generateWorkoutPlan = async (profile, options = {}) => {
  const context = buildUserContext(profile);
  const daysPerWeek = options.daysPerWeek || profile.days_per_week || 5;
  const durMin = profile.available_time_min || 45;
  const goal = (options.goal || profile.goal || 'general_fitness').replace(/_/g, ' ');
  const level = profile.fitness_level || 'beginner';
  const equipment = profile.available_equipment
    ? (typeof profile.available_equipment === 'string' ? JSON.parse(profile.available_equipment) : profile.available_equipment)
    : ['bodyweight'];

  const prompt = `Generate a ${daysPerWeek}-day weekly workout plan for a ${level} level person.
${context}

Goal: ${goal}
Duration per session: ${durMin} minutes
Equipment available: ${equipment.join(', ')}

Return a JSON object with this exact structure:
{
  "title": "Plan name",
  "description": "Brief plan description",
  "days": [
    {
      "day_number": 1,
      "day_name": "Monday",
      "day_type": "workout",
      "focus": "Upper Body Push",
      "est_duration_min": ${durMin},
      "exercises": [
        {
          "exercise_name": "Exercise Name",
          "phase": "warmup|main|cooldown",
          "sets": 3,
          "reps": "12",
          "duration_sec": null,
          "rest_sec": 60,
          "target_muscles": ["chest", "triceps"],
          "benefits": "Brief benefit",
          "precautions": "Any precautions"
        }
      ]
    }
  ]
}

Include warmup exercises, main exercises, and cooldown for each workout day.
Include 1-2 rest/active recovery days.
For yoga/flexibility goals, include yoga poses with hold durations.
Account for any injuries mentioned in the profile.`;

  return await generateJSON(prompt, { task: 'reasoning', maxTokens: 8192, temperature: 0.7 });
};

// ─── Generate Diet Plan ─────────────────────────────────────

const generateDietPlan = async (profile, options = {}) => {
  const context = buildUserContext(profile);
  const dietPref = (profile.dietary_preference || 'non_veg').replace(/_/g, ' ');
  const calories = profile.target_calories || profile.tdee || 2000;
  const goal = (profile.goal || 'general_fitness').replace(/_/g, ' ');

  const prompt = `Generate a daily diet plan for an Indian ${dietPref} diet.
${context}

Goal: ${goal}
Target calories: ~${calories} cal/day
Budget: ${options.budget || 'moderate'}

Return a JSON object with this exact structure:
{
  "total_calories": ${calories},
  "protein_g": 0,
  "carbs_g": 0,
  "fats_g": 0,
  "fiber_g": 0,
  "water_ml": 2500,
  "meals": [
    {
      "meal_type": "breakfast|morning_snack|lunch|evening_snack|dinner",
      "meal_name": "Meal Name",
      "description": "Brief description",
      "calories": 400,
      "protein_g": 20,
      "carbs_g": 50,
      "fats_g": 10,
      "fiber_g": 5,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "recipe_steps": "Brief recipe",
      "prep_time_min": 15,
      "is_veg": true
    }
  ]
}

Include breakfast, lunch, dinner, and 1-2 snacks.
Use commonly available Indian foods and ingredients.
${profile.allergies ? `AVOID these allergens: ${profile.allergies}` : ''}
Ensure macro split is appropriate for the goal.`;

  return await generateJSON(prompt, { task: 'reasoning', maxTokens: 6144, temperature: 0.7 });
};

// ─── Daily Motivation ───────────────────────────────────────

const generateMotivation = async (profile, streakDays = 0, completionRate = 0) => {
  const context = buildUserContext(profile);
  const prompt = `Generate a short, personalized motivational message for a fitness user.
${context}
Current streak: ${streakDays} days
Weekly completion rate: ${completionRate}%

Return JSON: { "message": "motivational message", "tip": "one actionable fitness tip for today", "emoji": "relevant emoji" }
Keep it warm, personal, and under 2 sentences each.`;

  return await generateJSON(prompt, { task: 'fast', maxTokens: 512, temperature: 0.9 });
};

// ─── Fresh News Generation ───────────────────────────────────

const getFreshNews = async (count = 5) => {
  const prompt = `Generate ${count} fresh, trending health and fitness news headlines for today.
Target audience: Health-conscious individuals in India.
Include various categories like: 'research', 'guidelines', 'industry', 'nutrition', 'yoga'.

Return a JSON object with this structure:
{
  "news": [
    {
      "title": "Compelling headline",
      "source": "Credible source name",
      "excerpt": "1-2 sentence summary of the news impact",
      "category": "category_slug"
    }
  ]
}
Make them realistic and relevant to current health trends (AI in fitness, new dietary guidelines, sports science breakthroughs, etc.).`;

  const result = await generateJSON(prompt, { task: 'fast', maxTokens: 2048, temperature: 0.8 });
  return result?.news || [];
};

// ─── Dynamic Insight Generation ───────────────────────────────

const getDynamicInsight = async (profile, dashboardData) => {
  const context = buildUserContext(profile);
  const prompt = `Based on the user's fitness profile and today's activity, generate one unique, actionable "Fresh Insight" for them.
${context}

TODAY'S ACTIVITY:
Streak: ${dashboardData.totalHabitStreak} days
Habits Completed: ${dashboardData.completedTodayHabits}/${dashboardData.totalHabits}
Water: ${dashboardData.checkin?.water_ml || 0}ml
Workout: ${dashboardData.todayWorkout ? dashboardData.todayWorkout.day_name : 'No workout scheduled'}

Return JSON: { "title": "Insight Title", "content": "1-2 sentence insight", "priority": "high|medium|low" }
The insight should be fresh, specific (e.g. mention late night sleep if sleep is low, or suggest a specific food if goal is muscle gain), and scientific.`;

  return await generateJSON(prompt, { task: 'fast', maxTokens: 512, temperature: 0.8 });
};

// ─── Calculate BMI, BMR, TDEE ───────────────────────────────

const calculateMetrics = (profile) => {
  const { height_cm, weight_kg, age, gender, activity_level } = profile;
  const metrics = {};

  if (height_cm && weight_kg) {
    const heightM = height_cm / 100;
    metrics.bmi = Math.round((weight_kg / (heightM * heightM)) * 10) / 10;
  }

  if (height_cm && weight_kg && age && gender) {
    // Mifflin-St Jeor
    if (gender === 'male') {
      metrics.bmr = Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age + 5);
    } else {
      metrics.bmr = Math.round(10 * weight_kg + 6.25 * height_cm - 5 * age - 161);
    }

    const multipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };
    metrics.tdee = Math.round(metrics.bmr * (multipliers[activity_level] || 1.55));

    // Calorie target based on goal
    const goal = profile.goal || 'general_fitness';
    if (goal === 'fat_loss') metrics.target_calories = Math.round(metrics.tdee * 0.8);
    else if (goal === 'muscle_gain') metrics.target_calories = Math.round(metrics.tdee * 1.15);
    else metrics.target_calories = metrics.tdee;
  }

  return metrics;
};

module.exports = {
  chatWithCoach,
  generateWorkoutPlan,
  generateDietPlan,
  generateMotivation,
  getFreshNews,
  getDynamicInsight,
  calculateMetrics,
};
