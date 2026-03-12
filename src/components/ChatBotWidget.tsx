import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, X, Send, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { useSendBotMessageMutation } from '../features/bot/botApi';

// Иконки соцсетей (как в Footer)
const IconTelegram = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" className="shrink-0" aria-hidden>
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z" />
  </svg>
);
const IconVK = () => (
  <svg width="18" height="18" viewBox="-2.5 0 32 32" fill="currentColor" className="shrink-0" aria-hidden>
    <path d="M16.563 15.75c-0.5-0.188-0.5-0.906-0.531-1.406-0.125-1.781 0.5-4.5-0.25-5.656-0.531-0.688-3.094-0.625-4.656-0.531-0.438 0.063-0.969 0.156-1.344 0.344s-0.75 0.5-0.75 0.781c0 0.406 0.938 0.344 1.281 0.875 0.375 0.563 0.375 1.781 0.375 2.781 0 1.156-0.188 2.688-0.656 2.75-0.719 0.031-1.125-0.688-1.5-1.219-0.75-1.031-1.5-2.313-2.063-3.563-0.281-0.656-0.438-1.375-0.844-1.656-0.625-0.438-1.75-0.469-2.844-0.438-1 0.031-2.438-0.094-2.719 0.5-0.219 0.656 0.25 1.281 0.5 1.813 1.281 2.781 2.656 5.219 4.344 7.531 1.563 2.156 3.031 3.875 5.906 4.781 0.813 0.25 4.375 0.969 5.094 0 0.25-0.375 0.188-1.219 0.313-1.844s0.281-1.25 0.875-1.281c0.5-0.031 0.781 0.406 1.094 0.719 0.344 0.344 0.625 0.625 0.875 0.938 0.594 0.594 1.219 1.406 1.969 1.719 1.031 0.438 2.625 0.313 4.125 0.25 1.219-0.031 2.094-0.281 2.188-1 0.063-0.563-0.563-1.375-0.938-1.844-0.938-1.156-1.375-1.5-2.438-2.563-0.469-0.469-1.063-0.969-1.063-1.531-0.031-0.344 0.25-0.656 0.5-1 1.094-1.625 2.188-2.781 3.188-4.469 0.281-0.5 0.938-1.656 0.688-2.219-0.281-0.625-1.844-0.438-2.813-0.438-1.25 0-2.875-0.094-3.188 0.156-0.594 0.406-0.844 1.063-1.125 1.688-0.625 1.438-1.469 2.906-2.344 4-0.313 0.375-0.906 1.156-1.25 1.031z" />
  </svg>
);

type ChatMessage = { role: 'user' | 'bot'; text: string };

const WELCOME =
  'Привет! Я бот поддержки Chibox. Спросите про пополнение, вывод, подписку, промокоды — или нажмите одну из кнопок ниже. Нужен живой оператор? Кнопка «Связаться с нами» или ссылки внизу чата (Telegram, Email, VK).';

// Кнопки быстрых вопросов (отправляют этот текст боту)
const QUICK_BUTTONS: { label: string; message: string }[] = [
  { label: 'Пополнение баланса', message: 'Как пополнить баланс?' },
  { label: 'Вывод скина', message: 'Как вывести скин в Steam?' },
  { label: 'Подписка и кейсы', message: 'Что даёт подписка и как открывать кейсы?' },
  { label: 'Торговая ссылка', message: 'Где взять торговую ссылку Steam?' },
  { label: 'Промокод', message: 'Где ввести промокод?' },
  { label: 'Связаться с нами', message: 'Связаться с поддержкой' },
];

// Контакты из подвала сайта (Footer)
const SUPPORT_EMAIL = 'support@chibox-game.ru';
const SUPPORT_TELEGRAM = 'https://t.me/chibox_official';
const SUPPORT_VK = 'https://vk.com/chibox_game';

