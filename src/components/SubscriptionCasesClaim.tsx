import React, { useState, useEffect } from 'react';
import {
  useGetSubscriptionCaseStatusQuery,
  useClaimSubscriptionCaseMutation
} from '../features/subscriptions/subscriptionsApi';
import { GiftIcon, TooLowIcon, ReceivedIcon, ProcessingIcon } from './icons';
import { getApiErrorMessage } from '../utils/config';

interface SubscriptionCasesClaimProps {
  className?: string;
}

export const SubscriptionCasesClaim: React.FC<SubscriptionCasesClaimProps> = ({
  className = ''
}) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

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

  // Очистка сообщений через некоторое время
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  const handleClaimCases = async () => {
    // Защита от множественных кликов
    const now = Date.now();
    if (now - lastClickTime < 2000) {
      setErrorMessage('Слишком частые нажатия. Подождите немного.');
      return;
    }
    setLastClickTime(now);

    // Очищаем предыдущие сообщения
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await claimCases().unwrap();

      if (result.success) {
        setSuccessMessage(`Успешно получено кейсов: ${result.data.cases_claimed}`);
        refetchStatus();
      }
    } catch (error: any) {
      let errorMessage = 'Ошибка при получении кейсов';
      if (error?.status === 429) {
        errorMessage = 'Слишком частые запросы. Пожалуйста, подождите.';
      } else if (error?.status === 409) {
        errorMessage = 'Запрос уже обрабатывается. Подождите завершения.';
      } else {
        errorMessage = getApiErrorMessage(error, errorMessage);
      }
      setErrorMessage(errorMessage);

      // Если это ошибка множественных запросов, обновляем статус через короткое время
      if (error?.status === 409 || error?.status === 429) {
        setTimeout(() => {
          refetchStatus();
        }, 1000);
      }
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
          <div className="text-gray-400 mb-2 flex items-center justify-center gap-2">
            <GiftIcon className="w-5 h-5" />
            Ежедневные кейсы подписки
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
          <div className="text-white font-semibold mb-1 flex items-center gap-2">
            <GiftIcon className="w-5 h-5" />
            Ежедневные кейсы
            <span className="ml-2 text-xs bg-purple-600 px-2 py-1 rounded">
              Статус {subscription_tier}
            </span>
          </div>

          {can_claim ? (
            <div className="text-green-400 text-sm flex items-center gap-1">
              <ReceivedIcon className="w-4 h-4" />
              Кейсы доступны для получения!
            </div>
          ) : (
            <div className="text-yellow-400 text-sm flex items-center gap-1">
              <ProcessingIcon className="w-4 h-4" />
              Следующие кейсы через: {timeRemaining}
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

      {/* Отображение сообщений об ошибках и успехе */}
      {errorMessage && (
        <div className="mt-3 p-2 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm flex items-center gap-2">
          <TooLowIcon className="w-4 h-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-3 p-2 bg-green-900/50 border border-green-500/50 rounded text-green-300 text-sm flex items-center gap-2">
          <ReceivedIcon className="w-4 h-4 flex-shrink-0" />
          {successMessage}
        </div>
      )}

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
