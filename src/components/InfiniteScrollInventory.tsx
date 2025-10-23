import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import CaseWithDrop from './CaseWithDrop';
import ItemWithdrawBanner from './ItemWithdrawBanner';
import toast from 'react-hot-toast';
import Monetary from './Monetary';

interface InfiniteScrollInventoryProps {
  items: any[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  activeTab?: 'active' | 'opened' | 'withdrawn' | 'sold';
  openingCaseId?: string | null;
  onOpenCase?: (id: string) => void;
  onInventoryRefresh?: () => void;
  onUserRefresh?: () => void;
  getCaseTemplateById?: (id: string) => any;
  translateCaseName?: (name: string) => string;
  getRarityColor?: (rarity: string) => string;
  getRarityName?: (rarity: string, t?: any) => string;
  getItemImageUrl?: (imageUrl: string, itemName: string) => string;
}

export const InfiniteScrollInventory: React.FC<InfiniteScrollInventoryProps> = ({
  items,
  hasMore,
  isLoading,
  onLoadMore,
  activeTab = 'active',
  openingCaseId,
  onOpenCase,
  onInventoryRefresh,
  onUserRefresh,
  getCaseTemplateById,
  translateCaseName,
  getRarityColor,
  getRarityName,
  getItemImageUrl,
}) => {
  const { t } = useTranslation();
  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
    threshold: 200,
  });

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

  const isUserItem = (item: any) => item.item_type === 'item' && item.item;
  const isUserCase = (item: any) => item.item_type === 'case' && item.case_template_id;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {items.map((inventoryItem) => {
          if (activeTab === 'opened' && isUserItem(inventoryItem)) {
            const caseTemplate = inventoryItem.case_template_id && getCaseTemplateById
              ? getCaseTemplateById(inventoryItem.case_template_id)
              : null;

            return (
              <CaseWithDrop
                key={inventoryItem.id}
                droppedItem={inventoryItem}
                caseTemplate={caseTemplate}
              />
            );
          }

          return (
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
                <>
                  <div className={`w-full aspect-square rounded-lg bg-gradient-to-br ${getRarityColor?.(inventoryItem.item.rarity) || 'from-gray-500 to-gray-600'} p-1 mb-3 flex items-center justify-center item-image-container`}>
                    <img
                      src={getItemImageUrl?.(inventoryItem.item.image_url, inventoryItem.item.name) || inventoryItem.item.image_url}
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
                  <p className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getRarityColor?.(inventoryItem.item.rarity) || 'from-gray-500 to-gray-600'} text-white text-center mt-2`}>
                    {getRarityName?.(inventoryItem.item.rarity, t) || inventoryItem.item.rarity}
                  </p>
                  <div className="mt-2 text-xs text-gray-400">
                    <p>{t('profile.acquired_date')} {new Date(inventoryItem.acquisition_date).toLocaleDateString()}</p>
                    <p className="capitalize">{t('profile.source')} {
                      inventoryItem.source === 'case' ? t('profile.sources.case') :
                      inventoryItem.source === 'purchase' ? t('profile.sources.purchase') :
                      inventoryItem.source
                    }</p>
                  </div>

                  {activeTab === 'active' && inventoryItem.status === 'inventory' && onInventoryRefresh && onUserRefresh && (
                    <ItemWithdrawBanner
                      item={inventoryItem}
                      onWithdrawSuccess={() => {
                        showNotification(t('profile.item_withdraw_success', { itemName: inventoryItem.item.name }), 'success');
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
                (() => {
                  const caseTemplate = getCaseTemplateById?.(inventoryItem.case_template_id);
                  const rawCaseName = caseTemplate?.name || `Кейс #${inventoryItem.case_template_id.slice(0, 8)}`;
                  const caseName = caseTemplate?.name && translateCaseName ? translateCaseName(caseTemplate.name) : rawCaseName;
                  const casePrice = caseTemplate?.price || '0.00';
                  const caseImageUrl = caseTemplate?.image_url;

                  return (
                    <>
                      <div
                        className={`w-full aspect-square rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 p-1 mb-3 flex items-center justify-center transition-all duration-300 ${
                          activeTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id && onOpenCase
                            ? 'cursor-pointer hover:from-yellow-400 hover:to-orange-500'
                            : 'cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => {
                          if (activeTab === 'active' && inventoryItem.status === 'inventory' && openingCaseId !== inventoryItem.id && onOpenCase) {
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
                        {(inventoryItem.quantity || 1) > 1 && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-bold">
                            x{inventoryItem.quantity}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
                          {t('profile.case_label')}
                        </p>
                        {activeTab === 'active' && inventoryItem.status === 'inventory' && onOpenCase && (
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
                      <div className="mt-2 text-xs text-gray-400">
                        <p>{t('profile.acquired_date')} {new Date(inventoryItem.acquisition_date).toLocaleDateString()}</p>
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
          );
        })}
      </div>

      {/* Loading Indicator */}
      {hasMore && (
        <div ref={observerRef} className="text-center py-8">
          {isLoading && (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-400 text-sm">{t('profile.loading_more')}</p>
            </div>
          )}
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && items.length > 0 && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">{t('profile.all_items_loaded')}</p>
        </div>
      )}
    </div>
  );
};
