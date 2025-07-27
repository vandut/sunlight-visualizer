import SunCalc from 'suncalc';
import { Color } from 'three';

export interface Location {
  latitude: number;
  longitude: number;
  timeZone: string; // IANA timezone name e.g., "Europe/Warsaw"
}

// Default location: Kraków, Poland
const DEFAULT_LOCATION: Location = {
  latitude: 50.06,
  longitude: 19.94,
  timeZone: 'Europe/Warsaw',
};

/**
 * Calculates the timezone offset in minutes for a given IANA timezone and date.
 * This is the key to handling Daylight Saving Time correctly.
 * @param timeZone The IANA timezone name (e.g., "America/New_York").
 * @param date The date for which to find the offset.
 * @returns The offset from UTC in minutes.
 */
export const getOffsetInMinutes = (timeZone: string, date: Date): number => {
  try {
    // Create a date string for the given date in the target timezone.
    const tzDateString = date.toLocaleString('en-US', { timeZone });
    // Create a date string for the same date in UTC.
    const utcDateString = date.toLocaleString('en-US', { timeZone: 'UTC' });

    // Parse both strings back into Date objects.
    const tzDate = new Date(tzDateString);
    const utcDate = new Date(utcDateString);

    // The difference in their millisecond values gives us the offset.
    return (tzDate.getTime() - utcDate.getTime()) / 60000;
  } catch (e) {
    console.error('Invalid timezone provided to getOffsetInMinutes:', timeZone, e);
    // Fallback to UTC if timezone is invalid
    return 0;
  }
};


/**
 * Calculates the sun's 3D Cartesian position vector based on time and location.
 * The returned vector is suitable for positioning a light in a Three.js scene.
 * The coordinate system is right-handed, Y-up, with -Z as North and +X as East.
 * This ensures that when viewing the scene from the South (looking towards -Z),
 * East is on the right, matching standard map conventions.
 *
 * @param date - The specific date and time for the calculation. This must be a correct Date object, adjusted for timezone.
 * @param location - An object with `latitude`, `longitude`, and `timeZone`.
 * @returns A normalized 3D vector [x, y, z] representing the sun's direction.
 */
export const getSunPosition = (
  date: Date,
  location: Location = DEFAULT_LOCATION
): [number, number, number] => {
  // Get sun's position from suncalc library in spherical coordinates.
  const sunPosition = SunCalc.getPosition(
    date,
    location.latitude,
    location.longitude
  );
  const { azimuth, altitude } = sunPosition;

  // Convert from spherical (azimuth, altitude) to Cartesian (x, y, z) coordinates.
  // SunCalc's azimuth is from South, clockwise (S=0, W=PI/2, N=PI, E=3PI/2).
  // We orient our scene so that -Z is North and +X is East.
  // To match this, we transform the suncalc coordinates.
  const x = -Math.cos(altitude) * Math.sin(azimuth);
  const y = Math.sin(altitude);
  const z = Math.cos(altitude) * Math.cos(azimuth);

  return [x, y, z];
};

// --- Sky Color Calculation ---

// Define color stops for sky gradient
const skyColors = {
  night: new Color('#000010'),
  civilTwilight: new Color('#2E4482'), // Dark blue/purple
  sunrise: new Color('#FF8C00'),     // Dark Orange
  goldenHour: new Color('#FFD700'),  // Gold
  day: new Color('#87CEEB'),         // Sky Blue
  zenith: new Color('#4682B4'),      // Deeper Blue
};

// Altitude thresholds in radians
const altitudeThresholds = {
  civilTwilight: -6 * (Math.PI / 180),
  sunrise: 0 * (Math.PI / 180),
  goldenHour: 6 * (Math.PI / 180),
  day: 15 * (Math.PI / 180),
  zenith: 90 * (Math.PI / 180),
};

/**
 * Calculates the sky color by interpolating between predefined colors based on the sun's altitude.
 * @param altitude The sun's altitude in radians.
 * @returns A THREE.Color object representing the sky color.
 */
export const getSkyColor = (altitude: number): Color => {
  const color = new Color();

  if (altitude < altitudeThresholds.civilTwilight) {
    return skyColors.night;
  }
  if (altitude < altitudeThresholds.sunrise) {
    // Transition from night to sunrise
    const factor = (altitude - altitudeThresholds.civilTwilight) / (altitudeThresholds.sunrise - altitudeThresholds.civilTwilight);
    return color.lerpColors(skyColors.civilTwilight, skyColors.sunrise, factor);
  }
  if (altitude < altitudeThresholds.goldenHour) {
    // Transition from sunrise to golden hour
    const factor = (altitude - altitudeThresholds.sunrise) / (altitudeThresholds.goldenHour - altitudeThresholds.sunrise);
    return color.lerpColors(skyColors.sunrise, skyColors.goldenHour, factor);
  }
  if (altitude < altitudeThresholds.day) {
    // Transition from golden hour to day
    const factor = (altitude - altitudeThresholds.goldenHour) / (altitudeThresholds.day - altitudeThresholds.goldenHour);
    return color.lerpColors(skyColors.goldenHour, skyColors.day, factor);
  }
  // Transition from day to zenith color
  const factor = Math.min(1, (altitude - altitudeThresholds.day) / (altitudeThresholds.zenith - altitudeThresholds.day));
  return color.lerpColors(skyColors.day, skyColors.zenith, factor);
};