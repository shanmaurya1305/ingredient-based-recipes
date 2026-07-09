import React from 'react';
import { Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="footer" className="footer">
      <div className="container">
        {/* Footer Top Grid */}
        <div className="footer-grid">
          {/* Column 1: Logo and Tagline */}
          <div className="footer-column">
            <h3 className="footer-logo">Be The Chef</h3>
            <p className="footer-text">
              Discover authentic Indian recipes from many cultures, tastes, and regions of India, and we'll tell you what to cook.
            </p>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social-icon" aria-label="Youtube">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><polyline points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
              </a>
            </div>
          </div>

          {/* Column 2: By Region */}
          <div className="footer-column">
            <h4 className="footer-heading">By Region</h4>
            <ul className="footer-links">
              <li><a href="#featured-recipes" className="footer-link">North Indian</a></li>
              <li><a href="#featured-recipes" className="footer-link">South Indian</a></li>
              <li><a href="#featured-recipes" className="footer-link">East Indian</a></li>
              <li><a href="#featured-recipes" className="footer-link">West Indian</a></li>
              <li><a href="#featured-recipes" className="footer-link">Central Indian</a></li>
              <li><a href="#featured-recipes" className="footer-link">North East Indian</a></li>
            </ul>
          </div>

          {/* Column 3: By Meal */}
          <div className="footer-column">
            <h4 className="footer-heading">By Meal</h4>
            <ul className="footer-links">
              <li><a href="#featured-recipes" className="footer-link">Breakfast</a></li>
              <li><a href="#featured-recipes" className="footer-link">Lunch</a></li>
              <li><a href="#featured-recipes" className="footer-link">Dinner</a></li>
              <li><a href="#featured-recipes" className="footer-link">Snacks</a></li>
              <li><a href="#featured-recipes" className="footer-link">Sweets</a></li>
              <li><a href="#featured-recipes" className="footer-link">Beverages</a></li>
            </ul>
          </div>

          {/* Column 4: Connect & Newsletter */}
          <div className="footer-column">
            <h4 className="footer-heading">Connect</h4>
            <div className="footer-links" style={{ gap: '0.5rem' }}>
              <div className="footer-contact-item">
                <Mail size={16} />
                <span>info@bethechef.in</span>
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>Bangalore, Karnataka, India</span>
              </div>
            </div>
            
            <div style={{ marginTop: '0.75rem' }}>
              <h4 className="footer-heading" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                Subscribe for weekly recipes
              </h4>
              <form className="footer-subscribe-row" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  className="footer-subscribe-input"
                  required
                />
                <button type="submit" className="footer-subscribe-btn">
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Bottom copyright and legal */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} Be The Chef. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#footer" className="footer-link">Privacy Policy</a>
            <a href="#footer" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
