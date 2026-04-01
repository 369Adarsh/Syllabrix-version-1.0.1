'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Utensils, Loader2, Sparkles, RefreshCw, Check, ChevronRight } from 'lucide-react';

export default function DietPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadDiet = async () => {
    try {
      const res = await fitnessAPI.getTodayDiet();
      setPlan(res.data?.data);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadDiet(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fitnessAPI.generateDiet();
      setPlan(res.data?.data);
    } catch (e) {
      alert('Failed to generate diet. Make sure your profile is complete.');
    } finally { setGenerating(false); }
  };

  const mealTypeColors = {
    breakfast: 'bg-amber-50 border-amber-200 text-amber-700',
    morning_snack: 'bg-orange-50 border-orange-200 text-orange-700',
    lunch: 'bg-green-50 border-green-200 text-green-700',
    evening_snack: 'bg-purple-50 border-purple-200 text-purple-700',
    dinner: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    pre_workout: 'bg-red-50 border-red-200 text-red-700',
    post_workout: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const mealEmojis = {
    breakfast: '🌅', morning_snack: '🍎', lunch: '🍛', evening_snack: '☕',
    dinner: '🌙', pre_workout: '⚡', post_workout: '🥤',
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-green-500" /></div>;

  return (
    <div className="max-w-[800px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
            <Utensils size={22} className="text-green-500" /> Diet Planner
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">Personalized meal plans based on your goals</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[12px] font-bold hover:shadow-lg disabled:opacity-50">
          {generating ? <Loader2 size={14} className="animate-spin" /> : plan ? <RefreshCw size={14} /> : <Sparkles size={14} />}
          {generating ? 'Generating...' : plan ? 'Regenerate' : 'Generate Plan'}
        </button>
      </motion.div>

      {plan ? (
        <>
          {/* Macro Overview */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-5 mb-4">
            <h3 className="text-[13px] font-bold text-gray-800 mb-3">Daily Nutrition Target</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Calories', value: plan.total_calories, unit: 'kcal', color: 'from-red-500 to-orange-500' },
                { label: 'Protein', value: plan.protein_g || 0, unit: 'g', color: 'from-blue-500 to-indigo-500' },
                { label: 'Carbs', value: plan.carbs_g || 0, unit: 'g', color: 'from-amber-500 to-yellow-500' },
                { label: 'Fats', value: plan.fats_g || 0, unit: 'g', color: 'from-purple-500 to-pink-500' },
                { label: 'Water', value: plan.water_ml || 2500, unit: 'ml', color: 'from-cyan-500 to-blue-500' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className={`bg-gradient-to-br ${m.color} text-white rounded-xl p-3`}>
                    <p className="text-[18px] font-extrabold">{m.value}</p>
                    <p className="text-[9px] font-medium opacity-80">{m.unit}</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 mt-1">{m.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Meals */}
          <div className="space-y-3">
            {plan.meals?.map((meal, i) => {
              const colorClass = mealTypeColors[meal.meal_type] || 'bg-gray-50 border-gray-200 text-gray-700';
              const emoji = mealEmojis[meal.meal_type] || '🍽️';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px]">{emoji}</span>
                      <div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${colorClass}`}>
                          {meal.meal_type.replace(/_/g, ' ')}
                        </span>
                        <h3 className="text-[14px] font-bold text-gray-800 mt-1">{meal.meal_name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-extrabold text-gray-700">{meal.calories} cal</p>
                      {meal.prep_time_min && <p className="text-[10px] text-gray-400">{meal.prep_time_min} min prep</p>}
                    </div>
                  </div>
                  {meal.description && <p className="text-[12px] text-gray-600 mb-2">{meal.description}</p>}
                  <div className="flex gap-4 mb-2">
                    <span className="text-[10px] text-blue-600 font-semibold">P: {meal.protein_g}g</span>
                    <span className="text-[10px] text-amber-600 font-semibold">C: {meal.carbs_g}g</span>
                    <span className="text-[10px] text-purple-600 font-semibold">F: {meal.fats_g}g</span>
                    {meal.is_veg && <span className="text-[10px] text-green-600 font-semibold">🌿 Veg</span>}
                  </div>
                  {meal.ingredients && (
                    <div className="flex flex-wrap gap-1">
                      {(typeof meal.ingredients === 'string' ? JSON.parse(meal.ingredients) : meal.ingredients)?.map((ing, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full bg-gray-100 text-[9px] font-medium text-gray-600">{ing}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
            <Utensils size={28} className="text-green-400" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-800 mb-1">No Diet Plan for Today</h2>
          <p className="text-[13px] text-gray-500 mb-4">Generate a personalized meal plan based on your profile</p>
          <button onClick={handleGenerate} disabled={generating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-[13px] font-bold hover:bg-green-600 disabled:opacity-50">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {generating ? 'Generating...' : 'Generate My Diet Plan'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
