import SunCalc from 'suncalc';
import type { Location } from './sun-position';
import { getOffsetInMinutes } from './sun-position';

/**
 * Calculates the theoretical sunlight intensity (in lux) for each hour of a given day.
 *
 * @param date - The day of the year (1-365).
 * @param location - The geographical location for the calculation.
 * @returns An array of 24 numbers, where each number is the calculated lux value for that hour (0-23).
 */
export const getDailySunlightData = (date: number, location: Location): number[] => {
  const hourlyLux: number[] = [];
  const currentYear = new Date().getFullYear();

  // Pre-calculate the timezone offset difference to avoid doing it in the loop.
  // This is the difference between the target location's timezone and the browser's timezone.
  const tempDateForOffset = new Date(currentYear, 0, date);
  const targetOffsetMinutes = getOffsetInMinutes(location.timeZone, tempDateForOffset);
  const localOffsetMinutes = -tempDateForOffset.getTimezoneOffset();
  const offsetDifferenceMinutes = targetOffsetMinutes - localOffsetMinutes;

  for (let hour = 0; hour < 24; hour++) {
    // Create a Date object representing the specific hour at the target location.
    // We adjust the minutes by the pre-calculated offset to get the correct UTC time
    // that corresponds to the local hour in the target timezone.
    const simDate = new Date(currentYear, 0, date);
    simDate.setHours(hour, -offsetDifferenceMinutes, 0, 0);

    // Get the sun's position for this precise moment.
    const sunPosition = SunCalc.getPosition(
      simDate,
      location.latitude,
      location.longitude
    );
    const altitude = sunPosition.altitude; // Altitude in radians

    let lux = 0;
    if (altitude > 0) {
      // A simplified model for sunlight intensity based on the sine of the sun's altitude.
      // Max lux (100,000) occurs when the sun is directly overhead (altitude = PI/2).
      lux = 100000 * Math.sin(altitude);
    }

    hourlyLux.push(Math.round(lux));
  }

  return hourlyLux;
};