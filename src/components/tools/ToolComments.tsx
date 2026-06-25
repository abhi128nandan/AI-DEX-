"use client";

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Send, User as UserIcon, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Session } from '@supabase/supabase-js';

interface Comment {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export default function ToolComments({ toolId, initialComments }: { toolId: string, initialComments?: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(!initialComments);
  const [submitting, setSubmitting] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Determine authenticated user natively
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUserId(session?.user?.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUserId(session?.user?.id ?? null);
    });

    if (!initialComments) {
      fetchComments();
    }

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolId, initialComments]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('tool_comments')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error("[Comments] Error:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    
    setSubmitting(true);
    
    // Optimistic UI: Add temporarily
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      user_id: userId,
      author_name: "You", // Will be replaced by real DB name
      content: newComment.trim(),
      created_at: new Date().toISOString()
    };
    
    setComments(prev => [optimisticComment, ...prev]);
    const commentContent = newComment.trim();
    setNewComment("");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const author = user?.email?.split('@')[0] || "Anonymous User";

      const { data, error } = await supabase
        .from('tool_comments')
        .insert({
          tool_id: toolId,
          user_id: userId,
          author_name: author,
          content: commentContent
        })
        .select()
        .single();
        
      if (error) throw error;

      // Replace optimistic comment with actual data from DB
      if (data) {
        setComments(prev => prev.map(c => c.id === tempId ? data : c));
      }
    } catch (err: any) {
      console.error("[Comments] Error:", err.message || err);
      // Revert optimistic addition
      setComments(prev => prev.filter(c => c.id !== tempId));
      setNewComment(commentContent);
      alert("Failed to post comment. Ensure you are authenticated and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    const commentId = commentToDelete;
    
    // Optimistic UI: Remove temporarily
    const commentToRestore = comments.find(c => c.id === commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    setCommentToDelete(null);

    try {
      const { error } = await supabase
        .from('tool_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (err: any) {
      console.error("[Comments] Error:", err.message || err);
      // Revert optimistic deletion
      if (commentToRestore) {
        setComments(prev => {
          const newComments = [...prev, commentToRestore];
          return newComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
      }
      alert("Failed to delete comment.");
    }
  };

  return (
    <div className="mt-12 bg-[#0a0a0f] border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        <h3 className="text-xl font-bold text-white tracking-tight">Community Discussion</h3>
        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-white/5 text-xs text-slate-400 font-semibold border border-white/10">
          {comments.length}
        </span>
      </div>

      {userId ? (
        <form onSubmit={handlePostComment} className="relative mb-10 group">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            placeholder="Share your experience or ask a question about this tool..."
            className="w-full bg-[#12121c] border border-white/10 rounded-xl px-4 py-3 pb-12 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none min-h-[100px] disabled:opacity-50"
            required
            maxLength={1000}
          />
          <div className="absolute bottom-2 right-2">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {submitting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 border border-purple-500/20 bg-purple-500/5 rounded-xl text-center">
            <p className="text-sm text-purple-300/80 mb-3">You must be seamlessly signed in to join the discussion.</p>
            <button 
               onClick={() => document.getElementById('auth-modal-trigger')?.click()}
               className="text-xs font-bold uppercase tracking-wider text-white bg-purple-600/50 hover:bg-purple-600/80 px-4 py-2 rounded-lg transition-colors border border-purple-500/30"
            >
               Sign in natively
            </button>
        </div>
      )}

      {/* Constraints Data Execution Output */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-8 flex justify-center items-center">
             <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-[#12121c] rounded-xl border border-white/5 flex gap-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10 text-white/50">
                 {comment.author_name ? comment.author_name.charAt(0).toUpperCase() : <UserIcon className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-200">{comment.author_name}</span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                        • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {userId === comment.user_id && (
                     <button 
                       onClick={() => setCommentToDelete(comment.id)}
                       title="Delete comment"
                       className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors"
                     >
                       <Trash2 className="w-3.5 h-3.5" />
                     </button>
                  )}
                </div>
                <p className="text-sm text-slate-300/90 whitespace-pre-wrap break-words leading-relaxed">
                  {comment.content}
                </p>
                <div className="sm:hidden mt-2 text-[11px] text-slate-500">
                   {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center flex flex-col items-center">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                 <MessageSquare className="w-5 h-5 text-slate-500" />
             </div>
             <p className="text-slate-400 text-sm">No discussions generated natively. Be the first to launch insights!</p>
          </div>
        )}
      </div>
      {/* Custom Deletion Modal */}
      {commentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12121c] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-white mb-2">Delete Comment</h4>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCommentToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-colors border border-red-500/50 shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


