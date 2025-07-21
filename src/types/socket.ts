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

export interface ServerToClientEvents {
   hello: (data: { message: string }) => void;
   onlineUsersUpdate: (data: { count: number }) => void;
   liveDrop: (data: LiveDropData) => void;
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
