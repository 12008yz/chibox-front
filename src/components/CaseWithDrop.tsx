import React from 'react';
import type { UserInventoryItem, CaseTemplate } from '../types/api';

interface CaseWithDropProps {
  droppedItem: UserInventoryItem;
  caseTemplate: CaseTemplate | null | undefined;
}

const CaseWithDrop: React.FC<CaseWithDropProps> = ({ droppedItem, caseTemplate }) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer': return 'from-gray-500 to-gray-600';
      case 'industrial': return 'from-blue-500 to-blue-600';
      case 'milspec': return 'from-purple-500 to-purple-600';
      case 'restricted': return 'from-pink-500 to-pink-600';
      case 'classified': return 'from-red-500 to-red-600';
      case 'covert': return 'from-yellow-500 to-orange-500';
      case 'contraband': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'consumer': return 'Потребительское';
      case 'industrial': return 'Промышленное';
      case 'milspec': return 'Армейское';
      case 'restricted': return 'Запрещённое';
      case 'classified': return 'Засекреченное';
      case 'covert': return 'Тайное';
      case 'contraband': return 'Контрабанда';
      default: return rarity;
    }
  };

  const caseName = caseTemplate?.name || `Кейс #${droppedItem.case_template_id?.slice(0, 8)}`;
  const caseImageUrl = caseTemplate?.image_url;

  return (
    <div className="group relative bg-black/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-400/50 transition-all duration-500 cursor-pointer overflow-hidden">
      {/* Case Container */}
      <div className="relative w-full aspect-square rounded-lg mb-3 flex items-center justify-center">
        {/* Case Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg p-1 transition-all duration-500 group-hover:-translate-y-20 group-hover:opacity-0">
          {caseImageUrl ? (
            <img
              src={caseImageUrl}
              alt={caseName}
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center" style={{ display: caseImageUrl ? 'none' : 'flex' }}>
            <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Dropped Item Image (appears on hover) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(droppedItem.item.rarity)} rounded-lg p-1 transition-all duration-500 opacity-0 translate-y-20 group-hover:opacity-100 group-hover:translate-y-0`}>
          {droppedItem.item.image_url ? (
            <img
              src={droppedItem.item.image_url}
              alt={droppedItem.item.name}
              className="w-full h-full object-contain rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) nextElement.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center" style={{ display: droppedItem.item.image_url ? 'none' : 'flex' }}>
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Sparkle effect on hover */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute bottom-3 left-3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>

      {/* Case Info (always visible) */}
      <div className="transition-all duration-300 group-hover:opacity-70">
        <h5 className="text-white text-xs font-medium mb-1 truncate" title={caseName}>
          {caseName}
        </h5>
        <p className="text-yellow-400 text-sm font-bold">
          {Number(caseTemplate?.price || '0').toFixed(2)} КР
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
            КЕЙС
          </p>
          <div className="text-xs text-green-400 font-semibold">
            ОТКРЫТ
          </div>
        </div>
      </div>

      {/* Dropped Item Info (appears on hover) */}
      <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-200 bg-black/90 backdrop-blur-sm rounded-lg p-2 border border-gray-500/30">
        <h6 className="text-white text-xs font-bold mb-2 truncate" title={droppedItem.item.name}>
          {droppedItem.item.name}
        </h6>
        <div className="flex flex-col gap-1">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(droppedItem.item.rarity)} text-white text-center truncate`}>
            {getRarityName(droppedItem.item.rarity)}
          </span>
          <span className="text-green-400 font-bold text-xs text-center">
            {Number(droppedItem.item.price).toFixed(2)} КР
          </span>
        </div>
      </div>
    </div>
  );
};

export default CaseWithDrop;
