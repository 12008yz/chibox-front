import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaCrown, FaCoins, FaWallet, FaInfoCircle } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import { useTopUpBalanceMutation, useGetCurrencyQuery } from '../features/user/userApi';

import Monetary from './Monetary';
import {
  Currency,
  CURRENCY_SYMBOLS,
  CURRENCY_FLAGS,
  getSavedCurrency,
  saveCurrency,
  detectCurrencyFromLocale,
  convertFromChiCoins,
  formatCurrency,
  type ExchangeRates
} from '../utils/currencyUtils';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'balance' | 'subscription';
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'subscription'
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    getSavedCurrency() || detectCurrencyFromLocale()
  );

  // API mutations
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();
  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();

  // API queries
  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  const { data: currencyData } = useGetCurrencyQuery({ currency: selectedCurrency });
  const exchangeRates: ExchangeRates = currencyData?.data?.exchangeRates ?? { RUB: 1, USD: 0.0105, EUR: 0.0095, GBP: 0.0082, CNY: 0.0750 };
  const topUpPackages = currencyData?.data?.topUpPackages || [];

  // Сохраняем выбранную валюту
  useEffect(() => {
    if (selectedCurrency) {
      saveCurrency(selectedCurrency);
    }
  }, [selectedCurrency]);

  const handleSubscriptionPurchase = async (tierId: number) => {
    try {
      const result = await buySubscription({
        tierId,
        method: 'bank_card'
      }).unwrap();

      if (result.success) {
        if (result.data?.paymentUrl) {
          window.open(result.data.paymentUrl, '_blank');
          toast.success(t('modals.going_to_subscription_payment'));
        } else {
          toast.success(t('modals.status_purchased'));
        }
        onClose();
      }
    } catch (error: any) {
      console.error('Ошибка при покупке подписки:', error);
      toast.error(error?.data?.message || t('modals.subscription_error'));
    }
  };

  const handleTopUp = async (amount: number) => {
    try {
      const result = await topUpBalance({
        amount,
        currency: selectedCurrency
      }).unwrap();

      if (result.success && result.data?.paymentUrl) {
        window.open(result.data.paymentUrl, '_blank');
        toast.success(t('modals.going_to_payment'));
        onClose();
      }
    } catch (error: any) {
      console.error('Ошибка при пополнении баланса:', error);
      toast.error(error?.data?.message || t('modals.top_up_error'));
    }
  };

  const handleQuickTopUp = (amount: number) => {
    handleTopUp(amount);
  };

  const handleCustomTopUp = () => {
    const chicoins = parseInt(topUpAmount);
    if (chicoins < 100) {
      toast.error('Минимум 100 ChiCoins');
      return;
    }
    if (chicoins > 100000) {
      toast.error('Максимум 100,000 ChiCoins');
      return;
    }
    handleTopUp(chicoins);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            {activeTab === 'balance' ? (
              <>
                <FaWallet className="text-green-400" />
                <span>{t('modals.top_up_balance')}</span>
              </>
            ) : (
              <>
                <RiVipCrownFill className="text-purple-400" />
                <span>{t('modals.subscriptions')}</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-4 bg-black/20 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'balance'
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            <FaCoins className="text-lg" />
            <span className="font-medium">{t('modals.balance')}</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'subscription'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
          >
            <RiVipCrownFill className="text-lg" />
            <span className="font-medium">{t('modals.subscription')}</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === 'balance' ? (
            /* Balance Top-up Content */
            <div className="bg-black/20 rounded-xl p-4">

              {/* Currency Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-center gap-2">
                  {(Object.keys(CURRENCY_FLAGS) as Currency[]).map((code) => (
                    <button
                      key={code}
                      onClick={() => setSelectedCurrency(code)}
                      className={`relative px-3 py-2 rounded-lg transition-all duration-200 ${
                        selectedCurrency === code
                          ? 'bg-green-500/20 border-2 border-green-500 scale-110'
                          : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600 hover:scale-105'
                      }`}
                      title={`${CURRENCY_FLAGS[code]} ${CURRENCY_SYMBOLS[code]}`}
                    >
                      <span className="text-2xl">{CURRENCY_FLAGS[code]}</span>
                      {selectedCurrency === code && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1530]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conversion Info */}
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-blue-200/80">
                    <FaInfoCircle className="text-blue-400" />
                    <span><strong>1₽ = 1⚡</strong> · Оплата через YooKassa</span>
                  </div>
                  {selectedCurrency !== 'RUB' && (
                    <div className="text-xs text-yellow-300/90">
                      <span>Курс: 1{CURRENCY_SYMBOLS[selectedCurrency]} = {(1 / exchangeRates[selectedCurrency]).toFixed(2)}⚡</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top-up Packages */}
              {topUpPackages.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    {topUpPackages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handleQuickTopUp(pkg.chicoins)}
                        disabled={isTopUpLoading}
                        className={`p-3 rounded-lg border-2 bg-gray-800/30 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                          pkg.popular ? 'border-green-500/50 bg-green-500/10' : 'border-gray-600'
                        }`}
                      >
                        <div className="text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-yellow-400 font-bold text-base">
                              {pkg.totalChicoins}⚡
                            </span>
                            {pkg.bonus > 0 && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                                +{Math.round((pkg.bonus / pkg.chicoins) * 100)}%
                              </span>
                            )}
                          </div>
                          <div className="text-white font-semibold text-sm">
                            {formatCurrency(pkg.price, selectedCurrency, true)}
                          </div>
                          {selectedCurrency !== 'RUB' && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              ≈ {formatCurrency(convertFromChiCoins(pkg.chicoins, 'RUB', exchangeRates), 'RUB', true)}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom amount */}
              <div className="space-y-3">
                <div>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Произвольная сумма (мин. 100⚡)"
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  {topUpAmount && parseInt(topUpAmount) >= 100 && (
                    <div className="mt-2 p-3 bg-gray-800/50 rounded border border-gray-700">
                      <div className="text-sm text-gray-300">
                        <div className="flex justify-between">
                          <span>Получите:</span>
                          <span className="text-yellow-400 font-bold">{parseInt(topUpAmount)} ⚡</span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>К оплате:</span>
                          <span className="text-white font-semibold">
                            {formatCurrency(convertFromChiCoins(parseInt(topUpAmount), selectedCurrency, exchangeRates), selectedCurrency, true)}
                          </span>
                        </div>
                        {selectedCurrency !== 'RUB' && (
                          <div className="flex justify-between mt-1 text-xs text-gray-400">
                            <span>В рублях:</span>
                            <span>{formatCurrency(parseInt(topUpAmount), 'RUB', true)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleCustomTopUp}
                  disabled={isTopUpLoading || !topUpAmount || parseInt(topUpAmount) < 100}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <FaWallet className="text-lg" />
                  <span>
                    {isTopUpLoading ? t('modals.creating_payment') : t('modals.top_up')}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Subscription Content */
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-3">
                <div className="flex items-start space-x-2">
                  <FaInfoCircle className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-purple-200/80">
                    <strong className="text-purple-300">Статус дает:</strong> бонус к шансу выпадения редких предметов, ежедневные кейсы и уникальные привилегии
                  </div>
                </div>
              </div>

              {/* Subscription Tiers */}
              <div className="grid grid-cols-1 gap-3">
                {subscriptionTiers.map((tier) => {
                  const isBasic = tier.id === 1;
                  const isPro = tier.id === 2;
                  const isPremium = tier.id === 3;
                  const isSelected = selectedSubscription === tier.id;

                  return (
                    <div
                      key={tier.id}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer group ${
                        isSelected
                          ? 'border-purple-500 shadow-lg shadow-purple-500/30 scale-[1.02]'
                          : 'border-gray-600/50 hover:border-purple-400/50 hover:scale-[1.01]'
                      }`}
                      onClick={() => setSelectedSubscription(tier.id)}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 ${
                        isPremium ? 'bg-gradient-to-br from-yellow-500/10 via-purple-500/10 to-pink-500/10' :
                        isPro ? 'bg-gradient-to-br from-purple-500/10 to-indigo-500/10' :
                        'bg-gradient-to-br from-blue-500/10 to-cyan-500/10'
                      }`} />

                      {/* Most Popular Badge */}
                      {isPro && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ПОПУЛЯРНЫЙ
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative p-4">
                        <div className="flex items-start justify-between mb-3">
                          {/* Icon & Title */}
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-xl shadow-lg ${
                              isPremium ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                              isPro ? 'bg-gradient-to-br from-purple-500 to-indigo-500' :
                              'bg-gradient-to-br from-blue-500 to-cyan-500'
                            }`}>
                              <RiVipCrownFill className="text-2xl text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-0.5">{tier.name}</h3>
                              <p className="text-sm text-gray-400">30 дней подписки</p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              <Monetary value={tier.price} />
                            </div>
                            <div className="text-xs text-gray-400">
                              ~<Monetary value={Math.round(tier.price / 30)} />{t('modals.day')}
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200">
                              <strong className={`${
                                isPremium ? 'text-yellow-400' : isPro ? 'text-purple-400' : 'text-blue-400'
                              }`}>+{tier.bonus_percentage}%</strong> к шансу редких дропов
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200">
                              <strong className="text-white">{tier.max_daily_cases}</strong> бесплатный кейс каждый день
                            </span>
                          </div>
                          {isPremium && (
                            <div className="flex items-center space-x-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                              <span className="text-gray-200">
                                <strong className="text-yellow-400">Без дубликатов</strong> в ежедневных кейсах
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200">
                              Особый статус в <strong className="text-white">чате</strong>
                            </span>
                          </div>
                        </div>

                        {/* Buy Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSubscriptionPurchase(tier.id);
                          }}
                          disabled={isSubscriptionLoading}
                          className={`w-full py-2.5 rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPremium
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30'
                              : isPro
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg shadow-purple-500/30'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
                          } ${isSelected ? 'animate-pulse' : ''}`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <FaCrown />
                            <span>
                              {isSubscriptionLoading && isSelected
                                ? t('modals.creating_payment')
                                : `Купить ${tier.name}`}
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-purple-500 rounded-xl pointer-events-none">
                          <div className="absolute top-3 left-3 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Рендерим модальное окно в body через портал
  return createPortal(modalContent, document.body);
};

export default PurchaseModal;
