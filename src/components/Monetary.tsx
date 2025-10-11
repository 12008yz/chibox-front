interface MonetaryProps {
  value: number;
  showFraction?: boolean;
  currency?: 'chicoins' | 'RUB' | 'USD' | 'EUR' | 'GBP' | 'CNY';
  showEquivalent?: boolean; // Показывать эквивалент в других валютах
}

const CURRENCY_SYMBOLS = {
  chicoins: '⚡',
  RUB: '₽',
  USD: "$",
  EUR: '€',
  GBP: '£',
  CNY: '¥'
};

const Monetary: React.FC<MonetaryProps> = ({
  value,
  showFraction = false,
  currency = 'chicoins',
  showEquivalent = false
}) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const formattedValue = new Intl.NumberFormat('ru-RU', {
     minimumFractionDigits: showFraction ? 2 : 0,
     maximumFractionDigits: showFraction ? 2 : 0
  }).format(value);

  if (currency === 'chicoins') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold">{formattedValue}</span>
        <span className="text-yellow-400">{symbol}</span>
      </span>
    );
  }

  return (
    <span>
      {symbol}{formattedValue}
    </span>
  );
};

export default Monetary;
