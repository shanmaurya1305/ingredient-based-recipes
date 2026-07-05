import React from 'react';

const LoadingSpinner = () => {
  return (
    <div style={spinnerContainerStyle}>
      <div style={spinnerStyle}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const spinnerContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem'
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid var(--border-color)',
  borderTop: '4px solid var(--accent-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default LoadingSpinner;
