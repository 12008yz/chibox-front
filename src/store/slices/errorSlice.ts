import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Типы для ошибок
export interface AppError {
  id: string;
  code?: string;
  message: string;
  details?: any;
  timestamp: number;
  source?: string; // откуда пришла ошибка (API endpoint, component, etc.)
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRetryable: boolean;
  retryCount?: number;
  maxRetries?: number;
}

export interface NetworkError extends AppError {
  status?: number;
  statusText?: string;
  endpoint?: string;
  method?: string;
}

export interface ValidationError extends AppError {
  field?: string;
  validationRule?: string;
}

export interface ErrorState {
  // Глобальные ошибки
  globalErrors: AppError[];

  // Последняя критическая ошибка
  lastCriticalError: AppError | null;

  // Сетевые ошибки
  networkErrors: NetworkError[];

  // Ошибки валидации
  validationErrors: ValidationError[];

  // Флаги состояния
  hasUnreadErrors: boolean;
  isErrorBoundaryTriggered: boolean;

  // Статистика ошибок
  errorCount: number;
  sessionErrorCount: number;
}

const initialState: ErrorState = {
  globalErrors: [],
  lastCriticalError: null,
  networkErrors: [],
  validationErrors: [],
  hasUnreadErrors: false,
  isErrorBoundaryTriggered: false,
  errorCount: 0,
  sessionErrorCount: 0,
};

const errorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    // Добавление ошибок
    addError: (state, action: PayloadAction<Omit<AppError, 'id' | 'timestamp'>>) => {
      const error: AppError = {
        id: `error_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
        ...action.payload,
      };

      state.globalErrors.push(error);
      state.errorCount += 1;
      state.sessionErrorCount += 1;
      state.hasUnreadErrors = true;

      // Сохраняем критическую ошибку
      if (error.severity === 'critical') {
        state.lastCriticalError = error;
      }
    },

    addNetworkError: (state, action: PayloadAction<Omit<NetworkError, 'id' | 'timestamp'>>) => {
      const error: NetworkError = {
        id: `network_error_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 3,
        ...action.payload,
        // Устанавливаем значения по умолчанию, только если они не переданы
        severity: action.payload.severity || 'medium',
        isRetryable: action.payload.isRetryable ?? true,
      };

      state.networkErrors.push(error);
      state.globalErrors.push(error);
      state.errorCount += 1;
      state.sessionErrorCount += 1;
      state.hasUnreadErrors = true;
    },

    addValidationError: (state, action: PayloadAction<Omit<ValidationError, 'id' | 'timestamp'>>) => {
      const error: ValidationError = {
        id: `validation_error_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: 0,
        ...action.payload,
        // Устанавливаем значения по умолчанию, только если они не переданы
        severity: action.payload.severity || 'low',
        isRetryable: action.payload.isRetryable ?? false,
      };

      state.validationErrors.push(error);
      state.globalErrors.push(error);
      state.errorCount += 1;
      state.sessionErrorCount += 1;
      state.hasUnreadErrors = true;
    },

    // Удаление ошибок
    removeError: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;

      state.globalErrors = state.globalErrors.filter(error => error.id !== errorId);
      state.networkErrors = state.networkErrors.filter(error => error.id !== errorId);
      state.validationErrors = state.validationErrors.filter(error => error.id !== errorId);

      if (state.lastCriticalError?.id === errorId) {
        state.lastCriticalError = null;
      }
    },

    clearErrors: (state) => {
      state.globalErrors = [];
      state.networkErrors = [];
      state.validationErrors = [];
      state.lastCriticalError = null;
      state.hasUnreadErrors = false;
    },

    clearErrorsBySource: (state, action: PayloadAction<string>) => {
      const source = action.payload;

      state.globalErrors = state.globalErrors.filter(error => error.source !== source);
      state.networkErrors = state.networkErrors.filter(error => error.source !== source);
      state.validationErrors = state.validationErrors.filter(error => error.source !== source);

      if (state.lastCriticalError?.source === source) {
        state.lastCriticalError = null;
      }
    },

    clearErrorsBySeverity: (state, action: PayloadAction<AppError['severity']>) => {
      const severity = action.payload;

      state.globalErrors = state.globalErrors.filter(error => error.severity !== severity);
      state.networkErrors = state.networkErrors.filter(error => error.severity !== severity);
      state.validationErrors = state.validationErrors.filter(error => error.severity !== severity);

      if (state.lastCriticalError?.severity === severity) {
        state.lastCriticalError = null;
      }
    },

    // Retry логика
    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const errorId = action.payload;

      const updateRetryCount = (errors: AppError[]) => {
        const error = errors.find(e => e.id === errorId);
        if (error && error.retryCount !== undefined) {
          error.retryCount += 1;
        }
      };

      updateRetryCount(state.globalErrors);
      updateRetryCount(state.networkErrors);
      updateRetryCount(state.validationErrors);
    },

    // Состояние ошибок
    markErrorsAsRead: (state) => {
      state.hasUnreadErrors = false;
    },

    setErrorBoundaryTriggered: (state, action: PayloadAction<boolean>) => {
      state.isErrorBoundaryTriggered = action.payload;
    },

    // Сброс статистики
    resetSessionErrorCount: (state) => {
      state.sessionErrorCount = 0;
    },

    // Полный сброс состояния
    resetErrorState: () => initialState,
  },
});

export const {
  addError,
  addNetworkError,
  addValidationError,
  removeError,
  clearErrors,
  clearErrorsBySource,
  clearErrorsBySeverity,
  incrementRetryCount,
  markErrorsAsRead,
  setErrorBoundaryTriggered,
  resetSessionErrorCount,
  resetErrorState,
} = errorSlice.actions;

export default errorSlice.reducer;
