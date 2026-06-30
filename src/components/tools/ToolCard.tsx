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
      className="relative block h-full cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="card relative flex flex-col h-full overflow-hidden">
        
        {/* Cover Image (Placeholder/Fallback) */}
        <div 
          className="w-full h-36 relative overflow-hidden shrink-0 border-b border-[var(--border-subtle)]"
          style={!finalLogoUrl || imageError ? {
            background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`
          } : {
            background: `linear-gradient(135deg, ${catColors.bg.replace('bg-', '')}, var(--surface-overlay))`
          }}
        >
          {/* Simulated Cover Image - In the future, this would use tool.screenshot_url */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-[2px]">
             {!imageError && finalLogoUrl && (
               <Image 
                 src={finalLogoUrl} 
                 alt="cover blur" 
                 fill
                 className="object-cover scale-150"
                 loading="lazy"
                 unoptimized
               />
             )}
          </div>
          {/* Logo overlay on cover */}
          <div className="absolute -bottom-6 left-6 z-20">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-[var(--surface-base)] bg-[var(--surface-overlay)] shrink-0 overflow-hidden relative shadow-md"
              style={!finalLogoUrl || imageError ? {
                background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`
              } : {}}
            >
              {!imageError && finalLogoUrl ? (
                <Image 
                  src={finalLogoUrl} 
                  alt={`${tool.name} logo`} 
                  fill
                  sizes="56px"
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
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 pt-8 flex flex-col h-full">
          {/* Header: Name + Verified + Category */}
          <div className="relative flex justify-between items-start mb-3">
            <div className="flex flex-col gap-1.5 min-w-0">
                <h3 className="font-semibold tracking-tight text-base text-white transition-colors flex items-center gap-1.5 line-clamp-1">
                  {tool.name}
                  {tool.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-cyan-400/90 shrink-0" />}
                </h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${catColors.text} ${catColors.bg} ${catColors.border} px-2 py-0.5 rounded-full border`}>
                    <CategoryIcon className="w-2.5 h-2.5" />
                    {tool.category || 'Uncategorized'}
                  </span>
                </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-4 flex-grow relative z-10 mt-1">
            {tool.description || 'No description available'}
          </p>

          {/* Tags */}

          {/* Footer: Tags + Views + Visit Button */}
          <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-[var(--border-subtle)] relative z-10">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 relative z-20" data-interactive>
                <VoteButton toolId={tool.id} initialVotes={tool.votes_count} isAuthenticated={isAuthenticated} />
                <SaveButton toolId={tool.id} initialIsSaved={finalIsSaved} isAuthenticated={isAuthenticated} />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {tool.website_url && (
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[var(--border-default)] hover:border-[var(--border-hover)]"
                    data-interactive
                  >
                    Visit
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
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

