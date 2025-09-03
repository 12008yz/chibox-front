import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetAllCasesQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import { useGetCurrentTicTacToeGameQuery } from '../features/user/userApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Banner from '../components/Banner';
import CaseListing from '../components/CaseListing';
import AppFeatures from '../components/AppFeatures';
import StatusDashboard from '../components/StatusDashboard';
import TicTacToeGame from '../components/TicTacToeGame';
import RouletteGame from '../components/RouletteGame';
import { formatDays } from '../utils/declension';


import { useSocket } from '../hooks/useSocket';
import { useUserData } from '../hooks/useUserData';
import type { CaseTemplate } from '../types/api';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
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

  // Состояние игры крестики-нолики
  const [showTicTacToeGame, setShowTicTacToeGame] = useState(false);
  const [bonusCase, setBonusCase] = useState<CaseTemplate | null>(null);

  // Состояние рулетки
  const [showRouletteGame, setShowRouletteGame] = useState(false);

  // Логирование изменений состояния игры
  useEffect(() => {
    console.log('HomePage: showTicTacToeGame изменилось на:', showTicTacToeGame);
  }, [showTicTacToeGame]);

  // Обработчики игры крестики-нолики
  const handleTicTacToeGameClose = () => {
    console.log('HomePage: Закрываем игру крестики-нолики');
    setShowTicTacToeGame(false);
    setBonusCase(null);
    // Обновляем данные после закрытия игры
    refetchUser();
    refetchCases();
  };

  const handleTicTacToeWin = async () => {
    console.log('HomePage: Победа в крестики-нолики! Бонусный кейс добавлен в инвентарь.');
    setShowTicTacToeGame(false);
    setBonusCase(null);

    // Просто обновляем данные, чтобы показать новый кейс в инвентаре
    refetchUser();
    refetchCases();
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    console.log('HomePage: Открываем игру крестики-нолики для кейса:', caseTemplate.name);
    setBonusCase(caseTemplate);
    setShowTicTacToeGame(true);
  };

  // Обработчики для StatusDashboard
  const handlePlayTicTacToe = () => {
    console.log('HomePage: Открываем крестики-нолики из StatusDashboard');
    setShowTicTacToeGame(true);
  };

  const handlePlayRoulette = () => {
    console.log('HomePage: Открываем рулетку из StatusDashboard');
    setShowRouletteGame(true);
  };

  const handleRouletteClose = () => {
    console.log('HomePage: Закрываем рулетку');
    setShowRouletteGame(false);
    // Обновляем данные пользователя
    refetchUser();
  };





  // Мутации для покупки и открытия кейсов
  const [buyCase] = useBuyCaseMutation();
  const [openCase] = useOpenCaseMutation();

  // Запрос для получения информации о крестиках-ноликах
  const { data: ticTacToeData, refetch: refetchTicTacToe } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !userData?.id, // Пропускаем запрос если пользователь не авторизован
  });

  // Баннеры контент
  const bannerContent = [
    {
      left: {
        image: 'https://static.vecteezy.com/system/resources/previews/033/170/491/non_2x/abstract-elegant-game-background-gradient-abstract-banner-template-for-landing-page-design-or-website-background-free-vector.jpg',
        title: t('homepage.chibox_title'),
        description: t('homepage.chibox_description'),
        link: "/cases",
      },
      right: (
        <div className="hidden 2xl:flex 2xl:mr-36">
          <div className="text-6xl opacity-30">💎</div>
        </div>
      ),
    },
    {
      left: {
        image: 'https://img.freepik.com/premium-photo/christmas-gaming-background-new-year-neon-banner-neon-gaming-controller-banner-with-copy-space_1136325-4426.jpg?w=1480',
        title: t('homepage.your_luck_title'),
        description: t('homepage.your_luck_description'),
        link: "/cases",
      },
      right: (
        <div className="hidden 2xl:flex 2xl:mr-36">
          <div className="text-6xl opacity-30">🍀</div>
        </div>
      ),
    },
    {
      left: {
        image: 'https://img.freepik.com/free-vector/gaming-design-template_23-2149883126.jpg?ga=GA1.1.721176243.1754874666&semt=ais_hybrid&w=740&q=80',
        title: t('homepage.community_title'),
        description: t('homepage.community_description'),
        link: "/leaderboard",
      },
      right: (
        <div className="hidden 2xl:flex 2xl:mr-36">
          <div className="text-6xl opacity-30">🏆</div>
        </div>
      ),
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

  // Функция для покупки и открытия кейса - ВОЗВРАЩАЕТ результат для анимации в модале
  const handleBuyAndOpenCase = async (caseTemplate: CaseTemplate) => {
    try {
      // Проверяем, является ли это бонусным кейсом
      const isBonusCase = caseTemplate.name?.toLowerCase().includes('бонус');

      if (isBonusCase) {
        // Проверяем, выиграл ли пользователь в крестики-нолики за последние 24 часа
        await refetchTicTacToe();
        const hasWonRecently = ticTacToeData?.game?.result === 'win' && ticTacToeData?.game?.reward_given;

        if (!hasWonRecently) {
          // Если не выиграл в крестики-нолики, не можем открыть бонусный кейс
          console.log(t('homepage.need_bonus_game_win'));
          return null; // Не открываем кейс сейчас
        }
        // Если выиграл, продолжаем открытие кейса
      }

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
          // Принудительно обновляем данные пользователя и кейсов
          setTimeout(() => {
            refetchUser();
            refetchCases();
          }, 500);

          // Возвращаем результат для анимации в модале
          return openResult.data;
        } else {
          throw new Error('Ошибка открытия бесплатного кейса');
        }
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
        // Принудительно обновляем данные пользователя и кейсов для обновления баланса в navbar
        setTimeout(() => {
          refetchUser();
          refetchCases();
        }, 500);

        // Возвращаем результат для анимации в модале
        return openResult.data;
      } else {
        throw new Error('Ошибка открытия кейса');
      }
    } catch (error: any) {
      console.error('Ошибка при покупке и открытии кейса:', error);

      // Показываем пользователю более понятное сообщение об ошибке
      let errorMessage = t('homepage.buy_case_error');
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      // Можно добавить toast уведомление или alert
      alert(errorMessage);

      // Пробрасываем ошибку дальше
      throw error;
    }
  };





  if (casesError) {
    console.error('Ошибка загрузки кейсов:', casesError);
  }



  // Принудительное обновление данных при маунте
  useEffect(() => {
    refetchCases();
  }, [refetchCases]);

  return (
    <div className="min-h-screen text-white relative">
      <div className="relative z-10">
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


          {/* Кейсы секция */}
          <div className="container mx-auto px-4 py-8">
            {casesLoading ? (
              <div className="flex items-center justify-center w-full mt-[164px]">
                <div className="spinner" />
                <p className="text-white ml-4">{t('homepage.loading_cases')}</p>
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

                  // Логирование для отладки
                  console.log('HomePage: userData и nextCaseAvailableTime:', {
                    userData: userData,
                    nextCaseAvailableTime: nextCaseAvailableTime,
                    casesData: data
                  });

                  // Функция для принудительного обновления данных
                  const handleDataUpdate = () => {
                    console.log('Принудительное обновление данных...');
                    refetchUser();
                    refetchCases();
                  };





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
                      return t('homepage.free_cases');
                    }

                    const tierNames: Record<number, string> = {
                      1: t('homepage.status_tier_1'),
                      2: t('homepage.status_tier_2'),
                      3: t('homepage.status_tier_3')
                    };

                    return t('homepage.status_cases', { status: tierNames[userSubscriptionTier] || t('homepage.status_tier_1') });
                  };

                  const getSectionDescription = () => {
                    if (!hasActiveSubscription) {
                      return t('homepage.free_cases_description');
                    }

                    return t('homepage.status_cases_description', { days: formatDays(subscriptionDaysLeft) });
                  };

                  return (
                    <>
                      {/* Бесплатные/Подписочные кейсы */}
                      {subscriptionCases && subscriptionCases.length > 0 && (
                        <div className="mb-12">
                          <CaseListing
                            name={getSectionTitle()}
                            description={getSectionDescription()}
                            cases={subscriptionCases}
                            onBuyAndOpenCase={handleBuyAndOpenCase}
                            nextCaseAvailableTime={nextCaseAvailableTime}
                            onDataUpdate={handleDataUpdate}
                            onPlayBonusGame={handlePlayBonusGame}
                          />
                        </div>
                      )}

                      {/* Платные кейсы */}
                      {paidCases && paidCases.length > 0 && (
                        <div className="mb-12">
                          <CaseListing
                            name={t('homepage.premium_cases')}
                            description={t('homepage.premium_cases_description')}
                            cases={paidCases}
                            onBuyAndOpenCase={handleBuyAndOpenCase}
                            fixedPrices={true}
                            onDataUpdate={handleDataUpdate}
                            onPlayBonusGame={handlePlayBonusGame}
                          />
                        </div>
                      )}

                      {/* Если нет кейсов, но данные есть */}
                      {(!subscriptionCases || subscriptionCases.length === 0) && (!paidCases || paidCases.length === 0) && (
                        <div className="text-center py-12">
                          <p className="text-yellow-400">{t('homepage.cases_not_configured')}</p>
                          <p className="text-gray-400 text-sm mt-2">
                            {t('homepage.data_received_empty')}
                          </p>
                          <button
                            onClick={() => refetchCases()}
                            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            {t('homepage.refresh_cases')}
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            ) : casesError ? (
              <div className="text-center py-12">
                <p className="text-red-400">{t('homepage.cases_error')}</p>
                <p className="text-gray-400 text-sm mt-2">
                  {typeof casesError === 'object' && 'status' in casesError
                    ? t('homepage.error_code', { code: casesError.status })
                    : t('homepage.connection_error')
                  }
                </p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">{t('homepage.cases_temporarily_unavailable')}</p>
              </div>
            )}

            {/* Статусы подписки */}
            <div className="mb-12">
              <StatusDashboard
                name={t('homepage.chibox_statuses')}
                description={t('homepage.chibox_statuses_description')}
                user={userData}
                onPlayTicTacToe={handlePlayTicTacToe}
                onPlayRoulette={handlePlayRoulette}
              />
            </div>
          </div>

          {/* Живые дропы - полная ширина экрана */}
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

      {/* Игра крестики-нолики */}
      <TicTacToeGame
        isOpen={showTicTacToeGame}
        onClose={handleTicTacToeGameClose}
        onRewardReceived={handleTicTacToeWin}
      />

      {/* Бонусная рулетка */}
      <RouletteGame
        isOpen={showRouletteGame}
        onClose={handleRouletteClose}
      />

    </div>
  );
};

export default HomePage;
