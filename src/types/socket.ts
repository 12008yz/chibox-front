// Типы для событий Socket.IO

export interface ServerToClientEvents {
   hello: (data: { message: string }) => void;
   onlineUsersUpdate: (data: { count: number }) => void;
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
 