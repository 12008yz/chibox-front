import React, { useState, useEffect, useRef } from 'react';
import { usePlaySlotMutation, useGetSlotItemsQuery } from '../features/user/userApi';
import { useAuth } from '../store/hooks';
import toast from 'react-hot-toast';
import Monetary from '../components/Monetary';
import type { SlotItem } from '../types/api';

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

// Создаем улучшенную заглушку для изображений с информацией о предмете
const PlaceholderImage: React.FC<{
  className?: string;
  item: SlotItem;
}> = ({ className = "w-full h-full", item }) => {
  // Получаем цвет на основе редкости
  const rarityGradient = getRarityColor(item.rarity);
  const rarityGlow = getRarityGlow(item.rarity);

  // Определяем иконку в зависимости от типа предмета
  const getItemIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('ak-47') || nameLower.includes('m4a4') || nameLower.includes('m4a1')) return '🔫';
    if (nameLower.includes('awp') || nameLower.includes('ssg')) return '🎯';
    if (nameLower.includes('knife') || nameLower.includes('karambit') || nameLower.includes('bayonet')) return '🔪';
    if (nameLower.includes('gloves') || nameLower.includes('перчатки')) return '🧤';
    if (nameLower.includes('case') || nameLower.includes('кейс')) return '📦';
    if (nameLower.includes('glock') || nameLower.includes('usp') || nameLower.includes('p250')) return '🔫';
    return '🎮'; // дефолтная иконка
  };

  return (
    <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center border border-gray-700 relative overflow-hidden ${rarityGlow}`}>
      {/* Фоновый градиент редкости */}
      <div className={`absolute inset-0 bg-gradient-to-br ${rarityGradient} opacity-20`}></div>

      {/* Анимированный фон */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>

      {/* Основной контент */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-2 text-center">
        {/* Иконка предмета */}
        <div className="text-4xl mb-2 opacity-80">
          {getItemIcon(item.name)}
        </div>

        {/* Название предмета */}
        <div className="text-xs text-cyan-100 font-semibold mb-1 px-1 leading-tight">
          {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
        </div>

        {/* Цена */}
        <div className="text-sm text-yellow-300 font-bold">
          <Monetary value={Number(item.price)} />
        </div>

        {/* Индикатор загрузки изображения */}
        <div className="text-xs text-gray-400 mt-1 opacity-60">
          🖼️ Изображение
        </div>
      </div>

      {/* Декоративные элементы */}
      <div className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
    </div>
  );
};

// Функции для работы с редкостью в неоновых цветах
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'from-red-500 to-pink-500';
    case 'classified': return 'from-purple-500 to-indigo-500';
    case 'restricted': return 'from-blue-500 to-cyan-500';
    case 'milspec': return 'from-green-500 to-emerald-500';
    case 'industrial': return 'from-yellow-500 to-orange-500';
    case 'consumer': return 'from-gray-500 to-gray-600';
    case 'exotic': return 'from-pink-500 to-purple-500';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getRarityGlow = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'shadow-red-500/50';
    case 'classified': return 'shadow-purple-500/50';
    case 'restricted': return 'shadow-blue-500/50';
    case 'milspec': return 'shadow-green-500/50';
    case 'industrial': return 'shadow-yellow-500/50';
    case 'consumer': return 'shadow-gray-500/50';
    case 'exotic': return 'shadow-pink-500/50';
    default: return 'shadow-gray-500/50';
  }
};

const getRarityDisplayName = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert': return 'СЕКРЕТ';
    case 'classified': return 'ЗАСЕКР';
    case 'restricted': return 'ЗАПРЕЩ';
    case 'milspec': return 'АРМЕЙ';
    case 'industrial': return 'ПРОМ';
    case 'consumer': return 'ПОТРЕБ';
    case 'contraband': return 'КОНТР';
    case 'exotic': return 'ЭКЗОТ';
    default: return 'ОБЫЧН';
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
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const reelRef = useRef<HTMLDivElement>(null);

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleImageLoad = (itemId: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleImageStart = (itemId: string) => {
    setImageLoading(prev => new Set(prev).add(itemId));
  };

  useEffect(() => {
    if (isSpinning && finalItem) {
      const delayTimeout = setTimeout(() => {
        const spins = 5;
        const itemHeight = 160; // Обновлено под новую высоту элементов (h-40)
        const finalIndex = items.findIndex(item => item.id === finalItem.id);
        const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight;

        setCurrentOffset(-totalOffset);

        setTimeout(() => {
          onSpinComplete();
        }, 2500);
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete]);

  return (
    <div className="relative w-96 h-96 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-cyan-500/50 shadow-2xl shadow-cyan-500/20">
      {/* Неоновая рамка */}
      <div className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30 animate-pulse"></div>

      {/* Внутренние неоновые линии */}
      <div className="absolute inset-2 rounded-xl border border-cyan-300/20"></div>

      <div
        ref={reelRef}
        className={`transition-transform ${isSpinning ? 'duration-[2500ms] ease-out' : 'duration-0'}`}
        style={{ transform: `translateY(${currentOffset}px)` }}
      >
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full relative overflow-hidden border-b border-gray-700/50 bg-gray-900/80 ${getRarityGlow(item.rarity)} hover:scale-105 transition-all duration-300`}
            >
              {/* Фоновый градиент редкости */}
              <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20`}></div>

              {/* Изображение предмета или улучшенная заглушка */}
              {!imageErrors.has(item.id) && item.image_url ? (
                <div className="relative w-full h-full">
                  {/* Загрузочный индикатор */}
                  {imageLoading.has(item.id) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 z-5">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                  )}

                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-contain z-10 p-2"
                    onLoad={() => handleImageLoad(item.id)}
                    onLoadStart={() => handleImageStart(item.id)}
                    onError={() => handleImageError(item.id)}
                    style={{
                      backgroundColor: 'transparent',
                      filter: 'drop-shadow(0 0 12px rgba(0, 255, 255, 0.4))'
                    }}
                  />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlaceholderImage className="w-full h-full" item={item} />
                </div>
              )}

              {/* Overlay с информацией */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-between p-2 z-20">
                {/* Редкость бейдж в верхнем углу */}
                <div className="flex justify-end">
                  <div className={`px-2 py-1 rounded-md bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-xs font-bold shadow-lg`}>
                    {getRarityDisplayName(item.rarity)}
                  </div>
                </div>

                {/* Название и цена внизу */}
                <div className="text-center">
                  <div className="text-xs text-cyan-100 font-semibold drop-shadow-lg mb-1 truncate">
                    {item.name.length > 16 ? `${item.name.substring(0, 16)}...` : item.name}
                  </div>
                  <div className="text-sm text-yellow-300 font-bold drop-shadow-lg">
                    <Monetary value={Number(item.price)} />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Указатель результата - неоновая линия */}
      <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent pointer-events-none shadow-lg shadow-cyan-400/50 z-30 animate-pulse"
           style={{ transform: 'translateY(-50%)' }} />

      {/* Боковые неоновые подсветки */}
      <div className="absolute top-1/2 left-0 w-1.5 h-12 bg-cyan-400 pointer-events-none rounded-r z-30 shadow-lg shadow-cyan-400/50"
           style={{ transform: 'translateY(-50%)' }} />
      <div className="absolute top-1/2 right-0 w-1.5 h-12 bg-cyan-400 pointer-events-none rounded-l z-30 shadow-lg shadow-cyan-400/50"
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
      setDisplayItems(slotItemsData.data.items.map(convertToSlotItem));
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto mb-4 shadow-lg shadow-cyan-400/50"></div>
          <div className="text-cyan-300 text-xl font-bold">Загружаем предметы слота...</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-red-500/50 shadow-2xl shadow-red-500/20">
          <div className="text-red-400 text-xl font-bold mb-4">❌ Ошибка загрузки предметов</div>
          <div className="text-gray-300">Попробуйте обновить страницу</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 relative overflow-hidden">
      {/* Фоновые неоновые элементы */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute w-32 h-32 bg-cyan-400 rounded-full top-10 left-10 animate-pulse blur-xl"></div>
        <div className="absolute w-24 h-24 bg-purple-500 rounded-full top-32 right-20 animate-pulse delay-1000 blur-xl"></div>
        <div className="absolute w-40 h-40 bg-blue-500 rounded-full bottom-20 left-1/4 animate-pulse delay-2000 blur-xl"></div>
        <div className="absolute w-20 h-20 bg-green-400 rounded-full bottom-32 right-10 animate-pulse delay-500 blur-xl"></div>
        <div className="absolute w-16 h-16 bg-pink-500 rounded-full top-1/2 left-1/3 animate-pulse delay-1500 blur-xl"></div>
        <div className="absolute w-28 h-28 bg-yellow-400 rounded-full top-20 right-1/3 animate-pulse delay-300 blur-xl"></div>
      </div>

      {/* Сетка киберспорт стиля */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Заголовок в киберспорт стиле */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-400/30 border-2 border-cyan-300/50">
              <span className="text-white text-4xl">🎰</span>
            </div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 drop-shadow-2xl"
                style={{ fontFamily: 'Impact, Arial Black, sans-serif', textShadow: '0 0 30px rgba(0, 255, 255, 0.5)' }}>
              CYBER SLOTS
            </h1>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 border-2 border-purple-300/50">
              <span className="text-white text-4xl">💎</span>
            </div>
          </div>
          <p className="text-cyan-300 text-xl font-bold drop-shadow-lg mb-4">Элитная слот-машина CS2 • Выиграй джекпот</p>
          <div className="mt-6 inline-flex items-center gap-4 bg-gray-800/60 backdrop-blur-lg px-8 py-4 rounded-2xl border-2 border-cyan-400/50 shadow-2xl shadow-cyan-400/20">
            <span className="text-yellow-400 text-3xl animate-pulse">⚡</span>
            <span className="text-cyan-100 font-bold text-xl">3 ОДИНАКОВЫХ = ДЖЕКПОТ!</span>
            <span className="text-yellow-400 text-3xl animate-pulse">⚡</span>
          </div>
        </div>

        {/* Основной игровой блок */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/40 backdrop-blur-lg rounded-3xl p-8 border-2 border-gray-700/50 shadow-2xl">
            {/* Широкое игровое поле */}
            <div className="bg-gray-900/60 rounded-2xl p-8 mb-8 border-2 border-cyan-500/30 shadow-inner shadow-cyan-500/10">
              <div className="flex justify-center gap-8 mb-6">
                {[0, 1, 2].map((reelIndex) => (
                  <Reel
                    key={reelIndex}
                    items={displayItems}
                    isSpinning={isSpinning}
                    finalItem={result[reelIndex]}
                    delay={reelIndex * 300}
                    onSpinComplete={handleReelComplete}
                  />
                ))}
              </div>

              {/* Неоновая выигрышная линия */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent h-2 w-full max-w-4xl rounded-full shadow-lg shadow-cyan-400/50 animate-pulse"></div>
              </div>
            </div>

            {/* Результат */}
            {showResult && result.length === 3 && (
              <div className="mb-8 p-8 rounded-2xl bg-gray-800/60 backdrop-blur-lg border-2 border-gray-600/50 shadow-2xl">
                <div className="text-center text-white">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-cyan-300 font-black">
                      <div className="text-5xl mb-6 animate-bounce">🎉 ДЖЕКПОТ! 🎉</div>
                      <div className="text-3xl mb-4 font-bold text-yellow-400">Три одинаковых предмета!</div>
                      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 mt-6 border-2 border-yellow-400/50 shadow-2xl shadow-yellow-400/20">
                        <div className="text-xl text-yellow-300 mb-3 font-bold">Вы выиграли:</div>
                        <div className="text-3xl font-black text-yellow-100 mb-3">{result[0]?.name}</div>
                        <div className="text-xl text-yellow-300 font-bold">Стоимость: <Monetary value={Number(result[0]?.price || 0)} /></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-orange-400 text-3xl mb-4 font-bold">🎰 Не повезло в этот раз</div>
                      <div className="text-lg text-gray-300 mb-6 font-semibold">
                        Попробуйте еще раз! Удача обязательно повернется к вам лицом.
                      </div>
                      <div className="bg-orange-500/20 rounded-2xl p-6 border-2 border-orange-400/30 shadow-lg">
                        <div className="text-lg text-orange-300 font-bold">
                          Выпало: {result.map(item => item?.name?.split(' ')[0] || '?').join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Информация о игре */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-yellow-400/50 shadow-xl shadow-yellow-400/10">
                <div className="flex items-center space-x-6">
                  <div className="text-yellow-400 text-4xl">🎰</div>
                  <div>
                    <div className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Стоимость спина</div>
                    <div className="text-white text-3xl font-black">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-lg rounded-2xl p-8 border-2 border-green-400/50 shadow-xl shadow-green-400/10">
                <div className="flex items-center space-x-6">
                  <div className="text-green-400 text-4xl">💰</div>
                  <div>
                    <div className="text-green-400 text-sm font-bold uppercase tracking-wider">Ваш баланс</div>
                    <div className="text-white text-3xl font-black"><Monetary value={Number(auth.user?.balance || 0)} /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка спина в киберспорт стиле */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`px-24 py-8 rounded-2xl font-black text-3xl transition-all transform shadow-2xl border-4 ${
                  canPlay
                    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 text-white border-cyan-300 hover:shadow-cyan-400/50 hover:scale-105 active:scale-95 shadow-cyan-400/30'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed border-gray-600'
                }`}
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  textShadow: canPlay ? '0 0 10px rgba(0, 255, 255, 0.8)' : 'none'
                }}
              >
                {isLoading || isSpinning ? (
                  <span className="flex items-center gap-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white"></div>
                    <span>КРУТИТСЯ...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-4">
                    🎰 <span>СТАРТ (10 ₽)</span> 🎰
                  </span>
                )}
              </button>

              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-8 p-6 bg-red-500/20 border-2 border-red-400/50 rounded-2xl text-red-300 max-w-md mx-auto shadow-xl shadow-red-400/10">
                  <div className="font-bold text-xl">❌ Недостаточно средств для игры</div>
                </div>
              )}

              {!auth.user && (
                <div className="mt-8 p-6 bg-yellow-500/20 border-2 border-yellow-400/50 rounded-2xl text-yellow-300 max-w-md mx-auto shadow-xl shadow-yellow-400/10">
                  <div className="font-bold text-xl">🔐 Войдите в аккаунт для игры</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-8 p-6 bg-blue-500/20 border-2 border-blue-400/50 rounded-2xl text-blue-300 max-w-md mx-auto shadow-xl shadow-blue-400/10">
                  <div className="font-bold text-xl">⏳ Загружаем предметы...</div>
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
