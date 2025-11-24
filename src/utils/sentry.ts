// Утилита для отслеживания ошибок с Sentry
// Установите Sentry: npm install @sentry/react

// Раскомментируйте когда установите Sentry
// import * as Sentry from '@sentry/react';

export const initSentry = () => {
   const sentryDSN = import.meta.env.VITE_SENTRY_DSN;
 
   if (!sentryDSN) {
     console.log('Sentry DSN не настроен. Отслеживание ошибок отключено.');
     return;
   }
 
   // Раскомментируйте когда установите @sentry/react
   /*
   Sentry.init({
     dsn: sentryDSN,
     environment: import.meta.env.VITE_NODE_ENV || 'development',
     integrations: [
       Sentry.browserTracingIntegration(),
       Sentry.replayIntegration({
         maskAllText: false,
         blockAllMedia: false,
       }),
     ],
     // Performance Monitoring
     tracesSampleRate: 1.0, // Capture 100% of the transactions
     // Session Replay
     replaysSessionSampleRate: 0.1, // 10% of sessions
     replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
 
     beforeSend(event, hint) {
       // Фильтрация ошибок (опционально)
       const error = hint.originalException;
 
       // Игнорируем определенные ошибки
       if (error && typeof error === 'object' && 'message' in error) {
         const message = String(error.message);
         if (
           message.includes('ResizeObserver loop') ||
           message.includes('Non-Error promise rejection')
         ) {
           return null;
         }
       }
 
       return event;
     },
   });
   */
 
   console.log('Sentry инициализирован (заглушка). Установите @sentry/react для полной функциональности.');
 };
 
 // Ручное логирование ошибки
 export const logError = (error: Error, context?: Record<string, unknown>) => {
   if (import.meta.env.VITE_SENTRY_DSN) {
     // Раскомментируйте когда установите @sentry/react
     // Sentry.captureException(error, { extra: context });
     console.error('Error logged to Sentry:', error, context);
   } else {
     console.error('Error:', error, context);
   }
 };
 
 // Установка пользовательского контекста
 export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
   if (import.meta.env.VITE_SENTRY_DSN) {
     // Раскомментируйте когда установите @sentry/react
     // Sentry.setUser(user);
     console.log('User context set:', user);
   }
 };
 
 // Очистка пользовательского контекста
 export const clearUserContext = () => {
   if (import.meta.env.VITE_SENTRY_DSN) {
     // Раскомментируйте когда установите @sentry/react
     // Sentry.setUser(null);
     console.log('User context cleared');
   }
 };
 
 // Установка дополнительного контекста
 export const setContext = (key: string, value: Record<string, unknown>) => {
   if (import.meta.env.VITE_SENTRY_DSN) {
     // Раскомментируйте когда установите @sentry/react
     // Sentry.setContext(key, value);
     console.log('Context set:', key, value);
   }
 };
 