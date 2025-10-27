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
    <div className="flex justify-between items-center p-6 border-b border-gray-700">
      <div className="flex items-center space-x-4">
        <img
          src={caseImageUrl}
          alt={caseData.name}
          className="w-16 h-16 object-cover rounded"
        />
        <div>
          <h2 className="text-2xl font-bold text-white">{caseData.name}</h2>
          <p className="text-green-400 font-semibold">
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
