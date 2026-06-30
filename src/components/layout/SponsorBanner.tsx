import React from 'react';

interface SponsorData {
  title: string;
  description: string;
  ctaText: string;
  url: string;
  logoUrl?: string;
}

interface SponsorBannerProps {
  sponsor?: SponsorData | null;
}

export function SponsorBanner({ sponsor }: SponsorBannerProps) {
  if (!sponsor) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-r from-purple-900/40 to-cyan-900/20 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-purple-500/5">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-purple-500/20 text-purple-300 text-[10px] uppercase font-bold tracking-wider rounded-md mb-3 border border-purple-500/30">
            Sponsored Partner
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {sponsor.title}
          </h3>
          <p className="text-slate-300 text-sm max-w-xl">
            {sponsor.description}
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full md:w-auto text-center px-8 py-3.5 bg-white text-black font-semibold rounded-xl hover:bg-slate-200 transition-colors shadow-md"
          >
            {sponsor.ctaText}
          </a>
        </div>
      </div>
    </div>
  );
}
