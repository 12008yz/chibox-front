import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAllCasesQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Banner from '../components/Banner';
import CaseListing from '../components/CaseListing';
import GamesListing from '../components/GamesListing';
import Leaderboard from '../components/Leaderboard';
import CaseOpeningAnimation from '../components/CaseOpeningAnimation';
import CaseTimer from '../components/CaseTimer';
import { SubscriptionCasesClaim } from '../components/SubscriptionCasesClaim';
import { useSocket } from '../hooks/useSocket';
import { useUserData } from '../hooks/useUserData';
import type { CaseTemplate, Item } from '../types/api';

const HomePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();
  const { userData, refetch: refetchUser } = useUserData({ autoRefresh: false }); // Получаем данные пользователя

  // Получаем данные о кейсах (принудительно обновляем при каждом маунте)
  const { data: casesData, error: casesError, isLoading: casesLoading, refetch: refetchCases } = useGetAllCasesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    previewUrl?: string;
  } | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // State для анимации открытия кейса
  const [caseOpeningAnimation, setCaseOpeningAnimation] = useState<{
    isOpen: boolean;
    caseTemplate: CaseTemplate | null;
    wonItem: Item | null;
    isLoading: boolean;
  }>({
    isOpen: false,
    caseTemplate: null,
    wonItem: null,
    isLoading: false
  });

  // Мутации для покупки и открытия кейсов
  const [buyCase] = useBuyCaseMutation();
  const [openCase] = useOpenCaseMutation();

  // Баннеры контент
  const bannerContent = [
    {
      left: {
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&h=460&fit=crop',
        title: "CHIBOX Game",
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

  // Функция для покупки и открытия кейса
  const handleBuyAndOpenCase = async (caseTemplate: CaseTemplate) => {
    try {
      // Устанавливаем состояние загрузки анимации
      setCaseOpeningAnimation(prev => ({
        ...prev,
        isOpen: true,
        caseTemplate: caseTemplate,
        isLoading: true
      }));

      // Проверяем, бесплатный ли это кейс
      const isFreeCase = parseFloat(caseTemplate.price) === 0 || isNaN(parseFloat(caseTemplate.price));

      if (isFreeCase) {
        console.log('Открываем бесплатный кейс напрямую по template_id:', caseTemplate.id);

        // Для бесплатных кейсов сразу открываем по template_id
        const openResult = await openCase({
          template_id: caseTemplate.id
        }).unwrap();

        console.log('Результат открытия бесплатного кейса:', openResult);

        if (openResult.success && openResult.data?.item) {
          // Устанавливаем результат анимации
          setCaseOpeningAnimation(prev => ({
            ...prev,
            wonItem: openResult.data.item,
            isLoading: false
          }));

          // Принудительно обновляем данные пользователя
          setTimeout(() => {
            refetchUser();
          }, 500);
        } else {
          throw new Error('Ошибка открытия бесплатного кейса');
        }
        return;
      }

      // Для платных кейсов покупаем сначала
      console.log('Покупаем платный кейс:', caseTemplate.id);
      const buyResult = await buyCase({
        case_template_id: caseTemplate.id,
        caseTemplateId: caseTemplate.id,
        method: 'balance', // По умолчанию используем баланс для главной страницы
        quantity: 1
      }).unwrap();

      console.log('Результат покупки кейса:', buyResult);

      if (!buyResult.success) {
        throw new Error('Ошибка покупки кейса');
      }

      // Принудительно обновляем данные пользователя для обновления баланса
      setTimeout(() => {
        refetchUser();
      }, 100);

      // Проверяем наличие inventory_cases в ответе
      const inventoryCases = (buyResult as any).inventory_cases;
      if (!inventoryCases || inventoryCases.length === 0) {
        throw new Error('Кейс не был добавлен в инвентарь');
      }

      const inventoryItemId = inventoryCases[0].id;
      console.log('Открываем кейс из инвентаря:', inventoryItemId);

      // Открываем кейс используя inventoryItemId
      const openResult = await openCase({
        inventoryItemId: inventoryItemId
      }).unwrap();

      console.log('Результат открытия кейса:', openResult);

      if (openResult.success && openResult.data?.item) {
        // Устанавливаем результат анимации
        setCaseOpeningAnimation(prev => ({
          ...prev,
          wonItem: openResult.data.item,
          isLoading: false
        }));

        // Принудительно обновляем данные пользователя для обновления баланса в navbar
        setTimeout(() => {
          refetchUser();
        }, 500);
      } else {
        throw new Error('Ошибка открытия кейса');
      }
    } catch (error: any) {
      console.error('Ошибка при покупке и открытии кейса:', error);

      // Показываем пользователю более понятное сообщение об ошибке
      let errorMessage = 'Произошла ошибка при открытии кейса';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Можно добавить toast уведомление или alert
      alert(errorMessage);

      // Закрываем анимацию в случае ошибки
      setCaseOpeningAnimation({
        isOpen: false,
        caseTemplate: null,
        wonItem: null,
        isLoading: false
      });
    }
  };

  // Функция для закрытия анимации
  const handleCloseAnimation = () => {
    setCaseOpeningAnimation({
      isOpen: false,
      caseTemplate: null,
      wonItem: null,
      isLoading: false
    });
  };

  if (casesError) {
    console.error('Ошибка загрузки кейсов:', casesError);
  }



  // Принудительное обновление данных при маунте
  useEffect(() => {
    refetchCases();
  }, [refetchCases]);

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
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 space-x-2 md:flex hidden">
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
            ) : casesData && (casesData.success || casesData.data) ? (
              <>
                {/* Логика отображения кейсов в зависимости от подписки */}
                {(() => {
                  // Определяем где лежат данные
                  const data = casesData.data || casesData;
                  const freeCases = data.free_cases || [];
                  const paidCases = data.paid_cases || [];
                  const userSubscriptionTier = Number(data.user_subscription_tier || userData?.subscription_tier || 0);
                  const subscriptionDaysLeft = Number(userData?.subscription_days_left || 0);
                  const nextCaseAvailableTime = userData?.next_case_available_time;

                  // Функция для фильтрации кейсов по подписке
                  const getSubscriptionCases = () => {
                    if (userSubscriptionTier === 0 || subscriptionDaysLeft <= 0) {
                      // Если нет активной подписки, показываем все бесплатные кейсы
                      return freeCases;
                    }

                    // Фильтруем кейсы для пользователей с подпиской
                    const subscriptionCases = freeCases.filter(caseTemplate => {
                      const caseName = caseTemplate.name?.toLowerCase() || '';

                      // Всегда показываем бонусный кейс
                      if (caseName.includes('бонус')) {
                        return true;
                      }

                      // Показываем кейс соответствующий уровню подписки
                      if (userSubscriptionTier === 1 && caseName.includes('статус') && !caseName.includes('+')) {
                        return true;
                      }
                      if (userSubscriptionTier === 2 && caseName.includes('статус+') && !caseName.includes('++')) {
                        return true;
                      }
                      if (userSubscriptionTier === 3 && caseName.includes('статус++')) {
                        return true;
                      }

                      return false;
                    });

                    return subscriptionCases.length > 0 ? subscriptionCases : freeCases;
                  };

                  const subscriptionCases = getSubscriptionCases();
                  const hasActiveSubscription = userSubscriptionTier > 0 && subscriptionDaysLeft > 0;

                  // Определяем название и описание секции
                  const getSectionTitle = () => {
                    if (!hasActiveSubscription) {
                      return "Бесплатные кейсы";
                    }

                    const tierNames: Record<number, string> = {
                      1: "Статус",
                      2: "Статус+",
                      3: "Статус++"
                    };

                    return `${tierNames[userSubscriptionTier] || 'Статус'} кейсы`;
                  };

                  const getSectionDescription = () => {
                    if (!hasActiveSubscription) {
                      return "Ежедневные бесплатные кейсы для всех игроков";
                    }

                    return `Эксклюзивные кейсы для подписчиков. Осталось дней подписки: ${subscriptionDaysLeft}`;
                  };

                  return (
                    <>
                      {/* Компонент получения ежедневных кейсов подписки */}
                      <div className="mb-8">
                        <SubscriptionCasesClaim />
                      </div>

                      {/* Бесплатные/Подписочные кейсы */}
                      {subscriptionCases && subscriptionCases.length > 0 && (
                        <div className="mb-12">
                          <div className="mb-4">
                            {/* Показываем таймер если есть ограничение по времени */}
                            {nextCaseAvailableTime && (
                              <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-300">Статус следующего кейса:</span>
                                  <CaseTimer nextAvailableTime={nextCaseAvailableTime} />
                                </div>
                              </div>
                            )}
                          </div>

                          <CaseListing
                            name={getSectionTitle()}
                            description={getSectionDescription()}
                            cases={subscriptionCases}
                            onBuyAndOpenCase={handleBuyAndOpenCase}
                          />
                        </div>
                      )}

                      {/* Платные кейсы */}
                      {paidCases && paidCases.length > 0 && (
                        <div className="mb-12">
                          <CaseListing
                            name="Премиум кейсы (99₽ / 499₽)"
                            description="Платные кейсы с эксклюзивными наградами"
                            cases={paidCases}
                            onBuyAndOpenCase={handleBuyAndOpenCase}
                            fixedPrices={true}
                          />
                        </div>
                      )}

                      {/* Если нет кейсов, но данные есть */}
                      {(!subscriptionCases || subscriptionCases.length === 0) && (!paidCases || paidCases.length === 0) && (
                        <div className="text-center py-12">
                          <p className="text-yellow-400">Кейсы не настроены</p>
                          <p className="text-gray-400 text-sm mt-2">
                            Данные получены, но список кейсов пуст
                          </p>
                          <button
                            onClick={() => refetchCases()}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            Обновить кейсы
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : casesError ? (
              <div className="text-center py-12">
                <p className="text-red-400">Ошибка загрузки кейсов</p>
                <p className="text-gray-400 text-sm mt-2">
                  {typeof casesError === 'object' && 'status' in casesError
                    ? `Код ошибки: ${casesError.status}`
                    : 'Проверьте подключение к интернету'
                  }
                </p>
              </div>
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

      {/* Анимация открытия кейса */}
      <CaseOpeningAnimation
        isOpen={caseOpeningAnimation.isOpen}
        onClose={handleCloseAnimation}
        caseTemplate={caseOpeningAnimation.caseTemplate}
        wonItem={caseOpeningAnimation.wonItem}
        isLoading={caseOpeningAnimation.isLoading}
      />
    </div>
  );
};

export default HomePage;
