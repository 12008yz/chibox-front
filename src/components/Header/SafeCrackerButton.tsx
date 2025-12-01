import { useState } from "react";
import { useGetSafeCrackerStatusQuery } from "../../features/user/userApi";
import SafeCrackerGame from "../SafeCrackerGame";
import { useAppSelector } from "../../store/hooks";
import { hasActiveSubscription } from "../../utils/subscriptionUtils";

const SafeCrackerButton = () => {
  const [showSafeCrackerGame, setShowSafeCrackerGame] = useState(false);

  const { data: status } = useGetSafeCrackerStatusQuery(undefined, {
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  const user = useAppSelector(state => state.auth.user);
  const hasSubscription = hasActiveSubscription(user);

  // Можно играть если есть обычные попытки ИЛИ бесплатные попытки, и пользователь еще не выигрывал
  const canPlay = status?.can_play ?? false;

  return (
    <>
      <button
        id="onboarding-safe-button"
        onClick={() => setShowSafeCrackerGame(true)}
        disabled={!canPlay}
        className={`
          relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 xl:w-14 xl:h-14 rounded-lg font-medium transition-all duration-300 p-1
          ${canPlay
            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg hover:shadow-yellow-500/50 hover:scale-105 active:scale-95'
            : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
          }
        `}
        title={
          status?.has_won
            ? 'Вы уже выиграли в Safe Cracker сегодня! Попытки обновятся в 16:00 МСК'
            : (status?.free_attempts_remaining || 0) > 0
            ? `Safe Cracker (${status?.free_attempts_remaining} бесплатных попыток)`
            : (status?.remaining_attempts || 0) > 0
            ? `Safe Cracker (${status?.remaining_attempts} попыток)`
            : !hasSubscription
            ? 'Требуется активный статус или бесплатные попытки для новых пользователей'
            : 'Нет доступных попыток'
        }
      >
        <img
          src="/images/bonus-safe.png"
          alt="Safe"
          className={`w-full h-full object-contain ${canPlay ? 'animate-pulse' : ''}`}
        />
      </button>

      <SafeCrackerGame
        isOpen={showSafeCrackerGame}
        onClose={() => setShowSafeCrackerGame(false)}
      />
    </>
  );
};

export default SafeCrackerButton;
