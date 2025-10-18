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
        <img
          src="https://tempfile.aiquickdraw.com/s/88f1c5efcf1d421b83e020062b079c5a_0_1760729039_2514.png"
          alt="chicoins"
          className="w-5 h-5 inline-block object-contain"
        />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold">{formattedValue}</span>
      <img
        src="https://tempfile.aiquickdraw.com/s/88f1c5efcf1d421b83e020062b079c5a_0_1760729039_2514.png"
        alt={currency}
        className="w-5 h-5 inline-block object-contain"
      />
    </span>
  );
};

export default Monetary;
