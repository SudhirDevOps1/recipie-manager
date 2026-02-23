import { v4 as uuidv4 } from 'uuid';
import type { Recipe, Category, Ingredient, Step } from '../types/recipe';
import raw from '../../cook/data.json';

type JsonIngredient = { name: string; amount?: string; unit?: string };
type JsonRecipe = {
  title: string;
  description?: string;
  category?: Category;
  tags?: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  expiresAt?: string;
  image?: string;
  ingredients: JsonIngredient[];
  steps: string[];
};

type JsonCookbook = { recipes: JsonRecipe[] };

function toRecipe(j: JsonRecipe, createdAt: string): Recipe {
  const ingredients: Ingredient[] = (j.ingredients ?? []).map((ing) => ({
    id: uuidv4(),
    name: ing.name,
    amount: ing.amount ?? '',
    unit: ing.unit ?? '',
  }));

  const steps: Step[] = (j.steps ?? []).map((desc, idx) => ({
    id: uuidv4(),
    order: idx,
    description: desc,
  }));

  return {
    id: uuidv4(),
    title: j.title,
    description: j.description ?? '',
    category: j.category ?? 'other',
    tags: j.tags ?? [],
    ingredients,
    steps,
    image: j.image,
    isFavorite: false,
    timesCooked: 0,
    prepTime: j.prepTime ?? 10,
    cookTime: j.cookTime ?? 20,
    servings: j.servings ?? 2,
    expiresAt: j.expiresAt,
    createdAt,
    updatedAt: createdAt,
  };
}

function cloneVariant(base: JsonRecipe, index: number): JsonRecipe {
  const variantWords = [
    'Quick',
    'Spicy',
    'Creamy',
    'Herby',
    'Zesty',
    'Smoky',
    'Rustic',
    'Light',
    'Hearty',
    'Simple',
  ];
  const word = variantWords[index % variantWords.length];
  const suffix = `#${index + 1}`;

  // small tag tweak to keep search interesting
  const tags = Array.from(new Set([...(base.tags ?? []), word.toLowerCase()]));

  return {
    ...base,
    title: `${word} ${base.title} ${suffix}`,
    description: base.description ? `${base.description} (${word.toLowerCase()} variant)` : `${word} variant.`,
    tags,
    prepTime: Math.max(0, (base.prepTime ?? 10) + ((index % 3) - 1) * 2),
    cookTime: Math.max(0, (base.cookTime ?? 15) + ((index % 4) - 2) * 3),
    servings: Math.max(1, (base.servings ?? 2) + (index % 2)),
  };
}

export function loadCookbookRecipes(minCount = 120): Recipe[] {
  const cookbook = raw as unknown as JsonCookbook;
  const base = cookbook.recipes ?? [];
  const now = new Date().toISOString();

  const expanded: JsonRecipe[] = [];
  if (base.length === 0) return [];

  // repeat/variant generation to ensure 100+
  let i = 0;
  while (expanded.length < Math.max(minCount, base.length)) {
    const b = base[i % base.length];
    expanded.push(cloneVariant(b, expanded.length));
    i++;
  }

  return expanded.map((j) => toRecipe(j, now));
}
