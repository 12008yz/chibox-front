import React from 'react';
import Modal from './Modal';
import MainButton from './MainButton';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  previewUrl?: string;
}

const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  email,
  previewUrl
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✅ Регистрация успешна!" showCloseButton={false}>
      <div className="text-center space-y-4">
        <div className="text-green-600 text-6xl mb-4">
          📧
        </div>

        <p className="text-gray-700">
          Регистрация успешно завершена! На ваш email <span className="font-semibold text-blue-600">{email}</span> отправлено письмо с кодом подтверждения.
        </p>

        <p className="text-sm text-gray-500">
          Вы уже можете пользоваться сайтом. Проверьте почту и подтвердите email для полного доступа ко всем функциям.
        </p>

        {previewUrl && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              🔧 Режим разработки
            </p>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Просмотреть письмо в браузере
            </a>
          </div>
        )}

        <div className="mt-6">
          <MainButton
            text="Понятно"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default RegistrationSuccessModal;
