'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowUpDown } from 'lucide-react';
import ToolCard from './ToolCard';
import { Tool } from '@/types';
// import { CATEGORY_COUNTS } from '@/lib/config/tool-categories';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, normalizeName as normalizeCategory } from '@/lib/config/category-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

interface ToolsExplorerProps {
  tools: Tool[];
  isAuthenticated?: boolean;
  savedToolIds?: string[];
}

const SORT_OPTIONS = [
  { value: 'votes', label: 'Most Voted', icon: '🔥' },
  { value: 'views', label: 'Most Viewed', icon: '👁️' },
  { value: 'newest', label: 'Newest First', icon: '✨' },
];

export default function ToolsExplorer({ tools, isAuthenticated = false, savedToolIds = [] }: ToolsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get initial values from URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'votes');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Sync URL changes back to state (e.g., from tag clicks)
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== debouncedSearch) {
      setSearchQuery(urlSearch);
      setDebouncedSearch(urlSearch);
    }
  }, [searchParams, debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'votes') params.set('sort', sortBy);

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : '/';
    
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, selectedCategory, sortBy, router]);

  const categoryCounts = useMemo(() => {
    return tools.reduce((acc, tool) => {
      if (tool.category) {
        acc[tool.category] = (acc[tool.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [tools]);

  const activeCategories = useMemo(() => {
    return Object.keys(categoryCounts).sort();
  }, [categoryCounts]);

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    let result = [...tools];

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(tool => tool.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return (b.votes_count || 0) - (a.votes_count || 0);
        case 'views':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tools, debouncedSearch, selectedCategory, sortBy]);

  const getCategoryIcon = (category: string) => {
    const IconComponent = CATEGORY_ICONS[normalizeCategory(category)];
    return IconComponent || DEFAULT_CATEGORY_ICON;
  };

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-5">
        {/* Premium Search Bar */}
        <div className="relative group">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            <input
              type="text"
              placeholder="Search AI tools by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[var(--surface-overlay)] border border-[var(--border-default)] hover:border-[var(--border-hover)] focus:border-[var(--border-active)] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--border-active)] transition-all text-sm font-medium shadow-sm"
              id="tool-search-input"
            />
          </div>
        </div>

        {/* Discovery Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mt-6 bg-[var(--surface-overlay)] p-4 rounded-xl border border-[var(--border-subtle)]">
          
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">
              <span className="text-purple-400 mr-1.5">{filteredAndSortedTools.length}</span>
              {filteredAndSortedTools.length === 1 ? 'tool' : 'tools'} found
            </h2>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Category Filter */}
            <div className="w-full sm:w-[180px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category-filter" className="bg-[var(--surface-base)] border-[var(--border-default)]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {activeCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div className="w-full sm:w-[160px]">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger icon={<ArrowUpDown className="w-4 h-4" />} id="sort-filter" className="bg-[var(--surface-base)] border-[var(--border-default)]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span className="text-sm">{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(debouncedSearch || selectedCategory !== 'all') && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-500">Active filters:</span>
            {debouncedSearch && (
              <button 
                onClick={() => setSearchQuery('')}
                className="group/tag inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg text-[12px] text-purple-300 font-medium hover:bg-purple-500/20 transition-all"
              >
                Search: &ldquo;{debouncedSearch}&rdquo;
                <span className="text-purple-500/50 group-hover/tag:text-purple-300 transition-colors">×</span>
              </button>
            )}
            {selectedCategory !== 'all' && (
              <button 
                onClick={() => setSelectedCategory('all')}
                className="group/tag inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[12px] text-cyan-300 font-medium hover:bg-cyan-500/20 transition-all"
              >
                {selectedCategory}
                <span className="text-cyan-500/50 group-hover/tag:text-cyan-300 transition-colors">×</span>
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-[11px] text-slate-500 hover:text-white transition-colors font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div>

        {filteredAndSortedTools.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-6">
              <Search className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tools found</h3>
            <p className="text-slate-500 mb-8 text-sm max-w-md mx-auto">
              Try adjusting your search or filters to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-colors text-sm shadow-lg shadow-purple-500/20"
              id="clear-filters-btn"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedTools.map((tool, index) => (
              <ToolCard key={tool.id} tool={tool} index={index} isAuthenticated={isAuthenticated} isSaved={savedToolIds.includes(tool.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

