"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ExternalLink, BadgeCheck, Eye, ChevronRight,
  CheckCircle2, Zap, Globe, Tag
} from 'lucide-react';
import { Tool } from '@/types';
import { resolveLogoUrl, getAvatarGradient } from '@/lib/config/tool-logos';
import { CATEGORY_ICONS, normalizeName as normalizeCategory } from '@/lib/config/category-icons';
import { useAnalytics } from '@/hooks/use-analytics';
import VoteButton from './VoteButton';
import SaveButton from './SaveButton';

// ═══════════════════════════════════════════
// Scroll Memory — persists per tool across open/close cycles
// ═══════════════════════════════════════════
const scrollMemory = new Map<string, number>();

// ═══════════════════════════════════════════
// Skeleton Loading Component
// ═══════════════════════════════════════════
function ModalSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 skeleton" />
          <div className="h-4 w-24 skeleton" />
        </div>
      </div>
      {/* Description skeleton */}
      <div className="space-y-2 pt-4">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-5/6 skeleton" />
        <div className="h-4 w-4/6 skeleton" />
      </div>
      {/* Features skeleton */}
      <div className="space-y-2 pt-4">
        <div className="h-5 w-28 skeleton" />
        <div className="h-10 w-full skeleton" />
        <div className="h-10 w-full skeleton" />
        <div className="h-10 w-full skeleton" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Modal Component
// ═══════════════════════════════════════════
interface ToolDetailModalProps {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ToolDetailModal({ tool, isOpen, onClose }: ToolDetailModalProps) {
  const { track } = useAnalytics();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Progressive rendering: stagger content reveal
  const [showDescription, setShowDescription] = useState(false);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  // Logo resolution
  const logoUrl = tool ? resolveLogoUrl(tool.name, tool.logo_url ?? undefined, tool.website_url ?? undefined) : null;
  const avatarGradient = tool ? getAvatarGradient(tool.name) : { from: '#7c3aed', to: '#06b6d4' };

  // Category icon
  const CategoryIcon = tool ? (CATEGORY_ICONS[normalizeCategory(tool.category)] || Tag) : Tag;

  // ── Lock body scroll when modal open ──
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  // ── Track modal open ──
  useEffect(() => {
    if (isOpen && tool) {
      track({ event: 'modal_open', tool_id: tool.id, tool_name: tool.name, category: tool.category });
    }
  }, [isOpen, tool, track]);

  // ── Progressive rendering ──
  useEffect(() => {
    if (isOpen && tool) {
      setContentReady(true);
      setShowDescription(true);
    }
  }, [isOpen, tool]);

  // ── Scroll memory: restore on open ──
  useEffect(() => {
    if (isOpen && tool && scrollRef.current && contentReady) {
      const saved = scrollMemory.get(tool.id);
      if (saved) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo({ top: saved, behavior: 'instant' });
        });
      }
    }
  }, [isOpen, tool, contentReady]);

  // ── Save scroll position on scroll ──
  const handleScroll = useCallback(() => {
    if (tool && scrollRef.current) {
      scrollMemory.set(tool.id, scrollRef.current.scrollTop);
    }
  }, [tool]);

  // ── Escape key handler ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleCtaClick = () => {
    if (tool) {
      track({ event: 'cta_click', tool_id: tool.id, tool_name: tool.name });
    }
  };

  const handleClose = () => {
    if (tool) {
      track({ event: 'modal_close', tool_id: tool.id, tool_name: tool.name });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && tool && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* ── Side Panel ── */}
          <motion.div
            initial={{ x: '100%', opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.9 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] z-[110] bg-[#0a0a10] border-l border-white/[0.06] flex flex-col shadow-[-8px_0_40px_rgba(0,0,0,0.5)]"
          >
            {/* ── Header (fixed) ── */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                {/* Logo */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden relative"
                  style={!logoUrl || imageError ? { 
                    background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})` 
                  } : { background: '#12121c' }}
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
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                aria-label="Close panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Scrollable Content ── */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              {!contentReady ? (
                <ModalSkeleton />
              ) : (
                <div className="p-6 space-y-6">
                  {/* ── Hero Card ── */}
                  <div className="progressive-item progressive-delay-1">
                    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.06] overflow-hidden">
                      {/* Decorative glow */}
                      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />
                      
                      <div className="relative flex items-start gap-5">
                        {/* Large Logo */}
                        <div
                          className="w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 shrink-0 overflow-hidden relative shadow-xl"
                          style={!logoUrl || imageError ? {
                            background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`
                          } : { background: '#12121c' }}
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

                  {/* ── Description ── */}
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
                        {tool.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Tags Section */}
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
                      {(tool.tags || []).map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.04] text-slate-400 font-medium hover:bg-white/[0.08] hover:text-slate-200 transition-colors cursor-default"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>

            {/* ── Footer (fixed) ── */}
            <div className="shrink-0 px-6 py-4 border-t border-white/[0.06] flex items-center gap-3 bg-[#0a0a10]">
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
                onClick={handleClose}
                className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/10 text-slate-300 hover:text-white font-semibold transition-all text-sm"
              >
                Full Page
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

