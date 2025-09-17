import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePlaySlotMutation, useGetSlotItemsQuery, useGetSlotStatusQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';
import { getItemImageUrl } from '../utils/steamImageUtils';
import { t } from 'i18next';

// Функция для безопасного преобразования типов API в SlotItem
const convertToSlotItem = (item: any): SlotItem => {
  const validRarities = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'contraband', 'exotic', 'empty'];
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
  // Специальная обработка для пустых слотов
  if (item.id === 'empty' || item.rarity === 'empty') {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center border border-gray-700/50`}>
        <div className="text-4xl mb-3 text-gray-600">❌</div>
        <div className="text-sm text-gray-500 font-medium px-3 text-center">
          {t('slots.empty')}
        </div>
      </div>
    );
  }

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

// Спокойные цвета редкости
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'empty': return 'border-gray-600/60 bg-gradient-to-br from-gray-800/40 to-gray-900/40';
    case 'covert':
    case 'contraband': return 'border-red-400/60 bg-gradient-to-br from-red-900/20 to-red-800/20';
    case 'classified': return 'border-purple-400/60 bg-gradient-to-br from-purple-900/20 to-purple-800/20';
    case 'restricted': return 'border-blue-400/60 bg-gradient-to-br from-blue-900/20 to-blue-800/20';
    case 'milspec': return 'border-green-400/60 bg-gradient-to-br from-green-900/20 to-green-800/20';
    case 'industrial': return 'border-yellow-400/60 bg-gradient-to-br from-yellow-900/20 to-yellow-800/20';
    case 'consumer': return 'border-gray-400/60 bg-gradient-to-br from-gray-700/20 to-gray-600/20';
    case 'exotic': return 'border-pink-400/60 bg-gradient-to-br from-pink-900/20 to-pink-800/20';
    default: return 'border-gray-400/60 bg-gradient-to-br from-gray-700/20 to-gray-600/20';
  }
};

interface ReelProps {
  items: SlotItem[];
  isSpinning: boolean;
  finalItem?: SlotItem;
  delay: number;
  onSpinComplete: () => void;
}

const Reel: React.FC<ReelProps> = ({ items, isSpinning, finalItem, delay, onSpinComplete }) => {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [useTransition, setUseTransition] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  useEffect(() => {
    if (isSpinning && finalItem) {
      setUseTransition(false);
      setCurrentOffset(0);

      const delayTimeout = setTimeout(() => {
        setTimeout(() => {
          setUseTransition(true);
          const spins = 3;
          const itemHeight = 160;
          const finalIndex = items.findIndex(item => item.id === finalItem.id);
          const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight - 80;

          setCurrentOffset(-totalOffset);

          setTimeout(() => {
            onSpinComplete();
          }, 1500);
        }, 50);
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete]);

  return (
    <div className="relative w-80 h-96 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-600/50 shadow-lg">
      {/* Простая внутренняя рамка */}
      <div className="absolute inset-2 rounded border border-gray-600/30"></div>

      <div
        ref={reelRef}
        className={`${useTransition ? 'transition-transform' : ''} ${isSpinning && useTransition ? 'duration-[1500ms] ease-out' : 'duration-0'}`}
        style={{
          transform: `translateY(${currentOffset}px)`,
          willChange: isSpinning ? 'transform' : 'auto'
        }}
      >
        {Array.from({ length: 5 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full border-b border-gray-600/30 ${getRarityColor(item.rarity)} flex items-center justify-center relative`}
              style={{
                willChange: isSpinning ? 'transform' : 'auto'
              }}
            >
              {/* Изображение или заглушка */}
              {!imageErrors.has(item.id) && item.id !== 'empty' && item.rarity !== 'empty' ? (
                <img
                  src={getItemImageUrl(item.image_url, item.name)}
                  alt={item.name}
                  className="w-full h-full object-contain p-3"
                  onError={() => {
                    handleImageError(item.id);
                  }}
                  onLoad={() => {}}
                  style={{
                    willChange: 'auto'
                  }}
                />
              ) : (
                <>
                  <PlaceholderImage className="w-full h-full" item={item} />
                </>
              )}

              {/* Название внизу */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-sm text-white font-medium bg-black/70 rounded px-2 py-1 truncate border border-gray-500/50">
                  {item.id === 'empty' || item.rarity === 'empty'
                    ? t('slots.empty')
                    : (item.name.length > 16 ? `${item.name.substring(0, 16)}...` : item.name)}
                </div>
              </div>

              {/* Индикатор редкости */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${
                  item.rarity === 'empty' ? 'bg-gray-600'
                  : item.rarity === 'covert' || item.rarity === 'contraband' ? 'bg-red-400'
                  : item.rarity === 'classified' ? 'bg-purple-400'
                  : item.rarity === 'restricted' ? 'bg-blue-400'
                  : item.rarity === 'milspec' ? 'bg-green-400'
                  : item.rarity === 'industrial' ? 'bg-yellow-400'
                  : 'bg-gray-400'}`}>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Простой центральный указатель */}
      <div className="absolute left-4 right-4 h-0.5 bg-white/80 pointer-events-none z-30 rounded-full"
           style={{ top: 'calc(50% - 20px)', transform: 'translateY(-50%)' }}>
        {/* Центральная точка */}
        <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full border border-gray-400"
             style={{ transform: 'translate(-50%, -50%)' }}></div>
      </div>
    </div>
  );
};

const SlotPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [displayItems, setDisplayItems] = useState<SlotItem[]>([]);
  const auth = useAuth();

  // Получаем предметы для слота из API
  const { data: slotItemsData, isLoading: isLoadingItems, error: itemsError } = useGetSlotItemsQuery();
  const { data: slotStatusData, isLoading: isLoadingStatus } = useGetSlotStatusQuery(undefined, {
    skip: !auth.user
  });
  const [playSlot, { isLoading }] = usePlaySlotMutation();

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
      return;
    }

    try {
      setIsSpinning(true);
      setShowResult(false);

      const response = await playSlot().unwrap();

      if (response.success && response.result) {
        setResult(response.result.items);

        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);

          if (response.result.isWin) {
            toast.success(t('slots.game_result_congratulations', { itemName: response.result.wonItem?.name }), {
              duration: 5000,
            });
          } else {
            toast(t('slots.game_result_no_luck'), { icon: '🎰' });
          }
        }, 3500);
      } else {
        setIsSpinning(false);
        toast.error(response.message || t('slots.unknown_error'));
      }
    } catch (err: any) {
      setIsSpinning(false);
      toast.error(t('slots.connection_error'));
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* Простой заголовок */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎰 {t('slots.title')}
          </h1>
          <div className="text-gray-300 text-lg mb-4">
            {t('slots.description')}
          </div>
          <div className="w-24 h-0.5 bg-gray-600 mx-auto rounded"></div>
        </div>

        {/* Игровая область */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-600/50 shadow-xl">

            {/* Игровое поле */}
            <div className="bg-gray-900/50 rounded-lg p-6 mb-6 border border-gray-700/50">
              <div className="flex justify-center gap-6 mb-4">
                {[0, 1, 2].map((reelIndex) => (
                  <Reel
                    key={reelIndex}
                    items={displayItems}
                    isSpinning={isSpinning}
                    finalItem={result[reelIndex]}
                    delay={reelIndex * 200}
                    onSpinComplete={handleReelComplete}
                  />
                ))}
              </div>
            </div>

            {/* Результат */}
            {showResult && result.length === 3 && (
              <div className="mb-6 p-6 rounded-lg bg-gray-700/30 border border-gray-600/50">
                <div className="text-center">
                  {/* Проверка на пустые слоты */}
                  {result[0]?.id !== 'empty' && result[1]?.id !== 'empty' && result[2]?.id !== 'empty' &&
                  result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <div className="text-2xl mb-4 font-bold text-green-400">
                        {t('slots.congratulations_jackpot')}
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-6 border border-green-400/50">
                        <div className="text-gray-300 mb-3 font-medium">{t('slots.winning_item')}</div>
                        <div className="text-xl font-bold text-white mb-3">{result[0]?.name}</div>
                        <div className="text-lg text-green-400 font-semibold">
                          {t('slots.item_value')} <Monetary value={Number(result[0]?.price || 0)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl mb-3 font-semibold text-gray-300">{t('slots.no_luck')}</div>
                      <div className="text-gray-400 mb-4">{t('slots.try_again')}</div>
                      <div className="bg-gray-700/30 rounded p-4 border border-gray-600/50">
                        <div className="text-gray-300 font-medium">
                          {t('slots.result')} {result.map(item =>
                            item?.id === 'empty' || item?.rarity === 'empty'
                              ? t('slots.empty')
                              : (item?.name?.split(' ')[0] || '?')
                          ).join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о подписке и лимитах */}
            {auth.user && slotStatusData?.data && (
              <div className="mb-6 p-6 rounded-lg bg-gray-700/30 border border-gray-600/50">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-4">📋 Информация о подписке</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="text-gray-400 text-sm font-medium mb-2">Ваша подписка</div>
                      <div className={`text-lg font-semibold ${
                        slotStatusData.data.hasSubscription ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {slotStatusData.data.subscriptionName}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="text-gray-400 text-sm font-medium mb-2">Спины сегодня</div>
                      <div className="text-lg font-semibold text-white">
                        {slotStatusData.data.used} / {slotStatusData.data.limit}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Осталось: {slotStatusData.data.remaining}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/50">
                      <div className="text-gray-400 text-sm font-medium mb-2">Сброс лимита</div>
                      <div className="text-sm text-white font-medium">
                        {slotStatusData.data.nextResetTimeFormatted}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">16:00 МСК ежедневно</div>
                    </div>
                  </div>

                  {!slotStatusData.data.hasSubscription && (
                    <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-400/50 rounded-lg text-yellow-300">
                      <div className="font-medium">💎 Нужна подписка для игры в слот!</div>
                      <div className="text-sm mt-1">
                        Статус (1 спин) • Статус+ (2 спина) • Статус++ (3 спина)
                      </div>
                    </div>
                  )}

                  {slotStatusData.data.hasSubscription && slotStatusData.data.remaining === 0 && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-400/50 rounded-lg text-red-300">
                      <div className="font-medium">🚫 Дневной лимит исчерпан</div>
                      <div className="text-sm mt-1">
                        Следующая возможность: {slotStatusData.data.nextResetTimeFormatted}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о игре */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎰</div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium">{t('slots.spin_cost')}</div>
                    <div className="text-white text-xl font-semibold">Бесплатно</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium">{t('slots.your_balance')}</div>
                    <div className="text-white text-xl font-semibold">
                      <Monetary value={Number(auth.user?.balance || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка спина */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  canPlay
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>{t('slots.spinning')}</span>
                  </span>
                ) : (
                  <span>{t('slots.play_button')}</span>
                )}
              </button>

              {/* Сообщения */}
              {!canPlay && auth.user && (
                <>

                  {slotStatusData?.data && !slotStatusData.data.hasSubscription && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-400/50 rounded-lg text-yellow-300 max-w-sm mx-auto">
                      <div className="font-medium">💎 Требуется подписка</div>
                      <div className="text-sm mt-1">Оформите подписку для игры в слот</div>
                    </div>
                  )}

                  {slotStatusData?.data && slotStatusData.data.hasSubscription && slotStatusData.data.remaining === 0 && (
                    <div className="mt-4 p-4 bg-orange-900/20 border border-orange-400/50 rounded-lg text-orange-300 max-w-sm mx-auto">
                      <div className="font-medium">🕐 Лимит исчерпан</div>
                      <div className="text-sm mt-1">Ждите сброса в 16:00 МСК</div>
                    </div>
                  )}
                </>
              )}

              {!auth.user && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-400/50 rounded-lg text-yellow-300 max-w-sm mx-auto">
                  <div className="font-medium">{t('slots.please_login')}</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-400/50 rounded-lg text-blue-300 max-w-sm mx-auto">
                  <div className="font-medium">{t('slots.loading_items_status')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotPage;
