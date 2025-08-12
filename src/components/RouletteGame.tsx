import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wheel } from 'react-custom-roulette';
import { usePlayRouletteMutation } from '../features/user/userApi';
import toast from 'react-hot-toast';

// Конфигурация 9 секций рулетки для библиотеки
const wheelData = [
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 0
  { option: '1 день', style: { backgroundColor: '#059669', textColor: '#FFFFFF' } },      // 1
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 2
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 3
  { option: '2 дня', style: { backgroundColor: '#DC2626', textColor: '#FFFFFF' } },       // 4
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 5
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 6
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } },       // 7
  { option: 'Пусто', style: { backgroundColor: '#6B7280', textColor: '#FFFFFF' } }        // 8
];

// Фразы для проигрыша
const loseMessages = [
  'Не в этот раз',
  'Очень жаль',
  'У вас будут ещё попытки',
  'Увы ;(',
  'Почти получилось!',
  'Не расстраивайтесь',
  'Попробуйте ещё раз, завтра',
  'Удача отвернулась',
  'В следующий раз повезёт',
  'Не сегодня',
  'Фортуна спит',
  'Может в следующий раз?',
  'Терпение и труд',
  'Ничего страшного',
  'Держите удар!'
];

// Фразы для выигрыша
const winMessages = [
  'Все мы рады этому',
  'Поздравляем!',
  'Невероятно!',
  'Вы молодец!',
  'Фантастика!',
  'Отличная работа!',
  'Удача на вашей стороне!',
  'Великолепно!',
  'Просто супер!',
  'Вы везунчик!'
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
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [nextPlayTime, setNextPlayTime] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [startingPosition, setStartingPosition] = useState(0);

  const [playRoulette, { isLoading, error }] = usePlayRouletteMutation();

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

    // Загружаем сохраненную позицию колеса
    const savedPosition = localStorage.getItem('roulette_last_position');
    if (savedPosition) {
      setStartingPosition(parseInt(savedPosition, 10));
    }
  }, []);

  const spin = async () => {
    if (!canPlay) return;

    try {
      setIsSpinning(true);
      const response = await playRoulette().unwrap();

      if (response.success) {
        // Устанавливаем результат и запускаем анимацию
        setPrizeNumber(response.winner_index);
        setMustSpin(true);

        // Сохраняем время следующей игры
        setNextPlayTime(response.next_time);
        localStorage.setItem('roulette_next_play_time', response.next_time);
      } else {
        setIsSpinning(false);
        toast.error(response.message || 'Что-то пошло не так');
        if (response.next_time) {
          setNextPlayTime(response.next_time);
          localStorage.setItem('roulette_next_play_time', response.next_time);
        }
      }
    } catch (err: any) {
      setIsSpinning(false);
      console.error('Ошибка при игре в рулетку:', err);
      toast.error(err.data?.message || 'Произошла ошибка');
    }
  };

  // Обработка завершения вращения
  const handleSpinComplete = () => {
    setMustSpin(false);
    setIsSpinning(false);

    // Сохраняем финальную позицию колеса для следующей игры
    setStartingPosition(prizeNumber);
    localStorage.setItem('roulette_last_position', prizeNumber.toString());

    // Определяем сообщение на основе выигрышного сегмента
    const wonSegment = wheelData[prizeNumber];

    // Показываем результат сразу
    if (wonSegment.option === 'Пусто') {
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
      const randomWinMessage = getRandomMessage(winMessages);
      toast(randomWinMessage, {
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

  // Предотвращаем скроллинг страницы когда модальное окно открыто
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Очистка при размонтировании или закрытии
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
            🎰 Колесо Фортуны
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
        <div className={`p-6 flex flex-col items-center space-y-4 ${className}`}>
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">Крути колесо и выигрывай дни подписки!</p>
            <p className="text-xs text-gray-400">30 игр в день • Перезарядка каждые 48 минут</p>
          </div>

          {/* Колесо рулетки */}
          <div className="relative flex justify-center">
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              onStopSpinning={handleSpinComplete}
              backgroundColors={['#3f3f46', '#71717a']}
              textColors={['#ffffff']}
              outerBorderColor="#374151"
              outerBorderWidth={8}
              innerRadius={30}
              innerBorderColor="#1f2937"
              innerBorderWidth={3}
              radiusLineColor="#374151"
              radiusLineWidth={2}
              fontSize={14}
              textDistance={80}
              spinDuration={1.5}
              startingOptionIndex={startingPosition}
              disableInitialAnimation={true}
              pointerProps={{
                src: undefined,
                style: {
                  transform: 'rotate(0deg)',
                }
              }}
            />
          </div>

          {/* Кнопка для вращения */}
          <div className="text-center">
            {nextPlayTime ? (
              <div className="space-y-2">
                <p className="text-gray-300">Следующая игра через:</p>
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSpinning || mustSpin ? 'Крутится...' : isLoading ? 'Загрузка...' : 'Крутить колесо'}
              </button>
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="text-center p-4 bg-red-900 rounded-lg border border-red-600">
              <p className="text-red-200">
                {'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
                  ? (error.data as any).message
                  : 'Произошла ошибка'}
              </p>
            </div>
          )}

          {/* Легенда */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-white">Призы:</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                <span className="text-gray-300 font-semibold">1 день подписки</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                <span className="text-gray-300 font-semibold">2 дня подписки</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-600 rounded"></div>
                <span className="text-gray-400">Пусто</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default RouletteGame;
