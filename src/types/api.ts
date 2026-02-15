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
  total_items_value?: number;
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
    [key: string]: unknown;
  };
  avatar_url?: string; // Пользовательский аватар
  steam_avatar?: string; // Виртуальное поле для обратной совместимости
  steam_avatar_url?: string; // Реальное поле из БД
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
  bestWeapon?: {
    id: string;
    name: string;
    image_url: string;
    price: number;
    rarity: string;
    weapon_type?: string;
  };
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
  item_pool_config?: unknown;
  special_conditions?: string | null;
  sort_order?: number;
  color_scheme?: string | null;
  guaranteed_min_value?: string | null;
  is_daily?: boolean;
  next_available_time?: string | null;
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
  // Новые поля для отображения модифицированных шансов
  drop_chance_percent?: number;
  modified_weight?: number;
  weight_multiplier?: number;
  bonus_applied?: number;
  // Поля для логики исключения предметов
  is_excluded?: boolean;
  is_already_dropped?: boolean;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserInventoryItem {
  id: string;
  item_type: 'item';
  item: Item;
  item_id: string;
  acquisition_date: string;
  source: string;
  status: 'available' | 'sold' | 'withdrawn' | 'used' | 'inventory' | 'pending_withdrawal' | 'converted_to_subscription';
  case_id?: string;
  case_template_id?: string;
  withdrawal?: unknown;
  transaction_date?: string;
  expires_at?: string;
}

export interface UserCaseItem {
  id: string;
  item_type: 'case';
  case_template_id: string;
  case_template?: CaseTemplate; // Опциональное, может загружаться отдельно
  item_id?: string;
  acquisition_date: string;
  expires_at?: string;
  source: string;
  status: 'inventory' | 'used' | 'sold' | 'withdrawn' | 'pending_withdrawal';
  transaction_date?: string;
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
  data?: unknown;
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
  case_template_id?: string; // для обратной совместимости
  caseTemplateId?: string; // новый формат для совместимости с контроллером
  method: 'balance' | 'bank_card';
  quantity?: number;
}

export interface OpenCaseRequest {
  case_id?: string;
  inventoryItemId?: string; // Для открытия кейсов из инвентаря
  template_id?: string; // Для открытия бесплатных кейсов по шаблону
}

export interface SellItemRequest {
  itemId: string;
}

export interface ExchangeItemForSubscriptionRequest {
  userId: string;
  itemId: string;
}

export interface ExchangeItemForSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    subscription_days_added: number;
    subscription_days_left: number;
    subscription_expiry_date: string;
    item_name: string;
    item_price: number;
  };
}

export interface WithdrawItemRequest {
  inventoryItemId: string;
  steamTradeUrl?: string;
}

export interface ApplyPromoRequest {
  promo_code: string;
}

export interface DepositRequest {
  amount: number;
  payment_method: 'freekassa';
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
  // БЕЗОПАСНОСТЬ: Токены теперь ТОЛЬКО в httpOnly cookies
  // token оставлен для обратной совместимости, но НЕ используется
  // @deprecated Токены больше не хранятся в Redux - они в httpOnly cookies
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginAttempt: number | null;
  sessionExpiry: number | null;
}

// Типы для крестиков-ноликов
export interface TicTacToeGameState {
  board: (string | null)[];
  currentPlayer: 'player' | 'bot';
  winner: 'player' | 'bot' | 'draw' | null;
  status: 'playing' | 'finished';
}

export interface TicTacToeGame {
  id: string;
  user_id: string;
  game_state: TicTacToeGameState;
  attempts_left: number;
  bot_goes_first: boolean;
  result: 'win' | 'lose' | 'draw' | 'ongoing';
  reward_given: boolean;
  created_at: string;
  updated_at: string;
}

export interface TicTacToeCurrentGameResponse {
  success: boolean;
  game: TicTacToeGame | null;
  canPlay: boolean;
  has_subscription: boolean;
  has_won_today: boolean;
  attempts_left: number;
  free_attempts_remaining?: number;
  free_attempts_info?: {
    can_use: boolean;
    reason: string;
    next_available: string | null;
    claim_count: number;
    first_claim_date: string | null;
    last_claim_date: string | null;
  };
  message?: string;
}

