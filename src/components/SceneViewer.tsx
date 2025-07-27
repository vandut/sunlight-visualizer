import React, { useRef, useMemo, useEffect } from 'react';
import { OrbitControls, OrthographicCamera, TransformControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useSimulationStore from '../stores/useSimulationStore';
import { getSunPosition, getOffsetInMinutes, getSkyColor } from '../utils/sun-position';
import type { Location } from '../utils/sun-position';
import Model from './Model';
import CompassGuide from './CompassGuide';
import SunPathGuide from './SunPathGuide';

const SceneViewer = () => {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const ambientLightRef = useRef<THREE.AmbientLight>(null!);
  const controlsRef = useRef<any>(null);
  const transformRef = useRef<any>(null); // Ref for TransformControls
  
  const date = useSimulationStore((state) => state.date);
  const time = useSimulationStore((state) => state.time);
  const location = useSimulationStore((state) => state.location);
  const gltfScene = useSimulationStore((state) => state.gltfScene);
  const weather = useSimulationStore((state) => state.weather);
  const isEditMode = useSimulationStore((state) => state.isEditMode);
  const transformMode = useSimulationStore((state) => state.transformMode);
  const addHistoryState = useSimulationStore((state) => state.addHistoryState);
  const showCompassGuide = useSimulationStore((state) => state.showCompassGuide);
  const showSunPath = useSimulationStore((state) => state.showSunPath);
  const setCameraAzimuth = useSimulationStore((state) => state.setCameraAzimuth);
  const cameraResetRequest = useSimulationStore((state) => state.cameraResetRequest);
  
  const { scene, size } = useThree();

  // Memoize the timezone offset calculation so it only runs when the date or location changes,
  // not on every frame, which would be a performance bottleneck.
  const offsetDifferenceMinutes = useMemo(() => {
    const currentYear = new Date().getFullYear();
    // A temporary date object to pass to the offset calculators.
    const tempDate = new Date(currentYear, 0, date);

    // Get the offset for the simulation's target location (e.g., Warsaw).
    const targetOffsetMinutes = getOffsetInMinutes(location.timeZone, tempDate);

    // Get the browser's local offset. getTimezoneOffset returns an inverted value (e.g., UTC+2 is -120), so we flip the sign.
    const localOffsetMinutes = -tempDate.getTimezoneOffset();
    
    return targetOffsetMinutes - localOffsetMinutes;
  }, [date, location.timeZone]);


  // Calculate the minimum zoom to enforce a maximum view height limit.
  // This prevents zooming out too far.
  const minZoom = useMemo(() => {
    const maxViewHeight = 400; // The desired maximum visible height in world units (meters).
    return size.height / maxViewHeight;
  }, [size.height]);

  // Create a repeating grid texture for the ground plane.
  const gridTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Each texture tile will represent a 10x10 meter area.
    const canvasSize = 100; // Use a 100x100 pixel texture for detail.
    const subdivisions = 10; // 10 subdivisions for 1-meter lines.
    const step = canvasSize / subdivisions;

    canvas.width = canvasSize;
    canvas.height = canvasSize;

    if (context) {
      // Set background color
      context.fillStyle = 'lightgray';
      context.fillRect(0, 0, canvasSize, canvasSize);

      // Draw minor grid lines (1-meter intervals)
      context.strokeStyle = '#CCCCCC';
      context.lineWidth = 1;
      context.beginPath();
      for (let i = 1; i < subdivisions; i++) {
        const pos = i * step;
        context.moveTo(pos, 0);
        context.lineTo(pos, canvasSize);
        context.moveTo(0, pos);
        context.lineTo(pos, canvasSize);
      }
      context.stroke();

      // Draw major grid lines (10-meter intervals, on the borders)
      context.strokeStyle = '#999999';
      context.lineWidth = 2;
      context.strokeRect(0, 0, canvasSize, canvasSize);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Repeat the 10x10m texture over the 1000x1000m plane.
    texture.repeat.set(100, 100); 

    return texture;
  }, []);

  // --- Camera Configuration ---
  // Define default values for the camera to use on every load
  const defaultPosition = useMemo<[number, number, number]>(() => [280, 320, 280], []);
  const defaultZoom = useMemo(() => (size.height > 0 ? size.height / 200 : 10), [size.height]);

  // Effect to handle camera reset requests from the store
  useEffect(() => {
    // A non-zero check prevents this from running on initial load.
    // The request counter pattern ensures this runs even if the user clicks multiple times.
    if (cameraResetRequest > 0 && controlsRef.current) {
      controlsRef.current.setAzimuthalAngle(0);
    }
  }, [cameraResetRequest]);

  // Effect to manage interaction between OrbitControls and TransformControls
  useEffect(() => {
    const transformControls = transformRef.current;
    if (transformControls) { // Will only be true when isEditMode is true and component is mounted
      const onDraggingChanged = (event: { value: boolean }) => {
        if (controlsRef.current) {
          controlsRef.current.enabled = !event.value;
        }
      };

      transformControls.addEventListener('dragging-changed', onDraggingChanged);
      
      return () => {
        transformControls.removeEventListener('dragging-changed', onDraggingChanged);
        // Ensure OrbitControls are re-enabled when TransformControls are unmounted.
        if (controlsRef.current) {
          controlsRef.current.enabled = true;
        }
      };
    }
  }, [isEditMode]); // Rerun when isEditMode toggles, mounting/unmounting TransformControls

  // Effect to handle uniform scaling when using the scale gizmo
  useEffect(() => {
    const controls = transformRef.current;
    if (controls) {
      const handleObjectChange = () => {
        // Uniform scaling logic: if in scale mode, force all axes to match.
        if (controls.mode === 'scale' && gltfScene) {
          const scaleVec = gltfScene.scale;
          // When the Y handle is moved, its value changes. We use that as the master scale.
          const masterScale = scaleVec.y;
          // To prevent a feedback loop, only set if they are not already equal.
          if (scaleVec.x !== masterScale || scaleVec.z !== masterScale) {
            gltfScene.scale.set(masterScale, masterScale, masterScale);
          }
        }
      };

      controls.addEventListener('objectChange', handleObjectChange);
      return () => {
        controls.removeEventListener('objectChange', handleObjectChange);
      };
    }
    // This effect must re-run when the controls are mounted/unmounted or the model changes.
  }, [gltfScene, isEditMode]);

  useFrame(() => {
    const currentYear = new Date().getFullYear();
    
    // Get the "wall clock" time from the slider.
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    // Create the final Date object. We start with the correct day in the browser's timezone,
    // then set the hours and minutes, applying the calculated offset difference.
    // This ensures the final `simDate` object represents the correct point in time (UTC)
    // that corresponds to the local time from the slider at the target location.
    const simDate = new Date(currentYear, 0, date);
    simDate.setHours(hours, minutes - offsetDifferenceMinutes, 0, 0);

    // Calculate the sun's position using the new timezone-aware date and location.
    const sunPosition = getSunPosition(simDate, location);

    // Calculate sky color based on sun altitude (Y component of normalized position vector is sin(altitude))
    const altitude = Math.asin(sunPosition[1]);
    scene.background = getSkyColor(altitude);

    if (lightRef.current && ambientLightRef.current && controlsRef.current) {
      // 1. Determine time-based intensity modifier based on sun altitude.
      const upperAltitude = 2 * (Math.PI / 180); // Start fading just above horizon.
      const lowerAltitude = -6 * (Math.PI / 180); // Full darkness at civil twilight.
      let timeBasedIntensity = 1.0;

      if (altitude < upperAltitude) {
        if (altitude < lowerAltitude) {
          timeBasedIntensity = 0;
        } else {
          // Linearly interpolate intensity during the twilight period.
          const factor = (altitude - lowerAltitude) / (upperAltitude - lowerAltitude);
          timeBasedIntensity = Math.max(0, Math.min(1, factor));
        }
      }

      // 2. Set base light intensities based on weather.
      let directionalBase: number;
      let ambientBase: number;

      switch (weather) {
        case 'Cloudy':
          directionalBase = 1.5;
          ambientBase = 1.0;
          break;
        case 'Rainy':
          directionalBase = 0.5;
          ambientBase = 1.2;
          break;
        case 'Sunny':
        default:
          directionalBase = 5.0;
          ambientBase = 0.5;
          break;
      }
      
      // 3. Apply weather and time-based intensity to lights.
      lightRef.current.intensity = directionalBase * timeBasedIntensity;
      ambientLightRef.current.intensity = ambientBase;

      // 4. Adjust the light's direction vector.
      // We use the real sun position for horizontal placement, but clamp the vertical
      // position at the horizon so the light source doesn't go underground.
      const renderSunPosition = [...sunPosition] as [number, number, number];

      if (renderSunPosition[1] < 0) {
        // When the sun is below the horizon, its light should come from the horizon.
        renderSunPosition[1] = 0;

        // Re-normalize the vector so its length is 1 again, preserving horizontal direction.
        const horizontalMagnitude = Math.sqrt(
          renderSunPosition[0] ** 2 + renderSunPosition[2] ** 2
        );
        if (horizontalMagnitude > 0) {
          renderSunPosition[0] /= horizontalMagnitude;
          renderSunPosition[2] /= horizontalMagnitude;
        }
      }
      
      // 5. Update light and shadow camera position to follow the user's view.
      const target = controlsRef.current.target;
      lightRef.current.target.position.copy(target);

      const lightDistance = 500; // Corresponds to shadow-camera-far / 2
      const lightPosition = new THREE.Vector3().fromArray(renderSunPosition);
      lightPosition.multiplyScalar(lightDistance);
      lightPosition.add(target);
      lightRef.current.position.copy(lightPosition);
    }

    if (controlsRef.current) {
      // Don't update camera azimuth if we are editing the model, to prevent OrbitControls fighting TransformControls
      if (!controlsRef.current.enabled) return;
      const azimuth = controlsRef.current.getAzimuthalAngle();
      setCameraAzimuth(azimuth);
    }
  });

  const handleTransformEnd = () => {
    // When a transformation is complete, save its state to the history.
    if (transformRef.current) {
      addHistoryState();
    }
  };

  return (
    <>
      {/* 
        Orthographic camera now uses default values, resetting on each load.
        The 'far' prop defines the maximum render distance. Increased to prevent clipping of the large map plane.
      */}
      <OrthographicCamera makeDefault position={defaultPosition} zoom={defaultZoom} far={10000} />

      {/* Lights */}
      <ambientLight ref={ambientLightRef} />
      <directionalLight
        ref={lightRef}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={1000}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
      />
      
      {/* Compass and Sun Path Visualization */}
      { showCompassGuide && <CompassGuide /> }
      { showSunPath && <SunPathGuide /> }

      {/* 
        Camera Controls. 
        - Damping is disabled for instant response.
        - maxPolarAngle prevents looking from below the ground plane.
        - minZoom enforces a maximum zoom-out level.
      */}
      <OrbitControls 
        ref={controlsRef}
        enableDamping={false} 
        maxPolarAngle={Math.PI / 3}
        minZoom={minZoom}
      />

      {/* Ground plane with a repeating grid texture that can receive shadows. */}
      <mesh receiveShadow rotation-x={-Math.PI / 2} position-y={0}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial map={gridTexture} />
      </mesh>

      {/* Render loaded model if it exists, elevated slightly */}
      {gltfScene && (
        <group position-y={0.1}>
          {/* The Model is always rendered */}
          <Model scene={gltfScene} />
          
          {/* TransformControls are conditionally rendered and explicitly target the model's scene */}
          {isEditMode && (
            <TransformControls
              ref={transformRef}
              object={gltfScene}
              mode={transformMode}
              onMouseUp={handleTransformEnd}
              size={1.5}
              // --- GIZMO CONSTRAINTS ---
              // Translate: X and Z axes (horizontal plane)
              // Rotate: Y axis only (horizontal rotation)
              // Scale: Y axis only (uniform scaling is handled in an effect)
              showX={transformMode === 'translate'}
              showY={transformMode === 'rotate' || transformMode === 'scale'}
              showZ={transformMode === 'translate'}
            />
          )}
        </group>
      )}
    </>
  );
};

export default SceneViewer;