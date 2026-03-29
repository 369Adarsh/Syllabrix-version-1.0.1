'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { storiesAPI } from '@/lib/api/stories.api';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

const StoryViewer = dynamic(() => import('./StoryViewer'), { ssr: false });
const StoryUploadModal = dynamic(() => import('./StoryUploadModal'), { ssr: false });

export default function StoriesBar() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStart, setViewerStart] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchStories = () => {
    storiesAPI.getFeed()
      .then(r => setGroups(r.data?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStories(); }, []);

  const openViewer = (idx) => {
    setViewerStart(idx);
    setViewerOpen(true);
  };

  const handleStoryCreated = () => {
    fetchStories();
  };

  const handleDelete = (deletedStoryId) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      stories: g.stories.filter(s => s.id !== deletedStoryId),
    })).filter(g => g.stories.length > 0));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {[0,1,2,3,4].map(i => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 animate-pulse">
              <div className="w-14 h-14 rounded-full bg-gray-200" />
              <div className="h-2 w-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] border border-gray-200/60 p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {/* Add your story */}
          <button
            onClick={() => setUploadOpen(true)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 group-hover:bg-blue-100 transition-colors">
              {user?.profile?.profile_photo_url ? (
                <Image
                  src={user.profile.profile_photo_url}
                  alt=""
                  fill
                  className="rounded-full object-cover opacity-60"
                />
              ) : null}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center">
                <Plus size={10} className="text-white" strokeWidth={3} />
              </div>
              {!user?.profile?.profile_photo_url && (
                <Plus size={20} className="text-blue-400 relative z-10" />
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-medium text-center w-14 truncate">Your story</span>
          </button>

          {/* Story groups */}
          {groups.map((group, idx) => {
            const hasUnviewed = group.has_unviewed;
            return (
              <button
                key={group.user_id}
                onClick={() => openViewer(idx)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div className={`w-14 h-14 rounded-full p-[2px] ${
                  hasUnviewed
                    ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'
                    : 'bg-gray-300'
                }`}>
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-100">
                    {group.profile_photo_url ? (
                      <Image
                        src={group.profile_photo_url}
                        alt={group.username}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[16px]">
                        {group.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-gray-600 font-medium text-center w-14 truncate">
                  {group.full_name?.split(' ')[0] || group.username}
                </span>
              </button>
            );
          })}

          {groups.length === 0 && (
            <p className="text-[12px] text-gray-400 self-center ml-2">No stories yet. Be the first!</p>
          )}
        </div>
      </div>

      {viewerOpen && (
        <StoryViewer
          groups={groups}
          initialGroupIndex={viewerStart}
          onClose={() => setViewerOpen(false)}
          onDelete={handleDelete}
        />
      )}

      {uploadOpen && (
        <StoryUploadModal
          onClose={() => setUploadOpen(false)}
          onCreated={handleStoryCreated}
        />
      )}
    </>
  );
}
