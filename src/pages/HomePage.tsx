import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetAllCasesQuery, useBuyCaseMutation, useOpenCaseMutation } from '../features/cases/casesApi';
import { useGetCurrentTicTacToeGameQuery } from '../features/user/userApi';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import LiveDrops from '../components/LiveDrops';
import ScrollToTopOnMount from '../components/ScrollToTopOnMount';
import Banner from '../components/Banner';
import CaseListing from '../components/CaseListing';
import GamesListing from '../components/GamesListing';
import Leaderboard from '../components/Leaderboard';
import TicTacToeGame from '../components/TicTacToeGame';


import { useSocket } from '../hooks/useSocket';
import { useUserData } from '../hooks/useUserData';
import type { CaseTemplate } from '../types/api';

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

  // Состояние игры крестики-нолики
  const [showTicTacToeGame, setShowTicTacToeGame] = useState(false);
  const [bonusCase, setBonusCase] = useState<CaseTemplate | null>(null);

  // Логирование изменений состояния игры
  useEffect(() => {
    console.log('HomePage: showTicTacToeGame изменилось на:', showTicTacToeGame);
  }, [showTicTacToeGame]);

  // Обработчики игры крестики-нолики
  const handleTicTacToeGameClose = () => {
    console.log('HomePage: Закрываем игру крестики-нолики');
    setShowTicTacToeGame(false);
    setBonusCase(null);
  };

  const handleTicTacToeWin = async () => {
    console.log('HomePage: Победа в крестики-нолики!');
    setShowTicTacToeGame(false);

    if (bonusCase) {
      try {
        // Открываем бонусный кейс после победы
        await handleBuyAndOpenCase(bonusCase);
        // Обновляем данные пользователя и кейсов
        refetchUser();
        refetchCases();
      } catch (error) {
        console.error('Ошибка при открытии бонусного кейса:', error);
      }
    }
    setBonusCase(null);
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    console.log('HomePage: Открываем игру крестики-нолики для кейса:', caseTemplate.name);
    setBonusCase(caseTemplate);
    setShowTicTacToeGame(true);
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
        image: 'https://public-content.dezctop.com/media/4f10cc5d362c4c8ba700ed232150b98e/neon.webp',
        title: "CHIBOX",
        description: "Делаем твой инвентарь лучше с каждым днём. Открывай кейсы и собирай редкие предметы!",
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
        image: 'https://wallpapers.com/images/hd/cs-go-background-aqi1qcryyzms7fjd.jpg',
        title: "ТВОЯ УДАЧА",
        description: "Каждый открытый кейс — шанс на джекпот. Проверь свою фортуну сегодня!",
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
        image: 'https://static.vecteezy.com/system/resources/thumbnails/046/029/963/large/trendy-retro-futuristic-background-with-desert-landscape-mountains-digital-glowing-grid-blue-and-purple-neon-lights-and-shiny-sunset-retrowave-game-animation-in-the-old-style-4k-60-fps-video.jpg',
        title: "СООБЩЕСТВО",
        description: "Присоединяйся к тысячам игроков. Соревнуйся в таблице лидеров и побеждай!",
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
          console.log('Нужно сначала выиграть в крестики-нолики для открытия бонусного кейса');
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
      let errorMessage = 'Произошла ошибка при открытии кейса';
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
      {/* Тестовый водяной знак с CS2 иконками */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <img
          src="https://ext.same-assets.com/609624232/3169792146.png"
          alt=""
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12 select-none"
          style={{
            width: '120px',
            height: '120px',
            opacity: 0.05,
            filter: 'grayscale(100%)',
          }}
        />
        <img
          src="https://ext.same-assets.com/609624232/355601599.png"
          alt=""
          className="absolute top-32 left-32 transform -rotate-12 select-none"
          style={{
            width: '80px',
            height: '80px',
            opacity: 0.04,
            filter: 'grayscale(100%)',
          }}
        />
        <img
          src="https://ext.same-assets.com/609624232/226050672.png"
          alt=""
          className="absolute bottom-32 right-32 transform -rotate-12 select-none"
          style={{
            width: '80px',
            height: '80px',
            opacity: 0.04,
            filter: 'grayscale(100%)',
          }}
        />
        <img
          src="https://ext.same-assets.com/609624232/144393961.png"
          alt=""
          className="absolute top-1/3 right-1/4 transform -rotate-12 select-none"
          style={{
            width: '70px',
            height: '70px',
            opacity: 0.03,
            filter: 'grayscale(100%)',
          }}
        />
        <img
          src="https://ext.same-assets.com/609624232/571014729.png"
          alt=""
          className="absolute bottom-1/4 left-1/4 transform -rotate-12 select-none"
          style={{
            width: '70px',
            height: '70px',
            opacity: 0.03,
            filter: 'grayscale(100%)',
          }}
        />
      </div>

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
                            name="Премиум кейсы (99₽ / 499₽)"
                            description="Платные кейсы с эксклюзивными наградами"
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

    </div>
  );
};

export default HomePage;
