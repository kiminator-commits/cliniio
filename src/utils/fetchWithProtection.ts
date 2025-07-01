import { logError } from './errorLogger';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  signal?: AbortSignal;
}

export const fetchWithProtection = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { retries = 0, retryDelay = 300, signal, ...rest } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { ...rest, signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} – ${response.statusText}`);
      }
      return response;
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        logError(err, 'fetchWithProtection');
      }
      if (attempt === retries) throw err;
      if (retryDelay) await new Promise(res => setTimeout(res, retryDelay));
    }
  }

  throw new Error('Failed to fetch');
};
