"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpandableText({ text, limit = 200 }: { text: string, limit?: number }) {
  const [expanded, setExpanded] = useState(false);
  
  if (text.length <= limit) {
    return <p className="text-slate-300 leading-relaxed text-[15px]">{text}</p>;
  }

  return (
    <div className="relative">
      <AnimatePresence initial={false}>
        <motion.div
           key="content"
           initial={false}
           animate={{ height: expanded ? 'auto' : '100px' }}
           className="overflow-hidden relative"
        >
          <p className="text-slate-300 leading-relaxed text-[15px] whitespace-pre-wrap">{text}</p>
          
          {!expanded && (
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
          )}
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
      >
        {expanded ? "Read Less" : "Read More"}
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </div>
  );
}
