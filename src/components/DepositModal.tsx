import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaWallet, FaCreditCard, FaBitcoin, FaEthereum, FaCrown } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import { SiTether, SiBinance, SiDogecoin, SiLitecoin, SiTon, SiPolygon } from 'react-icons/si';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import { useAppSelector } from '../store/hooks';
import Monetary from './Monetary';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'balance' | 'subscription';
}

type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactElement;
  badge?: string;
  enabled: boolean;
  type: 'sbp' | 'card' | 'crypto' | 'other';
};

const SbpIcon: React.FC = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-center justify-center w-full h-full">
      {imageError ? (
        <div className="text-2xl font-bold text-green-400">СБП</div>
      ) : (
        <img
          src="https://payment.kassa.ai/build/assets/favicon-0dca7b36.png"
          alt="СБП"
          className="w-12 h-12 object-contain"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, initialTab = 'balance' }) => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [selectedCountry, setSelectedCountry] = useState('RU');
  const [selectedMethod, setSelectedMethod] = useState<string>('robokassa');
  const [amount, setAmount] = useState<string>('100');
  const [promoCode, setPromoCode] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [selectedSubscription, setSelectedSubscription] = useState<number | null>(null);

  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();

  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'robokassa',
      name: 'Robokassa',
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            ROBOKASSA
          </div>
        </div>
      ),
      badge: 'Все способы',
      enabled: true,
      type: 'card'
    },
    {
      id: 'sbp',
      name: 'СБП',
      icon: <SbpIcon />,
      enabled: true,
      type: 'sbp'
    },
    {
      id: 'card_visa_mir',
      name: 'Visa / МИР',
      icon: (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex gap-1">
            <span className="text-xs font-bold text-blue-400">VISA</span>
            <span className="text-xs font-bold text-red-400">MС</span>
          </div>
          <span className="text-xs font-bold text-green-400">МИР</span>
        </div>
      ),
      enabled: true,
      type: 'card'
    },
    {
      id: 'sberpay',
      name: 'СберПэй',
      icon: <div className="text-xl font-bold text-green-500">СПэй</div>,
      enabled: true,
      type: 'other'
    },
    {
      id: 'sbp_alt',
      name: 'СБП',
      icon: <div className="text-xl font-bold text-purple-400">СБП</div>,
      enabled: true,
      type: 'sbp'
    },
    {
      id: 'card_alt1',
      name: 'Visa / МИР',
      icon: (
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex gap-1">
            <FaCreditCard className="text-blue-400" />
            <span className="text-xs font-bold text-green-400">МІР</span>
          </div>
        </div>
      ),
      enabled: true,
      type: 'card'
    },
    {
      id: 'sbp_alt2',
      name: 'СБП',
      icon: <div className="text-xl font-bold text-blue-400">СБП</div>,
      enabled: true,
      type: 'sbp'
    },
    {
      id: 'card_alt2',
      name: 'Карты',
      icon: <FaCreditCard className="text-2xl text-yellow-400" />,
      enabled: true,
      type: 'card'
    },
    {
      id: 'ggskin',
      name: 'GGSKIN',
      icon: <div className="text-sm font-bold text-blue-500">GGSKIN</div>,
      badge: 'Skins',
      enabled: false,
      type: 'other'
    },
    {
      id: 'usdt_trc20',
      name: 'Tether TRC-20',
      icon: <SiTether className="text-2xl text-green-500" />,
      badge: 'TRC-20',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'usdt_erc20',
      name: 'Tether ERC-20',
      icon: <SiTether className="text-2xl text-green-400" />,
      badge: 'Tether (ERC-20)',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'tron',
      name: 'TRON',
      icon: <SiTon className="text-2xl text-red-500" />,
      badge: 'TRON',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      icon: <FaBitcoin className="text-2xl text-orange-500" />,
      badge: 'BITCOIN',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      icon: <FaEthereum className="text-2xl text-purple-400" />,
      badge: 'ETHEREUM ERC-20',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'bnb',
      name: 'BNB',
      icon: <SiBinance className="text-2xl text-yellow-500" />,
      badge: 'BNB',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'avax',
      name: 'AVAX',
      icon: <div className="text-xl font-bold text-red-400">A</div>,
      badge: 'AVAX',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'notcoin',
      name: 'Notcoin',
      icon: <div className="text-xl font-bold text-yellow-400">NOT</div>,
      badge: 'NOTCOIN',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'doge',
      name: 'Dogecoin',
      icon: <SiDogecoin className="text-2xl text-yellow-600" />,
      badge: 'DOGE',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'matic',
      name: 'Polygon',
      icon: <SiPolygon className="text-2xl text-purple-600" />,
      badge: 'MATIC',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'dash',
      name: 'Dash',
      icon: <div className="text-xl font-bold text-blue-400">DASH</div>,
      badge: 'DASH',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'ton',
      name: 'TON Coin',
      icon: <div className="text-xl font-bold text-blue-500">TON</div>,
      badge: 'TON COIN',
      enabled: false,
      type: 'crypto'
    },
    {
      id: 'ltc',
      name: 'Litecoin',
      icon: <SiLitecoin className="text-2xl text-gray-400" />,
      badge: 'LTC',
      enabled: false,
      type: 'crypto'
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
      toast.error(`Минимальная сумма: ${minAmount} RUB`);
      return;
    }

    if (!selectedPaymentMethod?.enabled) {
      toast.error('Этот способ оплаты временно недоступен');
      return;
    }

    try {
      // Определяем payment_method на основе выбранного способа оплаты
      let paymentMethod = 'yookassa'; // По умолчанию YooKassa

      if (selectedMethod === 'robokassa') {
        paymentMethod = 'robokassa';
      }

      const result = await topUpBalance({
        amount: amountNum,
        currency: 'RUB',
        payment_method: paymentMethod
      }).unwrap();

      if (result.success && result.data?.paymentUrl) {
        window.open(result.data.paymentUrl, '_blank');
        toast.success('Переход к оплате...');
        onClose();
      }
    } catch (error: any) {
      console.error('Ошибка при пополнении:', error);
      toast.error(error?.data?.message || 'Ошибка создания платежа');
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
      toast.error(error?.data?.message || 'Неверный промокод');
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
          toast.success('Переход к оплате...');
        } else {
          toast.success('Подписка успешно активирована!');
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
    <div data-no-click-sound className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div data-no-click-sound className="relative bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-700/30 bg-black/40 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            {activeTab === 'balance' ? (
              <>
                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                  <FaWallet className="text-white text-xl" />
                </div>
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Пополнение баланса
                </span>
              </>
            ) : (
              <>
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                  <RiVipCrownFill className="text-white text-xl" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Премиум подписка
                </span>
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200 border border-gray-700/50 hover:border-gray-600"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="relative flex space-x-2 p-4 bg-black/20">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold ${
              activeTab === 'balance'
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-2 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-700/40 border-2 border-transparent'
            }`}
          >
            <img src="/images/chiCoin.png" alt="chiCoin" className="w-5 h-5" />
            <span>Баланс</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-semibold ${
              activeTab === 'subscription'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 border-2 border-purple-500/50 shadow-lg shadow-purple-500/20'
                : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-700/40 border-2 border-transparent'
            }`}
          >
            <RiVipCrownFill className="text-xl" />
            <span>Подписка VIP</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'balance' ? (
            /* Balance Tab */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Side - Payment Methods */}
          <div className="space-y-4">
            {/* Country Selector */}
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
              <label className="text-sm font-semibold text-gray-300 mb-2 block uppercase tracking-wide">
                🌍 Страна для способов оплаты:
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-pointer"
              >
                <option value="RU">🇷🇺 РОССИЯ</option>
                <option value="BY">🇧🇾 БЕЛАРУСЬ</option>
                <option value="KZ">🇰🇿 КАЗАХСТАН</option>
                <option value="UA">🇺🇦 УКРАИНА</option>
              </select>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => method.enabled && setSelectedMethod(method.id)}
                  disabled={!method.enabled}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-300 min-h-[100px] flex flex-col items-center justify-center backdrop-blur-sm
                    ${selectedMethod === method.id && method.enabled
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500 shadow-xl shadow-green-500/30 scale-105'
                      : method.enabled
                      ? 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-600/50 hover:border-gray-500 hover:bg-gray-700/40 hover:scale-102'
                      : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedMethod === method.id && method.enabled && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {method.badge && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-gray-900/80 rounded text-[10px] text-gray-400 uppercase">
                      {method.badge}
                    </div>
                  )}

                  <div className="mb-2">
                    {method.icon}
                  </div>

                  <div className="text-xs text-gray-300 text-center mt-auto">
                    {method.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Info Text */}
            <div className="text-sm text-gray-300 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/30 flex items-start gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="font-medium text-white mb-1">Безопасная оплата</p>
                <p className="text-gray-400">Для пополнения баланса вы будете перенаправлены на защищенный сайт платежной системы.</p>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 space-y-4 h-fit sticky top-0 backdrop-blur-sm">
            {/* Selected Method */}
            <div>
              <div className="text-sm font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                💳 Выбранный способ оплаты
              </div>
              <div className="bg-gradient-to-br from-gray-900/70 to-black/70 rounded-lg p-4 border-2 border-green-500/30 flex items-center gap-3 shadow-lg shadow-green-500/10">
                <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center border border-gray-700 shadow-inner">
                  {selectedPaymentMethod?.icon || <FaWallet className="text-2xl text-gray-500" />}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-white">
                    {selectedPaymentMethod?.name || 'Не выбрано'}
                  </div>
                  {selectedPaymentMethod?.badge && (
                    <div className="text-xs text-green-400 mt-0.5">
                      {selectedPaymentMethod.badge}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="🎁 Промокод"
                  className="flex-1 bg-gray-900/70 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/40 uppercase tracking-wide"
                >
                  Применить
                </button>
              </div>
            </div>

            {/* Min Amount */}
            <div className="text-sm text-gray-300 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
              💵 Минимальная сумма: <span className="text-yellow-400 font-bold">{minAmount} RUB</span>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1">
                <img src="/images/chiCoin.png" alt="chiCoin" className="w-4 h-4 inline-block" />
                Сумма пополнения (RUB)
              </label>
              <div className="flex items-center bg-gray-900/70 border-2 border-gray-600 rounded-lg px-4 py-3 focus-within:border-yellow-500 focus-within:ring-2 focus-within:ring-yellow-500/20 transition-all">
                <span className="text-3xl mr-3">💵</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minAmount}
                  className="flex-1 bg-transparent text-white text-xl font-bold focus:outline-none"
                  placeholder="100"
                />
                <span className="text-gray-400 text-sm ml-2">RUB</span>
              </div>
            </div>

            {/* Bonus Info */}
            <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-yellow-500/30 rounded-lg p-4 shadow-lg shadow-yellow-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-sm text-yellow-200/90 font-medium">На баланс поступит:</span>
                </div>
                <span className="text-2xl font-bold text-yellow-400">{amount || '0'} ⚡</span>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 cursor-pointer transition-all"
              />
              <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer select-none">
                Я принимаю условия{' '}
                <a href="#" className="text-green-400 hover:text-green-300 underline font-semibold">
                  Пользовательского соглашения
                </a>
              </label>
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50"
            >
              <FaWallet className="text-xl" />
              <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить'}</span>
            </button>
          </div>
            </div>
          ) : (
            /* Subscription Tab */
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-500/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/20">
                    <RiVipCrownFill className="text-purple-400 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-300 mb-1">VIP Статус дает:</h3>
                    <ul className="text-sm text-purple-200/80 space-y-1">
                      <li>✨ Бонус к шансу выпадения редких предметов</li>
                      <li>🎁 Ежедневные бесплатные кейсы</li>
                      <li>⭐ Уникальные привилегии и значки</li>
                      <li>💬 Особый статус в чате</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Subscription Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          ? 'border-purple-500 shadow-xl shadow-purple-500/40 scale-105'
                          : 'border-gray-700/50 hover:border-purple-400/50 hover:scale-102'
                      } ${isPro ? 'md:scale-105 md:z-10' : ''}`}
                      onClick={() => setSelectedSubscription(tier.id)}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 ${
                        isPremium ? 'bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-pink-500/20' :
                        isPro ? 'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-indigo-500/20' :
                        'bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/20'
                      }`} />

                      {/* Most Popular Badge */}
                      {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border-2 border-white/20">
                          ⭐ ПОПУЛЯРНЫЙ
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative p-5">
                        {/* Icon & Title */}
                        <div className="flex flex-col items-center mb-4">
                          <div className={`p-4 rounded-2xl shadow-xl mb-3 ${
                            isPremium ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                            isPro ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                            'bg-gradient-to-br from-blue-500 to-cyan-500'
                          }`}>
                            <RiVipCrownFill className="text-3xl text-white drop-shadow-lg" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                          <p className="text-sm text-gray-400">30 дней подписки</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-4 p-3 bg-black/30 rounded-lg">
                          <div className="text-3xl font-bold text-white mb-1">
                            <Monetary value={tier.price} />
                          </div>
                          <div className="text-xs text-gray-400">
                            ~<Monetary value={Math.round(tier.price / 30)} /> в день
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2 text-sm bg-black/20 rounded-lg p-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200 flex-1">
                              Бонус к дропам: <strong className={`${
                                isPremium ? 'text-yellow-400' : isPro ? 'text-purple-400' : 'text-blue-400'
                              }`}>+{tier.bonus_percentage}%</strong>
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm bg-black/20 rounded-lg p-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200 flex-1">
                              <strong className="text-white">{tier.max_daily_cases}</strong> кейс в день
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm bg-black/20 rounded-lg p-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isPremium ? 'bg-yellow-400' : isPro ? 'bg-purple-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-gray-200 flex-1">
                              VIP статус в чате
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
                          className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isPremium
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg shadow-yellow-500/30'
                              : isPro
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg shadow-blue-500/30'
                          } ${isSelected ? 'ring-2 ring-white/50' : ''}`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <FaCrown />
                            <span>
                              {isSubscriptionLoading && isSelected
                                ? 'Создание платежа...'
                                : `Купить ${tier.name}`}
                            </span>
                          </div>
                        </button>
                      </div>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/30">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Payment Info */}
              <div className="text-center text-sm text-gray-400 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                💳 Оплата через защищенное соединение YooKassa
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DepositModal;
