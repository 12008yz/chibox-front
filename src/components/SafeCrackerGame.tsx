import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaySafeCrackerMutation, useGetSafeCrackerStatusQuery } from '../features/user/userApi';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/soundManager';

interface SafeCrackerGameProps {
  isOpen: boolean;
  onClose: () => void;
}

const SafeCrackerGame: React.FC<SafeCrackerGameProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayCode, setDisplayCode] = useState<number[]>([9, 9, 9]);
  const [secretCode, setSecretCode] = useState<number[] | null>(null);
  const [userCode, setUserCode] = useState<number[] | null>(null);
  const [matches, setMatches] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const { data: status, refetch: refetchStatus } = useGetSafeCrackerStatusQuery();
  const [playSafeCracker, { isLoading }] = usePlaySafeCrackerMutation();

  const canPlay = !isSpinning && !isLoading && (status?.remaining_attempts || 0) > 0;

  // Анимация вращения барабанов
  const spinDrums = async (finalCode: number[]) => {
    const spinDuration = 3000; // 3 секунды
    const spinInterval = 50; // Обновление каждые 50ms
    const totalSteps = spinDuration / spinInterval;
    let currentStep = 0;

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (currentStep >= totalSteps) {
          clearInterval(interval);
          setDisplayCode(finalCode);
          resolve();
          return;
        }

        // Генерируем случайные цифры для каждого барабана
        // По мере приближения к концу, замедляем барабаны
        const progress = currentStep / totalSteps;
        const newCode = finalCode.map((digit, index) => {
          if (progress > 0.3 + index * 0.2) {
            // Барабан начинает замедляться
            return Math.random() < 0.7 ? digit : Math.floor(Math.random() * 10);
          }
          return Math.floor(Math.random() * 10);
        });

        setDisplayCode(newCode);
        currentStep++;
      }, spinInterval);
    });
  };

  // Начать игру
  const handlePlay = async () => {
    if (!canPlay) return;

    try {
      // Сбрасываем предыдущие результаты
      setShowResult(false);
      setMatches(null);
      setSecretCode(null);
      setUserCode(null);

      // Запрашиваем результат с сервера
      const response = await playSafeCracker().unwrap();

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setIsSpinning(true);

      // Воспроизводим звук вращения
      soundManager.play('process');

      // Анимация вращения барабанов
      await spinDrums(response.user_code);

      // Показываем результат
      setSecretCode(response.secret_code);
      setUserCode(response.user_code);
      setMatches(response.matches);
      setShowResult(true);

      // Звук результата
      if (response.matches === 3) {
        soundManager.play('win');
        toast.success(response.message, {
          icon: '🎉',
          duration: 5000,
        });
      } else if (response.matches === 2) {
        soundManager.play('win');
        toast.success(response.message, {
          icon: '🎊',
          duration: 4000,
        });
      } else {
        soundManager.play('lose');
        toast(response.message, {
          icon: '😔',
          duration: 3000,
        });
      }

      setIsSpinning(false);
      refetchStatus();

    } catch (err: any) {
      console.error('Ошибка Safe Cracker:', err);
      toast.error(err.data?.message || 'Произошла ошибка');
      setIsSpinning(false);
    }
  };

  // Предотвращаем скроллинг страницы
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Сброс при закрытии
  useEffect(() => {
    if (!isOpen) {
      setDisplayCode([9, 9, 9]);
      setShowResult(false);
      setMatches(null);
      setSecretCode(null);
      setUserCode(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full border-2 border-yellow-500/30 overflow-hidden"
      >
        {/* Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 border-b border-yellow-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>СЕЙФ-ВЗЛОМ</span>
              <span>(Safe Cracker)</span>
            </h2>
            <p className="text-yellow-200 text-sm">
              Вводишь 3-значный код сейфа (автоматически)
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Статистика */}
          <div className="mb-6 flex justify-between items-center">
            <div className="bg-gray-800/70 px-6 py-3 rounded-lg border border-yellow-500/30">
              <p className="text-yellow-200 text-xs mb-1">Осталось попыток</p>
              <p className="text-3xl font-bold text-white">
                {status?.remaining_attempts || 0}
              </p>
            </div>

            <div className="bg-gray-800/70 px-6 py-3 rounded-lg border border-yellow-500/30">
              <p className="text-yellow-200 text-xs mb-1">Дней подписки</p>
              <p className="text-3xl font-bold text-white">
                {status?.subscription_days || 0}
              </p>
            </div>
          </div>

          {/* Визуализация сейфа */}
          <div className="mb-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-8 border-4 border-yellow-600/50 shadow-2xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-2">СЕЙФ</h3>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Крутятся барабаны с цифрами</span>
              </div>
            </div>

            {/* Барабаны с кодом */}
            <div className="flex justify-center gap-4 mb-6">
              {displayCode.map((digit, index) => (
                <motion.div
                  key={index}
                  animate={isSpinning ? {
                    y: [0, -10, 0],
                    transition: {
                      duration: 0.1,
                      repeat: Infinity,
                      ease: "linear"
                    }
                  } : {}}
                  className="relative"
                >
                  <div className="w-24 h-32 bg-black rounded-lg border-4 border-yellow-600 shadow-lg flex items-center justify-center overflow-hidden">
                    <span className="text-6xl font-bold text-yellow-400 font-mono">
                      {digit}
                    </span>
                  </div>
                  {showResult && userCode && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      {secretCode![index] === userCode[index] ? (
                        <span className="text-2xl">✅</span>
                      ) : (
                        <span className="text-2xl">❌</span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Результат */}
            <AnimatePresence>
              {showResult && secretCode && userCode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-12 text-center"
                >
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/30">
                    <p className="text-sm text-gray-400 mb-2">Секретный код:</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {secretCode.map((digit, index) => (
                        <span key={index} className="text-2xl font-bold text-white font-mono">
                          {digit}
                        </span>
                      ))}
                    </div>

                    <div className={`text-2xl font-bold ${
                      matches === 3 ? 'text-green-400' :
                      matches === 2 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      {matches === 3 && '🎉 3 СОВПАДЕНИЯ! 5 ДНЕЙ ПОДПИСКИ!'}
                      {matches === 2 && '🎊 2 СОВПАДЕНИЯ! 1 ДЕНЬ ПОДПИСКИ!'}
                      {matches === 1 && '😐 1 СОВПАДЕНИЕ'}
                      {matches === 0 && '😔 НЕ УГАДАЛИ'}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Информация о призах */}
          <div className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-yellow-500/20">
            <h4 className="text-yellow-400 font-bold mb-3 text-center">Призы:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-gray-300">
                <span>• 2 цифры совпали</span>
                <span className="text-yellow-400 font-semibold">1 день подписки (15% шанс)</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>• 3 цифры совпали</span>
                <span className="text-green-400 font-semibold">5 дней подписки (1% шанс)</span>
              </div>
            </div>
          </div>

          {/* Кнопка игры */}
          <div className="text-center">
            <button
              onClick={handlePlay}
              disabled={!canPlay}
              className={`px-16 py-5 rounded-xl font-bold text-xl transition-all transform ${
                canPlay
                  ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-600 hover:via-orange-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-yellow-500/50 hover:scale-105 animate-pulse'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSpinning ? '🔄 Взлом...' : isLoading ? '⏳ Загрузка...' : '🔓 ВЗЛОМАТЬ СЕЙФ'}
            </button>
          </div>

          {/* Подсказка */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>💡 Плюсы: Уникальная механика, крутая анимация</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SafeCrackerGame;
