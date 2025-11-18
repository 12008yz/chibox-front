import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaWallet, FaCreditCard, FaBitcoin, FaEthereum, FaCrown } from 'react-icons/fa';
import { RiVipCrownFill } from 'react-icons/ri';
import { SiTether, SiBinance, SiDogecoin, SiLitecoin, SiTon, SiPolygon } from 'react-icons/si';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
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
  const { } = useTranslation();

  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
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

  // Robokassa Logo Component
  const RobokassaLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 667 100" fill="currentColor" className="w-full h-auto">
      <path d="M110.237 62.2376C110.237 50.5767 102.983 42.3056 91.1189 42.3056C79.2546 42.3056 72.0004 50.5767 72.0004 62.2376C72.0004 73.5595 79.2546 82.2374 91.1189 82.2374C102.983 82.2374 110.237 73.5595 110.237 62.2376ZM128.813 62.2376C128.813 84.1357 113.22 100 91.1867 100C69.0174 100 53.4243 84.1357 53.4243 62.2376C53.4243 40.0683 68.6106 24.6108 91.1867 24.6108C113.763 24.6108 128.813 40.0683 128.813 62.2376Z"/>
      <path d="M18.3727 26.2379H0V98.3728H18.3727V26.2379Z"/>
      <path d="M38.5088 26.2379L19.5938 52.2038H42.102L60.9493 26.2379H38.5088Z"/>
      <path d="M638.572 69.9663H619.25C614.301 69.9663 611.793 72.6104 611.793 76.2713C611.793 80.2035 615.725 83.5933 621.284 83.5933C629.42 83.5933 636.47 77.9662 638.572 69.9663ZM666.03 81.2205V98.3728H655.996C649.487 98.3728 642.911 94.7118 641.284 87.5933C636.877 94.5763 629.42 98.983 619.725 98.983C603.861 98.983 594.03 89.356 594.03 76.068C594.03 65.2884 601.759 55.3902 619.047 55.3902H638.437V51.5258C638.437 46.9835 634.776 43.3225 630.233 43.3225H599.183V26.2379H631.25C645.013 26.2379 656.199 37.4243 656.199 51.1868V81.2205H666.03Z"/>
      <path d="M494.571 55.9322C491.181 55.5932 480.198 54.6441 476.062 54.1017C470.842 53.4237 468.876 50.9153 468.876 48.2034C468.876 44.5424 471.723 41.0171 481.35 41.0171C492.062 41.0171 495.723 46.1018 496.401 51.1187H513.011C513.011 38.6442 502.028 25.0172 481.215 25.0172C461.757 25.0172 451.046 35.7968 451.046 48.4746C451.046 59.2542 458.232 67.3897 469.689 68.8134C477.147 69.7626 482.842 70.3049 489.418 70.9829C494.977 71.5252 496.672 73.4913 496.672 76.1354C496.672 79.8642 493.283 83.4573 482.639 83.4573C472.266 83.4573 467.317 79.0506 466.571 73.7625H449.961C449.961 88.542 463.045 99.525 482.706 99.525C502.096 99.525 514.57 88.9488 514.57 75.593C514.503 65.1524 508.13 57.2881 494.571 55.9322Z"/>
      <path d="M566.64 55.9322C563.251 55.5932 552.268 54.6441 548.132 54.1017C542.912 53.4237 540.946 50.9153 540.946 48.2034C540.946 44.5424 543.793 41.0171 553.42 41.0171C564.132 41.0171 567.793 46.1018 568.471 51.1187H585.081C585.081 38.6442 574.098 25.0172 553.285 25.0172C533.827 25.0172 523.115 35.7968 523.115 48.4746C523.115 59.2542 530.302 67.3897 541.759 68.8134C549.217 69.7626 554.912 70.3049 561.488 70.9829C567.047 71.5252 568.742 73.4913 568.742 76.1354C568.742 79.8642 565.352 83.4573 554.708 83.4573C544.336 83.4573 539.386 79.0506 538.641 73.7625H522.031C522.031 88.542 535.115 99.525 554.776 99.525C574.166 99.525 586.64 88.9488 586.64 75.593C586.505 65.1524 580.132 57.2881 566.64 55.9322Z"/>
      <path d="M416.743 69.9663H397.489C392.54 69.9663 390.032 72.6104 390.032 76.2713C390.032 80.2035 393.964 83.5933 399.523 83.5933C407.659 83.5933 414.642 77.9662 416.743 69.9663ZM434.37 81.2205H444.268V98.3728H434.235C427.726 98.3728 421.15 94.7118 419.523 87.5933C415.116 94.5763 407.659 98.983 397.964 98.983C382.099 98.983 372.269 89.356 372.269 76.068C372.269 65.2884 379.998 55.3902 397.286 55.3902H416.675V51.5258C416.675 46.9835 413.014 43.3225 408.472 43.3225H377.422V26.2379H409.489C423.252 26.2379 434.438 37.4243 434.438 51.1868V81.2205H434.37Z"/>
      <path d="M273.629 62.2376C273.629 50.5767 266.375 42.3056 254.51 42.3056C242.646 42.3056 235.392 50.5767 235.392 62.2376C235.392 73.5595 242.646 82.2374 254.51 82.2374C266.375 82.2374 273.629 73.5595 273.629 62.2376ZM292.205 62.2376C292.205 84.1357 276.612 100 254.578 100C232.409 100 216.816 84.1357 216.816 62.2376C216.816 40.0683 232.002 24.6108 254.578 24.6108C277.154 24.6108 292.205 40.0683 292.205 62.2376Z"/>
      <path d="M368.47 26.2379H345.826L319.996 61.763L346.911 98.3728H369.622L342.504 61.5596L368.47 26.2379Z"/>
      <path d="M318.237 0H299.865V98.372H318.237V0Z"/>
      <path d="M192.268 62.3045C192.268 50.6436 185.014 42.3725 173.15 42.3725C161.285 42.3725 154.031 50.6436 154.031 62.3045C154.031 73.6942 161.285 82.3721 173.15 82.3721C185.014 82.3721 192.268 73.6264 192.268 62.3045ZM210.776 62.1011C210.776 83.9992 195.048 99.9991 173.353 99.9991C150.235 99.9991 135.455 84.8128 135.455 61.3554V0H153.963V32.2031C158.912 27.5252 166.234 24.5421 174.845 24.5421C196.878 24.6099 210.776 40.8132 210.776 62.1011Z"/>
    </svg>
  );

  // YooKassa Logo Component
  const YooKassaLogo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28" fill="none" className="w-full h-auto mt-15">
      <path fillRule="evenodd" clipRule="evenodd" d="M11.342 13.937C11.376 6.257 17.565 0 25.342 0c7.709 0 14.088 6.291 14 14 0 7.709-6.291 14-14 14-7.688 0-13.966-6.169-14-13.937v10.393H6.38L0 4.076h11.342v9.861zm8.772.063c0 2.835 2.392 5.228 5.228 5.228 2.924 0 5.228-2.393 5.228-5.228s-2.393-5.228-5.228-5.228c-2.836 0-5.228 2.393-5.228 5.228z" fill="#0070F0"/>
    </svg>
  );

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'robokassa',
      name: 'Robokassa',
      icon: (
        <div className="flex items-center justify-center w-full h-full px-2">
          <div className="w-full text-black dark:text-white">
            <RobokassaLogo />
          </div>
        </div>
      ),
      badge: 'Все способы',
      enabled: true,
      type: 'card'
    },
    {
      id: 'yookassa',
      name: 'ЮКасса',
      icon: (
        <div className="flex items-center justify-center w-full h-full px-2">
          <div className="w-full">
            <YooKassaLogo />
          </div>
        </div>
      ),
      badge: 'Карты',
      enabled: true,
      type: 'card'
    },
  ];

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
  const minAmount = 100;

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
      const paymentMethod = selectedMethod === 'robokassa' ? 'robokassa' : 'yookassa';

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
            <span>Статус VIP</span>
          </button>
        </div>

        {/* Content */}
        <div className="relative p-6 max-h-[calc(95vh-200px)] overflow-y-auto">
          {activeTab === 'balance' ? (
            /* Balance Tab */
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          {/* Left Side - Payment Methods */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Выберите платежную систему</h3>
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
                    relative rounded-xl border-2 transition-all duration-300 overflow-hidden group
                    ${selectedMethod === method.id && method.enabled
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500 shadow-xl shadow-green-500/30 scale-[1.02]'
                      : method.enabled
                      ? 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-600/50 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10'
                      : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Badge */}
                  {method.badge && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-[10px] font-bold text-white uppercase shadow-lg z-10">
                      {method.badge}
                    </div>
                  )}

                  {/* Check Mark */}
                  {selectedMethod === method.id && method.enabled && (
                    <div className="absolute top-3 left-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                      <div className="text-sm font-semibold text-gray-300">
                        {method.name}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="text-xs text-gray-500 text-center">
                      {method.id === 'robokassa' ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          <span className="px-2 py-1 bg-gray-800/50 rounded">МИР</span>
                          <span className="px-2 py-1 bg-gray-800/50 rounded">Visa</span>
                          <span className="px-2 py-1 bg-gray-800/50 rounded">Mastercard</span>
                          <span className="px-2 py-1 bg-gray-800/50 rounded">СБП</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1 justify-center">
                          <span className="px-2 py-1 bg-gray-800/50 rounded">Банковские карты</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/0 via-green-500/0 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </button>
              ))}
            </div>

            {/* Info Text */}
            <div className="text-sm text-gray-300 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/30 flex items-start gap-3">
              <span className="text-xl">🔒</span>
              <div>
                <p className="font-medium text-white mb-1">Защищенная оплата</p>
                <p className="text-gray-400">После нажатия кнопки "Пополнить" вы будете перенаправлены на безопасную страницу оплаты</p>
              </div>
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-yellow-500/20 shadow-lg space-y-5 h-fit sticky top-0 backdrop-blur-sm">
            {/* Amount Input */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <img src="/images/chiCoin.png" alt="chiCoin" className="w-5 h-5" />
                Сумма пополнения
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minAmount}
                  className="w-full bg-gray-900/70 border-2 border-gray-600 rounded-lg pl-4 pr-16 py-4 text-white text-2xl font-bold focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  placeholder="100"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">RUB</span>
              </div>
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <span>💵</span>
                Минимум: <span className="text-yellow-400 font-bold">{minAmount} RUB</span>
              </div>
            </div>

            {/* Bonus Display */}
            <div className="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-2 border-yellow-500/40 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-yellow-200/90 font-medium">Вы получите:</span>
                <div className="flex items-center gap-2">
                  <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />
                  <span className="text-2xl font-bold text-yellow-400">{amount || '0'}</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <label className="text-sm font-semibold text-gray-300 mb-2 block">
                🎁 Промокод (опционально)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Введите промокод"
                  className="flex-1 bg-gray-900/70 border-2 border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-lg transition-all shadow-lg"
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
                className="mt-0.5 w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-green-500 focus:ring-2 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer select-none leading-relaxed">
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
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wide shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 disabled:shadow-none"
            >
              <FaWallet className="text-xl" />
              <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
            </button>

            {/* Selected Method Info */}
            <div className="text-center text-xs text-gray-500 pt-2">
              Оплата через: <span className="text-gray-300 font-semibold">{selectedPaymentMethod?.name || 'Не выбрано'}</span>
            </div>
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
                  // const isBasic = tier.id === 1;
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
