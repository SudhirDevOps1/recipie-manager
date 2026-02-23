import React from 'react';
import { useRecipes } from '../context/RecipeContext';
import RecipeCard from './RecipeCard';
import EmptyState from './EmptyState';
import { cn } from '../utils/cn';

const RecipeGrid: React.FC = () => {
  const { filteredRecipes, viewMode } = useRecipes();

  if (filteredRecipes.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className={cn(
        'max-w-7xl mx-auto px-4 pb-12',
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-2'
      )}
    >
      {filteredRecipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default RecipeGrid;
