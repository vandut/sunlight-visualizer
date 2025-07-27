import React from 'react';
import useSimulationStore from '../stores/useSimulationStore';
import LocationSearch from './LocationSearch';
import GoogleDriveSync from './GoogleDriveSync';

interface ControlPanelProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const HamburgerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const UndoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
    />
  </svg>
);

const RedoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3"
    />
  </svg>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
  isExpanded,
  onToggle,
}) => {
  const weather = useSimulationStore((state) => state.weather);
  const setWeather = useSimulationStore((state) => state.setWeather);
  const setModelData = useSimulationStore((state) => state.setModelData);
  const isEditMode = useSimulationStore((state) => state.isEditMode);
  const setIsEditMode = useSimulationStore((state) => state.setIsEditMode);
  const transformMode = useSimulationStore((state) => state.transformMode);
  const setTransformMode = useSimulationStore((state) => state.setTransformMode);
  const history = useSimulationStore((state) => state.history);
  const historyIndex = useSimulationStore((state) => state.historyIndex);
  const undo = useSimulationStore((state) => state.undo);
  const redo = useSimulationStore((state) => state.redo);
  const showCompassGuide = useSimulationStore((state) => state.showCompassGuide);
  const setShowCompassGuide = useSimulationStore((state) => state.setShowCompassGuide);
  const showSunPath = useSimulationStore((state) => state.showSunPath);
  const setShowSunPath = useSimulationStore((state) => state.setShowSunPath);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

  const weatherOptions = ['Sunny', 'Cloudy', 'Rainy'] as const;
  const transformOptions: {
    value: 'translate' | 'rotate' | 'scale';
    label: string;
  }[] = [
    { value: 'translate', label: 'Move' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'scale', label: 'Scale' },
  ];

  const canUndo = historyIndex > 0;
  const canRedo = history.length > 0 && historyIndex < history.length - 1;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setModelData(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full w-full bg-white shadow-lg flex flex-col border-r border-slate-200 overflow-hidden">
      {/* Header with hamburger button */}
      <div
        className={`flex-shrink-0 p-4 ${
          isExpanded ? 'self-start' : 'self-center'
        }`}
      >
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 select-none"
          aria-label={isExpanded ? 'Collapse panel' : 'Expand panel'}
          aria-expanded={isExpanded}
          aria-controls="control-panel-content"
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div
          id="control-panel-content"
          className="flex-grow p-4 pt-0 flex flex-col overflow-y-auto"
        >
          <hr className="my-6 border-slate-200" />
          {isInIframe ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-600 select-none">
                  Google Drive Sync
              </label>
              <div className="p-3 text-center bg-slate-100 rounded-md">
                <p className="text-sm text-slate-500">Disabled in iframe</p>
              </div>
            </div>
          ) : (
            <GoogleDriveSync />
          )}
          <hr className="my-6 border-slate-200" />
          
          <div>
            <label className="w-full text-center block cursor-pointer bg-blue-600 text-white font-bold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50 transition-colors duration-200 select-none">
              Upload 3D Model
              <input
                type="file"
                className="hidden"
                accept=".glb"
                onChange={handleFileChange}
              />
            </label>
            <p className="text-sm text-slate-500 mt-2">
              Need a 3D model? Use the <strong>.glb</strong> format. You can
              create one for free with{' '}
              <a
                href="https://www.tinkercad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:underline"
              >
                Tinkercad
              </a>
              .
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <label
              htmlFor="edit-mode-switch"
              className="text-slate-700 font-medium select-none"
            >
              Edit Mode
            </label>
            <button
              type="button"
              id="edit-mode-switch"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`${
                isEditMode ? 'bg-blue-600' : 'bg-slate-300'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              role="switch"
              aria-checked={isEditMode}
            >
              <span
                aria-hidden="true"
                className={`${
                  isEditMode ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>

          {isEditMode && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 select-none">
                  Transform Mode
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  {transformOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTransformMode(option.value)}
                      className={`
                      relative inline-flex flex-1 items-center justify-center border border-slate-300 px-3 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 select-none
                      ${
                        transformMode === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-50'
                      }
                      ${index === 0 ? 'rounded-l-md' : ''}
                      ${
                        index === transformOptions.length - 1
                          ? 'rounded-r-md'
                          : ''
                      }
                      ${index > 0 ? '-ml-px' : ''}
                    `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 select-none">
                  History
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={undo}
                    disabled={!canUndo}
                    aria-label="Undo"
                    className="relative inline-flex flex-1 items-center justify-center border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 select-none rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UndoIcon />
                  </button>
                  <button
                    type="button"
                    onClick={redo}
                    disabled={!canRedo}
                    aria-label="Redo"
                    className="relative -ml-px inline-flex flex-1 items-center justify-center border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 select-none rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RedoIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <hr className="my-6 border-slate-200" />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-600 select-none">
                Location
            </label>
            <LocationSearch />
          </div>

          <hr className="my-6 border-slate-200" />

          <div>
            <label className="block text-sm font-medium text-slate-600 select-none">
              Weather
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              {weatherOptions.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWeather(option)}
                  className={`
                    relative inline-flex flex-1 items-center justify-center border border-slate-300 px-3 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200 select-none
                    ${
                      weather === option
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-700 hover:bg-slate-50'
                    }
                    ${index === 0 ? 'rounded-l-md' : ''}
                    ${
                      index === weatherOptions.length - 1 ? 'rounded-r-md' : ''
                    }
                    ${index > 0 ? '-ml-px' : ''}
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <hr className="my-6 border-slate-200" />

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-600 select-none">
                Display Options
            </label>
             <div className="flex items-center justify-between">
                <label
                  htmlFor="show-compass-switch"
                  className="text-slate-700 font-medium select-none"
                >
                  Show Scene Compass
                </label>
                <button
                  type="button"
                  id="show-compass-switch"
                  onClick={() => setShowCompassGuide(!showCompassGuide)}
                  className={`${
                    showCompassGuide ? 'bg-blue-600' : 'bg-slate-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={showCompassGuide}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      showCompassGuide ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
            </div>
             <div className="flex items-center justify-between">
                <label
                  htmlFor="show-sun-path-switch"
                  className="text-slate-700 font-medium select-none"
                >
                  Show Sun Path
                </label>
                <button
                  type="button"
                  id="show-sun-path-switch"
                  onClick={() => setShowSunPath(!showSunPath)}
                  className={`${
                    showSunPath ? 'bg-blue-600' : 'bg-slate-300'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={showSunPath}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      showSunPath ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ControlPanel;