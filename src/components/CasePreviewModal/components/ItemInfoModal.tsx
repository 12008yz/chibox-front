import React from 'react';
import { createPortal } from 'react-dom';
import Monetary from '../../Monetary';

interface ItemInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    rarity: string;
    price: string | number;
    image_url: string;
    drop_chance_percent?: number;
    bonusApplied?: number;
  };
  showDropChance?: boolean;
  getRarityColor: (rarity: string) => string;
  t: (key: string) => string;
}

// Функция для получения изображения в высоком качестве (как для ПК)
const getHighQualityImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return imageUrl;

  // Если это изображение Steam, заменяем размер на высокое качество
  if (imageUrl.includes('steamstatic.com/economy/image/')) {
    // Заменяем размер на 730fx730f (высокое качество для ПК)
    if (imageUrl.match(/\/\d+fx\d+f/)) {
      return imageUrl.replace(/\/\d+fx\d+f/, '/730fx730f');
    }

    // Если размера нет, добавляем его
    if (imageUrl.includes('?')) {
      return imageUrl.replace(/\?/, '/730fx730f?');
    }

    return `${imageUrl}/730fx730f`;
  }

  return imageUrl;
};

const ItemInfoModal: React.FC<ItemInfoModalProps> = ({
  isOpen,
  onClose,
  item,
  showDropChance = false,
  getRarityColor,
  t,
}) => {
  if (!isOpen) return null;

  const rarityColorClass = getRarityColor(item.rarity);
  const highQualityImageUrl = getHighQualityImageUrl(item.image_url);

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999999] flex items-center justify-center bg-black bg-opacity-75 md:hidden"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1629] rounded-lg w-[90%] max-w-sm mx-4 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white font-bold text-lg">
            {showDropChance ? t('case_preview_modal.item_info') : t('case_preview_modal.you_won')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Image */}
          <div className={`mb-4 rounded-lg p-4 border-2 ${rarityColorClass} bg-gray-900`}>
            <div className="aspect-square flex items-center justify-center">
              <img
                src={highQualityImageUrl}
                alt={item.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          {/* Item Info */}
          <div className="space-y-3">
            {/* Name */}
            <div>
              <p className="text-gray-400 text-xs mb-1">{t('case_preview_modal.item_name')}</p>
              <h3 className="text-white font-semibold text-base">{item.name}</h3>
            </div>

            {/* Rarity */}
            <div>
              <p className="text-gray-400 text-xs mb-1">{t('case_preview_modal.rarity')}</p>
              <p className={`font-semibold ${rarityColorClass.split(' ')[0]}`}>
                {item.rarity}
              </p>
            </div>

            {/* Price */}
            <div>
              <p className="text-gray-400 text-xs mb-1">{t('case_preview_modal.price')}</p>
              <p className="text-green-400 font-bold text-lg">
                <Monetary value={parseFloat(String(item.price || '0'))} />
              </p>
            </div>

            {/* Drop Chance (if applicable) */}
            {showDropChance && item.drop_chance_percent !== undefined && (
              <div>
                <p className="text-gray-400 text-xs mb-1">{t('case_preview_modal.drop_chance')}</p>
                <p className="text-yellow-400 font-semibold">
                  {item.drop_chance_percent < 0.01
                    ? `${item.drop_chance_percent.toFixed(6)}%`
                    : `${item.drop_chance_percent.toFixed(2)}%`}
                  {item.bonusApplied && item.bonusApplied > 0 && parseFloat(String(item.price || '0')) >= 100 && (
                    <span className="text-green-400 ml-1 text-sm">
                      (+{(item.bonusApplied * 100).toFixed(2)}% {t('case_preview_modal.bonus')})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200"
          >
            {t('case_preview_modal.close')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ItemInfoModal;
