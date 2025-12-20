import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Gift } from 'lucide-react';
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
      const result = await applyPromo({ promo_code: promoCode.trim().toUpperCase() }).unwrap();

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f1419] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Активировать промокод</h2>
              <p className="text-sm text-gray-400 mt-1">Введите код для получения бонусов</p>
            </div>
          </div>

          {/* Promo Code Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Промокод
            </label>
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="ВВЕДИТЕ КОД"
              className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-lg font-semibold tracking-widest focus:outline-none focus:border-gray-600 hover:border-gray-600 transition-colors uppercase placeholder:text-gray-600"
              disabled={isLoading}
              autoFocus
            />
          </div>


          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-800 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleApply}
              disabled={isLoading || !promoCode.trim()}
              className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 active:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white"
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
