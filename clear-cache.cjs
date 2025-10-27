const fs = require('fs');
const path = require('path');

console.log('🧹 Очистка кэша и временных файлов...\n');

const dirsToRemove = [
  'node_modules/.vite',
  'dist',
  '.vite'
];

dirsToRemove.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✓ Удалена папка: ${dir}`);
  } else {
    console.log(`⚠ Папка не найдена: ${dir}`);
  }
});

console.log('\n✓ Кэш очищен! Теперь перезапустите dev сервер.\n');
