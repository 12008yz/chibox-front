import React, { useState, useEffect } from 'react';
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
    <>
      <style>{`
        .modal-overlay-enter {
          animation: fadeIn 0.3s ease-out;
        }

        .modal-overlay-exit {
          animation: fadeOut 0.3s ease-out;
        }

        .modal-content-enter {
          animation: slideInScale 0.4s ease-out 0.1s both;
        }

        .modal-content-exit {
          animation: slideOutScale 0.3s ease-out both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes slideOutScale {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
        }
      `}</style>

      <div className={`${isClosing ? 'modal-overlay-exit' : 'modal-overlay-enter'} fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80`}>
        <div className={`${isClosing ? 'modal-content-exit' : 'modal-content-enter'} bg-black rounded-lg p-8 max-w-md w-full mx-4 border border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)]`}>
          <div className="text-center">
            <h2 className="text-white text-2xl font-semibold mb-4">
              Регистрация завершена
            </h2>

            <p className="text-gray-300 mb-6">
              Проверьте почту {email}
            </p>

            {previewUrl && (
              <div className="mb-6">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white underline text-sm"
                >
                  Просмотреть письмо
                </a>
              </div>
            )}

            <button
              onClick={handleClose}
              className="bg-black text-white px-6 py-2 rounded border border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-200"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationSuccessModal;
