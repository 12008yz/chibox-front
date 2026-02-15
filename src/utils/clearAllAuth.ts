/**
 * Полная очистка всех данных авторизации
 * Используйте эту функцию для решения проблем с "застрявшими" сессиями
 */
export const clearAllAuthData = () => {
   try {
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
       }
     });
 
     // Удаляем все ключи, начинающиеся с auth_, user_, session_
     Object.keys(localStorage).forEach(key => {
       if (key.startsWith('auth_') || key.startsWith('user_') || key.startsWith('session_')) {
         localStorage.removeItem(key);
       }
     });
 
     // 2. Очистка sessionStorage
     sessionStorage.clear();

     // 3. Очистка cookies
     const cookies = document.cookie.split(';');
     cookies.forEach(cookie => {
       const cookieName = cookie.split('=')[0].trim();
       // Удаляем cookie для всех возможных path и domain
       document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
       document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
     });
 
     // 4. Очистка IndexedDB (если используется)
     if (window.indexedDB) {
       window.indexedDB.databases?.().then((databases) => {
         databases.forEach((db) => {
           if (db.name) {
             window.indexedDB.deleteDatabase(db.name);
           }
         });
       });
     }
 
     // Перезагружаем страницу через 500ms
     setTimeout(() => {
       window.location.href = '/';
     }, 500);
 
   } catch {
     // clear failed
   }
 };
 
 // Делаем функцию доступной глобально для быстрого вызова из консоли
 if (typeof window !== 'undefined') {
   (window as any).clearAllAuthData = clearAllAuthData;
 }
 