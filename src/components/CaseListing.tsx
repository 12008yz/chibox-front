import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Case from './Case';
import Title from './Title';

import { CaseTemplate } from '../types/api';

interface CaseListingProps {
  name: string;
  description?: string;
  cases: CaseTemplate[];
  fixedPrices?: boolean;
  nextCaseAvailableTime?: string;
  /** Если true, у ежедневного подписного кейса (не бонусного) не показываем таймер — кейс доступен для открытия */
  hideSubscriptionDailyCaseTimer?: boolean;
  onPlayBonusGame?: (caseTemplate: CaseTemplate) => void;
  freeCaseStatus?: {
    canClaim: boolean;
    reason: string;
    nextAvailableTime: string | null;
    claimCount: number;
    maxClaims: number;
    firstClaimDate: string | null;
    lastClaimDate: string | null;
    caseTemplateId: string;
  };
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
  /** Открыть превью кейса (модалка рендерится одним экземпляром на странице) */
  onOpenPreview: (caseTemplate: CaseTemplate) => void;
}

const CaseListing: React.FC<CaseListingProps> = ({
  name,
  description,
  cases,
  fixedPrices = false,
  nextCaseAvailableTime,
  hideSubscriptionDailyCaseTimer = false,
  onPlayBonusGame,
  freeCaseStatus,
  isAuthenticated = false,
  onAuthRequired,
  onOpenPreview
}) => {
  const { t } = useTranslation();

  const handleCaseClick = (caseItem: CaseTemplate, event: React.MouseEvent) => {
    // Проверяем, если нажали с Ctrl/Cmd, то открываем в новой вкладке как раньше
    if (event.ctrlKey || event.metaKey) {
      return; // Позволяем стандартному поведению Link сработать
    }

    // Предотвращаем переход по ссылке
    event.preventDefault();

    // Всегда открываем превью кейса. Для гостей внутри модалки показывается «Войдите, чтобы открыть» и кнопка входа.
    onOpenPreview(caseItem);
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    if (onPlayBonusGame) {
      onPlayBonusGame(caseTemplate);
    }
  };

  const renderCaseCard = (caseItem: CaseTemplate) => {
    if (!caseItem.id) return null;

    const isBonusCase = caseItem.id === '55555555-5555-5555-5555-555555555555';
    const isFreeCase = freeCaseStatus && caseItem.id === freeCaseStatus.caseTemplateId;
    const isTicTacToeCase = isBonusCase;
    const caseNextAvailableTime = isFreeCase && freeCaseStatus
      ? freeCaseStatus.nextAvailableTime
      : (hideSubscriptionDailyCaseTimer && !isBonusCase
          ? undefined
          : (caseItem.next_available_time || nextCaseAvailableTime));

    if (isBonusCase) {
      return (
        <div
          key={caseItem.id}
          id={isFreeCase ? 'onboarding-cases' : undefined}
          className="case-item-wrapper cursor-pointer overflow-visible"
          onClick={(e) => {
            if (!(e.target as HTMLElement).closest('button')) {
              handleCaseClick(caseItem, e);
            }
          }}
        >
          <Case
            title={caseItem.name}
            image={caseItem.image_url}
            price={caseItem.price}
            fixedPrices={fixedPrices}
            description={t('homepage.win_bonus_game')}
            nextCaseAvailableTime={caseNextAvailableTime}
            isBonusCase={true}
            onPlayBonusGame={() => handlePlayBonusGame(caseItem)}
            isTicTacToeCase={isTicTacToeCase}
            isAuthenticated={isAuthenticated}
            onAuthRequired={onAuthRequired}
          />
        </div>
      );
    }

    return (
      <Link
        to={`/case/${caseItem.id}`}
        key={caseItem.id}
        id={isFreeCase ? 'onboarding-cases' : undefined}
        className="case-item-wrapper overflow-visible block"
        onClick={(e) => handleCaseClick(caseItem, e)}
      >
        <Case
          title={caseItem.name}
          image={caseItem.image_url}
          price={caseItem.price}
          fixedPrices={fixedPrices}
          isRegistrationBonusCase={!!isFreeCase}
          description={caseItem.name?.toLowerCase().includes('бонус') ? t('homepage.win_bonus_game') : undefined}
          nextCaseAvailableTime={caseNextAvailableTime}
          isBonusCase={false}
          onPlayBonusGame={() => handlePlayBonusGame(caseItem)}
          isTicTacToeCase={false}
        />
      </Link>
    );
  };


  return (
    <div className="cases-section flex flex-col items-center justify-center max-w-[1600px] w-full">
      <Title title={name} />
      {description && (
        <p className="text-gray-400/90 mb-6 sm:mb-8 text-center max-w-xl text-base sm:text-base leading-relaxed px-2">
          {description}
        </p>
      )}

      <div className="w-full overflow-visible">
        {(() => {
          // Скрываем кейс «бонус после регистрации», если пользователь исчерпал лимит:
          // - получил все 2 кейса (claimCount >= maxClaims), или
          // - прошло более 2 дней с первого открытия (canClaim === false и nextAvailableTime === null)
          const visibleCases = (cases || []).filter((caseItem) => {
            if (!caseItem.id) return false;
            const isFreeCase = freeCaseStatus && caseItem.id === freeCaseStatus.caseTemplateId;
            if (isFreeCase && freeCaseStatus) {
              if (freeCaseStatus.claimCount >= freeCaseStatus.maxClaims) return false;
              if (freeCaseStatus.canClaim === false && freeCaseStatus.nextAvailableTime == null) return false;
            }
            return true;
          });
          if (visibleCases.length === 0) {
            return (
          <div className="text-gray-400 text-center py-8">
            {t('homepage.cases_not_found')}
          </div>
            );
          }

          const bonusCase = visibleCases.find((caseItem) => caseItem.id === '55555555-5555-5555-5555-555555555555');
          const regularCases = visibleCases.filter((caseItem) => caseItem.id !== '55555555-5555-5555-5555-555555555555');

          return (
            <>
              {/* Mobile-only layout: бонус отдельно сверху, остальные по 2 */}
              <div className="md:hidden">
                {bonusCase && (
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="w-full max-w-[220px]">
                      {renderCaseCard(bonusCase)}
                    </div>
                  </div>
                )}

                {regularCases.length > 0 && (
                  <div className="grid grid-cols-2 items-start justify-center w-full gap-3 sm:gap-4 overflow-visible">
                    {regularCases.map((caseItem, index) => {
                      const isLast = index === regularCases.length - 1;
                      const shouldCenterLastOnMobile = regularCases.length % 2 === 1 && isLast;

                      if (shouldCenterLastOnMobile) {
                        return (
                          <div key={caseItem.id} className="col-span-2 flex justify-center">
                            <div className="w-full max-w-[220px]">
                              {renderCaseCard(caseItem)}
                            </div>
                          </div>
                        );
                      }

                      return <React.Fragment key={caseItem.id}>{renderCaseCard(caseItem)}</React.Fragment>;
                    })}
                  </div>
                )}
              </div>

              {/* Desktop layout: как раньше, без мобильных перестроений */}
              <div className="hidden md:flex md:flex-row items-start justify-center w-full gap-8 flex-wrap overflow-visible">
                {visibleCases.map((caseItem) => (
                  <React.Fragment key={caseItem.id}>
                    {renderCaseCard(caseItem)}
                  </React.Fragment>
                ))}
              </div>
            </>
          );
        })()}
      </div>

    </div>
  );
};

export default CaseListing;
