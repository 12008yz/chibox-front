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
  const { t: _t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayCode, setDisplayCode] = useState<number[]>([9, 9, 9]);
  const [secretCode, setSecretCode] = useState<number[] | null>(null);
  const [userCode, setUserCode] = useState<number[] | null>(null);
  const [matches, setMatches] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [prizeType, setPrizeType] = useState<string | null>(null);
  const [prizeValue, setPrizeValue] = useState<number | null>(null);
  const [wonItem, setWonItem] = useState<any>(null);
  const [showPrizeAnimation, setShowPrizeAnimation] = useState(false);

  const { data: status, refetch: refetchStatus } = useGetSafeCrackerStatusQuery();
  const [playSafeCracker, { isLoading }] = usePlaySafeCrackerMutation();

  // Проверка подписки
  const user = useAppSelector(state => state.auth.user);
  const hasSubscription = hasActiveSubscription(user);

  // Используем can_play с бэкенда, который уже учитывает и бесплатные попытки, и подписку
  const canPlay = !isSpinning && !isLoading && status?.can_play;

  // Анимация вращения барабанов (оптимизирована для снижения нагрузки на GPU)
  const spinDrums = async (finalCode: number[]) => {
    const spinDuration = 3000; // 3 секунды
    const spinInterval = 100; // Обновление каждые 100ms (снижено с 50ms для оптимизации)
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
    // Проверяем can_play с бэкенда (уже учитывает бесплатные попытки и подписку)
    if (!canPlay) {
      if (!hasSubscription && (status?.free_attempts_remaining || 0) === 0) {
        toast.error('Для игры в Safe Cracker требуется активный статус или бесплатные попытки!', {
          icon: '🔒',
          duration: 4000,
        });
      }
      return;
    }

    try {
      // Сбрасываем предыдущие результаты
      setShowResult(false);
      setMatches(null);
      setSecretCode(null);
      setUserCode(null);
      setPrizeType(null);
      setPrizeValue(null);
      setWonItem(null);
      setShowPrizeAnimation(false);

      // Запрашиваем результат с сервера
      const response = await playSafeCracker().unwrap();

      if (!response.success) {
        toast.error(response.message);
        return;
      }

      setIsSpinning(true);

      // Воспроизводим циклический звук вращения барабанов
      soundManager.play('bonusGame', true);

      // Анимация вращения барабанов
      await spinDrums(response.user_code);

      // Останавливаем звук вращения
      soundManager.stop('bonusGame');

      // Небольшая пауза перед показом результата
      await new Promise(resolve => setTimeout(resolve, 300));

      // Останавливаем анимацию вращения
      setIsSpinning(false);

      // Еще небольшая пауза для плавности
      await new Promise(resolve => setTimeout(resolve, 200));

      // Показываем результат
      setSecretCode(response.secret_code);
      setUserCode(response.user_code);
      setMatches(response.matches);
      setShowResult(true);

      // Сохраняем информацию о призе
      setPrizeType(response.prize_type);
      setPrizeValue(response.prize_value);
      setWonItem(response.won_item);

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

      // Показываем анимацию приза если есть выигрыш
      if (response.prize_type === 'money' || response.prize_type === 'item') {
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowPrizeAnimation(true);

        // Скрываем анимацию через 3 секунды
        setTimeout(() => {
          setShowPrizeAnimation(false);
        }, 3000);
      }

      // Ждем немного перед обновлением статуса, чтобы пользователь увидел результат
      await new Promise(resolve => setTimeout(resolve, 500));

      // Обновляем статус в самом конце
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
      setPrizeType(null);
      setPrizeValue(null);
      setWonItem(null);
      setShowPrizeAnimation(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      {/* Backdrop - убран backdrop-blur для оптимизации GPU */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90"
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
              <span>ВЗЛОМАЙ СЕЙФ</span>
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Статистика */}
          {hasSubscription && !status?.has_won && !(matches && matches >= 2) && (
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

          {/* Бесплатные попытки для новых пользователей */}
          {!hasSubscription && (status?.free_attempts_remaining || 0) > 0 && (
            <div className="mb-6">
              <div className="bg-green-900/20 border border-green-400/50 rounded-lg p-4">
                <div className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                  <span>🎁</span>
                  <span>Бесплатные попытки: {status?.free_attempts_remaining || 0} из 2</span>
                </div>
                <div className="text-sm text-green-200">
                  {status?.free_attempts_info?.reason || ''}
                </div>
                {status?.free_attempts_info?.next_available && (
                  <div className="text-xs text-green-300 mt-2">
                    Следующая попытка доступна: {new Date(status.free_attempts_info.next_available).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Визуализация сейфа */}
          <div className="mb-6 flex justify-center px-4">
            <div className={`relative w-full max-w-[500px] ${isSpinning ? 'safe-shake' : ''}`}>
              {/* Изображение сейфа */}
              <img
                src="/images/bonus-safe.png"
                alt="Safe"
                className="w-full h-auto select-none pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Цифры в пустых блоках сейфа */}
              <div className="absolute top-[19%] min-[340px]:top-[20%] min-[425px]:top-[21%] sm:top-[22%] left-1/2 transform -translate-x-1/2 flex gap-[2.4%] w-[46%]">
                {displayCode.map((digit, index) => (
                  <div
                    key={index}
                    className={`relative flex-1 ${isSpinning ? 'digit-spin' : ''}`}
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
                  </div>
                ))}
              </div>

              {/* Анимация выигрыша баланса */}
              <AnimatePresence>
                {showPrizeAnimation && prizeType === 'money' && prizeValue && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      scale: [0.5, 1.2, 1.2, 0.8],
                      y: [0, -10, -10, -20]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                  >
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl shadow-2xl border-2 border-green-300">
                      <div className="text-white font-bold text-2xl sm:text-3xl md:text-4xl whitespace-nowrap flex items-center gap-2">
                        <span>💰</span>
                        <span>+{prizeValue}₽</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Анимация выигрыша предмета */}
              <AnimatePresence>
                {showPrizeAnimation && prizeType === 'item' && wonItem && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -180 }}
                    animate={{
                      opacity: [0, 1, 1, 1, 0],
                      scale: [0, 1.5, 1.3, 1.3, 0.8],
                      rotate: [-180, 0, 0, 0, 180],
                      y: [0, -20, -15, -15, -30]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 3, ease: "easeOut" }}
                    className="absolute top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                  >
                    <div className="relative">
                      {/* Свечение вокруг предмета */}
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 20px 10px rgba(251, 191, 36, 0.3)',
                            '0 0 40px 20px rgba(251, 191, 36, 0.5)',
                            '0 0 20px 10px rgba(251, 191, 36, 0.3)',
                          ]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-xl"
                      />

                      {/* Предмет */}
                      <div className="relative bg-gradient-to-br from-yellow-600/90 to-orange-600/90 p-4 rounded-xl border-4 border-yellow-400 shadow-2xl">
                        <img
                          src={wonItem.image_url}
                          alt={wonItem.name}
                          className="w-32 h-32 sm:w-40 sm:h-40 object-contain select-none pointer-events-none"
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                        />
                        <div className="mt-2 bg-black/50 px-3 py-1 rounded-lg">
                          <p className="text-white font-bold text-sm sm:text-base text-center truncate max-w-[200px]">
                            {wonItem.name}
                          </p>
                          <p className="text-yellow-300 font-bold text-xs sm:text-sm text-center">
                            {wonItem.price}₽
                          </p>
                        </div>
                      </div>

                      {/* Искры вокруг предмета */}
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              x: [0, Math.cos(i * Math.PI / 4) * 60],
                              y: [0, Math.sin(i * Math.PI / 4) * 60],
                              opacity: [1, 0]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full"
                            style={{
                              transform: 'translate(-50%, -50%)'
                            }}
                          />
                        ))}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Блок с загаданными числами */}
          {showResult && secretCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-center gap-3">
                <span className="text-purple-200 font-semibold text-sm">🎯 Загаданный код:</span>
                <div className="flex gap-2">
                  {secretCode.map((digit, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center border border-purple-400/50 shadow-lg"
                    >
                      <span className="text-xl sm:text-2xl font-bold text-white font-mono">
                        {digit}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

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

          {/* Сообщение о том, что пользователь уже выиграл */}
          {status?.has_won && hasSubscription && !isSpinning && !isLoading && (
            <div className="mb-6 bg-green-900/30 border-2 border-green-500/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h4 className="text-green-400 text-center font-bold text-lg mb-1">🎉 Вы уже выиграли в Safe Cracker сегодня!</h4>
                  <p className="text-green-300 text-center text-sm">Следующие попытки будут доступны в 16:00 МСК.</p>
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
              {isSpinning ? '🔄 Взлом...' : isLoading ? '⏳ Загрузка...' : !hasSubscription ? '🔒 Играть' : status?.has_won ? '✅ Бонус получен' : '🔓 ВЗЛОМАТЬ СЕЙФ'}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default SafeCrackerGame;
