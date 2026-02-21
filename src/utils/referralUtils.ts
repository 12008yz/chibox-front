const REFERRAL_COOKIE_NAME = 'referral_ref';
const REFERRAL_COOKIE_DAYS = 7;

export function getReferralRefFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${REFERRAL_COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]).trim() : null;
  return value || null;
}

export function setReferralCookie(code: string): void {
  if (typeof document === 'undefined' || !code) return;
  const maxAge = REFERRAL_COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(code)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearReferralCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0`;
}

const REFERRAL_MODAL_SHOWN_KEY = 'referral_modal_shown';

export function wasReferralModalShownForCode(code: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    const shown = sessionStorage.getItem(REFERRAL_MODAL_SHOWN_KEY);
    return shown === code;
  } catch {
    return false;
  }
}

export function setReferralModalShownForCode(code: string): void {
  try {
    sessionStorage.setItem(REFERRAL_MODAL_SHOWN_KEY, code);
  } catch {
    // ignore
  }
}
