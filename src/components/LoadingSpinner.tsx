import React from 'react';

const LoadingSpinner = () => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      aria-label="Loading model..."
      role="status"
    >
      <div className="w-16 h-16 border-4 border-white border-solid border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;