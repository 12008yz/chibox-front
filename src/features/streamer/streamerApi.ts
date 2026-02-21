import { baseApi } from '../../store/api/baseApi';

export interface StreamerMe {
  id: string;
  balance: number;
  percent_from_deposit: number;
  fixed_registration: number;
  fixed_first_deposit: number;
  is_active: boolean;
  user: { id: string; username: string; avatar_url?: string | null } | null;
}

export interface StreamerLink {
  id: string;
  code: string;
  label: string | null;
  url: string;
  clicks_count: number;
  registrations_count: number;
  first_deposits_count: number;
  created_at: string;
}

export interface StreamerStats {
  clicks_count: number;
  registrations_count: number;
  first_deposits_count: number;
  total_earned: number;
  balance: number;
}

export interface StreamerEarning {
  id: string;
  type: 'registration' | 'first_deposit' | 'deposit_percent';
  amount: number;
  referral_link_id: string | null;
  referred_user_id: string | null;
  payment_id: string | null;
  created_at: string;
}

export interface StreamerPayout {
  id: string;
  amount: number;
  method: 'balance' | 'card' | 'steam' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  details: Record<string, unknown> | null;
  processed_at: string | null;
  created_at: string;
}

export interface StreamerMaterial {
  id: string;
  type: 'banner' | 'text';
  title: string | null;
  url: string | null;
  content: string | null;
  sort_order: number;
}

export const streamerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStreamerMe: builder.query<{ success: boolean; data: StreamerMe }, void>({
      query: () => ({ url: 'v1/streamer/me', method: 'GET' }),
    }),
    getStreamerLinks: builder.query<{ success: boolean; data: StreamerLink[] }, void>({
      query: () => ({ url: 'v1/streamer/links', method: 'GET' }),
    }),
    createStreamerLink: builder.mutation<
      { success: boolean; data: StreamerLink },
      { code?: string; label?: string }
    >({
      query: (body) => ({
        url: 'v1/streamer/links',
        method: 'POST',
        body,
      }),
    }),
    getStreamerStats: builder.query<{ success: boolean; data: StreamerStats }, void>({
      query: () => ({ url: 'v1/streamer/stats', method: 'GET' }),
    }),
    getStreamerEarnings: builder.query<
      { success: boolean; data: StreamerEarning[] },
      { limit?: number; offset?: number }
    >({
      query: (params) => ({
        url: 'v1/streamer/earnings',
        method: 'GET',
        params: { limit: params?.limit || 50, offset: params?.offset || 0 },
      }),
    }),
    getStreamerPayouts: builder.query<{ success: boolean; data: StreamerPayout[] }, void>({
      query: () => ({ url: 'v1/streamer/payouts', method: 'GET' }),
    }),
    createStreamerPayout: builder.mutation<
      { success: boolean; data: StreamerPayout },
      { method: string; amount: number; details?: Record<string, unknown> }
    >({
      query: (body) => ({
        url: 'v1/streamer/payouts',
        method: 'POST',
        body,
      }),
    }),
    getStreamerMaterials: builder.query<{ success: boolean; data: StreamerMaterial[] }, void>({
      query: () => ({ url: 'v1/streamer/materials', method: 'GET' }),
    }),
  }),
});

export const {
  useGetStreamerMeQuery,
  useGetStreamerLinksQuery,
  useCreateStreamerLinkMutation,
  useGetStreamerStatsQuery,
  useGetStreamerEarningsQuery,
  useGetStreamerPayoutsQuery,
  useCreateStreamerPayoutMutation,
  useGetStreamerMaterialsQuery,
} = streamerApi;
