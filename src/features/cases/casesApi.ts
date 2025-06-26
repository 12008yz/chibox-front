import { baseApi } from '../../store/api/baseApi';
import type {
  CaseTemplate,
  BuyCaseRequest,
  OpenCaseRequest,
  UserInventoryItem,
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
      ApiResponse<{ case_id: string; new_balance: number }>,
      BuyCaseRequest
    >({
      query: (caseData) => ({
        url: 'v1/cases/buy',
        method: 'POST',
        body: caseData,
      }),
      invalidatesTags: ['Cases', 'Balance', 'User'],
      // Оптимистичное обновление баланса
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.new_balance !== undefined) {
            // Обновляем баланс в auth slice
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.new_balance,
            });
          }
        } catch {
          // В случае ошибки ничего не делаем, RTK Query откатит изменения
        }
      },
    }),

    // Открытие кейса
    openCase: builder.mutation<
      ApiResponse<{
        item: UserInventoryItem;
        animation_data?: any;
        new_balance?: number;
      }>,
      OpenCaseRequest
    >({
      query: (caseData) => ({
        url: 'v1/open-case',
        method: 'POST',
        body: caseData,
      }),
      invalidatesTags: ['Cases', 'Inventory', 'Balance'],
      // Обновляем баланс и инвентарь после открытия
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.success && data.data.new_balance !== undefined) {
            dispatch({
              type: 'auth/updateBalance',
              payload: data.data.new_balance,
            });
          }
        } catch {
          // Обработка ошибок
        }
      },
    }),

    // Получение предметов в кейсе (для превью)
    getCaseItems: builder.query<
      ApiResponse<any[]>,
      string
    >({
      query: (caseTemplateId) => `v1/case-templates/${caseTemplateId}/items`,
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
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetCaseTemplatesQuery,
  useGetUserCasesQuery,
  useBuyCaseMutation,
  useOpenCaseMutation,
  useGetCaseItemsQuery,
  useGetRecentDropsQuery,
  useGetCasePurchaseInfoQuery,
} = casesApi;
