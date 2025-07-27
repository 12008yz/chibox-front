import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Case from './Case';
import Title from './Title';
import CasePreviewModal from './CasePreviewModal';
import { CaseTemplate } from '../types/api';

interface CaseListingProps {
  name: string;
  description?: string;
  cases: CaseTemplate[];
}

const CaseListing: React.FC<CaseListingProps> = ({
  name,
  description,
  cases
}) => {
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
  return (
    <div className="flex flex-col items-center justify-center max-w-[1600px] w-full">
      <Title title={name} />
      {description && <div className="text-gray-300 mb-8">{description}</div>}

      <div className="flex flex-col md:flex-row items-center justify-center w-full gap-8 md:flex-wrap">
        {cases && cases.length > 0 ? (
          cases.map((caseItem) => {
            if (caseItem.id) {
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
                  />
                </Link>
              );
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
        />
      )}
    </div>
  );
};

export default CaseListing;
