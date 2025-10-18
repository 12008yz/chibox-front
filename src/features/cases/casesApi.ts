import { baseApi } from '../../store/api/baseApi';
import type {
  CaseTemplate,
  BuyCaseRequest,
  OpenCaseRequest,
  UserInventoryItem,
  Item,
  ApiResponse,
  PaginatedResponse
} from '../../types/api';

// Расширяем базовый API для работы с кейсами
export const casesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение доступных шаблонов кейсов
    getCaseTemplates: builder.query<ApiResponse<CaseTemplate[]>, void>({
      query: () => 'v1/cases/available',
      providesTags: ['CaseTemplates'],
    }),

    // Получение всех кейсов (бесплатных и платных)
    getAllCases: builder.query<ApiResponse<{
      free_cases: CaseTemplate[];
      paid_cases: CaseTemplate[];
      user_cases: any[];
      user_subscription_tier: number;
    }>, void>({
      query: () => 'v1/cases',
      providesTags: ['Cases', 'CaseTemplates'],
    }),

    // Получение истории кейсов пользователя
    getUserCases: builder.query<
      PaginatedResponse<any>,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 20 } = {}) =>
        `v1/cases?page=${page}&limit=${limit}`,
      providesTags: ['Cases'],
    }),

    // Покупка кейса
    buyCase: builder.mutation<
      ApiResponse<{
        case_id?: string;
        new_balance?: number;
        inventory_cases?: any[];
        paymentUrl?: string;
        message?: string;
        balance?: number;
        paid_cases_bought_today?: number;
        remaining_cases?: number;
      }>,
      BuyCaseRequest
    >({
      query: (caseData) => ({
        url: 'v1/cases/buy',
        method: 'POST',
        body: caseData,
      }),
      extraOptions: { maxRetries: 0 }, // Отключаем retry для избежания дублирования покупок
      invalidatesTags: ['Cases', 'Balance', 'User'],
      // Обновление баланса после покупки
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success) {
            // Обновляем баланс в auth slice (поддерживаем разные форматы ответа)
            const newBalance = data.data?.new_balance ?? data.data?.balance;
            if (newBalance !== undefined) {
              // Импортируем action напрямую
              const { updateBalance } = await import('../../features/auth/authSlice');
              dispatch(updateBalance(newBalance));
              console.log('Баланс обновлен после покупки кейса:', newBalance);
            }
          }
        } catch (error) {
          console.error('Ошибка при обновлении баланса после покупки:', error);
        }
      },
    }),

    // Открытие кейса
    openCase: builder.mutation<
      ApiResponse<{
        item: Item;
        animation_data?: any;
        new_balance?: number;
        caseId?: string;
      }>,
      OpenCaseRequest
    >({
      query: (caseData) => ({
        url: 'v1/open-case',
        method: 'POST',
        body: caseData,
      }),
      extraOptions: { maxRetries: 0 }, // Отключаем retry для избежания дублирования открытий
      invalidatesTags: ['Cases', 'Inventory', 'Balance', 'User', 'CaseTemplates'],
      // Обновляем баланс и инвентарь после открытия
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.new_balance !== undefined) {
            // Импортируем action напрямую
            const { updateBalance } = await import('../../features/auth/authSlice');
            dispatch(updateBalance(data.data.new_balance));
            console.log('Баланс обновлен после открытия кейса:', data.data.new_balance);
          }

          // Принудительно инвалидируем все связанные кеши
          dispatch(
            casesApi.util.invalidateTags(['Inventory', 'Balance', 'User'])
          );
        } catch (error) {
          console.error('Ошибка при обновлении баланса после открытия:', error);
        }
      },
    }),

    // Получение предметов в кейсе (для превью)
    getCaseItems: builder.query<
      ApiResponse<{
        caseTemplate: CaseTemplate;
        items: Item[];
      }>,
      string
    >({
      query: (caseTemplateId) => `v1/case-templates/${caseTemplateId}/items`,
      providesTags: ['User'],
    }),

    // Получение статистики дропов (последние выпавшие предметы)
    getRecentDrops: builder.query<
      ApiResponse<any[]>,
      { limit?: number }
    >({
      query: ({ limit = 10 } = {}) => `v1/live-drops?limit=${limit}`,
    }),

    // Получение информации о покупке кейса
    getCasePurchaseInfo: builder.query<
      ApiResponse<any>,
      void
    >({
      query: () => 'v1/cases/purchase-info',
    }),

    // Получение статуса кейса (можно ли открыть/купить)
    getCaseStatus: builder.query<
      ApiResponse<{
        canOpen: boolean;
        canBuy: boolean;
        reason: string;
        nextAvailableTime: string | null;
        caseType: string;
        price: number;
        subscriptionRequired: boolean;
        userSubscriptionTier: number;
        subscriptionDaysLeft: number;
        minSubscriptionTier: number;
      }>,
      string
    >({
      query: (caseTemplateId) => `v1/case-templates/${caseTemplateId}/status`,
      providesTags: ['Cases', 'User'],
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCaseTemplatesQuery,
  useGetAllCasesQuery,
  useGetUserCasesQuery,
  useBuyCaseMutation,
  useOpenCaseMutation,
  useGetCaseItemsQuery,
  useGetRecentDropsQuery,
  useGetCasePurchaseInfoQuery,
  useGetCaseStatusQuery,
} = casesApi;
