import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetAllCasesQuery, useBuyCaseMutation, useOpenCaseMutation, useGetFreeCaseStatusQuery } from '../features/cases/casesApi';
import { useGetCurrentTicTacToeGameQuery } from '../features/user/userApi';
import { useUpdateProfileMutation } from '../features/auth/authApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import IntroVideo from '../components/IntroVideo';
import SteamTradeUrlModal from '../components/SteamTradeUrlModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import CaseListing from '../components/CaseListing';
import StatusDashboard from '../components/StatusDashboard';
import TicTacToeGame from '../components/TicTacToeGame';
import SafeCrackerGame from '../components/SafeCrackerGame';
import OnboardingTour from '../components/OnboardingTour';
import { formatDaysI18n } from '../utils/declension';
import { BACKGROUNDS } from '../utils/config';

import { useUserData } from '../hooks/useUserData';
import type { CaseTemplate } from '../types/api';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setShowIntroVideo as setGlobalShowIntroVideo, setShowTradeUrlModal as setGlobalShowTradeUrlModal, setShowOnboarding, setHasSeenOnboarding, setShowAuthModal } from '../store/slices/uiSlice';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { userData, refetch: refetchUser } = useUserData({ autoRefresh: false }); // Получаем данные пользователя

  // Получаем глобальное состояние показа интро из Redux
  const globalShowIntroVideo = useAppSelector(state => state.ui.showIntroVideo);
  const globalShowTradeUrlModal = useAppSelector(state => state.ui.showTradeUrlModal);
  const showOnboarding = useAppSelector(state => state.ui.showOnboarding);


  // Получаем данные о кейсах (принудительно обновляем при каждом маунте)
  const { data: casesData, error: casesError, isLoading: casesLoading, refetch: refetchCases } = useGetAllCasesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Получаем статус бесплатного кейса для новых пользователей
  const { data: freeCaseStatus, refetch: refetchFreeCaseStatus } = useGetFreeCaseStatusQuery(undefined, {
    skip: !userData?.id, // Пропускаем если пользователь не авторизован
    refetchOnMountOrArgChange: true,
  });

  // Используем поле total_cases_opened из профиля пользователя для точного подсчета
  const openedCasesCount = userData?.total_cases_opened || 0;

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showTradeUrlModal, setShowTradeUrlModal] = useState(false);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    previewUrl?: string;
  } | null>(null);

  // Синхронизируем локальное состояние с глобальным
  useEffect(() => {
    if (globalShowIntroVideo) {
      setShowIntroVideo(true);
    }
  }, [globalShowIntroVideo]);

  // НЕ синхронизируем trade modal сразу - он должен показываться только после видео!

  // Состояние игры крестики-нолики
  const [showTicTacToeGame, setShowTicTacToeGame] = useState(false);
  const [_bonusCase, setBonusCase] = useState<CaseTemplate | null>(null);

  // Состояние игр
  const [showSafeCrackerGame, setShowSafeCrackerGame] = useState(false);

  // Логирование изменений состояния игры
  useEffect(() => {

  }, [showTicTacToeGame]);

  // Обработчики игры крестики-нолики
  const handleTicTacToeGameClose = () => {
    setShowTicTacToeGame(false);
    setBonusCase(null);
    // Обновляем данные после закрытия игры
    refetchUser();
    refetchCases();
  };

  const handleTicTacToeWin = async () => {
    setShowTicTacToeGame(false);
    setBonusCase(null);

    // Просто обновляем данные, чтобы показать новый кейс в инвентаре
    refetchUser();
    refetchCases();
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    setBonusCase(caseTemplate);
    setShowTicTacToeGame(true);
  };

  // Обработчики для StatusDashboard
  const handlePlayTicTacToe = () => {
    setShowTicTacToeGame(true);
  };

  const handlePlaySafeCracker = () => {
    setShowSafeCrackerGame(true);
  };

  // Обработчик для показа модального окна авторизации
  const handleAuthRequired = () => {
    dispatch(setShowAuthModal(true));
  };

  // Мутации для покупки и открытия кейсов
  const [buyCase] = useBuyCaseMutation();
  const [openCase] = useOpenCaseMutation();
  const [updateProfile] = useUpdateProfileMutation();

  // Запрос для получения информации о крестиках-ноликах
  const { data: ticTacToeData, refetch: refetchTicTacToe } = useGetCurrentTicTacToeGameQuery(undefined, {
    skip: !userData?.id, // Пропускаем запрос если пользователь не авторизован
  });

  // Проверяем, нужно ли показать модальное окно регистрации
  useEffect(() => {

    if (location.state?.showRegistrationSuccess) {

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
    setShowIntroVideo(false);
    dispatch(setGlobalShowIntroVideo(false)); // Сбрасываем глобальное состояние
    setRegistrationData(null); // Очищаем данные регистрации

    // После видео проверяем, нужно ли показать trade URL modal
    if (globalShowTradeUrlModal) {
      // Показываем trade modal после окончания видео
      setTimeout(() => {
        setShowTradeUrlModal(true);
      }, 300);
    } else {
      // Если trade modal не нужен, показываем онбординг
      const hasSeenOnboardingStorage = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboardingStorage && userData?.id) {
        setTimeout(() => {
          dispatch(setShowOnboarding(true));
        }, 500);
      }
    }
  };

  // Обработчики для Trade URL Modal
  const handleTradeUrlSubmit = async (tradeUrl: string) => {
    try {
      await updateProfile({ steam_trade_url: tradeUrl }).unwrap();

      setShowTradeUrlModal(false);
      dispatch(setGlobalShowTradeUrlModal(false));

      // После сохранения trade URL показываем onboarding
      const hasSeenOnboardingStorage = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboardingStorage && userData?.id) {
        setTimeout(() => {
          dispatch(setShowOnboarding(true));
        }, 500);
      }

      // Обновляем данные пользователя
      refetchUser();
    } catch (err) {
    }
  };

  const handleTradeUrlSkip = () => {
    setShowTradeUrlModal(false);
    dispatch(setGlobalShowTradeUrlModal(false));

    // После пропуска показываем onboarding
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
          return null; // Не открываем кейс сейчас
        }
        // Если выиграл, продолжаем открытие кейса
      }

      // Проверяем, бесплатный ли это кейс
      const isFreeCase = parseFloat(caseTemplate.price) === 0 || isNaN(parseFloat(caseTemplate.price));

      if (isFreeCase) {

        // Для бесплатных кейсов сразу открываем по template_id
        const openResult = await openCase({
          template_id: caseTemplate.id
        }).unwrap();


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
      const buyResult = await buyCase({
        case_template_id: caseTemplate.id,
        caseTemplateId: caseTemplate.id,
        method: 'balance', // По умолчанию используем баланс для главной страницы
        quantity: 1
      }).unwrap();


      if (!buyResult.success) {
        throw new Error('Ошибка покупки кейса');
      }

      // Принудительно обновляем данные пользователя для обновления баланса
      setTimeout(() => {
        refetchUser();
      }, 100);

      // Проверяем наличие inventory_cases в ответе
      const inventoryCases = buyResult.data?.inventory_cases;

      if (!inventoryCases || inventoryCases.length === 0) {
        throw new Error('Кейс не был добавлен в инвентарь');
      }

      const inventoryItemId = inventoryCases[0].id;

      // Открываем кейс используя inventoryItemId
      const openResult = await openCase({
        inventoryItemId: inventoryItemId
      }).unwrap();


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

      // Показываем toast уведомление вместо alert
      // toast уведомления обрабатываются в CasePreviewModal

      // Пробрасываем ошибку дальше
      throw error;
    }
  };

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
          imageRendering: 'auto',
          WebkitPrintColorAdjust: 'exact',
          colorScheme: 'only light',
        }}
      />
      {/* Затемняющий оверлей - с точными значениями для консистентности */}
      <div
        className="fixed inset-0 -z-40"
        style={{
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.8) 100%)',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
          forcedColorAdjust: 'none',
        }}
      ></div>

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
                            fixedPrices={false}
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
                openedCasesCount={openedCasesCount}
                onPlayTicTacToe={handlePlayTicTacToe}
                onPlaySafeCracker={handlePlaySafeCracker}
              />
            </div>
          </div>

          {/* Живые дропы - полная ширина экрана, скрыт на мобильных */}
          <div className="hidden md:block mt-12">
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

      {/* Steam Trade URL Modal - показывается только после видео */}
      <SteamTradeUrlModal
        isOpen={showTradeUrlModal && !showIntroVideo}
        onClose={handleTradeUrlSkip}
        onSubmit={handleTradeUrlSubmit}
        canSkip={true}
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
