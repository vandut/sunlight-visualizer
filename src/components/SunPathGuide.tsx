import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import useSimulationStore from '../stores/useSimulationStore';
import { getSunPosition, getOffsetInMinutes } from '../utils/sun-position';

const SunPathGuide = () => {
    const groupRef = useRef<THREE.Group>(null);
    const sunMarkerRef = useRef<THREE.Mesh>(null!);
    const sunMarkerMaterialRef = useRef<THREE.MeshStandardMaterial>(null!);

    const date = useSimulationStore((state) => state.date);
    const time = useSimulationStore((state) => state.time);
    const location = useSimulationStore((state) => state.location);
    const { size } = useThree();

    // Memoized calculation for timezone offset
    const offsetDifferenceMinutes = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const tempDateForOffset = new Date(currentYear, 0, date);
        const targetOffsetMinutes = getOffsetInMinutes(location.timeZone, tempDateForOffset);
        const localOffsetMinutes = -tempDateForOffset.getTimezoneOffset();
        return targetOffsetMinutes - localOffsetMinutes;
    }, [date, location.timeZone]);

    // Memoize the calculation of sun path segments (day and night)
    const { daySegments, nightSegments } = useMemo(() => {
        const daySegs: THREE.Vector3[][] = [];
        const nightSegs: THREE.Vector3[][] = [];
        let currentDaySegment: THREE.Vector3[] = [];
        let currentNightSegment: THREE.Vector3[] = [];

        const currentYear = new Date().getFullYear();

        for (let t = 0; t <= 24 * 60; t += 15) {
            const hours = Math.floor(t / 60);
            const minutes = t % 60;
            const simDate = new Date(currentYear, 0, date);
            simDate.setHours(hours, minutes - offsetDifferenceMinutes, 0, 0);

            const sunPos = getSunPosition(simDate, location);
            const point = new THREE.Vector3(...sunPos);

            if (sunPos[1] >= 0) { // Sun is up
                if (currentNightSegment.length > 0) {
                    nightSegs.push(currentNightSegment);
                    currentNightSegment = [];
                }
                currentDaySegment.push(point);
            } else { // Sun is down
                if (currentDaySegment.length > 0) {
                    daySegs.push(currentDaySegment);
                    currentDaySegment = [];
                }
                currentNightSegment.push(point);
            }
        }
        if (currentDaySegment.length > 0) daySegs.push(currentDaySegment);
        if (currentNightSegment.length > 0) nightSegs.push(currentNightSegment);

        return { daySegments: daySegs, nightSegments: nightSegs };
    }, [date, location, offsetDifferenceMinutes]);

    useFrame(({ camera }) => {
        // Dynamically scale the entire guide to fit the view
        if (groupRef.current && camera instanceof THREE.OrthographicCamera) {
            const worldWidth = size.width / camera.zoom;
            const worldHeight = size.height / camera.zoom;
            const worldRadius = Math.min(worldWidth, worldHeight) * 0.45;
            groupRef.current.scale.set(worldRadius, worldRadius, worldRadius);
        }
        
        // Update sun marker position and color
        if (sunMarkerRef.current && sunMarkerMaterialRef.current) {
            const currentYear = new Date().getFullYear();
            const hours = Math.floor(time / 60);
            const minutes = time % 60;
            const simDate = new Date(currentYear, 0, date);
            simDate.setHours(hours, minutes - offsetDifferenceMinutes, 0, 0);
            
            const sunPosition = getSunPosition(simDate, location);
            sunMarkerRef.current.position.set(...sunPosition);

            const isBelowHorizon = sunPosition[1] < 0;
            // Use distinct colors for the marker vs. the path
            const markerColor = isBelowHorizon ? '#87CEEB' : '#FFD700'; // LightSkyBlue and Gold
            sunMarkerMaterialRef.current.color.set(markerColor);
            sunMarkerMaterialRef.current.emissive.set(markerColor);
        }
    });

    return (
        <group ref={groupRef} position-y={0.01} renderOrder={998}> {/* Use a slightly different renderOrder */}
            {/* Sun Marker */}
            <mesh ref={sunMarkerRef}>
                <sphereGeometry args={[0.03, 16, 16]} />
                <meshStandardMaterial ref={sunMarkerMaterialRef} emissiveIntensity={2} toneMapped={false} depthTest={false} />
            </mesh>

            {/* Sun Path Visualization (Day) */}
            {daySegments.map((segment, i) => (
                <Line
                    key={`day-${i}`}
                    points={segment}
                    color="orange"
                    lineWidth={4}
                    depthTest={false}
                />
            ))}
            
            {/* Sun Path Visualization (Night) */}
            {nightSegments.map((segment, i) => (
                <Line
                    key={`night-${i}`}
                    points={segment}
                    color="blue"
                    lineWidth={2}
                    depthTest={false}
                />
            ))}
        </group>
    );
};

export default SunPathGuide;