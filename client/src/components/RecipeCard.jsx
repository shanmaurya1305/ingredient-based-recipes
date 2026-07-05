import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart, Heart } from 'lucide-react';

const RecipeCard = ({ recipe, isFavorite, onToggleFavorite }) => {
  const { _id, title, image, cookingTime, difficulty, category, matchPercentage } = recipe;

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Stop navigation to details page
    e.stopPropagation();
    onToggleFavorite(_id);
  };

  return (
    <Link to={`/recipes/${_id}`} className="recipe-card">
      <div className="card-img-wrapper">
        <img src={image} alt={title} className="card-img" loading="lazy" />
        <span className="card-tag">{difficulty}</span>
        
        {/* Only show interactive heart if handler is passed */}
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

      <div className="card-content">
        <span className="card-meta-category">{category}</span>
        <h3 className="card-title">{title}</h3>
        
        <div className="card-stats">
          <div className="card-stat">
            <Clock size={14} />
            <span>{cookingTime} mins</span>
          </div>
          <div className="card-stat">
            <BarChart size={14} />
            <span>{difficulty}</span>
          </div>
        </div>

        {/* Display Match Percentage if available from recommendation search */}
        {matchPercentage !== undefined && (
          <div className="match-bar-container">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matching Ingredients:</span>
            <span className="match-percentage">{matchPercentage}% Match</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard;
