'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiOutlineLightBulb, HiOutlineChevronRight, HiOutlineSparkles, HiOutlineDocumentText, HiArrowLeft } from 'react-icons/hi';
import { FaBrain, FaExpandArrowsAlt } from 'react-icons/fa';

// ─── Goal Setup Modal ────────────────────────────────────────
function GoalSetupPanel({ onStart }) {
  const [topic, setTopic] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [board, setBoard] = useState('');
  const [goal, setGoal] = useState('');

  const classes = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Undergraduate', 'Competitive Exam'];
  const boards = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge', 'Other'];
  const goals = [
    { id: 'exam_prep', label: 'Exam Preparation', icon: '📝', desc: 'Break topic into exam-relevant subtopics' },
    { id: 'deep_understanding', label: 'Deep Understanding', icon: '🔬', desc: 'Comprehensive topic exploration with notes' },
    { id: 'quick_revision', label: 'Quick Revision', icon: '⚡', desc: 'Key points and summary for fast review' },
    { id: 'project_research', label: 'Project / Research', icon: '🔍', desc: 'Explore connections and related concepts' },
  ];

  const canStart = topic.trim() && goal;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white mb-4 shadow-lg">
          <FaBrain className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Mind Map</h1>
        <p className="text-gray-500">Tell me what you want to learn — I'll create a purposeful, structured map with study notes.</p>
      </div>

      {/* Topic Input */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">What topic do you want to explore?</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, Indian Constitution, Algebra, Solar System..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-gray-800 text-lg"
        />
      </div>

      {/* Class & Board (Optional but recommended) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Class / Level <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-gray-700"
          >
            <option value="">Select class</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Board <span className="text-gray-400 font-normal">(optional)</span></label>
          <select
            value={board}
            onChange={(e) => setBoard(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-gray-700"
          >
            <option value="">Select board</option>
            {boards.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Goal Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">What's your goal?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setGoal(g.id)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                goal === g.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                  : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{g.icon}</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">{g.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{g.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={() => onStart({ topic, classLevel, board, goal })}
        disabled={!canStart}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
      >
        <HiOutlineSparkles className="w-6 h-6" />
        Generate Smart Mind Map
      </button>
    </div>
  );
}

// ─── Node with 2 Actions: Expand & Get Notes ─────────────────
function MindMapNode({ node, depth = 0, onExpand, onGetNotes, expandedNodes, loadingNode }) {
  const isExpanded = expandedNodes.has(node.title);
  const isLoading = loadingNode === node.title;
  const colors = [
    'from-indigo-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-blue-500 to-cyan-600',
    'from-pink-500 to-rose-600',
    'from-amber-500 to-yellow-600',
  ];
  const colorClass = colors[depth % colors.length];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-100 pl-4' : ''}`}>
      <div className={`group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all mb-3 overflow-hidden ${isLoading ? 'animate-pulse' : ''}`}>
        {/* Color accent bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colorClass}`} />
        
        <div className="pl-4 pr-3 py-3">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${depth === 0 ? 'text-lg text-gray-900' : 'text-sm text-gray-800'}`}>
              {node.title}
            </h3>
            
            {/* Action buttons — the 2 key options */}
            <div className="flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
              {/* Option 1: Expand subtopics */}
              <button
                onClick={() => onExpand(node)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors"
                title="Expand into subtopics"
              >
                <FaExpandArrowsAlt className="w-3 h-3" />
                <span>Expand</span>
              </button>
              
              {/* Option 2: Get study notes */}
              <button
                onClick={() => onGetNotes(node)}
                disabled={isLoading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors"
                title="Get study notes & material"
              >
                <HiOutlineDocumentText className="w-3.5 h-3.5" />
                <span>Notes</span>
              </button>
            </div>
          </div>
          
          {node.summary && (
            <p className="text-xs text-gray-500 mt-1">{node.summary}</p>
          )}
        </div>
      </div>

      {/* Children nodes */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child, i) => (
            <MindMapNode
              key={`${child.title}-${i}`}
              node={child}
              depth={depth + 1}
              onExpand={onExpand}
              onGetNotes={onGetNotes}
              expandedNodes={expandedNodes}
              loadingNode={loadingNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notes Panel (slides in from right) ──────────────────────
function NotesPanel({ notes, topic, onClose }) {
  if (!notes) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
        <div>
          <div className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Study Notes</div>
          <h2 className="text-lg font-bold text-gray-900">{topic}</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <HiX className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Key Concepts */}
        {notes.key_concepts && (
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              <HiOutlineLightBulb className="w-5 h-5 text-yellow-500" />
              Key Concepts
            </h3>
            <div className="space-y-2">
              {notes.key_concepts.map((concept, i) => (
                <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <div className="font-semibold text-sm text-gray-800">{concept.title}</div>
                  <p className="text-xs text-gray-600 mt-1">{concept.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Important Points */}
        {notes.important_points && (
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              <HiOutlineAcademicCap className="w-5 h-5 text-indigo-500" />
              Important Points for Exam
            </h3>
            <ul className="space-y-1.5">
              {notes.important_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 font-bold mt-0.5">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* YouTube Resources */}
        {notes.youtube_links && notes.youtube_links.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              🎥 Recommended Videos
            </h3>
            <div className="space-y-2">
              {notes.youtube_links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white flex-shrink-0">▶</div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{link.title}</div>
                    <div className="text-xs text-gray-500">{link.channel || 'YouTube'}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Quick Summary */}
        {notes.summary && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4">
            <h3 className="font-bold text-indigo-800 text-sm mb-2">Quick Summary</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{notes.summary}</p>
          </div>
        )}

        {/* Practice Questions */}
        {notes.practice_questions && (
          <div>
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
              <HiOutlineBookOpen className="w-5 h-5 text-emerald-500" />
              Practice Questions
            </h3>
            <div className="space-y-2">
              {notes.practice_questions.map((q, i) => (
                <div key={i} className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <div className="text-sm font-medium text-gray-800">Q{i + 1}: {q}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Mind Map Page ──────────────────────────────────────
export default function MindMapPage() {
  const [stage, setStage] = useState('setup'); // 'setup' | 'map'
  const [config, setConfig] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [loadingNode, setLoadingNode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notesPanel, setNotesPanel] = useState(null); // { topic, notes }

  const handleStart = async (cfg) => {
    setConfig(cfg);
    setIsGenerating(true);
    setStage('map');

    try {
      const res = await api.post('/api/ai/mindmap', {
        topic: cfg.topic,
        class_level: cfg.classLevel,
        board: cfg.board,
        goal: cfg.goal,
        depth: 2, // Only 2 levels initially — user clicks to go deeper
      });

      const data = res.data?.data;
      if (data) {
        setMapData(data);
        // Auto-expand root children
        const rootSet = new Set();
        rootSet.add(data.title);
        setExpandedNodes(rootSet);
      }
    } catch (err) {
      toast.error('Failed to generate mind map. Try again.');
      setStage('setup');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExpand = async (node) => {
    if (expandedNodes.has(node.title) && node.children?.length > 0) {
      // Already expanded — toggle collapse
      const next = new Set(expandedNodes);
      next.delete(node.title);
      setExpandedNodes(next);
      return;
    }

    // If already has children, just expand
    if (node.children?.length > 0) {
      setExpandedNodes(prev => new Set(prev).add(node.title));
      return;
    }

    // Fetch subtopics from AI (max 2 more levels — NOT infinite)
    setLoadingNode(node.title);
    try {
      const res = await api.post('/api/ai/mindmap', {
        topic: node.title,
        class_level: config?.classLevel,
        board: config?.board,
        goal: config?.goal,
        depth: 1,
        parent_context: config?.topic,
      });

      const data = res.data?.data;
      if (data?.children) {
        // Attach children to this node in the tree
        node.children = data.children;
        setExpandedNodes(prev => new Set(prev).add(node.title));
        setMapData({ ...mapData }); // Force re-render
      }
    } catch (err) {
      toast.error('Could not expand this topic.');
    } finally {
      setLoadingNode(null);
    }
  };

  const handleGetNotes = async (node) => {
    setLoadingNode(node.title);
    try {
      const res = await api.post('/api/ai/mindmap/notes', {
        topic: node.title,
        class_level: config?.classLevel,
        board: config?.board,
        goal: config?.goal,
        parent_context: config?.topic,
      });

      const notes = res.data?.data;
      if (notes) {
        setNotesPanel({ topic: node.title, notes });
      }
    } catch (err) {
      toast.error('Could not load notes. Try again.');
    } finally {
      setLoadingNode(null);
    }
  };

  const handleBack = () => {
    setStage('setup');
    setMapData(null);
    setExpandedNodes(new Set());
    setNotesPanel(null);
    setConfig(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 p-4 sm:p-6">
      {stage === 'setup' && <GoalSetupPanel onStart={handleStart} />}

      {stage === 'map' && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <HiArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config?.topic}</h1>
                <p className="text-sm text-gray-500">
                  {config?.classLevel && `${config.classLevel}`}
                  {config?.board && ` • ${config.board}`}
                  {config?.goal && ` • ${config.goal.replace('_', ' ')}`}
                </p>
              </div>
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium">
              Click any topic → Expand or Get Notes
            </div>
          </div>

          {/* Loading state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-4 animate-bounce">
                <FaBrain className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 font-medium">Generating your smart mind map...</p>
              <p className="text-sm text-gray-400 mt-1">Breaking down {config?.topic} into structured topics</p>
            </div>
          )}

          {/* Mind Map Tree */}
          {mapData && !isGenerating && (
            <div className="max-w-3xl">
              <MindMapNode
                node={mapData}
                depth={0}
                onExpand={handleExpand}
                onGetNotes={handleGetNotes}
                expandedNodes={expandedNodes}
                loadingNode={loadingNode}
              />
            </div>
          )}
        </div>
      )}

      {/* Notes Slide-in Panel */}
      {notesPanel && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setNotesPanel(null)} />
          <NotesPanel
            notes={notesPanel.notes}
            topic={notesPanel.topic}
            onClose={() => setNotesPanel(null)}
          />
        </>
      )}
    </div>
  );
}
