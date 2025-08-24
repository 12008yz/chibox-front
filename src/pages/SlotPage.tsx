import React, { useState, useEffect, useRef } from 'react';
import { usePlaySlotMutation, useGetSlotItemsQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';
import { getItemImageUrl } from '../utils/steamImageUtils';

// Функция для безопасного преобразования типов API в SlotItem
const convertToSlotItem = (item: any): SlotItem => {
  console.log('Converting item:', item);
  const validRarities = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert', 'contraband', 'exotic'];
  const rarity = validRarities.includes(item.rarity?.toLowerCase())
    ? item.rarity.toLowerCase() as SlotItem['rarity']
    : 'consumer' as SlotItem['rarity'];

  const converted = {
    id: item.id,
    name: item.name,
    image_url: item.image_url,
    price: item.price,
    rarity
  };

  console.log('Converted to:', converted);
  return converted;
};

// Минималистичная заглушка для изображений
const PlaceholderImage: React.FC<{
  className?: string;
  item: SlotItem;
}> = ({ className = "w-full h-full", item }) => {
  return (
    <div className={`${className} bg-gray-100 rounded flex flex-col items-center justify-center border border-gray-200`}>
      <div className="text-4xl mb-3 text-gray-400">📦</div>
      <div className="text-sm text-gray-600 font-medium px-3 text-center">
        {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
      </div>
      <div className="text-lg text-gray-800 font-semibold mt-2">
        <Monetary value={Number(item.price)} />
      </div>
    </div>
  );
};

// Упрощенные функции редкости
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'border-red-300 bg-red-50';
    case 'classified': return 'border-purple-300 bg-purple-50';
    case 'restricted': return 'border-blue-300 bg-blue-50';
    case 'milspec': return 'border-green-300 bg-green-50';
    case 'industrial': return 'border-yellow-300 bg-yellow-50';
    case 'consumer': return 'border-gray-300 bg-gray-50';
    case 'exotic': return 'border-pink-300 bg-pink-50';
    default: return 'border-gray-300 bg-gray-50';
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
  const reelRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  useEffect(() => {
    if (isSpinning && finalItem) {
      const delayTimeout = setTimeout(() => {
        const spins = 5;
        const itemHeight = 160; // Вернул оригинальную высоту
        const finalIndex = items.findIndex(item => item.id === finalItem.id);
        const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight;

        setCurrentOffset(-totalOffset);

        setTimeout(() => {
          onSpinComplete();
        }, 2000);
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete]);

  return (
    <div className="relative w-80 h-96 overflow-hidden bg-white rounded-lg border-2 border-gray-300 shadow-lg">
      {/* Простая рамка */}
      <div className="absolute inset-1 rounded border border-gray-200"></div>

      <div
        ref={reelRef}
        className={`transition-transform ${isSpinning ? 'duration-[2000ms] ease-out' : 'duration-0'}`}
        style={{ transform: `translateY(${currentOffset}px)` }}
      >
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full border-b border-gray-200 ${getRarityColor(item.rarity)} flex items-center justify-center relative`}
            >
              {/* Изображение или заглушка */}
              {!imageErrors.has(item.id) ? (
                <img
                  src={getItemImageUrl(item.image_url, item.name)}
                  alt={item.name}
                  className="w-full h-full object-contain p-3"
                  onError={() => {
                    console.log(`Image error for item ${item.id}: ${item.image_url}`);
                    handleImageError(item.id);
                  }}
                  onLoad={() => {
                    console.log(`Image loaded for item ${item.id}: ${item.image_url}`);
                  }}
                />
              ) : (
                <>
                  {console.log(`Showing placeholder for item ${item.id}. Has error: ${imageErrors.has(item.id)}, Has URL: ${!!item.image_url}, URL: ${item.image_url}`)}
                  <PlaceholderImage className="w-full h-full" item={item} />
                </>
              )}

              {/* Название внизу */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-sm text-gray-700 font-medium bg-white/90 rounded px-2 py-1 truncate">
                  {item.name.length > 16 ? `${item.name.substring(0, 16)}...` : item.name}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Указатель результата - простая линия */}
      <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-gray-800 pointer-events-none z-30"
           style={{ transform: 'translateY(-50%)' }} />
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
      console.log('Raw slot items data:', slotItemsData.data.items);
      const convertedItems = slotItemsData.data.items.map(convertToSlotItem);
      console.log('Converted slot items:', convertedItems);
      setDisplayItems(convertedItems);
    }
  }, [slotItemsData]);

  const canPlay = !isSpinning && !isLoading && auth.user && Number(auth.user.balance || 0) >= 10 && displayItems.length > 0;

  const handleSpin = async () => {
    if (!canPlay) {
      console.log('Cannot play:', { isSpinning, isLoading, hasUser: !!auth.user, balance: auth.user?.balance, itemsLoaded: displayItems.length > 0 });
      return;
    }

    console.log('Starting spin...');
    try {
      setIsSpinning(true);
      setShowResult(false);

      const response = await playSlot().unwrap();
      console.log('Spin response:', response);

      if (response.success && response.result) {
        setResult(response.result.items);

        setTimeout(() => {
          console.log('Resetting spin state...');
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
      console.error('Ошибка при игре в слот:', err);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleReelComplete = () => {
    // Упрощенная логика - основной сброс состояния происходит в handleSpin через таймаут
  };

  if (isLoadingItems) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div className="text-gray-700 text-lg">Загружаем предметы...</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg p-8 border border-red-200 shadow-lg">
          <div className="text-red-600 text-xl font-semibold mb-2">Ошибка загрузки</div>
          <div className="text-gray-600">Попробуйте обновить страницу</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Простой заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Слот-машина</h1>
          <p className="text-gray-600 text-lg">Соберите 3 одинаковых предмета для выигрыша</p>
        </div>

        {/* Игровая область */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            {/* Игровое поле */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="flex justify-center gap-8 mb-4">
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
              <div className="mb-6 p-6 rounded-lg bg-gray-50 border border-gray-200">
                <div className="text-center">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-green-600">
                      <div className="text-3xl mb-4">🎉 Поздравляем!</div>
                      <div className="text-xl mb-4 font-semibold">Вы выиграли джекпот!</div>
                      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                        <div className="text-gray-700 mb-2 font-medium">Выигрышный предмет:</div>
                        <div className="text-2xl font-bold text-gray-900 mb-2">{result[0]?.name}</div>
                        <div className="text-lg text-green-600 font-semibold">
                          Стоимость: <Monetary value={Number(result[0]?.price || 0)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-600 text-xl mb-3">Не повезло в этот раз</div>
                      <div className="text-gray-500 mb-4">Попробуйте еще раз!</div>
                      <div className="bg-gray-100 rounded p-4 border">
                        <div className="text-gray-700 font-medium">
                          Выпало: {result.map(item => item?.name?.split(' ')[0] || '?').join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о игре */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-blue-600 text-2xl">🎰</div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium">Стоимость спина</div>
                    <div className="text-gray-900 text-2xl font-bold">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-green-600 text-2xl">💰</div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium">Ваш баланс</div>
                    <div className="text-gray-900 text-2xl font-bold">
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
                className={`px-12 py-4 rounded-lg font-semibold text-lg transition-all ${
                  canPlay
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Крутится...</span>
                  </span>
                ) : (
                  <span>Играть (10 ₽)</span>
                )}
              </button>

              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 max-w-md mx-auto">
                  <div className="font-semibold">Недостаточно средств для игры</div>
                </div>
              )}

              {!auth.user && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 max-w-md mx-auto">
                  <div className="font-semibold">Войдите в аккаунт для игры</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 max-w-md mx-auto">
                  <div className="font-semibold">Загружаем предметы...</div>
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
