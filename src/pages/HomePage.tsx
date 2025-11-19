import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetAllCasesQuery, useBuyCaseMutation, useOpenCaseMutation, useGetFreeCaseStatusQuery } from '../features/cases/casesApi';
import { useGetCurrentTicTacToeGameQuery } from '../features/user/userApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import IntroVideo from '../components/IntroVideo';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import CaseListing from '../components/CaseListing';
import StatusDashboard from '../components/StatusDashboard';
import TicTacToeGame from '../components/TicTacToeGame';
import SafeCrackerGame from '../components/SafeCrackerGame';
import OnboardingTour from '../components/OnboardingTour';
import { formatDaysI18n } from '../utils/declension';
import { BACKGROUNDS } from '../utils/config';

import { useSocket } from '../hooks/useSocket';
import { useUserData } from '../hooks/useUserData';
import type { CaseTemplate } from '../types/api';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setShowIntroVideo as setGlobalShowIntroVideo, setShowOnboarding, setHasSeenOnboarding } from '../store/slices/uiSlice';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  useSocket(); // Подключаем сокеты
  const { userData, refetch: refetchUser } = useUserData({ autoRefresh: false }); // Получаем данные пользователя

  // Получаем глобальное состояние показа интро из Redux
  const globalShowIntroVideo = useAppSelector(state => state.ui.showIntroVideo);
  const showOnboarding = useAppSelector(state => state.ui.showOnboarding);
  console.log('[HomePage] Global showIntroVideo from Redux:', globalShowIntroVideo);

  // Получаем данные о кейсах (принудительно обновляем при каждом маунте)
  const { data: casesData, error: casesError, isLoading: casesLoading, refetch: refetchCases } = useGetAllCasesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Получаем статус бесплатного кейса для новых пользователей
  const { data: freeCaseStatus, refetch: refetchFreeCaseStatus } = useGetFreeCaseStatusQuery(undefined, {
    skip: !userData?.id, // Пропускаем если пользователь не авторизован
    refetchOnMountOrArgChange: true,
  });

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    previewUrl?: string;
  } | null>(null);

  // Синхронизируем локальное состояние с глобальным
  useEffect(() => {
    console.log('[HomePage] Синхронизация: globalShowIntroVideo =', globalShowIntroVideo);
    if (globalShowIntroVideo) {
      console.log('[HomePage] Устанавливаем локальный showIntroVideo = true');
      setShowIntroVideo(true);
    }
  }, [globalShowIntroVideo]);

  // Состояние игры крестики-нолики
  const [showTicTacToeGame, setShowTicTacToeGame] = useState(false);
  const [_bonusCase, setBonusCase] = useState<CaseTemplate | null>(null);

  // Состояние игр
  const [showSafeCrackerGame, setShowSafeCrackerGame] = useState(false);

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

  const handlePlaySafeCracker = () => {
    console.log('HomePage: Открываем Safe Cracker из StatusDashboard');
    setShowSafeCrackerGame(true);
  };

  // Обработчик для показа модального окна авторизации
  const handleAuthRequired = () => {
    console.log('HomePage: Требуется авторизация, перенаправляем на /login');
    navigate('/login');
  };





  // Мутации для покупки и открытия кейсов
  const [buyCase] = useBuyCaseMutation();
  const [openCase] = useOpenCaseMutation();

  // Запрос для получения информации о крестиках-ноликах
  const { data: ticTacToeData, refetch: refetchTicTacToe } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !userData?.id, // Пропускаем запрос если пользователь не авторизован
  });



  // Проверяем, нужно ли показать модальное окно регистрации
  useEffect(() => {
    console.log('HomePage location.state:', location.state);

    if (location.state?.showRegistrationSuccess) {
      console.log('Showing registration success modal');

      setRegistrationData({
        email: location.state.registrationEmail,
        previewUrl: location.state.previewUrl
      });

      setShowRegistrationModal(true);

      // Очищаем state после обработки
      navigate('/', { replace: true, state: {} });
    }
  }, [location.state, navigate]);



  const handleCloseRegistrationModal = () => {
    setShowRegistrationModal(false);
    setRegistrationData(null);
  };

  const handleVideoEnd = () => {
    console.log('[HomePage] Video ended, hiding intro video');
    setShowIntroVideo(false);
    dispatch(setGlobalShowIntroVideo(false)); // Сбрасываем глобальное состояние
    setRegistrationData(null); // Очищаем данные регистрации

    // После видео показываем онбординг, если пользователь его еще не видел
    const hasSeenOnboardingStorage = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboardingStorage && userData?.id) {
      setTimeout(() => {
        dispatch(setShowOnboarding(true));
      }, 500);
    }
  };

  // Онбординг показывается только после интро-видео при регистрации (см. handleVideoEnd)

  const handleOnboardingComplete = () => {
    dispatch(setShowOnboarding(false));
    dispatch(setHasSeenOnboarding(true));
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
      const inventoryCases = buyResult.data?.inventory_cases;
      console.log('inventory_cases из результата покупки:', inventoryCases);

      if (!inventoryCases || inventoryCases.length === 0) {
        console.error('Полный результат покупки:', buyResult);
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

      // Показываем toast уведомление вместо alert
      // toast уведомления обрабатываются в CasePreviewModal

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
      {/* Фиксированный фон на весь экран */}
      <div
        className="fixed inset-0 -z-50"
        style={{
          backgroundImage: `url(${BACKGROUNDS.home})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Затемняющий оверлей */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 -z-40"></div>

      <div className="relative z-10">
        <ScrollToTopOnMount />

      <div className="flex justify-center">
        <div className="flex-col w-full max-w-[1920px]">

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

                  // Функция для принудительного обновления данных
                  const handleDataUpdate = () => {
                    console.log('Принудительное обновление данных...');
                    refetchUser();
                    refetchCases();
                    refetchFreeCaseStatus();
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

                    return t('homepage.status_cases_description', { days: formatDaysI18n(subscriptionDaysLeft, t) });
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
                            freeCaseStatus={freeCaseStatus?.data}
                            isAuthenticated={!!userData?.id}
                            onAuthRequired={handleAuthRequired}
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
                            isAuthenticated={!!userData?.id}
                            onAuthRequired={handleAuthRequired}
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
                onPlaySafeCracker={handlePlaySafeCracker}
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

      {/* Вступительное видео после регистрации */}
      <IntroVideo
        isOpen={showIntroVideo}
        onVideoEnd={handleVideoEnd}
        videoUrl="/preview.mp4"
      />

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

      {/* Игра Safe Cracker */}
      <SafeCrackerGame
        isOpen={showSafeCrackerGame}
        onClose={() => setShowSafeCrackerGame(false)}
      />

      {/* Онбординг тур */}
      <OnboardingTour
        isActive={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

    </div>
  );
};

export default HomePage;
