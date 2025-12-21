import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SteamLoginButton from './SteamLoginButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
        onClick={onClose}
      >
        <div className="w-full max-w-md my-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full bg-gradient-to-br from-[#1a1829] to-[#151225] border border-cyan-400/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  {t('auth.welcome')}
                </h2>
                <p className="text-gray-400 text-base">
                  Войдите через Steam, чтобы продолжить
                </p>
              </div>

              {/* Steam Info Card */}
              <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-cyan-400"
                    >
                      <path d="M12 0a12 12 0 0 0-8.2 20.8l4.4-1.8a3.4 3.4 0 0 0 6.4-1.8 3.4 3.4 0 0 0-3.3-3.4h-.2l-4.5-6.6a4.5 4.5 0 0 1 8.8 1.2v.3l6.6 4.5a3.4 3.4 0 0 0 1.8-6.4A12 12 0 0 0 12 0zm-4.6 16.6l-3.6 1.5a2.6 2.6 0 0 0 4.8.9l-1.2-2.4zm7.9-5.4a2.3 2.3 0 1 1-4.6 0 2.3 2.3 0 0 1 4.6 0z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">Быстрая и безопасная авторизация</h3>
                    <p className="text-gray-400 text-sm">
                      Используйте свой Steam аккаунт для быстрого доступа ко всем функциям сайта
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Мгновенный доступ ко всем возможностям платформы</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Участие в играх и розыгрышах</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300">Вывод выигранных предметов</span>
                </div>
              </div>

              {/* Steam login button */}
              <SteamLoginButton />

              {/* Terms Notice */}
              <div className="mt-6 text-xs text-gray-400 text-center">
                Входя на сайт, вы соглашаетесь с{' '}
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  {t('auth.terms_of_service')}
                </a>
                {' '}и{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  {t('auth.privacy_policy')}
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
