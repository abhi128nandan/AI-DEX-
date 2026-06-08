import { 
  PenTool, ImagePlus, Video, Code2, Mic2, Briefcase, 
  SearchCode, TrendingUp, Megaphone, DollarSign, 
  Database, Palette, GraduationCap, Bot, Workflow,
  Building2, Share2, MoreHorizontal, Layers
} from "lucide-react";

export function normalizeName(name: string) {
  return name.toLowerCase().trim();
}

/**
 * Unique Lucide icon per category — no generic fallbacks.
 * Each icon is specifically chosen to represent its domain.
 */
export const CATEGORY_ICONS: Record<string, React.ElementType> = {
  writing: PenTool,
  "image generation": ImagePlus,
  video: Video,
  code: Code2,
  audio: Mic2,
  productivity: Briefcase,
  research: SearchCode,
  seo: TrendingUp,
  marketing: Megaphone,
  finance: DollarSign,
  data: Database,
  design: Palette,
  education: GraduationCap,
  "ai agents": Bot,
  automation: Workflow,
  business: Building2,
  "social media": Share2,
  other: MoreHorizontal,
};

/**
 * Premium gradient colors per category for visual distinction.
 */
export const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string; gradient: string }> = {
  writing: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', gradient: 'from-blue-500 to-cyan-500' },
  "image generation": { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', gradient: 'from-pink-500 to-rose-500' },
  video: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', gradient: 'from-red-500 to-orange-500' },
  code: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-teal-500' },
  audio: { text: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', gradient: 'from-violet-500 to-purple-500' },
  productivity: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-500 to-yellow-500' },
  research: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', gradient: 'from-cyan-500 to-blue-500' },
  seo: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/20', gradient: 'from-lime-500 to-green-500' },
  marketing: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', gradient: 'from-orange-500 to-amber-500' },
  finance: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', gradient: 'from-green-500 to-emerald-500' },
  data: { text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', gradient: 'from-indigo-500 to-blue-500' },
  design: { text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/20', gradient: 'from-fuchsia-500 to-pink-500' },
  education: { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', gradient: 'from-teal-500 to-cyan-500' },
  "ai agents": { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', gradient: 'from-purple-500 to-violet-500' },
  automation: { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', gradient: 'from-sky-500 to-blue-500' },
  business: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', gradient: 'from-slate-500 to-gray-500' },
  "social media": { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', gradient: 'from-rose-500 to-pink-500' },
  other: { text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', gradient: 'from-gray-500 to-slate-500' },
};

/** Fallback icon for unknown categories */
export const DEFAULT_CATEGORY_ICON = Layers;
