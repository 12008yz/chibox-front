import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaGift } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useApplyPromoCodeMutation } from '../../../../features/user/userApi';

interface PromoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PromoCodeModal: React.FC<PromoCodeModalProps> = ({ isOpen, onClose }) => {
  const [promoCode, setPromoCode] = useState('');
  const [applyPromo, { isLoading }] = useApplyPromoCodeMutation();

  const handleApply = async () => {
    if (!promoCode.trim()) {
      toast.error('Введите промокод');
      return;
    }

    try {
      const result = await applyPromo({ code: promoCode.trim().toUpperCase() }).unwrap();

      if (result.success) {
        toast.success(result.message || 'Промокод успешно применён!');
        setPromoCode('');
        onClose();
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Ошибка при применении промокода';
      toast.error(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleApply();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#1a1f2e] to-[#16192a] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <FaGift className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Активировать промокод</h2>
              <p className="text-sm text-gray-400 mt-0.5">Введите код для получения бонусов</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Promo Code Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Промокод
            </label>
            <div className="relative">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Введите промокод"
                className="w-full bg-gray-900/70 border border-gray-700 rounded-lg px-4 py-3.5 text-white text-lg font-semibold tracking-wider focus:outline-none focus:border-purple-500 transition-colors uppercase placeholder:normal-case placeholder:tracking-normal"
                disabled={isLoading}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <FaGift className="text-gray-600 text-xl" />
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span className="text-purple-400 font-bold">💰</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Бонусы к балансу</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Получите бесплатные ChiCoins
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <span className="text-blue-400 font-bold">👑</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">VIP подписка</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Получите дни VIP статуса
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading || !promoCode.trim()}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
            >
              {isLoading ? 'Применение...' : 'Активировать'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PromoCodeModal;
