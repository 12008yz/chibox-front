import { baseApi } from '../../store/api/baseApi';
import type { ApiResponse, Notification, PaginatedResponse } from '../../types/api';

// Расширяем базовый API для работы с уведомлениями
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Получение уведомлений пользователя
    getNotifications: builder.query<
      PaginatedResponse<Notification>,
      { page?: number; limit?: number; unread_only?: boolean }
    >({
      query: ({ page = 1, limit = 20, unread_only = false } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (unread_only) {
          params.append('unread_only', 'true');
        }
        return `/v1/notifications?${params}`;
      },
      providesTags: ['Notifications'],
    }),

    // Получение количества непрочитанных уведомлений
    getUnreadCount: builder.query<ApiResponse<{ count: number }>, void>({
      query: () => '/v1/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    // Отметить уведомление как прочитанное
    markAsRead: builder.mutation<ApiResponse<null>, string>({
      query: (notificationId) => ({
        url: `/v1/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
      // Оптимистичное обновление
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        // Обновляем кеш локально
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', {}, (draft) => {
            const notification = draft.data.items.find(n => n.id === notificationId);
            if (notification) {
              notification.is_read = true;
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          // Откатываем изменения в случае ошибки
          patchResult.undo();
        }
      },
    }),

    // Отметить все уведомления как прочитанные
    markAllAsRead: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: '/v1/notifications/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Удалить уведомление
    deleteNotification: builder.mutation<ApiResponse<null>, string>({
      query: (notificationId) => ({
        url: `/v1/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
      // Оптимистичное обновление
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationsApi.util.updateQueryData('getNotifications', {}, (draft) => {
            draft.data.items = draft.data.items.filter(n => n.id !== notificationId);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// Экспортируем хуки для использования в компонентах
export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApi;
