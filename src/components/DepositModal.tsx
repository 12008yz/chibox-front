import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Wallet, Lock, Crown, History } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation, useGetPaymentHistoryQuery } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import Monetary from './Monetary';
import { ReceivedIcon } from './icons';
import { getApiErrorMessage } from '../utils/config';

// Иконка банковской карты (Credit Card)
const BankCardIcon = () => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="#4573E3">
        <path d="M53,0 L5,0 C2.25,0 0,2.25 0,5 L0,35 C0,37.75 2.25,40 5,40 L53,40 C55.75,40 58,37.75 58,35 L58,5 C58,2.25 55.75,0 53,0 L53,0 Z M53,2 C54.654,2 56,3.346 56,5 L56,35 C56,36.654 54.654,38 53,38 L5,38 C3.346,38 2,36.654 2,35 L2,5 C2,3.346 3.346,2 5,2 L53,2 L53,2 Z" />
        <path d="M57.6715,3.2701 C57.8735,3.8121 57.9995,4.3901 57.9995,5.0001 L57.9995,35.0001 C57.9995,37.7501 55.7495,40.0001 52.9995,40.0001 L4.9995,40.0001 C4.3905,40.0001 3.8115,39.8741 3.2705,39.6711 C4.3705,41.0841 6.0815,42.0001 7.9995,42.0001 L53.9995,42.0001 C57.2995,42.0001 59.9995,39.3001 59.9995,36.0001 L59.9995,8.0001 C59.9995,6.0811 59.0835,4.3701 57.6715,3.2701" fillOpacity="0.5" />
        <path d="M15,26 L7,26 C6.45,26 6,25.55 6,25 L6,19 C6,18.45 6.45,18 7,18 L15,18 C15.55,18 16,18.45 16,19 L16,25 C16,25.55 15.55,26 15,26" />
        <path d="M46,10 C46,12.209 44.209,14 42,14 C39.791,14 38,12.209 38,10 C38,7.791 39.791,6 42,6 C44.209,6 46,7.791 46,10" fillOpacity="0.5" />
        <path d="M58,24 L63,24 L63,16 L58,16 L58,24 Z" />
        <path d="M59,8 L58,8 L58,10 L59,10 C60.654,10 62,11.346 62,13 L62,43 C62,44.654 60.654,46 59,46 L11,46 C9.346,46 8,44.654 8,43 L8,40 L6,40 L6,43 C6,45.75 8.25,48 11,48 L59,48 C61.75,48 64,45.75 64,43 L64,13 C64,10.25 61.75,8 59,8" />
        <path d="M52,10 C52,12.209 50.209,14 48,14 C45.791,14 44,12.209 44,10 C44,7.791 45.791,6 48,6 C50.209,6 52,7.791 52,10" />
        <path d="M13,34 L7,34 C6.45,34 6,33.55 6,33 L6,33 C6,32.45 6.45,32 7,32 L13,32 C13.55,32 14,32.45 14,33 L14,33 C14,33.55 13.55,34 13,34" />
        <path d="M27,34 L17,34 C16.45,34 16,33.55 16,33 L16,33 C16,32.45 16.45,32 17,32 L27,32 C27.55,32 28,32.45 28,33 L28,33 C28,33.55 27.55,34 27,34" />
      </g>
    </g>
  </svg>
);

