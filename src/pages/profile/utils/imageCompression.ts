import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  fileType?: string;
}

/**
 * Сжимает изображение с оптимальными настройками для аватаров
 */
export const compressAvatar = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5,              // Максимум 500 KB
    maxWidthOrHeight: 800,        // 800x800 px для аватаров
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log('Avatar compression:', {
      original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
    });
    return compressedFile;
  } catch (error) {
    console.error('Avatar compression error:', error);
    throw error;
  }
};

/**
 * Сжимает изображение с кастомными настройками
 */
export const compressImage = async (
  file: File,
  customOptions?: CompressionOptions
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: file.type,
    initialQuality: 0.9,
    alwaysKeepResolution: false,
  };

  const options = { ...defaultOptions, ...customOptions };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression error:', error);
    throw error;
  }
};

/**
 * Валидация файла изображения
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
): { valid: boolean; error?: string } => {
  // Проверка типа
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Недопустимый формат. Разрешены: ${allowedTypes.join(', ')}`
    };
  }

  // Проверка размера
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > maxSizeMB) {
    return {
      valid: false,
      error: `Файл слишком большой (${sizeMB.toFixed(1)} MB). Максимум: ${maxSizeMB} MB`
    };
  }

  return { valid: true };
};

/**
 * Получить размеры изображения
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
