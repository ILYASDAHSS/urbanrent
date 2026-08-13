import { Property, TourBooking } from './types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private token: string | null = localStorage.getItem('auth_token');
  private user: any | null = JSON.parse(localStorage.getItem('auth_user') || 'null');

  setAuth(token: string | null, user: any | null) {
    this.token = token;
    this.user = user;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    if (user) {
      localStorage.setItem('auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('auth_user');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): any | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers = new Headers(options.headers || {});
    headers.set('Accept', 'application/json');

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config = {
      ...options,
      headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      this.setAuth(null, null);
      throw new Error('Session expired. Please sign in again.');
    }

    const data = await response.json();

    if (!response.ok) {
      const message = data.message || data.error || 'Something went wrong';
      throw new Error(message);
    }

    return data;
  }

  // Authentication APIs
  async login(credentials: { email: string; password?: string }): Promise<any> {
    const data = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setAuth(data.access_token, data.user);
    return data.user;
  }

  async register(userData: { name: string; email: string; password?: string; role: string }): Promise<any> {
    const data = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setAuth(data.access_token, data.user);
    return data.user;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      this.setAuth(null, null);
    }
  }

  async getMe(): Promise<any> {
    const user = await this.request('/me');
    this.setAuth(this.token, user);
    return user;
  }

  // Properties APIs
  async getProperties(): Promise<Property[]> {
    return this.request('/properties');
  }

  async postProperty(propertyData: any): Promise<Property> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    await this.request(`/properties/${id}`, { method: 'DELETE' });
  }

  // Bookings APIs
  async getBookings(): Promise<TourBooking[]> {
    return this.request('/bookings');
  }

  async createBooking(bookingData: { propertyId: string; date: string; time: string; type: string }): Promise<TourBooking> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async updateBookingStatus(id: string, status: string): Promise<TourBooking> {
    return this.request(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteBooking(id: string): Promise<void> {
    await this.request(`/bookings/${id}`, { method: 'DELETE' });
  }

  // Admin APIs
  async getAdminStats(): Promise<any> {
    return this.request('/admin/stats');
  }

  async getAdminUsers(): Promise<any[]> {
    return this.request('/admin/users');
  }

  async updateUserRole(id: number | string, role: string): Promise<any> {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: number | string): Promise<void> {
    await this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiService();
