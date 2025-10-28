interface MonetaryProps {
  value: number;
  showFraction?: boolean;
  currency?: 'chicoins' | 'RUB' | 'USD' | 'EUR' | 'GBP' | 'CNY';
  showEquivalent?: boolean; // Показывать эквивалент в других валютах
  iconSize?: 'xs' | 'sm' | 'md' | 'lg';
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
  showEquivalent = false,
  iconSize = 'md'
}) => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  const formattedValue = new Intl.NumberFormat('ru-RU', {
     minimumFractionDigits: showFraction ? 2 : 0,
     maximumFractionDigits: showFraction ? 2 : 0
  }).format(value);

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (currency === 'chicoins') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold">{formattedValue}</span>
        <img
          src="/images/chiCoin.png"
          alt="chicoins"
          className={`${sizeClasses[iconSize]} inline-block object-contain`}
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold">{formattedValue}</span>
      <img
        src="/images/chiCoin.png"
        alt={currency}
        className={`${sizeClasses[iconSize]} inline-block object-contain`}
      />
    </span>
  );
};

export default Monetary;
