'use client';

import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, normalizeName } from '@/lib/config/category-icons';
import { Section } from '@/components/ui/Section';
import Link from 'next/link';

interface CategoryCount {
  name: string;
  count: number;
}

interface CategoryBrowseProps {
  categories: CategoryCount[];
}

export function CategoryBrowse({ categories }: CategoryBrowseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <Section 
      title="Browse by Category" 
      description="Explore curated AI tools categorized by their primary use case."
      className="bg-[var(--surface-overlay)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[normalizeName(category.name)] || DEFAULT_CATEGORY_ICON;
          
          return (
            <Link 
              key={category.name}
              href={`/?category=${encodeURIComponent(category.name)}#directory`}
              className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--surface-base)] border border-[var(--border-default)] hover:border-[var(--border-hover)] hover:bg-white/[0.04] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--surface-overlay)] border border-[var(--border-subtle)] shrink-0 text-slate-400 group-hover:text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-white truncate text-base group-hover:text-purple-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {category.count} {category.count === 1 ? 'tool' : 'tools'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
