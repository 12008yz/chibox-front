import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
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
        handleLoginSuccess(result.data);
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
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      <ScrollToTopOnMount />

      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #00ffff22 1px, transparent 1px),
                linear-gradient(180deg, #00ffff22 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* Animated Scanning Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-green-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-transparent via-red-400 to-transparent animate-pulse delay-1500"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* HUD Frame */}
          <div className="relative">
            {/* Corner Brackets */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-400"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-400"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-400"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-400"></div>

            {/* Main Panel */}
            <div
              className="relative bg-gray-900/90 border border-gray-600 backdrop-blur-md overflow-hidden"
              style={{
                clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)'
              }}
            >
              {/* Neon Glow Effect */}
              <div className="absolute inset-0 border border-cyan-400/50 -m-px"
                   style={{
                     clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
                     boxShadow: '0 0 20px #00ffff33, inset 0 0 20px #00ffff11'
                   }}
              ></div>

              <div className="relative p-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                      <span className="text-black font-bold text-xl">CB</span>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-2">
                    <span className="text-cyan-400">[</span> ВХОД В CHIBOX <span className="text-cyan-400">]</span>
                  </h1>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>СИСТЕМА ОНЛАЙН</span>
                  </div>
                </div>

                {/* Test Credentials Panel */}
                <div className="mb-6 relative">
                  <div
                    className="bg-blue-900/20 border border-blue-400/30 p-4"
                    style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-yellow-400 animate-pulse"
                           style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                      </div>
                      <span className="text-yellow-400 text-xs font-bold">РЕЖИМ РАЗРАБОТКИ</span>
                    </div>

                    <div className="text-xs text-blue-300 mb-2 font-mono">
                      <div>USR: 123@gmail.com</div>
                      <div>PWD: Denis71bgr1@2</div>
                    </div>

                    <button
                      type="button"
                      onClick={fillTestCredentials}
                      className="w-full text-xs bg-blue-600/50 hover:bg-blue-600/70 border border-blue-400/50 text-blue-200 py-2 px-3 transition-all duration-300 font-mono"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                    >
                      [ АВТОЗАПОЛНЕНИЕ ]
                    </button>
                  </div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-400 text-sm font-bold font-mono">
                      &gt; АДРЕС ЭЛЕКТРОННОЙ ПОЧТЫ
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="user@domain.com"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-cyan-400 text-sm font-bold font-mono">
                      &gt; ПАРОЛЬ
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-cyan-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="••••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-cyan-400 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div
                      className="bg-red-900/30 border border-red-400/50 p-3"
                      style={{ clipPath: 'polygon(10px 0%, 100% 0%, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0% 100%, 0% 10px)' }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-400 animate-pulse"
                             style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}>
                        </div>
                        <span className="text-red-300 text-sm font-mono">[ERROR] {error}</span>
                      </div>
                    </div>
                  )}

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 font-mono transition-all duration-300 border border-cyan-400/50 hover:border-cyan-400 relative overflow-hidden group"
                    style={{ clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ПОДКЛЮЧЕНИЕ...
                        </div>
                      ) : (
                        '[ ИНИЦИАЦИЯ ВХОДА ]'
                      )}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-900 px-4 text-gray-500 text-sm font-mono">ИЛИ</span>
                    </div>
                  </div>

                  {/* Steam Login */}
                  <div>
                    <SteamLoginButton />
                  </div>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <button
                    onClick={() => navigate('/register')}
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-mono transition-colors duration-300"
                  >
                    [ СОЗДАТЬ НОВЫЙ АККАУНТ ]
                  </button>
                </div>

                {/* Status Bar */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>СИС: РАБОТАЕТ</span>
                    <span>ВЕР: 2.1.4</span>
                    <span>ЗАД: 12мс</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
