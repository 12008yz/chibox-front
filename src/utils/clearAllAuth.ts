/**
 * Полная очистка всех данных авторизации
 * Используйте эту функцию для решения проблем с "застрявшими" сессиями
 */
export const clearAllAuthData = () => {
   try {
     console.log('🗑️  Начинаем полную очистку данных авторизации...');
 
     // 1. Очистка localStorage
     const keysToRemove = [
       'auth_token',
       'user',
       'user_id',
       'userId',
       'token',
       'isAuthenticated',
       'last_username',
       'user_preferences',
       'session',
       'sessionId'
     ];
 
     keysToRemove.forEach(key => {
       if (localStorage.getItem(key)) {
         localStorage.removeItem(key);
         console.log(`✅ Удалён localStorage: ${key}`);
       }
     });
 
     // Удаляем все ключи, начинающиеся с auth_, user_, session_
     Object.keys(localStorage).forEach(key => {
       if (key.startsWith('auth_') || key.startsWith('user_') || key.startsWith('session_')) {
         localStorage.removeItem(key);
         console.log(`✅ Удалён localStorage: ${key}`);
       }
     });
 
     // 2. Очистка sessionStorage
     sessionStorage.clear();
     console.log('✅ sessionStorage полностью очищен');
 
     // 3. Очистка cookies
     const cookies = document.cookie.split(';');
     cookies.forEach(cookie => {
       const cookieName = cookie.split('=')[0].trim();
       // Удаляем cookie для всех возможных path и domain
       document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
       document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
       console.log(`✅ Удалён cookie: ${cookieName}`);
     });
 
     // 4. Очистка IndexedDB (если используется)
     if (window.indexedDB) {
       window.indexedDB.databases?.().then((databases) => {
         databases.forEach((db) => {
           if (db.name) {
             window.indexedDB.deleteDatabase(db.name);
             console.log(`✅ Удалена IndexedDB: ${db.name}`);
           }
         });
       });
     }
 
     console.log('✨ Полная очистка завершена!');
     console.log('🔄 Перезагружаем страницу...');
 
     // Перезагружаем страницу через 500ms
     setTimeout(() => {
       window.location.href = '/';
     }, 500);
 
   } catch (error) {
     console.error('❌ Ошибка при очистке данных:', error);
   }
 };
 
 // Делаем функцию доступной глобально для быстрого вызова из консоли
 if (typeof window !== 'undefined') {
   (window as any).clearAllAuthData = clearAllAuthData;
 }
 