import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaCoins, FaCrown, FaCheck, FaCreditCard, FaWallet } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import toast from 'react-hot-toast';
import { useDepositBalanceMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
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
  initialTab = 'balance'
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);

  // API mutations
  const [depositBalance, { isLoading: isDepositLoading }] = useDepositBalanceMutation();
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();

  // API queries
  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  // Предустановленные суммы для пополнения
  const presetAmounts = [100, 500, 1000, 2500, 5000, 10000];

  const handleDepositSubmit = async () => {
    const amount = parseFloat(depositAmount);

    if (!amount || amount <= 0) {
      toast.error('Введите корректную сумму для пополнения');
      return;
    }

    if (amount < 100) {
      toast.error('Минимальная сумма пополнения: 100 рублей');
      return;
    }

    try {
      const result = await depositBalance({
        amount,
        payment_method: 'yookassa'
      }).unwrap();

      if (result.success && result.data?.payment_url) {
        window.open(result.data.payment_url, '_blank');
        toast.success('Переходим к оплате...');
        onClose();
      }
    } catch (error: any) {
      console.error('Ошибка при создании платежа:', error);
      toast.error(error?.data?.message || 'Ошибка при создании платежа');
    }
  };

  const handleSubscriptionPurchase = async (tierId: number) => {
    try {
      const result = await buySubscription({
        tierId,
        method: 'bank_card'
      }).unwrap();

      if (result.success) {
        if (result.data?.paymentUrl) {
          window.open(result.data.paymentUrl, '_blank');
          toast.success('Переходим к оплате подписки...');
        } else {
          toast.success('Статус успешно приобретен!');
        }
        onClose();
      }
    } catch (error: any) {
      console.error('Ошибка при покупке подписки:', error);
      toast.error(error?.data?.message || 'Ошибка при покупке подписки');
    }
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
          <h2 className="text-2xl font-bold text-white">Магазин</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 p-1 bg-black/30 rounded-xl">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'balance'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaCoins className="text-lg" />
            <span>Пополнить баланс</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RiVipCrownFill className="text-lg" />
            <span>Подписки</span>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'balance' && (
            <div className="space-y-6">
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Пополнение баланса</h3>

                {/* Preset amounts */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDepositAmount(amount.toString())}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        depositAmount === amount.toString()
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-green-500/50 hover:bg-green-500/10'
                      }`}
                    >
                      <div className="text-sm font-semibold">{amount} ₽</div>
                    </button>
                  ))}
                </div>

                {/* Custom amount input */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Или введите свою сумму:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Введите сумму"
                        min="100"
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        ₽
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    • Минимальная сумма пополнения: 100 ₽<br/>
                    • Средства поступят на баланс после успешной оплаты<br/>
                    • Поддерживаются банковские карты
                  </div>

                  <button
                    onClick={handleDepositSubmit}
                    disabled={isDepositLoading || !depositAmount || parseFloat(depositAmount) < 100}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <FaCreditCard className="text-lg" />
                    <span>
                      {isDepositLoading ? 'Создание платежа...' : `Пополнить на ${depositAmount || '0'} ₽`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="bg-black/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Выберите подписку</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Статус дает бонус к шансу выпадения редких предметов и ежедневные бесплатные кейсы и многое другое
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
                                '+8% к дропу • 1 кейс в день • Без дубликатов' :
                                `+${tier.bonus_percentage}% к дропу • ${tier.max_daily_cases} кейс в день`
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">
                            <Monetary value={tier.price} />
                          </div>
                          <div className="text-xs text-gray-400">30 дней</div>
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
                    {isSubscriptionLoading ? 'Создание платежа...' : 'Купить подписку'}
                  </span>
                </button>
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
