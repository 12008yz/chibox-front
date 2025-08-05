import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Case from './Case';
import Title from './Title';
import CasePreviewModal from './CasePreviewModal';
import TicTacToeGame from './TicTacToeGame';
import { CaseTemplate } from '../types/api';

interface CaseListingProps {
  name: string;
  description?: string;
  cases: CaseTemplate[];
  onBuyAndOpenCase?: (caseTemplate: CaseTemplate) => Promise<any>;
  fixedPrices?: boolean;
  nextCaseAvailableTime?: string;
  onDataUpdate?: () => void;
}

const CaseListing: React.FC<CaseListingProps> = ({
  name,
  description,
  cases,
  onBuyAndOpenCase,
  fixedPrices = false,
  nextCaseAvailableTime,
  onDataUpdate
}) => {
  const [previewCase, setPreviewCase] = useState<CaseTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showTicTacToeGame, setShowTicTacToeGame] = useState(false);
  const [bonusCase, setBonusCase] = useState<CaseTemplate | null>(null);



  const handleCaseClick = (caseItem: CaseTemplate, event: React.MouseEvent) => {
    console.log('CaseListing: Клик по кейсу', {
      caseName: caseItem.name,
      fixedPrices,
      hasOnBuyAndOpenCase: !!onBuyAndOpenCase,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey
    });

    // Проверяем, если нажали с Ctrl/Cmd, то открываем в новой вкладке как раньше
    if (event.ctrlKey || event.metaKey) {
      console.log('CaseListing: Открываем в новой вкладке');
      return; // Позволяем стандартному поведению Link сработать
    }

    // Иначе показываем превью
    event.preventDefault();
    console.log('CaseListing: Показываем превью кейса');
    setPreviewCase(caseItem);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    console.log('CaseListing: Закрываем превью');
    setIsPreviewOpen(false);
    setPreviewCase(null);
  };

  const handlePlayBonusGame = (caseTemplate: CaseTemplate) => {
    console.log('CaseListing: Открываем игру крестики-нолики для кейса:', caseTemplate.name);
    console.log('CaseListing: ID кейса:', caseTemplate.id);
    console.log('CaseListing: Это бонусный кейс?', caseTemplate.id === '55555555-5555-5555-5555-555555555555');
    setBonusCase(caseTemplate);
    setShowTicTacToeGame(true);
    console.log('CaseListing: Состояние игры установлено в true');
  };

  const handleTicTacToeGameClose = () => {
    setShowTicTacToeGame(false);
    setBonusCase(null);
  };

  const handleTicTacToeWin = async () => {
    console.log('CaseListing: Победа в крестики-нолики!');
    setShowTicTacToeGame(false);

    if (bonusCase && onBuyAndOpenCase) {
      try {
        // Открываем бонусный кейс после победы
        await onBuyAndOpenCase(bonusCase);
        if (onDataUpdate) {
          onDataUpdate();
        }
      } catch (error) {
        console.error('Ошибка при открытии бонусного кейса:', error);
      }
    }
    setBonusCase(null);
  };
  return (
    <div className="flex flex-col items-center justify-center max-w-[1600px] w-full">
      <Title title={name} />
      {description && <div className="text-gray-300 mb-8">{description}</div>}

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:flex-wrap">
        {cases && cases.length > 0 ? (
          cases.map((caseItem) => {
            console.log('CaseListing: Рендерим кейс:', {
              id: caseItem.id,
              name: caseItem.name,
              isBonusCase: caseItem.id === '55555555-5555-5555-5555-555555555555'
            });
            if (caseItem.id) {
              const isBonusCase = caseItem.id === '55555555-5555-5555-5555-555555555555';

              if (isBonusCase) {
                // Для бонусного кейса не используем Link, чтобы кнопка "Играть" работала
                return (
                  <div
                    key={caseItem.id}
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
                      description="Выдается за выигрыш в бонус игре"
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
                    className="transition-transform hover:scale-105"
                    onClick={(e) => handleCaseClick(caseItem, e)}
                  >
                    <Case
                      title={caseItem.name}
                      image={caseItem.image_url}
                      price={caseItem.price}
                      fixedPrices={fixedPrices}
                      description={caseItem.name?.toLowerCase().includes('бонус') ? 'Выдается за выигрыш в бонус игре' : undefined}
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
            Кейсы не найдены
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

      {/* Игра крестики-нолики для бонусного кейса */}
      <TicTacToeGame
        isOpen={showTicTacToeGame}
        onClose={handleTicTacToeGameClose}
        onRewardReceived={handleTicTacToeWin}
      />
    </div>
  );
};

export default CaseListing;
