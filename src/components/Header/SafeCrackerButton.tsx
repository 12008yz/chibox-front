import { useState } from "react";
import { useGetSafeCrackerStatusQuery } from "../../features/user/userApi";
import SafeCrackerGame from "../SafeCrackerGame";
import { FaLock } from "react-icons/fa";
import { useAppSelector } from "../../store/hooks";
import { hasActiveSubscription } from "../../utils/subscriptionUtils";

const SafeCrackerButton = () => {
  const [showSafeCrackerGame, setShowSafeCrackerGame] = useState(false);

  const { data: status } = useGetSafeCrackerStatusQuery(undefined, {
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  const user = useAppSelector(state => state.auth.user);
  const hasSubscription = hasActiveSubscription(user);

  // Показываем количество попыток только если есть подписка и пользователь еще не выиграл
  const shouldShowAttempts = hasSubscription && !status?.has_won;
  const canPlay = (status?.remaining_attempts || 0) > 0 && hasSubscription && !status?.has_won;

  return (
    <>
      <button
        onClick={() => setShowSafeCrackerGame(true)}
        disabled={!canPlay}
        className={`
          relative gaming-button flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300
          ${canPlay
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg hover:shadow-yellow-500/50'
            : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
          }
        `}
        title={
          !hasSubscription
            ? 'Требуется активная подписка'
            : status?.has_won
            ? 'Вы уже выиграли в Safe Cracker сегодня! Попытки обновятся в 16:00 МСК'
            : canPlay
            ? `Safe Cracker (${status?.remaining_attempts} попыток)`
            : 'Нет доступных попыток'
        }
      >
        <FaLock className={`text-lg ${canPlay ? 'animate-pulse' : ''}`} />
        <span className="hidden lg:inline">Safe Cracker</span>
        {shouldShowAttempts && canPlay && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {status?.remaining_attempts}
          </span>
        )}
      </button>

      <SafeCrackerGame
        isOpen={showSafeCrackerGame}
        onClose={() => setShowSafeCrackerGame(false)}
      />
    </>
  );
};

export default SafeCrackerButton;
