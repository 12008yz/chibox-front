import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaySlotMutation, useGetSlotItemsQuery, useGetSlotStatusQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';
import { getItemImageUrl } from '../utils/steamImageUtils';
import CountdownTimer from '../components/CountdownTimer';
import { soundManager } from '../utils/soundManager';

// Функция для безопасного преобразования типов API в SlotItem
const convertToSlotItem = (item: any): SlotItem => {
  const validRarities = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'contraband', 'exotic'];
  const rarity = validRarities.includes(item.rarity?.toLowerCase())
    ? item.rarity.toLowerCase() as SlotItem['rarity']
    : 'consumer' as SlotItem['rarity'];

  return {
    id: item.id,
    name: item.name,
    image_url: item.image_url,
    price: item.price,
    rarity
  };
};

// Тёмная минималистичная заглушка для изображений
const PlaceholderImage: React.FC<{
  className?: string;
  item: SlotItem;
}> = ({ className = "w-full h-full", item }) => {
  return (
    <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex flex-col items-center justify-center border border-gray-600`}>
      <div className="text-3xl mb-3 text-gray-400">📦</div>
      <div className="text-sm text-gray-300 font-medium px-3 text-center">
        {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
      </div>
      <div className="text-lg text-yellow-400 font-semibold mt-2">
        <Monetary value={Number(item.price)} />
      </div>
    </div>
  );
};

// Улучшенные цвета редкости с градиентами
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'border-red-500/70 bg-gradient-to-br from-red-950/30 via-red-900/20 to-red-950/30';
    case 'classified': return 'border-purple-500/70 bg-gradient-to-br from-purple-950/30 via-purple-900/20 to-purple-950/30';
    case 'restricted': return 'border-blue-500/70 bg-gradient-to-br from-blue-950/30 via-blue-900/20 to-blue-950/30';
    case 'milspec': return 'border-green-500/70 bg-gradient-to-br from-green-950/30 via-green-900/20 to-green-950/30';
    case 'industrial': return 'border-yellow-500/70 bg-gradient-to-br from-yellow-950/30 via-yellow-900/20 to-yellow-950/30';
    case 'consumer': return 'border-gray-500/70 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-900/30';
    case 'exotic': return 'border-pink-500/70 bg-gradient-to-br from-pink-950/30 via-pink-900/20 to-pink-950/30';
    default: return 'border-gray-500/70 bg-gradient-to-br from-gray-900/30 via-gray-800/20 to-gray-900/30';
  }
};

// Получаем цвет свечения для редкости
const getRarityGlow = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
    case 'classified': return 'shadow-[0_0_20px_rgba(168,85,247,0.3)]';
    case 'restricted': return 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
    case 'milspec': return 'shadow-[0_0_20px_rgba(34,197,94,0.3)]';
    case 'industrial': return 'shadow-[0_0_20px_rgba(234,179,8,0.3)]';
    case 'exotic': return 'shadow-[0_0_20px_rgba(236,72,153,0.3)]';
    default: return 'shadow-[0_0_10px_rgba(107,114,128,0.2)]';
  }
};

interface ReelProps {
  items: SlotItem[];
  isSpinning: boolean;
  finalItem?: SlotItem;
  delay: number;
  onSpinComplete: () => void;
  isLastReel?: boolean;
  isWinning?: boolean;
}

const Reel: React.FC<ReelProps> = ({ items, isSpinning, finalItem, delay, onSpinComplete, isLastReel = false, isWinning = false }) => {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [useTransition, setUseTransition] = useState(false);
  const [isSlowingDown, setIsSlowingDown] = useState(false);
  const [showWinEffect, setShowWinEffect] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  useEffect(() => {
    if (isSpinning && finalItem) {
      setUseTransition(false);
      setCurrentOffset(0);
      setIsSlowingDown(false);
      setShowWinEffect(false);

      const delayTimeout = setTimeout(() => {
        setTimeout(() => {
          setUseTransition(true);
          const spins = 3;
          const itemHeight = 160;
          const finalIndex = items.findIndex(item => item.id === finalItem.id);
          const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight - 80;

          setCurrentOffset(-totalOffset);

          if (isLastReel) {
            setTimeout(() => {
              setIsSlowingDown(true);
            }, 1200);
          }

          setTimeout(() => {
            setIsSlowingDown(false);
            if (isWinning && isLastReel) {
              setShowWinEffect(true);
            }
            onSpinComplete();
          }, isLastReel ? 2500 : 1500);
        }, 50);
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete, isLastReel, isWinning]);

  return (
    <div className={`relative w-80 h-96 overflow-hidden rounded-2xl border-2 transition-all duration-500
      border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.3)]
      ${isLastReel && isSlowingDown ? 'scale-[1.02]' : 'scale-100'}
      bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900`}
      style={{ contain: 'layout style paint' }}>

      {/* Внутренняя подсветка */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none rounded-2xl"></div>

      {/* Боковые тени для глубины */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-20"></div>
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-20"></div>

      <div
        ref={reelRef}
        className={`${useTransition ? 'transition-transform' : ''} ${
          isSpinning && useTransition
            ? isLastReel
              ? 'duration-[2500ms] ease-[cubic-bezier(0.33,0,0.2,1)]'
              : 'duration-[1500ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
            : 'duration-0'
        }`}
        style={{
          transform: `translateY(${currentOffset}px)`,
          willChange: isSpinning ? 'transform' : 'auto'
        }}
      >
        {Array.from({ length: 5 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full border-b border-gray-700/30 ${getRarityColor(item.rarity)}
                flex items-center justify-center relative
                transition-all duration-300
                ${isSpinning ? '' : ''}`}
              style={{
                willChange: isSpinning ? 'transform' : 'auto'
              }}
            >
              {/* Изображение или заглушка */}
              <div className="relative w-full h-full p-3 flex items-center justify-center">
                {!imageErrors.has(item.id) ? (
                  <img
                    src={getItemImageUrl(item.image_url, item.name)}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                    onError={() => handleImageError(item.id)}
                    style={{ willChange: 'auto' }}
                  />
                ) : (
                  <PlaceholderImage className="w-full h-full" item={item} />
                )}
              </div>

              {/* Название внизу с улучшенным стилем */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-xs text-white font-medium bg-black/80  rounded-lg px-2 py-1 truncate border border-white/10 shadow-lg">
                  {item.name.length > 18 ? `${item.name.substring(0, 18)}...` : item.name}
                </div>
              </div>

              {/* Индикатор редкости с улучшенным дизайном */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  item.rarity === 'covert' || item.rarity === 'contraband' ? 'bg-red-500 shadow-red-500/50'
                  : item.rarity === 'classified' ? 'bg-purple-500 shadow-purple-500/50'
                  : item.rarity === 'restricted' ? 'bg-blue-500 shadow-blue-500/50'
                  : item.rarity === 'milspec' ? 'bg-green-500 shadow-green-500/50'
                  : item.rarity === 'industrial' ? 'bg-yellow-500 shadow-yellow-500/50'
                  : item.rarity === 'exotic' ? 'bg-pink-500 shadow-pink-500/50'
                  : 'bg-gray-400 shadow-gray-400/50'
                }`}>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>

              {/* Тонкая верхняя подсветка */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          ))
        )}
      </div>

      {/* Центральный указатель с улучшенным дизайном */}
      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent pointer-events-none z-30 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
           style={{ top: 'calc(50% - 20px)', transform: 'translateY(-50%)' }}>
        <div className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full border-2 border-yellow-400 bg-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
             style={{ transform: 'translate(-50%, -50%)' }}>
          <div className="absolute inset-0 rounded-full bg-yellow-400 animate-pulse"></div>
        </div>
      </div>

      {/* Верхний градиент для размытия */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-10"></div>
      {/* Нижний градиент для размытия */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10"></div>

      {/* Оптимизированный эффект дыма при победе */}
      {showWinEffect && isWinning && (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden" style={{ contain: 'layout style paint' }}>
          {/* Уменьшенное количество облаков дыма - 4 штуки вместо 18 */}
          {[...Array(4)].map((_, i) => (
            <div
              key={`smoke-${i}`}
              className="absolute rounded-full opacity-0"
              style={{
                left: `${15 + i * 23}%`,
                bottom: '-10%',
                width: '110px',
                height: '110px',
                background: `radial-gradient(circle, rgba(200, 200, 200, 0.35) 0%, transparent 65%)`,
                filter: 'blur(10px)',
                animation: `smokeRise 3s ease-out forwards`,
                animationDelay: `${i * 0.2}s`,
                willChange: 'transform, opacity'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SlotPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [_showResult, setShowResult] = useState(false);
  const [displayItems, setDisplayItems] = useState<SlotItem[]>([]);
  const [isWinning, setIsWinning] = useState(false);
  const auth = useAuth();

  // Получаем предметы для слота из API
  const { data: slotItemsData, isLoading: isLoadingItems, error: itemsError } = useGetSlotItemsQuery();
  const { data: slotStatusData, isLoading: _isLoadingStatus, refetch: refetchSlotStatus } = useGetSlotStatusQuery(undefined, {
    skip: !auth.user
  });
  const [playSlot, { isLoading }] = usePlaySlotMutation();

  // Функция для обновления статуса слота когда таймер завершится
  const handleTimerComplete = () => {
    if (refetchSlotStatus) {
      refetchSlotStatus();
    }
  };

  // Когда получаем предметы из API, обновляем displayItems
  useEffect(() => {
    if (slotItemsData?.success && slotItemsData.data.items.length > 0) {
      const convertedItems = slotItemsData.data.items.map(convertToSlotItem);
      setDisplayItems(convertedItems);
    }
  }, [slotItemsData]);

  const canPlay = !isSpinning && !isLoading && auth.user && displayItems.length > 0 && slotStatusData?.data?.canPlay;

  const handleSpin = async () => {
    if (!canPlay) {
      console.log('[SLOT DEBUG] Cannot play - conditions not met');
      return;
    }

    console.log('[SLOT DEBUG] Starting spin...');

    try {
      setIsSpinning(true);
      setShowResult(false);
      setIsWinning(false);

      soundManager.play('slotSpin');

      console.log('[SLOT DEBUG] Calling playSlot API...');
      const response = await playSlot().unwrap();
      console.log('[SLOT DEBUG] API response received:', response);

      if (response.success && response.result) {
        console.log('[SLOT DEBUG] Processing result:', response.result);
        setResult(response.result.items);
        setIsWinning(response.result.isWin);

        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);

          if (response.result.isWin) {
            soundManager.play('slotWin');
            toast.success(t('slots.game_result_congratulations', { itemName: response.result.wonItem?.name }), {
              duration: 5000,
            });
          } else {
            soundManager.play('slotLose');
            toast(t('slots.game_result_no_luck'));
          }

          refetchSlotStatus();
        }, 4500);
      } else {
        console.error('[SLOT DEBUG] Invalid response:', response);
        setIsSpinning(false);
        toast.error(response.message || t('slots.unknown_error'));
      }
    } catch (err: any) {
      console.error('[SLOT DEBUG] Error caught:', err);
      console.error('[SLOT DEBUG] Error details:', {
        message: err?.message,
        data: err?.data,
        status: err?.status,
        originalStatus: err?.originalStatus
      });

      setIsSpinning(false);

      if (err?.data?.message) {
        toast.error(err.data.message);
      } else if (err?.status === 'TIMEOUT_ERROR') {
        toast.error('Превышено время ожидания ответа от сервера');
      } else if (err?.status === 'FETCH_ERROR') {
        toast.error('Ошибка соединения с сервером');
      } else if (err?.status === 401) {
        toast.error('Требуется авторизация');
      } else {
        toast.error(err?.message || t('slots.connection_error'));
      }
    }
  };

  const handleReelComplete = () => {
    // Упрощенная логика - основной сброс состояния происходит в handleSpin через таймаут
  };

  if (isLoadingItems) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-600 border-t-white mx-auto mb-4"></div>
          <div className="text-white text-lg font-medium">{t('slots.loading_items')}</div>
          <div className="text-gray-400 text-sm mt-2">{t('slots.preparing_game')}</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-lg p-6 border border-red-400/50 max-w-md">
          <div className="text-red-400 text-xl font-semibold mb-3">{t('slots.loading_error')}</div>
          <div className="text-gray-300 mb-4">{t('slots.failed_to_load')}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors border border-gray-600"
          >
            {t('slots.reload')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Улучшенный фон */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: 'url(/images/slot1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 -z-40" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Улучшенный заголовок */}
        <div className="text-center mb-10">
          <div className="inline-block">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 mb-2 animate-pulse flex items-center justify-center gap-4">
              <img src="/images/status3.png" alt="Slot" className="w-16 h-16 object-contain" />
              {t('slots.title')}
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full"></div>
          </div>
          <div className="text-gray-300 text-lg mb-4 mt-4 font-light">
            {t('slots.description')}
          </div>
        </div>

        {/* Игровая область */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-900/80 rounded-3xl p-8 border border-gray-700/50 shadow-2xl">

            {/* Игровое поле */}
            <div className="bg-gradient-to-b from-gray-950/50 to-gray-900/50 rounded-2xl p-8 mb-8 border border-gray-800/50 relative overflow-hidden">

              {/* Оптимизированный общий эффект дыма для всей игровой области */}
              {!isSpinning && isWinning && (
                <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" style={{ contain: 'layout style paint' }}>
                  {/* Уменьшенное количество облаков дыма - 6 штук вместо 31 */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`global-smoke-${i}`}
                      className="absolute rounded-full opacity-0"
                      style={{
                        left: `${10 + i * 15}%`,
                        bottom: '-15%',
                        width: '140px',
                        height: '140px',
                        background: `radial-gradient(circle, rgba(210, 210, 210, 0.3) 0%, transparent 65%)`,
                        filter: 'blur(12px)',
                        animation: `smokeRise 3.5s ease-out forwards`,
                        animationDelay: `${i * 0.15}s`,
                        willChange: 'transform, opacity'
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-center gap-8 mb-4 relative z-10">
                {[0, 1, 2].map((reelIndex) => (
                  <Reel
                    key={reelIndex}
                    items={displayItems}
                    isSpinning={isSpinning}
                    finalItem={result[reelIndex]}
                    delay={reelIndex * 200}
                    onSpinComplete={handleReelComplete}
                    isLastReel={reelIndex === 2}
                    isWinning={isWinning}
                  />
                ))}
              </div>
            </div>

            {/* Улучшенная информация о подписке */}
            {auth.user && slotStatusData?.data && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">
                    📋 Информация о подписке
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:scale-105">
                      <div className="text-gray-400 text-sm font-medium mb-2">Ваш уровень</div>
                      <div className={`text-xl font-bold transition-all duration-300 ${
                        slotStatusData.data.hasSubscription ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-red-400'
                      }`}>
                        {slotStatusData.data.subscriptionName}
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:scale-105">
                      <div className="text-gray-400 text-sm font-medium mb-2">Спины сегодня</div>
                      <div className="text-xl font-bold text-white">
                        {slotStatusData.data.used} / {slotStatusData.data.limit}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Осталось: <span className="text-blue-400 font-semibold">{slotStatusData.data.remaining}</span>
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:scale-105">
                      <div className="text-gray-400 text-sm font-medium mb-2">Сброс лимита через</div>
                      <div className="text-base text-white font-medium">
                        <CountdownTimer
                          targetTime={slotStatusData.data.nextResetTime}
                          className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                          onComplete={handleTimerComplete}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Заходите каждый день</div>
                    </div>
                  </div>

                  {/* Бесплатные попытки */}
                  {slotStatusData.data.free_attempts_remaining > 0 && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/50 rounded-2xl ">
                      <div className="text-green-300 font-bold text-lg mb-2">
                        🎁 Бесплатные попытки: {slotStatusData.data.free_attempts_remaining} из 2
                      </div>
                      <div className="text-sm text-green-200">
                        {slotStatusData.data.free_attempts_info.reason}
                      </div>
                      {slotStatusData.data.free_attempts_info.next_available && (
                        <div className="text-xs text-green-300 mt-2">
                          Следующая попытка доступна: {new Date(slotStatusData.data.free_attempts_info.next_available).toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Улучшенная кнопка спина */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`group relative px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 overflow-hidden ${
                  canPlay
                    ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 hover:from-blue-500 hover:via-blue-400 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] transform hover:scale-110 active:scale-95'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {/* Анимированный фон для активной кнопки */}
                {canPlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-[shimmer_2s_infinite]"></div>
                )}

                <span className="relative z-10">
                  {isLoading || isSpinning ? (
                    <span className="flex items-center gap-3 justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      <span>{t('slots.spinning')}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 justify-center">
                      <span>🎲</span>
                      <span>{t('slots.play_button')}</span>
                    </span>
                  )}
                </span>
              </button>

              {/* Сообщения с улучшенным дизайном */}
              {!canPlay && auth.user && (
                <>
                  {slotStatusData?.data && !slotStatusData.data.hasSubscription && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/50 rounded-2xl text-red-300 max-w-sm mx-auto ">
                      <div className="font-bold text-lg">💎 Требуется статус</div>
                      <div className="text-sm mt-2">Оформите статус для игры в слот</div>
                    </div>
                  )}
                </>
              )}

              {!auth.user && (
                <div className="mt-6 p-5 bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border border-yellow-500/50 rounded-2xl text-yellow-300 max-w-sm mx-auto ">
                  <div className="font-bold text-lg">{t('slots.please_login')}</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/50 rounded-2xl text-blue-300 max-w-sm mx-auto ">
                  <div className="font-bold text-lg">{t('slots.loading_items_status')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        @keyframes smokeRise {
          0% {
            transform: translateY(0) scale(0.8);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.6;
            transform: translateY(-250px) scale(1.3);
          }
          100% {
            transform: translateY(-450px) scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default SlotPage;
