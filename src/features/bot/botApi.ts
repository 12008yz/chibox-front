import { baseApi } from '../../store/api/baseApi';

export interface BotChatResponse {
  success: boolean;
  reply?: string;
  message?: string;
}

export interface BotChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Эндпоинт бота: POST /api/v1/bot/chat (прокси на Node, Node дергает Python-сервис)
export const botApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendBotMessage: builder.mutation<BotChatResponse, BotChatRequest>({
      query: (body) => ({
        url: 'v1/bot/chat',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSendBotMessageMutation } = botApi;
