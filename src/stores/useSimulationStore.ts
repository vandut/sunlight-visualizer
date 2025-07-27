import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '../utils/sun-position';
import type * as THREE from 'three';
import { DEFAULT_MODEL_BASE64 } from '../constants/default-model';

type WeatherOption = 'Sunny' | 'Cloudy' | 'Rainy';
type TransformMode = 'translate' | 'rotate' | 'scale';

// Serializable types for THREE objects
type SerializableVector3 = [number, number, number];
// The previous `(string | number)[]` type was too loose, causing TS errors because
// it couldn't guarantee the array had enough elements for `fromArray`.
// `THREE.Euler.toArray()` returns a tuple: [x, y, z, order].
type SerializableEuler = [number, number, number, string];

interface SerializableTransformState {
  position: SerializableVector3;
  rotation: SerializableEuler;
  scale: SerializableVector3;
}

interface SimulationState {
  date: number; // Day of the year (1-365)
  time: number; // Minute of the day (0-1439)
  weather: WeatherOption;
  location: Location;
  locationName: string;
  modelData: string | null;
  gltfScene: THREE.Group | null;
  modelOpacity: number; // Opacity of the model (0 to 1)
  cameraAzimuth: number; // Horizontal camera rotation in radians
  cameraResetRequest: number; // Counter to trigger camera reset
  isEditMode: boolean; // Is the user in edit mode?
  transformMode: TransformMode;
  history: SerializableTransformState[]; // Use serializable state
  historyIndex: number; // Points to the current state in the history array
  isModelLoading: boolean;
  showCompassGuide: boolean;
  showSunPath: boolean;

