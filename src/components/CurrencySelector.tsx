import React, { useState, useEffect } from 'react';
import { useGetCurrencyQuery } from '../features/user/userApi';
import {
  Currency,
  CURRENCY_SYMBOLS,
  CURRENCY_NAMES,
  getSavedCurrency,
  saveCurrency,
  detectCurrencyFromLocale
} from '../utils/currencyUtils';

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  onCurrencyChange,
  className = ''
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getSavedCurrency() || detectCurrencyFromLocale()
  );

  const { data: currencyData, refetch } = useGetCurrencyQuery({
    currency: selectedCurrency
  });

  useEffect(() => {
    if (selectedCurrency) {
      saveCurrency(selectedCurrency);
      refetch();
      if (onCurrencyChange) {
        onCurrencyChange(selectedCurrency);
      }
    }
  }, [selectedCurrency, refetch, onCurrencyChange]);

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value as Currency;
    setSelectedCurrency(newCurrency);
  };

  const supportedCurrencies: Currency[] = ['RUB', 'USD', 'EUR', 'GBP', 'CNY'];

  return (
    <div className={`currency-selector ${className}`}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Валюта отображения
      </label>
      <select
        value={selectedCurrency}
        onChange={handleCurrencyChange}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
      >
        {supportedCurrencies.map((currency) => (
          <option key={currency} value={currency}>
            {CURRENCY_SYMBOLS[currency]} {CURRENCY_NAMES[currency]}
          </option>
        ))}
      </select>

      {currencyData?.data && (
        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">ChiCoins</span>
            <span className="text-yellow-400 font-semibold flex items-center gap-1">
              {currencyData.data.chicoinsSymbol}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {currencyData.data.conversionInfo.formula}
          </div>
          {currencyData.data.lastUpdated && (
            <div className="text-xs text-gray-600 mt-1">
              Обновлено: {new Date(currencyData.data.lastUpdated).toLocaleString('ru-RU')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
