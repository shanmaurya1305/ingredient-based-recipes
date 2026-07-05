import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, LogOut, Heart, Search } from 'lucide-react';

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
        <Link to="/" className="logo">
          <Flame size={24} style={{ fill: 'var(--accent-primary)', color: 'var(--accent-primary)' }} />
          <span>Be The Chef</span>
        </Link>
        
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} end>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Search size={16} /> Recommendation
              </span>
            </NavLink>
          </li>
          
          {user ? (
            <>
              <li>
                <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={16} /> Favorites
                  </span>
                </NavLink>
              </li>
              <li>
                <span className="user-badge">Hi, {user.username}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn-logout" title="Logout">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <LogOut size={16} /> Logout
                  </span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" className="nav-link nav-link-login">
                  Log In
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" className="nav-link nav-link-register">
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
