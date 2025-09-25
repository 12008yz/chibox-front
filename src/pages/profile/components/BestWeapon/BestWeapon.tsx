import React from 'react';
import { useTranslation } from 'react-i18next';
import { getRarityColor, getRarityName } from '../../utils/profileUtils';
import { getItemImageUrl } from '../../../../utils/steamImageUtils';
import type { UserInventoryItem } from '../../../../types/api';
import { isUserItem } from '../../hooks/useInventory';

interface BestWeaponProps {
  user: any;
  inventory: any[];
  inventoryLoading: boolean;
}

const BestWeapon: React.FC<BestWeaponProps> = ({ user, inventory, inventoryLoading }) => {
  const { t } = useTranslation();

  // Используем лучшее оружие за всё время
  // Если bestWeapon не установлено на сервере, ищем среди всех предметов в инвентаре
  const bestWeapon = user.bestWeapon || inventory
    .filter((item): item is UserInventoryItem => isUserItem(item) && !!item.item?.price)
    .sort((a, b) => parseFloat(String(b.item.price)) - parseFloat(String(a.item.price)))[0];

  // DEBUG: Логи для отладки цены лучшего предмета в обычном профиле
  console.log('=== PRIVATE PROFILE DEBUG ===');
  console.log('user.bestWeapon:', user.bestWeapon);
  console.log('inventory bestWeapon found:', bestWeapon);
  if (bestWeapon) {
    console.log('bestWeapon.price:', (bestWeapon as any).price);
    console.log('bestWeapon.item?.price:', (bestWeapon as any).item?.price);
    console.log('bestWeapon.name:', (bestWeapon as any).name || (bestWeapon as any).item?.name);
    console.log('Final price used:', Number((bestWeapon as any).price || (bestWeapon as any).item?.price || 0));
  }
  console.log('=== END DEBUG ===');

  const renderEmptyState = () => (
    <div className="text-center py-8">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-gray-400 text-lg">{t('profile.inventory_empty')}</p>
      <p className="text-gray-500 text-sm mt-2">{t('profile.open_cases_hint')}</p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-8">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-400">{t('common.loading')}</p>
    </div>
  );

  const renderBestWeapon = () => (
    <div className="bg-black/30 rounded-xl p-6 border-2 border-transparent bg-gradient-to-r from-transparent via-transparent to-transparent hover:border-orange-500/50 transition-all duration-300">
      <div className="flex items-center gap-6">
        <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getRarityColor(
          (bestWeapon as any).rarity || (bestWeapon as any).item?.rarity || ''
        )} p-1 flex items-center justify-center shadow-lg item-image-container`}>
          <img
            src={getItemImageUrl(
              (bestWeapon as any).image_url || (bestWeapon as any).item?.image_url || '',
              (bestWeapon as any).name || (bestWeapon as any).item?.name || ''
            )}
            alt={(bestWeapon as any).name || (bestWeapon as any).item?.name || ''}
            className="w-full h-full object-contain rounded-lg item-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2L3 7v6l7 5 7-5V7l-7-5zM6.5 9.5 9 11l2.5-1.5L14 8l-4-2.5L6 8l.5 1.5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white mb-2">
            {(bestWeapon as any).name || (bestWeapon as any).item?.name || ''}
          </h4>
          <div className="flex items-center gap-4 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getRarityColor(
              (bestWeapon as any).rarity || (bestWeapon as any).item?.rarity || ''
            )} text-white`}>
              {getRarityName((bestWeapon as any).rarity || (bestWeapon as any).item?.rarity || '', t)}
            </span>
            <span className="text-green-400 font-bold text-lg">
              {Number((bestWeapon as any).price || (bestWeapon as any).item?.price || 0).toFixed(2)} КР
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            {(bestWeapon as any).weapon_type ? (
              `${t('profile.weapon_type')} ${(bestWeapon as any).weapon_type || t('profile.weapon_type_default')}`
            ) : (bestWeapon as any).acquisition_date ? (
              `${t('profile.acquired_date')} ${new Date((bestWeapon as any).acquisition_date as string).toLocaleDateString()}`
            ) : (
              `${t('profile.weapon_type')} ${t('profile.weapon_type_default')}`
            )}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 border border-gray-700/30">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12a3 3 0 01-2.5-1.5c-.345-.23-.614-.558-.822-.88-.214-.33-.403-.713-.57-1.116-.334-.804-.614-1.768-.84-2.734a31.365 31.365 0 01-.613-3.58 2.64 2.64 0 01-.945 1.067c-.328.68-.398 1.534-.398 2.654A1 1 0 015.05 6.05 6.981 6.981 0 013 11a7 7 0 1111.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03z" clipRule="evenodd" />
          </svg>
        </div>
        {t('public_profile.all_time_record')}
      </h3>

      {(inventoryLoading && !user.inventory?.length) ?
        renderLoadingState() :
        bestWeapon ? renderBestWeapon() : renderEmptyState()
      }
    </div>
  );
};

export default BestWeapon;
