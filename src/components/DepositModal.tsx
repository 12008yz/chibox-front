import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { X, Wallet, Lock, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useGetSubscriptionTiersQuery, useBuySubscriptionMutation } from '../features/subscriptions/subscriptionsApi';
import Monetary from './Monetary';
import { ReceivedIcon, ExchangeIcon } from './icons';

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
};

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, initialTab = 'balance', initialSelectedSubscription }) => {
  const { } = useTranslation();

  const [activeTab, setActiveTab] = useState<'balance' | 'subscription'>(initialTab);
  const [selectedMethod, setSelectedMethod] = useState<string>('freekassa');
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


  // FREEKASSA Logo Component
  const FreeKassaLogo = () => (
    <svg width="110" height="35" fill="none" className="w-full h-auto">
      <path d="M10.695 5.12H3.68v4.83h5.75v1.61H3.68V18H1.84V3.51h8.855v1.61zM21.39 18l-3.45-5.98h-2.76V18h-1.84V3.51h5.405c1.196 0 2.223.422 3.082 1.265s1.288 1.84 1.288 2.99c0 .629-.115 1.204-.345 1.725-.215.506-.475.905-.782 1.196a6.627 6.627 0 01-.943.713c-.307.2-.575.33-.805.391l-.322.115L23.46 18h-2.07zM15.18 5.12v5.29h3.565c.69 0 1.28-.253 1.771-.759a2.61 2.61 0 00.759-1.886c0-.736-.253-1.357-.759-1.863-.49-.521-1.081-.782-1.771-.782H15.18zm12.758 11.27h7.59V18h-9.43V3.51h9.2v1.61h-7.36v4.6h6.785v1.61h-6.785v5.06zm12.42 0h7.59V18h-9.43V3.51h9.2v1.61h-7.36v4.6h6.786v1.61h-6.785v5.06z" fill="#FA5745"></path>
      <path d="M52.78 3.51V18h-1.84V3.51h1.84zM58.875 18l-6.095-7.36 5.635-7.13H60.6l-5.75 7.13L61.06 18h-2.185zm12.757 0l-1.38-3.565h-5.98L62.892 18h-1.956l5.52-14.49h1.61L73.587 18h-1.954zm-4.37-11.5l-2.415 6.325h4.83L67.26 6.5zm7.355.805c0-1.012.452-1.917 1.357-2.714.905-.797 2.024-1.196 3.358-1.196 1.257 0 2.315.43 3.174 1.288.874.843 1.311 1.87 1.311 3.082h-1.84c0-.797-.253-1.457-.759-1.978-.506-.521-1.135-.782-1.886-.782-.828 0-1.518.238-2.07.713-.537.46-.805.989-.805 1.587 0 .644.26 1.165.782 1.564.537.399 1.18.713 1.932.943.751.215 1.503.46 2.254.736.767.276 1.41.72 1.932 1.334.537.598.805 1.372.805 2.323 0 1.073-.445 1.993-1.334 2.76-.89.767-2.055 1.15-3.496 1.15-1.472 0-2.645-.406-3.519-1.219-.874-.813-1.311-1.863-1.311-3.151h1.84c0 .874.253 1.556.759 2.047.521.475 1.265.713 2.231.713.935 0 1.664-.215 2.185-.644.537-.445.805-.997.805-1.656 0-.644-.268-1.165-.805-1.564-.521-.399-1.158-.705-1.909-.92-.751-.23-1.51-.483-2.277-.759a4.769 4.769 0 01-1.932-1.311c-.521-.613-.782-1.395-.782-2.346zm11.388 0c0-1.012.452-1.917 1.357-2.714.904-.797 2.024-1.196 3.358-1.196 1.257 0 2.315.43 3.174 1.288.874.843 1.31 1.87 1.31 3.082h-1.84c0-.797-.252-1.457-.758-1.978-.506-.521-1.135-.782-1.886-.782-.828 0-1.518.238-2.07.713-.537.46-.805.989-.805 1.587 0 .644.26 1.165.782 1.564.536.399 1.18.713 1.932.943.751.215 1.502.46 2.254.736.766.276 1.41.72 1.932 1.334.536.598.805 1.372.805 2.323 0 1.073-.445 1.993-1.334 2.76-.89.767-2.055 1.15-3.496 1.15-1.472 0-2.645-.406-3.52-1.219-.873-.813-1.31-1.863-1.31-3.151h1.84c0 .874.253 1.556.759 2.047.521.475 1.265.713 2.23.713.936 0 1.664-.215 2.186-.644.536-.445.805-.997.805-1.656 0-.644-.269-1.165-.805-1.564-.522-.399-1.158-.705-1.91-.92-.75-.23-1.51-.483-2.276-.759a4.769 4.769 0 01-1.932-1.311c-.522-.613-.782-1.395-.782-2.346zM107.052 18l-1.38-3.565h-5.98L98.312 18h-1.955l5.52-14.49h1.61l5.52 14.49h-1.955zm-4.37-11.5l-2.415 6.325h4.83L102.682 6.5z" fill="#fff"></path>
      <path d="M2.394 25.24c-.383.42-.574.957-.574 1.61 0 .653.191 1.19.574 1.61.383.42.845.63 1.386.63.541 0 1.003-.21 1.386-.63.383-.42.574-.957.574-1.61 0-.653-.191-1.19-.574-1.61-.383-.42-.845-.63-1.386-.63-.541 0-1.003.21-1.386.63zM1.68 23.7l.28.7c.047-.056.117-.126.21-.21.093-.084.303-.196.63-.336.327-.15.677-.224 1.05-.224.821 0 1.517.303 2.086.91.57.607.854 1.377.854 2.31s-.285 1.703-.854 2.31c-.57.607-1.265.91-2.086.91-.373 0-.719-.07-1.036-.21-.308-.14-.527-.28-.658-.42l-.196-.21v3.01H.91V23.7h.77zm8.883-.07c.691 0 1.26.21 1.708.63.448.42.672.933.672 1.54V30h-.77l-.28-.7a2.175 2.175 0 01-.21.21c-.093.084-.303.2-.63.35-.326.14-.676.21-1.05.21-.616 0-1.12-.182-1.512-.546a1.762 1.762 0 01-.588-1.344c0-.653.294-1.153.882-1.498.588-.355 1.624-.532 3.108-.532v-.35c0-.317-.13-.593-.392-.826a1.3 1.3 0 00-.938-.364c-.69 0-1.11.303-1.26.91h-1.12c.075-.55.322-1.003.742-1.358.42-.355.966-.532 1.638-.532zm-.56 5.46c.532 0 .98-.15 1.344-.448.364-.308.546-.649.546-1.022v-.49c-1.176 0-1.96.089-2.352.266-.392.177-.588.462-.588.854 0 .224.098.42.294.588.196.168.448.252.756.252zm6.368.77l-2.45-6.16h1.12l1.89 4.83 1.89-4.83h1.12l-2.73 6.86c-.252.635-.518 1.083-.798 1.344-.27.27-.611.406-1.022.406l-.42-.07v-.84c.299 0 .528-.065.686-.196.168-.13.313-.345.434-.644l.28-.7zm10.853-6.23c.579 0 1.073.238 1.484.714.41.476.616 1.101.616 1.876V30h-1.05v-3.78c0-.504-.121-.896-.364-1.176a1.1 1.1 0 00-.896-.434c-.364 0-.677.15-.938.448-.261.299-.392.686-.392 1.162V30h-1.05v-3.78c0-.504-.121-.896-.364-1.176a1.1 1.1 0 00-.896-.434c-.355 0-.667.154-.938.462-.261.308-.392.69-.392 1.148V30h-1.05v-6.3h.77l.28.7a.625.625 0 01.056-.084c.028-.037.089-.098.182-.182a1.51 1.51 0 01.308-.238c.112-.065.257-.126.434-.182.177-.056.364-.084.56-.084.373 0 .705.093.994.28.29.187.49.373.602.56l.154.28c.019-.028.042-.065.07-.112.028-.056.098-.15.21-.28.112-.13.233-.243.364-.336a2.02 2.02 0 01.532-.266c.224-.084.462-.126.714-.126zm7.836 4.69h1.12c-.233.504-.57.924-1.008 1.26-.438.327-.966.49-1.582.49-.821 0-1.517-.303-2.086-.91-.57-.607-.854-1.377-.854-2.31 0-.924.28-1.69.84-2.296.57-.616 1.246-.924 2.03-.924.784 0 1.447.294 1.988.882.541.588.812 1.344.812 2.268l-.07.56h-4.48c.038.457.238.863.602 1.218s.77.532 1.218.532c.597 0 1.087-.257 1.47-.77zm-1.54-3.71c-.42 0-.803.173-1.148.518-.336.345-.537.78-.602 1.302h3.43c-.065-.55-.257-.99-.574-1.316-.308-.336-.676-.504-1.106-.504zm7.065-.98c.681 0 1.26.257 1.736.77s.714 1.167.714 1.96V30h-1.05v-3.64c0-.513-.15-.933-.448-1.26a1.424 1.424 0 00-1.092-.49c-.495 0-.901.163-1.218.49-.308.317-.462.737-.462 1.26V30h-1.05v-6.3h.77l.28.7c.046-.056.116-.126.21-.21.093-.084.294-.196.602-.336.317-.15.653-.224 1.008-.224zm4.828-.7v-.91h.91v1.68h1.4v.98h-1.4v3.29c0 .345.093.62.28.826.196.196.453.294.77.294l.35-.07v.91c-.14.093-.35.14-.63.14-.504 0-.933-.196-1.288-.588-.355-.392-.532-.896-.532-1.512v-3.29h-1.12v-.98h.49c.513 0 .77-.257.77-.77zm10.992 5.25c0 .541-.2.994-.602 1.358-.392.355-.914.532-1.568.532-.681 0-1.227-.182-1.638-.546-.41-.364-.634-.835-.672-1.414h1.05c.038.29.164.527.378.714.215.177.509.266.882.266.336 0 .607-.089.812-.266a.821.821 0 00.308-.644.627.627 0 00-.336-.574c-.224-.14-.5-.243-.826-.308-.317-.075-.64-.159-.966-.252a1.672 1.672 0 01-.826-.532c-.224-.27-.336-.625-.336-1.064 0-.504.196-.933.588-1.288.392-.355.896-.532 1.512-.532.654 0 1.167.173 1.54.518.383.345.593.803.63 1.372h-1.05c-.074-.607-.448-.91-1.12-.91-.298 0-.55.084-.756.252-.196.168-.294.364-.294.588 0 .252.112.448.336.588.224.13.495.233.812.308.327.065.654.145.98.238.327.093.602.275.826.546.224.261.336.611.336 1.05zm3.074 1.68l-2.45-6.16h1.12l1.89 4.83 1.89-4.83h1.12l-2.73 6.86c-.252.635-.518 1.083-.798 1.344-.271.27-.612.406-1.022.406l-.42-.07v-.84c.298 0 .527-.065.686-.196.168-.13.312-.345.434-.644l.28-.7zm8.752-1.68c0 .541-.2.994-.602 1.358-.392.355-.914.532-1.568.532-.68 0-1.227-.182-1.638-.546-.41-.364-.634-.835-.672-1.414h1.05a1.1 1.1 0 00.378.714c.215.177.51.266.882.266.336 0 .607-.089.812-.266a.822.822 0 00.308-.644.627.627 0 00-.336-.574c-.224-.14-.499-.243-.826-.308-.317-.075-.639-.159-.966-.252a1.671 1.671 0 01-.826-.532c-.224-.27-.336-.625-.336-1.064 0-.504.196-.933.588-1.288.392-.355.896-.532 1.512-.532.654 0 1.167.173 1.54.518.383.345.593.803.63 1.372h-1.05c-.074-.607-.448-.91-1.12-.91-.298 0-.55.084-.756.252-.196.168-.294.364-.294.588 0 .252.112.448.336.588.224.13.495.233.812.308.327.065.654.145.98.238.327.093.602.275.826.546.224.261.336.611.336 1.05zm2.024-5.25v-.91h.91v1.68h1.4v.98h-1.4v3.29c0 .345.093.62.28.826.196.196.453.294.77.294l.35-.07v.91c-.14.093-.35.14-.63.14-.504 0-.934-.196-1.288-.588-.355-.392-.532-.896-.532-1.512v-3.29h-1.12v-.98h.49c.513 0 .77-.257.77-.77zm7.708 5.39h1.12a3.32 3.32 0 01-1.008 1.26c-.44.327-.966.49-1.582.49-.822 0-1.517-.303-2.087-.91-.569-.607-.854-1.377-.854-2.31 0-.924.28-1.69.84-2.296.57-.616 1.246-.924 2.03-.924.785 0 1.447.294 1.989.882.54.588.811 1.344.811 2.268l-.07.56h-4.48c.038.457.239.863.603 1.218.363.355.77.532 1.218.532.597 0 1.087-.257 1.47-.77zm-1.54-3.71c-.42 0-.803.173-1.148.518-.337.345-.537.78-.603 1.302h3.43c-.065-.55-.256-.99-.574-1.316-.308-.336-.676-.504-1.106-.504zm10.424-.98c.579 0 1.073.238 1.484.714.41.476.616 1.101.616 1.876V30h-1.05v-3.78c0-.504-.121-.896-.364-1.176a1.1 1.1 0 00-.896-.434c-.364 0-.677.15-.938.448-.261.299-.392.686-.392 1.162V30h-1.05v-3.78c0-.504-.121-.896-.364-1.176a1.1 1.1 0 00-.896-.434c-.355 0-.667.154-.938.462-.261.308-.392.69-.392 1.148V30h-1.05v-6.3h.77l.28.7a.635.635 0 01.056-.084c.028-.037.089-.098.182-.182.093-.093.196-.173.308-.238.112-.065.257-.126.434-.182.177-.056.364-.084.56-.084.373 0 .705.093.994.28.29.187.49.373.602.56l.154.28c.019-.028.042-.065.07-.112.028-.056.098-.15.21-.28.112-.13.233-.243.364-.336a2.02 2.02 0 01.532-.266c.224-.084.462-.126.714-.126z" fill="#888"></path>
    </svg>
  );

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'freekassa',
      name: 'FREEKASSA',
      icon: (
        <div className="flex items-center justify-center w-full h-full px-2">
          <div className="w-full text-black dark:text-white">
            <FreeKassaLogo />
          </div>
        </div>
      ),
      badge: 'Все способы',
      enabled: true,
      type: 'card'
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
      const result = await topUpBalance({
        amount: amountNum,
        currency: 'ChiCoins',
        payment_method: 'freekassa'
      }).unwrap();

      if (result.success && result.data) {
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
          toast.success('Переход к оплате...');
          onClose();
        }
      }
    } catch (error: any) {
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
        method: 'bank_card',
        paymentMethod: 'freekassa'
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
      toast.error(error?.data?.message || 'Ошибка при покупке подписки');
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
                            {method.id === 'freekassa' ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">МИР</span>
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Visa</span>
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Mastercard</span>
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">СБП</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-700/50 rounded text-[10px] sm:text-xs">Банковские карты</span>
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
                      <p className="text-gray-400 text-xs sm:text-sm">После нажатия кнопки "Пополнить" вы будете перенаправлены на безопасную страницу оплаты</p>
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
                            {method.id === 'freekassa' ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-2 py-1 bg-gray-700/50 rounded">МИР</span>
                                <span className="px-2 py-1 bg-gray-700/50 rounded">Visa</span>
                                <span className="px-2 py-1 bg-gray-700/50 rounded">Mastercard</span>
                                <span className="px-2 py-1 bg-gray-700/50 rounded">СБП</span>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1 justify-center">
                                <span className="px-2 py-1 bg-gray-700/50 rounded">Банковские карты</span>
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
                      <p className="text-gray-400">После нажатия кнопки "Пополнить" вы будете перенаправлены на безопасную страницу оплаты</p>
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
