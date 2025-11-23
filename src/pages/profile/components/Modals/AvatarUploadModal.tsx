import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useUploadAvatarMutation, useDeleteAvatarMutation } from '../../../../features/user/userApi';
import { toast } from 'react-hot-toast';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  steamAvatar?: string;
  userId: string;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  currentAvatar,
  steamAvatar,
  userId
}) => {
  const { t } = useTranslation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [deleteAvatar, { isLoading: isDeleting }] = useDeleteAvatarMutation();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Сброс состояния при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      console.log('Avatar Modal Debug:', {
        currentAvatar,
        steamAvatar,
        userId
      });
      setImageError(false);
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [isOpen, currentAvatar, steamAvatar, userId]);

  if (!isOpen) return null;

  // Функция для сжатия изображения
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Максимальные размеры
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('profile.avatar_invalid_format') || 'Недопустимый формат файла');
      return;
    }

    try {
      // Сжимаем изображение если оно больше 1MB
      let processedFile = file;
      if (file.size > 1 * 1024 * 1024) {
        processedFile = await compressImage(file);
      }

      // Проверка размера после сжатия (5MB)
      if (processedFile.size > 5 * 1024 * 1024) {
        toast.error(t('profile.avatar_too_large') || 'Файл слишком большой (максимум 5MB)');
        return;
      }

      setSelectedFile(processedFile);

      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      toast.error('Ошибка при обработке изображения');
      console.error('Image processing error:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    console.log('Uploading file:', {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type
    });

    try {
      const result = await uploadAvatar(formData).unwrap();
      if (result.success) {
        toast.success(t('profile.avatar_uploaded') || 'Аватар успешно загружен');
        setPreviewUrl(null);
        setSelectedFile(null);
        onClose();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.data?.message || t('profile.avatar_upload_error') || 'Ошибка при загрузке аватара');
    }
  };

  const handleDelete = async () => {
    if (!currentAvatar) return;

    try {
      const result = await deleteAvatar().unwrap();
      if (result.success) {
        toast.success(t('profile.avatar_deleted') || 'Аватар успешно удален');
        onClose();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || t('profile.avatar_delete_error') || 'Ошибка при удалении аватара');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {t('profile.change_avatar') || 'Изменить аватар'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-gray-800">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (currentAvatar && !imageError) ? (
                <img
                  src={currentAvatar}
                  alt={t('profile.current_avatar') || 'Текущий аватар'}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error('Failed to load current avatar:', currentAvatar);
                    setImageError(true);
                  }}
                  onLoad={() => console.log('Current avatar loaded successfully:', currentAvatar)}
                />
              ) : (steamAvatar && !imageError) ? (
                <img
                  src={steamAvatar}
                  alt={t('profile.steam_avatar') || 'Steam аватар'}
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error('Failed to load steam avatar:', steamAvatar);
                    setImageError(true);
                  }}
                  onLoad={() => console.log('Steam avatar loaded successfully:', steamAvatar)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-500">
                  {userId.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mb-3"
          >
            {t('profile.select_file') || 'Выбрать файл'}
          </button>

          {selectedFile && (
            <div className="text-sm text-gray-400 text-center mb-3">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors mb-3"
            >
              {isUploading ? t('common.uploading') || 'Загрузка...' : t('profile.upload') || 'Загрузить'}
            </button>
          )}

          {/* Delete Button */}
          {currentAvatar && !selectedFile && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isDeleting ? t('common.deleting') || 'Удаление...' : t('profile.delete_avatar') || 'Удалить аватар'}
            </button>
          )}

          {/* Info */}
          <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
            <p>{t('profile.avatar_format_info') || 'Поддерживаемые форматы: JPEG, PNG, GIF, WEBP'}</p>
            <p>{t('profile.avatar_size_info') || 'Максимальный размер: 5 MB'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default AvatarUploadModal;
