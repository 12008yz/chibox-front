import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import MainButton from '../components/MainButton';
import SteamLoginButton from '../components/SteamLoginButton';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';

const LoginPage: React.FC = () => {
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
        // Обновляем Redux state
        handleLoginSuccess(result.data);

        // Перенаправляем на главную страницу
        navigate('/');
      } else {
        setError('Ошибка входа. Проверьте данные.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.data?.message || 'Ошибка входа. Попробуйте снова.');
    }
  };

  const fillTestCredentials = () => {
    setEmail('123@gmail.com');
    setPassword('Denis71bgr1@2');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151225]">
      <ScrollToTopOnMount />
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Вход в ChiBox
          </h2>

          {/* Тестовые учетные данные */}
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 text-center mb-2">
              <strong>Тестовые данные:</strong>
            </p>
            <p className="text-xs text-blue-200 text-center mb-2">
              Email: 123@gmail.com<br />
              Пароль: Denis71bgr1@2
            </p>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition-colors"
            >
              Заполнить тестовые данные
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#19172D] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#19172D] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите пароль"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <MainButton
              text={isLoading ? "Вход..." : "Войти"}
              onClick={() => {}}
              submit={true}
              loading={isLoading}
              disabled={isLoading}
            />
          </div>

          {/* Разделитель */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#151225] text-gray-400">или</span>
            </div>
          </div>

          {/* Кнопка входа через Steam */}
          <div>
            <SteamLoginButton />
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
