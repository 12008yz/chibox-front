/**
 * Функция для правильного склонения слова "день" в русском языке
 * @param count - количество дней
 * @returns правильно просклоненное слово "день/дня/дней"
 */
export function getDaysDeclension(count: number): string {
   const lastDigit = count % 10;
   const lastTwoDigits = count % 100;
 
   // Исключения для 11, 12, 13, 14
   if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
     return 'дней';
   }
 
   // Остальные случаи
   if (lastDigit === 1) {
     return 'день';
   } else if (lastDigit >= 2 && lastDigit <= 4) {
     return 'дня';
   } else {
     return 'дней';
   }
 }
 
 /**
  * Функция для получения строки с количеством и правильно просклоненным словом "день"
  * @param count - количество дней
  * @returns строка вида "1 день", "2 дня", "5 дней"
  */
 export function formatDays(count: number): string {
   return `${count} ${getDaysDeclension(count)}`;
 }
 