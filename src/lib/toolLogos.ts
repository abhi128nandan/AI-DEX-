/**
 * Layered Logo Fallback System
 * Priority: TOOL_LOGOS dict → /public/logos/ → Clearbit → Generated Avatar
 * 
 * This is the FAANG approach: don't rely on a single source.
 */

export function normalizeName(name: string) {
  return name.toLowerCase().trim();
}

// Curated high-quality logo URLs for all tools
export const TOOL_LOGOS: Record<string, string> = {
  // Writing
  "chatgpt": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "gemini": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Google_Gemini_logo.svg",
  "claude": "https://cdn.brandfetch.io/id2S-kXbuq/w/512/h/512/theme/dark/icon.jpeg",
  "grammarly": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Grammarly_logo.svg",
  "jasper ai": "https://cdn.brandfetch.io/idFw-Kel5n/w/400/h/400/theme/dark/icon.jpeg",
  "copy.ai": "https://cdn.brandfetch.io/idjFz3069s/w/400/h/400/theme/dark/icon.jpeg",
  "writesonic": "https://cdn.brandfetch.io/idyVhMExkv/w/400/h/400/theme/dark/icon.jpeg",

  // Image Generation
  "midjourney": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png",
  "dall·e 3": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "stable diffusion": "https://cdn.brandfetch.io/idchmWkZVV/w/400/h/400/theme/dark/icon.jpeg",
  "leonardo ai": "https://cdn.brandfetch.io/idpKX9e1qN/w/400/h/400/theme/dark/icon.jpeg",
  "ideogram": "https://cdn.brandfetch.io/idmrZ5R1oD/w/400/h/400/theme/dark/icon.jpeg",
  "photoroom": "https://cdn.brandfetch.io/id8S1_3Bzu/w/400/h/400/theme/dark/icon.jpeg",

  // Video
  "sora": "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
  "runway gen-3": "https://cdn.brandfetch.io/idJ56wOkab/w/400/h/400/theme/dark/icon.jpeg",
  "luma dream machine": "https://cdn.brandfetch.io/id2mdU8J_D/w/400/h/400/theme/dark/icon.jpeg",
  "heygen": "https://cdn.brandfetch.io/idh_VnW7zE/w/400/h/400/theme/dark/icon.jpeg",
  "descript": "https://cdn.brandfetch.io/iddrYfnOJi/w/400/h/400/theme/dark/icon.jpeg",
  "pika": "https://cdn.brandfetch.io/idS7WYNhlm/w/400/h/400/theme/dark/icon.jpeg",

  // Code
  "cursor": "https://cdn.brandfetch.io/idHMwVqxUR/w/400/h/400/theme/dark/icon.jpeg",
  "vercel v0": "https://cdn.brandfetch.io/idCq4P2a6v/w/400/h/400/theme/dark/icon.jpeg",
  "github copilot": "https://cdn.brandfetch.io/idZAyF9rlg/w/400/h/400/theme/dark/icon.jpeg",
  "replit ai": "https://cdn.brandfetch.io/idT2EB2GeY/w/400/h/400/theme/dark/icon.jpeg",
  "bolt.new": "https://cdn.brandfetch.io/idawB0Z6_b/w/400/h/400/theme/dark/icon.jpeg",

  // Audio
  "elevenlabs": "https://cdn.brandfetch.io/idup3oDxQo/w/400/h/400/theme/dark/icon.jpeg",
  "suno": "https://cdn.brandfetch.io/id2j0KbTcl/w/400/h/400/theme/dark/icon.jpeg",
  "murf ai": "https://cdn.brandfetch.io/idGX3NXIBC/w/400/h/400/theme/dark/icon.jpeg",
  "udio": "https://cdn.brandfetch.io/iddp_7vaHL/w/400/h/400/theme/dark/icon.jpeg",

  // Productivity
  "notion ai": "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  "gamma": "https://cdn.brandfetch.io/idj-_uL_cS/w/400/h/400/theme/dark/icon.jpeg",
  "otter.ai": "https://cdn.brandfetch.io/id4i6bBecV/w/400/h/400/theme/dark/icon.jpeg",
  "mem": "https://cdn.brandfetch.io/idLrcCx70u/w/400/h/400/theme/dark/icon.jpeg",
  "reclaim ai": "https://cdn.brandfetch.io/id-sWP1O_8/w/400/h/400/theme/dark/icon.jpeg",
  "zapier ai": "https://cdn.brandfetch.io/idPVwAdnL8/w/400/h/400/theme/dark/icon.jpeg",
  "tome": "https://cdn.brandfetch.io/idxFc_a4cN/w/400/h/400/theme/dark/icon.jpeg",

  // Research
  "perplexity ai": "https://cdn.brandfetch.io/idf8O73y9l/theme/dark/symbol.svg",
  "elicit": "https://cdn.brandfetch.io/id8b3ECWQY/w/400/h/400/theme/dark/icon.jpeg",
  "consensus": "https://cdn.brandfetch.io/idGIPlZvqq/w/400/h/400/theme/dark/icon.jpeg",

  // Design
  "figma ai": "https://cdn.brandfetch.io/idZHcZ_i7R/w/400/h/400/theme/dark/icon.jpeg",
  "canva ai": "https://cdn.brandfetch.io/idJOR_txi-/w/400/h/400/theme/dark/icon.jpeg",
  "looka": "https://cdn.brandfetch.io/idlWb4Vpoo/w/400/h/400/theme/dark/icon.jpeg",

  // SEO
  "surfer seo": "https://cdn.brandfetch.io/idpmKz-a9p/w/400/h/400/theme/dark/icon.jpeg",
  "semrush ai": "https://cdn.brandfetch.io/idqAwT8FBf/w/400/h/400/theme/dark/icon.jpeg",

  // Marketing
  "adcreative ai": "https://cdn.brandfetch.io/idz80Svz0l/w/400/h/400/theme/dark/icon.jpeg",
  "synthesia": "https://cdn.brandfetch.io/idnbIUWMX0/w/400/h/400/theme/dark/icon.jpeg",

  // Data
  "julius ai": "https://cdn.brandfetch.io/idPHT4CYQF/w/400/h/400/theme/dark/icon.jpeg",
  "obviously ai": "https://cdn.brandfetch.io/idmGVqPHwZ/w/400/h/400/theme/dark/icon.jpeg",

  // Education
  "khanmigo": "https://cdn.brandfetch.io/idDNc0e4cw/w/400/h/400/theme/dark/icon.jpeg",
  "quizlet ai": "https://cdn.brandfetch.io/iddA7kUqy5/w/400/h/400/theme/dark/icon.jpeg",
  "duolingo max": "https://cdn.brandfetch.io/idbL82eJbO/w/400/h/400/theme/dark/icon.jpeg",
};

