import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Monetary from './Monetary';
import CaseTimer from './CaseTimer';
import { getCaseImageUrl } from '../utils/steamImageUtils';

interface CaseProps {
  title: string;
  image: string | null;
  price: string;
  fixedPrices?: boolean;
  description?: string;
  nextCaseAvailableTime?: string | null;
  isBonusCase?: boolean;
  onPlayBonusGame?: () => void;
  isTicTacToeCase?: boolean;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

const Case: React.FC<CaseProps> = ({ title, image, price, fixedPrices = false, description, nextCaseAvailableTime, isBonusCase = false, onPlayBonusGame, isTicTacToeCase = false, isAuthenticated = false, onAuthRequired }) => {
  const { t } = useTranslation();

  // Функция для перевода названий кейсов
  const translateCaseName = (caseName: string) => {
    const translatedName = t(`case_names.${caseName}`, { defaultValue: caseName });
    return translatedName;
  };
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // // Логирование для отладки
  // console.log(`Case "${title}":`, {
  //   price,
  //   isFreeCase: parseFloat(price) === 0 || isNaN(parseFloat(price)),
  //   nextCaseAvailableTime,
  //   fixedPrices,
  //   isBonusCase,
  //   hasPlayHandler: !!onPlayBonusGame
  // });

  // Дефолтные изображения кейсов CS2
  const defaultCaseImages = [
    'https://steamcommunity-a.akamaihd.net/economy/image/i0CoZ81Ui0m-9KwlBY1L_18myuGuq1wfhWSaZgMttyVfPaERSR0Wqmu7LAocGJKz2lu_XsnXwtmkJjSU91dh8bj35VTqVBP4io_frncVtqv7MPE8JaHHCj_Dl-wk4-NtFirikURy4jiGwo2udHqVaAEjDZp3EflK7EeSMnMs4w/256fx256f'
  ];

  // Выбираем случайное изображение кейса на основе названия для стабильности
  const defaultImage = useMemo(() => {
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return defaultCaseImages[Math.abs(hash) % defaultCaseImages.length];
  }, [title]);

  // Получаем правильный URL изображения кейса (с бэкенда или Steam)
  const caseImageUrl = useMemo(() => {
    if (!image || image.trim() === '' || imageError) {
      return defaultImage;
    }
    return getCaseImageUrl(image);
  }, [image, imageError, defaultImage]);

  return (
    <div
      className="flex flex-col w-full md:w-64 items-center rounded cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!loaded && (
        <div className="flex w-full h-64 items-center justify-center">
          <div className="spinner" />
        </div>
      )}

      <div className="relative w-full flex items-center justify-center">
        <img
          src={caseImageUrl}
          alt={title}
          className={`w-full h-32 md:h-64 object-contain md:object-cover md:-ml-4 relative z-10 transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'case-hover-glow' : ''}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!imageError) {
              setImageError(true);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2 p-2 md:p-4 items-center">
        <div className="font-bold text-sm md:text-lg text-white text-center">{translateCaseName(title)}</div>
        <div className="font-medium text-sm md:text-lg lg:text-xl text-green-400">
          {fixedPrices ? (
            <span className="text-yellow-400 font-bold">
              {title.toLowerCase().includes('premium') || title.toLowerCase().includes('премиум')
                ? <Monetary value={499} iconSize="lg" />
                : <Monetary value={99} iconSize="lg" />
              }
            </span>
          ) : (
            parseFloat(price) === 0 || isNaN(parseFloat(price)) ? (
              <span className="text-sm md:text-base lg:text-lg">{t('common.daily')}</span>
            ) : (
              <Monetary value={parseFloat(price)} iconSize="lg" />
            )
          )}
        </div>
        {/* Отображение кнопки "Играть" для бонусного кейса или таймера для обычных бесплатных кейсов */}
        {isBonusCase ? (
          <button
            id={isTicTacToeCase ? 'onboarding-tictactoe-button' : undefined}
            onClick={(e) => {
              console.log('=== КНОПКА ИГРАТЬ НАЖАТА ===');
              console.log('Кнопка "Играть" нажата для кейса:', title);
              console.log('isAuthenticated:', isAuthenticated);
              e.preventDefault();
              e.stopPropagation();

              // Проверяем авторизацию пользователя
              if (!isAuthenticated) {
                console.log('Пользователь не авторизован, показываем модальное окно');
                if (onAuthRequired) {
                  onAuthRequired();
                }
                return;
              }

              if (onPlayBonusGame) {
                console.log('Вызываем onPlayBonusGame для кейса:', title);
                try {
                  onPlayBonusGame();
                  console.log('onPlayBonusGame вызван успешно');
                } catch (error) {
                  console.error('Ошибка при вызове onPlayBonusGame:', error);
                }
              } else {
                console.log('onPlayBonusGame не определен!');
              }
              console.log('=== КОНЕЦ ОБРАБОТКИ КНОПКИ ИГРАТЬ ===');
            }}
            disabled={!isAuthenticated}
            className={`mt-2 px-2 md:px-4 py-1 md:py-2 rounded transition-colors text-xs md:text-sm font-medium ${
              isAuthenticated
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            🎮 {t('common.play')}
          </button>
        ) : (
          nextCaseAvailableTime && (parseFloat(price) === 0 || isNaN(parseFloat(price))) && (
            <div className="text-center mt-2">
              <CaseTimer nextAvailableTime={nextCaseAvailableTime} />
            </div>
          )
        )}
        {/* Отображение описания */}
        {(description || title.toLowerCase().includes('бонус')) && (
          <div className="text-xs text-gray-400 text-center mt-1">
            {description || (title.toLowerCase().includes('бонус') ? t('games.bonus_game') : '')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Case;
