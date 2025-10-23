import React from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import CaseWithDrop from '../../../../components/CaseWithDrop';
import ItemWithdrawBanner from '../../../../components/ItemWithdrawBanner';
import { getRarityColor, getRarityName } from '../../utils/profileUtils';
import { getItemImageUrl } from '../../../../utils/steamImageUtils';
import { isUserItem, isUserCase, type InventoryTab } from '../../hooks/useInventory';
import Monetary from '../../../../components/Monetary';

interface InventoryContentProps {
  activeTab: InventoryTab;
  filteredInventory: any[];
  inventoryLoading: boolean;
  openingCaseId: string | null;
  onOpenCase: (id: string) => void;
  onInventoryRefresh: () => void;
  onUserRefresh: () => void;
  getCaseTemplateById: (id: string) => any;
  translateCaseName: (name: string) => string;
}

const InventoryContent: React.FC<InventoryContentProps> = ({
  activeTab,
  filteredInventory,
  inventoryLoading,
  openingCaseId,
  onOpenCase,
  onInventoryRefresh,
  onUserRefresh,
  getCaseTemplateById,
  translateCaseName
}) => {
  const { t } = useTranslation();

  // Debug: проверяем данные
  if (activeTab === 'opened') {
    console.log('InventoryContent - opened tab:', {
      filteredInventory: filteredInventory,
      filteredInventoryLength: filteredInventory.length
    });
  }

  // Функция для показа уведомлений
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
      default:
        toast(message);
        break;
    }
  };

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl flex items-center justify-center">
        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          {activeTab === 'active' ? (
            <>
              <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
              <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </>
          ) : activeTab === 'opened' ? (
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
          ) : activeTab === 'withdrawn' ? (
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0z" clipRule="evenodd" />
          ) : (
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          )}
        </svg>
      </div>
      <p className="text-gray-400 text-lg">
        {activeTab === 'active' && t('profile.inventory_empty')}
        {activeTab === 'opened' && t('profile.no_opened_cases')}
        {activeTab === 'withdrawn' && t('profile.no_withdrawn_items')}
        {activeTab === 'sold' && t('profile.no_sold_items')}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        {activeTab === 'active' && t('profile.open_cases_hint')}
        {activeTab === 'opened' && t('profile.opened_cases_hint')}
        {activeTab === 'withdrawn' && t('profile.withdrawn_items_hint')}
        {activeTab === 'sold' && t('profile.sold_items_hint')}
      </p>
    </div>
  );

  const renderLoadingState = () => (
    <div className="text-center py-12">
      <div className="animate-spin w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-gray-400">{t('profile.loading_inventory')}</p>
    </div>
  );

  const renderInventoryGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {activeTab === 'opened' ? (
        // Специальный рендеринг для открытых кейсов с анимацией
        filteredInventory.map((inventoryItem) => {
          if (isUserItem(inventoryItem)) {
            // Debug: выводим данные в консоль
            console.log('Opened case item:', {
              id: inventoryItem.id,
              name: inventoryItem.item.name,
              case_template_id: inventoryItem.case_template_id,
              full_item: inventoryItem
            });

            const caseTemplate = inventoryItem.case_template_id
              ? getCaseTemplateById(inventoryItem.case_template_id)
              : null;

            console.log('Case template found:', caseTemplate);

            return (
              <CaseWithDrop
                key={inventoryItem.id}
                droppedItem={inventoryItem}
                caseTemplate={caseTemplate}
              />
            );
          }
          return null;
        })
      ) : (
        // Обычный рендеринг для остальных табов
        filteredInventory.map((inventoryItem) => (
          <div
            key={inventoryItem.id}
            className={`bg-black/30 rounded-xl p-4 border border-gray-600/30 hover:border-gray-400/50 transition-all duration-300 hover:scale-105 relative group ${
              activeTab !== 'active' ? 'opacity-75' : ''
            }`}
          >
            {/* Status Badge */}
            {activeTab !== 'active' && (
              <div className="absolute top-2 right-2 z-10">
                <div className={`text-xs px-2 py-1 rounded-full text-white font-semibold ${
                  activeTab === 'withdrawn' ?
                    (inventoryItem.status === 'pending_withdrawal' ? 'bg-orange-500' : 'bg-purple-500') :
                  activeTab === 'sold' ? 'bg-yellow-500' :
                  'bg-orange-500'
                }`}>
                  {activeTab === 'withdrawn' ?
                    (inventoryItem.status === 'pending_withdrawal' ? t('profile.status_pending_withdrawal') : t('profile.status_withdrawn')) :
                   activeTab === 'sold' ? t('profile.status_sold') :
                   t('profile.status_opened')}
                </div>
              </div>
            )}

            {isUserItem(inventoryItem) ? (
              // Рендеринг предмета
              <>
                <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor(inventoryItem.item.rarity)} p-1 mb-3 flex items-center justify-center item-image-container`}>
                  <img
                    src={getItemImageUrl(inventoryItem.item.image_url, inventoryItem.item.name)}
                    alt={inventoryItem.item.name}
                    className="w-full h-full object-contain rounded item-image"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) nextElement.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center" style={{ display: 'none' }}>
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <h5 className="text-white text-xs font-medium mb-1 truncate" title={inventoryItem.item.name}>
                  {inventoryItem.item.name}
                </h5>
                <p className="text-green-400 text-sm font-bold">
                  <Monetary value={Number(inventoryItem.item.price)} showFraction={true} />
                </p>
                <p className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor(inventoryItem.item.rarity)} text-white text-center mt-2`}>
                  {getRarityName(inventoryItem.item.rarity, t)}
                </p>
                {/* Acquisition info */}
                <div className="mt-2 text-xs text-gray-400">
                  <p>{t('profile.acquired_date')} {new Date((inventoryItem as any).acquisition_date).toLocaleDateString()}</p>
                  <p className="capitalize">{t('profile.source')} {
                    inventoryItem.source === 'case' ? t('profile.sources.case') :
                    inventoryItem.source === 'purchase' ? t('profile.sources.purchase') :
                    inventoryItem.source
                  }</p>
                </div>

                {/* Withdraw Banner - показывается только для активных предметов */}
                {activeTab === 'active' && inventoryItem.status === 'inventory' && (
                  <ItemWithdrawBanner
                    item={inventoryItem}
                    onWithdrawSuccess={() => {
                      showNotification(t('profile.item_withdraw_success', { itemName: inventoryItem.item.name }), 'success');
                      // Обновляем данные пользователя и инвентарь
                      setTimeout(() => {
                        onInventoryRefresh();
                        onUserRefresh();
                      }, 100);
                    }}
                    onError={(message) => {
                      showNotification(message, 'error');
                    }}
                  />
                )}
              </>
            ) : isUserCase(inventoryItem) ? (
              // Рендеринг кейса
              (() => {
                const caseTemplate = getCaseTemplateById(inventoryItem.case_template_id);
                const rawCaseName = caseTemplate?.name || `Кейс #${inventoryItem.case_template_id.slice(0, 8)}`;
                let caseName = caseTemplate?.name ? translateCaseName(caseTemplate.name) : rawCaseName;

                // Форматируем название кейса
                caseName = caseName.replace(/^Ежедневный кейс - /i, '');
                if (caseName === 'Стандартный кейс' || caseName === 'Премиум кейс') {
                  caseName = 'Покупной кейс';
                }

                const casePrice = caseTemplate?.price || '0.00';
                const caseImageUrl = caseTemplate?.image_url;

                return (
                  <>
                    <div
                      className={`w-full aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-1 mb-3 flex items-center justify-center transition-all duration-300 ${
                        activeTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id
                          ? 'cursor-pointer hover:from-yellow-400 hover:to-orange-500'
                          : 'cursor-not-allowed opacity-60'
                      }`}
                      onClick={() => {
                        if (activeTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id) {
                          onOpenCase(inventoryItem.id);
                        }
                      }}
                    >
                      {caseImageUrl ? (
                        <img
                          src={caseImageUrl}
                          alt={caseName}
                          className="w-full h-full object-contain rounded item-image"
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
                    <h5 className="text-white text-xs font-medium mb-1 truncate" title={caseName}>
                      {caseName}
                    </h5>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-yellow-400 text-sm font-bold">
                        <Monetary value={Number(casePrice)} showFraction={true} />
                      </p>
                      {((inventoryItem as any).quantity || 1) > 1 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-bold">
                          x{(inventoryItem as any).quantity}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white truncate">
                        {caseName}
                      </p>
                      {activeTab === 'active' && inventoryItem.status === 'inventory' && (
                        <button
                          className={`text-xs px-2 py-1 text-white rounded-full transition-colors duration-200 ${
                            openingCaseId === inventoryItem.id
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-green-600 hover:bg-green-500'
                          }`}
                          disabled={openingCaseId === inventoryItem.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openingCaseId !== inventoryItem.id) {
                              onOpenCase(inventoryItem.id);
                            }
                          }}
                        >
                          {openingCaseId === inventoryItem.id ? t('profile.opening') : t('profile.open_button')}
                        </button>
                      )}
                    </div>
                    {/* Acquisition info */}
                    <div className="mt-2 text-xs text-gray-400">
                      <p>{t('profile.acquired_date')} {new Date((inventoryItem as any).acquisition_date).toLocaleDateString()}</p>
                      <p className="capitalize">{t('profile.source')} {
                        inventoryItem.source === 'case' ? t('profile.sources.case') :
                        inventoryItem.source === 'purchase' ? t('profile.sources.purchase') :
                        inventoryItem.source
                      }</p>
                    </div>
                  </>
                );
              })()
            ) : null}
          </div>
        ))
      )}
    </div>
  );

  if (inventoryLoading) {
    return renderLoadingState();
  }

  if (filteredInventory.length === 0) {
    return renderEmptyState();
  }

  return renderInventoryGrid();
};

export default InventoryContent;
