// Список запрещенных слов и выражений (можно расширять)
const bannedWords = [
   // Основные оскорбления
   'дурак', 'идиот', 'тупой', 'придурок', 'дебил', 'кретин', 'лох', 'лошара',
   'сука', 'блядь', 'шлюха', 'пидор', 'гей', 'пидарас', 'гомик',
   'говно', 'дерьмо', 'хуйня', 'хуй', 'пизда', 'залупа', 'жопа',
   'ублюдок', 'сволочь', 'мразь', 'тварь', 'скотина', 'животное', 'хуесос',
 
   // Мат
   'хуй', 'пизда', 'ебать', 'ебал', 'ебет', 'ебут', 'нахуй', 'похуй',
   'блять', 'сука', 'пиздец', 'охуеть', 'заебал', 'заебись',
 
   // Экстремизм и ненависть
   'нацист', 'фашист', 'гитлер', 'сс', 'рейх', 'убить', 'смерть',
   'террор', 'взрыв', 'бомба', 'убийство',
 
   // Наркотики
   'наркотик', 'кокаин', 'героин', 'амфетамин', 'спайс', 'соль',
   'трава', 'план', 'косяк', 'дурь',
 
   // Расизм
   'негр', 'хохол', 'чурка', 'азер', 'кавказец', 'чеченец',
 
   // Англоязычные
   'fuck', 'shit', 'bitch', 'nigger', 'faggot', 'whore', 'slut',
   'asshole', 'bastard', 'damn', 'pussy', 'cock', 'dick',
   'nazi', 'hitler', 'kill', 'death', 'terror', 'bomb',
 
   // Админ/система
   'admin', 'administrator', 'moderator', 'мод', 'админ', 'администратор',
   'system', 'bot', 'бот', 'система', 'support', 'саппорт', 'техподдержка',
 
   // Обход фильтров
   'suka', 'blyad', 'pidor', 'hui', 'pizda', 'ebal',
 ];
 
 // Паттерны для обнаружения попыток обхода фильтров
 const suspiciousPatterns = [
   /(.)\1{4,}/, // Повторение одного символа более 4 раз подряд
   /[0-9]{8,}/, // Длинные числовые последовательности
   /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/, // Много специальных символов подряд
   /^[0-9]+$/, // Только цифры
   /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Только специальные символы
 ];
 
 /**
  * Нормализует строку для проверки (убирает пробелы, приводит к нижнему регистру, заменяет похожие символы)
  */
 function normalizeString(text: string): string {
   return text
     .toLowerCase()
     .replace(/\s+/g, '') // Убираем все пробелы
     .replace(/[0o]/g, 'о') // Заменяем 0 и o на русскую о
     .replace(/[3з]/g, 'з') // Заменяем 3 на з
     .replace(/[4ч]/g, 'ч') // Заменяем 4 на ч
     .replace(/[6б]/g, 'б') // Заменяем 6 на б
     .replace(/[1iі]/g, 'и') // Заменяем 1, i на и
     .replace(/[5s]/g, 'с') // Заменяем 5, s на с
     .replace(/[7т]/g, 'т') // Заменяем 7 на т
     .replace(/[8в]/g, 'в') // Заменяем 8 на в
     .replace(/[@а]/g, 'а') // Заменяем @ на а
     .replace(/[еe]/g, 'е') // Заменяем e на е
     .replace(/[уy]/g, 'у') // Заменяем y на у
     .replace(/[рp]/g, 'р') // Заменяем p на р
     .replace(/[хx]/g, 'х') // Заменяем x на х
     .replace(/[сc]/g, 'с') // Заменяем c на с
     .replace(/[мm]/g, 'м') // Заменяем m на м
     .replace(/[кk]/g, 'к') // Заменяем k на к
     .replace(/[нh]/g, 'н') // Заменяем h на н
     .replace(/[аa]/g, 'а'); // Заменяем a на а
 }
 
 /**
  * Проверяет, содержит ли имя пользователя неподходящий контент
  */
 export function isUsernameInappropriate(username: string): boolean {
   if (!username || username.trim().length === 0) {
     return true; // Пустое имя недопустимо
   }
 
   const normalized = normalizeString(username);
 
   // Проверяем на подозрительные паттерны
   for (const pattern of suspiciousPatterns) {
     if (pattern.test(username)) {
       return true;
     }
   }
 
   // Проверяем на запрещенные слова
   for (const word of bannedWords) {
     const normalizedWord = normalizeString(word);
 
     // Точное совпадение
     if (normalized === normalizedWord) {
       return true;
     }
 
     // Содержит запрещенное слово
     if (normalized.includes(normalizedWord)) {
       return true;
     }
 
     // Проверяем с разделителями
     const withSeparators = new RegExp(`[^a-zа-я0-9]${normalizedWord}[^a-zа-я0-9]`, 'i');
     if (withSeparators.test(` ${normalized} `)) {
       return true;
     }
   }
 
   return false;
 }
 
 /**
  * Проверяет валидность имени пользователя
  */
 export function validateUsername(username: string): { isValid: boolean; error?: string } {
   // Проверка длины
   if (!username || username.trim().length === 0) {
     return { isValid: false, error: 'Имя пользователя не может быть пустым' };
   }
 
   if (username.length < 3) {
     return { isValid: false, error: 'Имя пользователя должно содержать минимум 3 символа' };
   }
 
   if (username.length > 20) {
     return { isValid: false, error: 'Имя пользователя не может быть длиннее 20 символов' };
   }
 
   // Проверка на допустимые символы
   const allowedCharsRegex = /^[a-zA-Zа-яёА-ЯЁ0-9_-]+$/;
   if (!allowedCharsRegex.test(username)) {
     return { isValid: false, error: 'Имя может содержать только буквы, цифры, дефис и подчеркивание' };
   }
 
   // Проверка на оскорбительный контент
   if (isUsernameInappropriate(username)) {
     return { isValid: false, error: 'Имя пользователя содержит недопустимые слова' };
   }
 
   return { isValid: true };
 }
 
 /**
  * Предлагает альтернативные варианты имени, если оригинальное недопустимо
  */
 export function suggestAlternativeUsername(username: string): string[] {
   const cleanBase = username.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '').substring(0, 15);
   const suggestions = [];
 
   if (cleanBase.length >= 3) {
     suggestions.push(
       `${cleanBase}_user`,
       `${cleanBase}_gamer`,
       `${cleanBase}_pro`,
       `${cleanBase}123`,
       `${cleanBase}_${Math.floor(Math.random() * 1000)}`,
       `user_${cleanBase}`,
       `gamer_${cleanBase}`
     );
   }
 
   // Фильтруем предложения, чтобы они тоже были допустимыми
   return suggestions.filter(suggestion => validateUsername(suggestion).isValid).slice(0, 3);
 }
 