import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useResendVerificationCodeMutation, useVerifyEmailMutation } from '../../../../features/user/userApi';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  skipToVerify?: boolean; // Сразу показать форму ввода кода (код уже отправлен)
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  user,
  skipToVerify = false
}) => {
  const { t } = useTranslation();
  const [resendVerificationCode, { isLoading: isResendingCode }] = useResendVerificationCodeMutation();
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();

  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerificationStep, setEmailVerificationStep] = useState<'send' | 'verify'>('send');

  // Если skipToVerify = true, сразу переходим к вводу кода
  useEffect(() => {
    if (isOpen && skipToVerify) {
      setEmailVerificationStep('verify');
    } else if (isOpen && !skipToVerify) {
      setEmailVerificationStep('send');
    }
  }, [isOpen, skipToVerify]);

  // Функция для отправки кода подтверждения email
  const handleSendVerificationCode = async () => {
    if (!user?.email) return;

    // Проверяем, не Steam ли это email
    if (user.email.endsWith('@steam.local')) {
      alert(t('profile.settings.steam_email_cannot_verify'));
      onClose();
      return;
    }

    try {
      await resendVerificationCode({ email: user.email }).unwrap();
      setEmailVerificationStep('verify');
      alert(t('profile.settings.verification_code_sent'));
    } catch (error: any) {
      console.error('Ошибка при отправке кода:', error);
      alert(`${t('common.error')}: ${error?.data?.message || t('profile.settings.verification_code_error')}`);
    }
  };

  // Функция для подтверждения email
  const handleVerifyEmail = async () => {
    if (!user?.email || !verificationCode.trim()) return;

    try {
      await verifyEmail({
        email: user.email,
        verificationCode: verificationCode.trim()
      }).unwrap();
      alert(t('profile.settings.email_verified_success'));
      onClose();
      setVerificationCode('');
      setEmailVerificationStep('send');
    } catch (error: any) {
      console.error('Ошибка при подтверждении email:', error);
      alert(`${t('common.error')}: ${error?.data?.message || t('profile.settings.email_verify_error')}`);
    }
  };

  const resetForm = () => {
    setEmailVerificationStep('send');
    setVerificationCode('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999999]" onClick={() => {
      onClose();
      resetForm();
    }}>
      <div className="bg-gradient-to-br from-[#1a1530] to-[#2a1f47] rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700/30" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{t('profile.settings.email_verification_modal.title')}</h3>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {emailVerificationStep === 'send' ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-300 mb-2">
                {t('profile.settings.email_verification_modal.send_code_to')}
              </p>
              <p className="text-white font-semibold mb-4">
                {user?.email}
              </p>
              <p className="text-sm text-gray-400">
                {t('profile.settings.email_verification_modal.code_valid_time')}
              </p>
            </div>

            <button
              onClick={handleSendVerificationCode}
              disabled={isResendingCode}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
            >
              {isResendingCode ? t('profile.settings.email_verification_modal.sending_code') : t('profile.settings.email_verification_modal.send_code')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white font-semibold mb-2">
                {t('profile.settings.email_verification_modal.code_sent')}
              </p>
              <p className="text-gray-300 mb-4">
                {t('profile.settings.email_verification_modal.enter_code')}
              </p>
            </div>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-4 py-3 bg-black/30 border border-gray-600/50 rounded-lg text-white text-center text-lg font-mono tracking-widest placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                maxLength={6}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyEmail}
                disabled={isVerifyingEmail || verificationCode.length !== 6}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                {isVerifyingEmail ? t('profile.settings.email_verification_modal.verifying') : t('profile.settings.email_verification_modal.verify')}
              </button>
              <button
                onClick={handleSendVerificationCode}
                disabled={isResendingCode}
                className="px-4 py-3 bg-gray-600/30 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg transition-colors text-sm"
              >
                {isResendingCode ? t('profile.settings.email_verification_modal.resending') : t('profile.settings.email_verification_modal.resend')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationModal;
