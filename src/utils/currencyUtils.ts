export type Currency = 'RUB' | 'USD' | 'EUR' | 'GBP' | 'CNY';

export interface ExchangeRates {
  RUB: number;
  USD: number;
  EUR: number;
  GBP: number;
  CNY: number;
}

export interface TopUpPackage {
  id: string;
  chicoins: number;
  bonus: number;
  totalChicoins: number;
  price: number;
  currency: Currency;
  currencySymbol: string;
  popular?: boolean;
}

export interface CurrencyInfo {
  currentCurrency: Currency;
  currencySymbol: string;
  chicoinsSymbol: string;
  exchangeRates: ExchangeRates;
  lastUpdated: string | null;
  supportedCurrencies: Currency[];
  topUpPackages: TopUpPackage[];
  conversionInfo: {
    base: string;
    formula: string;
    note: string;
  };
}

export const CURRENCY_SYMBOLS: Record<Currency | 'ChiCoins', string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  ChiCoins: '⚡'
};

export const CURRENCY_FLAGS: Record<Currency, string> = {
  RUB: '🇷🇺',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CNY: '🇨🇳'
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  RUB: 'Российский рубль',
  USD: 'Доллар США',
  EUR: 'Евро',
  GBP: 'Фунт стерлингов',
  CNY: 'Китайский юань'
};

/**
 * Конвертировать ChiCoins в выбранную валюту
 */
export function convertFromChiCoins(
  chicoins: number,
  toCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  if (!exchangeRates[toCurrency]) {
    return chicoins;
  }

  return chicoins * exchangeRates[toCurrency];
}

/**
 * Конвертировать валюту в ChiCoins
 */
export function convertToChiCoins(
  amount: number,
  fromCurrency: Currency,
  exchangeRates: ExchangeRates
): number {
  if (!exchangeRates[fromCurrency]) {
    return amount;
  }

  return Math.round(amount / exchangeRates[fromCurrency]);
}

/**
 * Форматировать сумму с валютой
 */
export function formatCurrency(
  amount: number,
  currency: Currency | 'ChiCoins',
  showFraction: boolean = false
): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: showFraction ? 2 : 0,
    maximumFractionDigits: showFraction ? 2 : 0
  }).format(amount);

  const symbol = CURRENCY_SYMBOLS[currency];

  if (currency === 'ChiCoins') {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
}

/**
 * Проверить, является ли строка валидной валютой
 */
function isValidCurrency(value: string): value is Currency {
  return ['RUB', 'USD', 'EUR', 'GBP', 'CNY'].includes(value);
}

/**
 * Получить сохраненную валюту пользователя из localStorage
 */
export function getSavedCurrency(): Currency | null {
  const saved = localStorage.getItem('userCurrency');
  if (saved && isValidCurrency(saved)) {
    return saved as Currency;
  }
  return null;
}

/**
 * Сохранить выбранную валюту в localStorage
 */
export function saveCurrency(currency: Currency): void {
  localStorage.setItem('userCurrency', currency);
}

/**
 * Определить валюту по языку браузера
 */
export function detectCurrencyFromLocale(): Currency {
  const locale = navigator.language.toLowerCase();

  if (locale.includes('ru')) return 'RUB';
  if (locale.includes('cn') || locale.includes('zh')) return 'CNY';
  if (locale.includes('gb') || locale.includes('uk')) return 'GBP';
  if (locale.includes('eu') || locale.includes('de') || locale.includes('fr')) return 'EUR';

  return 'USD'; // По умолчанию USD для остальных
}
