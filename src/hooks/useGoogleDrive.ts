import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '../../config';

// TypeScript definitions for Google API Client
declare global {
  interface Window {
    gapi: any;
  }
}

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
// Using appDataFolder scope ensures the app can only access a special, hidden folder.
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const FILENAME = 'sunlight-visualizer-state.json';

interface UserProfile {
  email: string;
  name: string;
  imageUrl: string;
}

export const useGoogleDrive = () => {
  const [isGapiReady, setIsGapiReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateAuthStatus = useCallback((isUserSignedIn: boolean) => {
    setIsSignedIn(isUserSignedIn);
    if (isUserSignedIn) {
      const profile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
      setUserProfile({
        email: profile.getEmail(),
        name: profile.getName(),
        imageUrl: profile.getImageUrl(),
      });
      setError(null);
    } else {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const initializeGapiClient = async () => {
      // Wait for the gapi script to load the 'client' and 'auth2' libraries.
      await new Promise<void>((resolve) => window.gapi.load('client:auth2', () => resolve()));
      
      try {
        // Initialize both the Google API client and the auth2 library in a single call.
        // This is a more robust method that avoids potential race conditions and initialization
        // errors like "Invalid cookiePolicy" that can occur with separate init calls.
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          clientId: GOOGLE_CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: DISCOVERY_DOCS,
        });
        
        setIsGapiReady(true);
        const authInstance = window.gapi.auth2.getAuthInstance();
        
        if (!authInstance) {
          throw new Error('Failed to retrieve Google Auth instance after initialization.');
        }

        // Listen for sign-in state changes.
        authInstance.isSignedIn.listen(updateAuthStatus);
        
        // Handle the initial sign-in state.
        updateAuthStatus(authInstance.isSignedIn.get());

      } catch (e: any) {
        console.error("Error initializing Google API client", e);
        // Provide a more user-friendly error if client_id is missing.
        if (e.details?.includes('invalid_client') || e.error === 'idpiframe_initialization_failed') {
             setError('Google API Client ID is invalid or misconfigured. Please check your setup in Google Cloud Console.');
        } else {
             setError(`Failed to initialize Google services. Error: ${e.message || e.details}`);
        }
      }
    };

    const checkGapi = setInterval(() => {
        if (window.gapi && window.gapi.load) {
            clearInterval(checkGapi);
            initializeGapiClient();
        }
    }, 100);

    return () => clearInterval(checkGapi);
  }, [updateAuthStatus]);

  const signIn = async () => {
    if (!isGapiReady) return;
    try {
      await window.gapi.auth2.getAuthInstance().signIn();
    } catch (e: any) {
      console.error("Error signing in", e);
      setError(`Sign-in failed. Error: ${e.details || e.message}`);
    }
  };

  const signOut = () => {
    if (!isGapiReady) return;
    window.gapi.auth2.getAuthInstance().signOut();
  };

  const findFileId = async (): Promise<string | null> => {
    try {
      const response = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'files(id, name)',
        q: `name='${FILENAME}' and trashed=false`,
      });
      const files = response.result.files;
      return files && files.length > 0 ? files[0].id : null;
    } catch (e: any) {
       console.error("Error finding file", e);
       setError('Could not search for the file in Google Drive.');
       return null;
    }
  };

  const saveFile = async (content: object): Promise<boolean> => {
    setError(null);
    if (!isSignedIn) {
      setError('You must be signed in to save.');
      return false;
    }

    try {
      const fileId = await findFileId();
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        name: FILENAME,
        mimeType: 'application/json',
      };
      
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(content, null, 2) +
        close_delim;
      
      const requestPath = fileId 
          ? `/upload/drive/v3/files/${fileId}` 
          : '/upload/drive/v3/files';
      
      const method = fileId ? 'PATCH' : 'POST';

      const resource: any = {};
      if (!fileId) {
        resource.name = FILENAME;
        resource.parents = ['appDataFolder'];
      }
      
      await window.gapi.client.request({
          path: requestPath,
          method: method,
          params: { uploadType: 'multipart' },
          headers: { 'Content-Type': 'multipart/related; boundary="' + boundary + '"' },
          body: multipartRequestBody
      });

      return true;
    } catch (e: any) {
      console.error("Error saving file", e);
      setError('Failed to save the file to Google Drive.');
      return false;
    }
  };

  const loadFile = async (): Promise<object | null> => {
    setError(null);
     if (!isSignedIn) {
      setError('You must be signed in to load.');
      return null;
    }

    try {
      const fileId = await findFileId();
      if (!fileId) {
        setError('No saved state found in Google Drive.');
        return null;
      }
      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });
      return response.result;
    } catch (e: any) {
       console.error("Error loading file", e);
       setError('Failed to load the file from Google Drive.');
       return null;
    }
  };
  
  return { isGapiReady, isSignedIn, userProfile, error, signIn, signOut, saveFile, loadFile };
};