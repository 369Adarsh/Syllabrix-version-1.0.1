'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { fitnessAPI } from '@/lib/api/fitness.api';
import { Zap, Loader2, Search, Filter, ChevronDown, Dumbbell, ArrowRight } from 'lucide-react';

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', difficulty: '', body_part: '' });
  const [selectedExercise, setSelectedExercise] = useState(null);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      const res = await fitnessAPI.getExercises(params);
      setExercises(res.data?.data || []);
    } catch (e) {} finally { setLoading(false); }
  };

  useEffect(() => { loadExercises(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadExercises();
  };

  const bodyParts = ['chest', 'back', 'shoulders', 'arms', 'core', 'legs', 'full_body', 'glutes', 'calves'];
  const categories = ['strength', 'cardio', 'yoga', 'mobility', 'stretching', 'hiit', 'pilates', 'calisthenics'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  const bodyPartEmojis = {
    chest: '🫁', back: '🔙', shoulders: '💪', arms: '💪', core: '🎯',
    legs: '🦵', full_body: '🏃', glutes: '🍑', calves: '🦶',
  };

  return (
    <div className="max-w-[900px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-[20px] font-extrabold text-gray-800 flex items-center gap-2">
          <Zap size={22} className="text-amber-500" /> Exercise Library
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Browse exercises with instructions, muscles targeted, and benefits</p>
      </motion.div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search exercises..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-[13px] outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-amber-500 text-white text-[12px] font-bold hover:bg-amber-600">Search</button>
        </form>
        <div className="flex flex-wrap gap-2">
          <select value={filters.body_part} onChange={e => setFilters(f => ({ ...f, body_part: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium bg-white outline-none">
            <option value="">All Body Parts</option>
            {bodyParts.map(bp => <option key={bp} value={bp}>{bp.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium bg-white outline-none">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.difficulty} onChange={e => setFilters(f => ({ ...f, difficulty: e.target.value }))}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-medium bg-white outline-none">
            <option value="">All Levels</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedExercise(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            className="bg-white rounded-2xl max-w-[520px] w-full max-h-[80vh] overflow-y-auto p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[18px] font-extrabold text-gray-800">{selectedExercise.name}</h2>
              <button onClick={() => setSelectedExercise(null)} className="text-gray-400 hover:text-gray-600 text-[18px]">×</button>
            </div>
            {/* 3D placeholder */}
            <div className="w-full h-48 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-4">
              <div className="text-center">
                <Dumbbell size={40} className="text-amber-400 mx-auto mb-2" />
                <p className="text-[11px] text-amber-600 font-medium">3D Model Coming Soon</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{selectedExercise.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">{selectedExercise.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">{selectedExercise.equipment}</span>
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold capitalize">{selectedExercise.body_part?.replace(/_/g, ' ')}</span>
              </div>
              {selectedExercise.primary_muscles && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Muscles Targeted</h4>
                  <div className="flex flex-wrap gap-1">
                    {(typeof selectedExercise.primary_muscles === 'string' ? JSON.parse(selectedExercise.primary_muscles) : selectedExercise.primary_muscles)?.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-medium capitalize">{m}</span>
                    ))}
                  </div>
                </div>
              )}
              {selectedExercise.instructions && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Instructions</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedExercise.instructions}</p>
                </div>
              )}
              {selectedExercise.benefits && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">Benefits</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed">{selectedExercise.benefits}</p>
                </div>
              )}
              {selectedExercise.mistakes_to_avoid && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-500 uppercase mb-1">❌ Common Mistakes</h4>
                  <p className="text-[12px] text-gray-700 leading-relaxed">{selectedExercise.mistakes_to_avoid}</p>
                </div>
              )}
              {selectedExercise.precautions && (
                <div className="bg-red-50 rounded-lg p-3">
                  <h4 className="text-[11px] font-bold text-red-600 uppercase mb-1">⚠️ Precautions</h4>
                  <p className="text-[12px] text-red-700 leading-relaxed">{selectedExercise.precautions}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Exercise Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-amber-500" /></div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {exercises.map((ex, i) => (
            <motion.button key={ex.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="w-full h-24 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center mb-3">
                <span className="text-[32px]">{bodyPartEmojis[ex.body_part] || '💪'}</span>
              </div>
              <h3 className="text-[13px] font-bold text-gray-800 mb-1 group-hover:text-amber-600 transition-colors">{ex.name}</h3>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold capitalize">{ex.category}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-bold capitalize">{ex.difficulty}</span>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold capitalize">{ex.body_part?.replace(/_/g, ' ')}</span>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/60 p-10 text-center">
          <Zap size={24} className="text-gray-300 mx-auto mb-2" />
          <p className="text-[13px] text-gray-500">No exercises found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
