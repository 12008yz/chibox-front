import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlaySafeCrackerMutation, useGetSafeCrackerStatusQuery } from '../features/user/userApi';
import toast from 'react-hot-toast';
import { soundManager } from '../utils/soundManager';
import { useAppSelector } from '../store/hooks';
import { hasActiveSubscription } from '../utils/subscriptionUtils';

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

  // Проверка подписки
  const user = useAppSelector(state => state.auth.user);
  const hasSubscription = hasActiveSubscription(user);

  const canPlay = !isSpinning && !isLoading && (status?.remaining_attempts || 0) > 0 && hasSubscription;

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
    if (!hasSubscription) {
      toast.error('Для игры в Safe Cracker требуется активная подписка!', {
        icon: '🔒',
        duration: 4000,
      });
      return;
    }

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
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
              <span>🔒</span>
              <span>СЕЙФ-ВЗЛОМ</span>
              <span>(Safe Cracker)</span>
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Статистика */}
          {hasSubscription && !(matches && matches >= 2) && (
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
          )}

          {/* Визуализация сейфа */}
          <div className="mb-6 flex justify-center px-4">
            <motion.div
              className="relative w-full max-w-[500px]"
              animate={isSpinning ? {
                x: [0, -2, 2, -2, 2, 0],
                y: [0, -1, 1, -1, 1, 0],
                rotate: [0, -0.5, 0.5, -0.5, 0.5, 0],
                transition: {
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              } : {}}
            >
              {/* Изображение сейфа */}
              <img
                src="/images/bonus-safe.png"
                alt="Safe"
                className="w-full h-auto"
              />

              {/* Цифры в пустых блоках сейфа */}
              <div className="absolute top-[19%] min-[425px]:top-[20%] sm:top-[22%] left-1/2 transform -translate-x-1/2 flex gap-[2.4%] w-[46%]">
                {displayCode.map((digit, index) => (
                  <motion.div
                    key={index}
                    animate={isSpinning ? {
                      y: [0, -5, 5, -5, 5, 0],
                      x: [0, -1, 1, -1, 1, 0],
                      rotate: [0, -1, 1, -1, 1, 0],
                      transition: {
                        duration: 0.15,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    } : {}}
                    className="relative flex-1"
                  >
                    <div className="w-full aspect-[1.2/1] flex items-center justify-center">
                      <span className="font-bold text-black font-mono drop-shadow-lg" style={{ fontSize: 'clamp(0.5rem, 8vw, 3rem)' }}>
                        {digit}
                      </span>
                    </div>
                    {showResult && userCode && (
                      <div className="absolute -bottom-8 sm:-bottom-12 md:-bottom-16 left-1/2 transform -translate-x-1/2">
                        {secretCode![index] === userCode[index] ? (
                          <span className="text-2xl sm:text-3xl">✅</span>
                        ) : (
                          <span className="text-2xl sm:text-3xl">❌</span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Предупреждение о необходимости подписки */}
          {!hasSubscription && (
            <div className="mb-6 bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h4 className="text-red-400 text-center font-bold text-lg mb-1">Требуется активный статус</h4>
                </div>
              </div>
            </div>
          )}

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
              {isSpinning ? '🔄 Взлом...' : isLoading ? '⏳ Загрузка...' : !hasSubscription ? '🔒 Играть' : '🔓 ВЗЛОМАТЬ СЕЙФ'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SafeCrackerGame;
