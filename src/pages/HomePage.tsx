import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import { useSocket } from '../hooks/useSocket';

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    previewUrl?: string;
  } | null>(null);

  // Проверяем, нужно ли показать модальное окно регистрации
  useEffect(() => {
    if (location.state?.showRegistrationSuccess) {
      setRegistrationData({
        email: location.state.registrationEmail,
        previewUrl: location.state.previewUrl
      });
      setShowRegistrationModal(true);

      // Очищаем state, чтобы модальное окно не показывалось при обновлении страницы
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationData(null);
  };
  return (
    <div className="min-h-screen bg-[#151225] text-white">
      <ScrollToTopOnMount />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            ChiBox Casino
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Добро пожаловать в лучшее онлайн казино!
          </p>

          {/* Статистика онлайн */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">
              Игроков онлайн: <span className="text-green-400 font-bold">{onlineUsers}</span>
            </span>
          </div>
        </div>

        {/* Основной контент - теперь используем всю ширину */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="text-xl font-bold mb-3">Кейсы</h3>
              <p className="text-gray-400 text-sm">Открывайте кейсы и получайте ценные призы</p>
            </div>

            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">🎮</div>
              <h3 className="text-xl font-bold mb-3">Игры</h3>
              <p className="text-gray-400 text-sm">Играйте в Crash, Coin Flip и другие игры</p>
            </div>

            <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="text-xl font-bold mb-3">Маркет</h3>
              <p className="text-gray-400 text-sm">Покупайте и продавайте предметы</p>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="bg-[#19172D] rounded-lg p-6 border border-gray-700/50">
            <h3 className="text-xl font-bold mb-4">🔥 Горячие предложения</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                <h4 className="font-bold text-purple-400 mb-2">Бонус на первый депозит</h4>
                <p className="text-sm text-gray-300">Получите 100% к депозиту при пополнении</p>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-lg p-4 border border-green-500/30">
                <h4 className="font-bold text-green-400 mb-2">Ежедневные кейсы</h4>
                <p className="text-sm text-gray-300">Получайте бесплатные кейсы каждый день</p>
              </div>
            </div>
          </div>
        </div>

        {/* Секция живых падений в конце страницы */}
        <div className="mt-12">
          <LiveDrops />
        </div>
      </div>

      {/* Модальное окно успешной регистрации */}
      {registrationData && (
        <RegistrationSuccessModal
          isOpen={showRegistrationModal}
          onClose={handleCloseRegistrationModal}
          email={registrationData.email}
          previewUrl={registrationData.previewUrl}
        />
      )}
    </div>
  );
};

export default HomePage;
