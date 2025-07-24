import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, LiveDropData } from '../types/socket';

interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  onlineUsers: number;
  isConnected: boolean;
  liveDrops: LiveDropData[];
}

const LIVE_DROPS_STORAGE_KEY = 'chibox_live_drops';
const MAX_LIVE_DROPS = 17;

// Глобальное подключение к сокету (синглтон)
let globalSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let socketListeners = new Set<(data: any) => void>();
let onlineUsersListeners = new Set<(count: number) => void>();
let connectionListeners = new Set<(isConnected: boolean) => void>();
let liveDropListeners = new Set<(drop: LiveDropData) => void>();

// Функция для загрузки дропов из localStorage
const loadLiveDropsFromStorage = (): LiveDropData[] => {
  try {
    const stored = localStorage.getItem(LIVE_DROPS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Проверяем, что данные не старше 24 часов
      const now = new Date().getTime();
      const validDrops = parsed.filter((drop: LiveDropData) => {
        const dropTime = new Date(drop.dropTime).getTime();
        return now - dropTime < 24 * 60 * 60 * 1000; // 24 часа
      });
      return validDrops.slice(0, MAX_LIVE_DROPS);
    }
  } catch (error) {
    console.error('Ошибка загрузки live drops из localStorage:', error);
  }
  return [];
};

// Функция для сохранения дропов в localStorage
const saveLiveDropsToStorage = (drops: LiveDropData[]) => {
  try {
    localStorage.setItem(LIVE_DROPS_STORAGE_KEY, JSON.stringify(drops));
  } catch (error) {
    console.error('Ошибка сохранения live drops в localStorage:', error);
  }
};

// Функция для создания глобального подключения
const createGlobalSocket = () => {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }

  const serverUrl = process.env.NODE_ENV === 'production'
    ? 'https://your-domain.com'
    : 'http://localhost:3000';

  globalSocket = io(serverUrl, {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
  });

  // Обработчик успешного подключения
  globalSocket.on('connect', () => {
    console.log('WebSocket: Подключено к серверу');
    connectionListeners.forEach(listener => listener(true));
  });

  // Обработчик отключения
  globalSocket.on('disconnect', (reason) => {
    console.log('WebSocket: Отключено от сервера', reason);
    connectionListeners.forEach(listener => listener(false));
  });

  // Обработчик приветственного сообщения
  globalSocket.on('hello', (data) => {
    console.log('WebSocket: Получено приветствие', data);
  });

  // Обработчик обновления количества пользователей онлайн
  globalSocket.on('onlineUsersUpdate', (data) => {
    console.log('WebSocket: Обновление онлайн пользователей', data.count);
    onlineUsersListeners.forEach(listener => listener(data.count));
  });

  // Обработчик живых падений
  globalSocket.on('liveDrop', (data) => {
    console.log('WebSocket: Получено живое падение', data);
    liveDropListeners.forEach(listener => listener(data));
  });

  // Обработчик ошибок
  globalSocket.on('connect_error', (error) => {
    console.error('WebSocket: Ошибка подключения', error);
    connectionListeners.forEach(listener => listener(false));
  });

  return globalSocket;
};

export const useSocket = (): UseSocketReturn => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveDrops, setLiveDrops] = useState<LiveDropData[]>(() => loadLiveDropsFromStorage());
  const initialized = useRef(false);

  useEffect(() => {
    // Предотвращаем повторную инициализацию в React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    // Создаем или получаем глобальное подключение
    const socket = createGlobalSocket();

    // Функции-слушатели для этого компонента
    const onlineUsersListener = (count: number) => setOnlineUsers(count);
    const connectionListener = (connected: boolean) => setIsConnected(connected);
    const liveDropListener = (drop: LiveDropData) => {
      setLiveDrops(prevDrops => {
        const newDrops = [drop, ...prevDrops.slice(0, MAX_LIVE_DROPS - 1)];
        saveLiveDropsToStorage(newDrops);
        return newDrops;
      });
    };

    // Регистрируем слушатели
    onlineUsersListeners.add(onlineUsersListener);
    connectionListeners.add(connectionListener);
    liveDropListeners.add(liveDropListener);

    // Устанавливаем начальное состояние
    setIsConnected(socket.connected);

    // Очистка при размонтировании
    return () => {
      onlineUsersListeners.delete(onlineUsersListener);
      connectionListeners.delete(connectionListener);
      liveDropListeners.delete(liveDropListener);

      // Если это последний компонент, закрываем соединение
      if (onlineUsersListeners.size === 0 && connectionListeners.size === 0) {
        console.log('WebSocket: Закрытие глобального подключения');
        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
        }
      }
    };
  }, []);

  return {
    socket: globalSocket,
    onlineUsers,
    isConnected,
    liveDrops
  };
};
