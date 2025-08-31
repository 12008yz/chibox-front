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
* Функция для получения ключа интернационализации для склонения дней
* @param count - количество дней
* @returns ключ для i18n "time.day_1", "time.day_2_4", или "time.day_5_plus"
*/
export function getDaysDeclensionKey(count: number): string {
 const lastDigit = count % 10;
 const lastTwoDigits = count % 100;

 // Исключения для 11, 12, 13, 14
 if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
   return 'time.day_5_plus';
 }

 // Остальные случаи
 if (lastDigit === 1) {
   return 'time.day_1';
 } else if (lastDigit >= 2 && lastDigit <= 4) {
   return 'time.day_2_4';
 } else {
   return 'time.day_5_plus';
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

/**
* Функция для получения интернационализированной строки с количеством дней
* @param count - количество дней
* @param t - функция перевода
* @returns интернационализированная строка
*/
export function formatDaysI18n(count: number, t: (key: string) => string): string {
 const dayKey = getDaysDeclensionKey(count);
 return `${count} ${t(dayKey)}`;
}
