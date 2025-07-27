import React, { useRef, useCallback, useMemo } from 'react';
import useSimulationStore from '../stores/useSimulationStore';
import SunCalc from 'suncalc';
import { SunriseIcon, SunsetIcon } from '../constants/icons';

const TimeSlider = () => {
  const time = useSimulationStore((state) => state.time);
  const setTime = useSimulationStore((state) => state.setTime);
  const date = useSimulationStore((state) => state.date);
  const location = useSimulationStore((state) => state.location);
  const sliderRef = useRef<HTMLDivElement>(null);

  const TOTAL_MINUTES = 24 * 60;

  // Memoize sun time calculations to avoid re-running on every render.
  // This will only re-calculate when the date or location changes.
  const sunTimes = useMemo(() => {
    const tempDate = new Date(new Date().getFullYear(), 0, date);
    const { sunrise, sunset } = SunCalc.getTimes(tempDate, location.latitude, location.longitude);

    const toMinutes = (d: Date) => {
      if (!d || isNaN(d.getTime())) return null;
      return d.getHours() * 60 + d.getMinutes();
    };

    return {
      sunriseMinutes: toMinutes(sunrise),
      sunsetMinutes: toMinutes(sunset),
    };
  }, [date, location.latitude, location.longitude]);

  const handleInteraction = useCallback((clientY: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const height = rect.height;
    const percentage = Math.max(0, Math.min(1, y / height));
    const newTime = Math.round(percentage * (TOTAL_MINUTES - 1));
    setTime(newTime);
  }, [setTime]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleInteraction(e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleInteraction(moveEvent.clientY);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleInteraction(e.touches[0].clientY);
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        // Prevent default browser actions like pull-to-refresh or scrolling
        moveEvent.preventDefault();
        handleInteraction(moveEvent.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    // Add event listeners with `passive: false` to allow `preventDefault`
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  const thumbPositionPercent = (time / (TOTAL_MINUTES - 1)) * 100;

  const getLabel = (hour: number) => {
      if (hour === 24) return `12a`; // Special case for the end tick
      const h = hour % 24;
      const period = h < 12 ? 'a' : 'p';
      let displayHour = h % 12;
      if (displayHour === 0) displayHour = 12;
      return `${displayHour}${period}`;
  };

  return (
    <div 
        className="h-full w-full bg-white py-4 border-l border-slate-200 shadow-lg flex items-center justify-center cursor-pointer select-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={TOTAL_MINUTES - 1}
        aria-valuenow={time}
        aria-orientation="vertical"
        aria-label="Time of day"
        style={{ touchAction: 'pan-x' }} // Prevents vertical swipe gestures on touch devices
    >
      <div
        ref={sliderRef}
        className="relative w-[56px] h-full"
      >
        {/* 15-min Ticks */}
        {Array.from({ length: (24 * 4) + 1 }).map((_, i) => {
            const positionPercent = (i / (24 * 4)) * 100;
            return (
                <div key={`minute-tick-${i}`} className="absolute w-2 h-px bg-slate-300 -translate-y-1/2" style={{ top: `${positionPercent}%`, left: '12px' }} />
            )
        })}

        {/* Hour Ticks and Labels */}
        {Array.from({ length: 25 }).map((_, hour) => {
          const positionPercent = (hour / 24) * 100;
          return (
            <div
              key={`hour-marker-${hour}`}
              className="absolute w-4 h-px bg-slate-500 -translate-y-1/2"
              style={{ top: `${positionPercent}%`, left: '12px' }}
            >
              <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 text-xs text-slate-700 font-medium whitespace-nowrap">
                  {getLabel(hour)}
              </span>
            </div>
          );
        })}

        {/* Sunrise Icon */}
        {sunTimes.sunriseMinutes !== null && (
          <div
            className="absolute -translate-y-1/2 pointer-events-none"
            style={{
              top: `${(sunTimes.sunriseMinutes / TOTAL_MINUTES) * 100}%`,
              left: '9px', // Align with the ticks
            }}
            title={`Sunrise: ${Math.floor(
              sunTimes.sunriseMinutes / 60
            )}:${(sunTimes.sunriseMinutes % 60).toString().padStart(2, '0')}`}
            aria-label="Sunrise time"
          >
            <SunriseIcon />
          </div>
        )}

        {/* Sunset Icon */}
        {sunTimes.sunsetMinutes !== null && (
          <div
            className="absolute -translate-y-1/2 pointer-events-none"
            style={{
              top: `${(sunTimes.sunsetMinutes / TOTAL_MINUTES) * 100}%`,
              left: '9px', // Align with the ticks
            }}
            title={`Sunset: ${Math.floor(
              sunTimes.sunsetMinutes / 60
            )}:${(sunTimes.sunsetMinutes % 60).toString().padStart(2, '0')}`}
            aria-label="Sunset time"
          >
            <SunsetIcon />
          </div>
        )}
        
        {/* Thumb */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: `${thumbPositionPercent}%`,
            left: '0px', // Positioned to touch the ticks
            transform: 'translateY(-50%)',
          }}
        >
          <div className="w-0 h-0 
            border-t-[8px] border-t-transparent 
            border-b-[8px] border-b-transparent 
            border-l-[12px] border-l-red-600 
            shadow-lg"
          ></div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max={TOTAL_MINUTES - 1}
        value={time}
        onChange={(e) => setTime(Number(e.target.value))}
        className="sr-only"
        aria-label="Time of day"
      />
    </div>
  );
};

export default TimeSlider;