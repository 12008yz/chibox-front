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
        <>
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
        </>
      ),
      gradient: 'from-green-500 to-blue-500'
    },
    {
      key: 'opened' as InventoryTab,
      label: t('profile.inventory_tabs.opened_cases'),
      count: counts.opened,
      icon: (
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      ),
      gradient: 'from-orange-500 to-red-500'
    },
    {
      key: 'withdrawn' as InventoryTab,
      label: t('profile.inventory_tabs.withdrawn'),
      count: counts.withdrawn,
      icon: (
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 7.707 9.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
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
    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-black/20 rounded-lg border border-gray-700/30">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
            activeTab === tab.key
              ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            {tab.icon}
          </svg>
          {tab.label}
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{tab.count}</span>
        </button>
      ))}
    </div>
  );
};

export default InventoryTabs;
