'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api-client';
import toast from 'react-hot-toast';
import { HiOutlinePlay, HiOutlineBookOpen, HiOutlineLightBulb, HiOutlineCheckCircle, HiOutlineClock, HiOutlineStar, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FaYoutube, FaRocket } from 'react-icons/fa';

// ─── YouTube Video Embed ─────────────────────────────────────
function YouTubeEmbed({ videoId, title }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
      <div className="relative pb-[56.25%]">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && (
        <div className="bg-white px-3 py-2 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800 truncate">{title}</p>
        </div>
      )}
    </div>
  );
}

// ─── Step by Step Guide Section ──────────────────────────────
function StepByStepGuide({ steps }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (index) => {
    const next = new Set(completedSteps);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setCompletedSteps(next);
  };

  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div
          key={i}
          onClick={() => toggleStep(i)}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            completedSteps.has(i)
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-gray-100 bg-white hover:border-indigo-200'
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
            completedSteps.has(i)
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-100 text-indigo-700'
          }`}>
            {completedSteps.has(i) ? '✓' : i + 1}
          </div>
          <div className="flex-1">
            <h4 className={`font-semibold text-sm ${completedSteps.has(i) ? 'text-emerald-800 line-through' : 'text-gray-800'}`}>
              {step.title}
            </h4>
            <p className="text-xs text-gray-500 mt-1">{step.description}</p>
            {step.tip && (
              <div className="mt-2 flex items-start gap-1.5 bg-amber-50 rounded-lg p-2">
                <HiOutlineLightBulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-amber-800">{step.tip}</span>
              </div>
            )}
          </div>
        </div>
      ))}
      <div className="text-center">
        <div className="text-sm text-gray-500">
          {completedSteps.size}/{steps.length} steps completed
        </div>
        <div className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Enriched Task Card ─────────────────────────────────
export default function EnrichedTaskCard({ task, profession, level }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resources, setResources] = useState(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [activeTab, setActiveTab] = useState('guide'); // 'guide' | 'videos' | 'notes' | 'examples'

  const loadResources = async () => {
    if (resources) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsExpanded(true);
    setIsLoadingResources(true);

    try {
      const res = await api.post('/api/ai/experience/task-resources', {
        task_title: task.title,
        task_description: task.description,
        profession: profession,
        level: level,
      });

      if (res.data?.data) {
        setResources(res.data.data);
      }
    } catch (err) {
      toast.error('Could not load learning resources.');
    } finally {
      setIsLoadingResources(false);
    }
  };

  const tabs = [
    { id: 'guide', label: 'Step-by-Step', icon: <FaRocket className="w-3.5 h-3.5" /> },
    { id: 'videos', label: 'Videos', icon: <FaYoutube className="w-3.5 h-3.5" /> },
    { id: 'notes', label: 'Notes', icon: <HiOutlineBookOpen className="w-4 h-4" /> },
    { id: 'examples', label: 'Examples', icon: <HiOutlineLightBulb className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Task Header (always visible) */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {task.order || '•'}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <HiOutlineClock className="w-3.5 h-3.5" />
                  {task.duration_minutes || task.time || '20'} min
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                  <HiOutlineStar className="w-3.5 h-3.5" />
                  {task.xp || '10'} XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expand / Learn Button */}
        <button
          onClick={loadResources}
          className={`mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            isExpanded
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-sm'
          }`}
        >
          {isLoadingResources ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Loading learning resources...
            </>
          ) : isExpanded ? (
            <>
              <HiChevronUp className="w-4 h-4" />
              Collapse
            </>
          ) : (
            <>
              <HiOutlinePlay className="w-4 h-4" />
              How to do this task — Learn & Start
            </>
          )}
        </button>
      </div>

      {/* Expanded Content — Resources, Videos, Notes, Guide */}
      {isExpanded && resources && (
        <div className="border-t border-gray-100">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 px-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Step-by-Step Guide */}
            {activeTab === 'guide' && resources.steps && (
              <StepByStepGuide steps={resources.steps} />
            )}

            {/* YouTube Videos */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {resources.youtube_videos?.length > 0 ? (
                  resources.youtube_videos.map((video, i) => (
                    <div key={i}>
                      {video.video_id ? (
                        <YouTubeEmbed videoId={video.video_id} title={video.title} />
                      ) : (
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                            <FaYoutube className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{video.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{video.channel} • {video.duration || 'Watch now'}</div>
                          </div>
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FaYoutube className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No specific videos found. Search YouTube for "{task.title} tutorial"</p>
                  </div>
                )}
              </div>
            )}

            {/* Study Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                {resources.notes && (
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                      <h4 className="font-bold text-indigo-800 mb-2">What You Need to Know</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {resources.notes.content}
                      </div>
                    </div>
                  </div>
                )}
                {resources.notes?.key_terms && (
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Key Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {resources.notes.key_terms.map((term, i) => (
                        <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                          {term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {resources.tools_needed && (
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm mb-2">Tools & Software Needed</h4>
                    <div className="space-y-2">
                      {resources.tools_needed.map((tool, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-800">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.description}</div>
                            {tool.link && (
                              <a href={tool.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline">
                                Get it here →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Examples & Inspiration */}
            {activeTab === 'examples' && (
              <div className="space-y-4">
                {resources.examples?.map((example, i) => (
                  <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4">
                    <h4 className="font-bold text-amber-800 text-sm">{example.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{example.description}</p>
                    {example.image_url && (
                      <img src={example.image_url} alt={example.title} className="mt-3 rounded-lg w-full max-h-48 object-cover" />
                    )}
                  </div>
                ))}
                {resources.pro_tips && (
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                    <h4 className="font-bold text-emerald-800 text-sm mb-2">Pro Tips from Real {profession}s</h4>
                    <ul className="space-y-1.5">
                      {resources.pro_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-emerald-500">💡</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
