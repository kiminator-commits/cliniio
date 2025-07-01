type Cache<T> = {
  [key: string]: T;
};

const memoryCache: Cache<unknown> = {};

export async function cachedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  if (memoryCache[key]) {
    return memoryCache[key] as T;
  }
  const data = await fetcher();
  memoryCache[key] = data;
  return data;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const submitLoginForm = async (credentials: { email: string; password: string }) => {
  // TODO: Implement actual authentication logic
  console.log('Login attempt with:', credentials.email);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated delay
  return { success: true };
};

export const api = new ApiService();
