import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation, useLoginMutation } from '../features/auth/authApi';
import { loginSuccess } from '../features/auth/authSlice';
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
        setError('Ошибка регистрации. Попробуйте снова.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err?.data?.message || 'Ошибка регистрации. Попробуйте снова.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden gaming-font">
      <ScrollToTopOnMount />

      {/* Opera GX Style Background with different wave patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#151225] via-[#1a1630] to-[#19172D]">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <svg
            className="absolute inset-0 w-[120%] h-full -left-[10%]"
            viewBox="0 0 1400 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
              <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="waveGradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <mask id="waveFadeRegister">
                <rect width="100%" height="100%" fill="white"/>
                <rect x="0" y="0" width="100" height="100%" fill="url(#fadeLeftRegister)"/>
                <rect x="1300" y="0" width="100" height="100%" fill="url(#fadeRightRegister)"/>
              </mask>
              <linearGradient id="fadeLeftRegister" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="black" stopOpacity="0"/>
                <stop offset="100%" stopColor="white" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id="fadeRightRegister" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                <stop offset="100%" stopColor="black" stopOpacity="0"/>
              </linearGradient>
            </defs>

            <g mask="url(#waveFadeRegister)">
              <path
                d="M-200,300 C200,200 400,400 800,300 C1000,250 1200,300 1400,280 C1500,270 1600,275 1700,265 L1700,800 L-200,800 Z"
                fill="url(#waveGradient3)"
                opacity="0.4"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -170,35; 0,0"
                  dur="18s"
                  repeatCount="indefinite"
                />
              </path>

              <path
                d="M-200,450 C100,350 500,550 700,450 C900,400 1100,450 1400,430 C1500,420 1600,425 1700,415 L1700,800 L-200,800 Z"
                fill="url(#waveGradient4)"
                opacity="0.3"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 140,-30; 0,0"
                  dur="22s"
                  repeatCount="indefinite"
                />
              </path>

              <path
                d="M-200,600 C50,500 350,700 600,600 C800,550 1000,600 1400,580 C1500,570 1600,575 1700,565 L1700,800 L-200,800 Z"
                fill="url(#waveGradient5)"
                opacity="0.2"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -90,18; 0,0"
                  dur="25s"
                  repeatCount="indefinite"
                />
              </path>

              <path
                d="M-200,720 C150,620 450,820 750,720 C950,670 1150,720 1400,700 C1500,690 1600,695 1700,685 L1700,800 L-200,800 Z"
                fill="url(#waveGradient3)"
                opacity="0.1"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -60,10; 0,0"
                  dur="32s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-50"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${4 + Math.random() * 6}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151225]/90 via-transparent to-[#151225]/70" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Register Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 rounded-2xl blur-lg opacity-30 animate-pulse" />

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-[#19172D]/95 to-[#151225]/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="relative p-8 pb-6">
                {/* Logo Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/25">
                        <span className="text-black font-bold text-2xl">CB</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur opacity-40 animate-pulse" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-3 gaming-font">
                    Присоединиться
                  </h1>
                  <p className="text-cyan-300/80 text-sm">
                    Создайте новую учетную запись ChiBox
                  </p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      Имя пользователя
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder="Ваше имя пользователя"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      Email адрес
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder="your@email.com"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      Пароль
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder="••••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="text-xs text-cyan-400/70">Минимум 6 символов</div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      Подтвердите пароль
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder="••••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-400/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                          <span className="text-black text-xs font-bold">!</span>
                        </div>
                        <span className="text-red-300 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Features Preview */}
                  <div className="grid grid-cols-3 gap-3 my-6">
                    <div className="text-center p-3 bg-cyan-500/10 border border-cyan-400/30 rounded-xl backdrop-blur-sm hover:bg-cyan-500/20 transition-all duration-300">
                      <div className="text-cyan-400 text-xl mb-2">💰</div>
                      <div className="text-xs text-cyan-300/80 font-medium">Бонусы</div>
                    </div>
                    <div className="text-center p-3 bg-blue-500/10 border border-blue-400/30 rounded-xl backdrop-blur-sm hover:bg-blue-500/20 transition-all duration-300">
                      <div className="text-blue-400 text-xl mb-2">🎁</div>
                      <div className="text-xs text-blue-300/80 font-medium">Кейсы</div>
                    </div>
                    <div className="text-center p-3 bg-purple-500/10 border border-purple-400/30 rounded-xl backdrop-blur-sm hover:bg-purple-500/20 transition-all duration-300">
                      <div className="text-purple-400 text-xl mb-2">⭐</div>
                      <div className="text-xs text-purple-300/80 font-medium">Призы</div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {isRegistering ? 'Создание аккаунта...' : 'Вход в систему...'}
                        </div>
                      ) : (
                        'Создать аккаунт'
                      )}
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-cyan-400/30" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#19172D] px-4 text-cyan-300/70 text-sm">или</span>
                    </div>
                  </div>

                  {/* Steam Login */}
                  <SteamLoginButton />
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 hover:underline"
                  >
                    Уже есть аккаунт? Войти
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
