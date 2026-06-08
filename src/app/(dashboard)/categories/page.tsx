import { CATEGORIES, CATEGORY_COUNTS } from '@/lib/config/tool-categories';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { CATEGORY_ICONS, CATEGORY_COLORS, DEFAULT_CATEGORY_ICON, normalizeName as normalizeCategory } from '@/lib/config/category-icons';

export default async function CategoriesPage() {
  // CRITICAL: Fetch tools from database to get accurate counts
  const supabase = await createClient();
  const { data: tools } = await supabase
    .from('tools')
    .select('category');
  
  const toolsList = tools || [];
  
  // Only show categories that have tools
  const activeCategories = CATEGORIES.filter(cat => {
    const dbCount = toolsList.filter(t => t.category === cat).length;
    return dbCount > 0 || (CATEGORY_COUNTS[cat] || 0) > 0;
  });

  return (
    <div className="space-y-12 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center space-y-4 pt-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500 tracking-tight">
          Browse by Category
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-[15px]">
          Explore our curated directory of the best AI tools across every category.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {activeCategories.map(category => {
          const dbCount = toolsList.filter(t => t.category === category).length;
          const count = dbCount || CATEGORY_COUNTS[category] || 0;
          const normalized = normalizeCategory(category);
          const IconComponent = CATEGORY_ICONS[normalized] || DEFAULT_CATEGORY_ICON;
          const colors = CATEGORY_COLORS[normalized] || CATEGORY_COLORS['other'];
          
          return (
            <Link 
              key={category} 
              href={`/categories/${category.toLowerCase().replace(/ /g, '-')}`}
              className="group glass-card p-6 flex flex-col items-center justify-center gap-3 rounded-2xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`${colors.bg} ${colors.border} border p-3 rounded-xl transition-all duration-200 group-hover:scale-110`}>
                <IconComponent className={`w-6 h-6 ${colors.text}`} />
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-white text-[14px]">{category}</h3>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">{count} tool{count !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
