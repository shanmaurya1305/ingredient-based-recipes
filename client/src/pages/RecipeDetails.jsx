import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/culinary-editorial.css';
import { 
  Clock, 
  Users, 
  Flame, 
  Heart, 
  ArrowLeft, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Share2, 
  ChefHat, 
  Sparkles, 
  Utensils, 
  Check, 
  Info,
  X,
  BookOpen
} from 'lucide-react';

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [targetServings, setTargetServings] = useState(1);
  
  // Interactive state
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Cooking mode modal
  const [isCookModeOpen, setIsCookModeOpen] = useState(false);
  const [currentCookStep, setCurrentCookStep] = useState(0);

  // Status & Feedback
  const [loading, setLoading] = useState(true);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

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
        setTargetServings(fetchedRecipe.servings || 1);

        // 2. Fetch favorites list if user is logged in to check if bookmarked
        if (user) {
          try {
            const favsRes = await api.get('/favorites');
            const isFav = favsRes.data.data.favorites.some(fav => fav._id === id);
            setIsFavorite(isFav);
          } catch (favErr) {
            console.error('Error fetching favorites status:', favErr.message);
          }
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

  // Fetch nutrition details separately
  useEffect(() => {
    const fetchNutritionData = async () => {
      if (!recipe) return;
      try {
        setNutritionLoading(true);
        const nutrRes = await api.get(`/recipes/${id}/nutrition`);
        setNutrition(nutrRes.data.data);
      } catch (err) {
        console.error('Error fetching nutrition:', err.message);
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
        showToast('Recipe removed from your collection');
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
        showToast('Recipe saved to your collection');
      }
    } catch (err) {
      console.error('Failed to update favorite status:', err.message);
    }
  };

  /**
   * Toggles checkboxes in ingredient checklist
   */
  const handleCheckIngredient = (index) => {
    if (checkedIngredients.includes(index)) {
      setCheckedIngredients(checkedIngredients.filter(idx => idx !== index));
    } else {
      setCheckedIngredients([...checkedIngredients, index]);
    }
  };

  /**
   * Toggles completion for preparation steps
   */
  const handleToggleStep = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(idx => idx !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  /**
   * Copy link to clipboard
   */
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Recipe link copied to clipboard!');
    }
  };

  /**
   * Display toast notification
   */
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ height: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--culinary-surface)' }}>
        <LoadingSpinner />
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--culinary-on-surface-variant)', fontSize: '1.1rem' }}>
          Preparing Culinary Editorial...
        </p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="culinary-detail-page">
        <div className="culinary-container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
          <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            backgroundColor: '#fff', 
            border: '1px solid var(--culinary-border)', 
            borderRadius: 'var(--radius-editorial-lg)', 
            padding: '2.5rem',
            boxShadow: 'var(--shadow-editorial-low)'
          }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '1rem', color: 'var(--culinary-primary)' }}>
              Recipe Unavailable
            </h2>
            <p style={{ color: 'var(--culinary-on-surface-variant)', marginBottom: '1.75rem' }}>
              {error || 'The requested recipe could not be found in our database.'}
            </p>
            <Link to="/" className="btn-editorial-primary">
              <ArrowLeft size={16} /> Return to Recipes Index
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate scaled quantities on the fly
  const baseServings = recipe.servings || 1;
  const scalingFactor = targetServings / baseServings;

  // Step completion progress percentage
  const totalSteps = recipe.instructions ? recipe.instructions.length : 0;
  const stepProgressPct = totalSteps > 0 ? Math.round((completedSteps.length / totalSteps) * 100) : 0;

  // Macro Ring Percentages (based on standard daily targets: Protein 50g, Carbs 275g, Fat 78g, Calories 2000)
  const calories = nutrition?.perServing?.calories || 0;
  const protein = nutrition?.perServing?.protein || 0;
  const carbs = nutrition?.perServing?.carbohydrates || 0;
  const fat = nutrition?.perServing?.fat || 0;

  const proteinPct = Math.min(100, Math.round((protein / 50) * 100));
  const carbsPct = Math.min(100, Math.round((carbs / 275) * 100));
  const fatPct = Math.min(100, Math.round((fat / 78) * 100));
  const calPct = Math.min(100, Math.round((calories / 2000) * 100));

  // Helper function to format SVG circular progress stroke
  const getCircleStrokeProps = (pct) => {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    return { circumference, offset };
  };

  return (
    <div className="culinary-detail-page">
      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 10000,
          backgroundColor: 'var(--culinary-on-surface)',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: 'var(--radius-editorial-md)',
          boxShadow: 'var(--shadow-editorial-raised)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease'
        }}>
          <Sparkles size={16} style={{ color: 'var(--culinary-saffron)' }} />
          {toastMessage}
        </div>
      )}

      <div className="culinary-container">
        {/* Top Breadcrumb & Action Toolbar */}
        <div className="editorial-breadcrumb-bar">
          <nav className="editorial-breadcrumb">
            <Link to="/">
              <ArrowLeft size={15} /> Home
            </Link>
            <span className="editorial-breadcrumb-sep">/</span>
            <span style={{ color: 'var(--culinary-on-surface)', fontWeight: 600 }}>{recipe.title}</span>
          </nav>

          <div className="editorial-action-strip">
            <button 
              onClick={handleToggleFavorite} 
              className={`btn-editorial-outline ${isFavorite ? 'is-favorite-active' : ''}`}
              title={isFavorite ? 'Saved in collection' : 'Save recipe'}
            >
              <Heart size={16} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
              <span>{isFavorite ? 'Saved' : 'Save'}</span>
            </button>

            <button onClick={handleShare} className="btn-editorial-outline" title="Share recipe">
              <Share2 size={16} />
              <span className="hide-mobile">Share</span>
            </button>

            <button 
              onClick={() => { setIsCookModeOpen(true); setCurrentCookStep(0); }} 
              className="btn-editorial-primary"
            >
              <ChefHat size={17} />
              <span>Cook Mode</span>
            </button>
          </div>
        </div>

        {/* Header Block: Title, Category Eyebrows, Description & Specs */}
        <header className="editorial-header-block">
          <div className="editorial-eyebrows">
            <span className="editorial-tag primary-tag">{recipe.cuisine} Cuisine</span>
            <span className="editorial-tag">{recipe.category}</span>
            {recipe.region && <span className="editorial-tag">{recipe.region}</span>}
            {recipe.isVegetarian ? (
              <span className="editorial-tag veg-tag">Vegetarian</span>
            ) : (
              <span className="editorial-tag nonveg-tag">Non-Vegetarian</span>
            )}
          </div>

          <h1 className="editorial-display-title">{recipe.title}</h1>
          <p className="editorial-lead-description">{recipe.description}</p>

          <div className="editorial-specs-row">
            <div className="editorial-spec-pill">
              <Clock size={16} />
              <span>Time:</span>
              <span className="editorial-spec-val">{recipe.cookingTime} mins</span>
            </div>
            
            <div className="editorial-spec-pill">
              <Users size={16} />
              <span>Yield:</span>
              <span className="editorial-spec-val">{targetServings} {targetServings === 1 ? 'serving' : 'servings'}</span>
            </div>

            <div className="editorial-spec-pill">
              <Flame size={16} />
              <span>Difficulty:</span>
              <span className="editorial-spec-val">{recipe.difficulty}</span>
            </div>

            {calories > 0 && (
              <div className="editorial-spec-pill">
                <Utensils size={16} />
                <span>Energy:</span>
                <span className="editorial-spec-val">{calories} kcal / serving</span>
              </div>
            )}
          </div>
        </header>

        {/* Asymmetrical 7:5 Editorial Layout Grid */}
        <div className="culinary-main-grid">
          
          {/* LEFT COLUMN (7 Columns): Narrative Image & Step Timeline */}
          <div className="editorial-narrative-col">
            
            {/* Hero Image Section */}
            <div className="editorial-hero-frame">
              <img src={recipe.image} alt={recipe.title} className="editorial-hero-img" />
              <div className="editorial-hero-badge">
                <BookOpen size={14} style={{ color: 'var(--culinary-primary)' }} />
                <span>Editorial Culinary Collection</span>
              </div>
            </div>

            {/* Preparation Instructions Timeline */}
            <section className="editorial-instructions-block">
              <div className="editorial-section-title">
                <span>Preparation Instructions</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--culinary-primary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
                  {completedSteps.length} of {totalSteps} completed
                </span>
              </div>

              <div className="editorial-section-subtitle">
                Follow each step methodically. Tap step card to mark complete.
              </div>

              {/* Step Progress Bar */}
              <div className="editorial-progress-bar-container">
                <div 
                  className="editorial-progress-fill" 
                  style={{ width: `${stepProgressPct}%` }}
                />
              </div>

              {/* Step Cards List */}
              <ol className="editorial-steps-list">
                {recipe.instructions.map((step, idx) => {
                  const isDone = completedSteps.includes(idx);
                  const stepNumFormatted = (idx + 1).toString().padStart(2, '0');

                  return (
                    <li 
                      key={idx} 
                      className={`editorial-step-card ${isDone ? 'is-completed' : ''}`}
                      onClick={() => handleToggleStep(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="editorial-step-num">{stepNumFormatted}</span>
                      
                      <div className="editorial-step-content">
                        <p className="editorial-step-text">{step}</p>
                        
                        <div className="editorial-step-footer">
                          <button 
                            className={`editorial-step-toggle ${isDone ? 'checked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStep(idx);
                            }}
                          >
                            <CheckCircle2 size={15} style={{ color: isDone ? '#2e7d32' : 'var(--culinary-sandstone-light)' }} />
                            <span>{isDone ? 'Step Completed' : 'Mark as Done'}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Chef's Notes & Culinary Tips */}
            <div className="editorial-chef-notes">
              <div className="editorial-chef-notes-header">
                <Sparkles size={18} />
                <span>Chef's Editorial Notes</span>
              </div>
              <p className="editorial-chef-notes-body">
                For optimal flavor extraction, prepare and weigh ingredients beforehand. When adjusting serving yields, adjust cooking times slightly for larger batch volumes. Store leftover dishes in sealed glass containers within 2 hours of cooking.
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN (5 Columns): Ingredients Checklist & Nutrition Sidebar */}
          <div className="editorial-sidebar-col">
            <div className="editorial-sidebar-sticky">

              {/* Scalable Ingredients Checklist */}
              <section className="editorial-ingredients-card">
                <div className="editorial-ingredients-header">
                  <h3 className="editorial-ingredients-title">Ingredients</h3>
                  <span className="editorial-ingredients-count">
                    {checkedIngredients.length} of {recipe.ingredients.length} prepped
                  </span>
                </div>

                {/* Servings Scaler Control Widget */}
                <div className="editorial-scaler-box">
                  <div className="editorial-scaler-top">
                    <span className="editorial-scaler-label">Recipe Yield</span>
                    <span className="editorial-scaler-badge">
                      {scalingFactor === 1 ? '1x Base' : `${scalingFactor.toFixed(1)}x Scaled`}
                    </span>
                  </div>

                  <div className="editorial-scaler-controls">
                    <button 
                      onClick={() => setTargetServings(Math.max(1, targetServings - 1))}
                      className="btn-editorial-scale"
                      title="Decrease servings"
                    >
                      -
                    </button>

                    <input 
                      type="number" 
                      className="editorial-servings-input"
                      min="1"
                      max="50"
                      value={targetServings}
                      onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                    />

                    <button 
                      onClick={() => setTargetServings(targetServings + 1)}
                      className="btn-editorial-scale"
                      title="Increase servings"
                    >
                      +
                    </button>
                    
                    <span style={{ fontSize: '0.85rem', color: 'var(--culinary-on-surface-variant)', marginLeft: '0.25rem' }}>
                      servings
                    </span>
                  </div>

                  {/* Servings Quick Presets */}
                  <div className="editorial-scaler-presets">
                    <button 
                      onClick={() => setTargetServings(baseServings)}
                      className={`btn-preset-chip ${targetServings === baseServings ? 'active' : ''}`}
                    >
                      Base ({baseServings})
                    </button>
                    <button 
                      onClick={() => setTargetServings(baseServings * 2)}
                      className={`btn-preset-chip ${targetServings === baseServings * 2 ? 'active' : ''}`}
                    >
                      Double ({baseServings * 2})
                    </button>
                    <button 
                      onClick={() => setTargetServings(Math.max(1, Math.round(baseServings / 2)))}
                      className={`btn-preset-chip ${targetServings === Math.max(1, Math.round(baseServings / 2)) ? 'active' : ''}`}
                    >
                      Half ({Math.max(1, Math.round(baseServings / 2))})
                    </button>
                  </div>
                </div>

                {/* Checklist Rows */}
                <div className="editorial-checklist">
                  {recipe.ingredients.map((ing, idx) => {
                    const scaledQty = Math.round((ing.quantity * scalingFactor) * 100) / 100;
                    const isChecked = checkedIngredients.includes(idx);

                    return (
                      <label 
                        key={idx} 
                        className={`editorial-check-item ${isChecked ? 'checked' : ''}`}
                      >
                        <input 
                          type="checkbox" 
                          className="editorial-custom-checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckIngredient(idx)}
                        />
                        <div className="editorial-ing-details">
                          <span className="editorial-ing-qty">
                            {scaledQty} {ing.unit}
                          </span>
                          <span className="editorial-ing-name">{ing.name}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              {/* Nutrition Facts & Visual Macro Meters */}
              <section className="editorial-nutrition-card" style={{ marginTop: '1.75rem' }}>
                <div className="editorial-nutrition-header">
                  <h3 className="editorial-nutrition-title">Nutritional Profile</h3>
                  {nutrition && (
                    <span className={`editorial-usda-badge ${nutrition.isMock ? 'estimated' : ''}`}>
                      {nutrition.isMock ? 'Estimated' : 'USDA Verified'}
                    </span>
                  )}
                </div>

                {nutritionLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <LoadingSpinner />
                    <p style={{ fontSize: '0.8rem', color: 'var(--culinary-sandstone)', marginTop: '0.5rem' }}>
                      Fetching USDA nutritional metrics...
                    </p>
                  </div>
                ) : nutrition ? (
                  <>
                    {/* SVG Macro Progress Rings */}
                    <div className="editorial-macro-rings-grid">
                      {/* Calories Ring */}
                      <div className="editorial-ring-item">
                        <div className="editorial-svg-ring">
                          <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="26" className="editorial-ring-bg" />
                            <circle 
                              cx="30" 
                              cy="30" 
                              r="26" 
                              className="editorial-ring-val"
                              style={{ 
                                stroke: 'var(--culinary-saffron)',
                                strokeDasharray: getCircleStrokeProps(calPct).circumference,
                                strokeDashoffset: getCircleStrokeProps(calPct).offset
                              }} 
                            />
                          </svg>
                          <div className="editorial-ring-center">{calories}</div>
                        </div>
                        <span className="editorial-ring-label">Calories</span>
                        <span className="editorial-ring-subtext">kcal</span>
                      </div>

                      {/* Protein Ring */}
                      <div className="editorial-ring-item">
                        <div className="editorial-svg-ring">
                          <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="26" className="editorial-ring-bg" />
                            <circle 
                              cx="30" 
                              cy="30" 
                              r="26" 
                              className="editorial-ring-val"
                              style={{ 
                                stroke: '#2e7d32',
                                strokeDasharray: getCircleStrokeProps(proteinPct).circumference,
                                strokeDashoffset: getCircleStrokeProps(proteinPct).offset
                              }} 
                            />
                          </svg>
                          <div className="editorial-ring-center">{protein}g</div>
                        </div>
                        <span className="editorial-ring-label">Protein</span>
                        <span className="editorial-ring-subtext">{proteinPct}% DV</span>
                      </div>

                      {/* Carbs Ring */}
                      <div className="editorial-ring-item">
                        <div className="editorial-svg-ring">
                          <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="26" className="editorial-ring-bg" />
                            <circle 
                              cx="30" 
                              cy="30" 
                              r="26" 
                              className="editorial-ring-val"
                              style={{ 
                                stroke: '#1976d2',
                                strokeDasharray: getCircleStrokeProps(carbsPct).circumference,
                                strokeDashoffset: getCircleStrokeProps(carbsPct).offset
                              }} 
                            />
                          </svg>
                          <div className="editorial-ring-center">{carbs}g</div>
                        </div>
                        <span className="editorial-ring-label">Carbs</span>
                        <span className="editorial-ring-subtext">{carbsPct}% DV</span>
                      </div>

                      {/* Fat Ring */}
                      <div className="editorial-ring-item">
                        <div className="editorial-svg-ring">
                          <svg viewBox="0 0 60 60">
                            <circle cx="30" cy="30" r="26" className="editorial-ring-bg" />
                            <circle 
                              cx="30" 
                              cy="30" 
                              r="26" 
                              className="editorial-ring-val"
                              style={{ 
                                stroke: 'var(--culinary-primary)',
                                strokeDasharray: getCircleStrokeProps(fatPct).circumference,
                                strokeDashoffset: getCircleStrokeProps(fatPct).offset
                              }} 
                            />
                          </svg>
                          <div className="editorial-ring-center">{fat}g</div>
                        </div>
                        <span className="editorial-ring-label">Total Fat</span>
                        <span className="editorial-ring-subtext">{fatPct}% DV</span>
                      </div>
                    </div>

                    {/* Official USDA Table Replica */}
                    <div className="editorial-usda-table">
                      <div className="usda-header-title">Nutrition Facts</div>
                      <div className="usda-servings-info">
                        <div>Serving Size: 1 plate ({Math.round(100 / baseServings) * baseServings}g)</div>
                        <div>Servings Per Container: {baseServings}</div>
                      </div>

                      <div className="usda-calories-box">
                        <span className="usda-calories-title">Calories</span>
                        <span className="usda-calories-number">{calories}</span>
                      </div>

                      <div className="usda-dv-header">% Daily Value *</div>

                      <div className="usda-row bold">
                        <span>Total Fat {fat}g</span>
                        <span>{fatPct}%</span>
                      </div>

                      <div className="usda-row indent">
                        <span>Saturated Fat {Math.round((fat * 0.3) * 10) / 10}g</span>
                        <span>{Math.round((fat * 0.3 / 20) * 100)}%</span>
                      </div>

                      <div className="usda-row bold">
                        <span>Total Carbohydrate {carbs}g</span>
                        <span>{carbsPct}%</span>
                      </div>

                      <div className="usda-row indent">
                        <span>Dietary Fiber {Math.round((carbs * 0.1) * 10) / 10}g</span>
                        <span>{Math.round((carbs * 0.1 / 28) * 100)}%</span>
                      </div>

                      <div className="usda-row bold">
                        <span>Protein {protein}g</span>
                        <span>{proteinPct}%</span>
                      </div>

                      <div className="usda-footnote">
                        * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet of 2,000 calories a day.
                      </div>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--culinary-sandstone)', textAlign: 'center' }}>
                    Nutritional metrics unavailable for this recipe.
                  </p>
                )}
              </section>

            </div>
          </div>

        </div>
      </div>

      {/* HANDS-FREE COOKING MODE MODAL OVERLAY */}
      {isCookModeOpen && (
        <div className="cook-mode-overlay" onClick={() => setIsCookModeOpen(false)}>
          <div className="cook-mode-modal" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="cook-mode-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ChefHat size={22} style={{ color: 'var(--culinary-saffron)' }} />
                <span className="cook-mode-title">{recipe.title} — Hands-Free Cook Mode</span>
              </div>
              <button 
                onClick={() => setIsCookModeOpen(false)}
                style={{ cursor: 'pointer', color: 'var(--culinary-on-surface-variant)' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Step Body */}
            <div className="cook-mode-body">
              <div className="cook-mode-step-badge">
                {(currentCookStep + 1).toString().padStart(2, '0')}
              </div>

              <p className="cook-mode-step-text">
                {recipe.instructions[currentCookStep]}
              </p>

              <div style={{ 
                marginTop: 'auto', 
                backgroundColor: 'var(--culinary-surface-low)', 
                border: '1px solid var(--culinary-border)',
                borderRadius: 'var(--radius-editorial-md)',
                padding: '1rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <CheckCircle2 
                  size={18} 
                  style={{ color: completedSteps.includes(currentCookStep) ? '#2e7d32' : 'var(--culinary-sandstone)' }} 
                />
                <button 
                  onClick={() => handleToggleStep(currentCookStep)}
                  style={{ background: 'none', border: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {completedSteps.includes(currentCookStep) ? 'Marked as Completed' : 'Mark Step as Completed'}
                </button>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="cook-mode-footer">
              <button 
                onClick={() => setCurrentCookStep(Math.max(0, currentCookStep - 1))}
                disabled={currentCookStep === 0}
                className="btn-editorial-outline"
                style={{ opacity: currentCookStep === 0 ? 0.4 : 1 }}
              >
                <ChevronLeft size={18} /> Previous Step
              </button>

              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--culinary-on-surface-variant)' }}>
                Step {currentCookStep + 1} of {totalSteps}
              </span>

              <button 
                onClick={() => setCurrentCookStep(Math.min(totalSteps - 1, currentCookStep + 1))}
                disabled={currentCookStep === totalSteps - 1}
                className="btn-editorial-primary"
                style={{ opacity: currentCookStep === totalSteps - 1 ? 0.4 : 1 }}
              >
                Next Step <ChevronRight size={18} />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetails;
