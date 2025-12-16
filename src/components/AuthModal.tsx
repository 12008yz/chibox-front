import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLoginMutation, useRegisterMutation } from '../features/auth/authApi';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import { loginSuccess } from '../features/auth/authSlice';
import { setShowIntroVideo } from '../store/slices/uiSlice';
import SteamLoginButton from './SteamLoginButton';
import { validateUsername, suggestAlternativeUsername } from '../utils/profanityFilter';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const { handleLoginSuccess } = useAuthHandlers();

  const videoRef = useRef<HTMLVideoElement>(null);
  const isRegistrationInProgressRef = useRef(false);

  // Update default tab when prop changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Reset form when switching tabs
  useEffect(() => {
    setLoginError('');
    setRegisterError('');
    setAgreeToTerms(false);
  }, [activeTab]);

  // Preload video when user starts typing
  useEffect(() => {
    if ((username || email || password) && videoRef.current) {
      videoRef.current.load();
    }
  }, [username, email, password]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      console.log('[AuthModal] Sending login request...');
      const result = await login({ email: loginEmail, password: loginPassword }).unwrap();

      console.log('[AuthModal] Login result received:', result);
      console.log('[AuthModal] result.success:', result.success);
      console.log('[AuthModal] result.data:', result.data);
      console.log('[AuthModal] result.data?.user:', result.data?.user);

      if (result.success && result.data) {
        console.log('[AuthModal] Login successful, calling handleLoginSuccess');
        handleLoginSuccess(result.data);
        onClose();
        navigate('/');
      } else {
        console.error('[AuthModal] Login failed - success or data missing:', {
          success: result.success,
          hasData: !!result.data
        });
        setLoginError(t('auth.login_error'));
      }
    } catch (err: any) {
      console.error('[AuthModal] Login error caught:', err);
      console.error('[AuthModal] Error details:', {
        status: err?.status,
        data: err?.data,
        message: err?.data?.message
      });
      setLoginError(err?.data?.message || t('auth.login_error_generic'));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    // Username validation
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      const suggestions = suggestAlternativeUsername(username);
      const suggestionText = suggestions.length > 0
        ? ` ${t('auth.try_suggestions')} ${suggestions.join(', ')}`
        : '';
      setRegisterError(`${usernameValidation.error}${suggestionText}`);
      return;
    }

    if (password !== confirmPassword) {
      setRegisterError(t('auth.passwords_not_match'));
      return;
    }

    if (password.length < 6) {
      setRegisterError(t('auth.password_min_length'));
      return;
    }

    if (!agreeToTerms) {
      setRegisterError(t('auth.must_agree_terms'));
      return;
    }

    try {
      isRegistrationInProgressRef.current = true;
      const registerResult = await register({ username, email, password }).unwrap();

      if (registerResult.success) {
        dispatch(setShowIntroVideo(true));

        try {
          const loginResult = await login({ email, password }).unwrap();

          if (loginResult.success && loginResult.data) {
            dispatch(loginSuccess({
              user: loginResult.data.user,
              token: loginResult.data.token
            }));
            onClose();
          }
        } catch (loginErr: any) {
          console.error('Auto-login error:', loginErr);
        }
      } else {
        setRegisterError(t('auth.registration_error'));
        isRegistrationInProgressRef.current = false;
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setRegisterError(err?.data?.message || t('auth.registration_error'));
      isRegistrationInProgressRef.current = false;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Preload video */}
      <video ref={videoRef} className="hidden" preload="auto">
        <source src="/preview.mp4" type="video/mp4" />
      </video>

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

            {/* Tabs */}
            <div className="flex border-b border-cyan-400/10 bg-[#0f0d1a]/30">
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === 'login'
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {t('header.login')}
                {activeTab === 'login' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-t-full"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === 'register'
                    ? 'text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {t('header.register')}
                {activeTab === 'register' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-t-full"
                  />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'login' ? (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Logo */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {t('auth.welcome')}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {t('auth.login_subtitle')}
                      </p>
                    </div>

                    {/* Login form */}
                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.email_address')}
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.email_placeholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.password')}
                        </label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.password_placeholder')}
                        />
                      </div>

                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-black text-xs font-bold">!</span>
                            </div>
                            <span className="text-red-300 text-sm">{loginError}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Terms Notice for Login */}
                      <div className="text-xs text-gray-400 text-center">
                        {t('auth.by_logging_in')}{' '}
                        <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          {t('auth.terms_of_service')}
                        </a>
                        {' '}{t('auth.and')}{' '}
                        <a
                          href="/privacy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 underline"
                        >
                          {t('auth.privacy_policy')}
                        </a>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors"
                      >
                        {isLoginLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('auth.connecting')}
                          </div>
                        ) : (
                          t('auth.login_button')
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700/50" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-gradient-to-br from-[#1a1829] to-[#151225] px-4 text-gray-400 text-xs font-medium">{t('auth.or')}</span>
                        </div>
                      </div>

                      {/* Steam login */}
                      <SteamLoginButton />
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Logo */}
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {t('auth.join')}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {t('auth.register_subtitle')}
                      </p>
                    </div>

                    {/* Register form */}
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.username')}
                        </label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.username_placeholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.email_address')}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.email_placeholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.password')}
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.password_placeholder')}
                        />
                        <p className="text-xs text-gray-500 mt-1">{t('auth.password_min_chars')}</p>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          {t('auth.confirm_password')}
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full bg-[#0f0d1a]/80 border border-cyan-400/20 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-cyan-400 focus:bg-[#0f0d1a] transition-all placeholder:text-gray-500"
                          placeholder={t('auth.password_placeholder')}
                        />
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          id="agreeToTerms"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-1 w-4 h-4 bg-[#0f0d1a]/80 border border-cyan-400/20 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
                        />
                        <label htmlFor="agreeToTerms" className="text-sm text-gray-300 cursor-pointer">
                          {t('auth.agree_to_terms')}{' '}
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('auth.terms_of_service')}
                          </a>
                          {' '}{t('auth.and')}{' '}
                          <a
                            href="/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('auth.privacy_policy')}
                          </a>
                        </label>
                      </div>

                      {registerError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-red-500/10 border border-red-400/30 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-black text-xs font-bold">!</span>
                            </div>
                            <span className="text-red-300 text-sm">{registerError}</span>
                          </div>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={isRegisterLoading || isLoginLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors"
                      >
                        {isRegisterLoading || isLoginLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isRegisterLoading ? t('auth.creating_account') : t('auth.logging_in')}
                          </div>
                        ) : (
                          t('auth.create_account')
                        )}
                      </button>

                      {/* Divider */}
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-700/50" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-gradient-to-br from-[#1a1829] to-[#151225] px-4 text-gray-400 text-xs font-medium">{t('auth.or')}</span>
                        </div>
                      </div>

                      {/* Steam login */}
                      <SteamLoginButton />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
};

export default AuthModal;
