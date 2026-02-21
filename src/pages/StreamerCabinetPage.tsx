import { useState } from 'react';
import {
  useGetStreamerMeQuery,
  useGetStreamerLinksQuery,
  useCreateStreamerLinkMutation,
  useGetStreamerStatsQuery,
  useGetStreamerEarningsQuery,
  useGetStreamerPayoutsQuery,
  useCreateStreamerPayoutMutation,
  useGetStreamerMaterialsQuery,
} from '../features/streamer/streamerApi';
import { Copy, Plus, Link2, BarChart3, Wallet } from 'lucide-react';
import { toast } from 'react-hot-toast';

const StreamerCabinetPage: React.FC = () => {
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'balance' | 'card' | 'steam' | 'other'>('balance');

  const { data: meData, error: meError, isLoading: meLoading } = useGetStreamerMeQuery();
  const { data: linksData, refetch: refetchLinks } = useGetStreamerLinksQuery();
  const { data: statsData } = useGetStreamerStatsQuery();
  const { data: earningsData } = useGetStreamerEarningsQuery(undefined);
  const { data: payoutsData } = useGetStreamerPayoutsQuery();
  const { data: materialsData } = useGetStreamerMaterialsQuery();

  const [createLink, { isLoading: creatingLink }] = useCreateStreamerLinkMutation();
  const [createPayout, { isLoading: creatingPayout }] = useCreateStreamerPayoutMutation();

  const streamer = meData?.data;
  const links = linksData?.data ?? [];
  const stats = statsData?.data;
  const earnings = earningsData?.data ?? [];
  const payouts = payoutsData?.data ?? [];
  const materials = materialsData?.data ?? [];

  const handleCreateLink = async () => {
    try {
      await createLink({ label: newLinkLabel || undefined }).unwrap();
      setNewLinkLabel('');
      refetchLinks();
      toast.success('Ссылка создана');
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error(msg || 'Ошибка создания ссылки');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Ссылка скопирована');
  };

  const handleCreatePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Укажите корректную сумму');
      return;
    }
    try {
      await createPayout({ method: payoutMethod, amount }).unwrap();
      setPayoutAmount('');
      toast.success('Заявка на вывод создана');
    } catch (e: unknown) {
      const msg = e && typeof e === 'object' && 'data' in e && (e as { data?: { message?: string } }).data?.message;
      toast.error(msg || 'Ошибка создания заявки');
    }
  };

  if (meLoading || (!streamer && !meError)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151225]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }

  if (meError || !streamer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#151225] p-4">
        <div className="text-center text-white max-w-md">
          <h1 className="text-2xl font-bold mb-2">Доступ ограничен</h1>
          <p className="text-gray-400">
            Кабинет стримера доступен только участникам партнёрской программы.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151225] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Кабинет стримера</h1>
        <p className="text-gray-400 mb-8">Баланс: {streamer.balance.toFixed(2)} ChiCoins</p>

        {stats && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 size={22} /> Статистика
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">{stats.clicks_count}</div>
                <div className="text-gray-400 text-sm">Переходы</div>
              </div>
              <div className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">{stats.registrations_count}</div>
                <div className="text-gray-400 text-sm">Регистрации</div>
              </div>
              <div className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">{stats.first_deposits_count}</div>
                <div className="text-gray-400 text-sm">Первые депозиты</div>
              </div>
              <div className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">{stats.total_earned.toFixed(0)}</div>
                <div className="text-gray-400 text-sm">Всего начислено</div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Link2 size={22} /> Реферальные ссылки
          </h2>
          <div className="space-y-3 mb-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex flex-wrap items-center gap-2 bg-white/5 border border-cyan-400/20 rounded-lg p-3"
              >
                <span className="text-cyan-300 font-mono text-sm">{link.url}</span>
                {link.label && <span className="text-gray-400 text-sm">({link.label})</span>}
                <span className="text-gray-500 text-sm">
                  клики: {link.clicks_count}, рег: {link.registrations_count}, деп: {link.first_deposits_count}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(link.url)}
                  className="ml-auto p-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30"
                >
                  <Copy size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Название (Twitch, YouTube...)"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-400/20 text-white placeholder-gray-500 w-48"
            />
            <button
              type="button"
              onClick={handleCreateLink}
              disabled={creatingLink}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium disabled:opacity-50"
            >
              <Plus size={18} /> Создать ссылку
            </button>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Wallet size={22} /> Вывод средств
          </h2>
          <div className="flex flex-wrap gap-2 items-end mb-4">
            <input
              type="number"
              placeholder="Сумма"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              min="1"
              step="0.01"
              className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-400/20 text-white w-32"
            />
            <select
              value={payoutMethod}
              onChange={(e) => setPayoutMethod(e.target.value as typeof payoutMethod)}
              className="px-3 py-2 rounded-lg bg-white/5 border border-cyan-400/20 text-white"
            >
              <option value="balance">На баланс сайта</option>
              <option value="card">На карту</option>
              <option value="steam">В Steam</option>
              <option value="other">Другое</option>
            </select>
            <button
              type="button"
              onClick={handleCreatePayout}
              disabled={creatingPayout || !payoutAmount}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-medium disabled:opacity-50"
            >
              Вывести
            </button>
          </div>
          <div className="space-y-2">
            {payouts.slice(0, 10).map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center py-2 border-b border-white/10 text-sm"
              >
                <span>{p.amount} ChiCoins — {p.method}</span>
                <span className={p.status === 'completed' ? 'text-green-400' : p.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {materials.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Баннеры и тексты</h2>
            <div className="space-y-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-white/5 border border-cyan-400/20 rounded-lg p-4">
                  {m.type === 'banner' && m.url && (
                    <div>
                      {m.title && <p className="text-gray-400 text-sm mb-2">{m.title}</p>}
                      <img src={m.url} alt={m.title || 'Banner'} className="max-h-24 rounded" />
                      <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-sm mt-2 inline-block">
                        Ссылка
                      </a>
                    </div>
                  )}
                  {m.type === 'text' && m.content && (
                    <div>
                      {m.title && <p className="text-gray-400 text-sm mb-2">{m.title}</p>}
                      <pre className="text-sm text-gray-300 whitespace-pre-wrap bg-black/20 p-2 rounded">{m.content}</pre>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(m.content || ''); toast.success('Скопировано'); }}
                        className="text-cyan-400 text-sm mt-2"
                      >
                        Копировать
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {earnings.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Последние начисления</h2>
            <div className="space-y-2">
              {earnings.slice(0, 15).map((e) => (
                <div key={e.id} className="flex justify-between py-2 border-b border-white/10 text-sm">
                  <span className="text-gray-400">{e.type}</span>
                  <span className="text-cyan-400">+{e.amount} ChiCoins</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default StreamerCabinetPage;
