import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingCart, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Elegant Serif Logo */}
        <Link to="/" className="logo">
          Be The Chef
        </Link>
        
        {/* Center Links */}
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
              Recipes
            </NavLink>
          </li>
          <li>
            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>
          </li>
          <li>
            <a href="#featured-recipes" className="nav-link">
              Regions
            </a>
          </li>
          <li>
            <a href="#footer" className="nav-link">
              Pricing
            </a>
          </li>
        </ul>

        {/* Right Side Controls */}
        <div className="nav-icons-group">
          {/* Favorites Heart Icon */}
          <Link to={user ? "/favorites" : "/login"} className="nav-icon-link" title="Favorites">
            <Heart size={20} />
          </Link>

          {/* Cart Icon (Representing Shopping List) */}
          <Link to={user ? "/favorites" : "/login"} className="nav-icon-link" title="Shopping List">
            <ShoppingCart size={20} />
          </Link>

          {user ? (
            <>
              <div className="user-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={14} />
                <span>Hi, {user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={18} />
                <span style={{ fontSize: '0.85rem' }}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-login">
                Sign In
              </Link>
              <Link to="/register" className="nav-link-register">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
