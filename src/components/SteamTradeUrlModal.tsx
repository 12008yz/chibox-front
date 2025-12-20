import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SteamTradeUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tradeUrl: string) => void;
  canSkip?: boolean;
}

const SteamTradeUrlModal: React.FC<SteamTradeUrlModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  canSkip = true
}) => {
  const [tradeUrl, setTradeUrl] = useState('');
  const [error, setError] = useState('');

  const validateTradeUrl = (url: string): boolean => {
    // Steam Trade URL format: https://steamcommunity.com/tradeoffer/new/?partner=XXXXXXXX&token=XXXXXXXX
    const steamTradeUrlPattern = /^https?:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=\d+&token=[a-zA-Z0-9_-]+$/;
    return steamTradeUrlPattern.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tradeUrl.trim()) {
      setError('Пожалуйста, введите Steam Trade URL');
      return;
    }

    if (!validateTradeUrl(tradeUrl)) {
      setError('Неверный формат Steam Trade URL. Пример: https://steamcommunity.com/tradeoffer/new/?partner=123456789&token=AbCdEfGh');
      return;
    }

    onSubmit(tradeUrl);
  };

  const handleSkip = () => {
    if (canSkip) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && canSkip) {
            handleSkip();
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-[#1a1528] to-[#0f0a1a] rounded-2xl p-6 md:p-8 max-w-2xl w-full border border-purple-500/20 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Steam Trade URL</h2>
            </div>
            {canSkip && (
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                Чтобы получать предметы в Steam, нам нужна ваша <strong className="text-purple-400">Steam Trade URL</strong>.
                Без неё мы не сможем отправлять вам выигранные предметы.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="tradeUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Steam Trade URL
                </label>
                <input
                  id="tradeUrl"
                  type="text"
                  value={tradeUrl}
                  onChange={(e) => {
                    setTradeUrl(e.target.value);
                    setError('');
                  }}
                  placeholder="https://steamcommunity.com/tradeoffer/new/?partner=..."
                  className="w-full px-4 py-3 bg-[#0f0a1a] border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                />
                {error && (
                  <p className="mt-2 text-sm text-red-400">{error}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-blue-400">Как получить Steam Trade URL:</p>
                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Откройте <a href="https://steamcommunity.com/my/tradeoffers/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">настройки обмена Steam</a></li>
                  <li>Прокрутите вниз до раздела "Third-Party Sites"</li>
                  <li>Скопируйте вашу Trade URL</li>
                  <li>Вставьте её в поле выше</li>
                </ol>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Сохранить
                </button>
                {canSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    Позже
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SteamTradeUrlModal;
