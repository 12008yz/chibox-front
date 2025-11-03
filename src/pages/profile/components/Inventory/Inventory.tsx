import React from 'react';
import { useTranslation } from 'react-i18next';
import InventoryTabs from './InventoryTabs';
import InventoryContent from './InventoryContent';
import { useInventory } from '../../hooks/useInventory';

interface InventoryProps {
  inventoryData: any[];
  caseTemplatesData: any;
  inventoryLoading: boolean;
  onOpenCase: (id: string) => void;
  onInventoryRefresh: () => void;
  onUserRefresh: () => void;
  translateCaseName: (name: string) => string;
  openingCaseId: string | null;
  totalCasesOpened?: number;
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
    opened: totalCasesOpened !== undefined ? totalCasesOpened : getOpenedCases().length,
    withdrawn: getWithdrawnItems().length,
    sold: getSoldItems().length
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-lg">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
            <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        {t('profile.inventory_title')}
      </h3>

      {/* Inventory Tabs */}
      <InventoryTabs
        activeTab={activeInventoryTab}
        onTabChange={setActiveInventoryTab}
        counts={tabCounts}
      />

      {/* Tab Description */}
      <div className="mb-4 p-3 bg-black/30 backdrop-blur-sm rounded-lg border border-white/10">
        <p className="text-sm text-gray-300">
          {activeInventoryTab === 'active' && t('profile.inventory_descriptions.active')}
          {activeInventoryTab === 'opened' && t('profile.inventory_descriptions.opened')}
          {activeInventoryTab === 'withdrawn' && t('profile.inventory_descriptions.withdrawn')}
          {activeInventoryTab === 'sold' && t('profile.inventory_descriptions.sold')}
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