  setDate: (date: number) => void;
  setTime: (time: number) => void;
  setWeather: (weather: WeatherOption) => void;
  setLocation: (location: Location) => void;
  setLocationName: (name: string) => void;
  setModelData: (data: string | null) => void;
  setGltfScene: (scene: THREE.Group | null) => void;
  setModelOpacity: (opacity: number) => void;
  setCameraAzimuth: (azimuth: number) => void;
  triggerCameraReset: () => void; // Function to request a reset
  setIsEditMode: (isEditMode: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  setIsModelLoading: (isLoading: boolean) => void;
  setShowCompassGuide: (show: boolean) => void;
  setShowSunPath: (show: boolean) => void;
  rehydrateFromExternal: (newState: object) => void;


  // History Actions
  addHistoryState: () => void;
  undo: () => void;
  redo: () => void;
}

// --- Calculate current date and time for default values ---
const now = new Date();

// Calculate the current day of the year (1-365), matching the non-leap year model of the DateSlider
const month = now.getMonth(); // 0-11
const dayOfMonth = now.getDate(); // 1-31
const daysInMonthNonLeap = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

let initialDate = 0;
for (let i = 0; i < month; i++) {
  initialDate += daysInMonthNonLeap[i];
}
initialDate += dayOfMonth;

// Default to 12:00 PM (noon) for a consistent starting experience
const initialTime = 12 * 60;

const useSimulationStore = create<SimulationState>()(
  persist(
    (set, get) => ({
      date: initialDate,
      time: initialTime,
      weather: 'Sunny',
      location: {
        latitude: 50.06,
        longitude: 19.94,
        timeZone: 'Europe/Warsaw',
      },
      locationName: 'Kraków',
      modelData: DEFAULT_MODEL_BASE64,
      gltfScene: null,
      modelOpacity: 1,
      cameraAzimuth: 0,
      cameraResetRequest: 0,
      isEditMode: false,
      transformMode: 'translate',
      history: [],
      historyIndex: -1,
      isModelLoading: false,
      showCompassGuide: true,
      showSunPath: true,

      setDate: (date) => set({ date }),
      setTime: (time) => set({ time }),
      setWeather: (weather) => set({ weather }),
      setLocation: (location) => set({ location }),
      setLocationName: (name) => set({ locationName: name }),
      setModelData: (data) =>
        set({
          modelData: data,
          // When a new model is uploaded, reset its transformation history
          history: [],
          historyIndex: -1,
        }),

      setGltfScene: (scene) => {
        set({ gltfScene: scene });
        if (!scene) {
          // If model is removed, clear history as well
          set({ history: [], historyIndex: -1 });
        }
      },
      setModelOpacity: (opacity) => set({ modelOpacity: opacity }),
      setCameraAzimuth: (cameraAzimuth) => set({ cameraAzimuth }),
      triggerCameraReset: () =>
        set((state) => ({ cameraResetRequest: state.cameraResetRequest + 1 })),
      setIsEditMode: (isEditMode) => {
        if (isEditMode) {
          // Entering edit mode: set transform mode to translate and capture history.
          const { gltfScene } = get();
          const newState: Partial<SimulationState> = {
            isEditMode: true,
            transformMode: 'translate',
          };
          if (gltfScene) {
            newState.history = [
              {
                position: gltfScene.position.toArray() as SerializableVector3,
                rotation: gltfScene.rotation.toArray() as SerializableEuler,
                scale: gltfScene.scale.toArray() as SerializableVector3,
              },
            ];
            newState.historyIndex = 0;
          } else {
            newState.history = [];
            newState.historyIndex = -1;
          }
          set(newState);
        } else {
          // Exiting edit mode
          set({ isEditMode: false });
        }
      },
      setTransformMode: (mode) => set({ transformMode: mode }),
      setIsModelLoading: (isLoading) => set({ isModelLoading: isLoading }),
      setShowCompassGuide: (show) => set({ showCompassGuide: show }),
      setShowSunPath: (show) => set({ showSunPath: show }),
      rehydrateFromExternal: (newState) => set(newState),

      addHistoryState: () => {
        const { gltfScene, history, historyIndex } = get();
        if (!gltfScene) return;

        const newTransform: SerializableTransformState = {
          position: gltfScene.position.toArray() as SerializableVector3,
          rotation: gltfScene.rotation.toArray() as SerializableEuler,
          scale: gltfScene.scale.toArray() as SerializableVector3,
        };

        // If we have undone actions, creating a new state should discard the "future" history.
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newTransform);

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex, gltfScene } = get();
        if (historyIndex > 0 && gltfScene) {
          const newIndex = historyIndex - 1;
          const stateToRestore = history[newIndex];
          // Apply the previous state to the model
          gltfScene.position.fromArray(stateToRestore.position);
          // We cast to `any` here because the strict typings for Euler.fromArray
          // expect an `EulerOrder` string, but we store a generic `string`.
          // This is safe because `toArray` and `fromArray` are symmetrical.
          gltfScene.rotation.fromArray(stateToRestore.rotation as any);
          gltfScene.scale.fromArray(stateToRestore.scale);
          // Update the history pointer, which will re-render UI
          set({ historyIndex: newIndex });
        }
      },

      redo: () => {
        const { history, historyIndex, gltfScene } = get();
        if (historyIndex < history.length - 1 && gltfScene) {
          const newIndex = historyIndex + 1;
          const stateToRestore = history[newIndex];
          // Apply the next state to the model
          gltfScene.position.fromArray(stateToRestore.position);
          // We cast to `any` here because the strict typings for Euler.fromArray
          // expect an `EulerOrder` string, but we store a generic `string`.
          // This is safe because `toArray` and `fromArray` are symmetrical.
          gltfScene.rotation.fromArray(stateToRestore.rotation as any);
          gltfScene.scale.fromArray(stateToRestore.scale);
          // Update the history pointer, which will re-render UI
          set({ historyIndex: newIndex });
        }
      },
    }),
    {
      name: 'sunlight-visualizer-state',
      // Persist user settings and model transformations.
      // Non-serializable state like `gltfScene` and transient state like `isModelLoading` are excluded.
      partialize: (state) => ({
        date: state.date,
        time: state.time,
        weather: state.weather,
        location: state.location,
        locationName: state.locationName,
        modelData: state.modelData,
        modelOpacity: state.modelOpacity,
        isEditMode: state.isEditMode,
        transformMode: state.transformMode,
        history: state.history,
        historyIndex: state.historyIndex,
        showCompassGuide: state.showCompassGuide,
        showSunPath: state.showSunPath,
      }),
    }
  )
);

export default useSimulationStore;