import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Wheel } from 'react-custom-roulette';
import { usePlayRouletteMutation } from '../features/user/userApi';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/soundManager';

// Конфигурация 9 секций рулетки (должна соответствовать серверу)
const ROULETTE_SEGMENTS = [
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 0,
    type: 'empty',
    value: 0
  },
  {
    option: '1 день подписки',
    style: { backgroundColor: '#059669', textColor: '#FFFFFF' },
    id: 1,
    type: 'sub_1_day',
    value: 1
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 2,
    type: 'empty',
    value: 0
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 3,
    type: 'empty',
    value: 0
  },
  {
    option: '2 дня подписки',
    style: { backgroundColor: '#DC2626', textColor: '#FFFFFF' },
    id: 4,
    type: 'sub_2_days',
    value: 2
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 5,
    type: 'empty',
    value: 0
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 6,
    type: 'empty',
    value: 0
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 7,
    type: 'empty',
    value: 0
  },
  {
    option: 'Пусто',
    style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' },
    id: 8,
    type: 'empty',
    value: 0
  }
];

// Функция для получения случайной фразы
const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

interface RouletteGameProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const RouletteGame: React.FC<RouletteGameProps> = ({ isOpen, onClose, className = '' }) => {
  const { t } = useTranslation();
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [nextPlayTime, setNextPlayTime] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const [playRoulette, { isLoading, error }] = usePlayRouletteMutation();

  // Получаем локализованные сообщения
  const loseMessages = t('roulette.lose_messages', { returnObjects: true }) as string[];
  const winMessages = t('roulette.win_messages', { returnObjects: true }) as string[];

  // Проверяем, можно ли играть
  const canPlay = !mustSpin && !isLoading && !nextPlayTime && !isSpinning;

  useEffect(() => {
    // Проверяем, есть ли сохраненное время следующей игры
    const savedNextPlayTime = localStorage.getItem('roulette_next_play_time');
    if (savedNextPlayTime) {
      const nextTime = new Date(savedNextPlayTime);
      if (nextTime > new Date()) {
        setNextPlayTime(savedNextPlayTime);
      } else {
        localStorage.removeItem('roulette_next_play_time');
      }
    }
  }, []);

  const spin = async () => {
    if (!canPlay) return;

    try {
      setIsSpinning(true);
      console.log('🎲 Рулетка: Отправляем запрос на сервер...');

      const response = await playRoulette().unwrap();
      console.log('🎲 Рулетка - ответ сервера:', response);

      if (response.success) {
        // Устанавливаем выигрышный номер секции, который пришел с сервера
        const winnerIndex = response.winner_index;
        console.log('🎯 Выигрышная секция с сервера:', winnerIndex);

        setPrizeNumber(winnerIndex);
        setMustSpin(true);

        // Звук вращения
        soundManager.play('process');

        // Сохраняем время следующей игры
        setNextPlayTime(response.next_time);
        localStorage.setItem('roulette_next_play_time', response.next_time);

      } else {
        setIsSpinning(false);
        toast.error(response.message || t('roulette.something_went_wrong'));
        if (response.next_time) {
          setNextPlayTime(response.next_time);
          localStorage.setItem('roulette_next_play_time', response.next_time);
        }
      }
    } catch (err: any) {
      setIsSpinning(false);
      console.error('Ошибка рулетки:', err);
      toast.error(err.data?.message || t('roulette.error_occurred'));
    }
  };