/**
 * Layered logo resolver — FAANG-grade fallback chain.
 * 1. Curated TOOL_LOGOS dictionary (highest quality)
 * 2. Tool's own logo_url from DB
 * 3. Clearbit logo API (domain-based)
 * 4. null (caller renders generated avatar)
 */
export function resolveLogoUrl(
  name: string,
  logoUrl?: string,
  websiteUrl?: string
): string | null {
  // Layer 1: Curated dictionary
  const curated = TOOL_LOGOS[normalizeName(name)];
  if (curated) return curated;

  // Layer 2: Tool's own logo_url
  if (logoUrl) return logoUrl;

  // Layer 3: Clearbit from domain
  if (websiteUrl) {
    const domain = websiteUrl
      .replace("https://", "")
      .replace("http://", "")
      .replace("www.", "")
      .split("/")[0];
    if (domain) return `https://logo.clearbit.com/${domain}`;
  }

  // Layer 4: Return null — caller renders generated avatar
  return null;
}

/**
 * Generate a deterministic gradient for avatar fallback.
 * Uses the tool name to produce consistent colors.
 */
export function getAvatarGradient(name: string): { from: string; to: string } {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    { from: '#7c3aed', to: '#06b6d4' }, // purple → cyan
    { from: '#ec4899', to: '#8b5cf6' }, // pink → violet
    { from: '#f59e0b', to: '#ef4444' }, // amber → red
    { from: '#10b981', to: '#3b82f6' }, // emerald → blue
    { from: '#6366f1', to: '#a855f7' }, // indigo → purple
    { from: '#14b8a6', to: '#8b5cf6' }, // teal → violet
    { from: '#f97316', to: '#ec4899' }, // orange → pink
    { from: '#06b6d4', to: '#22d3ee' }, // cyan → lighter cyan
  ];
  return gradients[hash % gradients.length];
}
