import { useEffect, useState } from "react";
import { useGetBonusStatusQuery } from "../../features/user/userApi";
import SafeCrackerGame from "../SafeCrackerGame";

interface ClaimBonusProps {
  onClaimBonus?: () => Promise<void>;
  isLoading?: boolean;
}

const ClaimBonus: React.FC<ClaimBonusProps> = ({
  onClaimBonus,
  isLoading = false
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showSafeCrackerGame, setShowSafeCrackerGame] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);

  const { data: bonusStatus } = useGetBonusStatusQuery(undefined, {
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (bonusStatus?.time_until_next_seconds) {
      let remainingSeconds = bonusStatus.time_until_next_seconds;

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
  }, [bonusStatus?.time_until_next_seconds]);

  // Эффект свечения для доступного бонуса
  useEffect(() => {
    if (bonusStatus?.is_available) {
      const glowInterval = setInterval(() => {
        setIsGlowing(prev => !prev);
      }, 2000);

      return () => clearInterval(glowInterval);
    } else {
      setIsGlowing(false);
    }
  }, [bonusStatus?.is_available]);

  const handleOpenBonusGame = () => {
    setShowSafeCrackerGame(true);
    if (onClaimBonus) {
      onClaimBonus();
    }
  };

  if (!bonusStatus) {
    return null; // Не показываем компонент, если нет данных
  }

  const isAvailable = bonusStatus?.is_available;
  const progressPercentage = bonusStatus?.time_until_next_seconds && bonusStatus?.cooldown_hours
    ? Math.max(0, 100 - (bonusStatus.time_until_next_seconds / (bonusStatus.cooldown_hours * 3600)) * 100)
    : 0;

  return (
    <>
      <div className={`
        relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-500
        ${isAvailable
          ? `border-yellow-400/50 bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20 ${isGlowing ? 'shadow-lg shadow-yellow-500/25' : ''}`
          : 'border-gray-600/30 bg-gradient-to-br from-gray-800/50 to-gray-900/50'
        }
      `}>
        {/* Фоновый эффект */}
        {isAvailable && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
        )}

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className={`text-3xl transition-transform duration-300 ${isAvailable ? 'animate-bounce' : ''}`}>
              {isAvailable ? '🎲' : '⏰'}
            </div>
            <div>
              <h3 className={`font-bold text-base transition-colors duration-300 ${
                isAvailable ? 'text-yellow-300' : 'text-gray-300'
              }`}>
                Кубики Удачи
              </h3>

              {isAvailable ? (
                <div className="space-y-1">
                  <p className="text-green-400 text-sm font-medium flex items-center gap-1">
                    <span className="animate-pulse">✨</span>
                    Готово к игре!
                  </p>
                  {bonusStatus?.lifetime_bonuses_claimed !== undefined && (
                    <p className="text-yellow-400 text-xs">
                      🏆 Сыграно: {bonusStatus.lifetime_bonuses_claimed} раз
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">
                    {timeLeft ? (
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span className="font-mono text-blue-400">{timeLeft}</span>
                      </span>
                    ) : (
                      'Загрузка...'
                    )}
                  </p>
                  {bonusStatus?.lifetime_bonuses_claimed !== undefined && (
                    <p className="text-gray-500 text-xs">
                      🏆 Всего сыграно: {bonusStatus.lifetime_bonuses_claimed}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {isAvailable && (
            <div className="relative">
              {/* Эффект свечения кнопки */}
              {isGlowing && (
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg opacity-30 animate-pulse" />
              )}
              <button
                onClick={handleOpenBonusGame}
                disabled={isLoading}
                className="relative z-10 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Запуск...
                  </div>
                ) : (
                  "🎲 Играть"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Прогресс бар для времени */}
        {!isAvailable && timeLeft && bonusStatus?.time_until_next_seconds && (
          <div className="mt-4 relative">
            <div className="w-full bg-gray-700/70 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 h-3 rounded-full transition-all duration-1000 relative overflow-hidden"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Анимированный блик */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>

            {/* Подпись к прогресс бару */}
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="text-gray-500">До следующей игры</span>
              <span className="text-blue-400 font-mono">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
        )}

        {/* Информация о наградах (только когда бонус доступен) */}
        {isAvailable && (
          <div className="mt-3 pt-3 border-t border-yellow-500/20">
            <div className="flex justify-center gap-4 text-xs">
              <div className="flex items-center gap-1 text-yellow-400">
                <span>📦</span>
                <span>Кейсы</span>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <span>⭐</span>
                <span>Статус</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <span>🎁</span>
                <span>Предметы</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно игры */}
      <SafeCrackerGame
        isOpen={showSafeCrackerGame}
        onClose={() => setShowSafeCrackerGame(false)}
      />
    </>
  );
};

export default ClaimBonus;
