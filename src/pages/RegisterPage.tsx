import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../store/hooks';
import { useRegisterMutation, useLoginMutation } from '../features/auth/authApi';
import { loginSuccess } from '../features/auth/authSlice';
import MainButton from '../components/MainButton';
import SteamLoginButton from '../components/SteamLoginButton';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';


const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');



  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useAuth();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();

  const isLoading = isRegistering || isLoggingIn;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      // Сначала регистрируем пользователя
      const registerResult = await register({ username, email, password }).unwrap();

      if (registerResult.success && registerResult.data) {
        try {
          // Автоматически логиним пользователя после успешной регистрации
          const loginResult = await login({ email, password }).unwrap();

          if (loginResult.success && loginResult.data) {
            // Сохраняем данные пользователя в store
            dispatch(loginSuccess({
              user: loginResult.data.user,
              token: loginResult.data.token
            }));
          }
        } catch (loginErr: any) {
          console.error('Auto-login error:', loginErr);
          // Если автологин не удался, не показываем ошибку - пользователь может войти вручную
        }

        // Сразу перенаправляем на главную страницу с данными для модального окна
        navigate('/', {
          state: {
            showRegistrationSuccess: true,
            registrationEmail: registerResult.data.email,
            previewUrl: registerResult.previewUrl
          }
        });
      } else {
        setError('Ошибка регистрации. Попробуйте снова.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#151225]">
      <ScrollToTopOnMount />
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Регистрация в ChiBox
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Имя пользователя
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#19172D] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Введите имя пользователя"
              />
            </div>
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Подтвердите пароль
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-[#19172D] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Подтвердите пароль"
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
              text={isLoading ? "Регистрация..." : "Зарегистрироваться"}
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
              onClick={() => navigate('/login')}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Уже есть аккаунт? Войти
            </button>
          </div>
        </form>
      </div>


    </div>
  );
};

export default RegisterPage;
