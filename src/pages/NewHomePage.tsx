import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAllCasesQuery } from '../features/cases/casesApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Banner from '../components/Banner';
import CaseListing from '../components/CaseListing';
import GamesListing from '../components/GamesListing';
import Leaderboard from '../components/Leaderboard';
import { useSocket } from '../hooks/useSocket';

const NewHomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  // Получаем данные о кейсах
  const { data: casesData, error: casesError, isLoading: casesLoading } = useGetAllCasesQuery();

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    previewUrl?: string;
  } | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Баннеры контент
  const bannerContent = [
    {
      left: {
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=460&fit=crop',
        title: "CHIBOX CASINO",
        description: "Открывай кейсы и получай крутые призы! Попробуй свою удачу прямо сейчас!",
        link: "/cases",
      },
      right: (
        <div className="hidden 2xl:flex 2xl:mr-36">
          <div className="text-6xl opacity-30">🎁</div>
        </div>
      ),
    },
    {
      left: {
        image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1920&h=460&fit=crop',
        title: "CRASH GAME",
        description: "Следи за графиком и забирай выигрыш вовремя! Не дай ему упасть!",
        link: "/crash",
      },
      right: (
        <div className="hidden 2xl:flex 2xl:mr-36">
          <div className="text-6xl opacity-30">🚀</div>
        </div>
      ),
    },
    {
      left: {
        image: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1920&h=460&fit=crop',
        title: "UPGRADE GAME",
        description: "Улучшай свои предметы и получай более ценные награды!",
        link: "/upgrade",
      },
      right: null,
    },
  ];

  // Проверяем, нужно ли показать модальное окно регистрации
  useEffect(() => {
    if (location.state?.showRegistrationSuccess) {
      setRegistrationData({
        email: location.state.registrationEmail,
        previewUrl: location.state.previewUrl
      });
      setShowRegistrationModal(true);
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  // Автоматическая смена баннеров
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) =>
        prev === bannerContent.length - 1 ? 0 : prev + 1
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [bannerContent.length]);

  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationData(null);
  };

  if (casesError) {
    console.error('Ошибка загрузки кейсов:', casesError);
  }

  return (
    <div className="min-h-screen bg-[#151225] text-white">
      <ScrollToTopOnMount />

      <div className="flex justify-center">
        <div className="flex-col w-full max-w-[1920px]">

          {/* Баннер секция */}
          <div className="relative w-full">
            <Banner
              left={bannerContent[currentBannerIndex].left}
              right={bannerContent[currentBannerIndex].right}
            />

            {/* Индикаторы баннеров */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 md:flex hidden">
              {bannerContent.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentBannerIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={() => setCurrentBannerIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* Статистика онлайн */}
          <div className="flex items-center justify-center space-x-2 py-4 bg-gray-900/30">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">
              Игроков онлайн: <span className="text-green-400 font-bold">{onlineUsers}</span>
            </span>
          </div>

          {/* Кейсы секция */}
          <div className="container mx-auto px-4 py-8">
            {casesLoading ? (
              <div className="flex items-center justify-center w-full mt-[164px]">
                <div className="spinner" />
                <p className="text-white ml-4">Загрузка кейсов...</p>
              </div>
            ) : casesData?.success && casesData.data ? (
              <>
                {/* Бесплатные кейсы */}
                {casesData.data.free_cases && casesData.data.free_cases.length > 0 && (
                  <div className="mb-12">
                    <CaseListing
                      name="Бесплатные кейсы"
                      description="Ежедневные бесплатные кейсы для всех игроков"
                      cases={casesData.data.free_cases}
                    />
                  </div>
                )}

                {/* Платные кейсы */}
                {casesData.data.paid_cases && casesData.data.paid_cases.length > 0 && (
                  <div className="mb-12">
                    <CaseListing
                      name="Премиум кейсы"
                      description="Платные кейсы с эксклюзивными наградами"
                      cases={casesData.data.paid_cases}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Кейсы временно недоступны</p>
              </div>
            )}

            {/* Игры */}
            <div className="mb-12">
              <GamesListing
                name="Наши игры"
                description="Попробуй различные игры и выиграй большие призы"
              />
            </div>

            {/* Лидерборд */}
            <div className="mb-12">
              <Leaderboard />
            </div>

            {/* Живые дропы */}
            <div className="mt-12">
              <LiveDrops />
            </div>
          </div>
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

export default NewHomePage;
