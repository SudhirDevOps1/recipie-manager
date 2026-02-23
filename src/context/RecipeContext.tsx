import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Recipe, PantryItem, FilterState, ViewMode } from '../types/recipe';
import { storage } from '../utils/storage';
import { filterRecipes } from '../utils/recipeHelpers';

interface RecipeContextValue {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  pantry: PantryItem[];
  filter: FilterState;
  viewMode: ViewMode;
  selectedRecipe: Recipe | null;
  isFormOpen: boolean;
  editingRecipe: Recipe | null;
  isPantryMixOpen: boolean;

  setFilter: (f: Partial<FilterState>) => void;
  setViewMode: (v: ViewMode) => void;
  selectRecipe: (r: Recipe | null) => void;
  openAddForm: () => void;
  openEditForm: (r: Recipe) => void;
  closeForm: () => void;
  addRecipe: (r: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'timesCooked' | 'isFavorite'>) => void;
  updateRecipe: (r: Recipe) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  incrementCooked: (id: string) => void;
  addPantryItem: (name: string) => void;
  removePantryItem: (id: string) => void;
  setPantryMixOpen: (open: boolean) => void;
}

const RecipeContext = createContext<RecipeContextValue | null>(null);

const DEFAULT_FILTER: FilterState = {
  search: '',
  category: 'all',
  tags: [],
  favoritesOnly: false,
  sortBy: 'newest',
};

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>(() => storage.getRecipes());
  const [pantry, setPantry] = useState<PantryItem[]>(() => storage.getPantry());
  const [filter, setFilterState] = useState<FilterState>(DEFAULT_FILTER);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isPantryMixOpen, setPantryMixOpen] = useState(false);

  // Check URL param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('recipe');
    if (rid) {
      const found = recipes.find((r) => r.id === rid);
      if (found) setSelectedRecipe(found);
    }
  }, []);

  const filteredRecipes = filterRecipes(recipes, filter);

  const setFilter = useCallback((partial: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...partial }));
  }, []);

  const selectRecipe = useCallback((r: Recipe | null) => {
    setSelectedRecipe(r);
  }, []);

  const openAddForm = useCallback(() => {
    setEditingRecipe(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((r: Recipe) => {
    setEditingRecipe(r);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingRecipe(null);
  }, []);

  const addRecipe = useCallback(
    (data: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt' | 'timesCooked' | 'isFavorite'>) => {
      const now = new Date().toISOString();
      const recipe: Recipe = {
        ...data,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
        timesCooked: 0,
        isFavorite: false,
      };
      storage.addRecipe(recipe);
      setRecipes(storage.getRecipes());
    },
    []
  );

  const updateRecipe = useCallback((updated: Recipe) => {
    const r = { ...updated, updatedAt: new Date().toISOString() };
    storage.updateRecipe(r);
    setRecipes(storage.getRecipes());
    if (selectedRecipe?.id === r.id) setSelectedRecipe(r);
  }, [selectedRecipe]);

  const deleteRecipe = useCallback((id: string) => {
    storage.deleteRecipe(id);
    setRecipes(storage.getRecipes());
    if (selectedRecipe?.id === id) setSelectedRecipe(null);
  }, [selectedRecipe]);

  const toggleFavorite = useCallback((id: string) => {
    const recipe = storage.getRecipes().find((r) => r.id === id);
    if (!recipe) return;
    const updated = { ...recipe, isFavorite: !recipe.isFavorite, updatedAt: new Date().toISOString() };
    storage.updateRecipe(updated);
    setRecipes(storage.getRecipes());
    if (selectedRecipe?.id === id) setSelectedRecipe(updated);
  }, [selectedRecipe]);

  const incrementCooked = useCallback((id: string) => {
    const recipe = storage.getRecipes().find((r) => r.id === id);
    if (!recipe) return;
    const updated = { ...recipe, timesCooked: recipe.timesCooked + 1, updatedAt: new Date().toISOString() };
    storage.updateRecipe(updated);
    setRecipes(storage.getRecipes());
    if (selectedRecipe?.id === id) setSelectedRecipe(updated);
  }, [selectedRecipe]);

  const addPantryItem = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const items = storage.getPantry();
    if (items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return;
    const newItem: PantryItem = { id: uuidv4(), name: trimmed };
    const updated = [...items, newItem];
    storage.savePantry(updated);
    setPantry(updated);
  }, []);

  const removePantryItem = useCallback((id: string) => {
    const items = storage.getPantry().filter((i) => i.id !== id);
    storage.savePantry(items);
    setPantry(items);
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        filteredRecipes,
        pantry,
        filter,
        viewMode,
        selectedRecipe,
        isFormOpen,
        editingRecipe,
        isPantryMixOpen,
        setFilter,
        setViewMode,
        selectRecipe,
        openAddForm,
        openEditForm,
        closeForm,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        toggleFavorite,
        incrementCooked,
        addPantryItem,
        removePantryItem,
        setPantryMixOpen,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be used inside RecipeProvider');
  return ctx;
};
