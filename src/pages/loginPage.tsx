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
    <div className="min-h-screen relative overflow-hidden gaming-font">
      <ScrollToTopOnMount />

      {/* Opera GX Style Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#151225] via-[#1a1630] to-[#19172D]">
        {/* Animated Wave Background */}
        <div className="absolute inset-0 opacity-20 overflow-hidden">
          <svg
            className="absolute inset-0 w-[120%] h-full -left-[10%]"
            viewBox="0 0 1400 800"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
              <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>
              <mask id="waveFade">
                <rect width="100%" height="100%" fill="white"/>
                <rect x="0" y="0" width="100" height="100%" fill="url(#fadeLeft)"/>
                <rect x="1300" y="0" width="100" height="100%" fill="url(#fadeRight)"/>
              </mask>
              <linearGradient id="fadeLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="black" stopOpacity="0"/>
                <stop offset="100%" stopColor="white" stopOpacity="1"/>
              </linearGradient>
              <linearGradient id="fadeRight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="white" stopOpacity="1"/>
                <stop offset="100%" stopColor="black" stopOpacity="0"/>
              </linearGradient>
            </defs>

            <g mask="url(#waveFade)">
              <path
                d="M-200,400 C100,300 300,500 600,400 C900,300 1100,400 1400,350 C1500,330 1600,340 1700,320 L1700,800 L-200,800 Z"
                fill="url(#waveGradient1)"
                opacity="0.3"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -150,25; 0,0"
                  dur="20s"
                  repeatCount="indefinite"
                />
              </path>

              <path
                d="M-200,500 C0,400 200,600 500,500 C700,400 900,500 1200,450 C1400,420 1500,440 1700,430 L1700,800 L-200,800 Z"
                fill="url(#waveGradient2)"
                opacity="0.2"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; 120,-25; 0,0"
                  dur="25s"
                  repeatCount="indefinite"
                />
              </path>

              <path
                d="M-200,600 C100,500 400,700 700,600 C900,550 1100,600 1400,580 C1500,570 1600,575 1700,565 L1700,800 L-200,800 Z"
                fill="url(#waveGradient1)"
                opacity="0.15"
              >
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0,0; -80,15; 0,0"
                  dur="30s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          </svg>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#151225]/80 via-transparent to-[#151225]/60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-2xl blur-lg opacity-30 animate-pulse" />

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-[#19172D]/95 to-[#151225]/95 backdrop-blur-xl border border-cyan-400/20 rounded-2xl overflow-hidden">
              {/* Card Header */}
              <div className="relative p-8 pb-6">
                {/* Logo Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-400/25">
                        <span className="text-black font-bold text-2xl">CB</span>
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-40 animate-pulse" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-white mb-3 gaming-font">
                    {t('auth.welcome')}
                  </h1>
                  <p className="text-cyan-300/80 text-sm">
                    {t('auth.login_subtitle')}
                  </p>
                </div>

                {/* Test Credentials Panel */}
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400 text-xs font-bold uppercase tracking-wide">{t('auth.development_mode')}</span>
                  </div>

                  <div className="text-xs text-blue-300 mb-3 space-y-1 font-mono">
                    <div>Email: 123@gmail.com</div>
                    <div>Password: Denis71bgr1@2</div>
                  </div>

                  <button
                    type="button"
                    onClick={fillTestCredentials}
                    className="w-full text-xs bg-blue-600/50 hover:bg-blue-600/70 border border-blue-400/50 text-blue-200 py-2 px-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-400/25"
                  >
                    {t('auth.autofill')}
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      {t('auth.email_address')}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder={t('auth.email_placeholder')}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-300 text-sm font-medium">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#19172D]/50 border border-cyan-400/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:bg-[#19172D]/70 transition-all duration-300 backdrop-blur-sm"
                        placeholder={t('auth.password_placeholder')}
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

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                    <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          {t('auth.connecting')}
                        </div>
                      ) : (
                        t('auth.login_button')
                      )}
                    </div>
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-cyan-400/30" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#19172D] px-4 text-cyan-300/70 text-sm">{t('auth.or')}</span>
                    </div>
                  </div>

                  {/* Steam Login */}
                  <SteamLoginButton />
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors duration-300 hover:underline"
                  >
                    {t('auth.no_account_create')}
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
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
