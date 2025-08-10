import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../store/hooks';
import {
  useGetUserInventoryQuery,
  useSellItemMutation,
  useExchangeItemForSubscriptionMutation,
  useGetUserSubscriptionQuery
} from '../features/user/userApi';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Monetary from '../components/Monetary';
import type { UserInventoryItem, Item } from '../types/api';

// Создаем SVG заглушку для изображений
const PlaceholderImage: React.FC<{ className?: string }> = ({ className = "w-full h-32" }) => (
  <div className={`${className} bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center`}>
    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

// Компонент карточки предмета
const ItemCard: React.FC<{
  itemGroup: { item: Item, instances: UserInventoryItem[], count: number };
  onSellItem: (itemId: string, itemName: string, sellPrice: number) => void;
  onExchangeItem: (itemId: string, itemName: string, itemPrice: number) => void;
  isLoading?: boolean;
}> = ({ itemGroup, onSellItem, onExchangeItem, isLoading = false }) => {
  const [imageError, setImageError] = useState(false);
  const { item, count } = itemGroup;
  // Используем price как sellPrice (цена продажи = 70% от рыночной стоимости)
  const itemPrice = parseFloat(item.price || '0');
  const sellPrice = itemPrice * 0.7; // 70% от цены предмета

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'covert':
      case 'contraband': return 'from-yellow-500 to-orange-500';
      case 'classified': return 'from-purple-500 to-pink-500';
      case 'restricted': return 'from-blue-500 to-cyan-500';
      case 'milspec': return 'from-green-500 to-emerald-500';
      case 'industrial':
      case 'consumer': return 'from-gray-500 to-slate-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getRarityDisplayName = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'covert': return 'СЕКРЕТНОЕ';
      case 'classified': return 'ЗАСЕКРЕЧЕННОЕ';
      case 'restricted': return 'ЗАПРЕЩЁННОЕ';
      case 'milspec': return 'АРМЕЙСКОЕ';
      case 'industrial': return 'ПРОМЫШЛЕННОЕ';
      case 'consumer': return 'ПОТРЕБИТЕЛЬСКОЕ';
      case 'contraband': return 'КОНТРАБАНДА';
      default: return rarity?.toUpperCase() || 'ОБЫЧНОЕ';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl p-4 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
      <div className="relative">
        {/* Изображение предмета */}
        <div className="relative mb-3">
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20 rounded-lg`}></div>
          {!imageError && item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-32 object-cover rounded-lg relative z-10"
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderImage />
          )}
          {/* Редкость бейдж */}
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-md bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-xs font-bold z-20`}>
            {getRarityDisplayName(item.rarity)}
          </div>
          {/* Количество предметов */}
          {count > 1 && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-bold z-20">
              x{count}
            </div>
          )}
        </div>

        {/* Информация о предмете */}
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-xs">
              {item.weapon_type}
            </p>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-purple-300">Цена:</span>
            <span className="text-purple-300 font-semibold">
              <Monetary value={itemPrice} />
            </span>
          </div>

          {sellPrice > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-green-300">Продажа:</span>
              <span className="text-green-300 font-semibold">
                <Monetary value={sellPrice} />
              </span>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-4 space-y-2">
          {/* Кнопка продажи */}
          {sellPrice > 0 && (
            <button
              onClick={() => onSellItem(item.id, item.name, sellPrice)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Продаём...
                </div>
              ) : (
                `Продать 1 шт. за ${Math.round(sellPrice)}₽`
              )}
            </button>
          )}

          {/* Кнопка обмена на подписку */}
          <button
            onClick={() => onExchangeItem(item.id, item.name, itemPrice)}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Обмениваем...
              </div>
            ) : (
              'Обменять на подписку'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ExchangePage: React.FC = () => {
  const auth = useAuth();
  const [selectedTab, setSelectedTab] = useState<'sell' | 'exchange'>('sell');
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');

  // API hooks
  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    error: inventoryError,
    refetch: refetchInventory
  } = useGetUserInventoryQuery({
    page: 1,
    limit: 100,
    status: 'inventory'
  });

  const { data: subscriptionData } = useGetUserSubscriptionQuery();

  const [sellItem, { isLoading: isSellingItem }] = useSellItemMutation();
  const [exchangeItem, { isLoading: isExchangingItem }] = useExchangeItemForSubscriptionMutation();

  // Группировка и фильтрация предметов
  const groupedAndFilteredItems = React.useMemo(() => {
    if (!inventoryData?.data?.items) return [];

    // Сначала фильтруем
    const filtered = inventoryData.data.items.filter((item: UserInventoryItem) => {
      const matchesSearch = item.item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || item.item.rarity?.toLowerCase() === rarityFilter.toLowerCase();
      const isAvailable = item.status === 'inventory'; // Только предметы в инвентаре
      const hasValidAction = selectedTab === 'sell'
        ? parseFloat(item.item.price || '0') > 0
        : true; // Все предметы со статусом inventory можно обменять на подписку

      return matchesSearch && matchesRarity && hasValidAction && isAvailable;
    });

    // Группируем по типу предмета
    const grouped = filtered.reduce((acc, item) => {
      const key = item.item.id; // Группируем по ID шаблона предмета
      if (!acc[key]) {
        acc[key] = {
          item: item.item,
          instances: [],
          count: 0
        };
      }
      acc[key].instances.push(item);
      acc[key].count++;
      return acc;
    }, {} as Record<string, { item: Item, instances: UserInventoryItem[], count: number }>);

    return Object.values(grouped);
  }, [inventoryData, searchTerm, rarityFilter, selectedTab]);

  // Обработчик продажи предмета
  const handleSellItem = async (itemId: string, itemName: string, sellPrice: number) => {
    try {
      if (!auth.user?.id) {
        toast.error('Необходимо авторизоваться для продажи предметов');
        return;
      }

      // Защита от множественных кликов
      if (isSellingItem) {
        toast.error('Дождитесь завершения предыдущей продажи');
        return;
      }

      console.log('Selling item:', { itemId, itemName, sellPrice, userId: auth.user.id });

      // Находим группу предметов
      const itemGroup = groupedAndFilteredItems.find(group => group.item.id === itemId);
      if (!itemGroup || itemGroup.instances.length === 0) {
        toast.error('Предмет не найден в инвентаре');
        return;
      }

      // Берем первый доступный экземпляр для продажи
      const availableInstances = itemGroup.instances.filter(instance => instance.status === 'inventory');
      if (availableInstances.length === 0) {
        toast.error('Нет доступных для продажи экземпляров этого предмета');
        return;
      }

      const inventoryItem = availableInstances[0];
      console.log('Using inventory item ID:', inventoryItem.id, 'Available instances:', availableInstances.length);

      const result = await sellItem({ itemId: inventoryItem.id }).unwrap();
      if (result.success) {
        toast.success(`Предмет "${itemName}" (1 шт.) продан за ${Math.round(sellPrice)}₽!`);
        // Оптимистичное обновление происходит автоматически в userApi
      }
    } catch (error: any) {
      console.error('Ошибка при продаже предмета:', error);
      const errorMessage = error?.data?.message || error?.message || 'Ошибка при продаже предмета';
      toast.error(errorMessage);
    }
  };

  // Обработчик обмена предмета на подписку
  const handleExchangeItem = async (itemId: string, itemName: string, itemPrice: number) => {
    try {
      if (!auth.user?.id) {
        toast.error('Необходимо авторизоваться для обмена предметов');
        return;
      }

      console.log('Exchanging item:', { itemId, itemName, itemPrice, userId: auth.user.id });

      // Находим группу предметов
      const itemGroup = groupedAndFilteredItems.find(group => group.item.id === itemId);
      if (!itemGroup || itemGroup.instances.length === 0) {
        toast.error('Предмет не найден в инвентаре');
        return;
      }

      // Берем первый доступный экземпляр для обмена
      const inventoryItem = itemGroup.instances[0];
      if (inventoryItem.status !== 'inventory') {
        toast.error('Предмет недоступен для обмена');
        return;
      }

      console.log('Using inventory item ID for exchange:', inventoryItem.id);
      const result = await exchangeItem({
        userId: auth.user.id,
        itemId: inventoryItem.item.id, // Для обмена используем ID предмета, как было изначально
        tierId: '1' // Базовый уровень подписки, можно сделать динамическим
      }).unwrap();

      if (result.success) {
        toast.success(`Предмет "${itemName}" обменян на подписку!`);
        // Оптимистичное обновление происходит автоматически в userApi
      }
    } catch (error: any) {
      console.error('Ошибка при обмене предмета:', error);
      const errorMessage = error?.data?.message || error?.message || 'Ошибка при обмене предмета';
      toast.error(errorMessage);
    }
  };

  const rarities = ['all', 'consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert'];

  return (
    <div className="min-h-screen bg-[#151225] text-white">
      <ScrollToTopOnMount />

      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent mb-4">
            Обмен предметов
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Продавайте предметы за игровую валюту или обменивайте их на время подписки
          </p>
        </div>

        {/* Информационные панели */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Текущий баланс */}
          <div className="bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-green-300 font-semibold mb-2">Текущий баланс</h3>
                <Monetary
                  value={parseFloat(auth.user?.balance?.toString() || '0')}
                />
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 001.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Статус подписки */}
          <div className="bg-gradient-to-br from-[#1a1426] to-[#0f0a1b] rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-purple-300 font-semibold mb-2">Подписка</h3>
                {subscriptionData?.data?.subscription_days_left && subscriptionData.data.subscription_days_left > 0 ? (
                  <p className="text-xl font-bold text-purple-400">
                    {subscriptionData.data.subscription_days_left} дней
                  </p>
                ) : (
                  <p className="text-xl font-bold text-gray-400">Неактивна</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.383-1.835-.528-2.516zM16 11.459c-.145.681-.318 1.617-.528 2.516.508-.29 1.026-.564 1.554-.82a.75.75 0 00.419-.74 41.029 41.029 0 00-.39-3.114 29.848 29.848 0 00-2.455 1.158z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Переключатель вкладок */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1a1426] rounded-xl p-1 border border-purple-800/30">
            <button
              onClick={() => setSelectedTab('sell')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedTab === 'sell'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Продажа за валюту
            </button>
            <button
              onClick={() => setSelectedTab('exchange')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                selectedTab === 'exchange'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Обмен на подписку
            </button>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-[#1a1426] rounded-xl p-6 border border-purple-800/30 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Поиск */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Поиск предметов</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Введите название предмета..."
                className="w-full bg-[#0f0a1b] border border-purple-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Фильтр по редкости */}
            <div>
              <label className="block text-gray-300 font-medium mb-2">Редкость</label>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full bg-[#0f0a1b] border border-purple-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'Все редкости' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Инвентарь */}
        <div className="bg-[#1a1426] rounded-xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {selectedTab === 'sell' ? 'Предметы для продажи' : 'Предметы для обмена'}
            </h2>
            <span className="text-gray-400">
              {groupedAndFilteredItems.length} предметов
            </span>
          </div>

          {isLoadingInventory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <span className="ml-3 text-gray-400">Загрузка инвентаря...</span>
            </div>
          ) : inventoryError ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">Ошибка загрузки инвентаря</p>
              <button
                onClick={() => refetchInventory()}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                Попробовать снова
              </button>
            </div>
          ) : groupedAndFilteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg mb-2">
                {selectedTab === 'sell'
                  ? 'Нет предметов для продажи'
                  : 'Нет предметов в инвентаре'
                }
              </p>
              <p className="text-gray-500 text-sm">
                {selectedTab === 'sell'
                  ? 'Попробуйте открыть кейсы, чтобы получить предметы для продажи'
                  : 'Попробуйте изменить фильтры или открыть кейсы'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {groupedAndFilteredItems.map((itemGroup) => (
                <ItemCard
                  key={itemGroup.item.id}
                  itemGroup={itemGroup}
                  onSellItem={handleSellItem}
                  onExchangeItem={handleExchangeItem}
                  isLoading={isSellingItem || isExchangingItem}
                />
              ))}
            </div>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-8 bg-gradient-to-r from-purple-600/10 to-violet-600/10 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-300 mb-3">ℹ️ Информация об обмене</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <strong className="text-green-400">Продажа за валюту:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside pl-4">
                <li>Мгновенное пополнение баланса</li>
                <li>Цена продажи составляет 70% от стоимости</li>
                <li>Валюта используется для покупки кейсов</li>
              </ul>
            </div>
            <div>
              <strong className="text-purple-400">Обмен на подписку:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside pl-4">
                <li>Продление времени подписки</li>
                <li>Время зависит от стоимости предмета</li>
                <li>Подписка даёт бонусы и ежедневные кейсы</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
