import React from 'react';
import { ChefHat, Plus, FlaskConical, LayoutGrid, List, Star } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { cn } from '../utils/cn';

const Header: React.FC = () => {
  const { viewMode, setViewMode, openAddForm, setPantryMixOpen, filter, setFilter } = useRecipes();

  return (
    <header className="sticky top-0 z-40 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">RecipeVault</h1>
            <p className="text-xs text-gray-400 leading-tight hidden sm:block">Your personal cookbook</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Favorites toggle */}
          <button
            onClick={() => setFilter({ favoritesOnly: !filter.favoritesOnly })}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              filter.favoritesOnly
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                : 'bg-gray-800 text-gray-400 hover:text-yellow-400 hover:bg-gray-700'
            )}
            title="Toggle favorites"
          >
            <Star className={cn('w-4 h-4', filter.favoritesOnly ? 'fill-yellow-400' : '')} />
            <span className="hidden sm:inline">Favorites</span>
          </button>

          {/* Pantry Mix */}
          <button
            onClick={() => setPantryMixOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/40 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-all"
            title="Pantry Mix — find recipes from ingredients"
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Pantry Mix</span>
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-gray-800 rounded-lg p-1 gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                viewMode === 'grid' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'
              )}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                viewMode === 'list' ? 'bg-gray-600 text-white' : 'text-gray-500 hover:text-gray-300'
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Recipe */}
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-semibold hover:from-orange-400 hover:to-red-400 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Recipe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
