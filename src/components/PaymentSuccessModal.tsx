import React from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, Crown, CalendarClock, Hash, CheckCircle2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useGetPaymentHistoryQuery } from '../features/user/userApi';
import Monetary from './Monetary';

type HistoryItem = {
  id: string;
  purpose: 'deposit' | 'subscription';
  amount: number;
  description: string;
  completed_at: string | null;
};

const PaymentSuccessModal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentSuccess = searchParams.get('payment') === 'success';
  const paymentId = searchParams.get('paymentId');
  const account = searchParams.get('account');
  // Unitpay редиректит на сайт с ?paymentId=...&account=... (без payment=success), бэкенд иногда отдаёт ?payment=success&amount=...
  const isReturnFromPayment = paymentSuccess || (Boolean(paymentId) && Boolean(account));

  const amountFromUrl = searchParams.get('amount');
  const amountNum = amountFromUrl != null ? parseFloat(amountFromUrl) : NaN;
  const hasAmountFromUrl = !Number.isNaN(amountNum) && amountNum > 0;

  const { data: paymentHistoryData } = useGetPaymentHistoryQuery(
    { limit: 5 },
    { skip: !isReturnFromPayment }
  );

  const items: HistoryItem[] = paymentHistoryData?.success && paymentHistoryData?.data?.items
    ? paymentHistoryData.data.items
    : [];
  const latest = items[0];

  const clearUrlAndClose = () => {
    setSearchParams((prev) => {
      prev.delete('payment');
      prev.delete('amount');
      prev.delete('paymentId');
      prev.delete('account');
      const next = prev.toString();
      return next ? { search: `?${next}` } : { search: '' };
    }, { replace: true });
  };

  // Показываем модалку при возврате с оплаты (?payment=success или ?paymentId=...&account=...); закрывается только по кнопке или клику по фону
  if (!isReturnFromPayment) return null;

  const isSubscription = latest?.purpose === 'subscription';
  const amount = latest?.amount ?? (hasAmountFromUrl ? amountNum : 0);
  const dateStr = latest?.completed_at
    ? new Date(latest.completed_at).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';
  const timeStr = latest?.completed_at
    ? new Date(latest.completed_at).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  const modalContent = (
    <div data-no-click-sound className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={clearUrlAndClose}
        aria-hidden
      />
      <div
        data-no-click-sound
        className="relative w-full max-w-md rounded-2xl border border-gray-600/50 bg-gray-900/95 shadow-2xl overflow-hidden"
        role="dialog"
        aria-labelledby="payment-success-title"
        aria-modal="true"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                  isSubscription ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {isSubscription ? <Crown className="h-6 w-6" /> : <Wallet className="h-6 w-6" />}
              </div>
              <div>
                <h2 id="payment-success-title" className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  Поздравляем!
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isSubscription ? 'Подписка успешно оформлена' : 'Баланс успешно пополнен'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearUrlAndClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 rounded-xl bg-gray-800/50 border border-gray-700/50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-gray-400 text-sm">Сумма</span>
              <span className="text-lg font-semibold text-white">
                {amount > 0 ? <Monetary value={amount} /> : '—'}
              </span>
            </div>
            {latest && (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 text-sm">Операция</span>
                  <span className={`text-sm font-medium ${isSubscription ? 'text-amber-400/90' : 'text-emerald-400/90'}`}>
                    {latest.description}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-400 text-sm flex items-center gap-1.5">
                    <CalendarClock className="h-4 w-4" />
                    Дата и время
                  </span>
                  <span className="text-sm text-white">
                    {dateStr} {timeStr}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-700/50">
                  <span className="text-gray-500 text-xs flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5" />
                    ID операции
                  </span>
                  <span className="text-xs font-mono text-gray-500 truncate max-w-[180px]" title={latest.id}>
                    {latest.id}
                  </span>
                </div>
              </>
            )}
            {!latest && (
              <p className="text-sm text-gray-400">Данные о платеже подгружаются или уже отражены в истории операций.</p>
            )}
          </div>

          <button
            type="button"
            onClick={clearUrlAndClose}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-colors"
          >
            Отлично
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PaymentSuccessModal;
