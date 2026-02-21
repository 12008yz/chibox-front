import { baseApi } from '../../store/api/baseApi';

export interface ReferralInfo {
  code: string;
  streamer: {
    id: string;
    username: string;
    avatar_url?: string | null;
  };
  bonuses: {
    percent_from_deposit: number;
    fixed_registration: number;
    fixed_first_deposit: number;
    promo_codes?: { code: string; value: number }[];
  };
}

export const referralApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReferralInfo: builder.query<{ success: boolean; data: ReferralInfo }, string>({
      query: (code) => ({
        url: `v1/referral/info?code=${encodeURIComponent(code)}`,
        method: 'GET',
      }),
    }),
    trackReferralClick: builder.mutation<{ success: boolean }, string>({
      query: (code) => ({
        url: `v1/referral/click?code=${encodeURIComponent(code)}`,
        method: 'GET',
      }),
    }),
  }),
});

export const { useGetReferralInfoQuery, useTrackReferralClickMutation } = referralApi;
