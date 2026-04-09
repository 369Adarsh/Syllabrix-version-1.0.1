'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import { Database, Search, Edit3, Save, X, ChevronRight, Table, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [search, setSearch] = useState('');

  // Fetch all tables on load
  useEffect(() => {
    adminAPI.getTables()
      .then(res => {
        const list = res.data.sort();
        setTables(list);
        if (list.length > 0) setSelectedTable(list.find(t => t === 'users') || list[0]);
      })
      .catch(() => toast.error('Failed to discover system tables'))
      .finally(() => setTableLoading(false));
  }, []);

  // Fetch table data when selection changes
  useEffect(() => {
    if (!selectedTable) return;
    setLoading(true);
    setEditingId(null);
    adminAPI.getTableData(selectedTable)
      .then(res => setData(res.data.data || []))
      .catch(() => toast.error(`Failed to read table: ${selectedTable}`))
      .finally(() => setLoading(false));
  }, [selectedTable]);

  const filteredTables = tables.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (row) => {
    setEditingId(row.id);
    setEditValues({ ...row });
  };

  const handleSave = async (id) => {
    try {
      // Remove id and sensitive/automated fields from update payload
      const { id: _, created_at, updated_at, ...updatePayload } = editValues;
      await adminAPI.updateRecord(selectedTable, id, updatePayload);
      
      setData(prev => prev.map(r => r.id === id ? { ...r, ...updatePayload } : r));
      setEditingId(null);
      toast.success(`Record #${id} updated in ${selectedTable}`);
    } catch (err) {
      toast.error('Update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const getColumns = () => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 antialiased">
      {/* Sidebar: Table List */}
      <div className="w-64 flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Database size={16} className="text-violet-400" />
            <span className="text-white/80 font-bold text-sm tracking-tight">System Discovery</span>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tables..."
              className="w-full pl-8 pr-3 py-1.5 bg-white/[0.04] border border-white/[0.08] rounded-lg text-xs text-white/70 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {tableLoading ? (
            Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-8 bg-white/[0.03] rounded-lg animate-pulse m-1" />)
          ) : filteredTables.length === 0 ? (
            <p className="text-center py-4 text-white/20 text-xs italic">No tables found</p>
          ) : (
            filteredTables.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTable(t)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                  selectedTable === t 
                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                    : 'text-white/40 hover:bg-white/[0.05] hover:text-white/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table size={12} className={selectedTable === t ? 'text-violet-400' : 'text-white/20'} />
                  <span className="truncate">{t}</span>
                </div>
                <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedTable === t ? 'text-violet-400 opacity-100' : ''}`} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main: Table Explorer */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-lg tracking-tight uppercase">{selectedTable || 'No Table Selected'}</h2>
              <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-black tracking-widest border border-violet-500/20">LIVE DB</span>
            </div>
            <p className="text-white/30 text-[10px] font-medium tracking-wide mt-0.5 uppercase">Direct interactive workbench access</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedTable(selectedTable)}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-violet-400 hover:border-violet-500/30 transition-all"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500/70 text-[10px] font-bold">
              <AlertCircle size={14} />
              CAUTION: EDITS ARE PERSISTED
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
              <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
              <p className="text-xs font-bold tracking-widest uppercase animate-pulse">Syncing Intelligence...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-white/10">
                <Database size={24} />
              </div>
              <p className="text-white/25 text-sm font-medium">Table is empty or not accessible.</p>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead className="sticky top-0 bg-[#0A0A0F] z-10">
                <tr className="border-b border-white/[0.1]">
                  <th className="px-5 py-3 text-left"></th>
                  {getColumns().map(col => (
                    <th key={col} className="px-5 py-3 text-left text-white/30 font-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {data.map(row => (
                  <tr key={row.id} className={`group transition-colors ${editingId === row.id ? 'bg-violet-500/[0.07]' : 'hover:bg-white/[0.02]'}`}>
                    <td className="px-5 py-3 sticky left-0 z-20 bg-[#0A0A0F]/50 backdrop-blur-md border-r border-white/5">
                      <div className="flex items-center gap-2">
                        {editingId === row.id ? (
                          <>
                            <button onClick={() => handleSave(row.id)} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30">
                              <Save size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleEdit(row)}
                            className="p-1.5 rounded-lg bg-white/[0.04] text-white/20 opacity-0 group-hover:opacity-100 hover:text-violet-400 hover:bg-violet-500/10 border border-white/5 transition-all"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    {getColumns().map(col => (
                      <td key={col} className="px-5 py-3 whitespace-nowrap border-r border-white/[0.02]">
                        {editingId === row.id && col !== 'id' && !['created_at', 'updated_at'].includes(col) ? (
                          <input
                            value={editValues[col] ?? ''}
                            onChange={e => setEditValues({ ...editValues, [col]: e.target.value })}
                            className="w-full bg-white/[0.07] border border-white/10 rounded px-2 py-1 text-white/90 focus:outline-none focus:border-violet-500/50"
                          />
                        ) : (
                          <span className={`font-medium ${
                            col === 'id' ? 'text-violet-400/80 font-mono text-[10px]' : 
                            ['email', 'username'].includes(col) ? 'text-white/80' : 'text-white/40'
                          }`}>
                            {row[col] === null ? <em className="text-white/10 italic">null</em> : String(row[col])}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(124, 58, 237, 0.3); }
      `}</style>
    </div>
  );
}
