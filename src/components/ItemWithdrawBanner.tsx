import React, { useState } from 'react';
import { useWithdrawItemMutation } from '../features/user/userApi';
import { useAppSelector } from '../store/hooks';
import type { UserInventoryItem } from '../types/api';

interface ItemWithdrawBannerProps {
  item: UserInventoryItem;
  onWithdrawSuccess: () => void;
  onError: (message: string) => void;
}

const ItemWithdrawBanner: React.FC<ItemWithdrawBannerProps> = ({
  item,
  onWithdrawSuccess,
  onError,
}) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [steamTradeUrl, setSteamTradeUrl] = useState('');
  const [withdrawItem] = useWithdrawItemMutation();

  // Получаем данные пользователя из store
  const user = useAppSelector(state => state.auth.user);
  const userHasTradeUrl = user?.steam_trade_url && user.steam_trade_url.trim() !== '';

  // Проверка возможности вывода предмета
  const canWithdraw = (item.item?.steam_market_hash_name &&
                      item.item.steam_market_hash_name.trim() !== '') ||
                     (item.item?.name && item.item.name.trim() !== '');

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer': return 'from-gray-500 to-gray-600';
      case 'industrial': return 'from-blue-500 to-blue-600';
      case 'milspec': return 'from-purple-500 to-purple-600';
      case 'restricted': return 'from-pink-500 to-pink-600';
      case 'classified': return 'from-red-500 to-red-600';
      case 'covert': return 'from-yellow-500 to-orange-500';
      case 'contraband': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleWithdraw = async (useCustomUrl = false) => {
    if (!canWithdraw) {
      onError('Этот предмет нельзя вывести в Steam');
      return;
    }

    // Используем steam_market_hash_name если доступно, иначе name
    const marketHashName = item.item?.steam_market_hash_name || item.item?.name;

    if (!marketHashName) {
      onError('Не удалось определить название предмета для вывода');
      return;
    }

    // Если у пользователя нет trade URL и он не указал кастомный - показываем форму
    if (!userHasTradeUrl && !useCustomUrl) {
      setShowConfirm(true);
      return;
    }

    setIsWithdrawing(true);
    try {
      const result = await withdrawItem({
        inventoryItemId: item.id,
        steamTradeUrl: useCustomUrl ? steamTradeUrl || undefined : undefined,
      }).unwrap();

      if (result.success) {
        onWithdrawSuccess();
        setShowConfirm(false);
      } else {
        onError(result.message || 'Ошибка при выводе предмета');
      }
    } catch (error: any) {
      console.error('Ошибка при выводе предмета:', error);
      onError(error?.data?.message || 'Не удалось вывести предмет');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!item.item) return null;

  // Отладочная информация
  console.log('ItemWithdrawBanner - Item:', item.item.name);
  console.log('ItemWithdrawBanner - steam_market_hash_name:', item.item.steam_market_hash_name);
  console.log('ItemWithdrawBanner - canWithdraw:', canWithdraw);
  console.log('ItemWithdrawBanner - userHasTradeUrl:', userHasTradeUrl);
  console.log('ItemWithdrawBanner - Using fallback name:', !item.item.steam_market_hash_name && item.item.name);

  return (
    <div className="absolute inset-0 bg-black/90 rounded-xl flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
      {!showConfirm ? (
        <>
          {/* Header with item info */}
          <div className="text-center">
            <h4 className="text-white font-semibold text-sm mb-1 truncate">
              {item.item.name}
            </h4>
            <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(item.item.rarity)} text-white mb-2`}>
              {item.item.rarity}
            </div>
            <p className="text-green-400 font-bold text-lg">
              {Number(item.item.price).toFixed(2)} КР
            </p>
          </div>

          {/* Action buttons */}
          <div className="space-y-2">
            {canWithdraw ? (
              <>
                <button
                  onClick={() => handleWithdraw()}
                  disabled={isWithdrawing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {isWithdrawing ? 'Выводим...' : 'Вывести в Steam'}
                </button>
                <div className="text-xs text-gray-400 text-center">
                  {userHasTradeUrl
                    ? 'Предмет будет отправлен на ваш Steam аккаунт'
                    : 'Нужно указать Steam Trade URL'
                  }
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="text-xs text-gray-400 bg-gray-700/50 rounded-lg py-2 px-3">
                  Этот предмет нельзя вывести в Steam
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Confirmation dialog */}
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h5 className="text-white font-semibold text-sm mb-1">
              Укажите Steam Trade URL
            </h5>
            <p className="text-gray-300 text-xs mb-3">
              {item.item.name}
            </p>
          </div>

          {/* Steam Trade URL input (required) */}
          <div className="mb-3">
            <input
              type="url"
              placeholder="https://steamcommunity.com/tradeoffer/new/..."
              value={steamTradeUrl}
              onChange={(e) => setSteamTradeUrl(e.target.value)}
              className="w-full px-2 py-1 bg-black/50 border border-gray-600/50 rounded text-white text-xs placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Найти в Steam: Инвентарь → Настройки приватности → Ссылка для обмена
            </p>
          </div>

          {/* Confirm buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleWithdraw(true)}
              disabled={isWithdrawing || !steamTradeUrl.trim()}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-xs"
            >
              {isWithdrawing ? 'Выводим...' : 'Подтвердить'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isWithdrawing}
              className="px-3 py-2 bg-gray-600/50 hover:bg-gray-600/70 disabled:opacity-50 text-gray-300 rounded-lg transition-colors text-xs"
            >
              Отмена
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ItemWithdrawBanner;
