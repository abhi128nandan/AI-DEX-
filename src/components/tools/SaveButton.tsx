'use client';

import { useState } from 'react';
import { useSave } from '@/hooks/use-save';
import { Bookmark, Loader2 } from 'lucide-react';

interface SaveButtonProps {
  toolId: string;
  initialIsSaved?: boolean;
  isAuthenticated?: boolean;
}

export default function SaveButton({ toolId, initialIsSaved = false, isAuthenticated = false }: SaveButtonProps) {
  const { isSaved, loading, error, handleSave } = useSave(toolId, initialIsSaved);
  const [localError, setLocalError] = useState<string | null>(null);

  const onSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setLocalError("Please sign in to save tools");
      return;
    }
    
    setLocalError(null);
    handleSave(e);
  };

  const displayError = localError || error;

  return (
    <div className="flex flex-col gap-1 relative">
      <button 
        onClick={onSaveClick}
        title={isSaved ? "Remove from saved" : "Save tool"}
        aria-label={isSaved ? 'Remove from saved tools' : 'Save this tool'}
        aria-pressed={isSaved}
        suppressHydrationWarning
        className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all shadow-sm
          ${isSaved 
            ? 'border-purple-500/50 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
            : 'border-white/10 bg-[#12121c] text-slate-400 hover:text-white hover:bg-white/5'}
        `}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-purple-400' : ''}`} aria-hidden={true} />
      </button>
      {displayError && (
        <div className="absolute top-full mt-1 right-0 w-max max-w-[150px] text-[10px] text-white bg-red-500/90 shadow-lg px-2 py-1 rounded z-50 pointer-events-none">
          {displayError}
        </div>
      )}
    </div>
  );
}

