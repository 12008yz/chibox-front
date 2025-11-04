import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы для UI состояния
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: string;
  data?: any;
}

export interface UIState {
  // Загрузочные состояния
  isGlobalLoading: boolean;
  loadingTasks: string[];

  // Модальные окна
  modals: Modal[];

  // Уведомления/тосты
  notifications: ToastNotification[];

  // Сайдбар
  isSidebarOpen: boolean;

  // Мобильное меню
  isMobileMenuOpen: boolean;

  // Темы
  theme: 'light' | 'dark' | 'auto';

  // Языки
  language: 'ru' | 'en';

  // Анимации
  animationsEnabled: boolean;

  // Звуки
  soundsEnabled: boolean;

  // Интро видео
  showIntroVideo: boolean;
}

const initialState: UIState = {
  isGlobalLoading: false,
  loadingTasks: [],
  modals: [],
  notifications: [],
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  theme: 'dark',
  language: 'ru',
  animationsEnabled: true,
  soundsEnabled: true,
  showIntroVideo: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Загрузочные состояния
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },

    addLoadingTask: (state, action: PayloadAction<string>) => {
      if (!state.loadingTasks.includes(action.payload)) {
        state.loadingTasks.push(action.payload);
      }
    },

    removeLoadingTask: (state, action: PayloadAction<string>) => {
      state.loadingTasks = state.loadingTasks.filter(task => task !== action.payload);
    },

    clearLoadingTasks: (state) => {
      state.loadingTasks = [];
    },

    // Модальные окна
    openModal: (state, action: PayloadAction<Omit<Modal, 'id'> & { id?: string }>) => {
      const modal: Modal = {
        id: action.payload.id || `modal_${Date.now()}`,
        type: action.payload.type,
        data: action.payload.data,
      };
      state.modals.push(modal);
    },

    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.id !== action.payload);
    },

    closeModalByType: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter(modal => modal.type !== action.payload);
    },

    closeAllModals: (state) => {
      state.modals = [];
    },

    // Уведомления
    addNotification: (state, action: PayloadAction<Omit<ToastNotification, 'id' | 'timestamp'>>) => {
      const notification: ToastNotification = {
        id: `notification_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        duration: 5000, // по умолчанию 5 секунд
        ...action.payload,
      };
      state.notifications.push(notification);
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(notification => notification.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Интерфейс
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },

    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },

    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },

    // Настройки
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<'ru' | 'en'>) => {
      state.language = action.payload;
    },

    setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.animationsEnabled = action.payload;
    },

    setSoundsEnabled: (state, action: PayloadAction<boolean>) => {
      state.soundsEnabled = action.payload;
    },

    // Интро видео
    setShowIntroVideo: (state, action: PayloadAction<boolean>) => {
      console.log('[uiSlice] setShowIntroVideo called with:', action.payload);
      console.log('[uiSlice] Previous value:', state.showIntroVideo);
      state.showIntroVideo = action.payload;
      console.log('[uiSlice] New value:', state.showIntroVideo);
    },

    // Сброс состояния
    resetUIState: () => initialState,
  },
});

export const {
  setGlobalLoading,
  addLoadingTask,
  removeLoadingTask,
  clearLoadingTasks,
  openModal,
  closeModal,
  closeModalByType,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  setLanguage,
  setAnimationsEnabled,
  setSoundsEnabled,
  setShowIntroVideo,
  resetUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
