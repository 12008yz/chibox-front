import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={canSkip ? handleSkip : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0f1419] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
        {/* Close Button */}
        {canSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">Steam Trade URL</h2>
              <p className="text-sm text-gray-400 mt-1">Для получения предметов в Steam</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              Чтобы получать предметы в Steam, нам нужна ваша <span className="text-white font-medium">Steam Trade URL</span>.
              Без неё мы не сможем отправлять вам выигранные предметы.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Trade URL Input */}
            <div className="space-y-2">
              <label htmlFor="tradeUrl" className="block text-sm font-medium text-gray-300">
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
                className="w-full bg-white/5 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-gray-600 hover:border-gray-600 transition-colors placeholder:text-gray-600"
              />
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white/5 border border-gray-800 rounded-xl p-4 space-y-2">
              <p className="text-sm font-medium text-white">Как получить Steam Trade URL:</p>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                <li>Откройте <a href="https://steamcommunity.com/my/tradeoffers/privacy" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-300 underline">настройки обмена Steam</a></li>
                <li>Прокрутите вниз до раздела "Ссылка на обмен"</li>
                <li>Скопируйте вашу Trade URL</li>
                <li>Вставьте её в поле выше</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {canSkip && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-800 text-white font-medium transition-colors"
                >
                  Позже
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-white text-black font-medium hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SteamTradeUrlModal;
