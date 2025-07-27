import React, { useRef, useCallback } from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const DateSlider = () => {
  const date = useSimulationStore((state) => state.date);
  const setDate = useSimulationStore((state) => state.setDate);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Constants for date calculation
  const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const TOTAL_DAYS = 365;

  // Generate cumulative days for month marker positions
  const cumulativeDays = DAYS_IN_MONTH.reduce((acc, days, i) => {
    const prevDays = i > 0 ? acc[i - 1] : 0;
    acc.push(prevDays + days);
    return acc;
  }, [] as number[]);
  
  // Generate start days for each month (0-indexed)
  const monthStartDays = [0, ...cumulativeDays.slice(0, -1)];

  // Generate intermediate ticks for every 5th day of each month
  const dateTicks = monthStartDays.flatMap((startDay, monthIndex) => {
    const daysInThisMonth = DAYS_IN_MONTH[monthIndex];
    const ticks = [];
    for (let d = 5; d < daysInThisMonth; d += 5) {
        ticks.push(startDay + d);
    }
    return ticks;
  });

  // Function to update day based on mouse/touch position
  const handleInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(1, x / width));
    const newDay = Math.round(percentage * (TOTAL_DAYS - 1)) + 1;
    setDate(newDay);
  }, [setDate]);

  // --- Event Handlers ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleInteraction(e.clientX);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      handleInteraction(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    handleInteraction(e.touches[0].clientX);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        // Prevent the default browser action (e.g., swipe to navigate back)
        moveEvent.preventDefault();
        handleInteraction(moveEvent.touches[0].clientX);
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

  const thumbPositionPercent = ((date - 1) / (TOTAL_DAYS - 1)) * 100;

  return (
    <div 
      className="w-full bg-white px-4 pt-2 pb-6 border-t border-slate-200 shadow-t-md cursor-pointer select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="slider"
      aria-valuemin={1}
      aria-valuemax={TOTAL_DAYS}
      aria-valuenow={date}
      aria-label="Day of the year"
      style={{ touchAction: 'pan-y' }} // Prevents horizontal swipe gestures on touch devices
    >
      <div
        ref={sliderRef}
        className="relative w-full h-8"
      >
        {/* Intra-month Ticks */}
        {dateTicks.map((tickDay, i) => {
            const positionPercent = (tickDay / (TOTAL_DAYS - 1)) * 100;
            if (positionPercent > 100) return null;
            return (
              <div
                key={`date-tick-${i}`}
                className="absolute top-[11px] h-2 w-px bg-slate-300"
                style={{ left: `${positionPercent}%` }}
              />
            );
        })}

        {/* Month Ticks (Bolder) */}
        {monthStartDays.map((startDay, i) => {
          const positionPercent = (startDay / (TOTAL_DAYS - 1)) * 100;
          return (
            <div
              key={`month-tick-${i}`}
              className="absolute top-[9px] h-4 w-0.5 bg-slate-700"
              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
            />
          );
        })}
        {/* Final bold tick */}
        <div
            key="month-tick-end"
            className="absolute top-[9px] h-4 w-0.5 bg-slate-700"
            style={{ left: `100%`, transform: 'translateX(-50%)' }}
        />

        {/* Month Labels (Centered) */}
        {MONTHS.map((month, i) => {
          const startDay = monthStartDays[i];
          const midPoint = startDay + (DAYS_IN_MONTH[i] / 2);
          const positionPercent = (midPoint / (TOTAL_DAYS - 1)) * 100;
          return (
            <span
              key={`month-label-${i}`}
              className="absolute top-[28px] text-xs text-slate-700 font-medium"
              style={{ left: `${positionPercent}%`, transform: 'translateX(-50%)' }}
            >
              {month}
            </span>
          );
        })}

        {/* Thumb */}
        <div
          className="absolute -translate-x-1/2 pointer-events-none"
          style={{
            left: `${thumbPositionPercent}%`,
            top: '-5px' // Positioned above the ticks
          }}
        >
          <div className="w-0 h-0 
            border-l-[8px] border-l-transparent
            border-r-[8px] border-r-transparent
            border-t-[12px] border-t-red-600
            shadow-lg" 
          />
        </div>
      </div>

      <input
        type="range"
        min="1"
        max={TOTAL_DAYS}
        value={date}
        onChange={(e) => setDate(Number(e.target.value))}
        className="sr-only"
        aria-label="Day of the year"
      />
    </div>
  );
};

export default DateSlider;