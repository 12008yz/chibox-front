import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useRegisterMutation } from '../features/auth/authApi';
import { useAuth, useAppDispatch } from '../store/hooks';
import { loginSuccess } from '../features/auth/authSlice';
import { Eye, EyeOff, UserPlus, Crown, Mail, Lock, User, ArrowLeft, Check, X } from 'lucide-react';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  // Если уже авторизован, перенаправляем на главную
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Валидация пароля в реальном времени
  const getPasswordValidation = (pwd: string) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
  };

  const passwordValidation = getPasswordValidation(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!isPasswordValid) {
      setError('Пароль не соответствует требованиям безопасности');
      return;
    }

    try {
      const result = await register({ username, email, password }).unwrap();

      if (result.success) {
        dispatch(loginSuccess({
          user: result.data.user,
          token: result.data.token,
        }));
      }
    } catch (err: any) {
      setError(err?.data?.message || 'Ошибка регистрации. Попробуйте еще раз.');
    }
  };

  const ValidationItem = ({ isValid, text }: { isValid: boolean; text: string }) => (
    <div className={`flex items-center space-x-2 text-sm ${isValid ? 'text-green-400' : 'text-gray-500'}`}>
      {isValid ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-gray-500" />
      )}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Floating background elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl floating"></div>
      <div className="absolute bottom-20 left-10 w-24 h-24 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-lg floating" style={{animationDelay: '1.5s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-md floating" style={{animationDelay: '0.5s'}}></div>

      {/* Back to home */}
      <div className="absolute top-8 left-8">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>На главную</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center glow-effect">
              <Crown className="w-8 h-8 text-black" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">ChiBox</h2>
          <p className="text-gray-400 text-lg">
            Создайте новый аккаунт
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="case-card p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1d23] border border-[#374151] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="Введите имя пользователя"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#1a1d23] border border-[#374151] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="Введите email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-[#1a1d23] border border-[#374151] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors"
                  placeholder="Введите пароль"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password validation */}
              {password.length > 0 && (
                <div className="mt-3 p-3 bg-[#1a1d23] rounded-lg border border-[#374151] space-y-2">
                  <div className="text-sm font-medium text-gray-300 mb-2">Требования к паролю:</div>
                  <ValidationItem isValid={passwordValidation.length} text="Минимум 8 символов" />
                  <ValidationItem isValid={passwordValidation.uppercase} text="Заглавная буква" />
                  <ValidationItem isValid={passwordValidation.lowercase} text="Строчная буква" />
                  <ValidationItem isValid={passwordValidation.number} text="Цифра" />
                  <ValidationItem isValid={passwordValidation.special} text="Специальный символ" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Подтвердите пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 bg-[#1a1d23] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-green-400 focus:border-green-400 focus:ring-green-400'
                        : 'border-red-400 focus:border-red-400 focus:ring-red-400'
                      : 'border-[#374151] focus:border-yellow-400 focus:ring-yellow-400'
                  }`}
                  placeholder="Повторите пароль"
                />
                {confirmPassword.length > 0 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {passwordsMatch ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !passwordsMatch}
                className="btn-primary w-full py-3 text-lg font-bold flex items-center justify-center space-x-2 hover-scale disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Зарегистрироваться</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#374151]">
            <div className="text-center">
              <span className="text-gray-400">
                Уже есть аккаунт?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  Войти
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
