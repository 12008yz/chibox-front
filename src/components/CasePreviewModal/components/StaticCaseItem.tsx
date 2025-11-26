import { memo, useState, useMemo } from 'react';
import Monetary from '../../Monetary';
import { StaticCaseItemProps } from '../types';
import { adaptImageSize } from '../../../utils/steamImageUtils';

export const StaticCaseItem = memo(({
  item,
  getRarityColor,
  t
}: StaticCaseItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Адаптируем размер изображения под устройство
  const adaptedImageUrl = useMemo(() => {
    return adaptImageSize(item.image_url);
  }, [item.image_url]);

  return (
    <div className={`bg-gray-800 rounded-lg p-1 md:p-2 border-2 relative hover:scale-105 transition-transform duration-200 ${getRarityColor(item.rarity)} ${item.isExcluded ? 'opacity-50 grayscale' : ''}`}>
      <div className="aspect-square mb-0 md:mb-2 bg-gray-900 rounded flex items-center justify-center relative">
        {adaptedImageUrl && !imageError ? (
          <img
            src={adaptedImageUrl}
            alt={item.name}
            className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            } ${item.isExcluded ? 'opacity-70' : ''}`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              backgroundColor: imageLoaded ? 'transparent' : 'rgba(17, 24, 39, 0.8)',
            }}
          />
        ) : (
          <div className="text-gray-500 text-xs text-center">
            {t('case_preview_modal.no_image')}
          </div>
        )}

        {/* Простое перечеркивание для исключенных предметов */}
        {item.isExcluded && (
          <div className="absolute inset-0 z-20">
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute bg-red-500 rounded-full w-[70%] h-1" style={{ transform: 'rotate(45deg)' }} />
              <div className="absolute bg-red-500 rounded-full w-[70%] h-1" style={{ transform: 'rotate(-45deg)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="text-center hidden md:block">
        <h3 className="text-white font-semibold text-sm mb-1 overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: '1.2em',
              maxHeight: '2.4em'
            }}>
          {item.name}
        </h3>

        {item.rarity && (
          <p className={`text-xs mb-2 ${getRarityColor(item.rarity).split(' ')[0]}`}>
            {item.rarity}
          </p>
        )}

        <p className="text-green-400 font-bold text-sm">
          <Monetary value={parseFloat(item.price || '0')} />
        </p>

        <div className="text-xs mt-1">
          {item.isExcluded ? (
            <p className="text-red-400 font-bold">
              {t('case_preview_modal.already_received')}
            </p>
          ) : (
            <p className="text-gray-400">
              {t('case_preview_modal.chance')} {item.drop_chance_percent ? `${item.drop_chance_percent.toFixed(2)}%` : '0%'}
              {item.bonusApplied > 0 && parseFloat(item.price || '0') >= 100 && (
                <span className="text-yellow-400 ml-1">
                  (+{(item.bonusApplied * 100).toFixed(2)}% {t('case_preview_modal.bonus')})
                </span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

StaticCaseItem.displayName = 'StaticCaseItem';
