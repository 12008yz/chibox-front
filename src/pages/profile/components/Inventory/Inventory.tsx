import React from 'react';
import { useTranslation } from 'react-i18next';
import InventoryTabs from './InventoryTabs';
import InventoryContent from './InventoryContent';
import { useInventory } from '../../hooks/useInventory';
import { Gamepad2, Upload, Coins } from 'lucide-react';

interface InventoryProps {
  inventoryData: any[];
  caseTemplatesData: any;
  inventoryLoading: boolean;
  onOpenCase: (id: string) => void;
  onInventoryRefresh: () => void;
  onUserRefresh: () => void;
  translateCaseName: (name: string) => string;
  openingCaseId: string | null;
  totalCasesOpened: number;
}

const Inventory: React.FC<InventoryProps> = ({
  inventoryData,
  caseTemplatesData,
  inventoryLoading,
  onOpenCase,
  onInventoryRefresh,
  onUserRefresh,
  translateCaseName,
  openingCaseId,
  totalCasesOpened
}) => {
  const { t } = useTranslation();

  const {
    activeInventoryTab,
    setActiveInventoryTab,
    filteredInventory,
    getActiveInventory,
    getOpenedCases,
    getWithdrawnItems,
    getSoldItems,
    getCaseTemplateById
  } = useInventory(inventoryData, caseTemplatesData);

  const tabCounts = {
    active: getActiveInventory().length,
    opened: totalCasesOpened, // Используем правильное значение из user.total_cases_opened
    withdrawn: getWithdrawnItems().length,
    sold: getSoldItems().length
  };

  // Вывод инвентаря в консоль
  console.log('🎒 [INVENTORY] Полные данные инвентаря:', {
    всего_предметов: inventoryData?.length || 0,
    все_предметы: inventoryData,
    активные: {
      количество: getActiveInventory().length,
      предметы: getActiveInventory()
    },
    открытые_кейсы: {
      количество: getOpenedCases().length,
      кейсы: getOpenedCases()
    },
    выведенные: {
      количество: getWithdrawnItems().length,
      предметы: getWithdrawnItems()
    },
    проданные: {
      количество: getSoldItems().length,
      предметы: getSoldItems()
    },
    текущая_вкладка: activeInventoryTab,
    отфильтрованные_предметы: filteredInventory,
    шаблоны_кейсов: caseTemplatesData
  });


  return (
    <div className="bg-black/50 rounded-xl p-4 sm:p-5 lg:p-6 border border-white/10 shadow-lg">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="truncate">{t('profile.inventory_title')}</span>
      </h3>

      {/* Inventory Tabs */}
      <InventoryTabs
        activeTab={activeInventoryTab}
        onTabChange={setActiveInventoryTab}
        counts={tabCounts}
      />

      {/* Tab Description */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-black/40 rounded-lg border border-white/10">
        <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2">
          {activeInventoryTab === 'active' && (
            <>
              <Gamepad2 className="w-4 h-4 flex-shrink-0" />
              <span>{t('profile.inventory_descriptions.active')}</span>
            </>
          )}
          {activeInventoryTab === 'opened' && (
            <>
              <Gamepad2 className="w-4 h-4 flex-shrink-0" />
              <span>{t('profile.inventory_descriptions.opened')}</span>
            </>
          )}
          {activeInventoryTab === 'withdrawn' && (
            <>
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span>{t('profile.inventory_descriptions.withdrawn')}</span>
            </>
          )}
          {activeInventoryTab === 'sold' && (
            <>
              <Coins className="w-4 h-4 flex-shrink-0" />
              <span>{t('profile.inventory_descriptions.sold')}</span>
            </>
          )}
        </p>
      </div>

      {/* Inventory Content */}
      <InventoryContent
        activeTab={activeInventoryTab}
        filteredInventory={filteredInventory}
        inventoryLoading={inventoryLoading}
        openingCaseId={openingCaseId}
        onOpenCase={onOpenCase}
        onInventoryRefresh={onInventoryRefresh}
        onUserRefresh={onUserRefresh}
        getCaseTemplateById={getCaseTemplateById}
        translateCaseName={translateCaseName}
      />
    </div>
  );
};

export default Inventory;
