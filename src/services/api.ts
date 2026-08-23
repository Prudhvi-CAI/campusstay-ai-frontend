import {
  User,
  College,
  PropertySummary,
  PropertyDetail,
  Room,
  Review,
  Inquiry,
  AvailabilityAlert,
  SearchFilterParams,
  ChatMessage,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://campusstay-ai-backend.onrender.com/api')).replace(/\/$/, '');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('campusstay_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  auth: {
    async register(data: any) {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ access_token: string; role: string; user_id: number; email: string; full_name: string }>(res);
    },
    async login(data: any) {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ access_token: string; role: string; user_id: number; email: string; full_name: string }>(res);
    },
    async me(): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<User>(res);
    },
    async updateProfile(data: any): Promise<User> {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<User>(res);
    },
    async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string }>(res);
    },
    async forgotPassword(email: string): Promise<{
      message: string;
      email: string;
      email_sent?: boolean;
      smtp_configured?: boolean;
      delivery_mode?: string;
      debug_otp?: string;
    }> {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse<{
        message: string;
        email: string;
        email_sent?: boolean;
        smtp_configured?: boolean;
        delivery_mode?: string;
        debug_otp?: string;
      }>(res);
    },
    async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return handleResponse<{ message: string }>(res);
    },
    async resetPassword(data: { email: string; otp: string; new_password: string }): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string }>(res);
    },
    async getSmtpStatus(): Promise<{ is_configured: boolean; smtp_host: string; smtp_user: string; smtp_port: number }> {
      const res = await fetch(`${API_BASE}/auth/smtp-status`);
      return handleResponse<{ is_configured: boolean; smtp_host: string; smtp_user: string; smtp_port: number }>(res);
    },
    async updateSmtpConfig(data: { smtp_user: string; smtp_password: string; smtp_host?: string; smtp_port?: number }): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/auth/smtp-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string }>(res);
    },
    async testSmtp(data: { to_email: string; smtp_user?: string; smtp_password?: string }): Promise<{ success: boolean; message: string; details?: string }> {
      const res = await fetch(`${API_BASE}/auth/test-smtp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; details?: string }>(res);
    },
  },

  // Email & SMTP Services
  email: {
    async getStatus(): Promise<{ is_configured: boolean; smtp_host: string; smtp_user: string; smtp_port: number }> {
      const res = await fetch(`${API_BASE}/email/status`);
      return handleResponse<{ is_configured: boolean; smtp_host: string; smtp_user: string; smtp_port: number }>(res);
    },
    async updateConfig(data: { smtp_user: string; smtp_password: string; smtp_host?: string; smtp_port?: number; smtp_from_email?: string }): Promise<{ message: string }> {
      const res = await fetch(`${API_BASE}/email/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ message: string }>(res);
    },
    async test(data: { to_email: string; smtp_user?: string; smtp_password?: string; smtp_host?: string; smtp_port?: number }): Promise<{ success: boolean; message: string; details?: string }> {
      const res = await fetch(`${API_BASE}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<{ success: boolean; message: string; details?: string }>(res);
    },
  },

  // Colleges
  colleges: {
    async list(q?: string): Promise<College[]> {
      const url = q ? `${API_BASE}/colleges?q=${encodeURIComponent(q)}` : `${API_BASE}/colleges`;
      const res = await fetch(url);
      return handleResponse<College[]>(res);
    },
    async getById(id: number): Promise<College> {
      const res = await fetch(`${API_BASE}/colleges/${id}`);
      return handleResponse<College>(res);
    },
  },

  // Properties
  properties: {
    async list(params?: SearchFilterParams): Promise<PropertySummary[]> {
      const queryParams = new URLSearchParams();
      if (params?.college_id) queryParams.set('college_id', params.college_id.toString());
      if (params?.property_type) queryParams.set('property_type', params.property_type);
      if (params?.gender_preference) queryParams.set('gender_preference', params.gender_preference);
      if (params?.min_rent) queryParams.set('min_rent', params.min_rent.toString());
      if (params?.max_rent) queryParams.set('max_rent', params.max_rent.toString());
      if (params?.food_available !== undefined) queryParams.set('food_available', String(params.food_available));
      if (params?.wifi_available !== undefined) queryParams.set('wifi_available', String(params.wifi_available));
      if (params?.air_conditioning !== undefined) queryParams.set('ac_available', String(params.air_conditioning));
      if (params?.verified_only) queryParams.set('verified_only', 'true');
      if (params?.available_only) queryParams.set('available_only', 'true');

      const res = await fetch(`${API_BASE}/properties?${queryParams.toString()}`);
      return handleResponse<PropertySummary[]>(res);
    },
    async getById(id: number, collegeId?: number): Promise<PropertyDetail> {
      const url = collegeId
        ? `${API_BASE}/properties/${id}?college_id=${collegeId}`
        : `${API_BASE}/properties/${id}`;
      const res = await fetch(url);
      return handleResponse<PropertyDetail>(res);
    },
    async create(data: any): Promise<PropertyDetail> {
      const res = await fetch(`${API_BASE}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<PropertyDetail>(res);
    },
    async update(id: number, data: any): Promise<PropertyDetail> {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<PropertyDetail>(res);
    },
    async delete(id: number): Promise<void> {
      const res = await fetch(`${API_BASE}/properties/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error('Failed to delete property');
    },
  },

  // Rooms
  rooms: {
    async listByProperty(propertyId: number): Promise<Room[]> {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/rooms`);
      return handleResponse<Room[]>(res);
    },
    async create(propertyId: number, data: any): Promise<Room> {
      const res = await fetch(`${API_BASE}/properties/${propertyId}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<Room>(res);
    },
    async delete(roomId: number): Promise<void> {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error('Failed to delete room');
    },
  },

  // Availability Management
  availability: {
    async updateRoom(roomId: number, data: any): Promise<Room> {
      const res = await fetch(`${API_BASE}/availability/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<Room>(res);
    },
    async quickAdjust(roomId: number, delta: number): Promise<Room> {
      const res = await fetch(`${API_BASE}/availability/rooms/${roomId}/quick-adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ delta }),
      });
      return handleResponse<Room>(res);
    },
  },

  // Search
  search: {
    async query(filters: SearchFilterParams): Promise<{
      total: number;
      results: PropertySummary[];
      is_fallback_alternative: boolean;
      fallback_message?: string;
    }> {
      const res = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(filters),
      });
      return handleResponse(res);
    },
  },

  // AI Chatbot
  chat: {
    async send(data: { message: string; session_uuid?: string; college_id?: number }): Promise<{
      session_uuid: string;
      message: string;
      properties: PropertySummary[];
      follow_up_suggestions: string[];
      is_smart_empty_state: boolean;
      sources: string[];
    }> {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    async getSessions(): Promise<any[]> {
      const res = await fetch(`${API_BASE}/chat/sessions`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<any[]>(res);
    },
  },

  // Student Features
  student: {
    async getFavorites(): Promise<PropertySummary[]> {
      const res = await fetch(`${API_BASE}/student/favorites`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<PropertySummary[]>(res);
    },
    async addFavorite(propertyId: number): Promise<any> {
      const res = await fetch(`${API_BASE}/student/favorites/${propertyId}`, {
        method: 'POST',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    async removeFavorite(propertyId: number): Promise<any> {
      const res = await fetch(`${API_BASE}/student/favorites/${propertyId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    async compare(propertyIds: number[], collegeId?: number): Promise<{
      properties: PropertyDetail[];
      ai_recommendation: string;
      best_overall_property_id?: number;
      cheapest_property_id?: number;
      closest_property_id?: number;
      comparison_points: string[];
    }> {
      const res = await fetch(`${API_BASE}/student/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ property_ids: propertyIds, college_id: collegeId }),
      });
      return handleResponse(res);
    },
    async getAlerts(): Promise<AvailabilityAlert[]> {
      const res = await fetch(`${API_BASE}/alerts`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<AvailabilityAlert[]>(res);
    },
    async createAlert(data: any): Promise<AvailabilityAlert> {
      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<AvailabilityAlert>(res);
    },
    async deleteAlert(alertId: number): Promise<void> {
      const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeader() },
      });
      if (!res.ok) throw new Error('Failed to delete alert');
    },
  },

  // Owner Dashboard
  owner: {
    async getOverview(): Promise<{
      total_properties: number;
      total_rooms: number;
      total_beds: number;
      occupied_beds: number;
      available_beds: number;
      occupancy_rate: number;
      pending_inquiries: number;
      verified_properties: number;
      listing_health: string;
    }> {
      const res = await fetch(`${API_BASE}/owner/overview`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse(res);
    },
    async getProperties(): Promise<PropertyDetail[]> {
      const res = await fetch(`${API_BASE}/owner/properties`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<PropertyDetail[]>(res);
    },
    async getInquiries(): Promise<Inquiry[]> {
      const res = await fetch(`${API_BASE}/inquiries/owner`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<Inquiry[]>(res);
    },
    async replyInquiry(inquiryId: number, responseText: string): Promise<Inquiry> {
      const res = await fetch(`${API_BASE}/inquiries/${inquiryId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ owner_response: responseText, status: 'replied' }),
      });
      return handleResponse<Inquiry>(res);
    },
  },

  // Reviews
  reviews: {
    async getByProperty(propertyId: number): Promise<Review[]> {
      const res = await fetch(`${API_BASE}/reviews/property/${propertyId}`);
      return handleResponse<Review[]>(res);
    },
    async submit(data: { property_id: number; rating: number; comment: string; cleanliness_rating?: number; food_rating?: number; safety_rating?: number; value_for_money_rating?: number }): Promise<Review> {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<Review>(res);
    },
  },

  // Inquiries
  inquiries: {
    async create(data: { property_id: number; message: string; move_in_date?: string; preferred_sharing?: string; student_phone?: string }): Promise<Inquiry> {
      const res = await fetch(`${API_BASE}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse<Inquiry>(res);
    },
    async getStudentInquiries(): Promise<Inquiry[]> {
      const res = await fetch(`${API_BASE}/inquiries/student`, {
        headers: { ...getAuthHeader() },
      });
      return handleResponse<Inquiry[]>(res);
    },
  },

  // Reports
  reports: {
    async submit(data: { property_id: number; reason: string; details?: string }): Promise<any> {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
  },
};
