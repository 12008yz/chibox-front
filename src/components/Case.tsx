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

  return (
    <div
      className="flex flex-col w-full md:w-64 items-center rounded cursor-pointer group overflow-visible"
    >
      {!loaded && (
        <div className="flex w-full h-64 items-center justify-center">
          <div className="spinner" />
        </div>
      )}

      <div className="relative w-full flex items-center justify-center overflow-visible aspect-square md:aspect-[3/4]">
        {caseImageUrl ? (
          <img loading="lazy" decoding="async" src={caseImageUrl}
            alt={title}
            width="256"
            height="256"
            draggable="false"
            className={`case-image w-full h-32 md:h-64 object-contain md:object-cover md:-ml-4 relative z-10 transition-all duration-300 select-none ${loaded ? 'opacity-100' : 'opacity-0'}`}
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

      <div className="flex flex-col gap-2 p-2 md:p-4 items-center w-full min-w-0">
        <div className="font-bold text-sm md:text-lg text-white text-center w-full break-words">{translateCaseName(title)}</div>
        <div className="font-medium text-sm md:text-lg lg:text-xl text-green-400 text-center w-full break-words">
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
        {/* Отображение кнопки "Играть" для бонусного кейса или таймера для обычных бесплатных кейсов */}
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
            className={`mt-2 px-2 md:px-4 py-1 md:py-2 rounded transition-colors text-xs md:text-sm font-medium ${
              isAuthenticated
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <GamepadIcon className="w-4 h-4 inline-block mr-1" /> {t('common.play')}
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
