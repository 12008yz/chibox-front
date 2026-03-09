const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (/\.(tsx|ts|jsx|js)$/.test(file)) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

let changedCount = 0;
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Добавляем width и height к тегам img если у них их нет (кроме тех, где это ломает макет)
  // Для многих элементов лучше использовать аспект-радио (aspect-ratio), чтобы браузер резервировал место.
  // Это помогает избежать CLS.
  content = content.replace(/<img(.*?)className="(.*?)"(.*?)>/gi, (match, p1, p2, p3) => {
    // Если уже есть width/height в атрибутах, пропускаем
    if (match.includes('width=') || match.includes('height=')) {
      return match;
    }
    
    // Если это логотип в шапке (частый источник CLS)
    if (match.includes('logo.webp')) {
       return `<img${p1}className="${p2}" width="200" height="40"${p3}>`;
    }
    
    // Если это ChiCoin иконка
    if (match.includes('chiCoinFull.webp')) {
      if (p2.includes('w-4') || p2.includes('h-4')) return `<img${p1}className="${p2}" width="16" height="16"${p3}>`;
      if (p2.includes('w-5') || p2.includes('h-5')) return `<img${p1}className="${p2}" width="20" height="20"${p3}>`;
      if (p2.includes('w-6') || p2.includes('h-6')) return `<img${p1}className="${p2}" width="24" height="24"${p3}>`;
      if (p2.includes('w-8') || p2.includes('h-8')) return `<img${p1}className="${p2}" width="32" height="32"${p3}>`;
      if (p2.includes('w-10') || p2.includes('h-10')) return `<img${p1}className="${p2}" width="40" height="40"${p3}>`;
    }
    
    // Баннеры
    if (match.includes('banners/')) {
        return `<img${p1}className="${p2}" width="1920" height="500"${p3}>`;
    }
    
    return match;
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log(`Updated CLS on ${file}`);
  }
}
console.log(`Done! Changed ${changedCount} files.`);
