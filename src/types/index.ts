export type UserRole = 'student' | 'owner' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  student_profile?: {
    college_id?: number;
    budget_min: number;
    budget_max: number;
    preferred_room_type: string;
    max_distance_km: number;
    gender: string;
    preferences?: Record<string, any>;
  };
  owner_profile?: {
    business_name?: string;
    alternate_phone?: string;
    address?: string;
    is_verified: boolean;
  };
}

export interface College {
  id: number;
  name: string;
  short_name: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  image_url?: string;
}

export interface FreshnessInfo {
  last_updated: string;
  formatted_time_ago: string;
  status_level: 'fresh' | 'warning' | 'outdated';
  warning_message?: string;
}

export interface SharingSummary {
  room_type: string;
  min_rent: number;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  is_available: boolean;
}

export interface Bed {
  id: number;
  room_id: number;
  bed_label: string;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE';
  occupant_name?: string;
  notes?: string;
}

export interface Room {
  id: number;
  property_id: number;
  room_number: string;
  room_type: 'single' | '2-sharing' | '3-sharing' | '4-sharing' | 'custom';
  monthly_rent: number;
  security_deposit: number;
  floor: number;
  attached_bathroom: boolean;
  air_conditioning: boolean;
  balcony: boolean;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE';
  beds: Bed[];
}

export interface PropertySummary {
  id: number;
  owner_id: number;
  property_name: string;
  property_type: 'PG' | 'Room' | 'Apartment' | 'House' | 'Hostel';
  description: string;
  address: string;
  city: string;
  locality: string;
  latitude: number;
  longitude: number;
  nearby_college?: College;
  distance_from_college_km: number;
  monthly_rent: number;
  security_deposit: number;
  gender_preference: 'boys' | 'girls' | 'co-ed' | 'any';
  food_available: boolean;
  wifi_available: boolean;
  laundry_available: boolean;
  parking_available: boolean;
  furnished: boolean;
  attached_bathroom: boolean;
  air_conditioning: boolean;
  cover_image?: string;
  images_json?: string;
  rating_average: number;
  review_count: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'flagged';
  is_active: boolean;
  last_availability_update: string;
  freshness: FreshnessInfo;
  total_available_beds: number;
  has_availability: boolean;
  sharing_summary: SharingSummary[];
  match_score?: number;
  match_reasons: string[];
}

export interface PropertyDetail extends PropertySummary {
  neighborhood_overview?: string;
  curfew_time: string;
  notice_period_days: number;
  food_type: string;
  meals_included: string;
  power_backup: boolean;
  housekeeping: boolean;
  security_guard: boolean;
  cctv: boolean;
  refrigerator: boolean;
  geyser: boolean;
  drinking_water_ro: boolean;
  study_table: boolean;
  contact_phone: string;
  contact_email?: string;
  verification_method?: string;
  verified_at?: string;
  created_at: string;
  rooms: Room[];
  owner_name?: string;
  owner_phone?: string;
}

export interface Review {
  id: number;
  property_id: number;
  student_id: number;
  student_name: string;
  student_avatar?: string;
  rating: number;
  comment: string;
  cleanliness_rating: number;
  food_rating: number;
  safety_rating: number;
  value_for_money_rating: number;
  created_at: string;
}

export interface Inquiry {
  id: number;
  property_id: number;
  property_name: string;
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone?: string;
  owner_id: number;
  message: string;
  move_in_date?: string;
  preferred_sharing?: string;
  owner_response?: string;
  status: 'pending' | 'replied' | 'closed';
  created_at: string;
}

export interface AvailabilityAlert {
  id: number;
  student_id: number;
  college_id?: number;
  college_name?: string;
  max_budget: number;
  room_type: string;
  max_distance_km: number;
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id?: number;
  sender: 'user' | 'assistant';
  content: string;
  properties?: PropertySummary[];
  follow_up_suggestions?: string[];
  is_smart_empty_state?: boolean;
  sources?: string[];
  created_at?: string;
}

export interface SearchFilterParams {
  query?: string;
  college_id?: number;
  college_name?: string;
  city?: string;
  locality?: string;
  property_type?: string;
  room_type?: string;
  min_rent?: number;
  max_rent?: number;
  max_distance_km?: number;
  gender_preference?: string;
  food_available?: boolean;
  wifi_available?: boolean;
  laundry_available?: boolean;
  parking_available?: boolean;
  air_conditioning?: boolean;
  attached_bathroom?: boolean;
  power_backup?: boolean;
  verified_only?: boolean;
  available_only?: boolean;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'distance' | 'rating';
  limit?: number;
  offset?: number;
}
