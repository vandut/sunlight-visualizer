import React, { useEffect } from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const GeolocationInitializer: React.FC = () => {
  const setLocation = useSimulationStore(state => state.setLocation);
  const setLocationName = useSimulationStore(state => state.setLocationName);

  useEffect(() => {
    let isCancelled = false;

    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    const successCallback = async (position: GeolocationPosition) => {
      if (isCancelled) return;
      
      const { latitude, longitude } = position.coords;
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      console.log(`Location found: ${latitude}, ${longitude}. Timezone: ${timeZone}`);
      setLocation({
        latitude,
        longitude,
        timeZone,
      });

      // Reverse geocode to get city name
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`);
        if(isCancelled) return;
        
        if (!response.ok) {
          throw new Error('Reverse geocoding request failed');
        }

        const data = await response.json();
        if (data && data.address) {
          const name = data.address.city || data.address.town || data.address.village || data.display_name.split(',')[0];
          if (name) setLocationName(name);
        } else {
          setLocationName('Current Location');
        }
      } catch (e) {
        if (!isCancelled) {
          console.warn('Reverse geocoding failed, using generic name.', e);
          setLocationName('Current Location');
        }
      }
    };

    const errorCallback = (error: GeolocationPositionError) => {
      if (isCancelled) return;
      
      console.warn(`Could not get location: ${error.message}. Using default location.`);
    };

    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isCancelled = true;
    };
  }, [setLocation, setLocationName]);

  return null; // This component renders nothing
};

export default GeolocationInitializer;