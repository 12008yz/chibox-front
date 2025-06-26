import { baseApi } from '../../store/api/baseApi';
import type { ApiResponse } from '../../types/api';

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
      transformResponse: () => ({
        success: true,
        data: [
          { id: 1, days: 30, max_daily_cases: 1, bonus_percentage: 3.0, name: 'Статус', price: 1210 },
          { id: 2, days: 30, max_daily_cases: 1, bonus_percentage: 5.0, name: 'Статус+', price: 2890 },
          { id: 3, days: 30, max_daily_cases: 1, bonus_percentage: 8.0, name: 'Статус++', price: 6819 }
        ]
      }),
      providesTags: ['Subscription'],
    }),

    // Получение текущего статуса подписки
    getSubscriptionStatus: builder.query<ApiResponse<SubscriptionStatus>, void>({
      query: () => 'v1/subscription',
      providesTags: ['Subscription'],
    }),

    // Покупка подписки
    buySubscription: builder.mutation<
      ApiResponse<SubscriptionStatus & { balance?: number; paymentUrl?: string }>,
      BuySubscriptionRequest
    >({
      query: (subscriptionData) => ({
        url: 'v1/subscription/buy',
        method: 'POST',
        body: subscriptionData,
      }),
      invalidatesTags: ['Subscription', 'User', 'Balance'],
      // Обновляем баланс пользователя после покупки
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.balance !== undefined) {
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.balance,
            });
          }
        } catch {
          // Обработка ошибок
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
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetSubscriptionTiersQuery,
  useGetSubscriptionStatusQuery,
  useBuySubscriptionMutation,
  useGetSubscriptionHistoryQuery,
} = subscriptionsApi;
