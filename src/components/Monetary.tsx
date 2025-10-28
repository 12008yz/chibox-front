interface MonetaryProps {
  value: number;
  showFraction?: boolean;
  currency?: 'chicoins' | 'RUB' | 'USD' | 'EUR' | 'GBP' | 'CNY';
  showEquivalent?: boolean; // Показывать эквивалент в других валютах
  iconSize?: 'xxxs' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
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
    xxxs: 'w-2 h-2',
    xxs: 'w-2.5 h-2.5',
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const sizePixels = {
    xxxs: 8,
    xxs: 10,
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24
  };

  const size = sizePixels[iconSize];

  if (currency === 'chicoins') {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="font-semibold">{formattedValue}</span>
        <img
          src="/images/chiCoin.png"
          alt="chicoins"
          width={size}
          height={size}
          className={`${sizeClasses[iconSize]} inline-block object-contain`}
          style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
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
        width={size}
        height={size}
        className={`${sizeClasses[iconSize]} inline-block object-contain`}
        style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      />
    </span>
  );
};

export default Monetary;
