import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import DateSlider from './components/DateSlider';
import TimeSlider from './components/TimeSlider';
import CompassDisplay from './components/CompassDisplay';
import ControlPanel from './components/ControlPanel';
import TransparencySlider from './components/TransparencySlider';
import SunlightChart from './components/SunlightChart';
import SceneViewer from './components/SceneViewer';
import useSimulationStore from './stores/useSimulationStore';
import LoadingSpinner from './components/LoadingSpinner';
import ModelLoader from './components/ModelLoader';
import DateTimeDisplay from './components/DateTimeDisplay';

function App() {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const isModelLoading = useSimulationStore((state) => state.isModelLoading);

  // Initialize state from localStorage, defaulting to false (minimized)
  const [isControlPanelExpanded, setIsControlPanelExpanded] = useState(() => {
    try {
      const savedState = localStorage.getItem('controlPanelExpanded');
      // If a value is saved, use it. Otherwise, default to false.
      return savedState !== null ? JSON.parse(savedState) : false;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return false;
    }
  });

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('controlPanelExpanded', JSON.stringify(isControlPanelExpanded));
    } catch (error) {
      console.error("Error writing to localStorage", error);
    }
  }, [isControlPanelExpanded]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ModelLoader />
      {isModelLoading && <LoadingSpinner />}
      
      {/* Flexbox layout for scene and sliders */}
      <main className="h-full w-full flex flex-col">
        {/* Area for Scene and Sliders */}
        <div className="flex-grow flex flex-row min-h-0">
          {/* Control Panel Wrapper */}
          <div
            className={`flex-shrink-0 ${
              isControlPanelExpanded ? 'w-72' : 'w-20'
            }`}
          >
            <ControlPanel
              isExpanded={isControlPanelExpanded}
              onToggle={() => setIsControlPanelExpanded((v) => !v)}
            />
          </div>

          {/* 3D Scene Viewer */}
          <div className="relative flex-grow min-w-0 bg-black">
            <Canvas shadows>
              <color attach="background" args={['#000000']} />
              <SceneViewer />
            </Canvas>

            {/* Date/Time Display */}
            <DateTimeDisplay />

            {/* Sunlight Chart Toggle - Bottom-left of scene */}
            <SunlightChart
              isExpanded={isChartExpanded}
              onToggle={() => setIsChartExpanded((v) => !v)}
            />

            {/* Wrapper for bottom-right UI elements */}
            <div
              className={`absolute right-4 z-10 flex flex-col-reverse items-end gap-4 pointer-events-none select-none ${
                isChartExpanded ? 'bottom-[241px]' : 'bottom-4'
              }`}
            >
              <TransparencySlider />
              <CompassDisplay />
            </div>
          </div>
          {/* Time Slider Wrapper */}
          <div className="flex-shrink-0 w-16">
            <TimeSlider />
          </div>
        </div>

        {/* Area for Date Slider */}
        <div className="flex-shrink-0">
          <DateSlider />
        </div>
      </main>
    </div>
  );
}

export default App;