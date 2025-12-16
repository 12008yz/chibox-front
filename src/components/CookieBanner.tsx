import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, Info } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'chibox_cookie_consent';

interface CookieBannerProps {
  position?: 'bottom' | 'top';
}

const CookieBanner: React.FC<CookieBannerProps> = ({ position = 'bottom' }) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Проверяем, есть ли уже согласие пользователя
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Показываем баннер через небольшую задержку для лучшего UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    setIsVisible(false);
  };

  const positionStyles = position === 'bottom'
    ? 'bottom-0 left-0 right-0'
    : 'top-0 left-0 right-0';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'bottom' ? 100 : -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`fixed ${positionStyles} z-[9999] p-4 md:p-6`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/98 via-gray-800/98 to-gray-900/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Header with Icon */}
              <div className="flex items-start gap-4 p-6 pb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/30">
                    <Cookie className="w-6 h-6 text-blue-400" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    {t('cookies.title')}
                  </h3>

                  <p className="text-gray-300 text-sm leading-relaxed">
                    {t('cookies.description')}
                  </p>

                  {/* Detailed Information */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-700/50 overflow-hidden"
                      >
                        <div className="space-y-3">
                          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                            <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                              <Info className="w-4 h-4 text-green-400" />
                              {t('cookies.essential_title')}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {t('cookies.essential_description')}
                            </p>
                          </div>

                          <div className="text-xs text-gray-500">
                            <p><strong className="text-gray-400">{t('cookies.duration')}:</strong> {t('cookies.duration_value')}</p>
                            <p><strong className="text-gray-400">{t('cookies.purpose')}:</strong> {t('cookies.purpose_value')}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsVisible(false)}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                  aria-label={t('common.close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all text-sm font-medium border border-gray-700/30 hover:border-gray-600/50"
                >
                  {showDetails ? t('cookies.hide_details') : t('cookies.learn_more')}
                </button>

                <button
                  onClick={handleAccept}
                  className="sm:ml-auto px-8 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all text-sm font-semibold shadow-lg shadow-blue-500/25"
                >
                  {t('cookies.accept')}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