  const handleSpinComplete = () => {
    console.log('🎲 Рулетка: Анимация завершена, обрабатываем результат...');

    setMustSpin(false);
    setIsSpinning(false);

    const winnerSegment = ROULETTE_SEGMENTS[prizeNumber];
    console.log('🏆 Выигрышная секция:', {
      index: prizeNumber,
      type: winnerSegment.type,
      value: winnerSegment.value,
      option: winnerSegment.option
    });

    // Показываем результат
    if (winnerSegment.type === 'empty') {
      // Звук проигрыша
      soundManager.play('lose');

      const randomLoseMessage = getRandomMessage(loseMessages);
      toast(randomLoseMessage, {
        icon: '😔',
        style: {
          background: '#374151',
          color: '#fff',
          border: '1px solid #6b7280',
          zIndex: 999999999,
        },
      });
    } else {
      // Звук выигрыша
      soundManager.play('win');

      const randomWinMessage = getRandomMessage(winMessages);
      const prizeText = winnerSegment.value === 1
        ? `1 ${t('time.day')}`
        : `${winnerSegment.value} ${t('time.days')}`;

      toast(`${randomWinMessage} (${prizeText})`, {
        icon: '🎉',
        style: {
          background: '#059669',
          color: '#fff',
          border: '1px solid #10b981',
          zIndex: 999999999,
        },
      });
    }
  };

  const formatTimeRemaining = (nextTime: string) => {
    const now = new Date();
    const next = new Date(nextTime);
    const diff = next.getTime() - now.getTime();

    if (diff <= 0) {
      setNextPlayTime(null);
      localStorage.removeItem('roulette_next_play_time');
      return '';
    }

    const totalMinutes = Math.ceil(diff / (1000 * 60));

    if (totalMinutes < 60) {
      return `${totalMinutes}м`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}ч ${minutes}м`;
    }
  };

  // Обновляем локализованные тексты в сегментах
  const localizedSegments = ROULETTE_SEGMENTS.map(segment => ({
    ...segment,
    option: segment.type === 'sub_1_day'
      ? `1 ${t('time.day')} подписки`
      : segment.type === 'sub_2_days'
      ? `2 ${t('time.days')} подписки`
      : t('roulette.empty')
  }));

  // Предотвращаем скроллинг страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 my-auto max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">
            {t('roulette.wheel_of_fortune')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 flex flex-col items-center space-y-6 ${className}`}>
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">{t('roulette.spin_and_win')}</p>
            <p className="text-xs text-gray-400">{t('roulette.games_per_day')}</p>
          </div>

          {/* Колесо рулетки с react-custom-roulette */}
          <div className="relative flex justify-center">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={localizedSegments}
              backgroundColors={['#3B82F6', '#EF4444']}
              textColors={['#FFFFFF']}
              outerBorderColor="#374151"
              outerBorderWidth={8}
              innerBorderColor="#4B5563"
              innerBorderWidth={4}
              radiusLineColor="#6B7280"
              radiusLineWidth={2}
              fontSize={12}
              textDistance={75}
              spinDuration={0.8}
              onStopSpinning={handleSpinComplete}
            />
          </div>

          {/* Кнопка для вращения */}
          <div className="text-center">
            {nextPlayTime ? (
              <div className="space-y-2">
                <p className="text-gray-300">{t('roulette.next_game_in')}</p>
                <p className="text-xl font-bold text-yellow-400">
                  {formatTimeRemaining(nextPlayTime)}
                </p>
              </div>
            ) : (
              <button
                onClick={spin}
                disabled={!canPlay}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition-colors ${
                  canPlay
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {mustSpin || isSpinning ? t('roulette.spinning') : isLoading ? t('common.loading') : t('roulette.spin_wheel')}
              </button>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="text-center p-4 bg-red-900 rounded-lg border border-red-600">
              <p className="text-red-200">
                {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                  ? (error.data as any).message
                  : t('roulette.error_occurred')}
              </p>
            </div>
          )}

          {/* Легенда */}
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-white">{t('roulette.prizes')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm max-w-lg">
              <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800 rounded-lg">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                <span className="text-gray-300 font-semibold">{t('roulette.subscription_1_day')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800 rounded-lg">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                <span className="text-gray-300 font-semibold">{t('roulette.subscription_2_days')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800 rounded-lg">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span className="text-gray-400">{t('roulette.empty')}</span>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="text-center text-xs text-gray-500 max-w-lg">
            <p>{t('roulette.cooldown_info', { minutes: 6 })}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default RouletteGame;
