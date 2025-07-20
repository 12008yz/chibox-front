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
    <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none group-hover:pointer-events-auto">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 mx-2 shadow-xl max-w-full">
        {!showConfirm ? (
          <>
            <div className="text-center mb-2">
              <p className="text-white text-xs font-medium mb-1">{item.item.name}</p>
              <p className="text-green-400 text-sm font-bold">{Number(item.item.price).toFixed(2)} КР</p>
            </div>

            {canWithdraw ? (
              <div className="space-y-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWithdraw();
                  }}
                  disabled={isWithdrawing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1.5 px-3 rounded text-xs transition-all duration-200 flex items-center justify-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  {isWithdrawing ? 'Выводим...' : 'Вывести в Steam'}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  {userHasTradeUrl
                    ? 'Отправить на ваш Steam'
                    : 'Нужен Steam Trade URL'
                  }
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-400 bg-gray-700/50 rounded py-1.5 px-2">
                  Нельзя вывести в Steam
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-2">
              <p className="text-white text-xs font-medium mb-1">Укажите Steam Trade URL</p>
              <p className="text-gray-300 text-xs">{item.item.name}</p>
            </div>

            <div className="space-y-2">
              <input
                type="url"
                placeholder="https://steamcommunity.com/tradeoffer/new/..."
                value={steamTradeUrl}
                onChange={(e) => setSteamTradeUrl(e.target.value)}
                className="w-full px-2 py-1 bg-black/50 border border-gray-600/50 rounded text-white text-xs placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />

              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWithdraw(true);
                  }}
                  disabled={isWithdrawing || !steamTradeUrl.trim()}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-1 px-2 rounded text-xs transition-all duration-200"
                >
                  {isWithdrawing ? 'Выводим...' : 'OK'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirm(false);
                  }}
                  disabled={isWithdrawing}
                  className="px-2 py-1 bg-gray-600/50 hover:bg-gray-600/70 disabled:opacity-50 text-gray-300 rounded text-xs transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemWithdrawBanner;
