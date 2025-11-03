// Типы для событий Socket.IO

export interface LiveDropData {
  id: string;
  user: {
    id: string;
    username: string;
    level: number;
    avatar: string | null;
  };
  item: {
    id: string;
    name: string;
    image: string;
    price: number;
    rarity: string;
  };
  case: {
    id: string;
    name: string;
  } | null;
  dropTime: string;
  isRare: boolean;
  isHighlighted: boolean;
  price: number;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  category: 'general' | 'case_opening' | 'transaction' | 'achievement' | 'promotion' | 'subscription' | 'withdrawal' | 'bonus' | 'level_up';
  link?: string;
  importance: number;
  is_read: boolean;
  created_at: string;
}

export interface ServerToClientEvents {
   hello: (data: { message: string }) => void;
   onlineUsersUpdate: (data: { count: number }) => void;
   liveDrop: (data: LiveDropData) => void;
   notification: (data: NotificationData) => void;
 }

 export interface ClientToServerEvents {
   // Пока нет событий от клиента к серверу
   // Можно добавить в будущем, например:
   // joinRoom: (roomId: string) => void;
 }

 export interface SocketData {
   userId?: number;
   username?: string;
 }
