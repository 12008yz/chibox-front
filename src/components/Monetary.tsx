interface MonetaryProps {
  value: number;
  showFraction?: boolean;
}

const Monetary: React.FC<MonetaryProps> = ({ value, showFraction = false }) => {
  const formattedValue = new Intl.NumberFormat('ru-RU', {
     minimumFractionDigits: showFraction ? 2 : 0,
     maximumFractionDigits: showFraction ? 2 : 0
  })
  .format(value) + ' КР';

 return (
   <span>
     {formattedValue}
   </span>
 );
};

export default Monetary;