export interface TicTacToeCreateGameResponse {
  success: boolean;
  game: TicTacToeGame;
  message?: string;
}

export interface TicTacToeMakeMoveResponse {
  success: boolean;
  game: TicTacToeGame;
  message?: string;
}

// Типы для Tower Defense
export interface TowerDefenseGame {
  id: string;
  user_id: string;
  waves_completed: number;
  total_waves: number;
  enemies_killed: number;
  towers_built: number;
  score: number;
  result: 'win' | 'lose' | 'in_progress';
  reward_amount?: number;
  bet_item_id?: string;
  bet_inventory_id?: string;
  reward_item_id?: string;
  game_data?: unknown;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TowerDefenseStatusResponse {
  success: boolean;
  data: {
    canPlay: boolean;
    attemptsLeft: number;
    maxAttempts: number;
    currentGame?: TowerDefenseGame;
    hasSubscription: boolean;
    subscriptionTier: number;
  };
}

export interface TowerDefenseCreateGameResponse {
  success: boolean;
  data: {
    game: TowerDefenseGame;
    betItem?: {
      id: string;
      name: string;
      price: number;
      image_url: string;
    };
    rewardItem?: {
      id: string;
      name: string;
      price: number;
      image_url: string;
    };
    attemptsLeft: number;
  };
  message?: string;
}

export interface TowerDefenseCompleteGameRequest {
  gameId: string;
  wavesCompleted: number;
  enemiesKilled: number;
  towersBuilt: number;
  result: 'win' | 'lose';
}

export interface TowerDefenseCompleteGameResponse {
  success: boolean;
  data: {
    game: TowerDefenseGame;
    reward?: number;
    rewardItem?: {
      id: string;
      name: string;
      price: number;
      image_url: string;
    };
    newBalance: number;
  };
  message?: string;
}

export interface TowerDefenseStatisticsResponse {
  success: boolean;
  data: {
    statistics: {
      total_games: number;
      wins: number;
      losses: number;
      total_rewards: number;
      best_waves: number;
      total_enemies_killed: number;
    };
  };
}

export interface UpgradeItem {
  id: string;
  name: string;
  image_url: string;
  price: number;
  rarity: string;
  weapon_type?: string;
}

export interface UpgradeItemGroup {
  item: UpgradeItem;
  instances: UserInventoryItem[];
  count: number;
}

export interface UpgradeOption extends UpgradeItem {
  upgrade_chance: number;
  base_chance?: number;
  quantity_bonus?: number;
  price_ratio: number;
}

export interface UpgradeableItemsResponse {
  success: boolean;
  data: {
    items: UpgradeItemGroup[];
  };
}

export interface UpgradeOptionsResponse {
  success: boolean;
  data: {
    source_items: UpgradeItem[];
    total_source_price: number;
    upgrade_options: Array<UpgradeOption & {
      base_chance: number;
      quantity_bonus: number;
    }>;
  };
}

export interface UpgradeRequest {
  sourceInventoryIds: string[];
  targetItemId: string;
}

export interface UpgradeResponse {
  success: boolean;
  upgrade_success: boolean;
  message: string;
  data: {
    source_items: UpgradeItem[];
    result_item?: UpgradeItem;
    target_item?: UpgradeItem;
    success_chance: number;
    rolled_value: number;
    total_source_price: number;
    quantity_bonus: number;
  };
}

// Типы для пополнения баланса
export interface TopUpBalanceRequest {
  amount: number;
  currency?: string;
  payment_method?: string;
  /** Для Unitpay: 'card' | 'sbp' — сразу открывает форму с выбранным способом */
  unitpay_system?: string;
}

export interface TopUpBalanceResponse {
  success: boolean;
  data: {
    paymentUrl?: string;
    qrUrl?: string;
    paymentId: string;
  };
  message?: string;
}
