import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, X, Search, Sparkles, Utensils } from 'lucide-react';

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
          // Store just the array of recipe IDs for quick lookup
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
   * Removes an ingredient chip
   */
  const handleRemoveIngredient = (indexToRemove) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  /**
   * Submits the ingredients to our matching recommendation API
   */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (ingredients.length === 0) {
      // If search is cleared, reload all recipes
      handleClearSearch();
      return;
    }

    try {
      setSearchLoading(true);
      setError('');

      const response = await api.post('/recipes/search', { ingredients });
      setRecipes(response.data.data.recipes);
      setIsSearched(true);
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
      // Redirect to login if user is not authenticated
      navigate('/login');
      return;
    }

    const isFav = favorites.includes(recipeId);

    try {
      if (isFav) {
        // Remove from favorites database
        await api.delete(`/favorites/${recipeId}`);
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        // Add to favorites database
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
    <div className="container">
      {/* Search Header Container */}
      <section className="search-section">

        <h1 className="search-title">
          What's in your <span style={{ color: 'var(--accent-primary)' }}>fridge</span>?
        </h1>
        <p className="search-description">
          Enter the ingredients you have available, and we will recommend the best matching recipes you can cook right now.
        </p>

        <form onSubmit={handleSearch}>
          <div className="ingredient-input-wrapper">
            <div className="chip-list">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="chip">
                  <span>{ing}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="chip-remove"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              placeholder={ingredients.length === 0 ? "Type ingredients (e.g. tomato, pasta) and press Enter" : "Add more..."}
              className="ingredient-field"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {ingredientInput.trim() && (
              <button
                type="button"
                onClick={handleAddIngredient}
                className="chip-remove"
                style={{ color: 'var(--accent-primary)', padding: '0 0.5rem' }}
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn-search"
              disabled={searchLoading}
              style={{ margin: 0 }}
            >
              <Search size={18} />
              {searchLoading ? 'Matching...' : 'Find Recipes'}
            </button>

            {isSearched && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="btn-search"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', margin: 0 }}
              >
                Clear Search
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Recipes Catalog Grid Section */}
      <section className="recipes-section">
        <h2 className="section-title">
          {isSearched ? (
            <>
              <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
              Recommended Matches ({recipes.length})
            </>
          ) : (
            <>
              <Utensils size={20} style={{ color: 'var(--accent-primary)' }} />
              Browse Our Recipes ({recipes.length})
            </>
          )}
        </h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {searchLoading ? (
          <LoadingSpinner />
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>No matching recipes found.</p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Try entering fewer ingredients, or adding basics like butter, salt, or oil!
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
      </section>

      {/* User Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title" style={{ justifyContent: 'center' }}>
          Loved by Home Cooks
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '600px', margin: '0.5rem auto 1.5rem' }}>
          Here is what FlavorFind users say about cooking with their available ingredients.
        </p>

        <div className="testimonials-grid">
          {/* Testimonial 1 */}
          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="testimonial-quote">
                "FlavorFind completely changed how I cook in my dorm. I just typed 'egg, bread' and made cinnamon French toast. No food waste at all!"
              </p>
            </div>
            <div className="testimonial-profile">
              <div className="testimonial-avatar">SM</div>
              <div>
                <h4 className="testimonial-name">Sarah Mitchell</h4>
                <span className="testimonial-role">College Student</span>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="testimonial-quote">
                "The integration with USDA nutrition facts is incredible. I can scale recipe servings for my weekly meal prep and see the calorie count instantly."
              </p>
            </div>
            <div className="testimonial-profile">
              <div className="testimonial-avatar">DK</div>
              <div>
                <h4 className="testimonial-name">David K.</h4>
                <span className="testimonial-role">Fitness Enthusiast</span>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="testimonial-card">
            <div>
              <div className="testimonial-stars">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
              <p className="testimonial-quote">
                "Saving recipes in my favorites folder and generating a scaled grocery shopping list saves me so much time at the supermarket."
              </p>
            </div>
            <div className="testimonial-profile">
              <div className="testimonial-avatar">PR</div>
              <div>
                <h4 className="testimonial-name">Priya Rao</h4>
                <span className="testimonial-role">Working Professional</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
