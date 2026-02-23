import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { RecipeProvider, useRecipes } from './context/RecipeContext';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import RecipeGrid from './components/RecipeGrid';
import RecipeDetail from './components/RecipeDetail';
import RecipeForm from './components/RecipeForm';
import PantryMix from './components/PantryMix';
import Footer from './components/Footer';
import { storage } from './utils/storage';
import { SEED_PANTRY } from './utils/seedData';
import { loadCookbookRecipes } from './utils/jsonCookbook';
import { v4 as uuidv4 } from 'uuid';

// Inner component so it can access context
function AppContent() {
  const { selectedRecipe, isFormOpen, isPantryMixOpen } = useRecipes();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <main>
        <SearchBar />
        <RecipeGrid />
      </main>
      <Footer />

      {/* Modals */}
      {selectedRecipe && <RecipeDetail />}
      {isFormOpen && <RecipeForm />}
      {isPantryMixOpen && <PantryMix />}

      {/* Toast */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{
          background: '#1f2937',
          border: '1px solid #374151',
          color: '#f9fafb',
          borderRadius: '12px',
        }}
      />
    </div>
  );
}

// Seed data on first load
function seedIfEmpty() {
  const existing = storage.getRecipes();
  if (existing.length === 0) {
    // Seed from cook/data.json (100+ recipes) for first-time users
    const seeded = loadCookbookRecipes(120);
    storage.saveRecipes(seeded);
  }
  const pantry = storage.getPantry();
  if (pantry.length === 0) {
    storage.savePantry(
      SEED_PANTRY.map((name) => ({ id: uuidv4(), name }))
    );
  }
}

export function App() {
  useEffect(() => {
    seedIfEmpty();
  }, []);

  return (
    <RecipeProvider>
      <AppContent />
    </RecipeProvider>
  );
}
