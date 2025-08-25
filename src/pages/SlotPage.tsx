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

// Тёмная игровая заглушка для изображений
const PlaceholderImage: React.FC<{
  className?: string;
  item: SlotItem;
}> = ({ className = "w-full h-full", item }) => {
  return (
    <div className={`${className} bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex flex-col items-center justify-center border border-gray-700 shadow-inner`}>
      <div className="text-4xl mb-3 text-purple-400 filter drop-shadow-lg">📦</div>
      <div className="text-sm text-gray-300 font-semibold px-3 text-center">
        {item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}
      </div>
      <div className="text-lg text-yellow-400 font-bold mt-2 drop-shadow-lg">
        <Monetary value={Number(item.price)} />
      </div>
    </div>
  );
};

// Игровые цвета редкости с неоновыми эффектами
const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'covert':
    case 'contraband': return 'border-red-500 bg-gradient-to-br from-red-900/30 to-red-800/30 shadow-lg shadow-red-500/20';
    case 'classified': return 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-purple-800/30 shadow-lg shadow-purple-500/20';
    case 'restricted': return 'border-blue-500 bg-gradient-to-br from-blue-900/30 to-blue-800/30 shadow-lg shadow-blue-500/20';
    case 'milspec': return 'border-green-500 bg-gradient-to-br from-green-900/30 to-green-800/30 shadow-lg shadow-green-500/20';
    case 'industrial': return 'border-yellow-500 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 shadow-lg shadow-yellow-500/20';
    case 'consumer': return 'border-gray-500 bg-gradient-to-br from-gray-800/30 to-gray-700/30 shadow-lg shadow-gray-500/20';
    case 'exotic': return 'border-pink-500 bg-gradient-to-br from-pink-900/30 to-pink-800/30 shadow-lg shadow-pink-500/20';
    default: return 'border-gray-500 bg-gradient-to-br from-gray-800/30 to-gray-700/30 shadow-lg shadow-gray-500/20';
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
      // Отключаем transition и сбрасываем позицию в 0
      setUseTransition(false);
      setCurrentOffset(0);

      const delayTimeout = setTimeout(() => {
        // Включаем transition и запускаем анимацию
        setTimeout(() => {
          setUseTransition(true);
          const spins = 5;
          const itemHeight = 160;
          const finalIndex = items.findIndex(item => item.id === finalItem.id);
          // Вычитаем смещение на 80px, поскольку указатель сместился вверх
          const totalOffset = spins * items.length * itemHeight + finalIndex * itemHeight - 80;

          setCurrentOffset(-totalOffset);

          setTimeout(() => {
            onSpinComplete();
          }, 2000);
        }, 50); // 50ms задержка для применения сброса
      }, delay);

      return () => clearTimeout(delayTimeout);
    }
  }, [isSpinning, finalItem, delay, items, onSpinComplete]);

  return (
    <div className="relative w-80 h-96 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/25 backdrop-blur-sm">
      {/* Игровая рамка с неоновым свечением */}
      <div className="absolute inset-1 rounded-lg border border-cyan-400/30 shadow-inner shadow-cyan-400/20"></div>

      {/* Анимированная граница */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-clip-border opacity-50 animate-pulse"></div>

      <div
        ref={reelRef}
        className={`${useTransition ? 'transition-transform' : ''} ${isSpinning && useTransition ? 'duration-[2000ms] ease-out' : 'duration-0'}`}
        style={{ transform: `translateY(${currentOffset}px)` }}
      >
        {Array.from({ length: 8 }, (_, repeatIndex) =>
          items.map((item) => (
            <div
              key={`${repeatIndex}-${item.id}`}
              className={`h-40 w-full border-b border-gray-700/50 ${getRarityColor(item.rarity)} flex items-center justify-center relative transition-all duration-300 hover:scale-105`}
            >
              {/* Изображение или заглушка */}
              {!imageErrors.has(item.id) ? (
                <img
                  src={getItemImageUrl(item.image_url, item.name)}
                  alt={item.name}
                  className="w-full h-full object-contain p-3 filter drop-shadow-lg transition-transform duration-300"
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

              {/* Название внизу с неоновым эффектом */}
              <div className="absolute bottom-2 left-2 right-2 text-center">
                <div className="text-sm text-white font-bold bg-gradient-to-r from-black/80 via-gray-900/90 to-black/80 rounded-lg px-2 py-1 truncate border border-gray-600/50 shadow-lg backdrop-blur-sm">
                  {item.name.length > 16 ? `${item.name.substring(0, 16)}...` : item.name}
                </div>
              </div>

              {/* Редкость индикатор */}
              <div className="absolute top-2 right-2">
                <div className={`w-3 h-3 rounded-full ${item.rarity === 'covert' || item.rarity === 'contraband' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                  item.rarity === 'classified' ? 'bg-purple-500 shadow-lg shadow-purple-500/50' :
                  item.rarity === 'restricted' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' :
                  item.rarity === 'milspec' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                  item.rarity === 'industrial' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' :
                  'bg-gray-500 shadow-lg shadow-gray-500/50'} animate-pulse`}>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Центральный указатель с неоновым эффектом - смещён вверх для правильного указания на результат */}
      <div className="absolute left-4 right-4 h-1 bg-gradient-to-r from-cyan-400 via-white to-cyan-400 pointer-events-none z-30 rounded-full shadow-lg shadow-cyan-400/50 animate-pulse"
           style={{ top: 'calc(50% - 20px)', transform: 'translateY(-50%)' }}>
        {/* Центральный индикатор */}
        <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-white rounded-full border-2 border-cyan-400 shadow-lg shadow-cyan-400/70 animate-ping"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-6 shadow-lg shadow-purple-500/30"></div>
          <div className="text-white text-xl font-bold gaming-font tracking-wider">Загружаем предметы...</div>
          <div className="text-purple-300 text-sm mt-2">Подготавливаем игру</div>
        </div>
      </div>
    );
  }

  if (itemsError || !slotItemsData?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-8 border border-red-500/50 shadow-2xl shadow-red-500/25">
          <div className="text-red-400 text-2xl font-bold mb-4 gaming-font">⚠️ ОШИБКА СИСТЕМЫ</div>
          <div className="text-gray-300 mb-4">Не удалось загрузить данные игры</div>
          <button
            onClick={() => window.location.reload()}
            className="gaming-button gaming-button-secondary"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-8 relative overflow-hidden">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Киберспорт заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-6 gaming-font tracking-wider drop-shadow-lg">
            🎰 СЛОТ-МАШИНА
          </h1>
          <div className="text-lg text-gray-300 mb-4 font-medium">
            Соберите <span className="text-yellow-400 font-bold">3 одинаковых предмета</span> для победы
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto rounded-full shadow-lg shadow-purple-500/50"></div>
        </div>

        {/* Главная игровая область */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/40 via-purple-900/10 to-gray-800/40 rounded-2xl p-8 shadow-2xl border border-purple-500/30 backdrop-blur-sm relative overflow-hidden">
            {/* Анимированная граница */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-cyan-500/20 to-purple-500/0 animate-pulse"></div>

            {/* Игровое поле */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 rounded-xl p-8 mb-8 border border-gray-700/50 shadow-inner backdrop-blur-sm relative">
              {/* Неоновая подсветка поля */}
              <div className="absolute inset-0 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-400/20"></div>

              <div className="flex justify-center gap-8 mb-6">
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

            {/* Результат с неоновыми эффектами */}
            {showResult && result.length === 3 && (
              <div className="mb-8 p-8 rounded-xl bg-gradient-to-br from-gray-800/50 to-purple-900/30 border border-purple-500/50 shadow-2xl backdrop-blur-sm animate-drop-bounce">
                <div className="text-center">
                  {result[0]?.id === result[1]?.id && result[1]?.id === result[2]?.id ? (
                    <div className="text-center">
                      <div className="text-6xl mb-6 animate-bounce">🎉</div>
                      <div className="text-4xl mb-6 font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 gaming-font tracking-wider">
                        ДЖЕКПОТ!
                      </div>
                      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-8 border border-yellow-500/50 shadow-2xl shadow-yellow-500/25">
                        <div className="text-gray-300 mb-4 font-bold text-xl">Выигрышный предмет:</div>
                        <div className="text-3xl font-black text-white mb-4 drop-shadow-lg">{result[0]?.name}</div>
                        <div className="text-2xl text-yellow-400 font-black drop-shadow-lg">
                          Стоимость: <Monetary value={Number(result[0]?.price || 0)} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-4 font-bold text-gray-300 gaming-font">НЕ ПОВЕЗЛО</div>
                      <div className="text-purple-300 mb-6 text-lg">Попробуйте еще раз!</div>
                      <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg p-6 border border-gray-600/50">
                        <div className="text-gray-300 font-bold text-lg">
                          Выпало: {result.map(item => item?.name?.split(' ')[0] || '?').join(' • ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Игровая информация */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 border border-blue-500/50 shadow-lg shadow-blue-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <div className="text-cyan-400 text-4xl filter drop-shadow-lg animate-pulse">🎰</div>
                  <div>
                    <div className="text-cyan-300 text-sm font-bold gaming-font tracking-wider">СТОИМОСТЬ СПИНА</div>
                    <div className="text-white text-3xl font-black gaming-font drop-shadow-lg">10 ₽</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/50 shadow-lg shadow-green-500/20 backdrop-blur-sm">
                <div className="flex items-center space-x-4">
                  <div className="text-yellow-400 text-4xl filter drop-shadow-lg animate-pulse gaming-coin-icon">💰</div>
                  <div>
                    <div className="text-green-300 text-sm font-bold gaming-font tracking-wider">ВАШ БАЛАНС</div>
                    <div className="text-white text-3xl font-black gaming-font drop-shadow-lg">
                      <Monetary value={Number(auth.user?.balance || 0)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка спина с киберспорт эффектами */}
            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={!canPlay}
                className={`relative px-16 py-6 rounded-xl font-black text-xl gaming-font tracking-wider transition-all duration-300 overflow-hidden ${
                  canPlay
                    ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 transform hover:scale-105 border border-purple-400/50'
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-400 cursor-not-allowed border border-gray-600/50'
                }`}
              >
                {/* Анимированный фон кнопки */}
                {canPlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-0 hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                )}

                <span className="relative z-10 flex items-center gap-4">
                  {isLoading || isSpinning ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                      <span>КРУТИТСЯ...</span>
                    </>
                  ) : (
                    <>
                      <span>🎲</span>
                      <span>ИГРАТЬ (10 ₽)</span>
                      <span>🎲</span>
                    </>
                  )}
                </span>
              </button>

              {/* Сообщения об ошибках с игровым стилем */}
              {!canPlay && auth.user && Number(auth.user.balance || 0) < 10 && (
                <div className="mt-8 p-6 bg-gradient-to-br from-red-900/30 to-red-800/30 border border-red-500/50 rounded-xl text-red-300 max-w-md mx-auto shadow-lg shadow-red-500/20">
                  <div className="font-bold text-lg gaming-font">⚠️ НЕДОСТАТОЧНО СРЕДСТВ</div>
                  <div className="text-sm mt-2">Пополните баланс для продолжения игры</div>
                </div>
              )}

              {!auth.user && (
                <div className="mt-8 p-6 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-xl text-yellow-300 max-w-md mx-auto shadow-lg shadow-yellow-500/20">
                  <div className="font-bold text-lg gaming-font">🔐 ВХОД ТРЕБУЕТСЯ</div>
                  <div className="text-sm mt-2">Войдите в аккаунт для игры</div>
                </div>
              )}

              {displayItems.length === 0 && (
                <div className="mt-8 p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/50 rounded-xl text-blue-300 max-w-md mx-auto shadow-lg shadow-blue-500/20">
                  <div className="font-bold text-lg gaming-font">⏳ ЗАГРУЗКА</div>
                  <div className="text-sm mt-2">Загружаем предметы...</div>
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
