import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { useLoginMutation } from '../features/auth/authApi';
import { loginSuccess } from '../features/auth/authSlice';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loginUser, { isLoading }] = useLoginMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginUser(formData).unwrap();
      if (result.success) {
        dispatch(loginSuccess({
          user: result.data.user,
          token: result.data.token,
        }));
        navigate('/');
      }
    } catch (error: any) {
      if (error.data?.errors) {
        setErrors(error.data.errors);
      } else {
        setErrors([error.data?.message || 'Ошибка входа']);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 bg-pattern flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-yellow-500/5 to-transparent rotate-12"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-purple-500/5 to-transparent -rotate-12"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1280px]">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-16 h-16 bg-gradient-gold rounded-xl flex items-center justify-center text-3xl font-bold text-black group-hover:scale-110 transition-transform glow-gold">
              ⚡
            </div>
            <span className="text-3xl font-bold text-gambling">ChiBox</span>
          </Link>
          <p className="text-gray-400 mt-4 text-lg">Войдите в свой аккаунт</p>
        </div>

        {/* Login Form */}
        <div className="card-elevated p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4">
                <ul className="text-red-300 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email адрес
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="input-gambling"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-gambling"
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-gambling w-full relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Вход...
                </div>
              ) : (
                '🚀 Войти в аккаунт'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">или</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Steam Login Button */}
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2">
            <span>🎮</span>
            <span>Войти через Steam</span>
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Нет аккаунта?{' '}
              <Link to="/register" className="text-gambling hover:text-yellow-300 font-semibold">
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-xs">Кейсы</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-xs">Игры</div>
          </div>
          <div className="text-gray-400">
            <div className="text-2xl mb-2">💰</div>
            <div className="text-xs">Выигрыши</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
