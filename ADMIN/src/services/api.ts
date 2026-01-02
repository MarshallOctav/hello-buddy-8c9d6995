const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    
    console.log('[API] Request:', options.method || 'GET', url);
    console.log('[API] Token:', this.getToken() ? 'Present' : 'Missing');
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      console.log('[API] Response status:', response.status);

      if (response.status === 401) {
        console.log('[API] Unauthorized - redirecting to login');
        localStorage.removeItem('admin_token');
        window.location.href = '/login';
        throw new Error('Sesi telah berakhir, silakan login kembali');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[API] Error response:', errorData);
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] Response data:', data);
      return data;
    } catch (error) {
      console.error('[API] Fetch error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiService();
export { API_URL };
