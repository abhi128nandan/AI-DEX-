'use client';

export function Newsletter() {
  return (
    <div className="w-full border-t border-[var(--border-subtle)] bg-[var(--surface-overlay)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Stay up to date with AI
        </h2>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto">
          Get the best new AI tools and resources delivered to your inbox every week. No spam, ever.
        </p>
        <form 
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          onSubmit={(e) => { e.preventDefault(); alert("Newsletter signup not implemented."); }}
        >
          <input 
            type="email" 
            placeholder="Enter your email address" 
            required
            className="flex-1 px-4 py-3 bg-[var(--surface-base)] border border-[var(--border-default)] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors shrink-0"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
