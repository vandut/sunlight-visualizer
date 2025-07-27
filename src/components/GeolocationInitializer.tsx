import React from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const LocationDisplay = () => {
  const locationName = useSimulationStore((state) => state.locationName);

  if (!locationName) {
    return null;
  }

  return (
    <div 
      className="absolute top-4 left-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 select-none pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <p 
        className="text-slate-800 text-lg font-semibold text-center font-mono tracking-wider"
        aria-label={`Current location: ${locationName}`}
      >
        {locationName}
      </p>
    </div>
  );
};

export default LocationDisplay;