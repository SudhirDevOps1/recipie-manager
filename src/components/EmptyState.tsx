import React from 'react';
import { BookOpen, Plus, Search } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';

const EmptyState: React.FC = () => {
  const { openAddForm, filter } = useRecipes();
  const hasFilters = filter.search || filter.category !== 'all' || filter.favoritesOnly;

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-400 mb-2">No recipes found</h3>
        <p className="text-sm text-gray-600 max-w-xs">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-3xl flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-orange-500/60" />
        </div>
        <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🍳</div>
      </div>
      <h3 className="text-xl font-bold text-gray-300 mb-2">Your cookbook is empty!</h3>
      <p className="text-sm text-gray-600 max-w-xs mb-6">
        Start building your personal recipe collection. Add your favorite recipes and never lose them again.
      </p>
      <button
        onClick={openAddForm}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:from-orange-400 hover:to-red-400 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" />
        Add Your First Recipe
      </button>
      <div className="mt-8 flex gap-4 text-3xl animate-pulse">
        <span>🥗</span>
        <span>🍝</span>
        <span>🍰</span>
        <span>🥘</span>
        <span>🍜</span>
      </div>
    </div>
  );
};

export default EmptyState;
