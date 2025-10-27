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
  nextCaseAvailableTime?: string;
  isBonusCase?: boolean;
  onPlayBonusGame?: () => void;
}

const Case: React.FC<CaseProps> = ({ title, image, price, fixedPrices = false, description, nextCaseAvailableTime, isBonusCase = false, onPlayBonusGame }) => {
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
      className="flex flex-col w-64 items-center rounded transition-all hover:scale-105 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!loaded && (
        <div className="flex w-full h-64 items-center justify-center">
          <div className="spinner" />
        </div>
      )}

      <div className="relative w-full flex items-center justify-center">
        {/* Радиальное свечение - только при наведении */}
        {isHovered && (
          <div
            className="absolute inset-0 -ml-4"
            style={{
              background: 'radial-gradient(circle at center, rgba(120, 180, 255, 0.7) 0%, rgba(80, 140, 255, 0.45) 25%, rgba(60, 120, 255, 0.25) 45%, transparent 70%)',
              filter: 'blur(25px)',
              pointerEvents: 'none',
              transform: 'scale(1.2)'
            }}
          />
        )}

        <img
          src={caseImageUrl}
          alt={title}
          className={`w-1/2 md:w-full h-32 md:h-64 object-cover -ml-4 relative z-10 ${loaded ? '' : 'hidden'}`}
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (!imageError) {
              setImageError(true);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2 p-4 items-center">
        <div className="font-bold text-lg text-white text-center">{translateCaseName(title)}</div>
        <div className="font-medium text-md text-green-400">
          {fixedPrices ? (
            <span className="text-yellow-400 font-bold">
              {title.toLowerCase().includes('premium') || title.toLowerCase().includes('премиум')
                ? <Monetary value={499} />
                : <Monetary value={99} />
              }
            </span>
          ) : (
            parseFloat(price) === 0 || isNaN(parseFloat(price)) ? (
              <span>{t('common.daily')}</span>
            ) : (
              <Monetary value={parseFloat(price)} />
            )
          )}
        </div>
        {/* Отображение кнопки "Играть" для бонусного кейса или таймера для обычных бесплатных кейсов */}
        {isBonusCase ? (
          <button
            onClick={(e) => {
              console.log('=== КНОПКА ИГРАТЬ НАЖАТА ===');
              console.log('Кнопка "Играть" нажата для кейса:', title);
              console.log('Event target:', e.target);
              console.log('Event currentTarget:', e.currentTarget);
              e.preventDefault();
              e.stopPropagation();
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
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
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
