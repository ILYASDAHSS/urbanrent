import { Property, RentalApplication, RentPayment, TourBooking } from './types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export const resolveAssetUrl = (url: string): string => {
  if (!url.startsWith('/storage/')) return url;

  const apiOrigin = new URL(API_BASE_URL, window.location.origin).origin;
  return new URL(url, apiOrigin).toString();
};

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

  async updateProfile(profile: {
    name?: string;
    phone?: string;
    city?: string;
    occupation?: string;
    bio?: string;
    move_in_date?: string | null;
    budget_min?: number | null;
    budget_max?: number | null;
    pets?: string;
    household_size?: number | null;
  }): Promise<any> {
    const user = await this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
    this.setAuth(this.token, user);
    return user;
  }

  async uploadAvatar(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('avatar', file);

    const user = await this.request('/profile/avatar', {
      method: 'POST',
      body: formData,
    });
    this.setAuth(this.token, user);
    return user;
  }

  // Properties APIs
  async getProperties(): Promise<Property[]> {
    return this.request('/properties');
  }

  async geocodeAddress(location: {
    address: string;
    city: string;
    neighborhood?: string;
    zipCode?: string;
  }): Promise<{ lat: number; lng: number; label: string }> {
    return this.request('/geocode', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }

  async postProperty(propertyData: any): Promise<Property> {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async updatePropertyStatus(id: string, listingStatus: 'available' | 'leased'): Promise<Property> {
    return this.request(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ listingStatus }),
    });
  }

  async moderateProperty(id: string, listingStatus: 'available' | 'rejected'): Promise<Property> {
    return this.request(`/admin/properties/${id}/moderation`, {
      method: 'PUT',
      body: JSON.stringify({ listingStatus }),
    });
  }

  async deleteProperty(id: string): Promise<void> {
    await this.request(`/properties/${id}`, { method: 'DELETE' });
  }

  async getApplications(): Promise<RentalApplication[]> {
    return this.request('/applications');
  }

  async createApplication(application: {
    propertyId: string;
    message: string;
    moveInDate?: string;
    occupants?: number;
    employment?: string;
  }): Promise<RentalApplication> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async updateApplicationStatus(id: string, status: RentalApplication['status']): Promise<RentalApplication> {
    return this.request(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async getPayments(): Promise<RentPayment[]> {
    return this.request('/payments');
  }

  async createRentPayment(applicationId: string, method: RentPayment['method']): Promise<RentPayment> {
    return this.request(`/applications/${applicationId}/payments`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    });
  }

  async confirmInPersonPayment(id: string): Promise<RentPayment> {
    return this.request(`/payments/${id}/confirm`, { method: 'PUT' });
  }

  async getFavoritePropertyIds(): Promise<string[]> {
    return this.request('/favorites');
  }

  async addFavorite(propertyId: string): Promise<void> {
    await this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    });
  }

  async removeFavorite(propertyId: string): Promise<void> {
    await this.request(`/favorites/${propertyId}`, { method: 'DELETE' });
  }

  // Bookings APIs
  async getBookings(): Promise<TourBooking[]> {
    return this.request('/bookings');
  }

  async createBooking(bookingData: {
    propertyId: string;
    date: string;
    time: string;
    type: TourBooking['type'];
    tenantName: string;
    tenantPhone: string;
  }): Promise<TourBooking> {
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

  async updateUserSuspension(id: number | string, suspended: boolean): Promise<any> {
    return this.request(`/admin/users/${id}/suspension`, {
      method: 'PUT',
      body: JSON.stringify({ suspended }),
    });
  }

  async downloadMonthlyReport(month: string): Promise<void> {
    const headers = new Headers({ Accept: 'text/csv' });
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE_URL}/admin/reports/monthly?month=${encodeURIComponent(month)}`, {
      headers,
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Could not download the monthly report.');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `urbanrent-monthly-report-${month}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export const api = new ApiService();
