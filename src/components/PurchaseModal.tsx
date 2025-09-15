import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaCrown, FaCheck, FaCoins, FaWallet } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import { useTopUpBalanceMutation } from '../features/user/userApi';
import type { SubscriptionTier } from '../features/subscriptions/subscriptionsApi';
import Monetary from './Monetary';

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

  // API mutations
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();
  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();

  // API queries
  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  // Предустановленные суммы для пополнения
  const presetAmounts = [500, 1000, 2500, 5000, 10000, 25000];

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
      const result = await topUpBalance({ amount }).unwrap();

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
    const amount = parseInt(topUpAmount);
    if (amount < 100) {
      toast.error(t('modals.minimum_amount_error'));
      return;
    }
    if (amount > 100000) {
      toast.error(t('modals.maximum_amount_error'));
      return;
    }
    handleTopUp(amount);
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
      <div className="relative bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-purple-500/20 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
        <div className="flex space-x-1 mb-6 bg-black/20 rounded-lg p-1">
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
        <div className="space-y-4">
          {activeTab === 'balance' ? (
            /* Balance Top-up Content */
            <div className="bg-black/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('modals.select_amount')}</h3>
              <p className="text-gray-400 text-sm mb-6">
                {t('modals.balance_description')}
              </p>

              {/* Preset amounts */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {presetAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickTopUp(amount)}
                    disabled={isTopUpLoading}
                    className="p-4 rounded-lg border-2 border-gray-600 bg-gray-800/30 hover:border-green-500/50 hover:bg-green-500/10 text-white font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Monetary value={amount} />
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('modals.custom_amount')}
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="100000"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder={t('modals.enter_amount')}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t('modals.amount_range')}
                  </p>
                </div>

                <button
                  onClick={handleCustomTopUp}
                  disabled={isTopUpLoading || !topUpAmount || parseInt(topUpAmount) < 100}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
            <div className="bg-black/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('modals.select_subscription')}</h3>
              <p className="text-gray-400 text-sm mb-6">
                {t('modals.subscription_description')}
              </p>

              <div className="space-y-3">
                {subscriptionTiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedSubscription === tier.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-gray-600 bg-gray-800/30 hover:border-purple-500/50 hover:bg-purple-500/10'
                    }`}
                    onClick={() => setSelectedSubscription(tier.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          tier.id === 1 ? 'bg-blue-500/20 text-blue-400' :
                          tier.id === 2 ? 'bg-purple-500/20 text-purple-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          <RiVipCrownFill className="text-lg" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{tier.name}</div>
                          <div className="text-sm text-gray-400">
                            {tier.name.includes('Статус++') || tier.name.includes('++') ?
                              `+8% ${t('modals.drop_bonus')} • 1 ${t('modals.case_per_day')} • ${t('modals.no_duplicates')}` :
                              `+${tier.bonus_percentage}% ${t('modals.drop_bonus')} • ${tier.max_daily_cases} ${t('modals.case_per_day')}`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">
                          <Monetary value={tier.price} />
                        </div>
                        <div className="text-xs text-gray-400">{t('modals.day_30')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => selectedSubscription && handleSubscriptionPurchase(selectedSubscription)}
                disabled={isSubscriptionLoading || !selectedSubscription}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <FaCrown className="text-lg" />
                <span>
                  {isSubscriptionLoading ? t('modals.creating_payment') : t('modals.buy_subscription')}
                </span>
              </button>
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
