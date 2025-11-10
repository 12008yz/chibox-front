import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { usePlayPlinkoMutation } from '../features/user/userApi';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/soundManager';
import { PlinkoBoard } from './PlinkoBoard';

interface PlinkoGameProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({ isOpen, onClose, className = '' }) => {
  const { t } = useTranslation();
  const [isDropping, setIsDropping] = useState(false);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [nextPlayTime, setNextPlayTime] = useState<string | null>(null);
  const [serverMultiplier, setServerMultiplier] = useState<number | null>(null);

  const [playPlinko, { isLoading }] = usePlayPlinkoMutation();

  // Проверяем, можно ли играть
  const canPlay = !isDropping && !isLoading && !nextPlayTime;

  useEffect(() => {
    // Проверяем сохраненное время следующей игры
    const savedNextPlayTime = localStorage.getItem('plinko_next_play_time');
    if (savedNextPlayTime) {
      const nextTime = new Date(savedNextPlayTime);
      if (nextTime > new Date()) {
        setNextPlayTime(savedNextPlayTime);
      } else {
        localStorage.removeItem('plinko_next_play_time');
      }
    }
  }, []);

  const handleDrop = async () => {
    if (!canPlay) return;

    try {
      console.log('🎲 Plinko: Отправляем запрос на сервер...');

      const response = await playPlinko().unwrap();
      console.log('🎲 Plinko - ответ сервера:', response);

      if (response.success) {
        // Сохраняем множитель от сервера
        setServerMultiplier(response.multiplier);

        // Запускаем анимацию
        setIsDropping(true);
        soundManager.play('process');

        // Сохраняем время следующей игры
        setNextPlayTime(response.next_time);
        localStorage.setItem('plinko_next_play_time', response.next_time);
      } else {
        toast.error(response.message || t('plinko.something_went_wrong'));
        if (response.next_time) {
          setNextPlayTime(response.next_time);
          localStorage.setItem('plinko_next_play_time', response.next_time);
        }
      }
    } catch (err: any) {
      console.error('Ошибка Plinko:', err);
      toast.error(err.data?.message || t('plinko.error_occurred'));
    }
  };

  const handleBallLanded = (multiplier: number) => {
    console.log('🎯 Шарик упал в слот с множителем:', multiplier);
    setLastMultiplier(multiplier);

    // Показываем результат
    if (multiplier < 1) {
      soundManager.play('lose');
      toast(`Множитель: ${multiplier}x`, {
        icon: '😔',
        style: {
          background: '#374151',
          color: '#fff',
          border: '1px solid #6b7280',
          zIndex: 999999999,
        },
      });
    } else if (multiplier >= 10) {
      soundManager.play('win');
      toast(`Отличный результат! ${multiplier}x`, {
        icon: '🎉',
        style: {
          background: '#059669',
          color: '#fff',
          border: '1px solid #10b981',
          zIndex: 999999999,
        },
      });
    } else {
      soundManager.play('win');
      toast(`Множитель: ${multiplier}x`, {
        icon: '✨',
        style: {
          background: '#3B82F6',
          color: '#fff',
          border: '1px solid #60A5FA',
          zIndex: 999999999,
        },
      });
    }
  };

  const handleDropComplete = () => {
    setIsDropping(false);
    setServerMultiplier(null);
  };

  const formatTimeRemaining = (nextTime: string) => {
    const now = new Date();
    const next = new Date(nextTime);
    const diff = next.getTime() - now.getTime();

    if (diff <= 0) {
      setNextPlayTime(null);
      localStorage.removeItem('plinko_next_play_time');
      return '';
    }

    const totalSeconds = Math.ceil(diff / 1000);

    if (totalSeconds < 60) {
      return `${totalSeconds}с`;
    } else {
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}м ${seconds}с`;
    }
  };

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
      <div className="relative bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 my-auto max-h-[95vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h3 className="text-2xl font-bold text-white">
              🎯 Plinko
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Бросайте шарик и выигрывайте до 110x!
            </p>
          </div>
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
          {/* Информация о последнем результате */}
          {lastMultiplier !== null && !isDropping && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-lg"
            >
              <p className="text-white font-bold text-lg">
                Последний результат: {lastMultiplier}x
              </p>
            </motion.div>
          )}

          {/* Plinko Board */}
          <div className="w-full flex justify-center">
            <PlinkoBoard
              onBallLanded={handleBallLanded}
              isDropping={isDropping}
              onDropComplete={handleDropComplete}
            />
          </div>

          {/* Кнопка для броска */}
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
                onClick={handleDrop}
                disabled={!canPlay}
                className={`px-8 py-3 rounded-lg font-bold text-lg transition-all transform ${
                  canPlay
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isDropping ? 'Падает...' : isLoading ? 'Загрузка...' : 'Бросить шарик'}
              </button>
            )}
          </div>

          {/* Информация о множителях */}
          <div className="text-center space-y-3 max-w-2xl">
            <h3 className="text-lg font-semibold text-white">💎 Множители призов</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 text-xs">
              <div className="p-2 bg-red-600/20 border border-red-600 rounded">
                <span className="text-red-400 font-bold">110x</span>
              </div>
              <div className="p-2 bg-orange-600/20 border border-orange-600 rounded">
                <span className="text-orange-400 font-bold">41x</span>
              </div>
              <div className="p-2 bg-yellow-600/20 border border-yellow-600 rounded">
                <span className="text-yellow-400 font-bold">10x</span>
              </div>
              <div className="p-2 bg-green-600/20 border border-green-600 rounded">
                <span className="text-green-400 font-bold">5x</span>
              </div>
              <div className="p-2 bg-green-600/20 border border-green-600 rounded">
                <span className="text-green-400 font-bold">3x</span>
              </div>
              <div className="p-2 bg-blue-600/20 border border-blue-600 rounded">
                <span className="text-blue-400 font-bold">1.5x</span>
              </div>
              <div className="p-2 bg-blue-600/20 border border-blue-600 rounded">
                <span className="text-blue-400 font-bold">1x</span>
              </div>
              <div className="p-2 bg-gray-600/20 border border-gray-600 rounded">
                <span className="text-gray-400 font-bold">0.5x</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Чем ближе к краям, тем выше множитель! Центральные слоты дают меньше.
            </p>
          </div>

          {/* Дополнительная информация */}
          <div className="text-center text-xs text-gray-500 max-w-lg">
            <p>⏱ Кулдаун: 5 секунд между играми</p>
            <p className="mt-1">🎮 Только для подписчиков</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PlinkoGame;
