import React, { useState } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { CATEGORY_LABELS, CATEGORY_EMOJIS } from '../utils/recipeHelpers';
import { Category, SortOption } from '../types/recipe';
import { cn } from '../utils/cn';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'popular', label: 'Most Cooked' },
  { value: 'favorites', label: 'Favorites First' },
];

const CATEGORIES = ['all', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegan', 'vegetarian', 'soup', 'salad', 'beverage', 'other'] as const;

const SearchBar: React.FC = () => {
  const { filter, setFilter, filteredRecipes, recipes } = useRecipes();
  const [showFilters, setShowFilters] = useState(false);

  const clearSearch = () => setFilter({ search: '' });
  const hasActiveFilters = filter.category !== 'all' || filter.search || filter.favoritesOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
      {/* Search input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, tags…"
            value={filter.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
          {filter.search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
            showFilters || hasActiveFilters
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-400'
              : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing <span className="text-gray-300 font-medium">{filteredRecipes.length}</span> of{' '}
          <span className="text-gray-300 font-medium">{recipes.length}</span> recipes
        </span>
        <div className="flex items-center gap-1">
          <span>Sort:</span>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter({ sortBy: e.target.value as SortOption })}
            className="bg-transparent text-gray-300 text-xs focus:outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-gray-900">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter({ category: cat as Category | 'all' })}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                    filter.category === cat
                      ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  )}
                >
                  {cat !== 'all' && <span className="mr-1">{CATEGORY_EMOJIS[cat as Category]}</span>}
                  {CATEGORY_LABELS[cat as Category | 'all']}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
