import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, LiveDropData, NotificationData } from '../types/socket';
import { BACKEND_URL } from '../utils/config';
import { useAppDispatch } from '../store/hooks';
import { userApi } from '../features/user/userApi';
import { toastWithSound } from '../utils/toastWithSound';

export interface UseSocketOptions {
  /** Подписываться на liveDrop (иначе при каждом дропе не будет лишних ре-рендеров App/Header) */
  subscribeToLiveDrops?: boolean;
}

interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  onlineUsers: number;
  isConnected: boolean;
  /** Сообщение об ошибке подключения (CORS, cookie и т.д.) */
  connectionError: string | null;
  liveDrops: LiveDropData[];
}

const LIVE_DROPS_STORAGE_KEY = 'chibox_live_drops';
const MAX_LIVE_DROPS = 17;

// Глобальное подключение к сокету (синглтон)
let globalSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
/** Повтор без cookie (для Opera и браузеров с блокировкой) */
let tryWithoutCredentials = false;
let onlineUsersListeners = new Set<(count: number) => void>();
let connectionListeners = new Set<(isConnected: boolean) => void>();
let connectionErrorListeners = new Set<(err: string | null) => void>();
let lastConnectionError: string | null = null;
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

  const serverUrl = BACKEND_URL.replace(/\/$/, '');

  globalSocket = io(serverUrl, {
    transports: ['polling', 'websocket'],
    timeout: 20000,
    forceNew: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    withCredentials: !tryWithoutCredentials,
  });

  // Обработчик успешного подключения
  globalSocket.on('connect', () => {
    lastConnectionError = null;
    connectionErrorListeners.forEach(listener => listener(null));
    connectionListeners.forEach(listener => listener(true));
  });

  // Обработчик отключения
  globalSocket.on('disconnect', () => {
    connectionListeners.forEach(listener => listener(false));
  });

  // Ошибка подключения (CORS, блокировка cookie/рекламы в Opera и т.д.)
  globalSocket.on('connect_error', (err) => {
    lastConnectionError = err?.message || 'Ошибка подключения';
    connectionErrorListeners.forEach(listener => listener(lastConnectionError));
    connectionListeners.forEach(listener => listener(false));
    // Один раз повторяем без cookie — часто помогает в Opera
    if (!tryWithoutCredentials && globalSocket) {
      tryWithoutCredentials = true;
      const failed = globalSocket;
      setTimeout(() => {
        if (globalSocket === failed && !failed.connected) {
          failed.removeAllListeners();
          failed.disconnect();
          globalSocket = null;
          lastConnectionError = null;
          connectionErrorListeners.forEach(listener => listener(null));
          createGlobalSocket();
        }
      }, 2500);
    }
  });

  // Обработчик приветственного сообщения
  globalSocket.on('hello', () => {

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

  return globalSocket;
};

const SMOOTH_ONLINE_INTERVAL_MS = 350; // плавное приближение счётчика онлайна к значению с сервера

export const useSocket = (options?: UseSocketOptions): UseSocketReturn => {
  const subscribeToLiveDrops = options?.subscribeToLiveDrops ?? false;
  const [onlineUsersTarget, setOnlineUsersTarget] = useState<number>(0);
  const [displayOnline, setDisplayOnline] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(() => lastConnectionError);
  const [liveDrops, setLiveDrops] = useState<LiveDropData[]>(() =>
    subscribeToLiveDrops ? loadLiveDropsFromStorage() : []
  );
  const initialized = useRef(false);
  const onlineTargetRef = useRef(0);
  const isFirstOnlineValue = useRef(true);
  const dispatch = useAppDispatch();

  // Плавное изменение счётчика онлайна (без скачка при обновлении страницы)
  useEffect(() => {
    onlineTargetRef.current = onlineUsersTarget;
    if (isFirstOnlineValue.current && onlineUsersTarget > 0) {
      setDisplayOnline(onlineUsersTarget);
      isFirstOnlineValue.current = false;
    }
  }, [onlineUsersTarget]);

  useEffect(() => {
    const tid = setInterval(() => {
      const target = onlineTargetRef.current;
      setDisplayOnline((prev) => {
        if (prev < target) return Math.min(prev + 1, target);
        if (prev > target) return Math.max(prev - 1, target);
        return prev;
      });
    }, SMOOTH_ONLINE_INTERVAL_MS);
    return () => clearInterval(tid);
  }, []);

  useEffect(() => {
    // Предотвращаем повторную инициализацию в React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    // Создаем или получаем глобальное подключение
    const socket = createGlobalSocket();

    // Функции-слушатели для этого компонента
    const onlineUsersListener = (count: number) => setOnlineUsersTarget(count);
    const connectionListener = (connected: boolean) => setIsConnected(connected);
    const connectionErrorListener = (err: string | null) => setConnectionError(err);
    const liveDropListener = subscribeToLiveDrops
      ? (drop: LiveDropData) => {
          setLiveDrops(prevDrops => {
            const existingDrop = prevDrops.find(existing => existing.id === drop.id);
            if (existingDrop) return prevDrops;
            const dropTime = new Date(drop.dropTime).getTime();
            if (Date.now() - dropTime > 5 * 60 * 1000) return prevDrops;
            const newDrops = [drop, ...prevDrops.slice(0, MAX_LIVE_DROPS - 1)];
            saveLiveDropsToStorage(newDrops);
            return newDrops;
          });
        }
      : undefined;

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

    // Регистрируем слушатели (liveDrops только если нужен — меньше ре-рендеров App/Header)
    onlineUsersListeners.add(onlineUsersListener);
    connectionListeners.add(connectionListener);
    connectionErrorListeners.add(connectionErrorListener);
    if (liveDropListener) liveDropListeners.add(liveDropListener);
    notificationListeners.add(notificationListener);

    // Устанавливаем начальное состояние
    setIsConnected(socket.connected);

    // Очистка при размонтировании
    return () => {
      onlineUsersListeners.delete(onlineUsersListener);
      connectionListeners.delete(connectionListener);
      connectionErrorListeners.delete(connectionErrorListener);
      if (liveDropListener) liveDropListeners.delete(liveDropListener);
      notificationListeners.delete(notificationListener);

      // Если это последний компонент, закрываем соединение
      if (onlineUsersListeners.size === 0 && connectionListeners.size === 0 && liveDropListeners.size === 0 && notificationListeners.size === 0) {

        if (globalSocket) {
          globalSocket.disconnect();
          globalSocket = null;
        }
      }
    };
  }, [dispatch]);

  return {
    socket: globalSocket,
    onlineUsers: displayOnline,
    isConnected,
    connectionError,
    liveDrops,
  };
};
