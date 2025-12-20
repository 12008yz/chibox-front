import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, LiveDropData, NotificationData } from '../types/socket';
import { useAppDispatch } from '../store/hooks';
import { userApi } from '../features/user/userApi';
import { toastWithSound } from '../utils/toastWithSound';

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
let onlineUsersListeners = new Set<(count: number) => void>();
let connectionListeners = new Set<(isConnected: boolean) => void>();
let liveDropListeners = new Set<(drop: LiveDropData) => void>();
let notificationListeners = new Set<(notification: NotificationData) => void>();

// Глобальный кеш для предотвращения дублирования дропов
let receivedDrops = new Map<string, number>();

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

  }
  return [];
};

// Функция для сохранения дропов в localStorage
const saveLiveDropsToStorage = (drops: LiveDropData[]) => {
  try {
    localStorage.setItem(LIVE_DROPS_STORAGE_KEY, JSON.stringify(drops));
  } catch (error) {

  }
};

// Функция для создания глобального подключения
const createGlobalSocket = () => {
  if (globalSocket && globalSocket.connected) {
    return globalSocket;
  }

  const serverUrl = process.env.NODE_ENV === 'production'
    ? 'https://chibox-game.ru'
    : 'http://localhost:3000';

  globalSocket = io(serverUrl, {
    transports: ['polling', 'websocket'],
    timeout: 20000,
    forceNew: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  // Обработчик успешного подключения
  globalSocket.on('connect', () => {

    connectionListeners.forEach(listener => listener(true));
  });

  // Обработчик отключения
  globalSocket.on('disconnect', (reason) => {

    connectionListeners.forEach(listener => listener(false));
  });

  // Обработчик приветственного сообщения
  globalSocket.on('hello', (data) => {

  });

  // Обработчик обновления количества пользователей онлайн
  globalSocket.on('onlineUsersUpdate', (data) => {

    onlineUsersListeners.forEach(listener => listener(data.count));
  });

  // Обработчик живых падений
  globalSocket.on('liveDrop', (data) => {

    // Проверяем, что у нас есть уникальный ID
    if (data && data.id) {
      // Дополнительная проверка на дублирование на уровне сокета
      const currentTime = Date.now();
      const dropKey = `${data.id}_${data.user.id}_${data.item.id}`;

      // Если это не первое получение этого дропа в течение 10 секунд, игнорируем
      if (receivedDrops.has(dropKey) && (currentTime - receivedDrops.get(dropKey)!) < 10000) {

        return;
      }

      // Сохраняем время получения дропа
      receivedDrops.set(dropKey, currentTime);

      // Очищаем старые записи (старше 5 минут)
      for (const [key, timestamp] of receivedDrops.entries()) {
        if (currentTime - timestamp > 300000) {
          receivedDrops.delete(key);
        }
      }

      liveDropListeners.forEach(listener => listener(data));
    } else {

    }
  });

  // Обработчик уведомлений
  globalSocket.on('notification', (data) => {

    notificationListeners.forEach(listener => listener(data));
  });

  // Обработчик ошибок
  globalSocket.on('connect_error', (error) => {

    connectionListeners.forEach(listener => listener(false));
  });

  return globalSocket;
};

export const useSocket = (): UseSocketReturn => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveDrops, setLiveDrops] = useState<LiveDropData[]>(() => loadLiveDropsFromStorage());
  const initialized = useRef(false);
  const dispatch = useAppDispatch();

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
        // Проверяем, нет ли уже такого дропа
        const existingDrop = prevDrops.find(existingDrop => existingDrop.id === drop.id);
        if (existingDrop) {

          return prevDrops;
        }

        // Дополнительная проверка - если дроп очень старый, не добавляем
        const dropTime = new Date(drop.dropTime).getTime();
        const now = Date.now();
        if (now - dropTime > 5 * 60 * 1000) {

          return prevDrops;
        }

        const newDrops = [drop, ...prevDrops.slice(0, MAX_LIVE_DROPS - 1)];
        saveLiveDropsToStorage(newDrops);
        return newDrops;
      });
    };

    // Обработчик уведомлений
    const notificationListener = (notification: NotificationData) => {


      // Немедленно инвалидируем кеш уведомлений и счетчика
      dispatch(userApi.util.invalidateTags(['Notifications']));

      // Принудительно обновляем данные уведомлений
      setTimeout(() => {
        dispatch(userApi.endpoints.getUserNotifications.initiate({ limit: 20 }));
        dispatch(userApi.endpoints.getUnreadNotificationsCount.initiate());
      }, 100);

      // Показываем toast уведомление в зависимости от типа
      const message = notification.title;
      const toastOptions = notification.link ? {
        duration: 6000,
        position: 'top-right' as const,
      } : undefined;

      switch (notification.type) {
        case 'success':
          toastWithSound.success(message, toastOptions);
          break;
        case 'error':
          toastWithSound.error(message, toastOptions);
          break;
        case 'warning':
          toastWithSound.warning(message, toastOptions);
          break;
        case 'info':
          toastWithSound.info(message, toastOptions);
          break;
        case 'system':
        default:
          toastWithSound.default(message, toastOptions);
          break;
      }
    };

    // Регистрируем слушатели
    onlineUsersListeners.add(onlineUsersListener);
    connectionListeners.add(connectionListener);
    liveDropListeners.add(liveDropListener);
    notificationListeners.add(notificationListener);

    // Устанавливаем начальное состояние
    setIsConnected(socket.connected);

    // Очистка при размонтировании
    return () => {
      onlineUsersListeners.delete(onlineUsersListener);
      connectionListeners.delete(connectionListener);
      liveDropListeners.delete(liveDropListener);
      notificationListeners.delete(notificationListener);

      // Если это последний компонент, закрываем соединение
      if (onlineUsersListeners.size === 0 && connectionListeners.size === 0 && notificationListeners.size === 0) {

        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
        }
      }
    };
  }, [dispatch]);

  return {
    socket: globalSocket,
    onlineUsers,
    isConnected,
    liveDrops
  };
};
