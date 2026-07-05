import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, Search, Utensils } from 'lucide-react';

const Favorites = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch populated favorite recipes
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const response = await api.get('/favorites');
        setRecipes(response.data.data.favorites);
      } catch (err) {
        console.error('Error fetching favorites:', err.message);
        setError('Failed to load your favorite recipes.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  /**
   * Removes a recipe from the favorites list and updates local state
   */
  const handleRemoveFavorite = async (recipeId) => {
    try {
      // Execute deletion on backend
      await api.delete(`/favorites/${recipeId}`);
      // Filter out of local frontend state
      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
    } catch (err) {
      console.error('Failed to remove favorite:', err.message);
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
    <div className="container" style={{ padding: '2.5rem 1rem 4rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>
        <Heart size={24} style={{ fill: 'var(--danger-color)', color: 'var(--danger-color)' }} />
        Your Favorite Recipes
      </h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <Utensils size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
          <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Your favorites list is empty!</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Browse recommendations and click the heart icon on any recipe to save it here.
          </p>
          <Link to="/" className="btn-search" style={{ display: 'inline-flex', margin: '0 auto', maxWidth: '220px' }}>
            <Search size={18} /> Find Recipes
          </Link>
        </div>
      ) : (
        <div className="recipes-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isFavorite={true} // Since they are loaded from favorites, this is true
              onToggleFavorite={handleRemoveFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
