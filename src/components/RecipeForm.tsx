import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  X, Plus, Trash2, GripVertical, Upload, Wand2, ChevronDown
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Ingredient, Step, Category } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { CATEGORY_LABELS, CATEGORY_EMOJIS, imageToBase64, validateImageFile, suggestRecipeName } from '../utils/recipeHelpers';
import { cn } from '../utils/cn';
import { toast } from 'react-toastify';

const CATEGORIES: Category[] = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegan', 'vegetarian', 'soup', 'salad', 'beverage', 'other'];

const emptyIngredient = (): Ingredient => ({ id: uuidv4(), name: '', amount: '', unit: '' });
const emptyStep = (order: number): Step => ({ id: uuidv4(), order, description: '' });

const RecipeForm: React.FC = () => {
  const { closeForm, addRecipe, updateRecipe, editingRecipe } = useRecipes();
  const isEditing = !!editingRecipe;

  const [title, setTitle] = useState(editingRecipe?.title ?? '');
  const [description, setDescription] = useState(editingRecipe?.description ?? '');
  const [category, setCategory] = useState<Category>(editingRecipe?.category ?? 'dinner');
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editingRecipe?.ingredients?.length ? editingRecipe.ingredients : [emptyIngredient()]
  );
  const [steps, setSteps] = useState<Step[]>(
    editingRecipe?.steps?.length ? editingRecipe.steps : [emptyStep(0)]
  );
  const [tags, setTags] = useState<string[]>(editingRecipe?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<string | undefined>(editingRecipe?.image);
  const [prepTime, setPrepTime] = useState(editingRecipe?.prepTime ?? 10);
  const [cookTime, setCookTime] = useState(editingRecipe?.cookTime ?? 20);
  const [servings, setServings] = useState(editingRecipe?.servings ?? 4);
  const [expiresAt, setExpiresAt] = useState(editingRecipe?.expiresAt ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Recipe title is required.';
    if (ingredients.every((i) => !i.name.trim())) {
      newErrors.ingredients = 'At least one ingredient is required.';
    }
    if (steps.every((s) => !s.description.trim())) {
      newErrors.steps = 'At least one instruction step is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted errors.');
      return;
    }
    setSubmitting(true);
    const filteredIngredients = ingredients.filter((i) => i.name.trim());
    const filteredSteps = steps
      .filter((s) => s.description.trim())
      .map((s, idx) => ({ ...s, order: idx }));

    try {
      if (isEditing && editingRecipe) {
        updateRecipe({
          ...editingRecipe,
          title: title.trim(),
          description: description.trim(),
          category,
          ingredients: filteredIngredients,
          steps: filteredSteps,
          tags,
          image,
          prepTime,
          cookTime,
          servings,
          expiresAt: expiresAt || undefined,
        });
        toast.success('Recipe updated! 📝');
      } else {
        addRecipe({
          title: title.trim(),
          description: description.trim(),
          category,
          ingredients: filteredIngredients,
          steps: filteredSteps,
          tags,
          image,
          prepTime,
          cookTime,
          servings,
          expiresAt: expiresAt || undefined,
        });
        toast.success('Recipe added! 🍳');
      }
      closeForm();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Ingredients
  const addIngredient = () => setIngredients((prev) => [...prev, emptyIngredient()]);
  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  const updateIngredient = (id: string, field: keyof Ingredient, value: string) =>
    setIngredients((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  // Steps
  const addStep = () =>
    setSteps((prev) => [...prev, emptyStep(prev.length)]);
  const removeStep = (id: string) =>
    setSteps((prev) => prev.filter((s) => s.id !== id));
  const updateStep = (id: string, value: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, description: value } : s)));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(steps);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setSteps(items.map((s, i) => ({ ...s, order: i })));
  };

  // Tags
  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
    }
    setTagInput('');
  };
  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { toast.error(err); return; }
    const base64 = await imageToBase64(file);
    setImage(base64);
    toast.success('Image uploaded!');
  };

  // Auto suggest title
  const handleSuggestTitle = () => {
    const names = ingredients.filter((i) => i.name.trim()).map((i) => i.name);
    if (names.length < 2) { toast.info('Add at least 2 ingredients to get a suggestion.'); return; }
    const suggestion = suggestRecipeName(names);
    if (suggestion) {
      setTitle(suggestion);
      toast.success(`Suggested: "${suggestion}"`);
    } else {
      toast.info('No suggestion found for these ingredients.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl my-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-lg font-bold text-white">
            {isEditing ? '✏️ Edit Recipe' : '🍳 Add New Recipe'}
          </h2>
          <button
            onClick={closeForm}
            className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Recipe Title *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Creamy Garlic Pasta"
                className={cn(
                  'flex-1 bg-gray-900 border rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-1 transition-colors',
                  errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:border-orange-500 focus:ring-orange-500'
                )}
              />
              <button
                type="button"
                onClick={handleSuggestTitle}
                title="Suggest title from ingredients"
                className="px-3 py-2.5 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl hover:bg-purple-600/30 transition-all flex-shrink-0"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Short Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this recipe…"
              rows={2}
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Category + Times + Servings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 appearance-none cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-gray-900">
                      {CATEGORY_EMOJIS[c]} {CATEGORY_LABELS[c]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
            {[
              { label: 'Prep (min)', value: prepTime, set: setPrepTime },
              { label: 'Cook (min)', value: cookTime, set: setCookTime },
              { label: 'Servings', value: servings, set: setServings },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(e) => set(Number(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ingredients *
              </label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
            {errors.ingredients && <p className="text-red-400 text-xs mb-2">{errors.ingredients}</p>}
            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div key={ing.id} className="flex gap-2 items-center">
                  <span className="text-gray-600 text-xs w-5 text-right flex-shrink-0">{idx + 1}.</span>
                  <input
                    type="text"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(ing.id, 'amount', e.target.value)}
                    placeholder="Amt"
                    className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                    placeholder="Unit"
                    className="w-16 bg-gray-900 border border-gray-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                    placeholder="Ingredient name *"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing.id)}
                    disabled={ingredients.length === 1}
                    className="text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30 flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Steps with DnD */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Instructions *
              </label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>
            {errors.steps && <p className="text-red-400 text-xs mb-2">{errors.steps}</p>}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="steps">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {steps.map((step, idx) => (
                      <Draggable key={step.id} draggableId={step.id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              'flex gap-2 items-start',
                              snapshot.isDragging && 'opacity-80'
                            )}
                          >
                            <span {...provided.dragHandleProps} className="mt-2.5 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0">
                              <GripVertical className="w-4 h-4" />
                            </span>
                            <div className="flex-shrink-0 w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-xs font-bold mt-2">
                              {idx + 1}
                            </div>
                            <textarea
                              value={step.description}
                              onChange={(e) => updateStep(step.id, e.target.value)}
                              placeholder={`Step ${idx + 1}: Describe what to do…`}
                              rows={2}
                              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none"
                            />
                            <button
                              type="button"
                              onClick={() => removeStep(step.id)}
                              disabled={steps.length === 1}
                              className="mt-2.5 text-gray-600 hover:text-red-400 transition-colors disabled:opacity-30 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g. quick, spicy, gluten-free…"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-800 text-gray-300 border border-gray-700 rounded-xl hover:bg-gray-700 transition-all text-sm"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg border border-gray-700">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="text-gray-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Recipe Photo (optional)
            </label>
            <div
              className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center cursor-pointer hover:border-orange-500/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="Preview" className="max-h-40 mx-auto rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImage(undefined); }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-8 h-8" />
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs">JPEG, PNG, WebP, GIF • Max 2MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Seasonal expiry */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Seasonal Expiry Date (optional)
            </label>
            <input
              type="date"
              value={expiresAt ? expiresAt.split('T')[0] : ''}
              onChange={(e) => setExpiresAt(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-gray-600 mt-1">Recipe will be hidden after this date.</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-700 transition-all border border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:from-orange-400 hover:to-red-400 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 active:scale-95"
            >
              {submitting ? 'Saving…' : isEditing ? 'Update Recipe' : 'Save Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;
