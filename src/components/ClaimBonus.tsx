import { useEffect, useState } from "react";
import MainButton from "./MainButton";

interface ClaimBonusProps {
  bonusDate: Date | string;
  onClaimBonus?: () => Promise<void>;
  isLoading?: boolean;
}

const ClaimBonus: React.FC<ClaimBonusProps> = ({
  bonusDate,
  onClaimBonus,
  isLoading = false
}) => {
  const [bonusAvailable, setBonusAvailable] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (bonusDate) {
      const countdownDate = new Date(bonusDate).getTime();

      interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        if (distance <= 0) {
          setBonusAvailable(true);
          setTimeLeft('');
          clearInterval(interval);
        } else {
          setBonusAvailable(false);

          // Вычисляем часы, минуты и секунды
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bonusDate]);

  const handleClaimBonus = async () => {
    if (bonusAvailable && onClaimBonus) {
      try {
        await onClaimBonus();
        // После успешного получения бонуса, устанавливаем новое время
        // Это должно прийти с сервера, но для примера установим +24 часа
        const nextBonusTime = new Date();
        nextBonusTime.setHours(nextBonusTime.getHours() + 24);
        setBonusAvailable(false);
      } catch (error) {
        console.error('Ошибка при получении бонуса:', error);
      }
    }
  };

  if (!bonusAvailable && !timeLeft) {
    return null; // Не показываем компонент, если нет данных
  }

  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">🎁</div>
          <div>
            <h3 className="text-white font-medium text-sm">Ежедневный бонус</h3>
            {bonusAvailable ? (
              <p className="text-green-400 text-xs">Готов к получению!</p>
            ) : (
              <p className="text-gray-400 text-xs">Следующий через: {timeLeft}</p>
            )}
          </div>
        </div>

        {bonusAvailable && (
          <MainButton
            text={isLoading ? "Получение..." : "Получить"}
            onClick={handleClaimBonus}
            loading={isLoading}
            disabled={isLoading}
            className="text-xs py-1 px-3"
          />
        )}
      </div>

      {/* Прогресс бар для времени */}
      {!bonusAvailable && timeLeft && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, 100 - (new Date(bonusDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) * 100)}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimBonus;
