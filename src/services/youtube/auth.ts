import * as youtubePreference from 'services/preference/youtube';
import type { StoredToken } from './types';

const YOUTUBE_UPLOAD_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';

type TokenClientWithError = google.accounts.oauth2.TokenClient & {
  _lastError?: google.accounts.oauth2.ErrorResponse;
  _signInReject?: (error: Error) => void;
};

let tokenClient: TokenClientWithError | null = null;
let isInitialized = false;

const loadGoogleScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (typeof google !== 'undefined' && google.accounts?.oauth2) {
      resolve();
      return;
    }

    // Check if script tag exists but not yet loaded
    if (document.getElementById('google-gsi-script')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts?.oauth2) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        reject(new Error('Google Identity Services failed to load'));
      }, 10000);
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // Wait for google object to be available
      const checkLoaded = setInterval(() => {
        if (typeof google !== 'undefined' && google.accounts?.oauth2) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (typeof google !== 'undefined' && google.accounts?.oauth2) {
          resolve();
        } else {
          reject(new Error('Google Identity Services not available'));
        }
      }, 5000);
    };

    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services script'));

    document.head.appendChild(script);
  });
};

export const initGoogleAuth = async (): Promise<void> => {
  if (isInitialized) return;

  await loadGoogleScript();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID is not configured. Please add it to your .env file.',
    );
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: YOUTUBE_UPLOAD_SCOPE,
    callback: (response) => {
      console.log('YouTube Auth: Default callback triggered', response);
    },
    error_callback: (error) => {
      console.error('YouTube Auth: Error callback triggered', error);
      // Call the reject function if signIn is waiting
      if ((tokenClient as TokenClientWithError)?._signInReject) {
        const rejectFn = (tokenClient as TokenClientWithError)._signInReject!;
        (tokenClient as TokenClientWithError)._signInReject = undefined;

        if (error.type === 'popup_closed') {
          rejectFn(new Error('Sign-in popup was closed. Please try again and complete the authorization.'));
        } else {
          rejectFn(new Error(error.message || 'Google sign-in failed'));
        }
      }
    },
  });

  console.log('YouTube Auth: Initialized with client ID:', clientId.substring(0, 20) + '...');

  isInitialized = true;
};

export const signIn = async (): Promise<StoredToken> => {
  // Auto-initialize if not already done
  if (!tokenClient) {
    await initGoogleAuth();
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Failed to initialize Google Auth. Please check your Client ID.'));
      return;
    }

    let callbackReceived = false;

    // Store reject function for error_callback to use
    tokenClient._signInReject = (error: Error) => {
      callbackReceived = true;
      clearTimeout(timeoutId);
      reject(error);
    };

    // Set up timeout for popup (user might have closed it or it was blocked)
    const timeoutId = setTimeout(() => {
      if (!callbackReceived) {
        tokenClient!._signInReject = undefined;
        console.error('YouTube Auth: Timeout - no callback received');
        reject(new Error('Sign-in timed out. Please allow popups and try again.'));
      }
    }, 120000); // 2 minute timeout

    tokenClient.callback = (response) => {
      callbackReceived = true;
      clearTimeout(timeoutId);
      tokenClient!._signInReject = undefined;
      console.log('YouTube Auth: Callback received', response);

      if (response.error) {
        console.error('YouTube Auth: Error in response', response.error);
        if (response.error === 'popup_closed_by_user') {
          reject(new Error('Sign-in was cancelled.'));
        } else if (response.error === 'access_denied') {
          reject(new Error('Access was denied. Please grant permission to upload videos.'));
        } else {
          reject(new Error(response.error_description || response.error));
        }
        return;
      }

      const token: StoredToken = {
        accessToken: response.access_token,
        expiresAt: Date.now() + response.expires_in * 1000,
      };

      console.log('YouTube Auth: Token saved successfully');
      youtubePreference.set(token);
      resolve(token);
    };

    console.log('YouTube Auth: Requesting access token...');
    // Request access token - will show popup
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const signOut = (): void => {
  const token = youtubePreference.get();
  if (token) {
    // Revoke the token
    google.accounts.oauth2.revoke(token.accessToken, () => {
      // Callback after revoke
    });
  }
  youtubePreference.remove();
};

export const getAccessToken = (): string | null => {
  const token = youtubePreference.get();
  return token?.accessToken ?? null;
};

export const isAuthenticated = (): boolean => {
  return youtubePreference.get() !== null;
};
