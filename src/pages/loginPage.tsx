import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../features/auth/authApi';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import SteamLoginButton from '../components/SteamLoginButton';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const { handleLoginSuccess } = useAuthHandlers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login({ email, password }).unwrap();

      if (result.success && result.data) {
        handleLoginSuccess(result.data);
        navigate('/');
      } else {
        setError(t('auth.login_error'));
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.data?.message || t('auth.login_error_generic'));
    }
  };

  const fillTestCredentials = () => {
    setEmail('123@gmail.com');
    setPassword('Denis71bgr1@2');
  };

  return (
    <div className="min-h-screen bg-[#151225] gaming-font">
      <ScrollToTopOnMount />

      {/* Простой статичный фон без анимаций */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Простая карта без эффектов */}
          <div className="bg-[#19172D] border border-cyan-400/20 rounded-2xl p-8">
            {/* Простой логотип без эффектов */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-black font-bold text-2xl">CB</span>
              </div>

              <h1 className="text-3xl font-bold text-white mb-3">
                {t('auth.welcome')}
              </h1>
              <p className="text-cyan-300/80 text-sm">
                {t('auth.login_subtitle')}
              </p>
            </div>

            {/* Тестовые данные */}
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-400/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span className="text-yellow-400 text-xs font-bold uppercase">{t('auth.development_mode')}</span>
              </div>

              <div className="text-xs text-blue-300 mb-3 space-y-1">
                <div>Email: 123@gmail.com</div>
                <div>Password: Denis71bgr1@2</div>
              </div>

              <button
                type="button"
                onClick={fillTestCredentials}
                className="w-full text-xs bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 py-2 px-3 rounded-lg"
              >
                {t('auth.autofill')}
              </button>
            </div>

            {/* Форма логина */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400"
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
                  className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400"
                  placeholder={t('auth.password_placeholder')}
                />
              </div>

              {/* Ошибка */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">!</span>
                    </div>
                    <span className="text-red-300 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Кнопка входа */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-bold py-4 px-6 rounded-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('auth.connecting')}
                  </div>
                ) : (
                  t('auth.login_button')
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
                onClick={() => navigate('/register')}
                className="text-cyan-400 hover:text-cyan-300 text-sm hover:underline"
              >
                {t('auth.no_account_create')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
