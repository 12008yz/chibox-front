import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../store/hooks';
import {
  useGetUserInventoryQuery,
  useSellItemMutation,
  useExchangeItemForSubscriptionMutation,
  useGetUserSubscriptionQuery
} from '../features/user/userApi';
import Monetary from '../components/Monetary';
import { formatDaysI18n } from '../utils/declension';
import type { UserInventoryItem, Item } from '../types/api';
import { getItemImageUrl, adaptImageSize } from '../utils/steamImageUtils';
import { BACKGROUNDS } from '../utils/config';
import { soundManager } from '../utils/soundManager';
import { getRarityColor } from '../utils/rarityColors';
import { Coins, Star, Search } from 'lucide-react';
import { ExchangeIcon } from '../components/icons';

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
  calculateSubscriptionDays: (itemPrice: number) => number;
  selectedTab: 'sell' | 'exchange';
  isLoading?: boolean;
  minExchangePrice: number;
}> = ({ itemGroup, onSellItem, onExchangeItem, calculateSubscriptionDays, selectedTab, isLoading = false, minExchangePrice }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const { item, count } = itemGroup;
  // Используем price как sellPrice (цена продажи = 65% от рыночной стоимости)
  const itemPrice = parseFloat(item.price || '0');
  const sellPrice = itemPrice * 0.65; // 65% от цены предмета
  const subscriptionDays = calculateSubscriptionDays(itemPrice);



  const getRarityDisplayName = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'covert': return t('exchange.rarity_covert');
      case 'classified': return t('exchange.rarity_classified');
      case 'restricted': return t('exchange.rarity_restricted');
      case 'milspec': return t('exchange.rarity_milspec');
      case 'industrial': return t('exchange.rarity_industrial');
      case 'consumer': return t('exchange.rarity_consumer');
      case 'contraband': return t('exchange.rarity_contraband');
      default: return rarity?.toUpperCase() || 'ОБЫЧНОЕ';
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#1a1426]/95 to-[#0f0a1b]/95 rounded-xl p-2 md:p-4 border border-purple-800/30 hover:border-purple-600/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20">
      <div className="relative">
        {/* Изображение предмета */}
        <div className="relative mb-2 md:mb-3 aspect-square bg-black/10 rounded-lg overflow-hidden item-image-container">
          <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(item.rarity)} opacity-20 rounded-lg`}></div>
          {!imageError ? (
            <img
              src={adaptImageSize(getItemImageUrl(item.image_url, item.name)) || getItemImageUrl(item.image_url, item.name)}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-contain z-10 item-image"
              onError={() => setImageError(true)}
            />
          ) : (
            <PlaceholderImage className="w-full h-full" />
          )}
          {/* Редкость бейдж */}
          <div className={`absolute top-1 md:top-2 right-1 md:right-2 px-1 md:px-2 py-0.5 md:py-1 rounded-md bg-gradient-to-r ${getRarityColor(item.rarity)} text-white text-[10px] md:text-xs font-bold z-20`}>
            {getRarityDisplayName(item.rarity)}
          </div>
          {/* Количество предметов */}
          {count > 1 && (
            <div className="absolute top-1 md:top-2 left-1 md:left-2 px-1 md:px-2 py-0.5 md:py-1 rounded-md bg-black/90 text-white text-[10px] md:text-xs font-bold z-20">
              x{count}
            </div>
          )}
        </div>

        {/* Информация о предмете */}
        <div className="space-y-1 md:space-y-2">
          <h3 className="text-white font-semibold text-xs md:text-sm truncate" title={item.name}>
            {item.name}
          </h3>

          {item.weapon_type && (
            <p className="text-gray-400 text-[10px] md:text-xs">
              {item.weapon_type}
            </p>
          )}

          <div className="flex justify-between items-center text-[10px] md:text-xs">
            <span className="text-purple-300">{t('exchange.item_price')}</span>
            <span className="text-purple-300 font-semibold">
              <Monetary value={itemPrice} />
            </span>
          </div>

          {sellPrice > 0 && selectedTab === 'sell' && (
            <div className="flex justify-between items-center text-[10px] md:text-xs">
              <span className="text-green-300">{t('exchange.item_sell_price')}</span>
              <span className="text-green-300 font-semibold">
                <Monetary value={sellPrice} />
              </span>
            </div>
          )}

          {selectedTab === 'exchange' && (
            <div className="flex justify-between items-center text-[10px] md:text-xs">
              <span className="text-purple-300">{t('exchange.item_subscription_days')}</span>
              <span className={`font-semibold ${subscriptionDays >= 1 ? 'text-purple-300' : 'text-red-400'}`}>
                {subscriptionDays >= 1 ? formatDaysI18n(subscriptionDays, t) : t('exchange.days_few')}
              </span>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-2 md:mt-4 space-y-1 md:space-y-2">
          {/* Кнопка продажи */}
          {sellPrice > 0 && selectedTab === 'sell' && (
            <button
              onClick={() => onSellItem(item.id, item.name, sellPrice)}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white py-1.5 md:py-2 px-2 md:px-4 rounded-lg font-semibold text-[10px] md:text-sm transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></div>
                  {t('exchange.selling')}
                </div>
              ) : (
                <>{t('exchange.sell_for', { price: Math.round(sellPrice) })}</>
              )}
            </button>
          )}

          {/* Кнопка обмена на подписку */}
          {selectedTab === 'exchange' && (
            <button
              onClick={() => onExchangeItem(item.id, item.name, itemPrice)}
              disabled={isLoading || subscriptionDays < 1}
              className={`w-full py-1.5 md:py-2 px-2 md:px-4 rounded-lg font-semibold text-[10px] md:text-sm transition-all duration-200 disabled:cursor-not-allowed ${
                subscriptionDays >= 1
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-white'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 cursor-not-allowed'
              }`}
              title={subscriptionDays < 1 ? t('exchange.min_exchange_price', { price: minExchangePrice }) : ''}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white mr-1 md:mr-2"></div>
                  {t('exchange.exchanging')}
                </div>
              ) : subscriptionDays >= 1 ? (
                <>{t('exchange.exchange_for', { days: formatDaysI18n(subscriptionDays, t) })}</>
              ) : (
                <>{t('exchange.too_cheap')}</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ExchangePage: React.FC = () => {
  const { t } = useTranslation();
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

  // Вычисляем значения на основе тарифа подписки
  const currentTier = subscriptionData?.data?.subscription_tier || 1;
  const pricePerDay = currentTier === 3 ? 350 : 200;
  const minExchangePrice = Math.floor(pricePerDay * 0.93); // Синхронизировано с сервером

  // Функция расчета дней подписки
  const calculateSubscriptionDays = useCallback((itemPrice: number) => {
    // Используем ту же логику что и на бэкенде:
    // Для тарифа 3: 325-350₽ = 1 день, 675-700₽ = 2 дня и т.д.
    // Для тарифов 1,2: 186-200₽ = 1 день, 386-400₽ = 2 дня и т.д.
    return Math.floor((itemPrice + pricePerDay * 0.067) / pricePerDay);
  }, [pricePerDay]);

  // Группировка и фильтрация предметов
  const groupedAndFilteredItems = React.useMemo(() => {
    if (!inventoryData?.data?.items) return [];

    // Сначала фильтруем
    const filtered = inventoryData.data.items.filter((item: UserInventoryItem) => {
      const matchesSearch = item.item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = rarityFilter === 'all' || item.item.rarity?.toLowerCase() === rarityFilter.toLowerCase();
      const isAvailable = item.status === 'inventory'; // Только предметы в инвентаре
      const itemPrice = parseFloat(item.item.price || '0');
      const hasValidAction = selectedTab === 'sell'
        ? itemPrice > 0
        : calculateSubscriptionDays(itemPrice) >= 1 && itemPrice >= minExchangePrice; // Только предметы стоимостью от 1 дня подписки

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

    // Возвращаем отсортированный массив для стабильного порядка
    return Object.values(grouped).sort((a, b) => {
      // Сначала сортируем по названию предмета для стабильного порядка
      const nameComparison = a.item.name.localeCompare(b.item.name);
      if (nameComparison !== 0) return nameComparison;

      // Затем по ID для абсолютной стабильности
      return a.item.id.localeCompare(b.item.id);
    });
  }, [inventoryData, searchTerm, rarityFilter, selectedTab]);

  // Обработчик продажи предмета
  const handleSellItem = async (itemId: string, itemName: string, sellPrice: number) => {
    try {
      if (!auth.user?.id) {
        toast.error(t('errors.access_denied'));
        return;
      }

      // Защита от множественных кликов
      if (isSellingItem) {
        toast.error(t('exchange.selling'));
        return;
      }

      console.log('Selling item:', { itemId, itemName, sellPrice, userId: auth.user.id });

      // Находим группу предметов
      const itemGroup = groupedAndFilteredItems.find(group => group.item.id === itemId);
      if (!itemGroup || itemGroup.instances.length === 0) {
        toast.error(t('errors.not_found'));
        return;
      }

      // Берем первый доступный экземпляр для продажи
      const availableInstances = itemGroup.instances.filter(instance => instance.status === 'inventory');
      if (availableInstances.length === 0) {
        toast.error(t('exchange.no_items_to_sell'));
        return;
      }

      const inventoryItem = availableInstances[0];
      console.log('Using inventory item ID:', inventoryItem.id, 'Available instances:', availableInstances.length);

      const result = await sellItem({ itemId: inventoryItem.id }).unwrap();
      if (result.success) {
        // Звук продажи
        soundManager.play('sellItem');
        toast.success(t('exchange.sell_for', { price: Math.round(sellPrice) }) + ` - "${itemName}"`);
        // Принудительно обновляем инвентарь для ProfilePage
        setTimeout(() => {
          refetchInventory();
        }, 500);
      }
    } catch (error: any) {
      console.error('Ошибка при продаже предмета:', error);
      const errorMessage = error?.data?.message || error?.message || t('errors.server_error');
      toast.error(errorMessage);
    }
  };

  // Обработчик обмена предмета на подписку
  const handleExchangeItem = async (itemId: string, itemName: string, itemPrice: number) => {
    try {
      if (!auth.user?.id) {
        toast.error(t('errors.access_denied'));
        return;
      }

      // Проверяем минимальную стоимость
      const subscriptionDays = calculateSubscriptionDays(itemPrice);

      if (subscriptionDays < 1 || itemPrice < minExchangePrice) {
        toast.error(t('exchange.min_exchange_price', { price: minExchangePrice }) + ` (${Math.round(itemPrice)}₽)`);
        return;
      }

      console.log('Exchanging item:', { itemId, itemName, itemPrice, subscriptionDays, userId: auth.user.id });

      // Находим группу предметов
      const itemGroup = groupedAndFilteredItems.find(group => group.item.id === itemId);
      if (!itemGroup || itemGroup.instances.length === 0) {
        toast.error(t('errors.not_found'));
        return;
      }

      // Берем первый доступный экземпляр для обмена
      const inventoryItem = itemGroup.instances[0];
      if (inventoryItem.status !== 'inventory') {
        toast.error(t('exchange.no_items_for_exchange'));
        return;
      }

      console.log('Using inventory item ID for exchange:', inventoryItem.id);
      const result = await exchangeItem({
        userId: auth.user.id,
        itemId: inventoryItem.id  // Используем ID конкретного экземпляра в инвентаре
      }).unwrap();

      if (result.success) {
        // Звук успешного обмена
        soundManager.play('win');
        toast.success(
          <div>
            <div className="font-semibold">{t('common.success')}!</div>
            <div className="text-sm">{t('exchange.exchange_for', { days: formatDaysI18n(result.data.subscription_days_added, t) })} - "{itemName}"</div>
            <div className="text-xs text-gray-300">{t('exchange.tier')} {formatDaysI18n(result.data.subscription_days_left, t)}</div>
          </div>
        );
        // Принудительно обновляем инвентарь для ProfilePage
        setTimeout(() => {
          refetchInventory();
        }, 500);
      }
    } catch (error: any) {
      console.error('Ошибка при обмене предмета:', error);
      const errorMessage = error?.data?.message || error?.message || t('errors.server_error');
      toast.error(errorMessage);
    }
  };

  const rarities = ['all', 'consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert'];

  return (
    <div className="min-h-screen text-white relative">
      {/* Фиксированный фон на весь экран */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: `url(${BACKGROUNDS.exchange})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#151225'
        }}
      />
      {/* Затемняющий оверлей */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 -z-40"></div>

      <div className="relative z-10 container mx-auto px-2 md:px-4 py-4 md:py-8">
        {/* Простой игровой заголовок */}
        <div className="text-center mb-4 md:mb-8 bg-black/30 rounded-xl p-3 md:p-6">
          <div className="inline-flex items-center space-x-2 md:space-x-3 mb-2 md:mb-4">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 001.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h1 className="text-xl md:text-3xl font-bold text-white">{t('exchange.title')}</h1>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.383-1.835-.528-2.516zM16 11.459c-.145.681-.318 1.617-.528 2.516.508-.29 1.026-.564 1.554-.82a.75.75 0 00.419-.74 41.029 41.029 0 00-.39-3.114 29.848 29.848 0 00-2.455 1.158z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-sm md:text-lg">{t('exchange.subtitle')}</p>
        </div>

        {/* Игровая панель управления */}
        <div className="bg-gradient-to-r from-[#1a1426]/90 to-[#2a1a3a]/90 rounded-xl border border-purple-500/30 p-3 md:p-6 mb-4 md:mb-8">
          {/* Статистика игрока */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-4 md:mb-6">
            <div className="rounded-lg p-2 md:p-4 border border-green-500/50">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="text-green-400 text-xl md:text-2xl">
                  <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <div className="text-green-400 text-xs md:text-sm font-medium">{t('exchange.balance')}</div>
                  <div className="text-white text-sm md:text-xl font-bold">
                    <Monetary value={parseFloat(auth.user?.balance?.toString() || '0')} />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-2 md:p-4 border border-purple-500/50">
              <div className="flex items-center space-x-2 md:space-x-3">
                <ExchangeIcon className="text-purple-400 w-6 h-6 md:w-8 md:h-8 flex-shrink-0" />
                <div>
                  <div className="text-purple-400 text-xs md:text-sm font-medium">{t('exchange.status')}</div>
                  {subscriptionData?.data?.subscription_days_left && subscriptionData.data.subscription_days_left > 0 ? (
                    <div className="text-white text-sm md:text-xl font-bold">
                      {formatDaysI18n(subscriptionData.data.subscription_days_left, t)}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm md:text-xl font-bold">{t('exchange.no_status')}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg p-2 md:p-4 border border-orange-500/50">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="text-orange-400 text-xl md:text-2xl">🔄</div>
                <div>
                  <div className="text-orange-400 text-xs md:text-sm font-medium">{t('exchange.exchange_rate')}</div>
                  <div className="text-white text-sm md:text-xl font-bold">{pricePerDay}₽/{t('time.day')}</div>
                  <div className="text-gray-500 text-[10px] md:text-xs">{t('exchange.tier', { tier: subscriptionData?.data?.subscription_tier || 1 })}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Переключатель режимов */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="bg-black/70 rounded-lg p-1 md:p-2 border border-gray-700">
              <div className="flex space-x-1 md:space-x-2">
                <button
                  onClick={() => setSelectedTab('sell')}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-md text-xs md:text-base font-bold transition-all ${
                    selectedTab === 'sell'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Coins className="inline-block w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  {t('exchange.sell_mode')}
                </button>
                <button
                  onClick={() => setSelectedTab('exchange')}
                  className={`px-3 py-2 md:px-6 md:py-3 rounded-md text-xs md:text-base font-bold transition-all ${
                    selectedTab === 'exchange'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Star className="inline-block w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  {t('exchange.exchange_mode')}
                </button>
              </div>
            </div>
          </div>

          {/* Поиск и фильтры */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('exchange.search_placeholder')}
                className="w-full bg-black/70 border border-gray-600 rounded-lg pl-10 md:pl-12 pr-3 py-2 md:py-3 text-sm md:text-base text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="w-full bg-black/50 border border-gray-600 rounded-lg px-3 py-2 md:px-4 md:py-3 text-sm md:text-base text-white focus:border-purple-500 focus:outline-none transition-colors"
              >
                {rarities.map(rarity => (
                  <option key={rarity} value={rarity} className="bg-[#1a1426] text-white">
                    {rarity === 'all' ? t('exchange.all_rarities') : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>



        {/* Инвентарь */}
        <div className="bg-[#1a1426]/90 rounded-xl p-3 md:p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-base md:text-xl font-bold text-white">
              {selectedTab === 'sell' ? t('exchange.items_for_sale') : t('exchange.items_for_exchange')}
            </h2>
            <span className="text-gray-400 text-xs md:text-base">
              {t('exchange.items_count', { count: groupedAndFilteredItems.length })}
            </span>
          </div>

          {isLoadingInventory ? (
            <div className="flex items-center justify-center py-8 md:py-12">
              <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-purple-500"></div>
              <span className="ml-2 md:ml-3 text-gray-400 text-sm md:text-base">{t('exchange.loading_inventory')}</span>
            </div>
          ) : inventoryError ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-red-400 mb-3 md:mb-4 text-sm md:text-base">{t('exchange.inventory_error')}</p>
              <button
                onClick={() => refetchInventory()}
                className="bg-purple-600 hover:bg-purple-700 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base rounded-lg transition-colors"
              >
                {t('exchange.try_again')}
              </button>
            </div>
          ) : groupedAndFilteredItems.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 bg-purple-500/40 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 md:w-12 md:h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm md:text-lg mb-1 md:mb-2">
                {selectedTab === 'sell'
                  ? t('exchange.no_items_to_sell')
                  : t('exchange.no_items_in_inventory')
                }
              </p>
              <p className="text-gray-500 text-xs md:text-sm">
                {selectedTab === 'sell'
                  ? t('exchange.open_cases_to_sell')
                  : t('exchange.change_filters_or_open_cases')
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 auto-rows-fr">
              {groupedAndFilteredItems.map((itemGroup, index) => (
                <ItemCard
                  key={`${itemGroup.item.id}-${itemGroup.item.name}-${index}`} // Стабильный ключ
                  itemGroup={itemGroup}
                  onSellItem={handleSellItem}
                  onExchangeItem={handleExchangeItem}
                  calculateSubscriptionDays={calculateSubscriptionDays}
                  selectedTab={selectedTab}
                  isLoading={isSellingItem || isExchangingItem}
                  minExchangePrice={minExchangePrice}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangePage;
