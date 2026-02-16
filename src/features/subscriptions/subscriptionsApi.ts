import { baseApi } from '../../store/api/baseApi';
import type { ApiResponse, UserCaseItem } from '../../types/api';

export interface SubscriptionTier {
  id: number;
  days: number;
  max_daily_cases: number;
  bonus_percentage: number;
  name: string;
  price: number;
}

export interface BuySubscriptionRequest {
  tierId: number;
  method: 'balance' | 'item' | 'promo' | 'bank_card';
  itemId?: string;
  promoCode?: string;
  paymentMethod?: 'robokassa' | 'freekassa' | 'unitpay';
  unitpay_system?: 'card' | 'sbp';
}

export interface SubscriptionStatus {
  tier: {
    id: number;
    name: string;
    expiry_date: string;
    bonus: number;
    max_daily_cases: number;
  };
  isActive: boolean;
  daysLeft?: number;
}

// Расширяем базовый API для работы с подписками
export const subscriptionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение доступных тарифов подписки
    getSubscriptionTiers: builder.query<ApiResponse<SubscriptionTier[]>, void>({
      query: () => 'v1/subscription/tiers',
      providesTags: ['Subscription'],
    }),

    // Получение текущего статуса подписки
    getSubscriptionStatus: builder.query<ApiResponse<SubscriptionStatus>, void>({
      query: () => 'v1/subscription',
      providesTags: ['Subscription'],
    }),

    // Покупка подписки
    buySubscription: builder.mutation<
      ApiResponse<SubscriptionStatus & { balance?: number; paymentUrl?: string; qrUrl?: string }>,
      BuySubscriptionRequest
    >({
      query: (subscriptionData) => ({
        url: 'v1/subscription/buy',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['Subscription', 'User', 'Balance', 'Profile'],
      // Обновляем профиль и баланс сразу после покупки (как при пополнении баланса)
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!data?.success) return;
          // Бэкенд при успешной оплате балансом/предметом/промо возвращает { success, tier, balance, message } без обёртки data
          const balance = (data as { balance?: number }).balance;
          const tier = (data as { tier?: { id: number; expiry_date?: string; max_daily_cases?: number } }).tier;
          if (balance !== undefined) {
            dispatch({ type: 'auth/updateBalance', payload: balance });
          }
          if (tier) {
            const { updateUser } = await import('../auth/authSlice');
            dispatch(updateUser({
              balance: balance,
              subscription_expiry_date: tier.expiry_date,
              subscription_tier: String(tier.id),
              max_daily_cases: tier.max_daily_cases,
            }));
          }
        } catch {
          // при ошибке инвалидация тегов всё равно обновит данные при следующем запросе
        }
      },
    }),

    // Получение истории подписок
    getSubscriptionHistory: builder.query<
      ApiResponse<any[]>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `v1/subscription/history?page=${page}&limit=${limit}`,
      providesTags: ['Subscription'],
    }),

    // Получение статуса ежедневных кейсов подписки
    getSubscriptionCaseStatus: builder.query<
      ApiResponse<{
        has_active_subscription: boolean;
        can_claim: boolean;
        has_subscription_case_in_inventory: boolean;
        subscription_tier: number;
        next_available_time: string | null;
        time_remaining: string | null;
        subscription_expiry_date: string;
      }>,
      void
    >({
      query: () => 'v1/subscription/case-status',
      providesTags: ['Subscription', 'Cases', 'Inventory'],
    }),

    // Получение ежедневных кейсов подписки
    claimSubscriptionCase: builder.mutation<
      ApiResponse<{
        cases_claimed: number;
        next_available_time: string;
        user_cases: UserCaseItem[];
      }>,
      void
    >({
      query: () => ({
        url: 'v1/subscription/claim-case',
        method: 'POST',
      }),
      invalidatesTags: ['Subscription', 'Cases', 'Inventory'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetSubscriptionTiersQuery,
  useGetSubscriptionStatusQuery,
  useBuySubscriptionMutation,
  useGetSubscriptionHistoryQuery,
  useGetSubscriptionCaseStatusQuery,
  useClaimSubscriptionCaseMutation,
} = subscriptionsApi;

