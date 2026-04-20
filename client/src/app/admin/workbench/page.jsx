'use client';
import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api/admin.api';
import {
  Database, Search, Edit3, Save, X, ChevronRight,
  Table, AlertCircle, RefreshCw, ShieldAlert, ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DataWorkbenchPage() {
  const [tables, setTables]           = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [editingId, setEditingId]     = useState(null);
  const [editValues, setEditValues]   = useState({});
  const [search, setSearch]           = useState('');

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
      const { id: _, created_at, updated_at, ...updatePayload } = editValues;
      await adminAPI.updateRecord(selectedTable, id, updatePayload);
      setData(prev => prev.map(r => r.id === id ? { ...r, ...updatePayload } : r));
      setEditingId(null);
      toast.success(`Record #${id} updated in ${selectedTable}`);
    } catch (err) {
      toast.error('Update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const getColumns = () => data.length === 0 ? [] : Object.keys(data[0]);

  return (
    <div className="flex flex-col gap-4 md:h-[calc(100vh-120px)]">
      {/* Restricted access banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 bg-red-50">
        <ShieldAlert size={16} className="text-red-500 shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="text-red-700 text-[10px] font-black uppercase tracking-widest leading-none">
            Restricted — Direct Database Access
          </p>
          <p className="text-red-400 text-[10px] mt-0.5">
            All edits are immediately persisted to the live database and logged in audit records. Super Admin only.
          </p>
        </div>
        <span className="shrink-0 px-2 py-1 rounded bg-red-100 border border-red-300 text-red-700 text-[9px] font-black uppercase tracking-widest">
          LIVE DB
        </span>
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-4 md:gap-5 overflow-hidden min-h-0">
        {/* Table list sidebar */}
        <div className={`w-full md:w-64 flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shrink-0 shadow-sm ${selectedTable ? 'hidden md:flex' : 'flex'} md:flex md:h-full h-64`}>
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Database size={15} className="text-indigo-500" />
              <span className="text-gray-800 font-bold text-sm tracking-tight">All Tables</span>
              <span className="ml-auto text-gray-400 text-[10px] font-mono">{tables.length}</span>
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tables…"
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {tableLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse m-1" />
                ))
              : filteredTables.length === 0
                ? <p className="text-center py-4 text-gray-400 text-xs italic">No tables found</p>
                : filteredTables.map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTable(t)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between group ${
                        selectedTable === t
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Table size={12} className={selectedTable === t ? 'text-indigo-600' : 'text-gray-400'} />
                        <span className="truncate">{t}</span>
                      </div>
                      <ChevronRight size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${selectedTable === t ? 'text-indigo-500 opacity-100' : ''}`} />
                    </button>
                  ))
            }
          </div>
        </div>

        {/* Data grid */}
        <div className={`flex-1 flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm ${!selectedTable ? 'hidden md:flex' : 'flex'} md:flex`}>
          <div className="px-4 md:px-5 py-3 md:py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTable('')}
                className="md:hidden p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-all shrink-0"
              >
                <ArrowLeft size={14} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-900 font-bold text-sm md:text-base tracking-tight uppercase">{selectedTable || '—'}</h2>
                </div>
                <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase mt-0.5">Interactive Row Editor</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[10px] font-mono">{data.length} rows</span>
              <button
                onClick={() => setSelectedTable(selectedTable)}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                title="Refresh"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                <AlertCircle size={12} />
                Edits are permanent
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading table…</p>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <Database size={28} className="text-gray-300" />
                <p className="text-gray-400 text-sm">Table is empty or not accessible.</p>
              </div>
            ) : (
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-200">
                    <th className="px-5 py-3 text-left" />
                    {getColumns().map(col => (
                      <th key={col} className="px-5 py-3 text-left text-gray-400 font-black uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map(row => (
                    <tr key={row.id} className={`group transition-colors ${editingId === row.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-5 py-3 sticky left-0 z-20 bg-white/80 backdrop-blur-md border-r border-gray-100">
                        <div className="flex items-center gap-2">
                          {editingId === row.id ? (
                            <>
                              <button onClick={() => handleSave(row.id)} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-all">
                                <Save size={13} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-all">
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(row)}
                              className="p-1.5 rounded-lg bg-gray-50 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-600 hover:bg-indigo-50 border border-gray-100 transition-all"
                            >
                              <Edit3 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      {getColumns().map(col => (
                        <td key={col} className="px-5 py-3 whitespace-nowrap border-r border-gray-50">
                          {editingId === row.id && col !== 'id' && !['created_at', 'updated_at'].includes(col) ? (
                            <input
                              value={editValues[col] ?? ''}
                              onChange={e => setEditValues({ ...editValues, [col]: e.target.value })}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-800 focus:outline-none focus:border-indigo-400"
                            />
                          ) : (
                            <span className={`font-medium ${
                              col === 'id'
                                ? 'text-indigo-600/70 font-mono text-[10px]'
                                : ['email', 'username'].includes(col)
                                  ? 'text-gray-800'
                                  : 'text-gray-500'
                            }`}>
                              {row[col] === null ? <em className="text-gray-300 italic">null</em> : String(row[col])}
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
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.35); }
      `}</style>
    </div>
  );
}
