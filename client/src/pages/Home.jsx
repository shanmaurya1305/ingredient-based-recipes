import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, X, Search, Sparkles, BookOpen, Users, Compass, Award, Heart } from 'lucide-react';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearched, setIsSearched] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch initial data: all recipes, and user's favorites list if logged in
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch all recipes
        const recipeRes = await api.get('/recipes');
        setRecipes(recipeRes.data.data.recipes);

        // Fetch favorites to display heart badges
        if (user) {
          const favsRes = await api.get('/favorites');
          const favIds = favsRes.data.data.favorites.map(fav => fav._id);
          setFavorites(favIds);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err.message);
        setError('Failed to load recipes. Please check your network connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  /**
   * Appends an ingredient keyword to our matching array
   */
  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim().toLowerCase();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  /**
   * Appends a quick add keyword directly to our matching array
   */
  const handleQuickAdd = (item) => {
    const val = item.toLowerCase();
    if (!ingredients.includes(val)) {
      setIngredients([...ingredients, val]);
    }
  };

  /**
   * Removes an ingredient chip
   */
  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  /**
   * Submits the ingredients to our matching recommendation API
   */
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (ingredients.length === 0) {
      handleClearSearch();
      return;
    }

    try {
      setSearchLoading(true);
      setError('');

      const response = await api.post('/recipes/search', { ingredients });
      setRecipes(response.data.data.recipes);
      setIsSearched(true);

      // Scroll smoothly down to the recipes section
      document.getElementById('featured-recipes')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Search execution failed');
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Resets search states and reloads full recipe catalog
   */
  const handleClearSearch = async () => {
    setIngredients([]);
    setIngredientInput('');
    setIsSearched(false);
    setError('');

    try {
      setSearchLoading(true);
      const recipeRes = await api.get('/recipes');
      setRecipes(recipeRes.data.data.recipes);
    } catch (err) {
      setError('Failed to reload recipes');
    } finally {
      setSearchLoading(false);
    }
  };

  /**
   * Toggles bookmark state for a recipe ID
   */
  const handleToggleFavorite = async (recipeId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFav = favorites.includes(recipeId);

    try {
      if (isFav) {
        await api.delete(`/favorites/${recipeId}`);
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        await api.post(`/favorites/${recipeId}`);
        setFavorites([...favorites, recipeId]);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err.message);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      {/* 1. HERO SECTION SPLIT LAYOUT */}
      <div className="container">
        <section className="hero-grid">

          {/* Left Column: Copy & Search Card */}
          <div className="hero-content">
            <h1 className="hero-title">
              Authentic Taste of <br />
              <span className="accent-text">Indian Cuisine</span> <br />
              at Your Home
            </h1>
            <p className="hero-description">
              Discover the latest trends, techniques, and secrets from a cooking enthusiast. Uploaded by cooking enthusiasts.
            </p>

            {/* Custom Interactive Input Card */}
            <div className="kitchen-card">
              <h3 className="kitchen-card-title">What's in your kitchen?</h3>

              {/* Chip Tag Display */}
              <div className="kitchen-chips-wrapper">
                {ingredients.length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Add ingredients to match (e.g. paneer, ghee)...
                  </span>
                ) : (
                  ingredients.map((ing, idx) => (
                    <div key={idx} className="kitchen-chip">
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="kitchen-chip-remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* TextInput Input Row */}
              <div className="kitchen-input-row">
                <input
                  type="text"
                  placeholder="Enter an ingredient..."
                  className="kitchen-field"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="btn-find-recipe"
                  disabled={searchLoading}
                >
                  <Search size={16} />
                  <span>{searchLoading ? 'Searching...' : 'Find Recipe'}</span>
                </button>
              </div>

              {/* Quick Add Row */}
              <div className="quick-add-row">
                <span>Quick add:</span>
                {['Potato', 'Rice', 'Chicken', 'Tomato', 'Paneer'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleQuickAdd(item)}
                    className="quick-add-btn"
                  >
                    +{item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Gourmet Image & Review Overlays */}
          <div className="hero-image-container">
            <img
              src="https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=800&auto=format&fit=crop&q=80"
              alt="Authentic Indian Food Curry"
              className="hero-main-image"
            />

            {/* Review Widget 1 */}
            <div className="review-card one">
              <div className="review-card-top">
                <div className="review-avatar">AS</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Aarav Sharma</h4>
                  <div className="review-stars">★★★★★</div>
                </div>
              </div>
              <p className="review-text">
                "Finally, search-based Indian recipe recommendation done right!"
              </p>
            </div>

            {/* Review Widget 2 */}
            <div className="review-card two">
              <div className="review-card-top">
                <div className="review-avatar">RV</div>
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rohan Vyas</h4>
                  <div className="review-stars">★★★★★</div>
                </div>
              </div>
              <p className="review-text">
                "Fuzzy search actually matched the dry spices in my pantry."
              </p>
            </div>
          </div>

        </section>
      </div>

      {/* 2. ESPRESSO STATISTICS RIBBON */}
      <section className="stats-ribbon">
        <div className="stats-container">
          <div className="stat-item">
            <BookOpen size={24} className="stat-icon" />
            <span className="stat-number">100+</span>
            <span className="stat-label">Authentic Recipes</span>
          </div>

          <div className="stat-item">
            <Users size={24} className="stat-icon" />
            <span className="stat-number">2k+</span>
            <span className="stat-label">Happy Cooks</span>
          </div>

          <div className="stat-item">
            <Compass size={24} className="stat-icon" />
            <span className="stat-number">15+</span>
            <span className="stat-label">Regional Cuisines</span>
          </div>

          <div className="stat-item">
            <Award size={24} className="stat-icon" />
            <span className="stat-number">5+</span>
            <span className="stat-label">Verified Chefs</span>
          </div>

          <div className="stat-item">
            <Heart size={24} className="stat-icon" />
            <span className="stat-number">10k+</span>
            <span className="stat-label">Community Members</span>
          </div>
        </div>
      </section>

      {/* 3. "HOW BE THE CHEF WORKS?" WORKFLOW SECTION */}
      <section id="how-it-works" className="works-section">
        <div className="container">
          <span className="hero-subtitle" style={{ fontSize: '0.8rem' }}>SIMPLE WORKFLOW</span>
          <h2 className="section-title" style={{ marginTop: '0.5rem', fontFamily: 'var(--font-h1)' }}>
            How Be The Chef Works?
          </h2>

          <div className="works-grid">
            {/* Card 1 */}
            <div className="works-card">
              <div className="works-icon-circle">
                <Search size={28} />
              </div>
              <h3 className="works-card-title">Add Your Ingredients</h3>
              <p className="works-card-text">
                Enter whatever you have in your kitchen. Add one or multiple ingredients into the search chip field.
              </p>
            </div>

            {/* Card 2 */}
            <div className="works-card">
              <div className="works-icon-circle">
                <Sparkles size={28} />
              </div>
              <h3 className="works-card-title">See Your Match Score</h3>
              <p className="works-card-text">
                Our recommendation engine calculates a percentage match based on ingredients you have vs what the recipe needs.
              </p>
            </div>

            {/* Card 3 */}
            <div className="works-card">
              <div className="works-icon-circle">
                <Utensils size={28} />
              </div>
              <h3 className="works-card-title">Cook Authentic Food</h3>
              <p className="works-card-text">
                Follow easy step-by-step instructions, scale serving sizes dynamically, and view USDA nutrition facts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED RECIPES GRID CATALOG */}
      <section id="featured-recipes" className="recipes-section" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        <div className="container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title" style={{ fontFamily: 'var(--font-h1)' }}>Featured Recipes</h2>
              <p className="section-subtext">Most popular dishes cooked this week</p>
            </div>

            {isSearched ? (
              <button onClick={handleClearSearch} className="section-link" style={{ background: 'none', border: 'none' }}>
                Reset Filters & View All
              </button>
            ) : (
              <a href="#featured-recipes" className="section-link">
                Browse All Recipes &rarr;
              </a>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {searchLoading ? (
            <LoadingSpinner />
          ) : recipes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No matching recipes found.</p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Try searching for standard staples like paneer, potato, rice, chicken, or ghee!
              </p>
              <button onClick={handleClearSearch} className="btn-primary" style={{ maxWidth: '200px', marginTop: '1.5rem' }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="recipes-grid">
              {recipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  recipe={recipe}
                  isFavorite={favorites.includes(recipe._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// Simple Utensils inline custom icon component for workflow
const Utensils = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v8c0 1.1.9 2 2 2h3Z" />
    <path d="M19 17v5" />
  </svg>
);

export default Home;
