import { Recipe, FilterState, Category } from '../types/recipe';

export function filterRecipes(recipes: Recipe[], filter: FilterState): Recipe[] {
  let result = [...recipes];

  // Expired check — hide past-expiry seasonal recipes
  const now = new Date();
  result = result.filter((r) => {
    if (r.expiresAt) {
      return new Date(r.expiresAt) >= now;
    }
    return true;
  });

  // Search by title or ingredients
  if (filter.search.trim()) {
    const q = filter.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some((ing) => ing.name.toLowerCase().includes(q)) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (filter.category !== 'all') {
    result = result.filter((r) => r.category === filter.category);
  }

  // Tag filter
  if (filter.tags.length > 0) {
    result = result.filter((r) =>
      filter.tags.every((tag) => r.tags.includes(tag))
    );
  }

  // Favorites only
  if (filter.favoritesOnly) {
    result = result.filter((r) => r.isFavorite);
  }

  // Sort
  switch (filter.sortBy) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'name':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'popular':
      result.sort((a, b) => b.timesCooked - a.timesCooked);
      break;
    case 'favorites':
      result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
      break;
  }

  return result;
}

export function findMatchingRecipes(
  recipes: Recipe[],
  selectedIngredients: string[]
): { recipe: Recipe; matchScore: number; missingIngredients: string[] }[] {
  if (selectedIngredients.length === 0) return [];

  const selected = selectedIngredients.map((s) => s.toLowerCase());

  return recipes
    .map((recipe) => {
      const recipeIngredients = recipe.ingredients.map((i) => i.name.toLowerCase());
      const matched = selected.filter((s) =>
        recipeIngredients.some((ri) => ri.includes(s) || s.includes(ri))
      );
      const missing = recipeIngredients.filter(
        (ri) => !selected.some((s) => ri.includes(s) || s.includes(ri))
      );
      const matchScore = matched.length / recipeIngredients.length;
      return { recipe, matchScore, missingIngredients: missing };
    })
    .filter((r) => r.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function suggestRecipeName(ingredients: string[]): string {
  const combinations: Record<string, string[]> = {
    'spinach,tomato,cheese': ['Spinach Tomato Cheese Omelette', 'Caprese Salad with Spinach'],
    'chicken,garlic,lemon': ['Lemon Garlic Chicken', 'Garlic Herb Roasted Chicken'],
    'potato,onion,egg': ['Spanish Tortilla', 'Potato Frittata'],
    'tomato,basil,mozzarella': ['Caprese Salad', 'Margherita Pizza'],
    'banana,oat,honey': ['Banana Oat Pancakes', 'Honey Banana Smoothie'],
    'pasta,tomato,basil': ['Classic Marinara Pasta', 'Tomato Basil Pasta'],
    'egg,flour,milk': ['Classic Pancakes', 'French Crepes'],
    'chicken,rice,broth': ['Chicken Rice Soup', 'Arroz con Pollo'],
    'beef,onion,tomato': ['Beef Stew', 'Bolognese Sauce'],
    'avocado,lime,cilantro': ['Guacamole', 'Avocado Salsa'],
  };

  const sorted = ingredients.map((i) => i.toLowerCase()).sort().join(',');
  for (const [key, suggestions] of Object.entries(combinations)) {
    const keyIngredients = key.split(',');
    if (keyIngredients.every((k) => sorted.includes(k))) {
      return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
  }

  // Generic name from ingredients
  if (ingredients.length >= 2) {
    const picked = ingredients.slice(0, 3).map((i) => capitalize(i)).join(' & ');
    return `${picked} Delight`;
  }

  return '';
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const CATEGORY_LABELS: Record<Category | 'all', string> = {
  all: 'All Categories',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  dessert: 'Dessert',
  snack: 'Snack',
  vegan: 'Vegan',
  vegetarian: 'Vegetarian',
  soup: 'Soup',
  salad: 'Salad',
  beverage: 'Beverage',
  other: 'Other',
};

export const CATEGORY_EMOJIS: Record<Category, string> = {
  breakfast: '🌅',
  lunch: '🥗',
  dinner: '🍽️',
  dessert: '🍰',
  snack: '🥨',
  vegan: '🌱',
  vegetarian: '🥦',
  soup: '🍲',
  salad: '🥙',
  beverage: '🥤',
  other: '🍴',
};

export const INGREDIENT_EMOJIS: Record<string, string> = {
  tomato: '🍅',
  spinach: '🥬',
  cheese: '🧀',
  chicken: '🍗',
  egg: '🥚',
  eggs: '🥚',
  potato: '🥔',
  onion: '🧅',
  garlic: '🧄',
  lemon: '🍋',
  avocado: '🥑',
  carrot: '🥕',
  banana: '🍌',
  apple: '🍎',
  broccoli: '🥦',
  pepper: '🫑',
  mushroom: '🍄',
  corn: '🌽',
  rice: '🍚',
  pasta: '🍝',
  bread: '🍞',
  butter: '🧈',
  milk: '🥛',
  beef: '🥩',
  fish: '🐟',
  shrimp: '🍤',
  salt: '🧂',
  sugar: '🍬',
  flour: '🌾',
  oil: '🫙',
  honey: '🍯',
  chocolate: '🍫',
  vanilla: '🌸',
  lime: '🍋',
  orange: '🍊',
  strawberry: '🍓',
  blueberry: '🫐',
  lettuce: '🥬',
  cucumber: '🥒',
  celery: '🌿',
  herbs: '🌿',
  basil: '🌿',
  cilantro: '🌿',
  mint: '🌿',
  water: '💧',
  oat: '🌾',
  oats: '🌾',
  bacon: '🥓',
  ham: '🍖',
  sausage: '🌭',
  yogurt: '🫙',
  cream: '🥛',
  wine: '🍷',
  vinegar: '🫙',
  soy: '🫙',
  tofu: '🟨',
  beans: '🫘',
  lentils: '🫘',
};

export function getIngredientEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(INGREDIENT_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '🥄';
}

export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function validateImageFile(file: File): string | null {
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!ALLOWED.includes(file.type)) {
    return 'Only JPEG, PNG, WebP, and GIF images are allowed.';
  }
  if (file.size > MAX_SIZE) {
    return 'Image must be smaller than 2MB.';
  }
  return null;
}

export function generateRecipeUrl(id: string): string {
  return `${window.location.origin}${window.location.pathname}?recipe=${id}`;
}
