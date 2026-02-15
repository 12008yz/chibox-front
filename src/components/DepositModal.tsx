import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Wallet, Lock, Crown, CreditCard, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import Monetary from './Monetary';
import { ReceivedIcon, ExchangeIcon } from './icons';
import { getApiErrorMessage } from '../utils/config';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'balance' | 'subscription';
  initialSelectedSubscription?: number;
}

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactElement;
  badge?: string;
  enabled: boolean;
  type: 'sbp' | 'card' | 'crypto' | 'other';
  /** backend: 'unitpay' (карта / СБП) */
  payment_method: string;
  /** для unitpay: сразу открыть форму карты или СБП */
  unitpay_system?: 'card' | 'sbp';
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, initialTab = 'balance', initialSelectedSubscription }) => {
  const { } = useTranslation();

  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [selectedMethod, setSelectedMethod] = useState<string>('unitpay_card');
  const [amount, setAmount] = useState<string>('10');
  const [promoCode, setPromoCode] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(initialSelectedSubscription || null);

  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();

  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  // Обновляем selectedSubscription при изменении initialSelectedSubscription
  useEffect(() => {
    if (initialSelectedSubscription !== undefined) {
      setSelectedSubscription(initialSelectedSubscription);
    }
  }, [initialSelectedSubscription]);


  const paymentMethods: PaymentMethod[] = [
    {
      id: 'unitpay_card',
      name: 'Банковская карта',
      icon: (
        <div className="flex items-center justify-center w-full h-full p-2">
          <CreditCard className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
      ),
      badge: 'Visa, МИР, Mastercard',
      enabled: true,
      type: 'card',
      payment_method: 'unitpay',
      unitpay_system: 'card'
    },
    {
      id: 'unitpay_sbp',
      name: 'СБП',
      icon: (
        <div className="flex items-center justify-center w-full h-full p-2">
          <Smartphone className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
        </div>
      ),
      badge: 'Система быстрых платежей',
      enabled: true,
      type: 'sbp',
      payment_method: 'unitpay',
      unitpay_system: 'sbp'
    },
  ];

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const minAmount = 10;

  const handleDeposit = async () => {
    if (!agreedToTerms) {
      toast.error('Необходимо принять пользовательское соглашение');
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum < minAmount) {
      toast.error(`Минимальная сумма: ${minAmount} ChiCoins`);
      return;
    }

    if (!selectedPaymentMethod?.enabled) {
      toast.error('Этот способ оплаты временно недоступен');
      return;
    }

    try {
      const payload: { amount: number; currency: string; payment_method: string; unitpay_system?: string } = {
        amount: amountNum,
        currency: 'ChiCoins',
        payment_method: selectedPaymentMethod?.payment_method || 'unitpay'
      };
      if (selectedPaymentMethod?.unitpay_system) {
        payload.unitpay_system = selectedPaymentMethod.unitpay_system;
      }
      const result = await topUpBalance(payload).unwrap();

      if (result.success && result.data) {
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          toast.success('Переход к оплате...');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Ошибка создания платежа'));
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;

    try {
      const result = await applyPromo({ promo_code: promoCode }).unwrap();
      if (result.success) {
        toast.success(result.message || 'Промокод применён!');
        setPromoCode('');
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Неверный промокод'));
    }
  };

  const handleSubscriptionPurchase = async (tierId: number) => {
    try {
      const result = await buySubscription({
        tierId,
        method: 'bank_card',
        paymentMethod: 'unitpay',
        unitpay_system: selectedMethod === 'unitpay_sbp' ? 'sbp' : selectedMethod === 'unitpay_card' ? 'card' : undefined
      }).unwrap();

      if (result.success) {
        if (result.data?.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          toast.success('Переход к оплате...');
          onClose();
        } else {
          toast.success('Подписка успешно активирована!');
          onClose();
        }
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Ошибка при покупке подписки'));
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div data-no-click-sound className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div data-no-click-sound className="relative bg-[#1a1f2e] rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/30">

        {/* Header */}
        <div className="relative flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/20">
          <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            {activeTab === 'balance' ? (
              <>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-800">
                  <Wallet className="text-white text-base sm:text-xl" />
                </div>
                <span className="hidden sm:inline">Пополнение баланса</span>
                <span className="sm:hidden">Баланс</span>
              </>
            ) : (
              <>
                <div className="p-1.5 sm:p-2 rounded-lg bg-gray-800">
                  <Crown className="text-white text-base sm:text-xl" />
                </div>
                <span className="hidden sm:inline">Премиум подписка</span>
                <span className="sm:hidden">VIP статус</span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="text-lg sm:text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex space-x-2 p-3 sm:p-4 bg-[#151a26]">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 font-medium text-sm sm:text-base ${
              activeTab === 'balance'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <img src="/images/chiCoin.png" alt="chiCoin" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Баланс</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 font-medium text-sm sm:text-base ${
              activeTab === 'subscription'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Crown className="text-base sm:text-xl" />
            <span>VIP</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'balance' ? (
            /* Balance Tab */
            <>
              {/* Mobile/Tablet Version */}
              <div className="block lg:hidden space-y-6">
                {/* Step 1: Amount Input */}
                <div className="bg-gray-800/40 rounded-lg p-4 sm:p-6 border border-gray-700/30 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 1: Введите сумму</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Минимальная сумма пополнения {minAmount} ChiCoins</p>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      Сумма пополнения
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-16 py-3 sm:py-4 text-white text-xl sm:text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors"
                        placeholder="100"
                      />

                    </div>
                  </div>

                  {/* Bonus Display */}
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-300 font-medium">Вы получите:</span>
                      <div className="flex items-center gap-2">
                        <img src="/images/chiCoin.png" alt="chiCoin" className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span className="text-xl sm:text-2xl font-semibold text-white">{amount || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      Промокод на бонус к пополнению (опционально)
                      <span className="text-xs text-purple-400 font-normal">DEPOSIT5, DEPOSIT10, DEPOSIT15</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод (например, DEPOSIT10)"
                        className="flex-1 bg-gray-900/70 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase text-sm sm:text-base"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base shadow-lg hover:shadow-purple-500/50"
                      >
                        OK
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 После активации промокода вы получите дополнительный бонус к текущему балансу
                    </p>
                  </div>
                </div>

                {/* Step 2: Payment Method Selection */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 2: Выберите платежную систему</h3>
                    <p className="text-xs sm:text-sm text-gray-400">Безопасная оплата через проверенных партнеров</p>
                  </div>

                  {/* Payment Methods Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.enabled && setSelectedMethod(method.id)}
                        disabled={!method.enabled}
                        className={`
                          relative rounded-lg border transition-colors overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gray-800 border-white'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Badge */}
                        {method.badge && (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-700 rounded text-[9px] sm:text-[10px] font-medium text-gray-300 uppercase">
                            {method.badge}
                          </div>
                        )}

                        {/* Check Mark */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        <div className="p-4 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4">
                          {/* Logo */}
                          <div className="w-full max-w-[150px] sm:max-w-[200px] h-10 sm:h-12 flex items-center justify-center">
                            {method.icon}
                          </div>

                          {/* Name */}
                          <div className="text-center">
                            <div className="text-xs sm:text-sm font-medium text-gray-300">
                              {method.name}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="text-xs text-gray-500 text-center">
                            {method.id === 'unitpay_card' && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Visa</span>
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">МИР</span>
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Mastercard</span>
                              </div>
                            )}
                            {method.id === 'unitpay_sbp' && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Система быстрых платежей</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700/30 flex items-start gap-2 sm:gap-3">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1 text-xs sm:text-sm">Защищенная оплата</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Выберите способ — после нажатия «Пополнить» откроется форма оплаты картой или СБП без дополнительного выбора</p>
                    </div>
                  </div>
                </div>

                {/* Step 3: Confirm Payment */}
                <div className="bg-gray-800/40 rounded-lg p-4 sm:p-6 border border-gray-700/30 space-y-4">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">Шаг 3: Подтвердите оплату</h3>
                  </div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-2 sm:gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-600 bg-gray-900/50 text-white focus:ring-2 focus:ring-gray-500 cursor-pointer flex-shrink-0"
                    />
                    <label htmlFor="terms" className="text-xs sm:text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
                      Я принимаю условия{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 underline font-medium">
                        Пользовательского соглашения
                      </a>
                    </label>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-3 sm:py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <Wallet className="text-base sm:text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>

                  {/* Selected Method Info */}
                  {selectedPaymentMethod && (
                    <div className="text-center text-xs text-gray-500 pt-2">
                      Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Version */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Left Side - Payment Methods */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Выберите платежную систему</h3>
                    <p className="text-sm text-gray-400">Безопасная оплата через проверенных партнеров</p>
                  </div>

                  {/* Payment Methods Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.enabled && setSelectedMethod(method.id)}
                        disabled={!method.enabled}
                        className={`
                          relative rounded-lg border transition-colors overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gray-800 border-white'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {/* Badge */}
                        {method.badge && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700 rounded text-[10px] font-medium text-gray-300 uppercase">
                            {method.badge}
                          </div>
                        )}

                        {/* Check Mark */}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-3 left-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}

                        <div className="p-8 flex flex-col items-center justify-center gap-4">
                          {/* Logo */}
                          <div className="w-full max-w-[200px] h-12 flex items-center justify-center">
                            {method.icon}
                          </div>

                          {/* Name */}
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-300">
                              {method.name}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="text-xs text-gray-500 text-center">
                            {method.id === 'unitpay_card' && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-2 py-1 bg-gray-700/50 rounded">Visa</span>
                                <span className="px-2 py-1 bg-gray-700/50 rounded">МИР</span>
                                <span className="px-2 py-1 bg-gray-700/50 rounded">Mastercard</span>
                              </div>
                            )}
                            {method.id === 'unitpay_sbp' && (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-2 py-1 bg-gray-700/50 rounded">СБП</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 flex items-start gap-3">
                    <Lock className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1">Защищенная оплата</p>
                      <p className="text-gray-400">Выберите способ — после «Пополнить» откроется форма оплаты картой или СБП без дополнительного выбора</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Payment Form */}
                <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700/30 space-y-5 h-fit sticky top-0">
                  {/* Amount Input */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                      Сумма пополнения
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={minAmount}
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-16 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors"
                        placeholder="100"
                      />

                    </div>
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                      Минимум: <span className="text-white font-medium flex items-center gap-1">
                        {minAmount}
                        <img src="/images/chiCoin.png" alt="ChiCoins" className="w-4 h-4 inline-block" />
                      </span>
                    </div>
                  </div>

                  {/* Bonus Display */}
                  <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 font-medium">Вы получите:</span>
                      <div className="flex items-center gap-2">
                        <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />
                        <span className="text-2xl font-semibold text-white">{amount || '0'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                       Промокод (опционально)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод"
                        className="flex-1 bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        OK
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-700/50"></div>

                  {/* Terms Agreement */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-white focus:ring-2 focus:ring-gray-500 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
                      Я принимаю условия{' '}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-200 underline font-medium">
                        Пользовательского соглашения
                      </a>
                    </label>
                  </div>

                  {/* Deposit Button */}
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-base rounded-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <Wallet className="text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>

                  {/* Selected Method Info */}
                  <div className="text-center text-xs text-gray-500 pt-2">
                    Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod?.name || 'Не выбрано'}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Subscription Tab */
            <>
              {/* Mobile/Tablet Version */}
              <div className="block lg:hidden space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Выберите VIP статус</h3>
                <p className="text-xs sm:text-sm text-gray-400">Получите эксклюзивные привилегии и бонусы</p>
              </div>

              {/* Subscription Tiers Grid */}
              <div className="grid grid-cols-1 gap-3">
                {subscriptionTiers.map((tier) => {
                  const isPro = tier.id === 2;
                  const isPremium = tier.id === 3;
                  const isSelected = selectedSubscription === tier.id;

                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedSubscription(tier.id)}
                      className={`
                        relative rounded-lg border transition-all overflow-hidden text-left
                        ${isSelected
                          ? 'bg-gray-800 border-white shadow-lg shadow-white/10'
                          : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        }
                      `}
                    >
                      {/* Most Popular Badge */}
                      {isPro && (
                        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded text-[9px] sm:text-[10px] font-bold text-white uppercase shadow-lg flex items-center gap-1">
                          <ExchangeIcon className="w-3 h-3" /> Популярный
                        </div>
                      )}

                      {/* Check Mark */}
                      {isSelected && (
                        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      <div className="p-3 sm:p-4">
                        {/* Top Section */}
                        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                          {/* Icon */}
                          <div className="p-2 rounded-lg bg-gray-700 flex-shrink-0">
                            <img
                              src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                              alt={tier.name}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-1">
                              <h3 className="text-lg sm:text-xl font-bold text-white">{tier.name}</h3>
                              <span className="text-[10px] sm:text-xs text-gray-400">30 дней</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-bold text-white">
                              <Monetary value={tier.price} />
                            </div>
                          </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Бонус к дропу</div>
                            <div className="text-sm sm:text-base font-bold text-green-400">+{tier.bonus_percentage}%</div>
                          </div>
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1 truncate">
                              {isPremium ? 'Дубликаты' : 'Кейсов'}
                            </div>
                            <div className="text-sm sm:text-base font-bold text-blue-400">
                              {isPremium ? '✗' : tier.max_daily_cases}
                            </div>
                          </div>
                          <div className="bg-gray-900/60 rounded-lg p-2 sm:p-2.5 border border-gray-700/50">
                            <div className="text-[9px] sm:text-[10px] text-gray-400 mb-1">VIP чат</div>
                            <div className="text-sm sm:text-base font-bold text-purple-400"><ReceivedIcon className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                          </div>
                        </div>

                        {/* Additional Features */}
                        <div className="mt-3 pt-3 border-t border-gray-700/50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] sm:text-xs">
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>VIP иконка</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>Приоритет в поддержке</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-300">
                              <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                              <span>Бесплатный кейс</span>
                            </div>
                            {isPremium && (
                              <div className="flex items-center gap-1.5 text-gray-300">
                                <span className="text-green-400"><ReceivedIcon className="w-3 h-3 sm:w-4 sm:h-4" /></span>
                                <span>Без дубликатов</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Info Block */}
              <div className="text-sm text-gray-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-lg p-3 sm:p-4 border border-gray-700/30 flex items-start gap-2 sm:gap-3">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-1.5 text-xs sm:text-sm">Преимущества VIP статуса</p>
                  <ul className="text-gray-400 space-y-1 text-[10px] sm:text-xs">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Повышенный шанс выпадения редких предметов из кейсов</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Ежедневный бесплатный кейс (автоматически начисляется)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Уникальная VIP иконка в профиле и чате</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">•</span>
                      <span>Приоритетная поддержка 24/7</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Purchase Section */}
              {selectedSubscription && (
                <div className="bg-gray-800/40 rounded-lg p-3 sm:p-4 border border-gray-700/30 space-y-3 sm:space-y-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3 flex items-center gap-2">
                      <Crown className="text-yellow-500" />
                      Подтверждение покупки
                    </h3>
                  </div>

                  {/* Selected Tier Summary */}
                  <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-3">
                    {(() => {
                      const selectedTier = subscriptionTiers.find(t => t.id === selectedSubscription);
                      if (!selectedTier) return null;

                      const isPremium = selectedTier.id === 3;
                      const isPro = selectedTier.id === 2;

                      return (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-700">
                              <img
                                src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                alt={selectedTier.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                              />
                            </div>
                            <div>
                              <div className="text-sm sm:text-base font-semibold text-white">{selectedTier.name}</div>
                              <div className="text-[10px] sm:text-xs text-gray-400">30 дней подписки</div>
                            </div>
                          </div>
                          <div className="text-lg sm:text-xl font-bold text-white">
                            <Monetary value={selectedTier.price} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>


                  {/* Purchase Button */}
                  <button
                    onClick={() => handleSubscriptionPurchase(selectedSubscription)}
                    disabled={isSubscriptionLoading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg disabled:shadow-none"
                  >
                    <Crown className="text-base sm:text-lg" />
                    <span>{isSubscriptionLoading ? 'Создание платежа...' : 'Купить VIP статус'}</span>
                  </button>
                </div>
              )}
            </div>

              {/* Desktop Version */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_380px] gap-6">
                {/* Left Side - Subscription Tiers */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Выберите VIP статус</h3>
                    <p className="text-sm text-gray-400">Получите эксклюзивные привилегии и бонусы</p>
                  </div>

                  {/* Subscription Tiers Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {subscriptionTiers.map((tier) => {
                      const isPro = tier.id === 2;
                      const isPremium = tier.id === 3;
                      const isSelected = selectedSubscription === tier.id;

                      return (
                        <button
                          key={tier.id}
                          onClick={() => setSelectedSubscription(tier.id)}
                          className={`
                            relative rounded-lg border transition-colors overflow-hidden text-left
                            ${isSelected
                              ? 'bg-gray-800 border-white'
                              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                            }
                          `}
                        >
                          {/* Most Popular Badge */}
                          {isPro && (
                            <div className="absolute top-3 right-3 px-2.5 py-1 bg-gray-700 rounded text-[10px] font-medium text-gray-300 uppercase">
                              Популярный
                            </div>
                          )}

                          {/* Check Mark */}
                          {isSelected && (
                            <div className="absolute top-3 left-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}

                          <div className="p-4 flex items-center gap-4">
                            {/* Icon */}
                            <div className="p-2 rounded-lg bg-gray-700 flex-shrink-0">
                              <img
                                src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                alt={tier.name}
                                className="w-12 h-12 object-contain"
                              />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1.5">
                                <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                                <span className="text-xs text-gray-400">30 дней</span>
                              </div>

                              {/* Features Grid */}
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">Бонус к дропу</div>
                                  <div className="text-base font-semibold text-white">+{tier.bonus_percentage}%</div>
                                </div>
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">
                                    {isPremium ? 'Без дубликатов' : 'Кейсов в день'}
                                  </div>
                                  <div className="text-base font-semibold text-white">
                                    {isPremium ? <ReceivedIcon className="w-4 h-4" /> : tier.max_daily_cases}
                                  </div>
                                </div>
                                <div className="bg-gray-900/40 rounded-lg p-2">
                                  <div className="text-[10px] text-gray-400 mb-0.5">VIP чат</div>
                                  <div className="text-base font-semibold text-white"><ReceivedIcon className="w-5 h-5" /></div>
                                </div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                              <div className="text-2xl font-semibold text-white mb-1">
                                <Monetary value={tier.price} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Info Text */}
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 border border-gray-700/30 flex items-start gap-2">
                    <Crown className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1 text-sm">Преимущества VIP статуса</p>
                      <ul className="text-gray-400 space-y-0.5 text-xs">
                        <li>• Повышенный шанс выпадения редких предметов из кейсов</li>
                        <li>• Ежедневный бесплатный кейс (автоматически начисляется)</li>
                        <li>• Уникальная VIP иконка в профиле и чате</li>
                        <li>• Приоритетная поддержка</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right Side - Purchase Summary */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/30 space-y-4 h-fit sticky top-0">
                  {selectedSubscription ? (
                    <>
                      {/* Selected Tier Preview */}
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Crown />
                          Выбранный статус
                        </label>
                        <div className="bg-gray-900/70 border border-gray-700/50 rounded-lg p-3">
                          {(() => {
                            const selectedTier = subscriptionTiers.find(t => t.id === selectedSubscription);
                            if (!selectedTier) return null;

                            const isPremium = selectedTier.id === 3;
                            const isPro = selectedTier.id === 2;

                            return (
                              <>
                                <div className="flex items-center gap-2.5 mb-3">
                                  <div className="p-2 rounded-lg bg-gray-700">
                                    <img
                                      src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                                      alt={selectedTier.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  </div>
                                  <div>
                                    <div className="text-lg font-semibold text-white">{selectedTier.name}</div>
                                    <div className="text-xs text-gray-400">30 дней подписки</div>
                                  </div>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-1.5 mb-3">
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">
                                      Бонус <span className="font-semibold text-white">+{selectedTier.bonus_percentage}%</span> к шансу выпадения
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">
                                      {isPremium ? 'Предметы выпадают без дубликатов' : 'Доступ ко всем бонусам'}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">VIP значок в профиле и чате</span>
                                  </div>
                                  <div className="flex items-start gap-2 text-xs">
                                    <ReceivedIcon className="w-4 h-4 mt-0.5 text-green-400 flex-shrink-0" />
                                    <span className="text-gray-300">Приоритетная поддержка</span>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-gray-700/50"></div>

                      {/* Purchase Button */}
                      <button
                        onClick={() => handleSubscriptionPurchase(selectedSubscription)}
                        disabled={isSubscriptionLoading}
                        className="w-full py-3 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Crown className="text-base" />
                        <span>{isSubscriptionLoading ? 'Создание платежа...' : 'Купить статус'}</span>
                      </button>

                    </>
                  ) : (
                    /* No Selection State */
                    <div className="flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-lg bg-gray-800 flex items-center justify-center">
                          <img
                            src="/images/status+.png"
                            alt="VIP статус"
                            className="w-16 h-16 object-contain opacity-50"
                          />
                        </div>
                        <p className="text-gray-400 text-sm">
                          Выберите VIP статус<br />для продолжения
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DepositModal;
