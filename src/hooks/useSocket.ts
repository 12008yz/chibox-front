import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents, LiveDropData } from '../types/socket';

interface UseSocketReturn {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  onlineUsers: number;
  isConnected: boolean;
  liveDrops: LiveDropData[];
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveDrops, setLiveDrops] = useState<LiveDropData[]>([]);

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
        // Добавляем новое падение в начало массива и ограничиваем до 50 последних
        const newDrops = [data, ...prevDrops.slice(0, 49)];
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
