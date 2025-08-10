import React, { useState, useEffect } from 'react';
import {
  useGetSubscriptionCaseStatusQuery,
  useClaimSubscriptionCaseMutation
} from '../features/subscriptions/subscriptionsApi';

interface SubscriptionCasesClaimProps {
  className?: string;
}

export const SubscriptionCasesClaim: React.FC<SubscriptionCasesClaimProps> = ({
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const {
    data: statusData,
    isLoading: statusLoading,
    refetch: refetchStatus
  } = useGetSubscriptionCaseStatusQuery(undefined, {
    pollingInterval: 30000, // Обновляем каждые 30 секунд
  });

  const [claimCases, { isLoading: claimLoading }] = useClaimSubscriptionCaseMutation();

  // Функция для расчета оставшегося времени
  const calculateTimeRemaining = (nextAvailableTime: string | null) => {
    if (!nextAvailableTime) return '';

    const now = new Date().getTime();
    const targetTime = new Date(nextAvailableTime).getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      return 'Доступно';
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}ч ${minutes}м ${seconds}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${seconds}с`;
    } else {
      return `${seconds}с`;
    }
  };

  // Обновление таймера каждую секунду
  useEffect(() => {
    const interval = setInterval(() => {
      if (statusData?.data?.next_available_time) {
        const remaining = calculateTimeRemaining(statusData.data.next_available_time);
        setTimeRemaining(remaining);

        // Если время истекло, обновляем статус
        if (remaining === 'Доступно') {
          refetchStatus();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [statusData?.data?.next_available_time, refetchStatus]);

  const handleClaimCases = async () => {
    try {
      const result = await claimCases().unwrap();

      if (result.success) {
        // Показываем уведомление об успехе
        alert(`Успешно получено кейсов: ${result.data.cases_claimed}`);
        refetchStatus();
      }
    } catch (error: any) {
      // Показываем ошибку
      const errorMessage = error?.data?.message || 'Ошибка при получении кейсов';
      alert(errorMessage);
    }
  };

  if (statusLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!statusData?.success || !statusData.data.has_active_subscription) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            🎁 Ежедневные кейсы подписки
          </div>
          <div className="text-sm text-gray-500">
            Для получения ежедневных кейсов необходим активный статус
          </div>
        </div>
      </div>
    );
  }

  const { can_claim, subscription_tier, next_available_time } = statusData.data;

  return (
    <div className={`bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold mb-1 flex items-center">
            🎁 Ежедневные кейсы
            <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">
              Статус {subscription_tier}
            </span>
          </div>

          {can_claim ? (
            <div className="text-green-400 text-sm">
              ✅ Кейсы доступны для получения!
            </div>
          ) : (
            <div className="text-yellow-400 text-sm">
              ⏰ Следующие кейсы через: {timeRemaining}
            </div>
          )}
        </div>

        <button
          onClick={handleClaimCases}
          disabled={!can_claim || claimLoading}
          className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
            can_claim && !claimLoading
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {claimLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Получение...
            </div>
          ) : can_claim ? (
            'Забрать кейсы'
          ) : (
            'Недоступно'
          )}
        </button>
      </div>

      {!can_claim && next_available_time && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Время следующего получения: {new Date(next_available_time).toLocaleString('ru-RU')}
          </div>
        </div>
      )}
    </div>
  );
};
