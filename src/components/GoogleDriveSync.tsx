import React, { useState } from 'react';
import useSimulationStore from '../stores/useSimulationStore';
import { useGoogleDrive } from '../hooks/useGoogleDrive';

const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.87c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
        <path fill="#34A853" d="M24 46c6.49 0 11.92-2.13 15.89-5.82l-7.11-5.52c-2.17 1.46-4.94 2.32-8.78 2.32-6.76 0-12.47-4.55-14.51-10.61H2.26v5.7C6.22 39.88 14.41 46 24 46z"/>
        <path fill="#FBBC05" d="M9.49 27.58c-.41-1.23-.65-2.55-.65-3.92s.24-2.69.65-3.92V14.04H2.26C.82 16.88 0 20.33 0 24.1c0 3.76.82 7.22 2.26 10.05l7.23-5.7z"/>
        <path fill="#EA4335" d="M24 9.4c3.51 0 6.56 1.21 8.98 3.49l6.23-6.23C35.91 2.19 30.49 0 24 0 14.41 0 6.22 6.12 2.26 14.04l7.23 5.7c2.04-6.06 7.75-10.34 14.51-10.34z"/>
    </svg>
);

const SaveIcon = () => ( // Floppy Disk / "Discette" Icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 21V13H7v8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 3V8h8" />
    </svg>
);

const LoadIcon = () => ( // Import / Download from Cloud Icon
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ErrorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
);


const GoogleDriveSync: React.FC<{ isExpanded: boolean }> = ({ isExpanded }) => {
    const { isGapiReady, isSignedIn, userProfile, error, signIn, signOut, saveFile, loadFile } = useGoogleDrive();
    const { rehydrateFromExternal } = useSimulationStore.getState();
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        // Use the same `partialize` function from the persist middleware to get only the data we want to save.
        const stateToSave = useSimulationStore.persist.getOptions().partialize!(useSimulationStore.getState());
        await saveFile(stateToSave);
        setIsSaving(false);
    };

    const handleLoad = async () => {
        setIsLoading(true);
        const loadedState = await loadFile();
        if (loadedState && typeof loadedState === 'object') {
            rehydrateFromExternal(loadedState);
        }
        setIsLoading(false);
    };

    if (!isGapiReady) {
        if (!isExpanded) return null;
        return <div className="text-sm text-slate-500 text-center py-2">Initializing...</div>;
    }
    
    if (!isSignedIn) {
        if (isExpanded) {
            return (
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-600 select-none">
                        Google Drive Sync
                    </label>
                    <button
                        onClick={signIn}
                        className="w-full flex items-center justify-center bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 gap-2"
                    >
                        <GoogleIcon />
                        Sign in with Google
                    </button>
                    {error && <p className="text-sm text-center p-2 rounded-md bg-red-100 text-red-700">{error}</p>}
                </div>
            )
        }
        // Collapsed view
        return (
            <button
                onClick={signIn}
                title="Sign in with Google"
                className="p-2 rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 border border-slate-300 shadow-sm"
            >
                <GoogleIcon />
            </button>
        )
    }

    // --- User is Signed In ---
    if (!isExpanded) {
        return (
            <div className="flex flex-col items-center gap-4">
                {userProfile && (
                    <div title={`${userProfile.name} (${userProfile.email})`} className="w-10 h-10 rounded-full border-2 border-slate-200 p-0.5 shadow-sm">
                        <img 
                            src={userProfile.imageUrl} 
                            alt="User avatar" 
                            className="w-full h-full rounded-full"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                )}
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleLoad}
                        disabled={isSaving || isLoading}
                        title="Load from Google Drive"
                        className="p-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait shadow-sm"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-slate-500 border-solid border-t-transparent rounded-full animate-spin"></div> : <LoadIcon />}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        title="Save to Google Drive"
                        className="p-2 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait shadow-sm"
                    >
                        {isSaving ? <div className="w-6 h-6 border-2 border-slate-500 border-solid border-t-transparent rounded-full animate-spin"></div> : <SaveIcon />}
                    </button>
                </div>
                {error && (
                    <div title={error} className="mt-2">
                        <ErrorIcon />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-3">
             <label className="block text-sm font-medium text-slate-600 select-none">
                Google Drive Sync
            </label>
            <div className="space-y-3">
                 <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-md">
                    <img src={userProfile?.imageUrl} alt="User profile" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
                    <div className="text-sm">
                        <p className="font-medium text-slate-800">{userProfile?.name}</p>
                        <p className="text-slate-500 truncate">{userProfile?.email}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleLoad}
                        disabled={isSaving || isLoading}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-slate-500 border-solid border-t-transparent rounded-full animate-spin"></div> : <><LoadIcon /> Load</>}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                    >
                       {isSaving ? <div className="w-5 h-5 border-2 border-slate-500 border-solid border-t-transparent rounded-full animate-spin"></div> : <><SaveIcon /> Save</>} 
                    </button>
                </div>
                 <button
                    onClick={signOut}
                    className="w-full text-sm text-slate-600 hover:text-red-600 hover:underline py-1"
                >
                    Sign Out
                </button>
            </div>
             {error && (
                <p className="text-sm text-center p-2 rounded-md bg-red-100 text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
};

export default GoogleDriveSync;