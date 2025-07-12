import { useEffect, useState } from "react";
import { useGetBonusStatusQuery } from "../../features/user/userApi";
import MainButton from "../MainButton";
import BonusSquaresGame from "../BonusSquaresGame";

interface ClaimBonusProps {
  onClaimBonus?: () => Promise<void>;
  isLoading?: boolean;
}

const ClaimBonus: React.FC<ClaimBonusProps> = ({
  onClaimBonus,
  isLoading = false
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showBonusGame, setShowBonusGame] = useState(false);

  const { data: bonusStatus } = useGetBonusStatusQuery(undefined, {
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (bonusStatus?.data?.time_until_next_seconds) {
      let remainingSeconds = bonusStatus.data.time_until_next_seconds;

      interval = setInterval(() => {
        if (remainingSeconds <= 0) {
          setTimeLeft('');
          clearInterval(interval);
        } else {
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;

          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          remainingSeconds--;
        }
      }, 1000);
    } else {
      setTimeLeft('');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bonusStatus?.data?.time_until_next_seconds]);

  const handleOpenBonusGame = () => {
    setShowBonusGame(true);
    if (onClaimBonus) {
      onClaimBonus();
    }
  };

  if (!bonusStatus) {
    return null; // Не показываем компонент, если нет данных
  }

  const isAvailable = bonusStatus.data?.is_available;

  return (
    <>
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🎁</div>
            <div>
              <h3 className="text-white font-medium text-sm">Бонусная игра</h3>
              {isAvailable ? (
                <p className="text-green-400 text-xs">Готова к игре!</p>
              ) : (
                <p className="text-gray-400 text-xs">
                  {timeLeft ? `Следующая через: ${timeLeft}` : 'Загрузка...'}
                </p>
              )}
              {bonusStatus.data?.lifetime_bonuses_claimed !== undefined && (
                <p className="text-gray-500 text-xs">
                  Получено: {bonusStatus.data.lifetime_bonuses_claimed} бонусов
                </p>
              )}
            </div>
          </div>

          {isAvailable && (
            <MainButton
              text={isLoading ? "Запуск..." : "Играть"}
              onClick={handleOpenBonusGame}
              loading={isLoading}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Прогресс бар для времени */}
        {!isAvailable && timeLeft && bonusStatus.data?.time_until_next_seconds && (
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, 100 - (bonusStatus.data.time_until_next_seconds / (bonusStatus.data.cooldown_hours * 3600)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно игры */}
      <BonusSquaresGame
        isOpen={showBonusGame}
        onClose={() => setShowBonusGame(false)}
      />
    </>
  );
};

export default ClaimBonus;
