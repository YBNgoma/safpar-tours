// Type definitions for Safpar Tours application

export interface Tour {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  category: 'river-cruise' | 'adventure' | 'wildlife' | 'cultural';
  duration_hours: number;
  max_participants: number;
  min_participants: number;
  difficulty_level: 'easy' | 'moderate' | 'challenging';
  image_urls: string[];
  featured_image: string;
  inclusions: string;
  exclusions: string;
  requirements: string;
  status: 'active' | 'inactive' | 'seasonal';
  created_at: string;
  updated_at: string;
}

export interface Rate {
  id: number;
  tour_id: number;
  season: 'low' | 'high' | 'peak';
  adult_price: number;
  child_price: number;
  infant_price: number;
  group_discount_percent: number;
  min_group_size: number;
  valid_from: string;
  valid_to: string;
  currency: string;
  created_at: string;
}

export interface TourWithRates extends Tour {
  adult_price: number;
  child_price: number;
  season: string;
  group_discount_percent: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface BookingInquiry {
  id: number;
  tour_id: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  preferred_date: string;
  participants: number;
  special_requirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}