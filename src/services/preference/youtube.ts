import type { StoredToken } from 'services/youtube/types';

const localStorageKey = 'youtubeAuth';

export const get = (): StoredToken | null => {
  const stored = localStorage.getItem(localStorageKey);
  if (!stored) return null;

  try {
    const parsed: StoredToken = JSON.parse(stored);
    // Return null if token is expired (with 5 min buffer)
    if (parsed.expiresAt < Date.now() + 5 * 60 * 1000) {
      remove();
      return null;
    }
    return parsed;
  } catch {
    remove();
    return null;
  }
};

export const set = (token: StoredToken): void => {
  localStorage.setItem(localStorageKey, JSON.stringify(token));
};

export const remove = (): void => {
  localStorage.removeItem(localStorageKey);
};
