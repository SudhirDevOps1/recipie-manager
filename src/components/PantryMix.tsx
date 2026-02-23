import React, { useState } from 'react';
import { X, Plus, Trash2, FlaskConical, ChefHat, AlertCircle, Sparkles } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { findMatchingRecipes, getIngredientEmoji, CATEGORY_EMOJIS } from '../utils/recipeHelpers';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';

const PantryMix: React.FC = () => {
  const { recipes, pantry, addPantryItem, removePantryItem, setPantryMixOpen, selectRecipe } = useRecipes();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState('');

  const toggle = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    addPantryItem(trimmed);
    setNewItem('');
    toast.success(`"${trimmed}" added to pantry!`);
  };

  const handleRemove = (id: string) => {
    removePantryItem(id);
  };

  const selectedList = Array.from(selected);
  const matches = findMatchingRecipes(recipes, selectedList);
  const exactMatches = matches.filter((m) => m.matchScore === 1);
  const closeMatches = matches.filter((m) => m.matchScore < 1 && m.matchScore >= 0.4);

  const handleSelectRecipe = (id: string) => {
    const r = recipes.find((rr) => rr.id === id);
    if (r) {
      selectRecipe(r);
      setPantryMixOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl my-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-600/20 rounded-lg border border-purple-500/30">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pantry Mix</h2>
              <p className="text-xs text-gray-500">Select ingredients → find matching recipes</p>
            </div>
          </div>
          <button
            onClick={() => setPantryMixOpen(false)}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add pantry item */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              My Pantry
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add pantry ingredient (e.g. spinach)…"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all flex items-center gap-1.5 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {pantry.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <ChefHat className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Your pantry is empty. Add some ingredients above.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {pantry.map((item) => {
                  const isSelected = selected.has(item.name);
                  return (
                    <div key={item.id} className="flex items-center gap-1">
                      <button
                        onClick={() => toggle(item.name)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-purple-500/10 shadow-md'
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                        )}
                      >
                        <span>{getIngredientEmoji(item.name)}</span>
                        {item.name}
                        {isSelected && <span className="text-purple-400">✓</span>}
                      </button>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors"
                        title="Remove from pantry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected ingredients info */}
          {selected.size > 0 && (
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <p className="text-sm font-medium text-purple-300">
                  Looking for recipes with: {selectedList.join(', ')}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Found <strong className="text-white">{exactMatches.length}</strong> exact matches and{' '}
                <strong className="text-white">{closeMatches.length}</strong> close matches.
              </p>
            </div>
          )}

          {/* Results */}
          {selected.size > 0 && matches.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No matching recipes found.</p>
              <p className="text-xs mt-1">Try adding more recipes or selecting different ingredients.</p>
            </div>
          )}

          {exactMatches.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full" />
                Exact Matches ({exactMatches.length})
              </h3>
              <div className="space-y-2">
                {exactMatches.map(({ recipe }) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe.id)}
                    className="w-full flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-xl hover:bg-green-500/10 transition-all text-left"
                  >
                    <span className="text-2xl">{CATEGORY_EMOJIS[recipe.category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{recipe.title}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {recipe.ingredients.map((i) => i.name).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-green-400 font-bold flex-shrink-0">100% match</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {closeMatches.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                Close Matches ({closeMatches.length}) — you may need a few more ingredients
              </h3>
              <div className="space-y-2">
                {closeMatches.map(({ recipe, matchScore, missingIngredients }) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleSelectRecipe(recipe.id)}
                    className="w-full flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10 transition-all text-left"
                  >
                    <span className="text-2xl flex-shrink-0">{CATEGORY_EMOJIS[recipe.category]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{recipe.title}</p>
                      {missingIngredients.length > 0 && (
                        <p className="text-xs text-amber-600 mt-0.5">
                          Missing: {missingIngredients.slice(0, 4).join(', ')}
                          {missingIngredients.length > 4 && ` +${missingIngredients.length - 4} more`}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-amber-400 font-bold flex-shrink-0">
                      {Math.round(matchScore * 100)}% match
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PantryMix;
