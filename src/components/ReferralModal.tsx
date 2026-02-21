import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGetReferralInfoQuery } from '../features/referral/referralApi';
import { getPreferredAvatar } from '../utils/avatarUtils';
import SteamLoginButton from './SteamLoginButton';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  referralCode: string;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, referralCode }) => {
  const { data, isLoading } = useGetReferralInfoQuery(referralCode, { skip: !isOpen || !referralCode });

  if (!isOpen) return null;

  const info = data?.data;
  const streamer = info?.streamer;
  const bonuses = info?.bonuses;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/80 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-gradient-to-br from-[#1a1829] to-[#151225] border border-cyan-400/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>

          <div className="p-8">
            {isLoading && !info ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-cyan-400 border-t-transparent" />
              </div>
            ) : streamer ? (
              <>
                <h2 className="text-xl font-bold text-white mb-2 text-center">
                  Вас пригласил
                </h2>
                <div className="flex flex-col items-center mb-6">
                  <img
                    src={getPreferredAvatar(streamer.avatar_url, streamer.avatar_url, streamer.id)}
                    alt={streamer.username}
                    className="w-16 h-16 rounded-full border-2 border-cyan-400/50 object-cover"
                  />
                  <span className="mt-2 text-white font-medium">{streamer.username}</span>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-400/20 rounded-lg p-4">
                  <p className="text-cyan-200 text-sm font-medium mb-2">Бонусы по реферальной ссылке:</p>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    {(bonuses?.fixed_registration ?? 0) > 0 && (
                      <li>• При регистрации: +{bonuses?.fixed_registration} ChiCoins</li>
                    )}
                    {(bonuses?.fixed_first_deposit ?? 0) > 0 && (
                      <li>• За первый депозит: +{bonuses?.fixed_first_deposit} ChiCoins</li>
                    )}
                    <li>• Промокод DEPOSIT15 — бонус к депозиту</li>
                    {(bonuses?.promo_codes?.length ?? 0) > 0 &&
                      bonuses!.promo_codes!.map((p) => (
                        <li key={p.code}>• Промокод {p.code} — {p.value} ChiCoins</li>
                      ))}
                    {(!bonuses || ((bonuses.fixed_registration ?? 0) === 0 && (bonuses.fixed_first_deposit ?? 0) === 0 && (bonuses.promo_codes?.length ?? 0) === 0)) && (
                      <li>• Специальные условия для приглашённых</li>
                    )}
                  </ul>
                </div>
                <p className="text-gray-400 text-xs text-center mt-4 mb-4">
                  Войдите через Steam, чтобы закрепить приглашение и получить бонусы.
                </p>
                <SteamLoginButton />
              </>
            ) : (
              <p className="text-gray-400 text-center py-4">Данные по ссылке недоступны.</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default ReferralModal;
