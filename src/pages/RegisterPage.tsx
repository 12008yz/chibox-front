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
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      <ScrollToTopOnMount />

      {/* Animated Grid Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #00ff8822 1px, transparent 1px),
                linear-gradient(180deg, #00ff8822 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        {/* Animated Scanning Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse delay-1000"></div>
          <div className="absolute top-0 left-0 h-full w-0.5 bg-gradient-to-b from-transparent via-cyan-400 to-transparent animate-pulse delay-500"></div>
          <div className="absolute top-0 right-0 h-full w-0.5 bg-gradient-to-b from-transparent via-purple-400 to-transparent animate-pulse delay-1500"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* HUD Frame */}
          <div className="relative">
            {/* Corner Brackets */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-green-400"></div>
            <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-green-400"></div>
            <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-green-400"></div>
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-green-400"></div>

            {/* Main Panel */}
            <div
              className="relative bg-gray-900/90 border border-gray-600 backdrop-blur-md overflow-hidden"
              style={{
                clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)'
              }}
            >
              {/* Neon Glow Effect */}
              <div className="absolute inset-0 border border-green-400/50 -m-px"
                   style={{
                     clipPath: 'polygon(20px 0%, 100% 0%, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0% 100%, 0% 20px)',
                     boxShadow: '0 0 20px #00ff8833, inset 0 0 20px #00ff8811'
                   }}
              ></div>

              <div className="relative p-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center"
                         style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                      <span className="text-black font-bold text-xl">CB</span>
                    </div>
                  </div>

                  <h1 className="text-2xl font-bold text-white mb-2">
                    <span className="text-green-400">[</span> ACCOUNT CREATION <span className="text-green-400">]</span>
                  </h1>

                  <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>REGISTRATION MODULE ONLINE</span>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="block text-green-400 text-sm font-bold font-mono">
                      &gt; USERNAME
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-green-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="enter_username"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="block text-green-400 text-sm font-bold font-mono">
                      &gt; EMAIL ADDRESS
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-green-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="user@domain.com"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="block text-green-400 text-sm font-bold font-mono">
                      &gt; PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-green-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="••••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 animate-pulse"></div>
                    </div>
                    <div className="text-xs text-gray-500 font-mono">MIN 6 CHARS</div>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label className="block text-green-400 text-sm font-bold font-mono">
                      &gt; CONFIRM PASSWORD
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-gray-800/50 border border-gray-600 text-white px-4 py-3 font-mono text-sm focus:outline-none focus:border-green-400 focus:bg-gray-800/70 transition-all duration-300"
                        style={{ clipPath: 'polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px)' }}
                        placeholder="••••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-400 animate-pulse"></div>
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

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-2 my-6">
                    <div
                      className="text-center p-3 bg-green-500/10 border border-green-400/30"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                    >
                      <div className="text-green-400 text-lg mb-1 font-mono">$</div>
                      <div className="text-xs text-gray-400 font-mono">BONUS</div>
                    </div>
                    <div
                      className="text-center p-3 bg-blue-500/10 border border-blue-400/30"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                    >
                      <div className="text-blue-400 text-lg mb-1 font-mono">♦</div>
                      <div className="text-xs text-gray-400 font-mono">CASES</div>
                    </div>
                    <div
                      className="text-center p-3 bg-purple-500/10 border border-purple-400/30"
                      style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                    >
                      <div className="text-purple-400 text-lg mb-1 font-mono">★</div>
                      <div className="text-xs text-gray-400 font-mono">PRIZE</div>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 font-mono transition-all duration-300 border border-green-400/50 hover:border-green-400 relative overflow-hidden group"
                    style={{ clipPath: 'polygon(15px 0%, 100% 0%, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0% 100%, 0% 15px)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                    <span className="relative">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {isRegistering ? 'CREATING ACCOUNT...' : 'LOGGING IN...'}
                        </div>
                      ) : (
                        '[ CREATE ACCOUNT ]'
                      )}
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-900 px-4 text-gray-500 text-sm font-mono">OR</span>
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
                    onClick={() => navigate('/login')}
                    className="text-green-400 hover:text-green-300 text-sm font-mono transition-colors duration-300"
                  >
                    [ EXISTING USER LOGIN ]
                  </button>
                </div>

                {/* Status Bar */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="flex justify-between items-center text-xs text-gray-500 font-mono">
                    <span>REG: ACTIVE</span>
                    <span>ENC: SSL</span>
                    <span>SEC: HIGH</span>
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

export default RegisterPage;
