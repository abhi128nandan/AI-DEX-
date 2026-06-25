/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, react/no-unescaped-entities, react-hooks/exhaustive-deps, prefer-const, react-hooks/set-state-in-effect */
"use client";

import { useState, memo } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Tool } from '@/types';
import { resolveLogoUrl, getAvatarGradient } from '@/lib/config/tool-logos';
import { CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_CATEGORY_ICON, normalizeName as normalizeCategory } from '@/lib/config/category-icons';
import VoteButton from './VoteButton';
import SaveButton from './SaveButton';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/use-analytics';

interface ToolCardProps {
  tool: Tool;
  index: number;
  isAuthenticated?: boolean;
  isSaved?: boolean;
}

const getCategoryMeta = (category: string | undefined | null) => {
  if (!category) return { Icon: DEFAULT_CATEGORY_ICON, colors: CATEGORY_COLORS['other'] };
  const normalized = normalizeCategory(category);
  const IconComponent = CATEGORY_ICONS[normalized] || DEFAULT_CATEGORY_ICON;
  const colors = CATEGORY_COLORS[normalized] || CATEGORY_COLORS['other'];
  return { Icon: IconComponent, colors };
};

function ToolCardInner({ tool, index, isAuthenticated = false, isSaved }: ToolCardProps) {
  const [imageError, setImageError] = useState(false);
  const { track } = useAnalytics();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Layered logo fallback
  const finalLogoUrl = resolveLogoUrl(tool.name, tool.logo_url ?? undefined, tool.website_url ?? undefined);
  const avatarGradient = getAvatarGradient(tool.name);
  const { Icon: CategoryIcon, colors: catColors } = getCategoryMeta(tool.category);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't intercept clicks on vote buttons or other interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('[data-interactive]') || target.closest('button')) {
      return;
    }
    
    e.preventDefault();
    track({ event: 'tool_click', tool_id: tool.id, tool_name: tool.name, category: tool.category });
    
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('preview', tool.slug);
    router.push(pathname + '?' + newParams.toString(), { scroll: false });
  };
  
  const finalIsSaved = isSaved !== undefined ? isSaved : ((tool as any).is_saved || false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4 }}
      className="relative group block h-full will-change-transform cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Animated gradient border glow on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-600/40 via-cyan-600/30 to-purple-600/40 rounded-2xl blur-md opacity-0 group-hover:opacity-25 transition-all duration-500 pointer-events-none" />
      
      <div className="relative flex flex-col h-full rounded-2xl bg-[var(--surface-raised)] transition-all duration-300 overflow-hidden border border-white/[0.06] group-hover:border-white/[0.12] shadow-lg shadow-black/30 group-hover:shadow-xl group-hover:shadow-purple-900/10">
        
        {/* Subtle top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px w-2/3 mx-auto bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        


        {/* Card body */}
        <div className="p-5 flex flex-col h-full">
          {/* Header: Logo + Name + Vote */}
          <div className="relative flex justify-between items-start mb-3.5">
            <div className="flex items-center gap-3">
              {/* Logo container with hover scale */}
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/[0.06] shrink-0 overflow-hidden relative transition-transform duration-300 group-hover:scale-105 shadow-md"
                style={!finalLogoUrl || imageError ? {
                  background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`
                } : { background: 'var(--surface-overlay)' }}
              >
                {!imageError && finalLogoUrl ? (
                  <Image 
                    src={finalLogoUrl} 
                    alt={`${tool.name} logo`} 
                    fill
                    sizes="44px"
                    className="object-cover"
                    onError={() => setImageError(true)}
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/90 tracking-wide z-10">
                    {getInitials(tool.name)}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <h3 className="font-bold tracking-tight text-[15px] text-white/90 group-hover:text-white transition-colors flex items-center gap-1.5 line-clamp-1">
                  {tool.name}
                  {tool.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-cyan-400/90 shrink-0" />}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.08em] font-bold ${catColors.text} ${catColors.bg} ${catColors.border} px-1.5 py-0.5 rounded-md border`}>
                    <CategoryIcon className="w-2.5 h-2.5" />
                    {tool.category || 'Uncategorized'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 relative z-20 transition-transform duration-200 group-hover:scale-[1.02]" data-interactive>
              <SaveButton toolId={tool.id} initialIsSaved={finalIsSaved} isAuthenticated={isAuthenticated} />
              <VoteButton toolId={tool.id} initialVotes={tool.votes_count} isAuthenticated={isAuthenticated} />
            </div>
          </div>

          {/* Description */}
          <p className="text-[13px] text-slate-400/90 leading-relaxed line-clamp-2 mb-2 flex-grow relative z-10 font-medium">
            {tool.description || 'No description available'}
          </p>

          {/* Tags */}

          {/* Footer: Tags + Views + Visit Button */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04] relative z-10">
            <div className="flex flex-wrap gap-1">
              {(tool.tags || []).slice(0, 3).map(tag => (
                <button
                  key={tag}
                  data-interactive
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/?search=${encodeURIComponent(tag)}`, { scroll: false });
                  }}
                  className="text-[10px] text-slate-500/80 bg-white/[0.03] hover:bg-purple-500/20 hover:text-purple-300 transition-colors px-1.5 py-0.5 rounded font-medium cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400/80 hover:text-purple-300 transition-all px-2 py-1 rounded-lg bg-purple-500/8 hover:bg-purple-500/15 border border-purple-500/15 hover:border-purple-500/30"
                  data-interactive
                >
                  Visit
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// React.memo to prevent unnecessary re-renders in list views
const ToolCard = memo(ToolCardInner);
export default ToolCard;

