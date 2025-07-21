import { useEffect, useState } from 'react';
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

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // Инициализируем liveDrops данными из localStorage
  const [liveDrops, setLiveDrops] = useState<LiveDropData[]>(() => loadLiveDropsFromStorage());

  // Функция для обновления live drops с сохранением в localStorage
  const updateLiveDrops = (newDrops: LiveDropData[]) => {
    const limitedDrops = newDrops.slice(0, MAX_LIVE_DROPS);
    setLiveDrops(limitedDrops);
    saveLiveDropsToStorage(limitedDrops);
  };

  useEffect(() => {
    // Определяем URL сервера
    const serverUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-domain.com'
      : 'http://localhost:3000';

    // Создаем подключение к Socket.IO
    const socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> = io(serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    // Обработчик успешного подключения
    socketInstance.on('connect', () => {
      console.log('WebSocket: Подключено к серверу');
      setIsConnected(true);
    });

    // Обработчик отключения
    socketInstance.on('disconnect', (reason) => {
      console.log('WebSocket: Отключено от сервера', reason);
      setIsConnected(false);
    });

    // Обработчик приветственного сообщения
    socketInstance.on('hello', (data) => {
      console.log('WebSocket: Получено приветствие', data);
    });

    // Обработчик обновления количества пользователей онлайн
    socketInstance.on('onlineUsersUpdate', (data) => {
      console.log('WebSocket: Обновление онлайн пользователей', data.count);
      setOnlineUsers(data.count);
    });

    // Обработчик живых падений
    socketInstance.on('liveDrop', (data) => {
      console.log('WebSocket: Получено живое падение', data);
      setLiveDrops(prevDrops => {
        // Добавляем новое падение в начало массива и ограничиваем до 17 последних
        const newDrops = [data, ...prevDrops.slice(0, MAX_LIVE_DROPS - 1)];
        // Сохраняем в localStorage
        saveLiveDropsToStorage(newDrops);
        return newDrops;
      });
    });

    // Обработчик ошибок
    socketInstance.on('connect_error', (error) => {
      console.error('WebSocket: Ошибка подключения', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Очистка при размонтировании компонента
    return () => {
      console.log('WebSocket: Закрытие подключения');
      socketInstance.disconnect();
    };
  }, []);

  return {
    socket,
    onlineUsers,
    isConnected,
    liveDrops
  };
};
