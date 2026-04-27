import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Monetary from './Monetary';
import CaseTimer from './CaseTimer';
import { getCaseImageUrl } from '../utils/steamImageUtils';
import { GamepadIcon } from './icons';

interface CaseProps {
  title: string;
  image: string | null;
  price: string;
  fixedPrices?: boolean;
  description?: string;
  nextCaseAvailableTime?: string | null;
  isBonusCase?: boolean;
  /** Кейс «бонус после регистрации» (2 кейса в первые дни) — показываем подпись «Бонус после регистрации» вместо «ежедневно» */
  isRegistrationBonusCase?: boolean;
  onPlayBonusGame?: () => void;
  isTicTacToeCase?: boolean;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

const Case: React.FC<CaseProps> = ({ title, image, price, fixedPrices = false, description, nextCaseAvailableTime, isBonusCase = false, isRegistrationBonusCase = false, onPlayBonusGame, isTicTacToeCase = false, isAuthenticated = false, onAuthRequired }) => {
  const { t } = useTranslation();

  // Функция для перевода названий кейсов
  const translateCaseName = (caseName: string) => {
    const translatedName = t(`case_names.${caseName}`, { defaultValue: caseName });
    return translatedName;
  };
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Используем только реальное изображение кейса; без дефолтных fallback-изображений
  const caseImageUrl = useMemo(() => {
    if (!image || image.trim() === '' || imageError) {
      return '';
    }
    return getCaseImageUrl(image);
  }, [image, imageError]);

  useEffect(() => {
    if (!caseImageUrl) {
      setLoaded(true);
    }
  }, [caseImageUrl]);

  const translatedTitle = translateCaseName(title);
  const hasTimer = !isBonusCase && !!nextCaseAvailableTime && (parseFloat(price) === 0 || isNaN(parseFloat(price)));
  const descriptionText = description || (title.toLowerCase().includes('бонус') ? t('games.bonus_game') : '');

  return (
    <div
      className={`flex flex-col w-full md:w-64 items-center rounded-xl md:rounded cursor-pointer group overflow-visible bg-white/[0.02] md:bg-transparent px-1.5 py-2 md:px-0 md:py-0 ${
        isBonusCase
          ? 'min-h-[300px] sm:min-h-[320px] md:min-h-0'
          : 'min-h-[272px] sm:min-h-[288px] md:min-h-0'
      }`}
    >
      {!loaded && (
        <div className="flex w-full h-64 items-center justify-center">
          <div className="spinner" />
        </div>
      )}

      <div className="relative w-full flex items-end justify-center overflow-hidden h-[140px] sm:h-[156px] md:h-[220px]">
        {caseImageUrl ? (
          <img loading="lazy" decoding="async" src={caseImageUrl}
            alt={title}
            width="256"
            height="256"
            draggable="false"
            className={`case-image w-full h-full object-cover object-center relative z-10 transition-all duration-300 select-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{
              pointerEvents: 'none',
              userSelect: 'none'
            } as React.CSSProperties}
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (!imageError) {
                setImageError(true);
              }
            }}
          />
        ) : (
          <div className="w-full h-32 md:h-64 rounded-lg border border-gray-700 bg-gray-900/70 flex items-center justify-center text-gray-500 text-xs md:text-sm">
            {t('case_preview_modal.no_image', { defaultValue: 'Нет изображения' })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-2 md:p-4 items-center w-full min-w-0">
        <div className="font-bold text-base md:text-lg text-white text-center w-full break-words leading-tight">
          {translatedTitle}
        </div>
        <div className="font-medium text-base md:text-lg lg:text-xl text-green-400 text-center w-full break-words leading-tight">
          {fixedPrices ? (
            <span className="text-yellow-400 font-bold">
              {title.toLowerCase().includes('premium') || title.toLowerCase().includes('премиум')
                ? <Monetary value={499} iconSize="lg" />
                : <Monetary value={99} iconSize="lg" />
              }
            </span>
          ) : (
            parseFloat(price) === 0 || isNaN(parseFloat(price)) ? (
              <span className="text-sm md:text-base lg:text-lg">
                {isRegistrationBonusCase ? t('common.registration_bonus') : t('common.daily')}
              </span>
            ) : (
              <Monetary value={parseFloat(price)} iconSize="lg" />
            )
          )}
        </div>
        {/* Единая зона действия фиксированной высоты — чтобы карточки не "разбегались" по тексту */}
        <div className="w-full flex items-center justify-center">
          {isBonusCase ? (
            <button
              id={isTicTacToeCase ? 'onboarding-tictactoe-button' : undefined}
              onClick={(e) => {

                e.preventDefault();
                e.stopPropagation();

                // Проверяем авторизацию пользователя
                if (!isAuthenticated) {

                  if (onAuthRequired) {
                    onAuthRequired();
                  }
                  return;
                }

                if (onPlayBonusGame) {
                  try {
                    onPlayBonusGame();
                  } catch {
                    // noop: ошибка бонусной мини-игры обрабатывается в вызывающем коде
                  }
                }

              }}
              disabled={!isAuthenticated}
              className={`min-h-[40px] px-3 md:px-4 py-1.5 md:py-2 rounded transition-colors text-sm md:text-sm font-medium ${
                isAuthenticated
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              <GamepadIcon className="w-4 h-4 inline-block mr-1" /> {t('common.play')}
            </button>
          ) : hasTimer ? (
            <div className="text-center">
              <CaseTimer nextAvailableTime={nextCaseAvailableTime} />
            </div>
          ) : null}
        </div>
        <div className="text-[13px] md:text-xs text-gray-400 text-center leading-tight flex items-start justify-center w-full">
          {descriptionText ? (
            <span>{descriptionText}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Case;
