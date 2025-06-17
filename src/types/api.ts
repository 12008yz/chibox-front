// Базовые типы для API
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  level: number;
  xp: number;
  xp_to_next_level?: number;
  level_bonus_percentage?: number;
  total_xp_earned?: number;
  subscription_tier?: string;
  subscription_purchase_date?: string;
  subscription_expiry_date?: string;
  subscription_days_left?: number;
  cases_available?: number;
  cases_opened_today?: number;
  next_case_available_time?: string;
  max_daily_cases?: number;
  next_bonus_available_time?: string;
  last_bonus_date?: string;
  lifetime_bonuses_claimed?: number;
  successful_bonus_claims?: number;
  drop_rate_modifier?: number;
  achievements_bonus_percentage?: number;
  subscription_bonus_percentage?: number;
  total_drop_bonus_percentage?: number;
  steam_id?: string;
  steam_username?: string;
  steam_avatar?: string;
  steam_profile_url?: string;
  steam_trade_url?: string;
  is_email_verified?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CaseTemplate {
  id: string;
  name: string;
  price: number;
  image_url: string;
  description?: string;
  is_daily: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  rarity: string;
  price: number;
  image_url: string;
  category: string;
  steam_market_hash_name?: string;
  float_value?: number;
  in_stock: boolean;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  status: 'available' | 'sold' | 'withdrawn' | 'used';
  acquired_at: string;
  item: Item;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string;
  reward_value: number;
  image_url?: string;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string;
  reward_value: number;
  expires_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'case_purchase' | 'item_sale';
  amount: number;
  description: string;
  created_at: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface BuyCaseRequest {
  case_template_id: string;
}

export interface OpenCaseRequest {
  case_id: string;
}

export interface SellItemRequest {
  user_inventory_item_id: string;
}

export interface WithdrawItemRequest {
  user_inventory_item_id: string;
  steam_trade_url: string;
}

export interface ApplyPromoRequest {
  promo_code: string;
}

export interface DepositRequest {
  amount: number;
  payment_method: 'yookassa';
}

// Auth state
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAttempt: number | null;
  sessionExpiry: number | null;
}
