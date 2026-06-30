import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Eye, Share2, BadgeCheck } from 'lucide-react';
import { resolveLogoUrl } from '@/lib/config/tool-logos';
import VoteButton from '@/components/tools/VoteButton';

import ExpandableText from '@/components/tools/ExpandableText';
import ToolComments from '@/components/tools/ToolComments';
import ClientFallbackImage from '@/components/ui/ClientFallbackImage';
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@supabase/supabase-js';
import { TOOL_SELECT, validateTools, isValidTool } from '@/lib/database/schema';


/**
 * Dynamic SEO metadata per tool page.
 * 
 * WHY this matters:
 * - Google uses title + description for search result snippets
 * - OpenGraph tags control how links appear on Twitter, LinkedIn, Slack
 * - Canonical URLs prevent duplicate content penalties
 * - Without this, every tool page shows the same generic title
 * 
 * WHY generateMetadata over static metadata:
 * - Each tool has unique name, description, category
 * - Next.js calls this at build time for static pages and at request time for dynamic ones
 * - The function has access to route params, so we can query the specific tool
 */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: tool } = await supabase
    .from('tools')
    .select('name, description, category, tags, logo_url, website_url')
    .eq('slug', slug)
    .single();
  
  if (!tool) {
    return { title: 'Tool Not Found — AIDex' };
  }

  const title = `${tool.name} — AI ${tool.category} Tool | AIDex`;
  const description = tool.description?.slice(0, 160) || 
    `Discover ${tool.name}, an AI-powered ${tool.category.toLowerCase()} tool. Compare features, read reviews, and find alternatives on AIDex.`;

  return {
    title,
    description,
    keywords: [tool.name, tool.category, 'AI tools', ...(tool.tags || [])],
    openGraph: {
      title,
      description,
      url: `https://aidex.dev/tool/${slug}`,
      siteName: 'AIDex',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.name} | AIDex`,
      description,
    },
    alternates: {
      canonical: `https://aidex.dev/tool/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  // Use anon client for static generation (no cookies needed)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: tools } = await supabase
    .from('tools')
    .select('slug');
  
  return tools?.map((tool) => ({
    slug: tool.slug,
  })) || [];
}

import { Suspense } from 'react';

function ToolPageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-pulse pt-6 relative z-20">
      <div className="w-32 h-4 bg-white/5 rounded"></div>
      
      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 bg-[#0a0a0f] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          <div className="w-32 h-32 rounded-2xl bg-white/5 border border-white/10 shrink-0"></div>
          <div className="flex-1 space-y-5 w-full">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                   <div className="w-48 h-10 bg-white/5 rounded-lg"></div>
                   <div className="flex flex-wrap items-center gap-3 mt-4">
                      <div className="w-20 h-6 bg-white/5 rounded-full"></div>
                      <div className="w-24 h-6 bg-white/5 rounded-md"></div>
                   </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                   <div className="w-20 h-10 bg-white/5 rounded-xl"></div>
                   <div className="w-10 h-10 bg-white/5 rounded-xl"></div>
                </div>
             </div>
             <div className="pt-4 border-t border-white/5">
                <div className="w-40 h-12 bg-white/5 rounded-xl"></div>
             </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
           <div className="space-y-5">
              <div className="w-32 h-8 bg-white/5 rounded-lg"></div>
              <div className="h-40 bg-white/5 rounded-2xl border border-white/10"></div>
           </div>
           <div className="space-y-4">
              <div className="w-40 h-6 bg-white/5 rounded-lg"></div>
              <div className="flex gap-2">
                 <div className="w-16 h-8 bg-white/5 rounded-xl"></div>
                 <div className="w-20 h-8 bg-white/5 rounded-xl"></div>
                 <div className="w-24 h-8 bg-white/5 rounded-xl"></div>
              </div>
           </div>
        </div>
        <div className="space-y-8">
           <div className="h-64 rounded-2xl border border-white/5 bg-[#12121c]/30"></div>
        </div>
      </div>
    </div>
  );
}

export default function ToolPage(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ToolPageSkeleton />}>
      <ToolPageContent params={props.params} />
    </Suspense>
  );
}

