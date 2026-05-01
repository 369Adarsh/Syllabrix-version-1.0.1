'use client';
import { useState, useEffect, Suspense } from 'react';
import { useJee } from '../layout';
import { BookOpen, Library, Sparkles } from 'lucide-react';
import SyllabusPage from '../syllabus/page';
import TextbookPage from '../textbook/page';
import BooksPage from '../books/page';

const K_SUBTAB = 'syl_study_subtab';

export default function StudyPage() {
  const { examType } = useJee();
  const isNeet = examType === 'neet';

  const [activeTab, setActiveTabState] = useState('syllabus');

  useEffect(() => {
    const saved = localStorage.getItem(K_SUBTAB) || 'syllabus';
    const valid = isNeet
      ? ['syllabus', 'textbook']
      : ['syllabus', 'textbook', 'books'];
    setActiveTabState(valid.includes(saved) ? saved : 'syllabus');
  }, [isNeet]);

  const setActiveTab = (id) => {
    localStorage.setItem(K_SUBTAB, id);
    setActiveTabState(id);
  };

  const accentActive = isNeet ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white';

  const SUBTABS = [
    { id: 'syllabus',  label: 'Syllabus',   icon: BookOpen  },
    { id: 'textbook',  label: 'Textbook',   icon: Library   },
    ...(!isNeet ? [{ id: 'books', label: 'Ref Books', icon: Sparkles }] : []),
  ];

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex gap-1 mb-5 bg-white rounded-xl border border-gray-100 p-1 w-fit overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {SUBTABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                active ? accentActive + ' shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'syllabus' && (
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array(8).fill(0).map((_, i) => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-gray-100" />)}
            </div>
          }>
            <SyllabusPage />
          </Suspense>
        )}
        {activeTab === 'textbook' && <TextbookPage />}
        {activeTab === 'books'    && <BooksPage />}
      </div>
    </div>
  );
}