// URL логотипа СБП (logo-teka.com)
const SBP_LOGO_URL = 'https://logo-teka.com/wp-content/uploads/2025/06/sbp-logo.svg';

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
  payment_method: string;
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
  const [depositBonusPercent, setDepositBonusPercent] = useState<number | null>(null);
  const [depositBonusMinAmount, setDepositBonusMinAmount] = useState<number>(0);
  const [appliedDepositPromoCode, setAppliedDepositPromoCode] = useState<string>('');

  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();
  const [applyPromo] = useApplyPromoCodeMutation();
  const [buySubscription, { isLoading: isSubscriptionLoading }] = useBuySubscriptionMutation();

  const { data: subscriptionTiersData } = useGetSubscriptionTiersQuery();
  const subscriptionTiers = subscriptionTiersData?.data || [];

  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    { limit: 50 },
    { skip: !isOpen }
  );
  const paymentHistory = paymentHistoryData?.success ? paymentHistoryData.data?.items ?? [] : [];
  const previewCount = 8;
  const paymentHistoryPreview = paymentHistory.slice(0, previewCount);
  const hasMoreHistory = paymentHistory.length > previewCount;
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const renderHistoryRow = (item: { id: string; purpose: string; amount: number; description: string; completed_at: string | null }) => {
    const date = item.completed_at
      ? new Date(item.completed_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '—';
    const isSubscription = item.purpose === 'subscription';
    return (
      <div key={item.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-gray-800/40">
        <span className="text-gray-500 shrink-0 w-20">{date}</span>
        <span className={`truncate mx-1 min-w-0 ${isSubscription ? 'text-amber-400/90' : 'text-emerald-400/90'}`}>{item.description}</span>
        {isSubscription && <span className="text-gray-500 shrink-0"><Monetary value={item.amount} /></span>}
      </div>
    );
  };

  const historyListClassName = 'max-h-32 overflow-y-auto overflow-x-hidden space-y-1 pr-1 rounded';

  useEffect(() => {
    if (initialSelectedSubscription !== undefined) {
      setSelectedSubscription(initialSelectedSubscription);
    }
  }, [initialSelectedSubscription]);

  // Блокировка прокрутки страницы при открытом модальном окне
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'unitpay_card',
      name: 'Банковская карта',
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <BankCardIcon />
        </div>
      ),
      badge: 'VISA, МИР, MASTERCARD',
      enabled: true,
      type: 'card',
      payment_method: 'unitpay',
      unitpay_system: 'card'
    },
    {
      id: 'unitpay_sbp',
      name: 'СБП',
      icon: (
        <div className="flex items-center justify-center w-full h-full">
          <img src={SBP_LOGO_URL} alt="СБП" className="max-w-[160px] w-full h-full object-contain mt-[10px]" />
        </div>
      ),
      badge: 'СИСТЕМА БЫСТРЫХ ПЛАТЕЖЕЙ',
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
      const payload: { amount: number; currency: string; payment_method: string; unitpay_system?: string; promo_code?: string } = {
        amount: amountNum,
        currency: 'ChiCoins',
        payment_method: selectedPaymentMethod?.payment_method || 'unitpay'
      };
      if (selectedPaymentMethod?.unitpay_system) {
        payload.unitpay_system = selectedPaymentMethod.unitpay_system;
      }
      if (appliedDepositPromoCode.trim()) {
        payload.promo_code = appliedDepositPromoCode.trim();
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
        const data = result as { success?: boolean; message?: string; data?: { is_deposit_bonus?: boolean; bonus_percent?: number; min_payment_amount?: number } };
        if (data.data?.is_deposit_bonus && data.data.bonus_percent != null) {
          setDepositBonusPercent(data.data.bonus_percent);
          setDepositBonusMinAmount(Number(data.data.min_payment_amount) || 0);
          setAppliedDepositPromoCode(promoCode.trim().toUpperCase());
          toast.success(data.message || `Промокод: +${data.data.bonus_percent}% к сумме пополнения`);
        } else {
          toast.success(result.message || 'Промокод применён!');
          setPromoCode('');
          setDepositBonusPercent(null);
          setAppliedDepositPromoCode('');
        }
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
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-4 py-3 sm:py-4 text-white text-xl sm:text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="100"
                      />
                      {depositBonusPercent != null && parseInt(amount, 10) >= depositBonusMinAmount && (
                        <p className="text-xs text-green-400 mt-1.5">
                          Получите {parseInt(amount, 10) + Math.round(parseInt(amount, 10) * depositBonusPercent / 100)} ChiCoins после оплаты
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2 flex-wrap">
                      Промокод на бонус к пополнению (опционально)
                      <span className="text-xs text-purple-400 font-normal hidden sm:inline">DEPOSIT5, DEPOSIT10, DEPOSIT15</span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод"
                        className="flex-1 min-w-0 bg-gray-900/70 border border-gray-700 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase text-sm sm:text-base"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base shadow-lg hover:shadow-purple-500/50"
                      >
                        OK
                      </button>
                      {depositBonusPercent != null && (
                        <span className="text-sm font-medium text-green-400 whitespace-nowrap">+{depositBonusPercent}% бонус</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Бонус применится к сумме пополнения после успешной оплаты
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
                          relative rounded-xl border-2 transition-all duration-300 overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-500 hover:bg-gray-800/70'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {method.badge && (
                          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-900/80 backdrop-blur-sm rounded-md text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                            {method.badge}
                          </div>
                        )}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="p-5 sm:p-8 flex flex-col items-center justify-center gap-4 sm:gap-5">
                          <div className="w-full flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                            {method.icon}
                          </div>
                          <div className="text-center">
                            <div className="text-sm sm:text-base font-semibold text-white">
                              {method.name}
                            </div>
                          </div>
                        </div>
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3 sm:p-4 border border-gray-700/30 flex items-start gap-2 sm:gap-3">
                    <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
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
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-3 sm:py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-sm sm:text-base rounded-lg transition-colors flex items-center justify-center gap-2 sm:gap-3"
                  >
                    <Wallet className="text-base sm:text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>
                  {selectedPaymentMethod && (
                    <div className="text-center text-xs text-gray-500 pt-2">
                      Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod.name}</span>
                    </div>
                  )}
                  {/* История — мобильная версия */}
                  <div className="border-t border-gray-700/30 pt-4 mt-2">
                    <div className="flex items-center justify-between gap-2 text-gray-400 text-xs font-medium mb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        <span>История</span>
                      </div>
                      {hasMoreHistory && (
                        <button
                          type="button"
                          onClick={() => setHistoryModalOpen(true)}
                          className="text-amber-400/90 hover:text-amber-400 text-xs font-medium"
                        >
                          Вся история ({paymentHistory.length})
                        </button>
                      )}
                    </div>
                    <div className={historyListClassName}>
                      {paymentHistoryPreview.length === 0 ? (
                        <p className="text-xs text-gray-500 py-1">Пока нет операций</p>
                      ) : (
                        paymentHistoryPreview.map(renderHistoryRow)
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Version */}
              <div className="hidden lg:grid lg:grid-cols-[1fr_400px] gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Выберите платежную систему</h3>
                    <p className="text-sm text-gray-400">Безопасная оплата через проверенных партнеров</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => method.enabled && setSelectedMethod(method.id)}
                        disabled={!method.enabled}
                        className={`
                          relative rounded-xl border-2 transition-all duration-300 overflow-hidden
                          ${selectedMethod === method.id && method.enabled
                            ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-emerald-500 shadow-lg shadow-emerald-500/20'
                            : method.enabled
                            ? 'bg-gray-800/50 border-gray-700/50 hover:border-gray-500 hover:bg-gray-800/70'
                            : 'bg-gray-900/20 border-gray-700/30 opacity-40 cursor-not-allowed'
                          }
                        `}
                      >
                        {method.badge && (
                          <div className="absolute top-3 right-3 px-3 py-1 bg-gray-900/80 backdrop-blur-sm rounded-md text-[9px] font-semibold text-gray-400 uppercase tracking-wide">
                            {method.badge}
                          </div>
                        )}
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute top-3 left-3 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="p-8 flex flex-col items-center justify-center gap-5">
                          <div className="w-full flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
                            {method.icon}
                          </div>
                          <div className="text-center">
                            <div className="text-base font-semibold text-white">
                              {method.name}
                            </div>
                          </div>
                        </div>
                        {selectedMethod === method.id && method.enabled && (
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 flex items-start gap-3">
                    <Lock className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white mb-1">Защищенная оплата</p>
                      <p className="text-gray-400">Выберите способ — после «Пополнить» откроется форма оплаты картой или СБП без дополнительного выбора</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700/30 space-y-5 h-fit sticky top-0">
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
                        className="w-full bg-gray-900/70 border border-gray-700 rounded-lg pl-4 pr-4 py-4 text-white text-2xl font-semibold focus:outline-none focus:border-gray-500 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="100"
                      />
                      {depositBonusPercent != null && parseInt(amount, 10) >= depositBonusMinAmount && (
                        <p className="text-xs text-green-400 mt-1.5">
                          Получите {parseInt(amount, 10) + Math.round(parseInt(amount, 10) * depositBonusPercent / 100)} ChiCoins после оплаты
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                       Промокод (опционально)
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Введите промокод"
                        className="flex-1 min-w-0 bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                      >
                        OK
                      </button>
                      {depositBonusPercent != null && (
                        <span className="text-sm font-medium text-green-400 whitespace-nowrap">+{depositBonusPercent}% бонус</span>
                      )}
                    </div>
                  </div>
                  <div className="border-t border-gray-700/50"></div>
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
                  <button
                    onClick={handleDeposit}
                    disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
                    className="w-full py-4 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold text-base rounded-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <Wallet className="text-lg" />
                    <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить баланс'}</span>
                  </button>
                  <div className="text-center text-xs text-gray-500 pt-2">
                    Оплата через: <span className="text-gray-300 font-medium">{selectedPaymentMethod?.name || 'Не выбрано'}</span>
                  </div>
                  {/* История — в правой колонке, скролл при большом списке */}
                  <div className="border-t border-gray-700/50 pt-4 mt-2">
                    <div className="flex items-center justify-between gap-2 text-gray-400 text-xs font-medium mb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        <span>История</span>
                      </div>
                      {hasMoreHistory && (
                        <button
                          type="button"
                          onClick={() => setHistoryModalOpen(true)}
                          className="text-amber-400/90 hover:text-amber-400 text-xs font-medium shrink-0"
                        >
                          Вся история ({paymentHistory.length})
                        </button>
                      )}
                    </div>
                    <div className={historyListClassName}>
                      {paymentHistoryPreview.length === 0 ? (
                        <p className="text-xs text-gray-500 py-1">Пока нет операций</p>
                      ) : (
                        paymentHistoryPreview.map(renderHistoryRow)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Subscription Tab - Лаконичная версия */
            <div className="space-y-6">
              {/* Subscription Tiers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionTiers.map((tier) => {
                  const isPro = tier.id === 2;
                  const isPremium = tier.id === 3;
                  const isSelected = selectedSubscription === tier.id;

                  return (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedSubscription(tier.id)}
                      className={`
                        relative rounded-xl border-2 p-5 transition-all text-left
                        ${isSelected
                          ? 'bg-gray-800 border-white'
                          : 'bg-gray-800/30 border-gray-700/50 hover:border-gray-600'
                        }
                        ${isPro ? 'md:scale-105 md:z-10' : ''}
                      `}
                    >
                      {/* Popular Badge */}
                      {isPro && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 rounded-full text-[10px] font-bold text-black uppercase">
                          Популярный
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <img
                          src={isPremium ? '/images/status++.png' : isPro ? '/images/status+.png' : '/images/status.png'}
                          alt={tier.name}
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                          <p className="text-xs text-gray-400">30 дней</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-3xl font-bold text-white mb-4">
                        <Monetary value={tier.price} />
                      </div>

                      {/* Features */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <ReceivedIcon className="w-4 h-4 text-green-400" />
                          <span>+{tier.bonus_percentage}% к дропу</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <ReceivedIcon className="w-4 h-4 text-green-400" />
                          <span>VIP иконка</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <ReceivedIcon className="w-4 h-4 text-green-400" />
                          <span>VIP чат</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <ReceivedIcon className="w-4 h-4 text-green-400" />
                          <span>Доступ ко всем бонусам</span>
                        </div>
                        {isPremium && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <ReceivedIcon className="w-4 h-4 text-green-400" />
                            <span>Без дубликатов</span>
                          </div>
                        )}
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Purchase Button */}
              {selectedSubscription && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-800/40 rounded-xl p-4 border border-gray-700/30">
                  <div className="flex items-center gap-3">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">
                      Выбрано: <span className="text-white font-semibold">{subscriptionTiers.find(t => t.id === selectedSubscription)?.name}</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleSubscriptionPurchase(selectedSubscription)}
                    disabled={isSubscriptionLoading}
                    className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:cursor-not-allowed text-black disabled:text-gray-500 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isSubscriptionLoading ? 'Загрузка...' : 'Купить'}</span>
                  </button>
                </div>
              )}

              {/* История на вкладке VIP */}
              <div className="mt-6 pt-4 border-t border-gray-700/30">
                <div className="flex items-center justify-between gap-2 text-gray-400 text-xs font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    <span>История</span>
                  </div>
                  {hasMoreHistory && (
                    <button
                      type="button"
                      onClick={() => setHistoryModalOpen(true)}
                      className="text-amber-400/90 hover:text-amber-400 text-xs font-medium"
                    >
                      Вся история ({paymentHistory.length})
                    </button>
                  )}
                </div>
                <div className={historyListClassName}>
                  {paymentHistoryPreview.length === 0 ? (
                    <p className="text-xs text-gray-500 py-1">Пока нет операций</p>
                  ) : (
                    paymentHistoryPreview.map(renderHistoryRow)
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно «Вся история» */}
      {historyModalOpen && (
        <div data-no-click-sound className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setHistoryModalOpen(false)} />
          <div data-no-click-sound className="relative bg-[#1a1f2e] rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-700/30 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-700/20">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-gray-400" />
                Вся история
              </h3>
              <button
                type="button"
                onClick={() => setHistoryModalOpen(false)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)] space-y-1.5 pr-2">
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">Пока нет операций</p>
              ) : (
                paymentHistory.map(renderHistoryRow)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DepositModal;
