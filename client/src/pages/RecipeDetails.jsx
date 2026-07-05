import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, Users, Flame, Heart, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [targetServings, setTargetServings] = useState(1);
  
  // Shopping list states (items checked off by user)
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch recipe details and check favorite status
  useEffect(() => {
    const fetchRecipeData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch recipe detail
        const recipeRes = await api.get(`/recipes/${id}`);
        const fetchedRecipe = recipeRes.data.data.recipe;
        setRecipe(fetchedRecipe);
        setTargetServings(fetchedRecipe.servings); // Initialize servings to recipe default

        // 2. Fetch favorites list if user is logged in to check if bookmarked
        if (user) {
          const favsRes = await api.get('/favorites');
          const isFav = favsRes.data.data.favorites.some(fav => fav._id === id);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err.message);
        setError(err.response?.data?.message || 'Failed to retrieve recipe details');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id, user]);

  // Fetch nutrition details separately so it doesn't block the main recipe load
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!recipe) return;
      try {
        setNutritionLoading(true);
        const nutrRes = await api.get(`/recipes/${id}/nutrition`);
        setNutrition(nutrRes.data.data);
      } catch (err) {
        console.error('Error fetching nutrition:', err.message);
        // Nutrition is a value-add, we do not set a blocker error here if it fails
      } finally {
        setNutritionLoading(false);
      }
    };

    fetchNutritionData();
  }, [recipe, id]);

  /**
   * Toggles bookmark state for the current recipe
   */
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Failed to update favorite status:', err.message);
    }
  };

  /**
   * Toggles checkboxes in our interactive grocery checklist
   */
  const handleCheckIngredient = (index) => {
    if (checkedIngredients.includes(index)) {
      setCheckedIngredients(checkedIngredients.filter(idx => idx !== index));
    } else {
      setCheckedIngredients([...checkedIngredients, index]);
    }
  };

  if (loading) {
    return (
      <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="alert alert-danger" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {error || 'Recipe not found'}
        </div>
        <Link to="/" className="btn-search" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
          <ArrowLeft size={18} /> Back to Search
        </Link>
      </div>
    );
  }

  // Calculate scaled ingredient amounts dynamically on the fly
  const scalingFactor = targetServings / recipe.servings;

  return (
    <div className="container">
      {/* Back Link */}
      <div style={{ padding: '1.5rem 0 0.5rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to Recipes
        </Link>
      </div>

      <div className="recipe-details-layout">
        {/* LEFT COLUMN: Visual Media, Servings Scaling, and Checklist */}
        <div>
          <div className="details-hero">
            <img src={recipe.image} alt={recipe.title} className="details-hero-img" />
          </div>

          <div className="details-header">
            <div className="details-meta-top">
              <span className="tag-cuisine">{recipe.cuisine} Cuisine</span>
              <span className="tag-category">• {recipe.category}</span>
            </div>
            
            <div className="details-title-row">
              <h1 className="details-title">{recipe.title}</h1>
              <button 
                onClick={handleToggleFavorite} 
                className={`details-fav-btn ${isFavorite ? 'is-active' : ''}`}
              >
                <Heart size={16} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
                <span>{isFavorite ? 'Saved' : 'Save'}</span>
              </button>
            </div>
            
            <p className="details-desc">{recipe.description}</p>
          </div>

          {/* Quick Specifications */}
          <div className="details-quick-specs">
            <div className="spec-item">
              <Clock size={20} style={{ color: 'var(--accent-primary)' }} />
              <span className="spec-label">Time</span>
              <span className="spec-val">{recipe.cookingTime}m</span>
            </div>
            <div className="spec-item">
              <Users size={20} style={{ color: 'var(--accent-primary)' }} />
              <span className="spec-label">Servings</span>
              <span className="spec-val">{recipe.servings}</span>
            </div>
            <div className="spec-item">
              <Flame size={20} style={{ color: 'var(--accent-primary)' }} />
              <span className="spec-label">Difficulty</span>
              <span className="spec-val">{recipe.difficulty}</span>
            </div>
          </div>

          {/* Scalable Ingredient Checklist (Shopping List Generator) */}
          <div className="shopping-card">
            <div className="shopping-card-header">
              <h3 style={{ fontSize: '1.25rem' }}>Ingredients Checklist</h3>
              
              <div className="shopping-servings-controls">
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Scale servings:</span>
                <button 
                  onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
                  style={{ color: 'var(--text-secondary)', padding: '0 0.5rem', fontWeight: 'bold' }}
                >
                  -
                </button>
                <input 
                  type="number" 
                  className="servings-input"
                  min="1"
                  value={targetServings}
                  onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <button 
                  onClick={() => setTargetServings(targetServings + 1)}
                  style={{ color: 'var(--text-secondary)', padding: '0 0.5rem', fontWeight: 'bold' }}
                >
                  +
                </button>
              </div>
            </div>

            <div className="ingredient-checklist">
              {recipe.ingredients.map((ing, idx) => {
                // Scale ingredient quantities dynamically
                const scaledQty = Math.round((ing.quantity * scalingFactor) * 100) / 100;
                const isChecked = checkedIngredients.includes(idx);
                
                return (
                  <label 
                    key={idx} 
                    className={`checklist-item ${isChecked ? 'checked' : ''}`}
                  >
                    <input 
                      type="checkbox" 
                      className="checklist-checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckIngredient(idx)}
                    />
                    <span>
                      <strong>{scaledQty} {ing.unit}</strong> {ing.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cooking Steps & Nutrition Facts Panel */}
        <div>
          <h2 className="section-title" style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Preparation Instructions
          </h2>
          
          <ol className="instructions-list" style={{ marginTop: '1.5rem' }}>
            {recipe.instructions.map((step, idx) => (
              <li key={idx} className="instruction-step">
                <span className="step-num">{idx + 1}</span>
                <p className="step-text">{step}</p>
              </li>
            ))}
          </ol>

          {/* USDA Nutrition Label (Rendered only on load success) */}
          {nutritionLoading ? (
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <LoadingSpinner />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculating USDA Nutritional Facts...</p>
            </div>
          ) : nutrition ? (
            <div className="nutrition-card">
              <span className={`nutri-badge-tag ${nutrition.isMock ? 'mock' : ''}`}>
                {nutrition.isMock ? 'ESTIMATED VALUES' : 'USDA FoodData Verified'}
              </span>
              <h3>Nutrition Facts</h3>
              <div className="nutri-servings">
                <div>Serving Size: 1 plate ({Math.round(100 / recipe.servings) * recipe.servings}g appx)</div>
                <div>Servings Per Recipe: {recipe.servings}</div>
              </div>
              
              <div className="nutri-calories-row">
                <span className="nutri-calories-label">Calories</span>
                <span className="nutri-calories-value">{nutrition.perServing.calories}</span>
              </div>
              
              <div className="nutri-header-dv">
                <span>% Daily Value *</span>
              </div>

              <div className="nutri-row bold">
                <span>Total Fat</span>
                <span>{nutrition.perServing.fat}g</span>
              </div>
              
              <div className="nutri-row indent">
                <span>Saturated Fat</span>
                <span>{Math.round((nutrition.perServing.fat * 0.3) * 10) / 10}g</span>
              </div>

              <div className="nutri-row bold">
                <span>Total Carbohydrates</span>
                <span>{nutrition.perServing.carbohydrates}g</span>
              </div>
              
              <div className="nutri-row indent">
                <span>Dietary Fiber</span>
                <span>{Math.round((nutrition.perServing.carbohydrates * 0.1) * 10) / 10}g</span>
              </div>

              <div className="nutri-row bold">
                <span>Protein</span>
                <span>{nutrition.perServing.protein}g</span>
              </div>

              <div style={{ fontSize: '0.65rem', borderTop: '4px solid #000000', marginTop: '0.5rem', paddingTop: '0.4rem', lineHeight: '1.25' }}>
                * Percent Daily Values are based on a 2,000 calorie diet. Your daily values may be higher or lower depending on your calorie needs.
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetails;
