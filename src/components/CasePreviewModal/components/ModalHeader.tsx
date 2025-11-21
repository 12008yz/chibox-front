import React from 'react';
import Monetary from '../../Monetary';
import { ModalHeaderProps } from '../types';

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  caseData,
  caseImageUrl,
  fixedPrices,
  onClose,
  t
}) => {
  return (
    <div className="flex justify-between items-center p-3 sm:p-4 md:p-6 border-b border-gray-700">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
        <img
          src={caseImageUrl}
          alt={caseData.name}
          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-cover rounded flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-xl md:text-2xl font-bold text-white truncate">{caseData.name}</h2>
          <p className="text-green-400 font-semibold text-sm sm:text-base">
            {fixedPrices ? (
              <span className="text-yellow-400 font-bold">
                {caseData.name.toLowerCase().includes('premium') || caseData.name.toLowerCase().includes('премиум')
                  ? <Monetary value={499} />
                  : <Monetary value={99} />
                }
              </span>
            ) : (
              parseFloat(caseData.price) === 0 || isNaN(parseFloat(caseData.price)) ? (
                <span>{t('case_preview_modal.free_case')}</span>
              ) : (
                <Monetary value={parseFloat(caseData.price)} />
              )
            )}
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white text-2xl font-bold transition-colors duration-200"
      >
        ×
      </button>
    </div>
  );
};
