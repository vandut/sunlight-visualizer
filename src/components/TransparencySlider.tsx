import React from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const TransparencySlider = () => {
  const modelOpacity = useSimulationStore((state) => state.modelOpacity);
  const setModelOpacity = useSimulationStore((state) => state.setModelOpacity);

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setModelOpacity(value / 100); // Convert 0-100 to 0.0-1.0
  };

  return (
    <div 
      className="p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 flex items-center space-x-2 pointer-events-auto select-none"
      aria-label="Transparency control panel"
    >
      {/* Icon representing transparency or a cross-section */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="text-slate-600 flex-shrink-0"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M21 3H3V21H21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M15.5 8.5H8.5V15.5H15.5V8.5Z" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
      </svg>
      
      <input
        type="range"
        min="0"
        max="100"
        value={modelOpacity * 100}
        onChange={handleOpacityChange}
        className="w-24 h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
        aria-label="Building transparency"
      />
    </div>
  );
};

export default TransparencySlider;