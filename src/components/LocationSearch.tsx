import React, { useState, useEffect, useCallback, useRef } from 'react';
import useSimulationStore from '../stores/useSimulationStore';

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const LocationSearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);


const LocationSearch = () => {
  const setLocation = useSimulationStore((state) => state.setLocation);
  const currentLocation = useSimulationStore((state) => state.location);
  const locationName = useSimulationStore((state) => state.locationName);
  const setLocationName = useSimulationStore((state) => state.setLocationName);
  
  const [query, setQuery] = useState(locationName);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimeout = useRef<number | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  // Sync input field if locationName changes from another source (e.g., geolocation or Drive sync)
  useEffect(() => {
    setQuery(locationName);
  }, [locationName]);

  const fetchLocations = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setResults([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          searchQuery
        )}&limit=5`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: SearchResult[] = await response.json();
       if (data.length === 0) {
        setError('No locations found.');
      }
      setResults(data);
    } catch (e) {
      setError('Failed to fetch locations. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    if(query.trim().length >= 3) {
        debounceTimeout.current = window.setTimeout(() => {
          fetchLocations(query);
        }, 500); // 500ms debounce
    } else {
        setResults([]);
        setError(null);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query, fetchLocations]);
  
  // Effect to handle clicks outside the component to close the results list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSelectLocation = (result: SearchResult) => {
    const name = result.display_name.split(',')[0] || result.display_name;
    setLocation({
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      timeZone: currentLocation.timeZone, // Keep existing timezone
    });
    setLocationName(name); // Persist the name
    setResults([]);
    setError(null);
    setIsFocused(false);
  };

  const showResults = isFocused && (results.length > 0 || error || isLoading);

  return (
    <div className="relative" ref={componentRef}>
       <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <LocationSearchIcon />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search city..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            aria-label="Search for a location"
          />
          {isLoading && (
             <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-400 border-solid border-t-transparent rounded-full animate-spin"></div>
          )}
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {error && !isLoading && <p className="p-3 text-sm text-slate-500">{error}</p>}
          <ul>
            {results.map((result) => (
              <li key={result.place_id}>
                <button
                  onClick={() => handleSelectLocation(result)}
                  className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {result.display_name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;