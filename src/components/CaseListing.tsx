import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Case from './Case';
import Title from './Title';
import CasePreviewModal from './CasePreviewModal';

import { CaseTemplate } from '../types/api';

interface CaseListingProps {
  name: string;
  description?: string;
  cases: CaseTemplate[];
  onBuyAndOpenCase?: (caseTemplate: CaseTemplate) => Promise<any>;
  fixedPrices?: boolean;
  nextCaseAvailableTime?: string;
  /** Если true, у ежедневного подписного кейса (не бонусного) не показываем таймер — кейс доступен для открытия */
  hideSubscriptionDailyCaseTimer?: boolean;
  onDataUpdate?: () => void;
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
}

const CaseListing: React.FC<CaseListingProps> = ({
  name,
  description,
  cases,
  onBuyAndOpenCase,
  fixedPrices = false,
  nextCaseAvailableTime,
  hideSubscriptionDailyCaseTimer = false,
  onDataUpdate,
  onPlayBonusGame,
  freeCaseStatus,
  isAuthenticated = false,
  onAuthRequired
}) => {
  const { t } = useTranslation();
  const [previewCase, setPreviewCase] = useState<CaseTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);




  const handleCaseClick = (caseItem: CaseTemplate, event: React.MouseEvent) => {

    // Проверяем, если нажали с Ctrl/Cmd, то открываем в новой вкладке как раньше
    if (event.ctrlKey || event.metaKey) {
      return; // Позволяем стандартному поведению Link сработать
    }

    // Предотвращаем переход по ссылке
    event.preventDefault();

    // Проверяем авторизацию пользователя
    if (!isAuthenticated && onAuthRequired) {
      onAuthRequired();
      return;
    }

    // Иначе показываем превью
    setPreviewCase(caseItem);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewCase(null);
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    if (onPlayBonusGame) {
      onPlayBonusGame(caseTemplate);
    }
  };


  return (
    <div className="cases-section flex flex-col items-center justify-center max-w-[1600px] w-full">
      <Title title={name} />
      {description && (
        <p className="text-gray-400/90 mb-8 text-center max-w-xl text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row items-center justify-center w-full gap-5 md:gap-8 md:flex-wrap overflow-visible">
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
          return visibleCases.length > 0 ? (
          visibleCases.map((caseItem) => {
            if (caseItem.id) {
              const isBonusCase = caseItem.id === '55555555-5555-5555-5555-555555555555';

              // Проверяем, является ли это бесплатным кейсом для новых пользователей (2 кейса в первые дни после регистрации)
              const isFreeCase = freeCaseStatus && caseItem.id === freeCaseStatus.caseTemplateId;

              // Проверяем, является ли это кейсом крестиков-ноликов (бонусный кейс)
              const isTicTacToeCase = isBonusCase;
              // Если есть подписной кейс в инвентаре — не показываем таймер у ежедневного подписного кейса (не бонуса)
              const caseNextAvailableTime = isFreeCase && freeCaseStatus
                ? freeCaseStatus.nextAvailableTime
                : (hideSubscriptionDailyCaseTimer && !isBonusCase
                    ? undefined
                    : (caseItem.next_available_time || nextCaseAvailableTime));

              if (isBonusCase) {
                // Для бонусного кейса не используем Link, чтобы кнопка "Играть" работала
                return (
                  <div
                    key={caseItem.id}
                    id={isFreeCase ? 'onboarding-cases' : undefined}
                    className="case-item-wrapper cursor-pointer overflow-visible"
                    onClick={(e) => {
                      // Проверяем, был ли клик по кнопке "Играть"
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
              } else {
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
              }
            } else {
              return null;
            }
          })
          ) : (
          <div className="text-gray-400 text-center py-8">
            {t('homepage.cases_not_found')}
          </div>
        );
        })()}
      </div>

      {/* Модальное окно превью кейса */}
      {previewCase && (
        <CasePreviewModal
          isOpen={isPreviewOpen}
          onClose={closePreview}
          caseData={previewCase}
          onBuyAndOpenCase={onBuyAndOpenCase}
          fixedPrices={fixedPrices}
          onDataUpdate={onDataUpdate}
        />
      )}


    </div>
  );
};

export default CaseListing;
