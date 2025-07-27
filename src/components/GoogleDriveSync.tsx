import React, { useState } from 'react';
import useSimulationStore from '../stores/useSimulationStore';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.87c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c6.49 0 11.92-2.13 15.89-5.82l-7.11-5.52c-2.17 1.46-4.94 2.32-8.78 2.32-6.76 0-12.47-4.55-14.51-10.61H2.26v5.7C6.22 39.88 14.41 46 24 46z"/>
        <path fill="#FBBC05" d="M9.49 27.58c-.41-1.23-.65-2.55-.65-3.92s.24-2.69.65-3.92V14.04H2.26C.82 16.88 0 20.33 0 24.1c0 3.76.82 7.22 2.26 10.05l7.23-5.7z"/>
        <path fill="#EA4335" d="M24 9.4c3.51 0 6.56 1.21 8.98 3.49l6.23-6.23C35.91 2.19 30.49 0 24 0 14.41 0 6.22 6.12 2.26 14.04l7.23 5.7c2.04-6.06 7.75-10.34 14.51-10.34z"/>
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
);

const LoadIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


const GoogleDriveSync: React.FC = () => {
    const { isGapiReady, isSignedIn, userProfile, error, signIn, signOut, saveFile, loadFile } = useGoogleDrive();
    const { rehydrateFromExternal } = useSimulationStore.getState();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const showStatus = (message: string, duration: number = 3000) => {
        setStatusMessage(message);
        setTimeout(() => setStatusMessage(null), duration);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatusMessage(null);
        // Use the same `partialize` function from the persist middleware to get only the data we want to save.
        const stateToSave = useSimulationStore.persist.getOptions().partialize!(useSimulationStore.getState());
        const success = await saveFile(stateToSave);
        if (success) {
            showStatus('Scene saved successfully!');
        } else {
            showStatus('Save failed. Check console for errors.');
        }
        setIsSaving(false);
    };

    const handleLoad = async () => {
        setIsLoading(true);
        setStatusMessage(null);
        const loadedState = await loadFile();
        if (loadedState && typeof loadedState === 'object') {
            rehydrateFromExternal(loadedState);
            showStatus('Scene loaded successfully!');
        } else {
            // Error messages are handled by the hook and displayed. If no state is found, it's also handled.
            if (!error) {
              showStatus('Load failed or no save file found.');
            }
        }
        setIsLoading(false);
    };

    if (!isGapiReady) {
        return <div className="text-sm text-slate-500 text-center py-2">Initializing Google Services...</div>;
    }

    return (
        <div className="space-y-3">
             <label className="block text-sm font-medium text-slate-600 select-none">
                Google Drive Sync
            </label>
            {!isSignedIn ? (
                <button
                    onClick={signIn}
                    className="w-full flex items-center justify-center bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
                >
                    <GoogleIcon />
                    Sign in with Google
                </button>
            ) : (
                <div className="space-y-3">
                     <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-md">
                        <img src={userProfile?.imageUrl} alt="User profile" className="w-8 h-8 rounded-full" />
                        <div className="text-sm">
                            <p className="font-medium text-slate-800">{userProfile?.name}</p>
                            <p className="text-slate-500 truncate">{userProfile?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                         <button
                            onClick={handleSave}
                            disabled={isSaving || isLoading}
                            className="flex items-center justify-center bg-blue-600 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                        >
                           {isSaving ? <div className="w-5 h-5 border-2 border-white border-solid border-t-transparent rounded-full animate-spin"></div> : <><SaveIcon /> Save</>} 
                        </button>
                        <button
                            onClick={handleLoad}
                            disabled={isSaving || isLoading}
                            className="flex items-center justify-center bg-green-600 text-white font-bold px-4 py-2 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isLoading ? <div className="w-5 h-5 border-2 border-white border-solid border-t-transparent rounded-full animate-spin"></div> : <><LoadIcon /> Load</>}
                        </button>
                    </div>
                     <button
                        onClick={signOut}
                        className="w-full text-sm text-slate-600 hover:text-red-600 hover:underline py-1"
                    >
                        Sign Out
                    </button>
                </div>
            )}
             {(error || statusMessage) && (
                <p className={`text-sm text-center p-2 rounded-md ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {error || statusMessage}
                </p>
            )}
        </div>
    );
};

export default GoogleDriveSync;