export default function ChatBotWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendMessage, { isLoading }] = useSendBotMessageMutation();

  const isHomePage = pathname === '/';

  // Отключаем скролл главной страницы, когда открыта модалка поддержки
  useEffect(() => {
    if (isHomePage && open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  }, [isHomePage, open]);

  useEffect(() => {
    if (messages.length === 0 && open) {
      setMessages([{ role: 'bot', text: WELCOME }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildHistory = (): Array<{ role: 'user' | 'assistant'; content: string }> => {
    return messages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-20)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));
  };

  const sendToBot = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const history = buildHistory();
    setMessages((prev) => [...prev, { role: 'user', text: text.trim() }]);

    try {
      const result = await sendMessage({
        message: text.trim(),
        history: history.length > 0 ? history : undefined,
      }).unwrap();
      const reply =
        result.success && result.reply
          ? result.reply
          : result.message || 'Не удалось получить ответ. Попробуйте позже.';
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Сервис временно недоступен. Попробуйте позже.' },
      ]);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    sendToBot(text);
  };

  const handleQuickButton = (message: string) => {
    sendToBot(message);
  };

  return (
    <>
      <div className="fixed bottom-5 left-5 z-[9990] flex items-center justify-center">
        {/* Две волны, расходящиеся от иконки кругами — только когда чат закрыт */}
        {!open && (
          <>
            <span
              className="absolute inset-0 m-auto h-14 w-14 rounded-full border-[3px] border-orange-400 animate-support-wave"
              aria-hidden
            />
            <span
              className="absolute inset-0 m-auto h-14 w-14 rounded-full border-[3px] border-orange-400 animate-support-wave animate-support-wave-delay"
              aria-hidden
            />
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={open ? 'Закрыть чат' : 'Открыть чат с ботом'}
        >
          {open ? <X className="h-6 w-6" /> : <Headphones className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-5 z-[9989] flex h-[540px] max-h-[calc(100vh-7rem)] w-[360px] flex-col overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-900/98 shadow-2xl shadow-black/40 backdrop-blur"
          >
            {/* Сообщения — основная высота под ленту, скролл при нехватке места */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                      m.role === 'user'
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                        : 'bg-gray-700/80 text-gray-100 border border-gray-600/50'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-gray-700/80 px-3 py-2 text-sm text-gray-400 border border-gray-600/50">
                    Печатает...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Быстрые вопросы — раскрывающееся окно */}
            <div className="shrink-0 border-t border-gray-700/50 bg-gray-800/50">
              <button
                type="button"
                onClick={() => setQuickOpen((o) => !o)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-xs text-gray-400 hover:text-orange-400 hover:bg-gray-700/30 transition rounded-b-none"
                aria-expanded={quickOpen}
              >
                <span>Быстрые вопросы</span>
                {quickOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {quickOpen && (
                <div className="px-3 pb-2 pt-0 flex flex-wrap gap-1.5">
                  {QUICK_BUTTONS.map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickButton(btn.message)}
                      disabled={isLoading}
                      className="rounded-lg border border-orange-500/50 bg-orange-500/10 px-2.5 py-1.5 text-xs font-medium text-orange-300 hover:bg-orange-500/25 hover:border-orange-500/70 transition disabled:opacity-50"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Поле ввода */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 border-t border-gray-700/50 p-2 bg-gray-800/30"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-xl border border-gray-600 bg-gray-800 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                maxLength={2000}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-2.5 text-white transition hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 disabled:hover:from-orange-500 disabled:hover:to-amber-600"
                aria-label="Отправить"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Контакты: иконки Telegram, Email, VK как в подвале */}
            <div className="shrink-0 border-t border-gray-700/50 px-3 py-2 flex items-center justify-center gap-5 bg-gray-900/80">
              <a
                href={SUPPORT_TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition [&>svg]:hover:text-orange-400"
                aria-label="Написать в Telegram @chibox_official"
              >
                <IconTelegram />
                Telegram
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition"
                aria-label="Написать на support@chibox-game.ru"
              >
                <Mail className="h-4 w-4 shrink-0" />
                Email
              </a>
              <a
                href={SUPPORT_VK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-400 transition [&>svg]:hover:text-orange-400"
                aria-label="Группа VK chibox_game"
              >
                <IconVK />
                VK
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
