import React from 'react';
import { useTranslation } from 'react-i18next';
import type { InventoryTab } from '../../hooks/useInventory';

interface InventoryTabsProps {
  activeTab: InventoryTab;
  onTabChange: (tab: InventoryTab) => void;
  counts: {
    active: number;
    opened: number;
    withdrawn: number;
    sold: number;
  };
}

const InventoryTabs: React.FC<InventoryTabsProps> = ({ activeTab, onTabChange, counts }) => {
  const { t } = useTranslation();

  const tabs = [
    {
      key: 'active' as InventoryTab,
      label: t('profile.inventory_tabs.active'),
      count: counts.active,
      icon: (
        <g>
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </g>
      ),
      gradient: 'from-green-500 to-blue-500'
    },
    {
      key: 'opened' as InventoryTab,
      label: t('profile.inventory_tabs.opened_cases'),
      count: counts.opened,
      icon: (
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      ),
      gradient: 'from-orange-500 to-red-500'
    },
    {
      key: 'withdrawn' as InventoryTab,
      label: t('profile.inventory_tabs.withdrawn'),
      count: counts.withdrawn,
      icon: (
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
      ),
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      key: 'sold' as InventoryTab,
      label: t('profile.inventory_tabs.sold'),
      count: counts.sold,
      icon: (
        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
      ),
      gradient: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-1 bg-black/20 rounded-lg border border-gray-700/30">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={(e) => {
            e.preventDefault();
            onTabChange(tab.key);
          }}
          type="button"
          className={`px-2 py-1.5 sm:px-3 sm:py-2 lg:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 min-w-0 ${
            activeTab === tab.key
              ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {tab.icon}
          </svg>
          <span className="truncate hidden sm:inline">{tab.label}</span>
          <span className="truncate sm:hidden text-[10px]">{tab.label.split(' ')[0]}</span>
          <span className="text-[10px] sm:text-xs bg-white/20 px-1 sm:px-2 py-0.5 rounded-full flex-shrink-0">{tab.count}</span>
        </button>
      ))}
    </div>
  );
};

export default InventoryTabs;
