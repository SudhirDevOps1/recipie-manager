import { Recipe, PantryItem } from '../types/recipe';

const RECIPES_KEY = 'recipe_manager_recipes';
const PANTRY_KEY = 'recipe_manager_pantry';

export const storage = {
  getRecipes(): Recipe[] {
    try {
      const raw = localStorage.getItem(RECIPES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveRecipes(recipes: Recipe[]): void {
    localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
  },

  addRecipe(recipe: Recipe): void {
    const recipes = this.getRecipes();
    recipes.unshift(recipe);
    this.saveRecipes(recipes);
  },

  updateRecipe(updated: Recipe): void {
    const recipes = this.getRecipes().map((r) =>
      r.id === updated.id ? updated : r
    );
    this.saveRecipes(recipes);
  },

  deleteRecipe(id: string): void {
    const recipes = this.getRecipes().filter((r) => r.id !== id);
    this.saveRecipes(recipes);
  },

  getPantry(): PantryItem[] {
    try {
      const raw = localStorage.getItem(PANTRY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  savePantry(items: PantryItem[]): void {
    localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  },
};