async function ToolPageContent(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  
  const supabase = await createClient();
  const { data: tool, error } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .eq('slug', params.slug)
    .single();

  if (error || !tool || !isValidTool(tool)) {
    notFound();
  }

  // Find related tools (same category, excluding current)
  const { data: relatedTools } = await supabase
    .from('tools')
    .select(TOOL_SELECT)
    .eq('category', tool.category)
    .neq('id', tool.id)
    .order('votes_count', { ascending: false })
    .limit(3);
  
  const relatedToolsList = validateTools(relatedTools || []);

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();
  const finalLogoUrl = resolveLogoUrl(tool.name, tool.logo_url ?? undefined, tool.website_url ?? undefined);

  // Use description from database with fallback
  const descriptionPayload = tool.description || 'No description available.';

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in relative z-20">
      <div className="pt-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
      </div>

      <div className="glass-card rounded-3xl p-8 md:p-12 border border-white/5 bg-[#0a0a0f] shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#1c1c28] to-[#12121c] flex items-center justify-center border border-white/10 shrink-0 shadow-xl overflow-hidden p-2 relative">
             {finalLogoUrl ? (
                <ClientFallbackImage 
                   src={finalLogoUrl} 
                   alt={`${tool.name} logo`}
                   fallbackInitials={getInitials(tool.name)}
                   className="object-contain rounded-xl p-2"
                />
             ) : (
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-cyan-400">
                  {getInitials(tool.name)}
                </span>
             )}
          </div>

          <div className="flex-1 space-y-5 w-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div>
                <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  {tool.name}
                  {tool.is_verified && <BadgeCheck className="w-6 h-6 text-cyan-400" />}
                </h1>
                
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="text-xs uppercase tracking-widest font-semibold text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    {tool.category}
                  </span>

                  <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md ml-auto sm:ml-0">
                    <Eye className="w-4 h-4" /> {(tool.views_count / 1000).toFixed(1)}k views
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <VoteButton toolId={tool.id} initialVotes={tool.votes_count} />
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-4">
              {tool.website_url && (
                <a 
                  href={tool.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all active:scale-[0.98]"
                >
                  Visit Website <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          
          <section className="space-y-5">
            <h2 className="text-2xl font-bold tracking-tight text-white">About {tool.name}</h2>
            <div className="bg-[#12121c]/60 p-6 md:p-8 rounded-2xl border border-white/10 shadow-lg">
                <div className="text-slate-300/90 text-[15px] md:text-base leading-relaxed md:leading-loose space-y-4 font-medium">
                  <ExpandableText text={descriptionPayload} limit={300} />
                </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-200">Tags & Taxonomy</h2>
            <div className="flex flex-wrap gap-2">
              {(tool.tags ?? []).map((tag: string) => (
                <Link 
                  key={tag} 
                  href={`/tags/${tag.toLowerCase()}`}
                  className="px-4 py-2 rounded-xl bg-[#12121c] border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 text-sm font-medium transition-all"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
          
          <Suspense fallback={<CommentsSkeleton />}>
            <CommentsSection toolId={tool.id} />
          </Suspense>

        </div>

        <div className="space-y-8">
          <div className="p-6 rounded-2xl border border-white/5 bg-[#12121c]/30">
             <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6 font-mono">Similar Tools</h3>
             {relatedToolsList.length > 0 ? (
               <div className="flex flex-col gap-3">
                 {relatedToolsList.map(t => {
                   const initials = t.name.substring(0, 2).toUpperCase();
                   const logoUrl = resolveLogoUrl(t.name, t.logo_url ?? undefined, t.website_url ?? undefined);
                   return (
                     <Link key={t.id} href={`/tool/${t.slug}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                       <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 overflow-hidden relative shadow-sm" style={{ background: '#111119' }}>
                         {logoUrl ? (
                           <ClientFallbackImage src={logoUrl} alt={t.name} fallbackInitials={initials} className="object-contain" />
                         ) : (
                           <span className="text-xs font-bold text-white/90">{initials}</span>
                         )}
                       </div>
                       <div className="flex flex-col min-w-0">
                         <h4 className="font-semibold text-white/90 group-hover:text-white truncate text-sm flex items-center gap-1.5">
                           {t.name}
                           {t.is_verified && <BadgeCheck className="w-3 h-3 text-cyan-400" />}
                         </h4>
                         <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider truncate">
                           {t.category}
                         </span>
                       </div>
                     </Link>
                   );
                 })}
               </div>
             ) : (
               <p className="text-sm text-slate-500 italic pb-2">No related tools found.</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

async function CommentsSection({ toolId }: { toolId: string }) {
  const supabase = await createClient();
  const { data: commentsRes } = await supabase
    .from('tool_comments')
    .select('*')
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false });

  return <ToolComments toolId={toolId} initialComments={commentsRes || []} />;
}

function CommentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pt-6 border-t border-white/5">
      <div className="w-48 h-8 bg-white/5 rounded-lg mb-6"></div>
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-24 bg-white/5 rounded-xl border border-white/10"></div>
          <div className="flex justify-end">
            <div className="w-24 h-10 bg-white/5 rounded-xl"></div>
          </div>
        </div>
      </div>
      <div className="space-y-6 mt-8">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#12121c]/40 p-5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-white/5 shrink-0"></div>
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/5 rounded"></div>
                <div className="w-24 h-3 bg-white/5 rounded"></div>
              </div>
            </div>
            <div className="pl-11 space-y-2">
              <div className="w-full h-4 bg-white/5 rounded"></div>
              <div className="w-4/5 h-4 bg-white/5 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
