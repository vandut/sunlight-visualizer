import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '../../config';

// TypeScript definitions for Google API Client
declare global {
  interface Window {
    gapi: any;
    google: any; // For Google Identity Services
  }
}

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const FILENAME = 'sunlight-visualizer-state.json';

interface UserProfile {
  email: string;
  name: string;
  imageUrl: string;
}

export const useGoogleDrive = () => {
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenClient, setTokenClient] = useState<any>(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await window.gapi.client.request({
        'path': 'https://www.googleapis.com/oauth2/v3/userinfo'
      });
      const profile = response.result;
      setUserProfile({
        email: profile.email,
        name: profile.name,
        imageUrl: profile.picture,
      });
    } catch (e: any) {
      console.error("Error fetching user profile", e);
      setError(`Could not fetch user profile. Error: ${e.result?.error?.message || e.message}`);
    }
  }, []);

  // Effect to initialize the Google Identity Services (GIS) client
  useEffect(() => {
    const gisInit = () => {
        try {
            const client = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        setError(`Auth Error: ${tokenResponse.error_description || tokenResponse.error}`);
                        return;
                    }
                    window.gapi.client.setToken(tokenResponse);
                    setIsSignedIn(true);
                    setError(null);
                    await fetchUserProfile();
                },
            });
            setTokenClient(client);
            setGisReady(true);
        } catch(e: any) {
            setError(`Google Auth init failed: ${e.message}`);
        }
    };
    
    const checkGis = setInterval(() => {
        if (typeof window.google !== 'undefined' && typeof window.google.accounts !== 'undefined') {
            clearInterval(checkGis);
            gisInit();
        }
    }, 100);

    return () => clearInterval(checkGis);
  }, [fetchUserProfile]);

  // Effect to initialize the Google API (GAPI) client for Drive
  useEffect(() => {
    const gapiInit = async () => {
      try {
        await new Promise<void>((resolve) => window.gapi.load('client', resolve));
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: DISCOVERY_DOCS,
        });
        setGapiReady(true);
      } catch (e: any) {
        setError(`Google API client failed to load: ${e.message}`);
      }
    };

    const checkGapi = setInterval(() => {
        if (typeof window.gapi !== 'undefined' && typeof window.gapi.load === 'function') {
            clearInterval(checkGapi);
            gapiInit();
        }
    }, 100);

    return () => clearInterval(checkGapi);
  }, []);

  const signIn = () => {
    if (!tokenClient) {
        setError('Google Auth is not ready.');
        return;
    }
    setError(null);
    // An empty prompt string triggers the default user experience.
    tokenClient.requestAccessToken({ prompt: '' });
  };

  const signOut = () => {
    // Clear the token from the GAPI client
    window.gapi.client.setToken(null);
    setIsSignedIn(false);
    setUserProfile(null);
    setError(null);
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
  
  return { isGapiReady: gapiReady && gisReady, isSignedIn, userProfile, error, signIn, signOut, saveFile, loadFile };
};