import React, { useMemo } from 'react';
import useSimulationStore from '../stores/useSimulationStore';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const DateTimeDisplay = () => {
  const date = useSimulationStore((state) => state.date);
  const time = useSimulationStore((state) => state.time);

  const formattedDate = useMemo(() => {
    let dayOfYear = date;
    let monthIndex = 0;
    while (dayOfYear > DAYS_IN_MONTH[monthIndex] && monthIndex < 11) {
      dayOfYear -= DAYS_IN_MONTH[monthIndex];
      monthIndex++;
    }
    return `${MONTHS[monthIndex]} ${dayOfYear}`;
  }, [date]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    const paddedHours = String(hours).padStart(2, '0');
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${paddedHours}:${paddedMinutes}`;
  }, [time]);

  return (
    <div 
      className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 select-none pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <p 
        className="text-slate-800 text-sm font-semibold text-center font-mono tracking-wider"
        aria-label={`Current date: ${formattedDate}`}
      >
        {formattedDate}
      </p>
      <p 
        className="text-slate-800 text-2xl font-bold text-center font-mono tracking-tighter -mt-1"
        aria-label={`Current time: ${formattedTime}`}
      >
        {formattedTime}
      </p>
    </div>
  );
};

export default DateTimeDisplay;