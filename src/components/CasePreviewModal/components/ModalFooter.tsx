import React from 'react';
import Monetary from '../../Monetary';
import { ModalFooterProps } from '../types';

export const ModalFooter: React.FC<ModalFooterProps> = ({
  statusData,
  statusLoading,
  fixedPrices,
  paymentMethod,
  setPaymentMethod,
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
  checkBalanceSufficient,
  t
}) => {
  return (
    <div className="flex-shrink-0 p-6 border-t border-gray-700 bg-[#1a1629]">
      <div className="text-sm text-gray-400 mb-4">
        {statusData?.data && !statusLoading && (
          <div>
            {statusData.data.reason && !statusData.data.canOpen && !statusData.data.canBuy && (
              <span className="text-red-400">{statusData.data.reason}</span>
            )}
            {statusData.data.subscriptionRequired && (
              <div className="mt-1">
                {t('case_preview_modal.subscription_required', { tier: statusData.data.minSubscriptionTier })}
                <br />
                {t('case_preview_modal.your_level', { level: statusData.data.userSubscriptionTier })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
        <button
          onClick={handleClose}
          className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
          disabled={isProcessing || showOpeningAnimation}
        >
          {t('case_preview_modal.close')}
        </button>

        {fixedPrices ? (
          // Показываем кнопки с выбором метода оплаты для премиум кейсов
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            {/* Селектор метода оплаты */}
            {!showOpeningAnimation && !isProcessing && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-400 whitespace-nowrap">{t('case_preview_modal.payment_method')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'balance' | 'bank_card')}
                    className="bg-gray-700 text-white rounded px-3 py-1 text-sm border border-gray-600 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="balance">{t('case_preview_modal.balance_payment')}</option>
                    <option value="bank_card">{t('case_preview_modal.card_payment')}</option>
                  </select>
                </div>
                {paymentMethod === 'balance' && userData && (
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
              </div>
            )}

            {/* Кнопка покупки */}
            {(() => {
              const price = getCasePrice(caseData);
              const hasEnoughBalance = checkBalanceSufficient(price);
              const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || (!hasEnoughBalance && paymentMethod === 'balance');

              return (
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleBuyCase}
                    disabled={isDisabled}
                    className={`px-6 py-2 text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ${
                      !hasEnoughBalance && paymentMethod === 'balance'
                        ? 'bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg shadow-red-500/30 animate-pulse'
                        : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                    }`}
                    title={!hasEnoughBalance && paymentMethod === 'balance' ? `Недостаточно средств! Требуется: ${price}₽, доступно: ${userData?.balance || 0}₽` : ''}
                  >
                    {isProcessing || buyLoading || openLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{paymentMethod === 'bank_card' ? t('case_preview_modal.going_to_payment') : t('case_preview_modal.opening')}</span>
                      </>
                    ) : !hasEnoughBalance && paymentMethod === 'balance' ? (
                      <>
                        <span className="text-red-100">💳 Недостаточно средств</span>
                        <span className="text-yellow-400 font-bold"><Monetary value={price} /></span>
                      </>
                    ) : (
                      <>
                        <span>{paymentMethod === 'bank_card' ? t('case_preview_modal.buy') : t('case_preview_modal.open')}</span>
                        <span className="text-yellow-400 font-bold"><Monetary value={price} /></span>
                      </>
                    )}
                  </button>
                  {!hasEnoughBalance && paymentMethod === 'balance' && (
                    <div className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-500/30 flex items-center gap-1">
                      ⚠️ Не хватает <Monetary value={price - (userData?.balance || 0)} />
                    </div>
                  )}
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
                  const hasEnoughBalance = checkBalanceSufficient(price);
                  const isDisabled = isProcessing || buyLoading || openLoading || showOpeningAnimation || (!hasEnoughBalance && paymentMethod === 'balance');

                  return (
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleBuyCase}
                        disabled={isDisabled}
                        className={`px-6 py-2 text-white rounded transition-all duration-200 disabled:cursor-not-allowed flex items-center space-x-2 whitespace-nowrap ${
                          !hasEnoughBalance && paymentMethod === 'balance'
                            ? 'bg-red-600 hover:bg-red-700 border-2 border-red-400 shadow-lg shadow-red-500/30 animate-pulse'
                            : 'bg-green-600 hover:bg-green-700 disabled:opacity-50'
                        }`}
                        title={!hasEnoughBalance && paymentMethod === 'balance' ? `Недостаточно средств! Требуется: ${price}₽, доступно: ${userData?.balance || 0}₽` : ''}
                      >
                        {isProcessing || buyLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t('case_preview_modal.buying')}</span>
                          </>
                        ) : !hasEnoughBalance && paymentMethod === 'balance' ? (
                          <>
                            <span className="text-red-100">💳 Недостаточно средств</span>
                            <Monetary value={price} />
                          </>
                        ) : (
                          <>
                            <span>{t('case_preview_modal.buy_and_open')}</span>
                            <Monetary value={price} />
                          </>
                        )}
                      </button>
                      {!hasEnoughBalance && paymentMethod === 'balance' && (
                        <div className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-500/30 flex items-center gap-1">
                          ⚠️ Не хватает <Monetary value={price - (userData?.balance || 0)} />
                        </div>
                      )}
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
