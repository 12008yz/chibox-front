import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useRegisterMutation, useLoginMutation } from '../features/auth/authApi';
import { loginSuccess } from '../features/auth/authSlice';
import SteamLoginButton from '../components/SteamLoginButton';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import SnakeGameBackground from '../components/SnakeGameBackground';
import { validateUsername, suggestAlternativeUsername } from '../utils/profanityFilter';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const isLoading = isRegistering || isLoggingIn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация имени пользователя
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      const suggestions = suggestAlternativeUsername(username);
      const suggestionText = suggestions.length > 0
        ? ` ${t('auth.try_suggestions')} ${suggestions.join(', ')}`
        : '';
      setError(`${usernameValidation.error}${suggestionText}`);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwords_not_match'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.password_min_length'));
      return;
    }

    try {
      const registerResult = await register({ username, email, password }).unwrap();

      if (registerResult.success && registerResult.data) {
        try {
          const loginResult = await login({ email, password }).unwrap();

          if (loginResult.success && loginResult.data) {
            dispatch(loginSuccess({
              user: loginResult.data.user,
              token: loginResult.data.token
            }));
          }
        } catch (loginErr: any) {
          console.error('Auto-login error:', loginErr);
        }

        navigate('/', {
          state: {
            showRegistrationSuccess: true,
            registrationEmail: registerResult.data.email,
            previewUrl: registerResult.previewUrl
          }
        });
      } else {
        setError(t('auth.registration_error'));
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.data?.message || t('auth.registration_error'));
    }
  };

  return (
    <div className="min-h-screen bg-[#151225] gaming-font relative">
      <ScrollToTopOnMount />

      {/* Игра в змейку в качестве фона */}
      <SnakeGameBackground />

      {/* Контент с формой регистрации */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Карта регистрации с прозрачностью для лучшей интеграции с фоном */}
          <div className="bg-[#19172D]/80 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8 shadow-2xl">
            {/* Простой логотип без эффектов */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-2xl">CB</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                {t('auth.join')}
              </h1>
              <p className="text-emerald-300/80 text-sm">
                {t('auth.register_subtitle')}
              </p>
            </div>

            {/* Форма регистрации */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-emerald-300 text-sm font-medium">
                  {t('auth.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-[#19172D]/70 backdrop-blur-sm border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 shadow-lg"
                  placeholder={t('auth.username_placeholder')}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-cyan-300 text-sm font-medium">
                  {t('auth.email_address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#19172D]/70 backdrop-blur-sm border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 shadow-lg"
                  placeholder={t('auth.email_placeholder')}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-cyan-300 text-sm font-medium">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#19172D]/70 backdrop-blur-sm border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 shadow-lg"
                  placeholder={t('auth.password_placeholder')}
                />
                <div className="text-xs text-cyan-400/70">{t('auth.password_min_chars')}</div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-cyan-300 text-sm font-medium">
                  {t('auth.confirm_password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-[#19172D]/70 backdrop-blur-sm border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 shadow-lg"
                  placeholder={t('auth.password_placeholder')}
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/40 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">!</span>
                    </div>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Простой превью функций */}
              <div className="grid grid-cols-3 gap-3 my-6">
                <div className="text-center p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                  <div className="text-cyan-400 text-xl mb-2">💰</div>
                  <div className="text-xs text-cyan-300/80 font-medium">{t('auth.bonuses')}</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl">
                  <div className="text-blue-400 text-xl mb-2">🎁</div>
                  <div className="text-xs text-blue-300/80 font-medium">{t('auth.cases')}</div>
                </div>
                <div className="text-center p-3 bg-lime-500/10 border border-lime-400/30 rounded-xl">
                  <div className="text-lime-400 text-xl mb-2">⭐</div>
                  <div className="text-xs text-lime-300/80 font-medium">{t('auth.prizes')}</div>
                </div>
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isRegistering ? t('auth.creating_account') : t('auth.logging_in')}
                  </div>
                ) : (
                  t('auth.create_account')
                )}
              </button>

              {/* Разделитель */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cyan-400/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#19172D] px-4 text-cyan-300/70 text-sm">{t('auth.or')}</span>
                </div>
              </div>

              {/* Steam вход */}
              <SteamLoginButton />
            </form>

            {/* Футер */}
            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-cyan-400 hover:text-cyan-300 text-sm hover:underline"
              >
                {t('auth.have_account_login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
