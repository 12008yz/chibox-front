import React from 'react';
import Monetary from '../../Monetary';
import { ModalFooterProps } from '../types';

export const ModalFooter: React.FC<ModalFooterProps> = ({
  statusData,
  statusLoading,
  fixedPrices,
  userData,
  caseData,
  isProcessing,
  buyLoading,
  openLoading,
  showOpeningAnimation,
  handleClose,
  handleBuyCase,
  handleOpenCase,
  getCasePrice,
  t,
  onBuyStatusClick,
  buyStatusLoading = false
}) => {
  const d = statusData?.data;
  const hasSubscriptionIssue = d && d.subscriptionRequired && (d.userSubscriptionTier < d.minSubscriptionTier || (d.minSubscriptionTier > 0 && (d.subscriptionDaysLeft ?? 0) <= 0));
  const subscriptionBlocked = d && !statusLoading && hasSubscriptionIssue && !d.canOpen && !d.canBuy;
  const isCooldown = d && !statusLoading && !d.canOpen && !d.canBuy && !hasSubscriptionIssue && (d.reason === 'Кейс еще недоступен' || d.nextAvailableTime);
  const requiredTier = d?.minSubscriptionTier ?? 1;
  const statusRequiredText = requiredTier > 0
    ? t('case_preview_modal.subscription_required', { defaultValue: 'Требуется статус уровня {{tier}}+', tier: requiredTier })
    : t('case_preview_modal.status_required_short', { defaultValue: 'Требуется статус' });

  const handleBuyStatus = () => {
    if (buyStatusLoading) return;
    if (onBuyStatusClick) {
      Promise.resolve(onBuyStatusClick(requiredTier)).catch(() => {});
    } else {
      window.dispatchEvent(new CustomEvent('openDepositModal', { detail: { tab: 'subscription', tier: requiredTier } }));
      handleClose();
    }
  };

  return (
    <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-gray-700 bg-[#1a1629]">
      {/* Текст о требуемом статусе — только когда статуса нет */}
      {subscriptionBlocked && (
        <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
          <div>{statusRequiredText}</div>
          <button
            type="button"
            onClick={handleBuyStatus}
            disabled={buyStatusLoading}
            className="mt-2 text-amber-400 hover:text-amber-300 font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buyStatusLoading ? t('case_preview_modal.going_to_payment', { defaultValue: 'Переход к оплате...' }) : t('case_preview_modal.buy_status_link', { defaultValue: 'Купить статус' })}
          </button>
        </div>
      )}

      {isCooldown && (
        <div className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
          {d?.reason === 'Кейс еще недоступен' && d?.nextAvailableTime && (
            <div>
              {t('case_preview_modal.case_not_yet_available', { defaultValue: 'Кейс еще недоступен' })}
              <span className="block mt-1 text-gray-500">
                {t('case_preview_modal.next_available_at', { defaultValue: 'Следующий доступен' })}: {new Date(d.nextAvailableTime).toLocaleString()}
              </span>
            </div>
          )}
          {d?.reason === 'Кейс еще недоступен' && !d?.nextAvailableTime && (
            <div>{t('case_preview_modal.case_not_yet_available', { defaultValue: 'Кейс еще недоступен' })}</div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-between items-stretch sm:items-center">
        <button
          onClick={handleClose}
          className="px-4 py-2 sm:px-6 text-sm sm:text-base bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
          disabled={isProcessing || showOpeningAnimation}
        >
          {t('case_preview_modal.close')}
        </button>

        {fixedPrices ? (
          // Показываем кнопки для премиум кейсов (только баланс)
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Показ баланса */}
            {!showOpeningAnimation && !isProcessing && userData && (
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-gray-400 flex items-center gap-1">
                  <img src="/images/chiCoin.png" alt="chiCoin" className="w-4 h-4 inline-block" />
                  Баланс:
                </span>
                <span className={`font-bold ${(userData.balance || 0) < getCasePrice(caseData) ? 'text-red-400' : 'text-green-400'}`}>
                  <Monetary value={userData.balance || 0} />
                </span>
              </div>
            )}

            {/* Кнопка покупки */}
            {(() => {
              const price = getCasePrice(caseData);
              const hasEnoughBalance = (userData?.balance || 0) >= price;
              const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || !hasEnoughBalance;

              return (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleBuyCase}
                    disabled={isDisabled}
                    className={`px-4 py-2 sm:px-6 text-sm sm:text-base text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2 ${
                      !hasEnoughBalance
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                    }`}
                  >
                    {isProcessing || buyLoading || openLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('case_preview_modal.opening')}</span>
                      </>
                    ) : !hasEnoughBalance ? (
                      <>
                        <span>💳 Пополнить на</span>
                        <span className="text-yellow-400 font-bold"><Monetary value={price - (userData?.balance || 0)} /></span>
                      </>
                    ) : (
                      <>
                        <span>{t('case_preview_modal.open')}</span>
                        <span className="text-yellow-400 font-bold"><Monetary value={price} /></span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (
          // Используем обычную логику для страницы профиля
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {statusData?.data && !statusLoading ? (
              <>
                {statusData.data.canBuy && statusData.data.price > 0 && (() => {
                  const price = statusData.data.price;
                  const hasEnoughBalance = (userData?.balance || 0) >= price;
                  const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || !hasEnoughBalance;

                  return (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleBuyCase}
                        disabled={isDisabled}
                        className={`px-6 py-2 text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ${
                          !hasEnoughBalance
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                        }`}
                      >
                        {isProcessing || buyLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('case_preview_modal.buying')}</span>
                          </>
                        ) : !hasEnoughBalance ? (
                          <>
                            <span>💳 Пополнить на</span>
                            <span className="text-yellow-400 font-bold"><Monetary value={price - (userData?.balance || 0)} /></span>
                          </>
                        ) : (
                          <>
                            <span>{t('case_preview_modal.buy_and_open')}</span>
                            <Monetary value={price} />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })()}

                {statusData.data.canOpen && (
                  <button
                    onClick={() => handleOpenCase()}
                    disabled={isProcessing || buyLoading || openLoading || showOpeningAnimation}
                    className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
                  >
                    {isProcessing || openLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{t('case_preview_modal.opening')}</span>
                      </>
                    ) : (
                      <span>{t('case_preview_modal.open_case')}</span>
                    )}
                  </button>
                )}
              </>
            ) : (
              // Показываем кнопку по умолчанию, если статус не загружен
              <button
                onClick={handleBuyCase}
                disabled={buyLoading || openLoading || showOpeningAnimation}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap"
              >
                {isProcessing || buyLoading || openLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{t('case_preview_modal.opening')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('case_preview_modal.open_case')}</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
