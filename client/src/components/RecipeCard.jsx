import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';

const RecipeCard = ({ recipe, isFavorite, onToggleFavorite }) => {
  const { _id, title, description, image, cookingTime, servings, difficulty, matchPercentage } = recipe;

  // Clever helper to classify Veg vs Non-Veg based on recipe keywords
  const isNonVeg = title.toLowerCase().includes('chicken') || 
                    title.toLowerCase().includes('fish') || 
                    title.toLowerCase().includes('mutton') || 
                    title.toLowerCase().includes('egg');

  // Helper to determine the regional badge based on title keywords
  const getRegionTag = (titleStr) => {
    const t = titleStr.toLowerCase();
    if (t.includes('paneer') || t.includes('tikka')) return 'Punjabi';
    if (t.includes('fish curry') || t.includes('malabar')) return 'Kerala';
    if (t.includes('baati') || t.includes('churma') || t.includes('dal baati')) return 'Rajasthani';
    if (t.includes('fish fry') || t.includes('kolkata')) return 'West Bengal';
    if (t.includes('biryani') || t.includes('awadhi')) return 'Uttar Pradesh';
    if (t.includes('tiffin') || t.includes('dosa') || t.includes('idli')) return 'South Indian';
    if (t.includes('dal tadka') || t.includes('dal')) return 'North Indian';
    if (t.includes('chana') || t.includes('chole')) return 'Punjabi';
    if (t.includes('gobi') || t.includes('aloo')) return 'North Indian';
    if (t.includes('chai')) return 'Beverage';
    if (t.includes('naan')) return 'North Indian';
    return 'Indian';
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent navigating to the details page
    e.stopPropagation();
    onToggleFavorite(_id);
  };

  return (
    <Link to={`/recipes/${_id}`} className="recipe-card">
      {/* Image Container with Badges */}
      <div className="card-img-wrapper">
        <img src={image} alt={title} className="card-img" loading="lazy" />
        
        {/* Double Tag Pill overlays (Veg/Non-Veg + Region) */}
        <div className="card-badge-container">
          <span className={`card-badge ${isNonVeg ? 'nonveg' : 'veg'}`}>
            {isNonVeg ? 'Non-Veg' : 'Veg'}
          </span>
          <span className="card-badge region">
            {getRegionTag(title)}
          </span>
        </div>
        
        {/* Heart Favorite Trigger */}
        {onToggleFavorite && (
          <button 
            onClick={handleFavoriteClick} 
            className={`card-favorite-btn ${isFavorite ? 'is-active' : ''}`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart size={18} style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">
          {description || "Discover a classic taste of authentic spices and traditional Indian flavors made easy."}
        </p>
        
        {/* Card Footer Info */}
        <div className="card-stats">
          <div className="card-stat">
            <Clock size={15} style={{ color: 'var(--text-secondary)' }} />
            <span>{cookingTime}m</span>
          </div>
          <div className="card-stat">
            <Users size={15} style={{ color: 'var(--text-secondary)' }} />
            <span>{servings || 2} Servings</span>
          </div>
          <div className="card-stat">
            <span className="card-stat-difficulty">{difficulty}</span>
          </div>
        </div>

        {/* Dynamic Search Match Badge */}
        {matchPercentage !== undefined && (
          <div className="match-percentage-badge">
            {matchPercentage}% Match Score
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;
