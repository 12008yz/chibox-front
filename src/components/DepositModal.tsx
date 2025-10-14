import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { FaTimes, FaWallet, FaCreditCard, FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether, SiBinance, SiDogecoin, SiLitecoin, SiTon, SiPolygon } from 'react-icons/si';
import toast from 'react-hot-toast';
import { useTopUpBalanceMutation, useApplyPromoCodeMutation } from '../features/user/userApi';
import { useAppSelector } from '../store/hooks';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);

  const [selectedCountry, setSelectedCountry] = useState('RU');
  const [selectedMethod, setSelectedMethod] = useState<string>('robokassa');
  const [amount, setAmount] = useState<string>('100');
  const [promoCode, setPromoCode] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const [topUpBalance, { isLoading: isTopUpLoading }] = useTopUpBalanceMutation();
  const [applyPromo] = useApplyPromoCodeMutation();

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

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-[#1a1f2e] via-[#1e2433] to-[#1a1f2e] rounded-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-700/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-black/20">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <FaWallet className="text-yellow-400" />
            <span>Пополнение баланса</span>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all duration-200"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 p-6 max-h-[calc(95vh-88px)] overflow-y-auto">
          {/* Left Side - Payment Methods */}
          <div className="space-y-4">
            {/* Country Selector */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <label className="text-sm text-gray-400 mb-2 block uppercase tracking-wide">
                Показаны способы оплаты для:
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
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
                    relative p-4 rounded-xl border-2 transition-all duration-200 min-h-[100px] flex flex-col items-center justify-center
                    ${selectedMethod === method.id && method.enabled
                      ? 'bg-green-500/20 border-green-500 shadow-lg shadow-green-500/20'
                      : method.enabled
                      ? 'bg-gray-800/40 border-gray-600 hover:border-gray-500 hover:bg-gray-700/40'
                      : 'bg-gray-900/20 border-gray-700 opacity-40 cursor-not-allowed'
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
            <div className="text-sm text-gray-400 bg-gray-800/20 rounded-lg p-4 border border-gray-700/30">
              Для пополнения баланса вы будете перенаправлены на сайт платежной системы.
            </div>
          </div>

          {/* Right Side - Payment Form */}
          <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-xl p-6 border border-gray-700/50 space-y-4 h-fit sticky top-0">
            {/* Selected Method */}
            <div>
              <div className="text-sm text-gray-400 mb-2 uppercase tracking-wide">
                Выбранный способ оплаты
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  {selectedPaymentMethod?.icon || <FaWallet className="text-2xl text-gray-500" />}
                </div>
                <div className="text-lg font-semibold text-white">
                  {selectedPaymentMethod?.name || 'Не выбрано'}
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
                  className="flex-1 bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors uppercase tracking-wide"
                >
                  Применить
                </button>
              </div>
            </div>

            {/* Min Amount */}
            <div className="text-sm text-gray-400">
              Минимальная сумма: <span className="text-white font-semibold">{minAmount} RUB</span>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex items-center bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 focus-within:border-yellow-500 transition-colors">
                <span className="text-2xl text-gray-400 mr-2">💰</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={minAmount}
                  className="flex-1 bg-transparent text-white text-lg font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Bonus Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="text-sm text-yellow-200/80">
                💡 На баланс поступит: <span className="font-bold text-yellow-400">{amount || '0'} ⚡</span>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer select-none">
                Я принимаю условия{' '}
                <a href="#" className="text-green-400 hover:text-green-300 underline">
                  Пользовательского соглашения
                </a>
              </label>
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={isTopUpLoading || !agreedToTerms || parseInt(amount) < minAmount || !selectedPaymentMethod?.enabled}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide shadow-lg"
            >
              <FaWallet className="text-xl" />
              <span>{isTopUpLoading ? 'Создание платежа...' : 'Пополнить'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DepositModal;
