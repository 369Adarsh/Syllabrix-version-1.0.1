'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LD_API from '@/lib/api/ld.api';
import toast from 'react-hot-toast';
import {
  Sparkles, BookOpen, Presentation, CheckCircle, Search, Save, History, 
  Send, AlertCircle, Loader2, Plus, Edit3, Trash2, ArrowRight, Shield
} from 'lucide-react';

export default function AIContentStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('orgId');

  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState(null);
  const [modules, setModules] = useState([]);

  // Workflow State: 'setup' -> 'outline' -> 'content' -> 'review'
  const [step, setStep] = useState('setup');
  const [safetyReports, setSafetyReports] = useState({}); // idx -> safety data

  useEffect(() => {
    if (orgId) {
      setLoading(false);
    } else {
      LD_API.getMyOrgs().then(res => {
        if (res.data?.data?.length > 0) {
          router.replace(`/corporate/studio?orgId=${res.data.data[0].id}`);
        } else {
          router.push('/corporate/dashboard');
        }
      }).catch(() => router.push('/corporate/dashboard'));
    }
  }, [orgId, router]);

  const handleGenerateOutline = async () => {
    if (!topic.trim()) return toast.error('Please enter a target skill or topic');
    setIsGenerating(true);
    try {
      // Calling our ld.api backend endpoint which uses Gemini
      const res = await LD_API.generateOutline(orgId, {
        topic,
        audience: targetAudience || 'General employees',
        context: 'Corporate L&D training module'
      });
      
      const generatedOutline = res.data?.data;
      if (!generatedOutline) throw new Error("No outline returned");
      
      setOutline(generatedOutline);
      
      // Convert outline titles into empty module shells
      if (generatedOutline.modules) {
        setModules(generatedOutline.modules.map(m => ({
          title: m.title,
          description: m.description,
          content: '',
          isGenerated: false,
          isGenerating: false
        })));
      }
      
      setStep('outline');
      toast.success('Course outline generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate outline.');
    }
    setIsGenerating(false);
  };

  const generateSingleModule = async (index) => {
    const mod = modules[index];
    
    // Update state to show loading for this specific module
    const newModules = [...modules];
    newModules[index].isGenerating = true;
    setModules(newModules);
    
    try {
      const res = await LD_API.generateModuleContent(orgId, {
        programTitle: outline?.title || topic,
        moduleTitle: mod.title,
        moduleDescription: mod.description,
      });
      
      const content = res.data?.data?.content || 'Content generation failed.';
      
      newModules[index].content = content;
      newModules[index].isGenerated = true;
      
      // Run Safety Check
      try {
        const safetyRes = await LD_API.runSafetyCheck(orgId, content);
        setSafetyReports(prev => ({ ...prev, [index]: safetyRes.data?.data }));
      } catch (safetyError) {
        console.error('Safety check failed', safetyError);
      }

      toast.success(`Generated content for: ${mod.title}`);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to generate: ${mod.title}`);
    }
    
    newModules[index].isGenerating = false;
    setModules(newModules);
  };

  const handleGenerateAllContent = async () => {
    setStep('content');
    // Sequential generation to avoid rate limits
    for (let i = 0; i < modules.length; i++) {
       if (!modules[i].isGenerated) {
           await generateSingleModule(i);
       }
    }
  };

  const handleSubmitForReview = async () => {
    setIsGenerating(true);
    try {
      // 1. Create the Program
      const progRes = await LD_API.createProgram(orgId, {
        title: outline.title || topic,
        description: outline.description || '',
        difficulty: 'intermediate',
        duration_hours: 4,
        program_type: 'course'
      });
      const programId = progRes.data.data.id;

      // 2. Save modules
      const formattedModules = modules.map((m, idx) => ({
        title: m.title,
        module_type: 'concept',
        order_index: idx + 1,
        content: m.content,
        content_format: 'markdown',
        duration_min: 15,
        ai_generated: true
      }));
      await LD_API.saveModules(orgId, programId, formattedModules);

      // 3. Submit for SME Review
      await LD_API.submitForReview(orgId, {
        content_type: 'program',
        content_id: programId,
        reviewer_ids: []  // Auto-assign reviewers or admin will handle
      });
      
      toast.success('Successfully submitted to SME Review Queue!');
      router.push('/corporate/dashboard');
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit for review.');
    }
    setIsGenerating(false);
  };

  if (!orgId || loading) {
    return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── HEADER ─── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/corporate/dashboard" className="text-gray-400 hover:text-gray-600">
              &larr; Dashboard
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Sparkles size={16} className="text-indigo-600" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900">AI Content Studio</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/corporate/studio/reviews" className="text-sm font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-2">
              <History size={16} /> SME Review Queue
            </Link>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full flex gap-8">
        
        {/* ─── PROGRESS SIDEBAR ─── */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">Workflow</h3>
            <div className="space-y-6">
              <div className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === 'setup' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-green-500 text-white'}`}>
                  {step === 'setup' ? '1' : <CheckCircle size={12} />}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${step === 'setup' ? 'text-gray-900' : 'text-gray-500'}`}>Topic & Targeting</p>
                  <p className="text-xs text-gray-400 mt-1">Define goal and audience</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === 'outline' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : (step === 'content' || step === 'review' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}`}>
                   {(step === 'content' || step === 'review') ? <CheckCircle size={12} /> : '2'}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${step === 'outline' ? 'text-gray-900' : 'text-gray-500'}`}>Structure & Outline</p>
                  <p className="text-xs text-gray-400 mt-1">AI generates modules</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === 'content' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : (step === 'review' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400')}`}>
                  {step === 'review' ? <CheckCircle size={12} /> : '3'}
                </div>
                <div>
                  <p className={`font-semibold text-sm ${step === 'content' ? 'text-gray-900' : 'text-gray-500'}`}>Content Expansion</p>
                  <p className="text-xs text-gray-400 mt-1">Drafting module text</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === 'review' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-gray-100 text-gray-400'}`}>
                  4
                </div>
                <div>
                  <p className={`font-semibold text-sm ${step === 'review' ? 'text-gray-900' : 'text-gray-500'}`}>SME Review</p>
                  <p className="text-xs text-gray-400 mt-1">Audit and publish</p>
                </div>
              </div>
            </div>
            
            {(step === 'content' || step === 'review') && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleSubmitForReview} disabled={isGenerating}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl font-bold shadow hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Submit to SME
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── MAIN CANVAS ─── */}
        <div className="flex-1 max-w-3xl">
          
          {step === 'setup' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                 <Sparkles className="text-indigo-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What are we teaching today?</h2>
              <p className="text-gray-500 mb-8">Enter a topic, a specific capability gap you want to solve, or paste an existing SOP. Our AI will structure a complete learning path instantly.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Target Skill / Topic</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., GDPR Compliance for Marketers, Advanced React Hooks, Sales Objection Handling..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Target Audience (Optional)</label>
                  <input 
                    type="text" 
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Junior Developers, B2B Sales Team, All Employees"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 text-gray-900"
                  />
                </div>
                
                <button 
                  onClick={handleGenerateOutline} 
                  disabled={!topic || isGenerating}
                  className="w-full py-4 mt-4 bg-gray-900 text-white rounded-xl font-bold shadow-md hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <><Loader2 size={18} className="animate-spin"/> Generating Curriculum...</> : <><BookOpen size={18} /> Structure Learning Path</>}
                </button>
              </div>
            </div>
          )}

          {(step === 'outline' || step === 'content' || step === 'review') && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Program Overview Card */}
              <div className="bg-indigo-900 rounded-2xl p-8 relative overflow-hidden text-white shadow-lg">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-indigo-800 text-indigo-200 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border border-indigo-700">Draft Program</span>
                    {step === 'outline' && <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border border-amber-500/30 flex items-center gap-1"><AlertCircle size={10}/> Needs Content</span>}
                  </div>
                  <h2 className="text-3xl font-extrabold mb-2">{outline?.title || topic}</h2>
                  <p className="text-indigo-200 font-medium mb-6">{outline?.description || 'A comprehensive training program'}</p>
                  
                  {step === 'outline' && (
                    <button onClick={handleGenerateAllContent} className="px-5 py-2.5 bg-white text-indigo-900 rounded-xl font-bold shadow hover:bg-indigo-50 flex items-center gap-2 text-sm transition-colors">
                      <Sparkles size={16} /> Expand All Modules via AI
                    </button>
                  )}
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-4">
                {modules.map((mod, idx) => (
                  <div key={idx} className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${mod.isGenerated ? 'border-green-200 bg-green-50/10' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${mod.isGenerated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                             {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{mod.title}</h3>
                            <p className="text-gray-500 text-sm mt-1">{mod.description}</p>
                          </div>
                       </div>
                       
                       {/* Module Actions */}
                       {!mod.isGenerated ? (
                          <button onClick={() => generateSingleModule(idx)} disabled={mod.isGenerating} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 disabled:opacity-50 flex gap-2 items-center">
                            {mod.isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12}/>} 
                            Generate
                          </button>
                       ) : (
                          <div className="flex flex-col items-end gap-2">
                             <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded"><CheckCircle size={12} /> Generated</span>
                             <button onClick={() => setStep('review')} className="text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"><Edit3 size={12}/> Edit Source</button>
                          </div>
                       )}
                    </div>
                    
                    {/* Generated Content Preview & Safety */}
                    {mod.isGenerated && mod.content && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 prose prose-sm max-w-none max-h-40 overflow-y-auto">
                          {mod.content.substring(0, 300)}...
                        </div>

                        {/* Governance Panel */}
                        {safetyReports[idx] && (
                          <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${safetyReports[idx].safe ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                <Shield size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                                  Governance Check: {safetyReports[idx].safe ? 'PASSED' : 'FLAGGED'}
                                  {safetyReports[idx].safe ? <CheckCircle size={12} className="text-emerald-500"/> : <AlertCircle size={12} className="text-red-500"/>}
                                </p>
                                <div className="flex gap-3 mt-1">
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Bias: {(safetyReports[idx].bias_score * 100).toFixed(0)}%</span>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">Hallucination: {(safetyReports[idx].hallucination_score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                            </div>
                            {safetyReports[idx].flags?.length > 0 && (
                              <div className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded max-w-[200px] truncate">
                                🚩 {safetyReports[idx].flags[0]}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
