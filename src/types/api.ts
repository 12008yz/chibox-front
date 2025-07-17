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
  total_cases_opened?: number;
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
  steam_profile?: {
    personaname?: string;
    profileurl?: string;
    avatar?: string;
    avatarmedium?: string;
    avatarfull?: string;
    [key: string]: any; // Для других полей Steam профиля
  };
  steam_avatar?: string;
  steam_profile_url?: string;
  steam_trade_url?: string;
  auth_provider?: 'local' | 'steam';
  is_email_verified?: boolean;
  role?: string;
  created_at?: string;
  updated_at?: string;
  // Дополнительные поля для данных профиля
  achievements?: UserAchievement[];
  inventory?: UserInventoryItem[];
}

export interface CaseTemplate {
  id: string;
  name: string;
  price: string;
  image_url: string | null;
  description?: string;
  animation_url?: string | null;
  type?: string;
  min_subscription_tier?: number;
  is_active?: boolean;
  availability_start?: string | null;
  availability_end?: string | null;
  max_opens_per_user?: number | null;
  cooldown_hours?: number;
  item_pool_config?: any;
  special_conditions?: string | null;
  sort_order?: number;
  color_scheme?: string | null;
  guaranteed_min_value?: string | null;
  is_daily?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  description?: string;
  image_url: string | null;
  price: string;
  rarity: string;
  drop_weight?: number;
  min_subscription_tier?: number;
  weapon_type?: string;
  skin_name?: string;
  steam_market_hash_name?: string;
  steam_market_url?: string;
  is_available?: boolean;
  float_value?: number | null;
  exterior?: string;
  quality?: string | null;
  stickers?: string | null;
  origin?: string;
  in_stock?: boolean;
  is_tradable?: boolean;
  category?: string;
  category_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserInventoryItem {
  id: string;
  item_type: 'item';
  item: Item;
  acquisition_date: string;
  source: string;
  status: 'available' | 'sold' | 'withdrawn' | 'used' | 'inventory';
  case_id?: string;
  withdrawal?: any;
}

export interface UserCaseItem {
  id: string;
  item_type: 'case';
  case_template_id: string;
  case_template?: CaseTemplate; // Опциональное, может загружаться отдельно
  acquisition_date: string;
  expires_at?: string;
  source: string;
  status: 'inventory';
}

// Союзный тип для элементов инвентаря
export type InventoryItem = UserInventoryItem | UserCaseItem;

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

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  is_completed: boolean;
  completion_date?: string;
  notified: boolean;
  bonus_applied: boolean;
  createdAt: string;
  updatedAt: string;
  achievement: Achievement;
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
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'general' | 'case_opening' | 'transaction' | 'achievement' | 'promotion' | 'subscription' | 'withdrawal' | 'bonus' | 'level_up';
  link?: string;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  importance: number;
  data?: any;
  created_at: string;
  updated_at: string;
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

export interface InventoryResponse {
  success: boolean;
  data: {
    items: UserInventoryItem[];
    cases: UserCaseItem[];
    totalItems: number;
    totalCases: number;
    currentPage: number;
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

export interface BonusStatus {
  is_available: boolean;
  next_bonus_available_time?: string;
  time_until_next_seconds?: number;
  lifetime_bonuses_claimed?: number;
  last_bonus_date?: string;
  has_active_subscription: boolean;
  cooldown_hours: number;
  subscription_expiry?: string;
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
