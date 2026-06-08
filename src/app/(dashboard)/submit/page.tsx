"use client";

import { useState, FormEvent } from 'react';
import { Sparkles, Send, CheckCircle, Loader2, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { CATEGORIES } from '@/lib/config/tool-categories';
import { getSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    name: '',
    website_url: '',
    description: '',
    category: '',
    tags: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      
      // Strict Anti-Spam Check: Verify authentic session exists
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("You must be signed in to submit a tool.");
        setLoading(false);
        return;
      }

      // Execute payload explicitly natively bypassing static routing
      const { error: insertError } = await supabase
        .from('tool_submissions')
        .insert({
          name: formData.name,
          website_url: formData.website_url,
          description: formData.description,
          category: formData.category,
          tags: formData.tags,
          user_id: session.user.id
        });

      if (insertError) {
        throw insertError;
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("[Submit UI] Submission payload rejected:", err);
      setError(err.message || "Failed to submit. Are you sure you're logged in?");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30 mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Tool Submitted</h1>
        <p className="text-lg text-slate-400 max-w-md mb-8 leading-relaxed">
          Thanks for contributing. We review every submission and will notify you when it&apos;s approved, usually within 48 hours.
        </p>
        <div className="flex gap-4">
            <Link 
              href="/"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all shadow-lg"
            >
              Return Home
            </Link>
            <button 
              onClick={() => {
                setIsSubmitted(false);
                setFormData({ name: '', website_url: '', description: '', category: '', tags: '' });
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/20"
            >
              Submit Another
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex justify-center items-center bg-purple-500/20 p-3 rounded-full mb-4 shadow-lg shadow-purple-500/20">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Submit an AI Tool</h1>
        <p className="text-slate-400">Join the discovery engine. Add a unique tool to the global registry.</p>
      </div>

      <div className="glass-card p-8 rounded-2xl relative overflow-hidden backdrop-blur-2xl border border-white/10">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
              Tool Name <span className="text-red-400">*</span>
            </label>
            <input 
              type="text" 
              id="name" 
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g. ChatGPT API" 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="website_url">
              Website URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="url" 
                id="website_url" 
                value={formData.website_url}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="https://..." 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="description">
              Short Description <span className="text-red-400">*</span>
            </label>
            <textarea 
              id="description" 
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
              rows={3}
              maxLength={150}
              placeholder="What does this AI tool do in exactly one or two sentences?" 
              className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none disabled:opacity-50"
            />
            <p className={`text-xs mt-1.5 text-right ${formData.description.length >= 150 ? 'text-red-400' : 'text-slate-500'}`}>
              {formData.description.length}/150 characters
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="category">
                Category <span className="text-red-400">*</span>
              </label>
              <select 
                id="category" 
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all appearance-none disabled:opacity-50"
              >
                <option value="" disabled>Select category...</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="tags">
                Tags
              </label>
              <input 
                type="text" 
                id="tags" 
                value={formData.tags}
                onChange={handleChange}
                disabled={loading}
                placeholder="Comma separated (e.g. llm, writing)" 
                className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Tool for Verification
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center mt-4">
              All submissions are reviewed before going live.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
