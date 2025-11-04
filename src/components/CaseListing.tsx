import React, { useState, useEffect } from 'react';
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
  onDataUpdate?: () => void;
  onPlayBonusGame?: (caseTemplate: CaseTemplate) => void;
}

const CaseListing: React.FC<CaseListingProps> = ({
  name,
  description,
  cases,
  onBuyAndOpenCase,
  fixedPrices = false,
  nextCaseAvailableTime,
  onDataUpdate,
  onPlayBonusGame
}) => {
  const { t } = useTranslation();
  const [previewCase, setPreviewCase] = useState<CaseTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);




  const handleCaseClick = (caseItem: CaseTemplate, event: React.MouseEvent) => {

    // Проверяем, если нажали с Ctrl/Cmd, то открываем в новой вкладке как раньше
    if (event.ctrlKey || event.metaKey) {
      return; // Позволяем стандартному поведению Link сработать
    }

    // Иначе показываем превью
    event.preventDefault();
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
    <div className="flex flex-col items-center justify-center max-w-[1600px] w-full">
      <Title title={name} />
      {description && <div className="text-gray-300 mb-8">{description}</div>}

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:flex-wrap">
        {cases && cases.length > 0 ? (
          cases.map((caseItem, index) => {
            if (caseItem.id) {
              const isBonusCase = caseItem.id === '55555555-5555-5555-5555-555555555555';
              const isFirstCase = index === 0;

              if (isBonusCase) {
                // Для бонусного кейса не используем Link, чтобы кнопка "Играть" работала
                return (
                  <div
                    key={caseItem.id}
                    id={isFirstCase ? 'onboarding-cases' : undefined}
                    className="transition-transform hover:scale-105 cursor-pointer"
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
                      nextCaseAvailableTime={nextCaseAvailableTime}
                      isBonusCase={true}
                      onPlayBonusGame={() => handlePlayBonusGame(caseItem)}
                    />
                  </div>
                );
              } else {
                return (
                  <Link
                    to={`/case/${caseItem.id}`}
                    key={caseItem.id}
                    id={isFirstCase ? 'onboarding-cases' : undefined}
                    className="transition-transform hover:scale-105"
                    onClick={(e) => handleCaseClick(caseItem, e)}
                  >
                    <Case
                      title={caseItem.name}
                      image={caseItem.image_url}
                      price={caseItem.price}
                      fixedPrices={fixedPrices}
                      description={caseItem.name?.toLowerCase().includes('бонус') ? t('homepage.win_bonus_game') : undefined}
                      nextCaseAvailableTime={nextCaseAvailableTime}
                      isBonusCase={false}
                      onPlayBonusGame={() => handlePlayBonusGame(caseItem)}
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
        )}
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
