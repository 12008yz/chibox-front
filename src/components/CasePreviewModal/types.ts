import { CaseTemplate } from '../../types/api';

export interface CasePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: CaseTemplate;
  onBuyAndOpenCase?: (caseTemplate: CaseTemplate) => Promise<any>;
  fixedPrices?: boolean;
  onDataUpdate?: () => void;
}

export interface CaseItemProps {
  item: any;
  index: number;
  animationIndex: number;
  showOpeningAnimation: boolean;
  sliderPosition: number;
  openingResult: any;
  animationPhase: string;
  caseData: any;
  showStrikeThrough: boolean;
  showGoldenSparks: boolean;
  getRarityColor: (rarity: string) => string;
  generateGoldenSparks: () => React.ReactNode[];
  t: (key: string, options?: any) => string;
  isVisible?: boolean;
}

export interface StaticCaseItemProps {
  item: any;
  getRarityColor: (rarity: string) => string;
  t: (key: string, options?: any) => string;
}

export interface VirtualizedGridProps {
  items: any[];
  itemHeight?: number;
  containerHeight?: number;
  getRarityColor: (rarity: string) => string;
  t: (key: string, options?: any) => string;
}

export interface ModalHeaderProps {
  caseData: CaseTemplate;
  caseImageUrl: string;
  fixedPrices: boolean;
  onClose: () => void;
  t: (key: string, options?: any) => string;
}

export interface ModalFooterProps {
  statusData: any;
  statusLoading: boolean;
  fixedPrices: boolean;
  paymentMethod: 'balance' | 'bank_card';
  setPaymentMethod: (method: 'balance' | 'bank_card') => void;
  userData: any;
  caseData: CaseTemplate;
  isProcessing: boolean;
  buyLoading: boolean;
  openLoading: boolean;
  showOpeningAnimation: boolean;
  handleClose: () => void;
  handleBuyCase: () => void;
  handleOpenCase: (caseId?: string, inventoryItemId?: string) => void;
  getCasePrice: (caseData: CaseTemplate) => number;
  checkBalanceSufficient: (price: number) => boolean;
  t: (key: string, options?: any) => string;
}

export type AnimationPhase = 'idle' | 'spinning' | 'slowing' | 'stopped';
