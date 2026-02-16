// Утилита для работы с аналитикой (Google Analytics и Яндекс.Метрика)
//
// Подключение Яндекс.Метрики:
// 1. Создайте счётчик на https://metrika.yandex.ru
// 2. В .env или .env.production добавьте: VITE_YANDEX_METRIKA_ID=XXXXXXXX (номер счётчика)
// 3. При сборке/запуске аналитика инициализируется автоматически.
//
// События: trackEvent('goal_name', { param: 'value' }) или trackYMEvent / trackGAEvent

declare global {
   interface Window {
     gtag?: (...args: unknown[]) => void;
     ym?: (...args: unknown[]) => void;
     dataLayer?: unknown[];
   }
 }
 
 // Google Analytics
 export const initGoogleAnalytics = (measurementId: string) => {
   if (!measurementId) return;
 
   // Добавляем скрипт Google Analytics
   const script1 = document.createElement('script');
   script1.async = true;
   script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
   document.head.appendChild(script1);
 
   // Инициализация
   window.dataLayer = window.dataLayer || [];
   window.gtag = function gtag(...args: unknown[]) {
     window.dataLayer?.push(args);
   };
   window.gtag('js', new Date());
   window.gtag('config', measurementId, {
     page_path: window.location.pathname,
     send_page_view: true,
   });
 };
 
 // Яндекс.Метрика
 export const initYandexMetrika = (counterId: string) => {
   if (!counterId) return;
 
   // Добавляем скрипт Яндекс.Метрики
   (function(m,e,t,r,i,k,a){
     // @ts-expect-error - Yandex Metrika snippet
     m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
     // @ts-expect-error - Yandex Metrika snippet
     m[i].l=1*new Date();
     for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
     // @ts-expect-error - Yandex Metrika snippet
     k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
   })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
 
   window.ym?.(Number(counterId), "init", {
     clickmap: true,
     trackLinks: true,
     accurateTrackBounce: true,
     webvisor: true,
     trackHash: true,
   });
 };
 
 // Отправка события в Google Analytics
 export const trackGAEvent = (
   eventName: string,
   eventParams?: Record<string, unknown>
 ) => {
   if (window.gtag) {
     window.gtag('event', eventName, eventParams);
   }
 };
 
 // Отправка события в Яндекс.Метрику
 export const trackYMEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
   const counterId = import.meta.env.VITE_YANDEX_METRIKA_ID;
   if (window.ym && counterId) {
     window.ym(Number(counterId), 'reachGoal', eventName, eventParams);
   }
 };
 
 // Универсальная функция отправки события
 export const trackEvent = (
   eventName: string,
   eventParams?: Record<string, unknown>
 ) => {
   trackGAEvent(eventName, eventParams);
   trackYMEvent(eventName, eventParams);
 };
 
 // Отслеживание просмотра страницы
 export const trackPageView = (pagePath: string, pageTitle?: string) => {
   // Google Analytics
   if (window.gtag) {
     window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
       page_path: pagePath,
       page_title: pageTitle,
     });
   }
 
   // Яндекс.Метрика
   const counterId = import.meta.env.VITE_YANDEX_METRIKA_ID;
   if (window.ym && counterId) {
     window.ym(Number(counterId), 'hit', pagePath, {
       title: pageTitle,
     });
   }
 };
 
// Инициализация всей аналитики
 export const initAnalytics = () => {
   const gaId = import.meta.env.VITE_GA_MEASUREMENT_ID;
   const ymId = import.meta.env.VITE_YANDEX_METRIKA_ID;

   if (gaId) {
     initGoogleAnalytics(gaId);
   }

   if (ymId) {
     initYandexMetrika(ymId);
     if (import.meta.env.DEV) {
       console.log('[Яндекс.Метрика] Инициализирован счётчик:', ymId);
     }
   } else if (import.meta.env.DEV) {
     console.warn('[Яндекс.Метрика] Не найден VITE_YANDEX_METRIKA_ID в .env — перезапустите dev-сервер (npm run dev)');
   }
 };
 