import { useState, useMemo } from 'react';
import type { UserInventoryItem, UserCaseItem } from '../../../types/api';

export type InventoryTab = 'active' | 'opened' | 'withdrawn' | 'sold';

// Helper функции для определения типа элемента инвентаря
export const isUserItem = (item: any): item is UserInventoryItem => {
  return item.item_type === 'item' && item.item_id !== null && item.item;
};

export const isUserCase = (item: any): item is UserCaseItem => {
  return item.item_type === 'case' && item.case_template_id !== null;
};

export const useInventory = (inventoryData: any[], caseTemplatesData: any) => {
  const [activeInventoryTab, setActiveInventoryTab] = useState<InventoryTab>('active');
  const [openingCaseId, setOpeningCaseId] = useState<string | null>(null);

  // Сортируем инвентарь: кейсы первыми, затем остальные предметы
  const inventory = useMemo(() => {
    return [...inventoryData].sort((a, b) => {
      // Если один элемент - кейс, а другой - нет, кейс идет первым
      if (a.item_type === 'case' && b.item_type !== 'case') return -1;
      if (a.item_type !== 'case' && b.item_type === 'case') return 1;

      // Если оба кейсы или оба предметы, сортируем по дате получения (новые первыми)
      const dateA = new Date(a.acquisition_date || 0);
      const dateB = new Date(b.acquisition_date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [inventoryData]);

  // Функции для фильтрации инвентаря по разным категориям
  const getActiveInventory = () => {
    return inventory.filter(item =>
      (item.status === 'inventory' || item.status === 'available') && (isUserItem(item) || isUserCase(item))
    );
  };

  const getOpenedCases = () => {
    // Все предметы, полученные из кейсов (история открытий)
    return inventory.filter(item =>
      isUserItem(item) && item.source === 'case'
    ) as UserInventoryItem[];
  };

  const getWithdrawnItems = () => {
    return inventory.filter(item =>
      isUserItem(item) && (item.status === 'withdrawn' || item.status === 'pending_withdrawal')
    );
  };

  const getSoldItems = () => {
    return inventory.filter(item =>
      isUserItem(item) && (item.status === 'sold' || item.status === 'used')
    );
  };

  // Получаем инвентарь в зависимости от активного таба
  const getFilteredInventory = () => {
    switch (activeInventoryTab) {
      case 'active':
        return getActiveInventory();
      case 'opened':
        return getOpenedCases();
      case 'withdrawn':
        return getWithdrawnItems();
      case 'sold':
        return getSoldItems();
      default:
        return getActiveInventory();
    }
  };

  const filteredInventory = getFilteredInventory();
  const availableInventory = getActiveInventory();

  // Функция для получения шаблона кейса по ID
  const getCaseTemplateById = (templateId: string) => {
    if (!caseTemplatesData?.success || !caseTemplatesData?.data) return null;
    return caseTemplatesData.data.find((template: any) => template.id === templateId);
  };

  return {
    activeInventoryTab,
    setActiveInventoryTab,
    openingCaseId,
    setOpeningCaseId,
    inventory,
    filteredInventory,
    availableInventory,
    getActiveInventory,
    getOpenedCases,
    getWithdrawnItems,
    getSoldItems,
    getCaseTemplateById
  };
};
