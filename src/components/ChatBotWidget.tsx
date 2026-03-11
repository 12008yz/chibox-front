import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';
import { useSendBotMessageMutation } from '../features/bot/botApi';

type ChatMessage = { role: 'user' | 'bot'; text: string };

const WELCOME = 'Привет! Я бот поддержки Chibox. Спросите про пополнение, вывод, реферальную программу или проблемы со скинами.';

export default function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendMessage, { isLoading }] = useSendBotMessageMutation();

  useEffect(() => {
    if (messages.length === 0 && open) {
      setMessages([{ role: 'bot', text: WELCOME }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);

    try {
      const result = await sendMessage({ message: text }).unwrap();
      const reply = result.success && result.reply
        ? result.reply
        : result.message || 'Не удалось получить ответ. Попробуйте позже.';
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'Сервис временно недоступен. Попробуйте позже.' },
      ]);
    }
  }

  return (
    <>
      {/* Кнопка открытия чата — слева внизу */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-[9990] flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={open ? 'Закрыть чат' : 'Открыть чат с ботом'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-5 z-[9989] flex h-[380px] w-[340px] flex-col overflow-hidden rounded-xl border border-gray-700/50 bg-gray-900/98 shadow-xl backdrop-blur"
          >
            <div className="border-b border-gray-700/50 bg-gray-800/80 px-3 py-2">
              <span className="font-semibold text-white">Чат с поддержкой</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      m.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700/80 text-gray-100'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-gray-700/80 px-3 py-2 text-sm text-gray-400">
                    Печатает...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 border-t border-gray-700/50 p-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none"
                maxLength={2000}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="rounded-lg bg-indigo-600 p-2 text-white transition hover:bg-indigo-500 disabled:opacity-50"
                aria-label="Отправить"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
