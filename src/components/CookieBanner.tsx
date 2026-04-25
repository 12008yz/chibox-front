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
          initial={{ y: position === 'bottom' ? 80 : -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === 'bottom' ? 80 : -80, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`fixed ${positionStyles} z-[9999] p-2 sm:p-3`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#111827]/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-3 sm:p-3.5">
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-500/25">
                      <Cookie className="w-4 h-4 text-blue-300" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-0.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-blue-300" />
                      {t('cookies.title')}
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {t('cookies.description')}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsVisible(false)}
                    className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-800/60 hover:bg-gray-700/70 transition-colors flex items-center justify-center text-gray-400 hover:text-white"
                    aria-label={t('common.close')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-2.5 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors text-xs font-medium border border-gray-700/40"
                  >
                    {showDetails ? t('cookies.hide_details') : t('cookies.learn_more')}
                  </button>

                  <button
                    onClick={handleAccept}
                    className="ml-auto px-4 py-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all text-xs font-semibold shadow-md shadow-blue-500/25"
                  >
                    {t('cookies.accept')}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-3 sm:px-3.5 pb-3 sm:pb-3.5 border-t border-gray-700/50 overflow-hidden"
                  >
                    <div className="pt-2.5 space-y-2">
                      <div className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/30">
                        <h4 className="text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-green-400" />
                          {t('cookies.essential_title')}
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {t('cookies.essential_description')}
                        </p>
                      </div>

                      <div className="text-[11px] text-gray-500 leading-relaxed">
                        <p><strong className="text-gray-400">{t('cookies.duration')}:</strong> {t('cookies.duration_value')}</p>
                        <p><strong className="text-gray-400">{t('cookies.purpose')}:</strong> {t('cookies.purpose_value')}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;
