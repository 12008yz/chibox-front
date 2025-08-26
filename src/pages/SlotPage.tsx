import React, { useState, useEffect, useRef } from 'react';
import { usePlaySlotMutation, useGetSlotItemsQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';
import { getItemImageUrl } from '../utils/steamImageUtils';

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

// Спокойные цвета редкости
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
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
          const spins = 5;
          const itemHeight = 160;
          const finalIndex = items.findIndex(item => item.id === finalItem.id);
          const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight - 80;

          setCurrentOffset(-totalOffset);

          setTimeout(() => {
            onSpinComplete();
          }, 2000);
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
        className={`${useTransition ? 'transition-transform' : ''} ${isSpinning && useTransition ? 'duration-[2000ms] ease-out' : 'duration-0'}`}
        style={{ transform: `translateY(${currentOffset}px)` }}
      >
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full border-b border-gray-600/30 ${getRarityColor(item.rarity)} flex items-center justify-center relative transition-all duration-200`}
            >
              {/* Изображение или заглушка */}
              {!imageErrors.has(item.id) ? (
                <img
                  src={getItemImageUrl(item.image_url, item.name)}
                  alt={item.name}
                  className="w-full h-full object-contain p-3 transition-transform duration-200"
                  onError={() => {
                    handleImageError(item.id);
                  }}
                  onLoad={() => {}}
                />
              ) : (
                <>
                  <PlaceholderImage className="w-full h-full" item={item} />
                </>
              )}

              {/* Название внизу */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-sm text-white font-medium bg-black/70 rounded px-2 py-1 truncate border border-gray-500/50">
                  {item.name.length > 16 ? `${item.name.substring(0, 16)}...` : item.name}
                </div>
              </div>

              {/* Индикатор редкости */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${item.rarity === 'covert' || item.rarity === 'contraband' ? 'bg-red-400' :
                  item.rarity === 'classified' ? 'bg-purple-400' :
                  item.rarity === 'restricted' ? 'bg-blue-400' :
                  item.rarity === 'milspec' ? 'bg-green-400' :
                  item.rarity === 'industrial' ? 'bg-yellow-400' :
                  'bg-gray-400'}`}>
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
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [displayItems, setDisplayItems] = useState<SlotItem[]>([]);
  const auth = useAuth();

  // Получаем предметы для слота из API
  const { data: slotItemsData, isLoading: isLoadingItems, error: itemsError } = useGetSlotItemsQuery();
  const [playSlot, { isLoading }] = usePlaySlotMutation();

  // Когда получаем предметы из API, обновляем displayItems
  useEffect(() => {
    if (slotItemsData?.success && slotItemsData.data.items.length > 0) {
      const convertedItems = slotItemsData.data.items.map(convertToSlotItem);
      setDisplayItems(convertedItems);
    }
  }, [slotItemsData]);

  const canPlay = !isSpinning && !isLoading && auth.user && Number(auth.user.balance || 0) >= 10 && displayItems.length > 0;

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
            toast.success(`🎉 Поздравляем! Вы выиграли ${response.result.wonItem?.name}!`, {
              duration: 5000,
            });
          } else {
            toast('😔 Не повезло в этот раз', { icon: '🎰' });
          }
        }, 3500);
      } else {
        setIsSpinning(false);
        toast.error(response.message || 'Что-то пошло не так');
      }
    } catch (err: any) {
      setIsSpinning(false);
      toast.error('Ошибка соединения с сервером');
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
          <div className="text-white text-lg font-medium">Загружаем предметы...</div>
          <div className="text-gray-400 text-sm mt-2">Подготавливаем игру</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center bg-gray-800 rounded-lg p-6 border border-red-400/50 max-w-md">
          <div className="text-red-400 text-xl font-semibold mb-3">Ошибка загрузки</div>
          <div className="text-gray-300 mb-4">Не удалось загрузить данные игры</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors border border-gray-600"
          >
            Перезагрузить
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
            🎰 Слот-машина
          </h1>
          <div className="text-gray-300 text-lg mb-4">
            Соберите <span className="text-yellow-400 font-semibold">3 одинаковых предмета</span> для победы
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
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <div className="text-2xl mb-4 font-bold text-green-400">
                        Поздравляем! Джекпот!
                      </div>
                      <div className="bg-green-900/20 rounded-lg p-6 border border-green-400/50">
                        <div className="text-gray-300 mb-3 font-medium">Выигрышный предмет:</div>
                        <div className="text-xl font-bold text-white mb-3">{result[0]?.name}</div>
                        <div className="text-lg text-green-400 font-semibold">
                          Стоимость: <Monetary value={Number(result[0]?.price || 0)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xl mb-3 font-semibold text-gray-300">Не повезло</div>
                      <div className="text-gray-400 mb-4">Попробуйте еще раз!</div>
                      <div className="bg-gray-700/30 rounded p-4 border border-gray-600/50">
                        <div className="text-gray-300 font-medium">
                          Выпало: {result.map(item => item?.name?.split(' ')[0] || '?').join(' • ')}
                        </div>
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
                    <div className="text-gray-400 text-sm font-medium">Стоимость спина</div>
                    <div className="text-white text-xl font-semibold">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <div className="text-gray-400 text-sm font-medium">Ваш баланс</div>
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
                    <span>Крутится...</span>
                  </span>
                ) : (
                  <span>Играть (10 ₽)</span>
                )}
              </button>

              {/* Сообщения */}
              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-400/50 rounded-lg text-red-300 max-w-sm mx-auto">
                  <div className="font-medium">Недостаточно средств для игры</div>
                </div>
              )}

              {!auth.user && (
                <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-400/50 rounded-lg text-yellow-300 max-w-sm mx-auto">
                  <div className="font-medium">Войдите в аккаунт для игры</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-4 p-4 bg-blue-900/20 border border-blue-400/50 rounded-lg text-blue-300 max-w-sm mx-auto">
                  <div className="font-medium">Загружаем предметы...</div>
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
