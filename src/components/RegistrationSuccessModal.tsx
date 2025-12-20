import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, X } from 'lucide-react';

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
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-[#0f1419] rounded-2xl max-w-md w-full border border-gray-800 shadow-2xl transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-white mb-3">
            {t('registration_success_modal.title')}
          </h2>

          {/* Description */}
          <p className="text-gray-400 mb-6">
            {t('auth.email_verification')}: <span className="text-white font-medium">{email}</span>
          </p>

          {/* Preview Link */}
          {previewUrl && (
            <div className="mb-6">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
              >
                {t('auth.email_verification')}
              </a>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleClose}
            className="w-full py-3 px-6 bg-white text-black font-medium rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            {t('modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;
