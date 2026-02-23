export type Category =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'dessert'
  | 'snack'
  | 'vegan'
  | 'vegetarian'
  | 'soup'
  | 'salad'
  | 'beverage'
  | 'other';

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  image?: string; // base64
  category: Category;
  tags: string[];
  isFavorite: boolean;
  timesCooked: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // optional seasonal expiry ISO date
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
}

export interface PantryItem {
  id: string;
  name: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'name' | 'popular' | 'favorites';

export interface FilterState {
  search: string;
  category: Category | 'all';
  tags: string[];
  favoritesOnly: boolean;
  sortBy: SortOption;
}
