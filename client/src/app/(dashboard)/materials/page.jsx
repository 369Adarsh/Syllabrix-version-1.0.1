'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

import { materialsAPI } from '@/lib/api/materials.api';
import Link from 'next/link';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';

export default function Page() {
  const { user } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { materialsAPI.list().then(r => setData(r.data?.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/materials" className="p-2 rounded-lg hover:bg-gray-100 transition-colors"><ArrowLeft size={16} className="text-gray-500" /></Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-sm"><FileText size={20} className="text-white" /></div>
        <div><h1 className="font-bold text-lg text-gray-800">Course Materials</h1><p className="text-[11px] text-gray-400">Browse and download study materials shared by teachers.</p></div>
      </div>

      {loading ? <div className="text-center py-16"><Loader2 size={28} className="animate-spin text-cyan-500 mx-auto" /></div>
      : !Array.isArray(data) || data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mx-auto mb-4"><FileText size={28} className="text-cyan-400" /></div>
          <h2 className="font-bold text-gray-700 mb-2">Nothing Here Yet</h2>
          <p className="text-sm text-gray-400">Browse and download study materials shared by teachers.</p>
        </div>
      ) : (
        <div className="space-y-2">{(Array.isArray(data) ? data : [data]).map((item, i) => (
          <div key={item.id || i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-semibold text-gray-800">{item.name || item.title || item.username || `Item #${item.id || i}`}</p>
            <p className="text-[11px] text-gray-400 mt-1">{item.description || item.bio || item.subject || ''}</p>
          </div>
        ))}</div>
      )}
    </div>
  );
}
