import React, { useState } from 'react';
import { useWithdrawItemMutation } from '../features/user/userApi';
import { useAppSelector } from '../store/hooks';
import { canWithdrawItems, getSubscriptionStatus } from '../utils/subscriptionUtils';
import type { UserInventoryItem } from '../types/api';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();


  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [steamTradeUrl, setSteamTradeUrl] = useState('');
  const [withdrawItem] = useWithdrawItemMutation();

  // Получаем данные пользователя из store
  const user = useAppSelector(state => state.auth.user);
  const userHasTradeUrl = user?.steam_trade_url && user.steam_trade_url.trim() !== '';

  // Проверяем статус подписки
  const withdrawPermission = canWithdrawItems(user);
  const subscriptionStatus = getSubscriptionStatus(user);

  // Проверка возможности вывода предмета (и наличия подписки)
  const canWithdraw = ((item.item?.steam_market_hash_name &&
                      item.item.steam_market_hash_name.trim() !== '') ||
                     (item.item?.name && item.item.name.trim() !== '')) &&
                     withdrawPermission.canWithdraw;



  const handleWithdraw = async (useCustomUrl = false) => {
    // Проверяем подписку перед выводом
    if (!withdrawPermission.canWithdraw) {
      if (withdrawPermission.requiresSubscription) {
        onError(`${withdrawPermission.reason}. ${subscriptionStatus.statusText}.`);
      } else {
        onError(withdrawPermission.reason || t('profile.item_withdraw.error_withdrawal_impossible'));
      }
      return;
    }

    if (!canWithdraw) {
      onError(t('profile.item_withdraw.error_no_subscription'));
      return;
    }

    // Используем steam_market_hash_name если доступно, иначе name
    const marketHashName = item.item?.steam_market_hash_name || item.item?.name;

    if (!marketHashName) {
      onError(t('item_withdraw.error_no_item_name'));
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
        onError(result.message || t('profile.item_withdraw.error_withdrawal_failed'));
      }
    } catch (error: any) {
      console.error('Item withdrawal error:', error);

      // Специальная обработка ошибки отсутствия подписки
      if (error?.data?.error_code === 'SUBSCRIPTION_REQUIRED') {
        const subscriptionInfo = error.data.data?.subscription_status || t('profile.subscription_info.no_subscription');
        onError(`${error.data.message}. ${t('profile.subscription_info.status')}: ${subscriptionInfo}. ${t('profile.subscription_info.purchase_suggestion')}.`);
      } else {
        onError(error?.data?.message || t('profile.item_withdraw.error_not_found'));
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (!item.item) return null;

  // Отладочная информация (только для критических ошибок)
  if (!canWithdraw && !item.item.name) {
    console.warn('ItemWithdrawBanner - Warning: Item has no name or steam_market_hash_name');
  }

  return (
    <div className="absolute inset-0 bg-black/80 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none group-hover:pointer-events-auto">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-600/50 rounded-lg p-3 mx-2 shadow-xl max-w-full">
        {!showConfirm ? (
          <>
            <div className="text-center mb-2">
              <p className="text-white text-xs font-medium mb-1">{item.item.name}</p>
              <p className="text-green-400 text-sm font-bold inline-flex items-center gap-1 justify-center">
                {Number(item.item.price).toFixed(2)}
                <img
                  src="https://tempfile.aiquickdraw.com/s/88f1c5efcf1d421b83e020062b079c5a_0_1760729039_2514.png"
                  alt="currency"
                  className="w-4 h-4 inline-block object-contain"
                />
              </p>
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
                  {isWithdrawing
                    ? t('profile.item_withdraw.withdrawing')
                    : t('profile.item_withdraw.withdraw_to_steam')}
                </button>
                <p className="text-xs text-gray-400 text-center">
                  {!withdrawPermission.canWithdraw
                    ? (withdrawPermission.requiresSubscription
                        ? t('profile.item_withdraw.subscription_required')
                        : withdrawPermission.reason)
                    : (userHasTradeUrl
                        ? t('profile.item_withdraw.send_to_steam')
                        : t('profile.item_withdraw.need_trade_url'))
                  }
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-400 bg-gray-700/50 rounded py-1.5 px-2">
                  {!withdrawPermission.canWithdraw && withdrawPermission.requiresSubscription
                    ? t('profile.item_withdraw.subscription_required')
                    : t('profile.item_withdraw.cannot_withdraw')
                  }
                </p>
                {!withdrawPermission.canWithdraw && withdrawPermission.requiresSubscription && (
                  <p className="text-xs text-orange-400 mt-1">
                    {subscriptionStatus.statusText}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-2">
              <p className="text-white text-xs font-medium mb-1">{t('profile.item_withdraw.provide_trade_url')}</p>
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
                  {isWithdrawing
                    ? t('profile.item_withdraw.withdrawing')
                    : t('profile.item_withdraw.ok')}
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
