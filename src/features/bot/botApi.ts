import { baseApi } from '../../store/api/baseApi';

export interface BotChatResponse {
  success: boolean;
  reply?: string;
  message?: string;
}

// Эндпоинт бота: POST /api/v1/bot/chat (прокси на Node, Node дергает Python-сервис)
export const botApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendBotMessage: builder.mutation<BotChatResponse, { message: string }>({
      query: (body) => ({
        url: 'v1/bot/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendBotMessageMutation } = botApi;
