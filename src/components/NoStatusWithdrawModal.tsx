import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Crown, RefreshCw } from 'lucide-react';

interface NoStatusWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoStatusWithdrawModal: React.FC<NoStatusWithdrawModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleBuyStatus = () => {
    onClose();
    navigate('/', { state: { openStatusModal: true } });
  };

  const handleGoToExchange = () => {
    onClose();
    navigate('/exchange?tab=exchange');
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-600/50 rounded-2xl p-6 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-white font-bold text-lg">
            {t('profile.no_status_withdraw_modal.title')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {t('profile.no_status_withdraw_modal.description')}
        </p>
        <p className="text-gray-400 text-xs mb-6 leading-relaxed italic">
          {t('profile.no_status_withdraw_modal.description_note')}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleBuyStatus}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
          >
            <Crown className="w-5 h-5 flex-shrink-0" />
            <span>{t('profile.no_status_withdraw_modal.buy_status')}</span>
          </button>
          <button
            onClick={handleGoToExchange}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
          >
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            <span>{t('profile.no_status_withdraw_modal.exchange_free')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoStatusWithdrawModal;
