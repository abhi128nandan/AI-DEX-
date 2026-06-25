"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, BadgeCheck, Eye, ChevronRight,
  Globe, Tag
} from 'lucide-react';
import { Tool } from '@/types';
import { resolveLogoUrl, getAvatarGradient } from '@/lib/config/tool-logos';
import { CATEGORY_ICONS, normalizeName as normalizeCategory } from '@/lib/config/category-icons';
import { useAnalytics } from '@/hooks/use-analytics';
import { getSupabaseClient } from '@/lib/supabase/client';
import { TOOL_SELECT } from '@/lib/database/schema';
import VoteButton from './VoteButton';
import SaveButton from './SaveButton';
import ToolComments from './ToolComments';

// ═══════════════════════════════════════════
// Scroll Memory — persists per tool across open/close cycles
// ═══════════════════════════════════════════
const scrollMemory = new Map<string, number>();

async function fetchToolBySlug(slug: string): Promise<Tool | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('tools')
      .select(TOOL_SELECT)
      .eq('slug', slug)
      .single();
    
    if (error || !data) return null;
    
    return { ...data, tags: data.tags ?? [] } as Tool;
  } catch (error) {
    console.error("Failed to load tool details:", error);
    return null;
  }
}

// ═══════════════════════════════════════════
// Skeleton Loading Component
// ═══════════════════════════════════════════
function ModalSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[var(--surface-raised)]">
      {/* Header Skeleton */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-6 w-32 skeleton rounded-lg" />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body Skeleton */}
      <div className="flex-1 p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-40 skeleton" />
            <div className="h-4 w-24 skeleton" />
          </div>
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
          <div className="h-4 w-4/6 skeleton" />
        </div>
        <div className="space-y-2 pt-4">
          <div className="h-5 w-28 skeleton" />
          <div className="h-10 w-full skeleton" />
          <div className="h-10 w-full skeleton" />
          <div className="h-10 w-full skeleton" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Resolved Content Component
// ═══════════════════════════════════════════
function ResolvedPanelContent({ 
  previewSlug, 
  onClose 
}: { 
  previewSlug: string;
  onClose: () => void;
}) {
  const { track } = useAnalytics();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadTool() {
      try {
        const fetchedTool = await fetchToolBySlug(previewSlug);
        if (isMounted) {
          setTool(fetchedTool);
        }
      } catch (err) {
        console.error("Failed to fetch tool:", err);
        if (isMounted) {
          setTool(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadTool();

    return () => {
      isMounted = false;
    };
  }, [previewSlug]);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  const logoUrl = tool ? resolveLogoUrl(tool.name, tool.logo_url ?? undefined, tool.website_url ?? undefined) : null;
  const avatarGradient = tool ? getAvatarGradient(tool.name) : { from: '#7c3aed', to: '#06b6d4' };
  const CategoryIcon = tool ? (CATEGORY_ICONS[normalizeCategory(tool.category)] || Tag) : Tag;

  // Track open
  useEffect(() => {
    if (tool) {
      track({ event: 'tool_open', tool_id: tool.id, tool_name: tool.name, category: tool.category });
    }
  }, [tool, track]);

  // Progressive rendering
  useEffect(() => {
    if (tool) {
      setShowDescription(true);
    }
  }, [tool]);

  // Scroll memory
  useEffect(() => {
    if (tool && scrollRef.current) {
      const saved = scrollMemory.get(tool.id);
      if (saved) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: saved, behavior: 'instant' });
        });
      }
    }
  }, [tool]);

  const handleScroll = useCallback(() => {
    if (tool && scrollRef.current) {
      scrollMemory.set(tool.id, scrollRef.current.scrollTop);
    }
  }, [tool]);

  const handleCtaClick = () => {
    if (tool) {
      track({ event: 'cta_click', tool_id: tool.id, tool_name: tool.name });
    }
  };

  if (loading) {
    return <ModalSkeleton onClose={onClose} />;
  }

  if (!tool) {
    return (
      <div className="flex flex-col h-full bg-[var(--surface-raised)]">
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="h-6 w-32" />
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mb-4 text-2xl font-bold">!</div>
          <h3 className="text-xl font-bold text-white mb-2">Failed to load tool details</h3>
          <p className="text-sm">The tool could not be found or an error occurred.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-raised)]">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden relative"
            style={!logoUrl || imageError ? { 
              background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})` 
            } : { background: 'var(--surface-overlay)' }}
          >
            {logoUrl && !imageError ? (
              <Image
                src={logoUrl}
                alt={`${tool.name} logo`}
                fill
                sizes="40px"
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <span className="text-sm font-bold text-white/90">
                {getInitials(tool.name)}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white truncate flex items-center gap-1.5">
              {tool.name}
              {tool.is_verified && <BadgeCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
            </h2>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-purple-400/80">
              {tool.category}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="p-6 space-y-6">
          <div className="progressive-item progressive-delay-1">
            <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />
              
              <div className="relative flex items-start gap-5">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden relative shadow-xl"
                  style={!logoUrl || imageError ? {
                    background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`
                  } : { background: 'var(--surface-overlay)' }}
                >
                  {logoUrl && !imageError ? (
                    <Image
                      src={logoUrl}
                      alt={`${tool.name} logo`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      onError={() => setImageError(true)}
                      unoptimized
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white/90">
                      {getInitials(tool.name)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-3">
                  <h3 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    {tool.name}
                    {tool.is_verified && <BadgeCheck className="w-5 h-5 text-cyan-400 shrink-0" />}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-semibold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                      <CategoryIcon className="w-3 h-3" />
                      {tool.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Eye className="w-3 h-3" />
                      {(tool.views_count / 1000).toFixed(1)}k views
                    </span>
                  </div>

                  <div className="relative z-20 flex items-center gap-2">
                    <SaveButton toolId={tool.id} initialIsSaved={(tool as any).is_saved || false} />
                    <VoteButton toolId={tool.id} initialVotes={tool.votes_count} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showDescription && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> About
              </h4>
              <p className="text-[15px] text-slate-300 leading-relaxed">
                {tool.description || 'No description available'}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(tool.tags ?? []).map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => {
                    onClose();
                    router.push(`/?search=${encodeURIComponent(tag)}`, { scroll: false });
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-400 font-medium hover:bg-white/[0.08] hover:text-slate-200 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Comments Section Decoupled with its own Suspense */}
          <div className="pt-4 border-t border-white/[0.06]">
            <Suspense fallback={<div className="h-32 animate-pulse bg-white/5 rounded-2xl w-full" />}>
              <ToolComments toolId={tool.id} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] flex items-center gap-3 bg-[var(--surface-raised)]">
        {tool.website_url && (
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] text-sm"
          >
            Visit Website
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <Link
          href={`/tools/${tool.slug}`}
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 text-slate-300 hover:text-white font-semibold transition-all text-sm"
        >
          Full Page
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Panel Wrapper
// ═══════════════════════════════════════════
export default function ToolDetailPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const previewSlug = searchParams.get('preview');

  const handleClose = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('preview');
    router.push(pathname + (newParams.toString() ? `?${newParams.toString()}` : ''), { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (previewSlug) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [previewSlug]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewSlug) handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [previewSlug, handleClose]);

  return (
    <AnimatePresence>
      {previewSlug && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] z-[110] bg-[var(--surface-raised)] border-l border-white/[0.06] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.5)]"
          >
            <ResolvedPanelContent previewSlug={previewSlug} onClose={handleClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

