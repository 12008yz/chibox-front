import { useState, useRef, useEffect } from 'react';
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
      const result = await login({ email: loginEmail, password: loginPassword }).unwrap();

      if (result.success && result.data) {
        handleLoginSuccess(result.data);
        onClose();
        navigate('/');
      } else {
        setLoginError(t('auth.login_error'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
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

  return (
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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
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
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/30">
                        <span className="text-white font-bold text-2xl">CB</span>
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

                      <button
                        type="submit"
                        disabled={isLoginLoading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98]"
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
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                        <span className="text-white font-bold text-2xl">CB</span>
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

                      {/* Features preview */}
                      <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="text-center p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl hover:bg-cyan-500/20 transition-colors">
                          <div className="text-cyan-400 text-xl mb-1.5 flex justify-center">
                            <img src="/images/chiCoin.png" alt="chiCoin" className="w-6 h-6" />
                          </div>
                          <div className="text-xs text-cyan-300 font-semibold">{t('auth.bonuses')}</div>
                        </div>
                        <div className="text-center p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl hover:bg-blue-500/20 transition-colors">
                          <div className="text-blue-400 text-xl mb-1.5">🎁</div>
                          <div className="text-xs text-blue-300 font-semibold">{t('auth.cases')}</div>
                        </div>
                        <div className="text-center p-3 bg-lime-500/10 border border-lime-400/30 rounded-xl hover:bg-lime-500/20 transition-colors">
                          <div className="text-lime-400 text-xl mb-1.5">⭐</div>
                          <div className="text-xs text-lime-300 font-semibold">{t('auth.prizes')}</div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isRegisterLoading || isLoginLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3.5 px-6 rounded-lg transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
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
    </>
  );
};

export default AuthModal;
