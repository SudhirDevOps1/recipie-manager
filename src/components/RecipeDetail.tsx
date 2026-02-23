import React, { useState } from 'react';
import {
  X, Star, Clock, Users, ChefHat, Trophy, Copy, QrCode as QrIcon,
  Pencil, Trash2, CheckCircle2, Share2, CalendarClock, Tag
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRecipes } from '../context/RecipeContext';
import { CATEGORY_EMOJIS, generateRecipeUrl, getIngredientEmoji } from '../utils/recipeHelpers';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';

const RecipeDetail: React.FC = () => {
  const { selectedRecipe, selectRecipe, toggleFavorite, deleteRecipe, openEditForm, incrementCooked } = useRecipes();
  const [showQR, setShowQR] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());

  if (!selectedRecipe) return null;

  const recipe = selectedRecipe;
  const recipeUrl = generateRecipeUrl(recipe.id);

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyIngredients = async () => {
    const text = recipe.ingredients
      .map((i) => `• ${i.amount} ${i.unit} ${i.name}`.trim())
      .join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('Ingredients copied to clipboard!');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(recipeUrl);
    toast.success('Recipe link copied!');
  };

  const handleDelete = () => {
    if (confirm(`Delete "${recipe.title}"? This cannot be undone.`)) {
      deleteRecipe(recipe.id);
      selectRecipe(null);
      toast.success('Recipe deleted.');
    }
  };

  const handleCooked = () => {
    incrementCooked(recipe.id);
    toast.success('🎉 Marked as cooked! Times cooked: ' + (recipe.timesCooked + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl my-4 overflow-hidden">
        {/* Header image / banner */}
        <div className="relative h-52 bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <span className="text-7xl">{CATEGORY_EMOJIS[recipe.category]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />

          {/* Close */}
          <button
            onClick={() => selectRecipe(null)}
            className="absolute top-3 right-3 p-2 bg-gray-900/80 backdrop-blur rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title area */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full border border-orange-500/30 capitalize">
                    {CATEGORY_EMOJIS[recipe.category]} {recipe.category}
                  </span>
                  {recipe.expiresAt && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30">
                      <CalendarClock className="w-3 h-3" />
                      Seasonal – expires {new Date(recipe.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">{recipe.title}</h2>
                {recipe.description && (
                  <p className="text-sm text-gray-300 mt-1 line-clamp-2">{recipe.description}</p>
                )}
              </div>
              <button
                onClick={() => toggleFavorite(recipe.id)}
                className="p-2 bg-gray-900/80 backdrop-blur rounded-lg flex-shrink-0"
                title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={cn('w-5 h-5', recipe.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400')} />
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <Clock className="w-4 h-4" />, label: 'Prep', value: `${recipe.prepTime}m` },
              { icon: <ChefHat className="w-4 h-4" />, label: 'Cook', value: `${recipe.cookTime}m` },
              { icon: <Users className="w-4 h-4" />, label: 'Serves', value: recipe.servings },
              { icon: <Trophy className="w-4 h-4 text-amber-400" />, label: 'Cooked', value: `${recipe.timesCooked}×` },
            ].map(({ icon, label, value }) => (
              <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                <div className="flex justify-center text-gray-400 mb-1">{icon}</div>
                <div className="text-white font-bold text-sm">{value}</div>
                <div className="text-gray-500 text-xs">{label}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-lg border border-gray-700">
                  <Tag className="w-3 h-3" />#{tag}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ingredients</h3>
              <button
                onClick={copyIngredients}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-400 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy all
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {recipe.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg p-2.5"
                >
                  <span className="text-lg flex-shrink-0">{getIngredientEmoji(ing.name)}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{ing.name}</p>
                    {(ing.amount || ing.unit) && (
                      <p className="text-xs text-gray-500">{ing.amount} {ing.unit}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Instructions</h3>
            <div className="space-y-3">
              {recipe.steps.map((step, idx) => (
                <div
                  key={step.id}
                  onClick={() => toggleStep(step.id)}
                  className={cn(
                    'flex gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                    checkedSteps.has(step.id)
                      ? 'bg-green-500/5 border-green-500/30 opacity-60'
                      : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                  )}
                >
                  <div className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors mt-0.5',
                    checkedSteps.has(step.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-600 text-gray-500'
                  )}>
                    {checkedSteps.has(step.id) ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <p className={cn(
                    'text-sm leading-relaxed flex-1',
                    checkedSteps.has(step.id) ? 'line-through text-gray-500' : 'text-gray-300'
                  )}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* QR Code */}
          {showQR && (
            <section className="flex flex-col items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <p className="text-sm text-gray-400 text-center">Scan to view this recipe on mobile</p>
              <div className="p-3 bg-white rounded-xl">
                <QRCodeSVG value={recipeUrl} size={160} />
              </div>
              <p className="text-xs text-gray-600 break-all text-center max-w-xs">{recipeUrl}</p>
            </section>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
            <button
              onClick={handleCooked}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-600/30 transition-all"
            >
              <Trophy className="w-4 h-4" />
              Mark Cooked
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm font-medium hover:bg-purple-600/30 transition-all"
            >
              <QrIcon className="w-4 h-4" />
              {showQR ? 'Hide QR' : 'QR Code'}
            </button>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-600/30 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Link
            </button>
            <button
              onClick={() => { openEditForm(recipe); selectRecipe(null); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600/10 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-600/20 transition-all ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
