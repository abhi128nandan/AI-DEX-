"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import RefreshButton from '@/components/ui/RefreshButton';

interface PendingTool {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  tags: string;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminDashboard() {
  const [tools, setTools] = useState<PendingTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false
  });
  const router = useRouter();

  const fetchPendingSubmissions = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tools?page=${page}&limit=50`);
      
      
      // SAFE JSON PARSING: Handle non-JSON responses
      const text = await res.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("[Admin UI] Invalid JSON response:", {
          status: res.status,
          contentType: res.headers.get('content-type'),
          bodyPreview: text.substring(0, 200)
        });
        setError("Server returned invalid response. Check server logs.");
        return;
      }
      
      if (!res.ok) {
        console.error("[Admin UI] API error:", { status: res.status, data });
        
        if (res.status === 403) {
          setError(data.message || "Access denied. You need admin role in your profile.");
          return;
        }
        
        setError(data.message || "Failed to fetch submissions");
        return;
      }
      
      setTools(data.data || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err: any) {
      console.error("[Admin UI] Fetch failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      
      
      // SAFE JSON PARSING: Handle non-JSON responses
      const text = await res.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error(`[Admin UI] Invalid JSON response for ${action}:`, {
          status: res.status,
          bodyPreview: text.substring(0, 200)
        });
        throw new Error("API returned non-JSON response. Server may have crashed.");
      }
      
      if (!res.ok) {
        console.error(`[Admin UI] ${action} failed:`, { status: res.status, data });
        throw new Error(data.message || `Failed to ${action} tool`);
      }

      // Instantly remove processed item from the list iteratively
      setTools(prev => prev.filter(t => t.id !== id));
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1)
      }));
      
    } catch (err: any) {
      console.error(`[Admin UI] ${action} failed:`, err);
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in">
        <ShieldCheck className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-4">{error}</p>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 text-left space-y-4 max-w-lg">
          <h3 className="font-semibold text-white">To grant admin access:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300">
            <li>Ensure you've run <code className="bg-black/40 px-2 py-1 rounded text-purple-400">supabase-production-fixes.sql</code></li>
            <li>Open Supabase SQL Editor</li>
            <li>Run: <code className="bg-black/40 px-2 py-1 rounded text-purple-400 block mt-1">UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';</code></li>
            <li>Refresh this page</li>
          </ol>
          <p className="text-xs text-slate-500 mt-4">
            See <code className="bg-black/40 px-1 py-0.5 rounded">set-admin-role.sql</code> for detailed instructions.
          </p>
        </div>
        <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10"
          >
            Go to Dashboard
          </button>
          <RefreshButton className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors">
            Retry
          </RefreshButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 animate-fade-in relative z-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
             <ShieldCheck className="w-8 h-8 text-cyan-400" />
             Moderation Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Approve or reject community tool submissions securely.</p>
        </div>
        <button 
          onClick={() => fetchPendingSubmissions()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Pagination Info */}
      {pagination.total > 0 && (
        <div className="mb-4 text-sm text-slate-400">
          Showing {tools.length} of {pagination.total} pending submissions
          {pagination.totalPages > 1 && ` (Page ${pagination.page} of ${pagination.totalPages})`}
        </div>
      )}

      <div className="glass-card bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        {loading ? (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                 <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                 <span className="text-slate-400">Verifying Admin Roles...</span>
             </div>
        ) : tools.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 text-center">
                 <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-4" />
                 <h2 className="text-xl font-bold text-white mb-1">Queue Empty</h2>
                 <p className="text-slate-400 text-sm">All pending submissions have been processed.</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="border-b border-white/10 bg-black/40">
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest">Tool Overview</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest hidden md:table-cell">Details</th>
                     <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5 relative z-10">
                   {tools.map(tool => (
                      <tr key={tool.id} className="hover:bg-white/[0.02] transition-colors">
                         <td className="px-6 py-5 align-top">
                            <div className="flex flex-col gap-1">
                               <span className="font-bold text-white tracking-tight text-lg">{tool.name}</span>
                               <a href={tool.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors w-fit">
                                  {tool.url} <ExternalLink className="w-3 h-3" />
                               </a>
                               <div className="text-[11px] text-slate-500 mt-2 font-medium">
                                  Submitted {formatDistanceToNow(new Date(tool.created_at), { addSuffix: true })}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5 align-top hidden md:table-cell">
                            <div className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                   <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/10">{tool.category}</span>
                                   <span className="text-[10px] text-slate-400 px-2 py-0.5 border border-white/5 rounded-md">Tags: {tool.tags || 'none'}</span>
                               </div>
                               <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                                  {tool.description}
                               </p>
                            </div>
                         </td>
                         <td className="px-6 py-5 align-top whitespace-nowrap">
                             <div className="flex flex-col items-end gap-2">
                                 <button 
                                     onClick={() => handleAction(tool.id, 'approve')}
                                     disabled={processingId !== null}
                                     className="w-32 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                     {processingId === tool.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" /> }
                                     Approve
                                 </button>
                                 <button 
                                     onClick={() => handleAction(tool.id, 'reject')}
                                     disabled={processingId !== null}
                                     className="w-32 flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                                  >
                                     <XCircle className="w-4 h-4" />
                                     Reject
                                 </button>
                             </div>
                         </td>
                      </tr>
                   ))}
                 </tbody>
               </table>
            </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => fetchPendingSubmissions(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-slate-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => fetchPendingSubmissions(pagination.page + 1)}
            disabled={!pagination.hasMore || loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
