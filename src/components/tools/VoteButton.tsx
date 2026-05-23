'use client';

import { useState } from 'react';
import { useVote } from '@/hooks/useVote';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface VoteButtonProps {
  toolId: string;
  initialVotes: number;
  initialDownvotes?: number;
  isAuthenticated?: boolean;
}

export default function VoteButton({ toolId, initialVotes, initialDownvotes = 0, isAuthenticated = false }: VoteButtonProps) {
  const { upvotes, downvotes, userVote, loading, error, handleVote } = useVote(
    toolId,
    initialVotes,
    initialDownvotes
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const onVoteClick = (e: React.MouseEvent, type: 'up' | 'down') => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      setLocalError("Please sign in to vote");
      setTimeout(() => setLocalError(null), 3000);
      return;
    }
    handleVote(e, type);
  };

  return (
    <div className="flex flex-col gap-1 relative">
      <div 
        suppressHydrationWarning
        className={`flex items-center gap-0.5 border rounded-lg overflow-hidden transition-all shadow-sm ${
          userVote === 'up' ? 'border-purple-500/50 bg-purple-500/10' : 
          userVote === 'down' ? 'border-rose-500/50 bg-rose-500/10' : 
          'border-white/10 bg-[#12121c]'
      }`}>
        <button 
          onClick={(e) => onVoteClick(e, 'up')}
          title={userVote === 'up' ? "Remove upvote" : "Upvote"}
          suppressHydrationWarning
          className={`flex items-center gap-1 px-2.5 py-1.5 text-sm font-semibold transition-colors relative
            ${userVote === 'up' ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20' : 'text-slate-300 hover:text-purple-400 hover:bg-white/5'}
          `}
        >
          <ArrowUp className={`w-3.5 h-3.5 ${userVote === 'up' ? 'text-purple-400' : ''}`} />
          {upvotes.toLocaleString()}
        </button>

        <div className={`w-px h-5 ${userVote === 'up' ? 'bg-purple-500/30' : userVote === 'down' ? 'bg-rose-500/30' : 'bg-white/10'}`} />

        <button 
          onClick={(e) => onVoteClick(e, 'down')}
          title={userVote === 'down' ? "Remove downvote" : "Downvote"}
          suppressHydrationWarning
          className={`flex items-center px-2 py-1.5 text-sm font-semibold transition-colors
            ${userVote === 'down' ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/20' : 'text-slate-500 hover:text-rose-400 hover:bg-white/5'}
          `}
        >
          <ArrowDown className={`w-3.5 h-3.5 ${userVote === 'down' ? 'text-rose-400' : ''}`} />
        </button>
      </div>
      {(error || localError) && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 w-max max-w-[150px] text-[10px] text-white bg-red-500/90 shadow-lg px-2 py-1 rounded z-50 pointer-events-none">
          {error || localError}
        </div>
      )}
    </div>
  );
}
