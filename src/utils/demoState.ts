import type { UserCaseItem, UserInventoryItem } from '../types/api';
import { initialDemoInventory } from './demoData';

const INITIAL_BALANCE = 125_430.5;
const INITIAL_TOTAL_CASES_OPENED = 184;

let balance = INITIAL_BALANCE;
let totalCasesOpened = INITIAL_TOTAL_CASES_OPENED;
let inventory = initialDemoInventory();

export function getDemoBalance(): number {
  return balance;
}

export function setDemoBalance(next: number): void {
  balance = Math.max(0, next);
}

export function getDemoTotalCasesOpened(): number {
  return totalCasesOpened;
}

export function incrementDemoCasesOpened(): void {
  totalCasesOpened += 1;
}

export function getDemoInventory(): { items: UserInventoryItem[]; cases: UserCaseItem[] } {
  return {
    items: inventory.items.map((i) => ({ ...i, item: i.item ? { ...i.item } : i.item })),
    cases: inventory.cases.map((c) => ({
      ...c,
      case_template: c.case_template ? { ...c.case_template } : c.case_template,
    })),
  };
}

export function removeDemoCase(caseInvId: string): UserCaseItem | undefined {
  const idx = inventory.cases.findIndex((c) => c.id === caseInvId);
  if (idx === -1) return undefined;
  const [removed] = inventory.cases.splice(idx, 1);
  return removed;
}

export function addDemoItem(item: UserInventoryItem): void {
  inventory.items.unshift(item);
}

export function removeDemoItem(inventoryRowId: string): UserInventoryItem | undefined {
  const idx = inventory.items.findIndex((i) => i.id === inventoryRowId);
  if (idx === -1) return undefined;
  const [removed] = inventory.items.splice(idx, 1);
  return removed;
}

export function addDemoCasePurchased(caseRow: UserCaseItem): void {
  inventory.cases.unshift(caseRow);
}

export function resetDemoState(): void {
  balance = INITIAL_BALANCE;
  totalCasesOpened = INITIAL_TOTAL_CASES_OPENED;
  inventory = initialDemoInventory();
}
