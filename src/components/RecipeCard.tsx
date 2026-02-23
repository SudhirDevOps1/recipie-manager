import React from 'react';
import { Clock, Users, Star, ChefHat, Pencil, Trash2, Trophy } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { CATEGORY_EMOJIS, getIngredientEmoji } from '../utils/recipeHelpers';
import { useRecipes } from '../context/RecipeContext';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';

interface RecipeCardProps {
  recipe: Recipe;
  viewMode: 'grid' | 'list';
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, viewMode }) => {
  const { selectRecipe, toggleFavorite, deleteRecipe, openEditForm } = useRecipes();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${recipe.title}"? This cannot be undone.`)) {
      deleteRecipe(recipe.id);
      toast.success('Recipe deleted.');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEditForm(recipe);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
    toast.success(recipe.isFavorite ? 'Removed from favorites.' : 'Added to favorites! ⭐');
  };

  const isGrid = viewMode === 'grid';

  if (!isGrid) {
    // List view
    return (
      <div
        onClick={() => selectRecipe(recipe)}
        className="group flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-3 cursor-pointer transition-all hover:bg-gray-800/60"
      >
        {/* Image / placeholder */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{CATEGORY_EMOJIS[recipe.category]}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate group-hover:text-orange-300 transition-colors">
                {recipe.title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{recipe.description || 'No description'}</p>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.prepTime + recipe.cookTime}m
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {recipe.servings}
                </span>
                {recipe.timesCooked > 0 && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Trophy className="w-3 h-3" />
                    {recipe.timesCooked}×
                  </span>
                )}
                <span>{CATEGORY_EMOJIS[recipe.category]} {recipe.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleFavorite} className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                <Star className={cn('w-4 h-4', recipe.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600')} />
              </button>
              <button onClick={handleEdit} className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-600 hover:text-blue-400">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-gray-700 transition-colors text-gray-600 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={() => selectRecipe(recipe)}
      className="group bg-gray-900 border border-gray-800 hover:border-orange-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/5 hover:-translate-y-0.5 flex flex-col"
    >
      {/* Image area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden flex-shrink-0">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{CATEGORY_EMOJIS[recipe.category]}</span>
            <span className="text-xs text-gray-600 capitalize">{recipe.category}</span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-gray-900/80 backdrop-blur rounded-lg text-gray-300 hover:text-blue-400 transition-colors"
            title="Edit recipe"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-gray-900/80 backdrop-blur rounded-lg text-gray-300 hover:text-red-400 transition-colors"
            title="Delete recipe"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Favorite badge */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 left-2 p-1.5 bg-gray-900/80 backdrop-blur rounded-lg transition-colors hover:bg-gray-700"
          title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={cn('w-4 h-4', recipe.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400')} />
        </button>

        {/* Category chip */}
        <div className="absolute bottom-2 left-2">
          <span className="px-2 py-0.5 bg-gray-900/80 backdrop-blur text-xs text-gray-300 rounded-full border border-gray-700/50 capitalize">
            {CATEGORY_EMOJIS[recipe.category]} {recipe.category}
          </span>
        </div>

        {recipe.timesCooked > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 bg-amber-500/20 backdrop-blur text-xs text-amber-400 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> {recipe.timesCooked}×
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-bold text-white text-sm leading-tight group-hover:text-orange-300 transition-colors line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-xs text-gray-500 line-clamp-2">{recipe.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-1">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {recipe.prepTime + recipe.cookTime}m
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
          </span>
          <span className="flex items-center gap-1">
            <ChefHat className="w-3 h-3" />
            {recipe.ingredients.length} ing.
          </span>
        </div>

        {/* Ingredient emoji preview */}
        <div className="flex flex-wrap gap-1 mt-1">
          {recipe.ingredients.slice(0, 6).map((ing) => (
            <span
              key={ing.id}
              title={ing.name}
              className="text-sm"
            >
              {getIngredientEmoji(ing.name)}
            </span>
          ))}
          {recipe.ingredients.length > 6 && (
            <span className="text-xs text-gray-600">+{recipe.ingredients.length - 6}</span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {recipe.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-800 text-gray-500 text-xs rounded-md border border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;
