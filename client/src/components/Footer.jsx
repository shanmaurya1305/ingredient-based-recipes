import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} Be The Chef. Built for computer science MERN Stack portfolio.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
          Powered by USDA FoodData Central.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
